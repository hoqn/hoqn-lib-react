import React, {
  forwardRef,
  PropsWithoutRef,
  RefCallback,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import { jsx } from "react/jsx-runtime";
import { PropsOfElementType } from "./types";
import { useAnimatePresenceChildContext } from "./components/animate-presence";
import { htmlTags } from "./html-tags";

function compositeRef<T>(...refs: React.ForwardedRef<any>[]): RefCallback<T> {
  return useCallback((instance: T) => {
    refs.forEach((ref) => {
      if (!ref) {
        return;
      }

      if (typeof ref === "function") {
        ref(instance);
      } else {
        ref.current = instance;
      }
    });
  }, []);
}

export type AnimateTarget = Record<string, any> & { options?: KeyframeAnimationOptions; onEnd?: () => void };

interface UseMotionedRefOptions<T> {
  onMount?: (instance: T) => void;
  beforeUnmount?: () => void;
  externalRef?: React.ForwardedRef<any>;
}

function useMotionedRef<T>(options: UseMotionedRefOptions<T>) {
  const { onMount, beforeUnmount, externalRef } = options;

  const internalRef = useRef<T | null>(null);

  const refCallback = useCallback<React.RefCallback<T>>((instance) => {
    if (instance) {
      onMount?.(instance);
    } else {
      beforeUnmount?.();
    }

    internalRef.current = instance;

    if (externalRef) {
      if (typeof externalRef === "function") {
        externalRef(instance);
      } else {
        externalRef.current = instance;
      }
    }
  }, []);

  return [refCallback, internalRef] as const;
}

interface MotionedComponentProps {
  initial?: AnimateTarget;
  animate?: AnimateTarget;
  exit?: AnimateTarget;
}

type PropsWithMotion<P> = P & MotionedComponentProps;

function createMotionedComponent<
  T extends React.ElementType<any>,
  E extends Element = Element,
  P = PropsOfElementType<T>
>(Component: T) {
  // Motioned Component
  function MotionedComponent(
    props: PropsWithoutRef<PropsWithMotion<P> & { key?: React.Key }>,
    externalRef?: React.ForwardedRef<E>
  ) {
    const { initial, animate, exit, ...restProps } = props;

    const onMount = useMemo(() => {
      if (!initial) return undefined;

      const { options = {}, onEnd, ...keyframes } = initial;

      return (instance: Element) => {
        const animation = instance.animate(keyframes, { ...options, fill: options.fill ?? "both" });
        animation.finished.then((value) => void value.commitStyles()).then(onEnd);
      };
    }, [initial]);

    const [ref, internalRef] = useMotionedRef<E>({
      externalRef,
      onMount,
    });

    useEffect(() => {
      if (!animate) return undefined;

      const { options = {}, onEnd, ...keyframes } = animate;

      const onAnimate = (instance: Element) => {
        const animation = instance.animate(keyframes, { ...options, fill: options.fill ?? "both" });
        animation.finished.then((value) => void value.commitStyles()).then(onEnd);
      };

      if (internalRef.current) {
        onAnimate(internalRef.current);
      }
    }, [animate]);

    const animatePresenceContext = useAnimatePresenceChildContext();

    useLayoutEffect(() => {
      if (animatePresenceContext && !animatePresenceContext.isCurrentChild && exit) {
        const { addPresenceElement, removePresenceElement } = animatePresenceContext;
        const { options = {}, onEnd, ...keyframes } = exit;

        addPresenceElement();

        const onExit = (instance: Element) => {
          const animation = instance.animate(keyframes, { ...options, fill: options.fill ?? "both" });
          animation.finished.then(animatePresenceContext.onEnd).then(onEnd);
        };

        if (internalRef.current) {
          onExit(internalRef.current);
        }

        return () => {
          removePresenceElement();
        };
      }
    }, [animatePresenceContext, exit]);

    return jsx(Component, { ...restProps, ref });
  }

  return forwardRef<E, PropsWithMotion<P>>(MotionedComponent);
}

type TypedMotionedComponent = {
  [key in keyof HTMLElementTagNameMap]: ReturnType<typeof createMotionedComponent<key, HTMLElementTagNameMap[key]>>;
} & {
  [key in keyof SVGElementTagNameMap]: ReturnType<typeof createMotionedComponent<key, SVGElementTagNameMap[key]>>;
};

export const motioned = Object.assign(
  createMotionedComponent,
  htmlTags.reduce((acc, tag) => ({ ...acc, [tag]: createMotionedComponent(tag) }), {}) as TypedMotionedComponent
);

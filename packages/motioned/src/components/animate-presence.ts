import {
  Children,
  cloneElement,
  createContext,
  Fragment,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { jsx } from "react/jsx-runtime";
import { AnimateTarget } from "../motioned-component";

interface AnimatePresenceChildContextValue {
  isCurrentChild: boolean;
  onEnd(): void;
  addPresenceElement(): void;
  removePresenceElement(): void;
}

const AnimatePresenceChildContext = createContext<AnimatePresenceChildContextValue | undefined>(undefined);

export function useAnimatePresenceChildContext() {
  const context = useContext(AnimatePresenceChildContext);

  return context;
}

function AnimatePresenceChild({
  children,
  isCurrentChild,
  onEnd,
}: {
  children?: React.ReactNode;
  isCurrentChild: boolean;
  onEnd?: () => void;
}) {
  const presenceChildren = useRef() as React.MutableRefObject<Map<string, AnimateTarget>>;
  if (!presenceChildren.current) {
    presenceChildren.current = new Map<string, AnimateTarget>();
  }

  const pendingExitCountRef = useRef(0);
  const [endedExitCount, setEndedExitCount] = useState(0);

  const onEndExitChild = useCallback(() => void setEndedExitCount((prev) => prev + 1), []);
  const addPresenceElement = useCallback(() => void (pendingExitCountRef.current += 1), []);
  const removePresenceElement = useCallback(() => void (pendingExitCountRef.current -= 1), []);

  useEffect(() => {
    if (endedExitCount === pendingExitCountRef.current) {
      onEnd?.();
    }
  }, [endedExitCount, onEnd]);

  const contextValue = useMemo<AnimatePresenceChildContextValue>(
    () => ({
      isCurrentChild,
      onEnd: onEndExitChild,
      addPresenceElement,
      removePresenceElement,
    }),
    [isCurrentChild]
  );

  return jsx(AnimatePresenceChildContext.Provider, { value: contextValue, children });
}

export function AnimatePresence({ children, mode = "sync" }: React.PropsWithChildren<{ mode?: "sync" | "wait" }>) {
  const currentChildren = useMemo(() => Children.toArray(children).filter(isValidElement), [children]);
  const currentKeys = new Set(currentChildren.map((it) => it.key));

  const pendingChilrdenRef = useRef<typeof currentChildren>();

  const [renderedChildren, setRenderedChildren] = useState(currentChildren);
  const [deltaChildren, setDeltaChildren] = useState(currentChildren);

  // 삭제되어야 할 자식 요소의 키를 키로, 애니메이션이 끝났는지를 값으로
  const hasChildrenExitCompleted = useRef() as React.MutableRefObject<Map<React.Key, boolean>>;
  if (!hasChildrenExitCompleted.current) {
    hasChildrenExitCompleted.current = new Map<React.Key, boolean>();
  }

  useLayoutEffect(() => {
    pendingChilrdenRef.current = currentChildren;

    renderedChildren.forEach((child) => {
      const key = child.key ?? "";

      if (currentKeys.has(key)) {
        hasChildrenExitCompleted.current.delete(key);
      } else {
        hasChildrenExitCompleted.current.set(key, false);
      }
    });
  }, [renderedChildren, JSON.stringify(currentKeys)]);

  if (currentChildren !== deltaChildren) {
    const nextChildren = [...currentChildren];
    const exitingChildren: typeof nextChildren = [];

    renderedChildren.forEach((child, i) => {
      const { key } = child;

      if (!currentKeys.has(key)) {
        nextChildren.splice(i, 0, child);
        exitingChildren.push(child)
      }
    });

    if (mode === 'wait' && exitingChildren.length > 0) {
      setRenderedChildren(exitingChildren);
    } else {
      setRenderedChildren(nextChildren);
    }
    setDeltaChildren(currentChildren);

    // return;
  }

  return jsx(Fragment, {
    children: renderedChildren.map((child) => {
      const key = child.key ?? "";
      const isCurrentChild = currentKeys.has(key);

      const onEnd = () => {
        if (hasChildrenExitCompleted.current.has(key)) {
          hasChildrenExitCompleted.current.set(key, true);
        } else {
          return;
        }

        if ([...hasChildrenExitCompleted.current.values()].every(Boolean)) {
          setRenderedChildren(pendingChilrdenRef.current!);
        }
      };

      return jsx(AnimatePresenceChild, { isCurrentChild, onEnd, children: child }, key);
    }),
  });
}

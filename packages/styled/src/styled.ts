import { forwardRef, useEffect, useMemo } from "react";
import { jsx } from "react/jsx-runtime";
import { CLASSNAME_PREFIX } from "./common";
import { commitStyles, detachStyle } from "./core";
import { hash } from "./hash";
import { AllElementTagName, htmlTags } from "./html-tags";

type PureInterpolation = string | number | undefined | null | boolean;
type Interpolation<P> = PureInterpolation | ((props: P) => PureInterpolation);

function resolveStyles<P>(strings: TemplateStringsArray, args: Interpolation<P>[], props?: P) {
  const styles = strings.reduce((ac, cu, i) => {
    const arg = args[i] ?? "";

    if (typeof arg === "function") {
      return ac + cu + arg(props);
    }

    return ac + cu + arg;
  }, "");

  const hashedStyles = hash(styles);

  return { styles, hashedStyles };
}

type PropsOf<T> = T extends React.ComponentType<infer P>
  ? P
  : T extends keyof HTMLElementTagNameMap
  ? React.HTMLAttributes<HTMLElementTagNameMap[T]>
  : T extends keyof SVGElementTagNameMap
  ? React.SVGAttributes<SVGElementTagNameMap[T]>
  : never;

function createStyledComponent<T extends React.ElementType<any>, P = PropsOf<T>>(Component: T) {
  return function generator<EP = {}>(strings: TemplateStringsArray, ...args: Interpolation<P & EP>[]) {
    // 만약 interpolation 중 함수가 없다면, 이때 해시가 확정된다.
    const isStatic = args.every((arg) => typeof arg !== "function");
    const staticStyles = isStatic ? resolveStyles(strings, args) : null;

    return forwardRef<T, P & EP & { className?: string; key?: React.Key }>(function StyledComponent(props, ref) {
      // TODO: Style에서 사용되는 props만 비교
      // TODO: DOM 트리에 추가되면 안 되는 속성 drop
      const { styles, hashedStyles } = useMemo(
        () => staticStyles || resolveStyles(strings, args, props as P & EP),
        [props]
      );

      const className = props.className
        ? props.className + " " + CLASSNAME_PREFIX + hashedStyles
        : CLASSNAME_PREFIX + hashedStyles;

      useEffect(() => {
        commitStyles(hashedStyles, styles);
        return () => detachStyle(hashedStyles);
      }, [hashedStyles]);

      return jsx(Component, { ...props, className, ref }, props.key);
    });
  };
}

type TypedStyledComponent = {
  [key in keyof HTMLElementTagNameMap]: ReturnType<typeof createStyledComponent<key>>;
} & {
  [key in keyof SVGElementTagNameMap]: ReturnType<typeof createStyledComponent<key>>;
};

export const styled = Object.assign(
  createStyledComponent,
  htmlTags.reduce((acc, tag) => ({ ...acc, [tag]: createStyledComponent(tag) }), {}) as TypedStyledComponent
);

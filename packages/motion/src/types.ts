export type PropsOfComponentType<T> = T extends React.ComponentType<infer P> ? P : never;
export type PropsOfElementType<T> = T extends React.ComponentType<infer P>
  ? P
  : T extends keyof HTMLElementTagNameMap
  ? React.HTMLAttributes<HTMLElementTagNameMap[T]>
  : T extends keyof SVGElementTagNameMap
  ? React.SVGAttributes<SVGElementTagNameMap[T]>
  : never;

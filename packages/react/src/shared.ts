interface IShared {
  commitedClassNames: Map<string, { used: number; index: number }>;
  commitedClassNamesIndices: string[];
  _styleElement: HTMLStyleElement | null;
}

export const Shared: IShared = {
  commitedClassNames: new Map(),
  commitedClassNamesIndices: [],
  _styleElement: null,
};

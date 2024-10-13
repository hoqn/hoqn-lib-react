export function escapeCSS(value: string) {
  return value.replace(/([\.\\\/:])/g, (_, p) => "\\" + p);
}

import { CLASSNAME_PREFIX } from "./common";
import { Shared } from "./shared";
import { escapeCSS } from "./utils";

export function requireStyleElement() {
  if (Shared._styleElement) {
    return Shared._styleElement;
  }

  Shared._styleElement = document.querySelector<HTMLStyleElement>("style[data-hoqn-styled-react]");

  if (!Shared._styleElement) {
    const $style = document.createElement("style");
    $style.setAttribute("data-hoqn-styled-react", "true");
    document.head.appendChild($style);

    Shared._styleElement = $style;
  }

  return Shared._styleElement;
}

function commitStyles(hashedStyles: string, resolvedStyles: string) {
  const { commitedClassNames, commitedClassNamesIndices } = Shared;

  const $style = requireStyleElement();

  if (commitedClassNames.has(hashedStyles)) {
    commitedClassNames.get(hashedStyles).used++;
    return;
  }

  const index = $style.sheet.insertRule(
    `.${CLASSNAME_PREFIX}${escapeCSS(hashedStyles)} { ${resolvedStyles} }`,
    $style.sheet.cssRules.length
  );
  commitedClassNames.set(hashedStyles, { used: 1, index });
  commitedClassNamesIndices.push(hashedStyles);
}

function detachStyle(className: string) {
  const { commitedClassNames } = Shared;

  const instance = commitedClassNames.get(className);

  if (!instance) {
    throw new Error("잘못된 호출입니다. 존재하지 않는 스타일을 제거하려고 시도하고 있습니다");
  }

  instance.used -= 1;

  if (instance.used === 0) {
    deleteStyle(className);
  }
}

function injectStyle(className: string) {}

function deleteStyle(className: string) {
  if (!Shared.commitedClassNames.has(className)) return;

  const { commitedClassNames, commitedClassNamesIndices } = Shared;

  const deletion = commitedClassNames.get(className);

  const $style = requireStyleElement();

  // index 변형을 최소화하기 위해 가장 뒤와 교체 후 삭제
  const sheet = $style.sheet;
  const lastIndex = sheet.cssRules.length - 1;

  if (deletion.index === lastIndex) {
    sheet.deleteRule(lastIndex);
    commitedClassNames.delete(className);
    commitedClassNamesIndices.pop();
    return;
  }

  const tempClassName = commitedClassNamesIndices[lastIndex];
  const tempText = sheet.cssRules[lastIndex].cssText;

  sheet.deleteRule(lastIndex);
  sheet.deleteRule(deletion.index);
  sheet.insertRule(tempText, deletion.index);

  commitedClassNames.delete(className);
  commitedClassNames.get(tempClassName).index = deletion.index;
  commitedClassNamesIndices[deletion.index] = commitedClassNamesIndices.pop();
}

export { commitStyles, detachStyle };

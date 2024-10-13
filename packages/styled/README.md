# @hoqn/styled-react

> [!IMPORTANT]
> 이 라이브러리는, 주로 학습을 목적으로 직접 구현해 본 라이브러리예요. 실제 프로젝트나 서비스에는 절대! 사용하지 마세요.  
> Styled-components 또는 Emotion을 사용하실 수 있어요.

React에서 사용할 수 있는 CSS-in-JS 라이브러리예요. styled-components의 사용법과 형태를 거의 그대로 따라요.

#### 특징

- 온전히 런타임에 동적으로 스타일시트를 생성해요.  
같은 내용은 같은 클래스 이름을 사용하고, 더 이상 그 스타일이 사용되지 않으면 스타일 시트에서 삭제해요.

- Styled Components와 유사한 인터페이스를 가지고 있어요.

```ts
const Main = styled.main`
  margin-left: auto;
  margin-right: auto;
  max-width: 800px;
`;

const StyledHello = styled(Hello)`
  background-color: ${({ color }) => color || "yellow"};
`;
```

- TypeScript를 지원해요. 모든 타입에 대해 기술되어 있고, 템플릿을 활용해 추가적인 프롭을 기술할 수 있어요.

```tsx
const Button = styled.button<{ isActive?: boolean }>`
  background-color: ${({ isActive }) => (isActive ? "blue" : "gray")};
  color: white;
  border: none;
`;

<Button isActive={color === "green"} onClick={() => setColor("green")}>GO GREEN</Button>
```

## 사용법

`styled(Component)` 또는 `styled(tagName)`의 형태로 컴포넌트 또는 태그를 감싸면, 스타일이 적용된 컴포넌트를 생성하는 [태그 템플릿 함수](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates)를 반환해요.

이 함수에 템플릿 리터럴 형태로 CSS 바디를 입력해주면, 해당하는 스타일이 적용돼요. 스타일은 모두 동적으로 적용될 수 있고, 임의의 클래스 이름으로 변환되어 적용돼요.

> [!NOTE]
> 클래스 이름으로 적용되기 때문에, 컴포넌트를 감싸는 경우 프롭으로 `className`을 전달받을 수 있도록 해야 원활히 작동할 수 있어요.

```tsx
// 태그 이름을 이용하는 경우
const StyledDiv = styled('div')`
  background-color: blue;
`;

// 컴포넌트를 감싸주는 경우
const StyledComponent(MyComponent)`
  background-color: tomato;
`;

function MyComponent({ className }: { className?: string }) {
  return <div className={className}>Hello World</div>
} 
```

일반적인 태그 이름들은 `styled`의 속성으로 미리 선언되어 있어요. 즉, 아래와 같이 사용해도 돼요.

```tsx
const StyledDiv = styled.div`
  background-color: red;
`;

// 위는 아래와 같습니다.
const StyledDiv = styled('div')`
  background-color: red'
`;
```

#### 해결되지 않은 문제

- `div`와 같은 HTML 엘리먼트에 대해, 추가적인 프롭이 별도로 필터링이 되지 않아 실제 DOM에도 해당 프롭이 그대로 노출돼요.

`react-dom_client.js?v=8355004c:519 Warning: React does not recognize...`로 시작되는 경고 표시에 콘솔에 표시될 수 있어요.

- `useEffect`만을 사용했기 때문에, 스타일 시트가 삽입되는 시점이 아직 불안정해요. 특히, 레이아웃 작업이 필요한 스타일 삽입 시 불필요한 브라우저 동작이 필요할 수 있어요. 이후 `useInsertionEffect`를 도입해 해결하고자 해요.

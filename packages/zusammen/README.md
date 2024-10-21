# @hoqn/zusammen

> [!IMPORTANT]
> 이 라이브러리는, 주로 학습을 목적으로 직접 구현해 본 라이브러리예요. 실제 프로젝트나 서비스에는 절대! 사용하지 마세요.  
> 대신 Zustand를 사용하실 수 있어요.

이 코드는, React를 흉내낸 라이브러리를 작성하고 이를 기반으로 간단한 앱을 만드는 과정에서, 전역 상태 관리가 필요해 만들게 된 코드예요. 앞선 라이브러리가 React와 거의 같은 인터페이스를 구현하고 있었기 때문에, 상태 관리 부분을 실제 React에서도 동작하도록 변경했어요.

#### 특징

- Zustand와 비슷하게 사용할 수 있어요.

```ts
const useStore = createStore((set, get) => ({
  // ...
}));

// 사용처
const counter = useStore((s) => s.counter);
```

- 기본적으로 React 18의 `useSyncExternalStore`를 사용해요.  
  다만, 내부적으로 주석 처리되어 있는 부분을 해제하고 빌드하면 React 18 이전에서도 사용할 수 있도록 구현되어 있어요.

```ts

function useStore(...) {
  // React 18 이전
  // ...

  // React 18 이후
  ...
}
```

- TypeScript를 완전히 지원해요. 상태와 Selector를 포함한 모든 곳에서 타이핑을 지원해요.

## 사용법

> [!NOTE]
> React에서 사용하려면, 모든 모듈은 `@hoqn/zusammen/react`에서 가져와야 해요.

```tsx
// store.ts
import { createStore } from "@hoqn/zusammen/react";

type TigerStore = TigerStoreActions & TigerStoreState;

const useTigerStore = createStore<TigerStore>((set, get) => ({
  counter: 0,
  incrementCounter: () => {
    const current = get().counter;
    set({ counter: current + 1 });
  },
}));

// Component.tsx
function MyComponent() {
  const { counter, incrementCounter } = useTigerStore();
  // const counter = useTigerStore(s => s.counter);
  // const incrementCounter = useTigerStore(s => s.incrementCounter);

  return (
    <div>
      <div>{counter}</div>
      <button onClick={() => void incrementCounter()}>increment</button>
    </div>
  );
}
```

#### 해결되지 않은 문제

- Redux Devtool을 지원하지 않아요.

- 얕은 비교를 지원하지 않아요. Selector 작성 시 단일 셀렉터 위주로 작성해야 불필요한 리렌더링을 최소화할 수 있어요.

- 아직 Raw 관점의 관리를 지원하지 않아요.

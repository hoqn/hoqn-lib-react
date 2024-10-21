import { useSyncExternalStore } from "react";
import { StoreContainer, StoreSeletor, createStore as createStoreCore } from "./core";

const defaultSelector: StoreSeletor<any> = (state) => state;

interface UseStore<S> {
  <T = S>(selector?: StoreSeletor<S, T>): T;
}

function useStore<S, T = unknown>(this: StoreContainer<S>, selector: StoreSeletor<S, T> = defaultSelector) {
  const container = this;

  // React 18 이전
  // const [state, setState] = useState(() => selector(container.currentState));
  // const stateRef = useRef<T>();

  // stateRef.current = state;

  // useEffect(() => {
  //   const updater = () => {
  //     const current = stateRef.current;
  //     const pending = selector(container.currentState);

  //     if (current === pending) {
  //       // 이렇게 하지 않으면 과도한 렌더링 발생
  //       // 또한, setter의 경우엔 setState로 업데이트해줄 필요가 없다.
  //       return;
  //     }

  //     setState(selector(container.currentState));
  //   };
  //   return container.subscribe(updater);
  // }, []);

  // return state;

  // React 18 이후
  const store = useSyncExternalStore<T>(
    container.subscribe.bind(container),
    () => selector(container.currentState),
    () => selector(container.initialState)
  );

  return store;
}

type CreateReactStore = <S>(...args: Parameters<typeof createStoreCore<S>>) => UseStore<S>;

export const createStore: CreateReactStore = function (initial) {
  const container = createStoreCore(initial);
  return useStore.bind(container);
};

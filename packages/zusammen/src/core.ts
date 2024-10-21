export type StoreSeletor<S, T = any> = (state: S) => T;

export type StoreSetter<S> = (stateUpdates: Partial<S> | ((prevState: S) => Partial<S>)) => void;
export type StoreGetter<S> = <T>(selector: StoreSeletor<S, T>) => T;

export type StoreContainer<S> = {
  initialState: S;
  currentState: S;

  subscribers: Set<() => void>;
  subscribe(listener: () => void): () => void;
};

function _setter<S>(this: StoreContainer<S>, stateUpdates: Partial<S> | ((prev: S) => Partial<S>)) {
  const updatedPartialState = typeof stateUpdates === "function" ? stateUpdates(this.currentState) : stateUpdates;
  this.currentState = { ...this.currentState, ...updatedPartialState };

  this.subscribers.forEach((subscriber) => subscriber());
}

function _getter<S>(this: StoreContainer<S>, selector: <T>(state: S) => T) {
  return selector(this.currentState);
}

export function createStore<S>(initial: (set: StoreSetter<S>, get: StoreGetter<S>) => S) {
  const subscribers: StoreContainer<S>["subscribers"] = new Set();

  const subscribe: StoreContainer<S>["subscribe"] = function (this: StoreContainer<S>, listener) {
    this.subscribers.add(listener);
    return () => void this.subscribers.delete(listener);
  };

  const container: StoreContainer<S> = {
    initialState: null,
    currentState: null,
    subscribers,
    subscribe,
  };

  container.initialState = initial(_setter.bind(container), _getter.bind(container) as any);
  container.currentState = { ...container.initialState };

  return container;
}

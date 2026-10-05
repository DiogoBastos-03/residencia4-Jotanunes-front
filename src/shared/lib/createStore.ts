import { useSyncExternalStore } from 'react';

export type Store<T> = {
  get: () => T;
  set: (updater: (state: T) => T) => void;
  subscribe: (listener: () => void) => () => void;
};

/** Estado em memória com assinatura — some no F5, de propósito. */
export function createStore<T>(initial: T): Store<T> {
  let state = initial;
  const listeners = new Set<() => void>();
  return {
    get: () => state,
    set: (updater) => {
      state = updater(state);
      listeners.forEach((listener) => listener());
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

export function useStore<T>(store: Store<T>): T {
  return useSyncExternalStore(store.subscribe, store.get, store.get);
}

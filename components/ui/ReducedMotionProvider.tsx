'use client';

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from 'react';

const STORAGE_KEY = 'ashriwad:reduced-motion';
const QUERY = '(prefers-reduced-motion: reduce)';

/**
 * The motion preference lives outside React, in two places React does not own:
 * the OS media query and localStorage. It is therefore modelled as an external
 * store and read with useSyncExternalStore — which also gives SSR a defined
 * snapshot (`false`) instead of a post-hydration state flip.
 */
let override: boolean | null = null;
let hydrated = false;
let mediaQuery: MediaQueryList | null = null;
const listeners = new Set<() => void>();

const emit = () => {
  listeners.forEach((listener) => listener());
};

const readOverride = (): boolean | null => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === 'true' ? true : stored === 'false' ? false : null;
  } catch {
    return null; // private mode / storage disabled — fall back to the OS setting
  }
};

const ensureHydrated = () => {
  if (hydrated) return;
  mediaQuery = window.matchMedia(QUERY);
  override = readOverride();
  hydrated = true;
};

const onStorage = (event: StorageEvent) => {
  if (event.key !== STORAGE_KEY) return;
  override = readOverride();
  emit();
};

const subscribe = (listener: () => void) => {
  ensureHydrated();
  listeners.add(listener);
  mediaQuery?.addEventListener('change', emit);
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    mediaQuery?.removeEventListener('change', emit);
    window.removeEventListener('storage', onStorage);
  };
};

const getSnapshot = (): boolean => {
  ensureHydrated();
  return override ?? Boolean(mediaQuery?.matches);
};

const getServerSnapshot = (): boolean => false;

const setOverride = (next: boolean) => {
  override = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, String(next));
  } catch {
    // non-fatal — the choice just won't survive a reload
  }
  emit();
};

type ReducedMotionValue = {
  /** True when the OS asks for reduced motion, or the visitor toggled it here. */
  reduced: boolean;
  toggle: () => void;
};

const ReducedMotionContext = createContext<ReducedMotionValue>({
  reduced: false,
  toggle: () => {},
});

/**
 * Publishes the resolved preference two ways: through context, for JS-driven
 * motion, and as `data-reduced-motion` on a `display:contents` wrapper, which
 * is what the CSS kill-switches in globals.css key off.
 */
export function ReducedMotionProvider({ children }: { children: React.ReactNode }) {
  const reduced = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback(() => {
    setOverride(!getSnapshot());
  }, []);

  const value = useMemo(() => ({ reduced, toggle }), [reduced, toggle]);

  return (
    <ReducedMotionContext.Provider value={value}>
      <div style={{ display: 'contents' }} data-reduced-motion={String(reduced)}>
        {children}
      </div>
    </ReducedMotionContext.Provider>
  );
}

export function useReducedMotionPreference(): ReducedMotionValue {
  return useContext(ReducedMotionContext);
}

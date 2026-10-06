"use client";

import * as React from "react";

/**
 * SSR-safe media query hook using useSyncExternalStore (React 18/19 compliant).
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = React.useCallback(
    (callback: () => void) => {
      if (typeof window === "undefined") {
        return () => {};
      }
      const matchMedia = window.matchMedia(query);
      matchMedia.addEventListener("change", callback);
      return () => matchMedia.removeEventListener("change", callback);
    },
    [query]
  );

  const getSnapshot = () => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  };

  const getServerSnapshot = () => false;

  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

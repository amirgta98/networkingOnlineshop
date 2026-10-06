"use client";

import * as React from "react";

export interface MobileAppBarConfig {
  /** Optional custom leading button/content (e.g. Home button, Back button) */
  leadingAction?: React.ReactNode;
  /** Separate dedicated price display element */
  priceElement?: React.ReactNode;
  /** Primary action taking majority width (e.g. AddToCartCounter, Checkout button) */
  primaryAction?: React.ReactNode;
  /** Optional trailing actions */
  trailingAction?: React.ReactNode;
  /** Custom children completely overriding the bar content */
  customContent?: React.ReactNode;
  /** Whether this is a custom page-specific bar or the default site-wide navigation */
  isCustom?: boolean;
}

interface MobileAppBarContextValue {
  config: MobileAppBarConfig | null;
  setMobileAppBar: (config: MobileAppBarConfig) => void;
  resetMobileAppBar: () => void;
}

const MobileAppBarContext = React.createContext<MobileAppBarContextValue | null>(null);

export function MobileAppBarProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = React.useState<MobileAppBarConfig | null>(null);

  const setMobileAppBar = React.useCallback((newConfig: MobileAppBarConfig) => {
    setConfig({ ...newConfig, isCustom: true });
  }, []);

  const resetMobileAppBar = React.useCallback(() => {
    setConfig(null);
  }, []);

  return (
    <MobileAppBarContext.Provider
      value={{
        config,
        setMobileAppBar,
        resetMobileAppBar,
      }}
    >
      {children}
    </MobileAppBarContext.Provider>
  );
}

/**
 * Hook to customize the Mobile App Bar for a specific page.
 * Automatically restores the default site navigation bar when the component unmounts.
 */
export function useMobileAppBar(customConfig?: MobileAppBarConfig) {
  const context = React.useContext(MobileAppBarContext);

  if (!context) {
    throw new Error("useMobileAppBar must be used within a MobileAppBarProvider");
  }

  const { setMobileAppBar, resetMobileAppBar } = context;

  React.useEffect(() => {
    if (customConfig) {
      setMobileAppBar(customConfig);
    }
    return () => {
      resetMobileAppBar();
    };
  }, [customConfig, setMobileAppBar, resetMobileAppBar]);

  return context;
}

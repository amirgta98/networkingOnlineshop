"use client";

import * as React from "react";

export interface NavigationDrawerContextType {
  isOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
}

const NavigationDrawerContext = React.createContext<
  NavigationDrawerContextType | undefined
>(undefined);

export function NavigationDrawerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);

  const openDrawer = React.useCallback(() => setIsOpen(true), []);
  const closeDrawer = React.useCallback(() => setIsOpen(false), []);
  const toggleDrawer = React.useCallback(() => setIsOpen((prev) => !prev), []);

  return (
    <NavigationDrawerContext.Provider
      value={{
        isOpen,
        openDrawer,
        closeDrawer,
        toggleDrawer,
      }}
    >
      {children}
    </NavigationDrawerContext.Provider>
  );
}

export function useNavigationDrawer() {
  const context = React.useContext(NavigationDrawerContext);
  if (!context) {
    throw new Error(
      "useNavigationDrawer must be used within a NavigationDrawerProvider"
    );
  }
  return context;
}

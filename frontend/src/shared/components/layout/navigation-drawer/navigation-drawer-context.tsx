"use client";

import * as React from "react";
import type { DrawerBadgeInfo } from "@/shared/config/navigation";

export interface NavigationDrawerContextType {
  isOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  dynamicBadges: Record<string, DrawerBadgeInfo>;
  setDynamicBadges: React.Dispatch<
    React.SetStateAction<Record<string, DrawerBadgeInfo>>
  >;
  updateBadge: (id: string, badge?: string, badgeColor?: string) => void;
  clearBadges: () => void;
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
  const [dynamicBadges, setDynamicBadges] = React.useState<
    Record<string, DrawerBadgeInfo>
  >({});

  const openDrawer = React.useCallback(() => setIsOpen(true), []);
  const closeDrawer = React.useCallback(() => setIsOpen(false), []);
  const toggleDrawer = React.useCallback(() => setIsOpen((prev) => !prev), []);

  const updateBadge = React.useCallback(
    (id: string, badge?: string, badgeColor?: string) => {
      setDynamicBadges((prev) => ({
        ...prev,
        [id]: { badge, badgeColor },
      }));
    },
    []
  );

  const clearBadges = React.useCallback(() => {
    setDynamicBadges({});
  }, []);

  return (
    <NavigationDrawerContext.Provider
      value={{
        isOpen,
        openDrawer,
        closeDrawer,
        toggleDrawer,
        dynamicBadges,
        setDynamicBadges,
        updateBadge,
        clearBadges,
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

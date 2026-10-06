"use client";

import * as React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { getQueryClient } from "@/shared/lib/query-client";
import { CartProvider } from "@/features/cart";
import { ThemeProvider } from "@/features/theme-customizer";
import { AuthProvider } from "@/features/auth";
import { NavigationDrawerProvider } from "@/shared/components/layout/navigation-drawer";

export interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  // NOTE: Avoid useState when initializing the query client if you don't
  //       have a suspense boundary between this and the code that may
  //       suspend because React will throw away the client on the initial
  //       render if it suspends and there is no boundary
  const queryClient = getQueryClient();

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CartProvider>
            <NavigationDrawerProvider>{children}</NavigationDrawerProvider>
          </CartProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

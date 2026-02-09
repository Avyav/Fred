"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary, OfflineBanner } from "@/components/error-boundary";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ErrorBoundary>
        <OfflineBanner />
        {children}
        <Toaster />
      </ErrorBoundary>
    </SessionProvider>
  );
}

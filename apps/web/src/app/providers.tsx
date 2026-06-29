"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import { InstallAppDialog } from "@/features/pwa/components/install-app-dialog";
import { PwaUpdatePrompt } from "@/features/pwa/components/pwa-update-prompt";
import { PwaInstallProvider } from "@/features/pwa/pwa-install-provider";
import { NavigationProgress } from "@/components/layout/navigation-progress";
import { SnackbarHost } from "@/components/ui/snackbar";

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60_000, retry: 1 },
        },
      })
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <QueryClientProvider client={client}>
        <PwaInstallProvider>
          <NavigationProgress />
          {children}
          <InstallAppDialog />
          <PwaUpdatePrompt />
          <SnackbarHost />
        </PwaInstallProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

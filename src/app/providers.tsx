"use client";

import { Spinner } from "@/components";
import { ThemeProvider } from "@/components/theme-provider";
import { useLoading } from "@/stores/loading";
import { setDefaultOptions } from "date-fns";
import { ptBR } from "date-fns/locale";
import { SWRConfig } from "swr";
import { Toaster as Sonner, Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";

setDefaultOptions({
  locale: ptBR,
});

export function Providers({ children }: { children: React.ReactNode }) {
  const loading = useLoading((state) => state.loading);
  return (
    <>
      {loading ? <Spinner.Base /> : null}

      <SWRConfig value={{ revalidateOnFocus: false, suspense: false }}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider>
            <TooltipProvider>{children}</TooltipProvider>
            <Toaster />
            <Sonner />
          </SidebarProvider>
        </ThemeProvider>
      </SWRConfig>
    </>
  );
}

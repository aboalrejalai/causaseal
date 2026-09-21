"use client"

import { DirectionProvider } from "@/components/ui/direction"
import { Toaster } from "@/components/ui/sonner"
import { LanguageProvider, useLanguage } from "@/components/causaseal/language-provider"
import { ThemeProvider } from "@/components/causaseal/theme-provider"

function DirectedShell({ children }: { children: React.ReactNode }) {
  const { direction } = useLanguage()
  return (
    <DirectionProvider dir={direction}>
      {children}
      <Toaster richColors closeButton position="top-center" dir={direction} />
    </DirectionProvider>
  )
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <LanguageProvider>
        <DirectedShell>{children}</DirectedShell>
      </LanguageProvider>
    </ThemeProvider>
  )
}

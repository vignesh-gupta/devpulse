"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { ErrorProvider } from "./providers/error-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorProvider>
      <NextThemesProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
        enableColorScheme
      >
        {children}
      </NextThemesProvider>
    </ErrorProvider>
  )
}

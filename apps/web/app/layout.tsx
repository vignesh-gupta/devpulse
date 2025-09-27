import { Geist, Geist_Mono } from "next/font/google"
import type { Metadata } from "next"

import "@devpulse/ui/globals.css"
import { Providers } from "@/components/providers"

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: {
    default: "DevPulse - AI-Powered Developer Summaries",
    template: "%s | DevPulse"
  },
  description: "Transform your GitHub activity into professional daily standup summaries with AI. Never miss a beat in your development workflow.",
  keywords: ["developer", "standup", "github", "AI", "summary", "daily", "workflow"],
  authors: [{ name: "DevPulse Team" }],
  creator: "DevPulse",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://devpulse.ai",
    title: "DevPulse - AI-Powered Developer Summaries",
    description: "Transform your GitHub activity into professional daily standup summaries with AI.",
    siteName: "DevPulse",
  },
  twitter: {
    card: "summary_large_image",
    title: "DevPulse - AI-Powered Developer Summaries",
    description: "Transform your GitHub activity into professional daily standup summaries with AI.",
    creator: "@devpulse",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased min-h-screen bg-background`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

import type { Metadata } from "next"
import { IBM_Plex_Sans_Arabic } from "next/font/google"

import { AppProviders } from "@/components/causaseal/app-providers"

import "./globals.css"

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans-soft",
  display: "swap",
})

export const metadata: Metadata = {
  title: "CAUSASEAL | مركز العمليات السببية",
  description: "منصة المناعة السببية التنبؤية لحماية وكلاء الذكاء الاصطناعي",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      className={ibmPlexSansArabic.variable}
    >
      <body className="min-h-svh font-sans antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}

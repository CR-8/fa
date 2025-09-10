import type React from "react"
import type { Metadata, Viewport } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { BottomNav } from "@/components/bottom-nav"
import { Header } from "@/components/header"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "Fashion AI - Try On & Shop",
  description: "AI-powered fashion app with virtual try-on technology",
  generator: "v0.app",
  manifest: "/manifest.json",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#ea580c",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Header />
        <main className="pb-20 pt-0">
          {" "}
          {/* Removed top padding since header is now sticky */}
          <Suspense fallback={null}>{children}</Suspense>
        </main>
        <BottomNav />
        <Analytics />
      </body>
    </html>
  )
}

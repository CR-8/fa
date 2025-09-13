import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Poppins } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { BottomNav } from "@/components/bottom-nav"
import { Header } from "@/components/header"
import { ThemeProvider } from "@/components/theme-provider"
import { Suspense } from "react"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
})

export const metadata: Metadata = {
  title: "FashionAI - Your AI Fashion Stylist",
  description: "Discover your perfect style with AI-powered fashion recommendations and virtual try-on technology",
  generator: "v0.app",
  manifest: "/manifest.json",
  keywords: ["fashion", "AI", "stylist", "virtual try-on", "shopping"],
  authors: [{ name: "FashionAI Team" }],
  openGraph: {
    title: "FashionAI - Your AI Fashion Stylist",
    description: "Discover your perfect style with AI-powered fashion recommendations",
    type: "website",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ff6b6b" },
    { media: "(prefers-color-scheme: dark)", color: "#ff6b6b" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${poppins.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
            <Header />
            <main className="pb-20 pt-0">
              <Suspense fallback={
                <div className="flex items-center justify-center min-h-[60vh]">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              }>
                {children}
              </Suspense>
            </main>
            <BottomNav />
          </div>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}

import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Poppins } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { BottomNav } from "@/components/bottom-nav"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
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
  title: "FashionAI - Premium Fashion with AI Styling | Virtual Try-On",
  description: "Discover premium fashion with AI-powered styling recommendations and virtual try-on technology. Shop curated collections from top brands with personalized fashion advice.",
  generator: "v0.app",
  manifest: "/manifest.json",
  keywords: ["premium fashion", "AI stylist", "virtual try-on", "fashion e-commerce", "personalized shopping", "fashion recommendations"],
  authors: [{ name: "FashionAI Team" }],
  creator: "FashionAI",
  publisher: "FashionAI",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://fashionai.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "FashionAI - Premium Fashion with AI Styling",
    description: "Discover premium fashion with AI-powered styling recommendations and virtual try-on technology",
    url: "https://fashionai.com",
    siteName: "FashionAI",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "FashionAI - Premium Fashion E-commerce",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FashionAI - Premium Fashion with AI Styling",
    description: "Discover premium fashion with AI-powered styling recommendations and virtual try-on technology",
    images: ["/og-image.jpg"],
    creator: "@fashionai",
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
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
            <Footer />
          </div>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}

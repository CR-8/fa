"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sparkles, Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from "lucide-react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-neutral-900 dark:bg-neutral-950 text-neutral-100 dark:text-neutral-100 border-t-2 border-neutral-800 dark:border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-neutral-100 dark:bg-neutral-100 border-2 border-neutral-100">
                <Sparkles className="h-5 w-5 text-neutral-900" />
              </div>
              <span className="text-xl font-bold uppercase tracking-tight">FashionAI</span>
            </div>
            <p className="text-neutral-400 dark:text-neutral-400 text-sm leading-relaxed font-medium">
              Discover your perfect style with AI-powered fashion recommendations and virtual try-on technology. Premium fashion made personal.
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-sm border-2 border-neutral-700 dark:border-neutral-700 hover:bg-neutral-800 dark:hover:bg-neutral-800 hover:border-neutral-100 dark:hover:border-neutral-100 text-neutral-100">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-sm border-2 border-neutral-700 dark:border-neutral-700 hover:bg-neutral-800 dark:hover:bg-neutral-800 hover:border-neutral-100 dark:hover:border-neutral-100 text-neutral-100">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-sm border-2 border-neutral-700 dark:border-neutral-700 hover:bg-neutral-800 dark:hover:bg-neutral-800 hover:border-neutral-100 dark:hover:border-neutral-100 text-neutral-100">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-sm border-2 border-neutral-700 dark:border-neutral-700 hover:bg-neutral-800 dark:hover:bg-neutral-800 hover:border-neutral-100 dark:hover:border-neutral-100 text-neutral-100">
                <Youtube className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-neutral-100 uppercase tracking-tight">Shop</h3>
            <div className="space-y-2">
              <Link href="/shop" className="block text-neutral-400 dark:text-neutral-400 hover:text-neutral-100 transition-colors text-sm font-medium uppercase">
                All Products
              </Link>
              <Link href="/shop" className="block text-neutral-400 dark:text-neutral-400 hover:text-neutral-100 transition-colors text-sm font-medium uppercase">
                Tops
              </Link>
              <Link href="/shop" className="block text-neutral-400 dark:text-neutral-400 hover:text-neutral-100 transition-colors text-sm font-medium uppercase">
                Bottoms
              </Link>
              <Link href="/shop" className="block text-neutral-400 dark:text-neutral-400 hover:text-neutral-100 transition-colors text-sm font-medium uppercase">
                Outerwear
              </Link>
              <Link href="/shop" className="block text-neutral-400 dark:text-neutral-400 hover:text-neutral-100 transition-colors text-sm font-medium uppercase">
                Shoes
              </Link>
            </div>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-neutral-100 uppercase tracking-tight">Support</h3>
            <div className="space-y-2">
              <Link href="/ai-fa" className="block text-neutral-400 dark:text-neutral-400 hover:text-neutral-100 transition-colors text-sm font-medium uppercase">
                AI Stylist
              </Link>
              <Link href="/style-quiz" className="block text-neutral-400 dark:text-neutral-400 hover:text-neutral-100 transition-colors text-sm font-medium uppercase">
                Style Quiz
              </Link>
              <Link href="/wardrobe" className="block text-neutral-400 dark:text-neutral-400 hover:text-neutral-100 transition-colors text-sm font-medium uppercase">
                My Wardrobe
              </Link>
              <Link href="/pricing" className="block text-neutral-400 dark:text-neutral-400 hover:text-neutral-100 transition-colors text-sm font-medium uppercase">
                Pricing
              </Link>
              <Link href="/cart" className="block text-neutral-400 dark:text-neutral-400 hover:text-neutral-100 transition-colors text-sm font-medium uppercase">
                Cart
              </Link>
            </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-neutral-100 uppercase tracking-tight">Stay Updated</h3>
            <p className="text-neutral-400 dark:text-neutral-400 text-sm font-medium">
              Get the latest fashion trends and exclusive offers delivered to your inbox.
            </p>
            <div className="space-y-2">
              <Input
                placeholder="ENTER YOUR EMAIL"
                className="bg-neutral-800 dark:bg-neutral-800 border-2 border-neutral-700 dark:border-neutral-700 text-neutral-100 placeholder:text-neutral-500 focus:border-neutral-100 rounded-sm h-11 uppercase font-medium"
              />
              <Button className="w-full bg-neutral-100 dark:bg-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-200 text-neutral-900 h-11 rounded-sm border-2 border-neutral-100 font-bold uppercase tracking-wide">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        <div className="h-px bg-neutral-800 dark:bg-neutral-800 mb-8" />

        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="flex items-center gap-3 text-neutral-400 dark:text-neutral-400">
            <div className="p-2 rounded-sm bg-neutral-800 dark:bg-neutral-800 border-2 border-neutral-700">
              <Phone className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium">+91 1800-FASHION</span>
          </div>
          <div className="flex items-center gap-3 text-neutral-400 dark:text-neutral-400">
            <div className="p-2 rounded-sm bg-neutral-800 dark:bg-neutral-800 border-2 border-neutral-700">
              <Mail className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium">support@fashionai.com</span>
          </div>
          <div className="flex items-center gap-3 text-neutral-400 dark:text-neutral-400">
            <div className="p-2 rounded-sm bg-neutral-800 dark:bg-neutral-800 border-2 border-neutral-700">
              <MapPin className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium">Mumbai, India</span>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center gap-6 mb-8">
          <div className="flex items-center gap-2 text-neutral-400 dark:text-neutral-400 text-sm">
            <div className="w-7 h-7 bg-neutral-100 dark:bg-neutral-100 rounded-sm flex items-center justify-center text-sm font-bold text-neutral-900 border-2 border-neutral-100">✓</div>
            <span className="font-medium uppercase">Secure SSL</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-400 dark:text-neutral-400 text-sm">
            <div className="w-7 h-7 bg-neutral-100 dark:bg-neutral-100 rounded-sm flex items-center justify-center text-sm font-bold text-neutral-900 border-2 border-neutral-100">✓</div>
            <span className="font-medium uppercase">Free Shipping ₹999+</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-400 dark:text-neutral-400 text-sm">
            <div className="w-7 h-7 bg-neutral-100 dark:bg-neutral-100 rounded-sm flex items-center justify-center text-sm font-bold text-neutral-900 border-2 border-neutral-100">✓</div>
            <span className="font-medium uppercase">30-Day Returns</span>
          </div>
        </div>

        <div className="h-px bg-neutral-800 dark:bg-neutral-800 mb-6" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-neutral-400 dark:text-neutral-400 text-sm font-medium uppercase">
            © 2025 FashionAI. All rights reserved.
          </div>
          <div className="flex gap-6 text-sm">
            <Link href="/" className="text-neutral-400 dark:text-neutral-400 hover:text-neutral-100 transition-colors font-medium uppercase">
              Privacy Policy
            </Link>
            <Link href="/" className="text-neutral-400 dark:text-neutral-400 hover:text-neutral-100 transition-colors font-medium uppercase">
              Terms of Service
            </Link>
            <Link href="/" className="text-neutral-400 dark:text-neutral-400 hover:text-neutral-100 transition-colors font-medium uppercase">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
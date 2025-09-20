"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Sparkles, Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from "lucide-react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">FashionAI</span>
            </div>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Discover your perfect style with AI-powered fashion recommendations and virtual try-on technology. Premium fashion made personal.
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-primary/20">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-primary/20">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-primary/20">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-primary/20">
                <Youtube className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Shop</h3>
            <div className="space-y-2">
              <Link href="/shop" className="block text-neutral-400 hover:text-white transition-colors text-sm">
                All Products
              </Link>
              <Link href="/shop?tops" className="block text-neutral-400 hover:text-white transition-colors text-sm">
                Tops
              </Link>
              <Link href="/shop?bottoms" className="block text-neutral-400 hover:text-white transition-colors text-sm">
                Bottoms
              </Link>
              <Link href="/shop?outerwear" className="block text-neutral-400 hover:text-white transition-colors text-sm">
                Outerwear
              </Link>
              <Link href="/shop?shoes" className="block text-neutral-400 hover:text-white transition-colors text-sm">
                Shoes
              </Link>
            </div>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Customer Service</h3>
            <div className="space-y-2">
              <Link href="/contact" className="block text-neutral-400 hover:text-white transition-colors text-sm">
                Contact Us
              </Link>
              <Link href="/shipping" className="block text-neutral-400 hover:text-white transition-colors text-sm">
                Shipping Info
              </Link>
              <Link href="/returns" className="block text-neutral-400 hover:text-white transition-colors text-sm">
                Returns & Exchanges
              </Link>
              <Link href="/size-guide" className="block text-neutral-400 hover:text-white transition-colors text-sm">
                Size Guide
              </Link>
              <Link href="/faq" className="block text-neutral-400 hover:text-white transition-colors text-sm">
                FAQ
              </Link>
            </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Stay Updated</h3>
            <p className="text-neutral-400 text-sm">
              Get the latest fashion trends and exclusive offers delivered to your inbox.
            </p>
            <div className="space-y-2">
              <Input
                placeholder="Enter your email"
                className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-400 focus:border-primary"
              />
              <Button className="w-full bg-primary hover:bg-primary/90">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        <Separator className="bg-neutral-800 mb-8" />

        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="flex items-center gap-3 text-neutral-400">
            <Phone className="h-4 w-4" />
            <span className="text-sm">+91 1800-FASHION</span>
          </div>
          <div className="flex items-center gap-3 text-neutral-400">
            <Mail className="h-4 w-4" />
            <span className="text-sm">support@fashionai.com</span>
          </div>
          <div className="flex items-center gap-3 text-neutral-400">
            <MapPin className="h-4 w-4" />
            <span className="text-sm">Mumbai, India</span>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center gap-6 mb-8">
          <div className="flex items-center gap-2 text-neutral-400 text-sm">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold text-white">✓</div>
            Secure SSL Encryption
          </div>
          <div className="flex items-center gap-2 text-neutral-400 text-sm">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold text-white">✓</div>
            Free Shipping ₹999+
          </div>
          <div className="flex items-center gap-2 text-neutral-400 text-sm">
            <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-xs font-bold text-white">✓</div>
            30-Day Returns
          </div>
        </div>

        <Separator className="bg-neutral-800 mb-6" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-neutral-400 text-sm">
            © 2025 FashionAI. All rights reserved.
          </div>
          <div className="flex gap-6 text-sm">
            <Link href="/privacy" className="text-neutral-400 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-neutral-400 hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/cookies" className="text-neutral-400 hover:text-white transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
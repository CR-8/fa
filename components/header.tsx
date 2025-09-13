"use client"

import { Search, User, Menu, Sparkles, ShoppingBag, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"
import { useState } from "react"

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 w-full bg-white dark:bg-neutral-900 border-b border-border">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Logo/Brand */}
        <Link href="/" className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-accent rounded-full"></div>
          </div>
          <div className="hidden sm:block">
            <span className="text-xl font-bold text-neutral-900 dark:text-neutral-50">
              FashionAI
            </span>
            <p className="text-xs text-muted-foreground -mt-1">Your AI Stylist</p>
          </div>
        </Link>

        {/* Search Bar - Desktop */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full group">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search fashion, styles, trends..."
              className="pl-10 h-11 bg-muted/50 border-border/50 rounded-full"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Search Button - Mobile */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden h-9 w-9 p-0"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
            <Search className="h-4 w-4" />
          </Button>

          {/* Wishlist */}
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 relative"
            asChild
          >
            <Link href="/wishlist">
              <Heart className="h-4 w-4" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-accent text-accent-foreground">
                3
              </Badge>
            </Link>
          </Button>

          {/* Cart */}
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 relative"
            asChild
          >
            <Link href="/cart">
              <ShoppingBag className="h-4 w-4" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-primary text-primary-foreground">
                2
              </Badge>
            </Link>
          </Button>

          {/* Profile Button */}
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0"
            asChild
          >
            <Link href="/profile">
              <User className="h-4 w-4" />
            </Link>
          </Button>

          {/* AI Assistant Button - Prominent */}
          <Button
            size="sm"
            className="hidden sm:flex bg-primary text-white"
            asChild
          >
            <Link href="/ai-fa" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="font-medium">AI Stylist</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {isSearchOpen && (
        <div className="border-t border-border p-4 md:hidden bg-white dark:bg-neutral-900">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search fashion, styles, trends..."
              className="pl-10 h-11 bg-muted/50 border-border/50 rounded-full"
            />
          </div>
        </div>
      )}
    </header>
  )
}

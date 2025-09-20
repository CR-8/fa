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
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-b border-border/50">
      <div className="flex h-14 items-center justify-between px-4 max-w-7xl mx-auto">
        {/* Logo/Brand */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold hidden sm:block">FashionAI</span>
        </Link>

        {/* Search Bar - Desktop */}
        <div className="hidden md:flex flex-1 max-w-md mx-6">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-10 h-9 bg-muted/50 border-border/50 rounded-full"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1">
          {/* Search Button - Mobile */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden h-8 w-8 p-0"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
            <Search className="h-4 w-4" />
          </Button>

          {/* AI Assistant */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            asChild
          >
            <Link href="/ai-fa">
              <Sparkles className="h-4 w-4" />
            </Link>
          </Button>

          {/* Wishlist */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 relative"
            asChild
          >
            <Link href="/wishlist">
              <Heart className="h-4 w-4" />
              <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-xs">
                3
              </Badge>
            </Link>
          </Button>

          {/* Cart */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 relative"
            asChild
          >
            <Link href="/cart">
              <ShoppingBag className="h-4 w-4" />
              <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-xs">
                2
              </Badge>
            </Link>
          </Button>

          {/* Profile */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            asChild
          >
            <Link href="/profile">
              <User className="h-4 w-4" />
            </Link>
          </Button>

          {/* Theme Toggle */}
          <ThemeToggle />
        </div>
      </div>

      {/* Mobile Search Bar */}
      {isSearchOpen && (
        <div className="border-t border-border/50 p-3 md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-10 h-9 bg-muted/50 border-border/50 rounded-full"
            />
          </div>
        </div>
      )}
    </header>
  )
}

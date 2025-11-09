"use client"

import { Search, User, Sparkles, ShoppingBag, Heart, Home, Shirt, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { AuthButton } from "@/components/auth-button"
import Link from "next/link"
import { useState } from "react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useCart } from "@/lib/store/cart-context"
import { useWishlist } from "@/lib/store/wishlist-context"
import { useSearch } from "@/lib/store/search-context"

const mainNavItems = [
  { href: "/", label: "HOME", icon: Home },
  { href: "/shop", label: "SHOP", icon: ShoppingBag },
  { href: "/wardrobe", label: "WARDROBE", icon: Shirt },
]

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchInput, setSearchInput] = useState("")
  const pathname = usePathname()
  
  const { itemCount: cartItemCount } = useCart()
  const { itemCount: wishlistItemCount } = useWishlist()
  const { performSearch } = useSearch()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchInput.trim()) {
      performSearch(searchInput)
      setIsSearchOpen(false)
      setSearchInput("")
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-white dark:bg-neutral-900 p-2 dark:border-neutral-100">
      {/* Main Header Bar */}
      <div>
        <div className="flex h-16 items-center justify-between px-4 lg:px-6 max-w-[1600px] mx-auto gap-4">
          {/* Logo/Brand */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-neutral-900 dark:bg-neutral-100 border-2 border-neutral-900 dark:border-neutral-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] group-hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:group-hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all">
              <Sparkles className="h-5 w-5 text-white dark:text-neutral-900" />
            </div>
            <span className="text-xl font-bold UPPERCASE tracking-wide text-neutral-900 dark:text-neutral-100 hidden sm:block">FASHION<span className="font-normal">AI</span></span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-2 flex-1 justify-center">
            {mainNavItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-4 h-10 rounded-sm border-2 font-bold text-xs UPPERCASE tracking-wide transition-all",
                    isActive
                      ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 border-neutral-900 dark:border-neutral-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
                      : "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 border-neutral-300 dark:border-neutral-700 hover:border-neutral-900 dark:hover:border-neutral-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500 dark:text-neutral-400" />
              <Input
                placeholder="SEARCH PRODUCTS..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10 h-10 bg-white dark:bg-neutral-900 border-2 border-neutral-300 dark:border-neutral-700 rounded-sm focus:border-neutral-900 dark:focus:border-neutral-100 font-semibold placeholder:UPPERCASE placeholder:text-xs placeholder:tracking-wide"
              />
            </form>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden h-10 w-10 p-0 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 border-2 border-transparent hover:border-neutral-900 dark:hover:border-neutral-100 rounded-sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            {/* Search Button - Mobile/Tablet */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden h-10 w-10 p-0 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 border-2 border-transparent hover:border-neutral-900 dark:hover:border-neutral-100 rounded-sm"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Wishlist */}
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0 relative text-neutral-900 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 border-2 border-transparent hover:border-neutral-900 dark:hover:border-neutral-100 rounded-sm"
              asChild
            >
              <Link href="/wishlist">
                <Heart className="h-5 w-5" />
                {wishlistItemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] font-bold bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 border-2 border-neutral-900 dark:border-neutral-100 rounded-sm">
                    {wishlistItemCount}
                  </Badge>
                )}
              </Link>
            </Button>

            {/* Cart */}
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0 relative text-neutral-900 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 border-2 border-transparent hover:border-neutral-900 dark:hover:border-neutral-100 rounded-sm"
              asChild
            >
              <Link href="/cart">
                <ShoppingBag className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] font-bold bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 border-2 border-neutral-900 dark:border-neutral-100 rounded-sm">
                    {cartItemCount}
                  </Badge>
                )}
              </Link>
            </Button>

            {/* Profile */}
            <AuthButton />

            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {isSearchOpen && (
        <div className="border-b-2 border-neutral-200 dark:border-neutral-800 p-4 md:hidden bg-neutral-50 dark:bg-neutral-950">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500 dark:text-neutral-400" />
            <Input
              placeholder="SEARCH PRODUCTS..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10 h-12 bg-white dark:bg-neutral-900 border-2 border-neutral-300 dark:border-neutral-700 rounded-sm font-semibold placeholder:UPPERCASE placeholder:text-xs placeholder:tracking-wide"
              autoFocus
            />
          </form>
        </div>
      )}

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-b-2 border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950">
          <nav className="flex flex-col p-4 gap-2">
            {mainNavItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 h-12 rounded-sm border-2 font-bold text-sm UPPERCASE tracking-wide transition-all",
                    isActive
                      ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 border-neutral-900 dark:border-neutral-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
                      : "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 border-neutral-300 dark:border-neutral-700 hover:border-neutral-900 dark:hover:border-neutral-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)]"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              )
            })}
            
            {/* Additional Links */}
            <div className="pt-2 mt-2 border-t-2 border-neutral-200 dark:border-neutral-800 flex flex-col gap-2">
              <Link
                href="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 h-12 rounded-sm border-2 border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-bold text-sm UPPERCASE tracking-wide hover:border-neutral-900 dark:hover:border-neutral-100"
              >
                <User className="h-5 w-5" />
                PROFILE
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

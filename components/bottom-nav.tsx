"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Sparkles, ShoppingBag, User, Heart, Shirt } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/lib/store/cart-context"
import { useWishlist } from "@/lib/store/wishlist-context"

const navItems = [
  { href: "/", label: "HOME", icon: Home },
  { href: "/shop", label: "SHOP", icon: ShoppingBag },
  { href: "/wardrobe", label: "WARDROBE", icon: Shirt },
  { href: "/profile", label: "YOU", icon: User },
]

export function BottomNav() {
  const pathname = usePathname()
  const { itemCount: cartItemCount } = useCart()
  const { itemCount: wishlistItemCount } = useWishlist()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-neutral-900 border-t-2 border-neutral-900 dark:border-neutral-100 z-50 lg:hidden">
      <div className="flex items-center justify-around px-2 py-3 max-w-[600px] mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-sm border-2 min-w-[60px] transition-all",
                isActive 
                  ? "text-white dark:text-neutral-900 bg-neutral-900 dark:bg-neutral-100 border-neutral-900 dark:border-neutral-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]" 
                  : "text-neutral-600 dark:text-neutral-400 bg-white dark:bg-neutral-900 border-transparent hover:border-neutral-300 dark:hover:border-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-100",
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-bold UPPERCASE tracking-wider">{item.label}</span>
            </Link>
          )
        })}
      </div>
      
      {/* Quick Actions Bar */}
      <div className="border-t-2 border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 px-4 py-2 flex items-center justify-center gap-3">
        <Link
          href="/wishlist"
          className="flex items-center gap-2 px-3 py-1.5 rounded-sm border-2 border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:border-neutral-900 dark:hover:border-neutral-100 transition-all relative"
        >
          <Heart className="h-4 w-4 text-neutral-900 dark:text-neutral-100" />
          <span className="text-xs font-bold UPPERCASE text-neutral-900 dark:text-neutral-100">WISHLIST</span>
          {wishlistItemCount > 0 && (
            <Badge className="h-4 w-4 flex items-center justify-center p-0 text-[9px] font-bold bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 border-none rounded-sm">
              {wishlistItemCount}
            </Badge>
          )}
        </Link>
        <Link
          href="/cart"
          className="flex items-center gap-2 px-3 py-1.5 rounded-sm border-2 border-neutral-900 dark:border-neutral-100 bg-neutral-900 dark:bg-neutral-100 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] transition-all relative"
        >
          <ShoppingBag className="h-4 w-4 text-white dark:text-neutral-900" />
          <span className="text-xs font-bold UPPERCASE text-white dark:text-neutral-900">CART</span>
          {cartItemCount > 0 && (
            <Badge className="h-4 w-4 flex items-center justify-center p-0 text-[9px] font-bold bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 border-none rounded-sm">
              {cartItemCount}
            </Badge>
          )}
        </Link>
      </div>
    </nav>
  )
}

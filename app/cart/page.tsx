"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { products } from "@/data/products"
import { ShoppingCart, Plus, Minus, Trash2, CreditCard } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

// Simulate cart items (in a real app, this would come from user state/context)
const initialCartItems = [
  { product: products[0], quantity: 2 }, // Classic White Tee
  { product: products[1], quantity: 1 }, // Blue Denim Jeans
]

export default function CartPage() {
  const [cartItems, setCartItems] = useState(initialCartItems)

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      setCartItems(cartItems.filter(item => item.product.id !== productId))
    } else {
      setCartItems(cartItems.map(item =>
        item.product.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      ))
    }
  }

  const removeItem = (productId: string) => {
    setCartItems(cartItems.filter(item => item.product.id !== productId))
  }

  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
  const shipping = subtotal > 50 ? 0 : 5.99
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="container mx-auto px-6 lg:px-8 py-10 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 bg-neutral-900 dark:bg-neutral-100 rounded-sm border-2 border-neutral-900 dark:border-neutral-100">
              <ShoppingCart className="h-8 w-8 text-neutral-50 dark:text-neutral-900" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-tight">
                Shopping Cart
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400 font-medium uppercase text-sm tracking-wide">
                {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'} in your cart
              </p>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center gap-6 mb-8 p-6 bg-white dark:bg-neutral-900 rounded-sm border-2 border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-3 text-sm text-neutral-900 dark:text-neutral-100 font-bold uppercase tracking-wide">
            <div className="w-6 h-6 bg-neutral-900 dark:bg-neutral-100 rounded-sm flex items-center justify-center border-2 border-neutral-900 dark:border-neutral-100">
              <span className="text-neutral-50 dark:text-neutral-900 text-xs font-bold">✓</span>
            </div>
            Secure SSL
          </div>
          <div className="flex items-center gap-3 text-sm text-neutral-900 dark:text-neutral-100 font-bold uppercase tracking-wide">
            <div className="w-6 h-6 bg-neutral-900 dark:bg-neutral-100 rounded-sm flex items-center justify-center border-2 border-neutral-900 dark:border-neutral-100">
              <span className="text-neutral-50 dark:text-neutral-900 text-xs font-bold">✓</span>
            </div>
            Free Shipping ₹999+
          </div>
          <div className="flex items-center gap-3 text-sm text-neutral-900 dark:text-neutral-100 font-bold uppercase tracking-wide">
            <div className="w-6 h-6 bg-neutral-900 dark:bg-neutral-100 rounded-sm flex items-center justify-center border-2 border-neutral-900 dark:border-neutral-100">
              <span className="text-neutral-50 dark:text-neutral-900 text-xs font-bold">✓</span>
            </div>
            30-Day Returns
          </div>
        </div>

        {cartItems.length > 0 ? (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
            {/* Cart Items */}
            <div className="xl:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.product.id} className="bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)]">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Product Image */}
                      <div className="relative h-32 w-full sm:h-24 sm:w-24 rounded-sm overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex-shrink-0 border-2 border-neutral-200 dark:border-neutral-700">
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-neutral-900 dark:text-neutral-100 mb-1 line-clamp-2 uppercase tracking-wide">
                              {item.product.name}
                            </h3>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2 font-medium uppercase tracking-wide">
                              {item.product.brand}
                            </p>
                            <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                              ₹{item.product.price.toLocaleString('en-IN')}
                            </p>
                          </div>
                          {/* Quantity Controls and Actions */}
                          <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 sm:gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item.product.id)}
                              className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 p-2 rounded-sm"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>

                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                className="h-8 w-8 p-0 border-2 border-neutral-300 dark:border-neutral-600 rounded-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
                              >
                                <Minus className="h-4 w-4" />
                              </Button>

                              <span className="w-8 text-center text-neutral-900 dark:text-neutral-100 font-bold">
                                {item.quantity}
                              </span>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                className="h-8 w-8 p-0 border-2 border-neutral-300 dark:border-neutral-600 rounded-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>

                            <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100 uppercase">
                              ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary - Sticky on larger screens */}
            <div className="space-y-6">
              <div className="sticky top-24">
                <Card className="bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
                  <CardHeader className="border-b-2 border-neutral-200 dark:border-neutral-800">
                    <CardTitle className="text-neutral-900 dark:text-neutral-100 flex items-center gap-2 font-bold uppercase tracking-wide">
                      <CreditCard className="h-5 w-5" />
                      Order Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    <div className="flex justify-between text-neutral-600 dark:text-neutral-400 font-semibold uppercase text-sm tracking-wide">
                      <span>Subtotal ({cartItems.length})</span>
                      <span>₹{subtotal.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex justify-between text-neutral-600 dark:text-neutral-400 font-semibold uppercase text-sm tracking-wide">
                      <span>Shipping</span>
                      <span className={shipping === 0 ? 'text-neutral-900 dark:text-neutral-100 font-bold' : ''}>
                        {shipping === 0 ? 'Free' : `₹${shipping.toLocaleString('en-IN')}`}
                      </span>
                    </div>

                    <div className="flex justify-between text-neutral-600 dark:text-neutral-400 font-semibold uppercase text-sm tracking-wide">
                      <span>Tax (GST)</span>
                      <span>₹{tax.toLocaleString('en-IN')}</span>
                    </div>

                    <Separator className="bg-neutral-200 dark:bg-neutral-800 h-[2px]" />

                    <div className="flex justify-between text-lg font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wide">
                      <span>Total</span>
                      <span>₹{total.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="text-xs text-neutral-600 dark:text-neutral-400 text-center font-medium uppercase tracking-wide">
                      Inclusive of all taxes
                    </div>
                  </CardContent>
                </Card>

                {/* Promo Code */}
                <Card className="bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 rounded-sm">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <h4 className="font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wide text-sm">Have a promo code?</h4>
                      <div className="flex gap-2">
                        <Input placeholder="ENTER CODE" className="flex-1 h-12 border-2 border-neutral-300 dark:border-neutral-600 rounded-sm font-semibold uppercase placeholder:text-neutral-500" />
                        <Button variant="outline" className="h-12 px-6 border-2 border-neutral-300 dark:border-neutral-600 rounded-sm font-bold uppercase hover:bg-neutral-100 dark:hover:bg-neutral-800">Apply</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Checkout Button */}
                <Button className="w-full h-14 text-base font-bold uppercase tracking-wide bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] border-2 border-neutral-900 dark:border-neutral-100" asChild>
                  <Link href="/checkout">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Secure Checkout
                  </Link>
                </Button>

                {/* Continue Shopping */}
                <Button
                  variant="outline"
                  asChild
                  className="w-full h-14 border-2 border-neutral-300 dark:border-neutral-600 rounded-sm font-bold uppercase tracking-wide hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <Link href="/shop">Continue Shopping</Link>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Empty Cart State */
          <Card className="max-w-lg mx-auto bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
            <CardHeader className="text-center pt-8">
              <div className="mx-auto mb-6 h-20 w-20 rounded-sm bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center border-2 border-neutral-300 dark:border-neutral-700">
                <ShoppingCart className="h-10 w-10 text-neutral-500 dark:text-neutral-400" />
              </div>
              <CardTitle className="text-neutral-900 dark:text-neutral-100 font-bold uppercase tracking-tight text-2xl">Your cart is empty</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4 pb-8">
              <p className="text-neutral-600 dark:text-neutral-400 font-medium">
                Discover premium fashion pieces and add them to your cart
              </p>
              <Button asChild className="bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] border-2 border-neutral-900 dark:border-neutral-100 font-bold uppercase tracking-wide h-12 px-8">
                <Link href="/shop">Start Shopping</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

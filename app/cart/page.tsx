"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/componen                  </CardContent>
                </Card>

                {/* Checkout Button */}
                <Button className="w-full bg-neutral-900 dark:bg-neutral-50 text-neutral-50 dark:text-neutral-900">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Proceed to Checkout
                </Button>

                {/* Continue Shopping */}
                <Button 
                  variant="outline" 
                  asChild 
                  className="w-full border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300"
                >
                  <Link href="/shop">Continue Shopping</Link>
                </Button>
              </div>
            </div>
          </div> { Input } from "@/components/ui/input"
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
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 pb-20">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <ShoppingCart className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
              Shopping Cart
            </h1>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400">
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        {cartItems.length > 0 ? (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
            {/* Cart Items */}
            <div className="xl:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.product.id} className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Product Image */}
                      <div className="relative h-32 w-full sm:h-24 sm:w-24 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-700 flex-shrink-0">
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
                            <h3 className="font-semibold text-neutral-900 dark:text-neutral-50 mb-1 line-clamp-2">
                              {item.product.name}
                            </h3>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                              {item.product.brand}
                            </p>
                            <p className="text-lg font-bold text-neutral-900 dark:text-neutral-50">
                              ₹{item.product.price.toLocaleString('en-IN')}
                            </p>
                          </div>

                          {/* Quantity Controls and Actions */}
                          <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 sm:gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item.product.id)}
                              className="text-neutral-500 dark:text-neutral-400 p-1 order-2 sm:order-1"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            
                            <div className="flex items-center gap-2 order-1 sm:order-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                className="h-8 w-8 p-0 border-neutral-300 dark:border-neutral-600"
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              
                              <span className="w-8 text-center text-neutral-900 dark:text-neutral-50 font-medium">
                                {item.quantity}
                              </span>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                className="h-8 w-8 p-0 border-neutral-300 dark:border-neutral-600"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 order-3">
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
                <Card className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
                  <CardHeader>
                    <CardTitle className="text-neutral-900 dark:text-neutral-50">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                  <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  
                  <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'Free' : `₹${shipping.toLocaleString('en-IN')}`}</span>
                  </div>
                  
                  <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                    <span>Tax</span>
                    <span>₹{tax.toLocaleString('en-IN')}</span>
                  </div>
                  
                  <Separator className="bg-neutral-200 dark:bg-neutral-700" />
                  
                  <div className="flex justify-between text-lg font-bold text-neutral-900 dark:text-neutral-50">
                    <span>Total</span>
                    <span>₹{total.toLocaleString('en-IN')}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Checkout Button */}
              <Button className="w-full bg-neutral-900 dark:bg-neutral-50 text-neutral-50 dark:text-neutral-900">
                <CreditCard className="h-4 w-4 mr-2" />
                Proceed to Checkout
              </Button>

              {/* Continue Shopping */}
              <Button 
                variant="outline" 
                asChild 
                className="w-full border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300"
              >
                <Link href="/shop">Continue Shopping</Link>
              </Button>
            </div>
          </div>
        ) : (
          /* Empty Cart State */
          <Card className="max-w-md mx-auto bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center">
                <ShoppingCart className="h-10 w-10 text-neutral-400 dark:text-neutral-500" />
              </div>
              <CardTitle className="text-neutral-900 dark:text-neutral-50">Your cart is empty</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                Add some items to get started
              </p>
              <Button asChild className="bg-neutral-900 dark:bg-neutral-50 text-neutral-50 dark:text-neutral-900">
                <Link href="/shop">Start Shopping</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary/20 rounded-xl">
              <ShoppingCart className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Shopping Cart
              </h1>
              <p className="text-muted-foreground">
                {cartItems.length} {cartItems.length === 1 ? 'premium item' : 'premium items'} in your cart
              </p>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center gap-6 mb-8 p-4 bg-primary/5 rounded-lg border border-primary/10">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">✓</span>
            </div>
            Secure SSL Encryption
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">✓</span>
            </div>
            Free Shipping ₹999+
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">✓</span>
            </div>
            30-Day Returns
          </div>
        </div>

        {cartItems.length > 0 ? (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
            {/* Cart Items */}
            <div className="xl:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.product.id} className="bg-card border-border/50 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Product Image */}
                      <div className="relative h-32 w-full sm:h-24 sm:w-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
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
                            <h3 className="font-semibold text-foreground mb-1 line-clamp-2">
                              {item.product.name}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              {item.product.brand}
                            </p>
                            <p className="text-lg font-bold text-primary">
                              ₹{item.product.price.toLocaleString('en-IN')}
                            </p>
                          </div>
                          {/* Quantity Controls and Actions */}
                          <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 sm:gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item.product.id)}
                              className="text-muted-foreground hover:text-destructive p-1"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>

                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                className="h-8 w-8 p-0 border-border hover:border-primary"
                              >
                                <Minus className="h-4 w-4" />
                              </Button>

                              <span className="w-8 text-center text-foreground font-medium">
                                {item.quantity}
                              </span>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                className="h-8 w-8 p-0 border-border hover:border-primary"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>

                            <p className="text-sm font-medium text-muted-foreground">
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
                <Card className="bg-card border-border/50 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-foreground flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Order Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal ({cartItems.length} items)</span>
                      <span>₹{subtotal.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex justify-between text-muted-foreground">
                      <span>Shipping</span>
                      <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                        {shipping === 0 ? 'Free' : `₹${shipping.toLocaleString('en-IN')}`}
                      </span>
                    </div>

                    <div className="flex justify-between text-muted-foreground">
                      <span>Tax (GST)</span>
                      <span>₹{tax.toLocaleString('en-IN')}</span>
                    </div>

                    <Separator className="bg-border" />

                    <div className="flex justify-between text-lg font-bold text-foreground">
                      <span>Total</span>
                      <span>₹{total.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="text-xs text-muted-foreground text-center">
                      Inclusive of all taxes
                    </div>
                  </CardContent>
                </Card>

                {/* Promo Code */}
                <Card className="bg-card border-border/50 shadow-sm">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <h4 className="font-medium text-foreground">Have a promo code?</h4>
                      <div className="flex gap-2">
                        <Input placeholder="Enter code" className="flex-1" />
                        <Button variant="outline" size="sm">Apply</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Checkout Button */}
                <Button className="w-full h-12 text-lg bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg" asChild>
                  <Link href="/checkout">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Proceed to Secure Checkout
                  </Link>
                </Button>

                {/* Continue Shopping */}
                <Button
                  variant="outline"
                  asChild
                  className="w-full h-12 border-border hover:bg-muted"
                >
                  <Link href="/shop">Continue Shopping</Link>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Empty Cart State */
          <Card className="max-w-lg mx-auto bg-card border-border/50 shadow-sm">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                <ShoppingCart className="h-10 w-10 text-muted-foreground" />
              </div>
              <CardTitle className="text-foreground">Your cart is empty</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Discover premium fashion pieces and add them to your cart
              </p>
              <Button asChild className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
                <Link href="/shop">Start Shopping</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

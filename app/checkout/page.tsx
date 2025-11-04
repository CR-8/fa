"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { products } from "@/data/products"
import { CreditCard, Truck, Shield, CheckCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

// Simulate cart items
const cartItems = [
  { product: products[0], quantity: 2 },
  { product: products[1], quantity: 1 },
]

export default function CheckoutPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    paymentMethod: 'card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    saveInfo: false
  })

  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
  const shipping = subtotal > 50 ? 0 : 5.99
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (step < 3) {
      setStep(step + 1)
    } else {
      // Simulate order placement
      alert('Order placed successfully! (This is a demo)')
    }
  }

  const steps = [
    { id: 1, title: 'Shipping', icon: Truck },
    { id: 2, title: 'Payment', icon: CreditCard },
    { id: 3, title: 'Review', icon: CheckCircle }
  ]

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="container mx-auto px-6 lg:px-8 py-10 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/cart" className="inline-flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 mb-4 font-semibold uppercase text-sm tracking-wide">
            <ArrowLeft className="h-4 w-4" />
            Back to Cart
          </Link>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-tight">Checkout</h1>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {steps.map((stepItem, index) => {
            const Icon = stepItem.icon
            const isActive = step === stepItem.id
            const isCompleted = step > stepItem.id

            return (
              <div key={stepItem.id} className="flex items-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-sm border-2 ${
                  isCompleted ? 'bg-neutral-900 dark:bg-neutral-100 border-neutral-900 dark:border-neutral-100 text-neutral-50 dark:text-neutral-900' :
                  isActive ? 'border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100 bg-white dark:bg-neutral-950' : 'border-neutral-300 dark:border-neutral-600 text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-900'
                }`}>
                  {isCompleted ? <CheckCircle className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </div>
                <span className={`ml-2 text-sm font-bold uppercase tracking-wide ${
                  isActive ? 'text-neutral-900 dark:text-neutral-100' : isCompleted ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-500 dark:text-neutral-400'
                }`}>
                  {stepItem.title}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-[2px] mx-4 ${
                    isCompleted ? 'bg-neutral-900 dark:bg-neutral-100' : 'bg-neutral-300 dark:bg-neutral-600'
                  }`} />
                )}
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div className="space-y-6">
            <form onSubmit={handleSubmit}>
              {step === 1 && (
                <Card className="bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
                  <CardHeader className="border-b-2 border-neutral-200 dark:border-neutral-800">
                    <CardTitle className="flex items-center gap-2 font-bold uppercase tracking-wide text-neutral-900 dark:text-neutral-100">
                      <Truck className="h-5 w-5" />
                      Shipping Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName" className="font-bold uppercase text-sm tracking-wide">First Name</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          required
                          className="h-12 border-2 border-neutral-300 dark:border-neutral-600 rounded-sm font-semibold"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName" className="font-bold uppercase text-sm tracking-wide">Last Name</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          required
                          className="h-12 border-2 border-neutral-300 dark:border-neutral-600 rounded-sm font-semibold"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email" className="font-bold uppercase text-sm tracking-wide">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                        className="h-12 border-2 border-neutral-300 dark:border-neutral-600 rounded-sm font-semibold"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone" className="font-bold uppercase text-sm tracking-wide">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        required
                        className="h-12 border-2 border-neutral-300 dark:border-neutral-600 rounded-sm font-semibold"
                      />
                    </div>

                    <div>
                      <Label htmlFor="address" className="font-bold uppercase text-sm tracking-wide">Address</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        required
                        className="h-12 border-2 border-neutral-300 dark:border-neutral-600 rounded-sm font-semibold"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city" className="font-bold uppercase text-sm tracking-wide">City</Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          required
                          className="h-12 border-2 border-neutral-300 dark:border-neutral-600 rounded-sm font-semibold"
                        />
                      </div>
                      <div>
                        <Label htmlFor="state" className="font-bold uppercase text-sm tracking-wide">State</Label>
                        <Input
                          id="state"
                          value={formData.state}
                          onChange={(e) => handleInputChange('state', e.target.value)}
                          required
                          className="h-12 border-2 border-neutral-300 dark:border-neutral-600 rounded-sm font-semibold"
                        />
                      </div>
                      <div>
                        <Label htmlFor="pincode" className="font-bold uppercase text-sm tracking-wide">PIN Code</Label>
                        <Input
                          id="pincode"
                          value={formData.pincode}
                          onChange={(e) => handleInputChange('pincode', e.target.value)}
                          required
                          className="h-12 border-2 border-neutral-300 dark:border-neutral-600 rounded-sm font-semibold"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="saveInfo"
                        checked={formData.saveInfo}
                        onCheckedChange={(checked) => handleInputChange('saveInfo', checked)}
                        className="border-2 border-neutral-300 dark:border-neutral-600"
                      />
                      <Label htmlFor="saveInfo" className="text-sm font-medium uppercase tracking-wide">
                        Save this information for next time
                      </Label>
                    </div>
                  </CardContent>
                </Card>
              )}

              {step === 2 && (
                <Card className="bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
                  <CardHeader className="border-b-2 border-neutral-200 dark:border-neutral-800">
                    <CardTitle className="flex items-center gap-2 font-bold uppercase tracking-wide text-neutral-900 dark:text-neutral-100">
                      <CreditCard className="h-5 w-5" />
                      Payment Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    <div>
                      <Label htmlFor="paymentMethod" className="font-bold uppercase text-sm tracking-wide">Payment Method</Label>
                      <Select value={formData.paymentMethod} onValueChange={(value) => handleInputChange('paymentMethod', value)}>
                        <SelectTrigger className="h-12 border-2 border-neutral-300 dark:border-neutral-600 rounded-sm font-semibold">
                          <SelectValue placeholder="SELECT PAYMENT METHOD" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 rounded-sm">
                          <SelectItem value="card" className="font-semibold uppercase">Credit/Debit Card</SelectItem>
                          <SelectItem value="upi" className="font-semibold uppercase">UPI</SelectItem>
                          <SelectItem value="cod" className="font-semibold uppercase">Cash on Delivery</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.paymentMethod === 'card' && (
                      <div className="space-y-4 mt-4">
                        <div>
                          <Label htmlFor="cardNumber" className="font-bold uppercase text-sm tracking-wide">Card Number</Label>
                          <Input
                            id="cardNumber"
                            placeholder="1234 5678 9012 3456"
                            value={formData.cardNumber}
                            onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                            required
                            className="h-12 border-2 border-neutral-300 dark:border-neutral-600 rounded-sm font-semibold"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="expiryDate" className="font-bold uppercase text-sm tracking-wide">Expiry Date</Label>
                            <Input
                              id="expiryDate"
                              placeholder="MM/YY"
                              value={formData.expiryDate}
                              onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                              required
                              className="h-12 border-2 border-neutral-300 dark:border-neutral-600 rounded-sm font-semibold"
                            />
                          </div>
                          <div>
                            <Label htmlFor="cvv" className="font-bold uppercase text-sm tracking-wide">CVV</Label>
                            <Input
                              id="cvv"
                              placeholder="123"
                              value={formData.cvv}
                              onChange={(e) => handleInputChange('cvv', e.target.value)}
                              required
                              className="h-12 border-2 border-neutral-300 dark:border-neutral-600 rounded-sm font-semibold"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {formData.paymentMethod === 'upi' && (
                      <div>
                        <Label htmlFor="upiId" className="font-bold uppercase text-sm tracking-wide">UPI ID</Label>
                        <Input
                          id="upiId"
                          placeholder="YOURNAME@UPI"
                          required
                          className="h-12 border-2 border-neutral-300 dark:border-neutral-600 rounded-sm font-semibold placeholder:text-neutral-500 uppercase"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {step === 3 && (
                <Card className="bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
                  <CardHeader className="border-b-2 border-neutral-200 dark:border-neutral-800">
                    <CardTitle className="flex items-center gap-2 font-bold uppercase tracking-wide text-neutral-900 dark:text-neutral-100">
                      <CheckCircle className="h-5 w-5" />
                      Review Your Order
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    <div className="space-y-2">
                      <h4 className="font-bold uppercase text-sm tracking-wide">Shipping Address</h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">
                        {formData.firstName} {formData.lastName}<br />
                        {formData.address}<br />
                        {formData.city}, {formData.state} {formData.pincode}<br />
                        {formData.phone}
                      </p>
                    </div>

                    <Separator className="bg-neutral-200 dark:bg-neutral-800 h-[2px]" />

                    <div className="space-y-2">
                      <h4 className="font-bold uppercase text-sm tracking-wide">Payment Method</h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium uppercase">
                        {formData.paymentMethod === 'card' ? 'Credit/Debit Card' :
                         formData.paymentMethod === 'upi' ? 'UPI' : 'Cash on Delivery'}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 pt-4">
                      <input type="checkbox" required className="rounded-sm border-2 border-neutral-300 dark:border-neutral-600" />
                      <Label className="text-sm font-medium">
                        I agree to the Terms of Service and Privacy Policy
                      </Label>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-4 pt-6">
                {step > 1 && (
                  <Button type="button" variant="outline" onClick={() => setStep(step - 1)} className="h-12 px-6 border-2 border-neutral-300 dark:border-neutral-600 rounded-sm font-bold uppercase tracking-wide hover:bg-neutral-100 dark:hover:bg-neutral-800">
                    Back
                  </Button>
                )}
                <Button type="submit" className="flex-1 h-12 bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] border-2 border-neutral-900 dark:border-neutral-100 font-bold uppercase tracking-wide">
                  {step === 3 ? 'Place Order' : 'Continue'}
                </Button>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card className="sticky top-24 bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
              <CardHeader className="border-b-2 border-neutral-200 dark:border-neutral-800">
                <CardTitle className="font-bold uppercase tracking-wide text-neutral-900 dark:text-neutral-100">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                {cartItems.map((item) => (
                  <div key={item.product.id} className="flex gap-3">
                    <div className="w-12 h-12 bg-neutral-200 dark:bg-neutral-800 rounded-sm flex-shrink-0 border-2 border-neutral-300 dark:border-neutral-700" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate text-neutral-900 dark:text-neutral-100 uppercase tracking-wide">{item.product.name}</p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 font-semibold uppercase">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-neutral-900 dark:text-neutral-100">₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</p>
                  </div>
                ))}

                <Separator className="bg-neutral-200 dark:bg-neutral-800 h-[2px]" />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'Free' : `₹${shipping.toLocaleString('en-IN')}`}</span>
                  </div>
                  <div className="flex justify-between font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
                    <span>Tax</span>
                    <span>₹{tax.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <Separator className="bg-neutral-200 dark:bg-neutral-800 h-[2px]" />

                <div className="flex justify-between text-lg font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wide">
                  <span>Total</span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 pt-4 font-medium uppercase tracking-wide">
                  <Shield className="h-4 w-4" />
                  Secure SSL Encryption
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
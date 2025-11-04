'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Sparkles, Zap } from 'lucide-react';
import Link from 'next/link';

// Simplified pricing data for demo
const plans = [
  {
    tier: 'free',
    name: 'FREE',
    price: '₹0',
    icon: Sparkles,
    color: 'text-neutral-500',
    popular: false,
    dailyCredits: 5,
    features: [
      'Basic AI recommendations',
      'Virtual try-on (5 per day)',
      'Wardrobe management',
      'Style quiz access',
      'Email support'
    ]
  },
  {
    tier: 'pro',
    name: 'PRO',
    price: '₹499',
    icon: Zap,
    color: 'text-neutral-900 dark:text-neutral-100',
    popular: true,
    dailyCredits: 50,
    features: [
      'Everything in FREE',
      'Advanced AI styling (50 per day)',
      'Priority virtual try-on',
      'Personalized outfits',
      'Chat support',
      'Early access to features'
    ]
  },
  {
    tier: 'elite',
    name: 'ELITE',
    price: '₹999',
    icon: Crown,
    color: 'text-neutral-900 dark:text-neutral-100',
    popular: false,
    dailyCredits: 999,
    features: [
      'Everything in PRO',
      'Unlimited AI generations',
      'Personal style consultant',
      'Custom wardrobe analysis',
      '24/7 priority support',
      'Exclusive brand access'
    ]
  },
];

export default function PricingPage() {
  const handleUpgrade = (tier: string) => {
    alert(`Stripe integration coming soon! You selected: ${tier}`);
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-neutral-900 dark:bg-neutral-100 rounded-sm border-2 border-neutral-900 dark:border-neutral-100">
              <Sparkles className="h-10 w-10 text-neutral-50 dark:text-neutral-900" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-neutral-900 dark:text-neutral-100 uppercase tracking-tight">
            Choose Your Plan
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto font-medium">
            Unlock more AI generations and premium features with our flexible pricing plans
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
          {plans.map(({ tier, name, price, icon: Icon, color, popular, dailyCredits, features }) => (
            <Card
              key={tier}
              className={`relative rounded-sm border-2 ${
                popular 
                  ? 'border-neutral-900 dark:border-neutral-100 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]' 
                  : 'border-neutral-300 dark:border-neutral-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]'
              } bg-white dark:bg-neutral-900`}
            >
              {popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-neutral-900 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-900 border-2 border-neutral-900 dark:border-neutral-100 rounded-sm uppercase font-bold">
                  Most Popular
                </Badge>
              )}

              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-sm border-2 ${popular ? 'border-neutral-900 dark:border-neutral-100 bg-neutral-900 dark:bg-neutral-100' : 'border-neutral-300 dark:border-neutral-700'}`}>
                    <Icon className={`h-6 w-6 ${popular ? 'text-neutral-100 dark:text-neutral-900' : color}`} />
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-tight">
                    {name}
                  </h3>
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-5xl font-bold text-neutral-900 dark:text-neutral-100">{price}</span>
                  {tier !== 'free' && (
                    <span className="text-neutral-600 dark:text-neutral-400 font-medium uppercase">/month</span>
                  )}
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium uppercase">
                  {dailyCredits} {tier === 'elite' ? 'Unlimited' : 'AI Generations'} per day
                </p>
              </CardHeader>

              <CardContent className="pb-6">
                <ul className="space-y-3">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="mt-0.5 p-0.5 rounded-sm bg-neutral-900 dark:bg-neutral-100">
                        <Check className="h-4 w-4 text-neutral-100 dark:text-neutral-900" />
                      </div>
                      <span className="text-sm text-neutral-700 dark:text-neutral-300 font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  onClick={() => handleUpgrade(tier)}
                  className={`w-full h-12 rounded-sm border-2 font-bold uppercase tracking-wide ${
                    popular
                      ? 'bg-neutral-900 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-900 border-neutral-900 dark:border-neutral-100 hover:bg-neutral-800 dark:hover:bg-neutral-200'
                      : 'bg-transparent text-neutral-900 dark:text-neutral-100 border-neutral-900 dark:border-neutral-100 hover:bg-neutral-900 dark:hover:bg-neutral-100 hover:text-neutral-100 dark:hover:text-neutral-900'
                  }`}
                >
                  {tier === 'free' ? 'Get Started' : `Upgrade to ${name}`}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center text-neutral-900 dark:text-neutral-100 uppercase tracking-tight">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              {
                q: 'How do credits work?',
                a: 'Credits are used for AI-powered features like virtual try-on and outfit suggestions. Your daily credits automatically reset every 24 hours at midnight.'
              },
              {
                q: 'Can I cancel anytime?',
                a: 'Yes! All paid plans can be cancelled anytime. You\'ll retain access until the end of your billing period.'
              },
              {
                q: 'What happens if I run out of credits?',
                a: 'You can either wait for your daily reset or upgrade to a higher tier for more credits. Your wardrobe and other features remain accessible.'
              },
              {
                q: 'Is there a free trial?',
                a: 'The Free plan gives you 5 daily credits to try our AI features at no cost. No credit card required!'
              }
            ].map((faq, index) => (
              <Card key={index} className="rounded-sm border-2 border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)]">
                <CardHeader>
                  <h3 className="font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wide">
                    {faq.q}
                  </h3>
                </CardHeader>
                <CardContent>
                  <p className="text-neutral-600 dark:text-neutral-400 font-medium">
                    {faq.a}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Button asChild size="lg" className="h-14 px-8 rounded-sm border-2 border-neutral-900 dark:border-neutral-100 bg-neutral-900 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 font-bold uppercase tracking-wide">
            <Link href="/shop">Start Shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

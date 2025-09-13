import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, ArrowRight, Play } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-secondary/20 py-20 lg:py-32">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-accent/10 rounded-full blur-xl animate-pulse delay-1000"></div>

      <div className="container mx-auto px-4 lg:px-6 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge className="bg-gradient-to-r from-primary/10 to-accent/10 text-primary border-primary/20 px-4 py-2">
                <Sparkles className="w-4 h-4 mr-2" />
                Powered by AI
              </Badge>

              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                Your Personal
                <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">
                  AI Fashion Stylist
                </span>
              </h1>

              <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-lg">
                Discover your perfect style with AI-powered recommendations, virtual try-ons, and personalized fashion advice. Get styled by cutting-edge technology.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground shadow-xl hover:shadow-2xl transition-all duration-300 group"
                asChild
              >
                <Link href="/ai-fa" className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Start Styling
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 group"
                asChild
              >
                <Link href="/shop" className="flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  Explore Collection
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8">
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  10K+
                </div>
                <div className="text-sm text-muted-foreground">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  500+
                </div>
                <div className="text-sm text-muted-foreground">Style Combinations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  24/7
                </div>
                <div className="text-sm text-muted-foreground">AI Assistance</div>
              </div>
            </div>
          </div>

          {/* Visual Element */}
          <div className="relative">
            <div className="relative aspect-square max-w-md mx-auto">
              {/* Main Card */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl backdrop-blur-sm border border-border/50 shadow-2xl">
                <div className="p-8 h-full flex flex-col justify-center items-center text-center space-y-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg">
                    <Sparkles className="w-10 h-10 text-primary-foreground" />
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold mb-2">AI-Powered Styling</h3>
                    <p className="text-muted-foreground">
                      Get personalized fashion recommendations and virtual try-ons in seconds
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                    <div className="w-3 h-3 bg-accent rounded-full animate-pulse delay-75"></div>
                    <div className="w-3 h-3 bg-primary rounded-full animate-pulse delay-150"></div>
                  </div>
                </div>
              </div>

              {/* Floating Cards */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 shadow-lg flex items-center justify-center animate-bounce">
                <span className="text-2xl">👗</span>
              </div>

              <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 shadow-lg flex items-center justify-center animate-bounce delay-500">
                <span className="text-xl">👠</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
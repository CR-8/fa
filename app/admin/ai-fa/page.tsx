"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, Sparkles } from "lucide-react"

export default function AIFAPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <Card className="rounded-none border-x-0 border-t-0">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-primary/20 rounded-full">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            AI Fashion Assistant - Admin
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI Features Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Fashion Recommendations</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  AI-powered outfit suggestions based on user preferences
                </p>
                <Badge variant="secondary">Active</Badge>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Virtual Try-On</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  AI-generated try-on previews for products
                </p>
                <Badge variant="secondary">Active</Badge>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Style Analysis</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Analyze user photos for style recommendations
                </p>
                <Badge variant="secondary">Active</Badge>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Wardrobe Management</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  AI categorization and organization of wardrobe items
                </p>
                <Badge variant="outline">Coming Soon</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>AI Model Status</span>
                <Badge variant="default">Online</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Image Processing</span>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Recommendation Engine</span>
                <Badge variant="default">Running</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

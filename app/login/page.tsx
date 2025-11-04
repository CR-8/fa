'use client';

/**
 * Login Page
 * Google OAuth authentication
 */

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Chrome, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get error from URL params (OAuth errors)
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }
  }, [searchParams]);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const next = searchParams.get('next') || '/';
      router.push(next);
    }
  }, [user, router, searchParams]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Sign in error:', err);
      setError(err.message || 'Failed to sign in. Please try again.');
      setIsLoading(false);
    }
  };

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Redirecting...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="w-full max-w-md space-y-6">
        {/* Logo/Brand */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center justify-center gap-2 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
          </Link>
          <h1 className="text-3xl font-bold">Welcome to FashionAI</h1>
          <p className="text-muted-foreground mt-2">
            Sign in to unlock AI-powered fashion experiences
          </p>
        </div>

        {/* Login Card */}
        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Use your Google account to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-destructive">Sign in failed</p>
                  <p className="text-sm text-destructive/80 mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Google Sign In Button */}
            <Button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              size="lg"
              className="w-full gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Chrome className="h-5 w-5" />
                  Continue with Google
                </>
              )}
            </Button>

            {/* Benefits */}
            <div className="pt-4 border-t space-y-2">
              <p className="text-sm font-medium">What you get:</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  5 free AI generations daily
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Virtual try-on technology
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  AI-powered outfit suggestions
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Personalized wardrobe management
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Terms */}
        <p className="text-center text-xs text-muted-foreground">
          By signing in, you agree to our{' '}
          <Link href="/terms" className="underline hover:text-foreground">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="underline hover:text-foreground">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}

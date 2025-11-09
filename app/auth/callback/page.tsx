'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { initializeUserCredits } from '@/lib/credits';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check if we have a hash with tokens (implicit flow)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken && refreshToken) {
          // Set the session with the tokens
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            console.error('Session error:', sessionError);
            setError(sessionError.message);
            setTimeout(() => router.push('/login'), 2000);
            return;
          }

          // Initialize credits for new user
          if (data?.user?.id) {
            await initializeUserCredits(data.user.id);
          }

          // Successfully authenticated, redirect to home
          router.push('/');
          return;
        }

        // Check for code parameter (PKCE flow)
        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get('code');
        const error_param = searchParams.get('error');
        const error_description = searchParams.get('error_description');

        if (error_param) {
          console.error('OAuth error:', error_param, error_description);
          setError(error_description || error_param);
          setTimeout(() => router.push('/login'), 2000);
          return;
        }

        if (code) {
          // Exchange code for session
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            console.error('Exchange error:', exchangeError);
            setError(exchangeError.message);
            setTimeout(() => router.push('/login'), 2000);
            return;
          }

          // Initialize credits for new user
          if (data?.user?.id) {
            await initializeUserCredits(data.user.id);
          }

          // Successfully authenticated
          router.push('/');
          return;
        }

        // No tokens or code found
        setError('No authentication data received');
        setTimeout(() => router.push('/login'), 2000);
      } catch (err) {
        console.error('Callback error:', err);
        setError('Authentication failed');
        setTimeout(() => router.push('/login'), 2000);
      }
    };

    handleCallback();
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="text-center space-y-4 p-8 border-2 border-red-500 rounded-sm bg-white dark:bg-neutral-900 max-w-md">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 uppercase">
            Authentication Error
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 font-medium">
            {error}
          </p>
          <p className="text-sm text-neutral-500">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
      <div className="text-center space-y-4 p-8 border-2 border-neutral-200 dark:border-neutral-800 rounded-sm bg-white dark:bg-neutral-900">
        <div className="animate-spin rounded-sm h-12 w-12 border-2 border-neutral-900 dark:border-neutral-100 border-t-transparent mx-auto"></div>
        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 uppercase">
          Completing Sign In...
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400 font-medium">
          Please wait while we authenticate you
        </p>
      </div>
    </div>
  );
}

/**
 * Auth Callback Handler
 * Handles OAuth callback from Google and other providers
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/';
  const error = requestUrl.searchParams.get('error');
  const error_description = requestUrl.searchParams.get('error_description');

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error, error_description);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error_description || error)}`, request.url)
    );
  }

  if (code) {
    try {
      // Exchange the code for a session
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error('Error exchanging code for session:', exchangeError);
        return NextResponse.redirect(
          new URL(`/login?error=${encodeURIComponent(exchangeError.message)}`, request.url)
        );
      }

      if (data.session) {
        // Successfully authenticated
        // Redirect to the next URL or home
        return NextResponse.redirect(new URL(next, request.url));
      }
    } catch (error) {
      console.error('Exception during auth callback:', error);
      return NextResponse.redirect(
        new URL('/login?error=authentication_failed', request.url)
      );
    }
  }

  // No code provided, redirect to login
  return NextResponse.redirect(new URL('/login', request.url));
}

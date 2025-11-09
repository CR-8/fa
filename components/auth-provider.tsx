'use client';

/**
 * Auth Provider Component
 * Manages authentication state across the app
 */

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, type Profile } from '@/lib/supabase';
import { getUserCredits, initializeUserCredits, type CreditInfo } from '@/lib/credits';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  credits: CreditInfo | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshCredits: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [credits, setCredits] = useState<CreditInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setProfile(data as Profile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  // Fetch user credits
  const fetchCredits = async (userId: string) => {
    try {
      let creditInfo = await getUserCredits(userId);
      
      // If credits are null/undefined, try to initialize them
      if (!creditInfo) {
        console.log('Credits not found, attempting to initialize...');
        await initializeUserCredits(userId);
        
        // Try fetching again after initialization
        creditInfo = await getUserCredits(userId);
      }
      
      setCredits(creditInfo);
    } catch (error) {
      console.error('Error in fetchCredits:', error);
      // Set default credits as fallback
      setCredits({
        credits_remaining: 10,
        credits_total: 10,
        plan_tier: 'free',
        last_reset: new Date().toISOString(),
        next_reset: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });
    }
  };

  // Refresh credits
  const refreshCredits = async () => {
    if (user) {
      await fetchCredits(user.id);
    }
  };

  // Initialize auth state
  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchCredits(session.user.id);
      }
      
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchCredits(session.user.id);
      } else {
        setProfile(null);
        setCredits(null);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sign in with Google
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  // Sign out
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Error signing out:', error);
      throw error;
    }
    
    setUser(null);
    setProfile(null);
    setCredits(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        credits,
        loading,
        signInWithGoogle,
        signOut,
        refreshCredits,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

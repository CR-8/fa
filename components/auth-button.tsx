'use client';

/**
 * Auth Button Component
 * Shows login/logout and user info
 */

import { useAuth } from './auth-provider';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { LogIn, LogOut, User, CreditCard, Crown } from 'lucide-react';
import { formatCreditDisplay, getTimeUntilReset, PLAN_FEATURES } from '@/lib/credits';
import Link from 'next/link';

export function AuthButton() {
  const { user, profile, credits, loading, signInWithGoogle, signOut } = useAuth();

  if (loading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
      </Button>
    );
  }

  if (!user || !profile) {
    return (
      <Button onClick={signInWithGoogle} size="sm" className="gap-2">
        <LogIn className="h-4 w-4" />
        Sign In
      </Button>
    );
  }

  const planInfo = PLAN_FEATURES[profile.plan_tier];
  const initials = profile.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || user.email?.[0].toUpperCase() || 'U';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild >
        <Button variant="ghost" size="sm" className="gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile.avatar_url} alt={profile.name || 'User'} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="hidden md:flex flex-col items-start text-xs">
            <span className="font-medium">{profile.name || 'User'}</span>
            <span className="text-muted-foreground">
              {credits ? formatCreditDisplay(credits) : '...'} credits
            </span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{profile.name || 'User'}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {/* Credits Display */}
        <div className="px-2 py-3 bg-muted/50 rounded-md mx-2 mb-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium flex items-center gap-1">
              <CreditCard className="h-3 w-3" />
              Daily Credits
            </span>
            <span className="text-xs font-bold">
              {credits ? formatCreditDisplay(credits) : 'N/A'}
            </span>
          </div>
          
          {credits && (
            <div className="space-y-1">
              <div className="w-full bg-background rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{
                    width: `${(credits.credits_remaining / credits.credits_total) * 100}%`,
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Resets in {getTimeUntilReset(credits)}
              </p>
            </div>
          )}
        </div>

        {/* Plan Badge */}
        <div className="px-2 py-2 mx-2 mb-2 rounded-md border border-border flex items-center justify-between">
          <span className="text-xs font-medium flex items-center gap-1">
            {profile.plan_tier === 'elite' && <Crown className="h-3 w-3 text-yellow-500" />}
            {profile.plan_tier === 'pro' && <Crown className="h-3 w-3 text-blue-500" />}
            {planInfo.name} Plan
          </span>
          {profile.plan_tier === 'free' && (
            <Link href="/pricing">
              <Button variant="ghost" size="sm" className="h-6 text-xs">
                Upgrade
              </Button>
            </Link>
          )}
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/profile" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/wardrobe" className="cursor-pointer">
            <CreditCard className="mr-2 h-4 w-4" />
            My Wardrobe
          </Link>
        </DropdownMenuItem>

        {profile.plan_tier === 'free' && (
          <DropdownMenuItem asChild>
            <Link href="/pricing" className="cursor-pointer">
              <Crown className="mr-2 h-4 w-4" />
              Upgrade Plan
            </Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={signOut} className="cursor-pointer text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

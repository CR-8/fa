'use client';

/**
 * Premium Loading Component
 * Shows an elegant loading screen during AI generation
 */

import { useEffect, useState } from 'react';
import { Sparkles, Shirt, Wand2 } from 'lucide-react';
import { Card } from './ui/card';

interface PremiumLoadingProps {
  message?: string;
  estimatedTime?: number; // in seconds
  showProgress?: boolean;
}

const loadingMessages = [
  'Analyzing your style...',
  'Preparing AI models...',
  'Generating photorealistic image...',
  'Applying perfect fit algorithms...',
  'Adjusting lighting and shadows...',
  'Enhancing fabric textures...',
  'Finalizing your virtual try-on...',
  'Almost there...',
];

export function PremiumLoading({
  message = 'AI styling in progress...',
  estimatedTime = 30,
  showProgress = true,
}: PremiumLoadingProps) {
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(loadingMessages[0]);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    // Progress simulation
    if (showProgress) {
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) return prev;
          return prev + (100 - prev) * 0.05;
        });
      }, 500);

      return () => clearInterval(progressInterval);
    }
  }, [showProgress]);

  useEffect(() => {
    // Cycle through messages
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 4000);

    return () => clearInterval(messageInterval);
  }, []);

  useEffect(() => {
    setCurrentMessage(loadingMessages[messageIndex]);
  }, [messageIndex]);

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <Card className="max-w-md w-full mx-4 p-8 space-y-6 bg-gradient-to-br from-background to-muted/50 border-2">
        {/* Animated Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
            <div className="relative bg-primary/10 p-6 rounded-full">
              <Wand2 className="h-12 w-12 text-primary animate-spin-slow" />
            </div>
          </div>
        </div>

        {/* Main Message */}
        <div className="text-center space-y-2">
          <h3 className="text-xl font-bold flex items-center justify-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500 animate-pulse" />
            {message}
          </h3>
          <p className="text-sm text-muted-foreground animate-fade-in">
            {currentMessage}
          </p>
        </div>

        {/* Progress Bar */}
        {showProgress && (
          <div className="space-y-2">
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{Math.round(progress)}%</span>
              <span>~{Math.max(0, Math.round(estimatedTime * (1 - progress / 100)))}s remaining</span>
            </div>
          </div>
        )}

        {/* Features Grid */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center space-y-1">
            <div className="w-10 h-10 mx-auto bg-primary/10 rounded-lg flex items-center justify-center">
              <Shirt className="h-5 w-5 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">Perfect Fit</p>
          </div>
          <div className="text-center space-y-1">
            <div className="w-10 h-10 mx-auto bg-purple-500/10 rounded-lg flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-purple-500" />
            </div>
            <p className="text-xs text-muted-foreground">AI Powered</p>
          </div>
          <div className="text-center space-y-1">
            <div className="w-10 h-10 mx-auto bg-blue-500/10 rounded-lg flex items-center justify-center">
              <Wand2 className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-xs text-muted-foreground">Premium Quality</p>
          </div>
        </div>

        {/* Tip */}
        <div className="text-center text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
          💡 <span className="font-medium">Pro tip:</span> Our AI takes time to ensure photorealistic results
        </div>
      </Card>
    </div>
  );
}

// Add to globals.css:
// @keyframes spin-slow {
//   from { transform: rotate(0deg); }
//   to { transform: rotate(360deg); }
// }
// .animate-spin-slow {
//   animation: spin-slow 3s linear infinite;
// }
// @keyframes fade-in {
//   from { opacity: 0; transform: translateY(-10px); }
//   to { opacity: 1; transform: translateY(0); }
// }
// .animate-fade-in {
//   animation: fade-in 0.5s ease-out;
// }

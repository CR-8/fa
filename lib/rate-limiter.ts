// Rate limiting utility for frontend
class RateLimiter {
  private requests: number[] = [];
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 3, windowMs: number = 120000) { // 3 requests per 2 minutes (slower)
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  canMakeRequest(): boolean {
    const now = Date.now();
    // Remove old requests outside the window
    this.requests = this.requests.filter(time => now - time < this.windowMs);

    if (this.requests.length < this.maxRequests) {
      this.requests.push(now);
      return true;
    }

    return false;
  }

  getTimeUntilNextRequest(): number {
    if (this.requests.length === 0) return 0;

    const now = Date.now();
    const oldestRequest = Math.min(...this.requests);
    const timePassed = now - oldestRequest;
    const timeUntilNext = this.windowMs - timePassed;

    return Math.max(0, timeUntilNext);
  }

  // Get current request count for display
  getCurrentRequestCount(): number {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    return this.requests.length;
  }
}

// Export a singleton instance with slower limits
export const rateLimiter = new RateLimiter();

// Separate rate limiter for try-on feature
// RELAXED: Since we now prevent duplicate calls at component level,
// this is just a safety net for the entire session
export const tryOnRateLimiter = new RateLimiter(10, 300000); // 10 requests per 5 minutes
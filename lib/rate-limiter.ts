// Rate limiting utility for frontend
class RateLimiter {
  private requests: number[] = [];
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 5, windowMs: number = 60000) { // 5 requests per minute
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
}

// Export a singleton instance
export const rateLimiter = new RateLimiter();
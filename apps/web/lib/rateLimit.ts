/**
 * A simple in-memory rate limiter.
 * This is suitable for Node.js API routes on Vercel/Next.js to prevent simple abuse
 * per-container instance. State resets when the container goes cold.
 */
export class RateLimiter {
  private cache = new Map<string, { count: number; expiresAt: number }>();

  constructor(
    private limit: number,
    private windowMs: number
  ) {}

  /**
   * Returns true if the key is within limits, false if rate limited.
   */
  check(key: string): boolean {
    const now = Date.now();
    const record = this.cache.get(key);

    if (!record || record.expiresAt < now) {
      this.cache.set(key, { count: 1, expiresAt: now + this.windowMs });
      
      // Periodic cleanup to prevent memory leaks in long-running containers
      if (this.cache.size > 10000) {
        this.cleanup();
      }
      return true;
    }

    if (record.count >= this.limit) {
      return false;
    }

    record.count++;
    return true;
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (value.expiresAt < now) {
        this.cache.delete(key);
      }
    }
  }
}

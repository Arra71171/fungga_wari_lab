/**
 * A simple in-memory rate limiter.
 * This is suitable for Node.js API routes on Vercel/Next.js to prevent simple abuse
 * per-container instance. State resets when the container goes cold.
 *
 * Security notes:
 * - Max 5 000 keys are stored; once the cap is reached the oldest entry is evicted (LRU-lite).
 * - The caller is responsible for deriving a safe, normalised key before passing it here.
 *   For IP-based limiting, use only the FIRST value in x-forwarded-for (trimmed + lower-cased)
 *   so the key cannot be inflated by comma-separated spoofed IPs.
 */
export class RateLimiter {
  private static readonly MAX_KEYS = 5000;
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
      // Evict oldest entry if we're at capacity (prevents unbounded memory growth)
      if (!record && this.cache.size >= RateLimiter.MAX_KEYS) {
        const oldest = this.cache.keys().next().value;
        if (oldest !== undefined) this.cache.delete(oldest);
      }
      this.cache.set(key, { count: 1, expiresAt: now + this.windowMs });
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

/**
 * Safely extract a rate-limit key from x-forwarded-for.
 * Always takes the FIRST IP only to prevent spoofing via comma-injected values.
 */
export function getClientIp(forwardedFor: string | null): string {
  if (!forwardedFor) return "unknown";
  // Take only the first value (before any comma) — trim whitespace, lower-case for normalisation
  return forwardedFor.split(",")[0]?.trim().toLowerCase() ?? "unknown";
}

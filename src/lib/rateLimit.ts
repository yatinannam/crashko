/**
 * Simple in-memory rate limiter.
 * Not persistent across serverless instances but provides meaningful
 * protection against rapid abuse from a single user/IP.
 */

interface BucketEntry {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, BucketEntry>();

/**
 * Returns true if the request should be allowed, false if rate-limited.
 * @param key     Unique identifier (userId or IP)
 * @param limit   Max requests per window
 * @param windowMs Window size in milliseconds (default: 60s)
 */
export function rateLimit(
  key: string,
  limit = 10,
  windowMs = 60_000,
): boolean {
  const now = Date.now();
  const entry = buckets.get(key);

  if (!entry || now > entry.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= limit) return false;

  entry.count++;
  return true;
}

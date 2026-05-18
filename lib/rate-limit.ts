/**
 * Process-local sliding-window rate limiter. Good enough for the commission
 * form on a single Vercel instance; for production-grade limiting across
 * regions, swap in Upstash Redis or Vercel KV. Charter §risks "Spam
 * protection" — honeypot + this in-memory limiter is the v1 mitigation.
 */

interface Bucket {
  hits: number[];
}

const buckets = new Map<string, Bucket>();
const MAX_KEYS = 10_000;

interface RateLimitOptions {
  windowMs: number;
  max: number;
}

export function rateLimit(key: string, opts: RateLimitOptions): boolean {
  const now = Date.now();
  const cutoff = now - opts.windowMs;
  let bucket = buckets.get(key);
  if (!bucket) {
    if (buckets.size >= MAX_KEYS) {
      // Cheap eviction — drop the oldest key when we exceed the cap.
      const oldest = buckets.keys().next().value;
      if (oldest !== undefined) buckets.delete(oldest);
    }
    bucket = { hits: [] };
    buckets.set(key, bucket);
  }
  bucket.hits = bucket.hits.filter((t) => t >= cutoff);
  if (bucket.hits.length >= opts.max) return false;
  bucket.hits.push(now);
  return true;
}

export function _resetRateLimitForTests(): void {
  buckets.clear();
}

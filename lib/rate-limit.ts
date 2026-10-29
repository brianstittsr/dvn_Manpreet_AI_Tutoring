import { NextRequest, NextResponse } from "next/server";

/**
 * In-memory fixed-window rate limiter for abuse/spam protection on
 * unauthenticated or high-cost API endpoints.
 *
 * NOTE: state is per serverless instance/process. On a multi-instance
 * deployment this caps abuse per instance rather than globally — sufficient
 * for naive spam bots, but not a substitute for a distributed limiter
 * (e.g. Upstash/Vercel KV) if stricter guarantees are ever required.
 */

interface RateLimitOptions {
  /** Maximum requests allowed per window per client. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
  /** Bucket namespace, typically the route path (e.g. "sms-opt-in"). */
  scope: string;
}

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 10_000;

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

function purgeExpired(now: number): void {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

/**
 * Returns a 429 NextResponse when the client has exceeded the limit,
 * or null when the request may proceed.
 */
export function rateLimit(
  request: NextRequest,
  options: RateLimitOptions
): NextResponse | null {
  const now = Date.now();
  if (buckets.size > MAX_BUCKETS) {
    purgeExpired(now);
  }

  const key = `${options.scope}:${clientIp(request)}`;
  let bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + options.windowMs };
    buckets.set(key, bucket);
  }
  bucket.count += 1;

  if (bucket.count <= options.limit) {
    return null;
  }

  const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfter),
        "X-RateLimit-Limit": String(options.limit),
      },
    }
  );
}

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type RateLimitOptions = {
  key: string;
  maxRequests: number;
  windowMs: number;
};

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

declare global {
  // eslint-disable-next-line no-var
  var inMemoryRateLimiter: Map<string, RateLimitEntry> | undefined;
}

const STORE = global.inMemoryRateLimiter ?? new Map<string, RateLimitEntry>();

if (!global.inMemoryRateLimiter) {
  global.inMemoryRateLimiter = STORE;
}

function now(): number {
  return Date.now();
}

export function enforceRateLimit(options: RateLimitOptions): RateLimitResult {
  const currentTime = now();
  const existing = STORE.get(options.key);

  if (!existing || existing.resetAt <= currentTime) {
    STORE.set(options.key, {
      count: 1,
      resetAt: currentTime + options.windowMs,
    });

    return {
      allowed: true,
      remaining: Math.max(0, options.maxRequests - 1),
      retryAfterSeconds: Math.ceil(options.windowMs / 1000),
    };
  }

  if (existing.count >= options.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - currentTime) / 1000)),
    };
  }

  existing.count += 1;
  STORE.set(options.key, existing);

  return {
    allowed: true,
    remaining: Math.max(0, options.maxRequests - existing.count),
    retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - currentTime) / 1000)),
  };
}

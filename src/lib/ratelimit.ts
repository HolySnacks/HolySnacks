import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

function makeRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export async function checkScanLimit(
  ip: string
): Promise<{ allowed: boolean; remaining: number }> {
  const redis = makeRedis();
  if (!redis) return { allowed: true, remaining: 999 };

  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, "1 m"),
    prefix: "rl:scan",
  });
  const result = await limiter.limit(ip);
  return { allowed: result.success, remaining: result.remaining };
}

export async function checkWriteLimit(
  ip: string
): Promise<{ allowed: boolean; remaining: number }> {
  const redis = makeRedis();
  if (!redis) return { allowed: true, remaining: 999 };

  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, "1 m"),
    prefix: "rl:write",
  });
  const result = await limiter.limit(ip);
  return { allowed: result.success, remaining: result.remaining };
}

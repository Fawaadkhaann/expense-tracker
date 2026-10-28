import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const limit = 5;
const window = "1 h";
let rateLimiter: Ratelimit | undefined;

export async function limitUserEmailSends(userId: string) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    throw new Error("Email rate-limit storage is not configured.");
  }

  rateLimiter ??= new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(limit, window),
    prefix: "ledger:email-send",
    analytics: false,
  });

  return rateLimiter.limit(userId);
}

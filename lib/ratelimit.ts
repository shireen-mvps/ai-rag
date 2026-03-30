import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// 3 uploads per IP per 24 hours — enough to genuinely evaluate the product
export const uploadLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "24 h"),
  prefix: "konfide:upload",
  analytics: true,
});

// 20 chat messages per IP per 24 hours
export const chatLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "24 h"),
  prefix: "konfide:chat",
  analytics: true,
});

export function getClientIP(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const realIP    = req.headers.get("x-real-ip");
  return forwarded?.split(",")[0]?.trim() ?? realIP ?? "anonymous";
}

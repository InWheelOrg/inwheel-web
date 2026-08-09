import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let ratelimit: Ratelimit | null | undefined;

function redisUrl(): string | undefined {
  return process.env.UPSTASH_REDIS_REST_URL ?? process.env.UPSTASH_REDIS_REST_KV_REST_API_URL;
}

function redisToken(): string | undefined {
  return process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN;
}

function getRatelimit(): Ratelimit | null {
  if (ratelimit !== undefined) return ratelimit;
  const url = redisUrl();
  const token = redisToken();
  if (!url || !token) {
    ratelimit = null;
    return ratelimit;
  }
  ratelimit = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(5, "60 s"),
    prefix: "inwheel-web:gate",
  });
  return ratelimit;
}

export async function isGateAttemptAllowed(identifier: string): Promise<boolean> {
  const rl = getRatelimit();
  if (!rl) return true;
  const { success } = await rl.limit(identifier);
  return success;
}

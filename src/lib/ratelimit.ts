import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let ratelimit: Ratelimit | null | undefined;

function getRatelimit(): Ratelimit | null {
  if (ratelimit !== undefined) return ratelimit;
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    ratelimit = null;
    return ratelimit;
  }
  ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
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

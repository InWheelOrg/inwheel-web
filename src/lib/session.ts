import crypto from "node:crypto";
import { sealData, unsealData } from "iron-session";

export const SESSION_COOKIE_NAME = "inwheel_session";
export const SESSION_TTL_SECONDS = 5 * 365 * 24 * 60 * 60;

type SessionData = {
  isLoggedIn: true;
};

function sessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is not set");
  }
  return secret;
}

export async function createSessionCookieValue(): Promise<string> {
  const data: SessionData = { isLoggedIn: true };
  return sealData(data, { password: sessionSecret(), ttl: SESSION_TTL_SECONDS });
}

export async function isValidSessionCookieValue(value: string | undefined): Promise<boolean> {
  if (!value) return false;
  try {
    const data = await unsealData<SessionData>(value, {
      password: sessionSecret(),
      ttl: SESSION_TTL_SECONDS,
    });
    return data.isLoggedIn === true;
  } catch {
    return false;
  }
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
}

export function isCorrectPagePassword(candidate: string): boolean {
  const expected = process.env.PAGE_PASSWORD;
  return typeof expected === "string" && expected.length > 0 && safeEqual(candidate, expected);
}

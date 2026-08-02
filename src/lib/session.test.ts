import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createSessionCookieValue,
  isCorrectPagePassword,
  isValidSessionCookieValue,
  SESSION_TTL_SECONDS,
} from "./session";

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  process.env.SESSION_SECRET = "a".repeat(32);
  process.env.PAGE_PASSWORD = "correct-horse-battery-staple";
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.useRealTimers();
});

describe("session cookie", () => {
  it("round-trips a freshly created cookie as valid", async () => {
    const seal = await createSessionCookieValue();
    await expect(isValidSessionCookieValue(seal)).resolves.toBe(true);
  });

  it("rejects an absent cookie", async () => {
    await expect(isValidSessionCookieValue(undefined)).resolves.toBe(false);
  });

  it("rejects garbage input", async () => {
    await expect(isValidSessionCookieValue("not-a-real-seal")).resolves.toBe(false);
  });

  it("rejects a tampered seal", async () => {
    const seal = await createSessionCookieValue();
    const tampered = seal.slice(0, -1) + (seal.at(-1) === "a" ? "b" : "a");
    await expect(isValidSessionCookieValue(tampered)).resolves.toBe(false);
  });

  it("rejects a cookie sealed with a different secret", async () => {
    const seal = await createSessionCookieValue();
    process.env.SESSION_SECRET = "b".repeat(32);
    await expect(isValidSessionCookieValue(seal)).resolves.toBe(false);
  });

  it("rejects an expired cookie", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    const seal = await createSessionCookieValue();

    vi.setSystemTime(new Date(Date.now() + (SESSION_TTL_SECONDS + 60) * 1000));
    await expect(isValidSessionCookieValue(seal)).resolves.toBe(false);
  });

  it("throws when SESSION_SECRET is unset", async () => {
    delete process.env.SESSION_SECRET;
    await expect(createSessionCookieValue()).rejects.toThrow("SESSION_SECRET is not set");
  });
});

describe("isCorrectPagePassword", () => {
  it("accepts the configured password", () => {
    expect(isCorrectPagePassword("correct-horse-battery-staple")).toBe(true);
  });

  it("rejects a wrong password", () => {
    expect(isCorrectPagePassword("wrong")).toBe(false);
  });

  it("rejects everything when PAGE_PASSWORD is unset", () => {
    delete process.env.PAGE_PASSWORD;
    expect(isCorrectPagePassword("correct-horse-battery-staple")).toBe(false);
  });

  it("rejects the empty string even if PAGE_PASSWORD is empty", () => {
    process.env.PAGE_PASSWORD = "";
    expect(isCorrectPagePassword("")).toBe(false);
  });
});

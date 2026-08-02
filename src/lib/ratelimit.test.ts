import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { limitMock, constructorSpy } = vi.hoisted(() => ({
  limitMock: vi.fn(),
  constructorSpy: vi.fn(),
}));

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  vi.resetModules();
  process.env = { ...ORIGINAL_ENV };
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  limitMock.mockReset();
  constructorSpy.mockReset();
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.doUnmock("@upstash/redis");
  vi.doUnmock("@upstash/ratelimit");
});

describe("isGateAttemptAllowed", () => {
  it("fails open when Upstash env vars are not configured", async () => {
    const { isGateAttemptAllowed } = await import("./ratelimit");
    await expect(isGateAttemptAllowed("1.2.3.4")).resolves.toBe(true);
  });

  it("delegates to the configured limiter when Upstash env vars are set", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";
    limitMock.mockResolvedValue({ success: false });

    vi.doMock("@upstash/redis", () => ({
      Redis: { fromEnv: vi.fn(() => ({})) },
    }));
    vi.doMock("@upstash/ratelimit", () => {
      class FakeRatelimit {
        limit = limitMock;
        constructor() {
          constructorSpy();
        }
        static slidingWindow = vi.fn(() => "fake-limiter");
      }
      return { Ratelimit: FakeRatelimit };
    });

    const { isGateAttemptAllowed } = await import("./ratelimit");
    await expect(isGateAttemptAllowed("1.2.3.4")).resolves.toBe(false);
    expect(limitMock).toHaveBeenCalledWith("1.2.3.4");
  });

  it("memoizes the limiter instance across calls instead of recreating it", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";
    limitMock.mockResolvedValue({ success: true });

    vi.doMock("@upstash/redis", () => ({
      Redis: { fromEnv: vi.fn(() => ({})) },
    }));
    vi.doMock("@upstash/ratelimit", () => {
      class FakeRatelimit {
        limit = limitMock;
        constructor() {
          constructorSpy();
        }
        static slidingWindow = vi.fn(() => "fake-limiter");
      }
      return { Ratelimit: FakeRatelimit };
    });

    const { isGateAttemptAllowed } = await import("./ratelimit");
    await isGateAttemptAllowed("a");
    await isGateAttemptAllowed("b");
    expect(constructorSpy).toHaveBeenCalledTimes(1);
  });
});

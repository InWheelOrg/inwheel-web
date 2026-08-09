import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { limitMock, constructorSpy, redisConstructorSpy } = vi.hoisted(() => ({
  limitMock: vi.fn(),
  constructorSpy: vi.fn(),
  redisConstructorSpy: vi.fn(),
}));

const ORIGINAL_ENV = { ...process.env };

function mockUpstash() {
  vi.doMock("@upstash/redis", () => ({
    Redis: class {
      constructor(config: unknown) {
        redisConstructorSpy(config);
      }
    },
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
}

beforeEach(() => {
  vi.resetModules();
  process.env = { ...ORIGINAL_ENV };
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  delete process.env.UPSTASH_REDIS_REST_KV_REST_API_URL;
  delete process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN;
  limitMock.mockReset();
  constructorSpy.mockReset();
  redisConstructorSpy.mockReset();
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
    mockUpstash();

    const { isGateAttemptAllowed } = await import("./ratelimit");
    await expect(isGateAttemptAllowed("1.2.3.4")).resolves.toBe(false);
    expect(limitMock).toHaveBeenCalledWith("1.2.3.4");
  });

  it("falls back to Vercel's legacy KV_REST_API env var names", async () => {
    process.env.UPSTASH_REDIS_REST_KV_REST_API_URL = "https://example.upstash.io";
    process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN = "test-token";
    limitMock.mockResolvedValue({ success: true });
    mockUpstash();

    const { isGateAttemptAllowed } = await import("./ratelimit");
    await expect(isGateAttemptAllowed("1.2.3.4")).resolves.toBe(true);
    expect(redisConstructorSpy).toHaveBeenCalledWith({
      url: "https://example.upstash.io",
      token: "test-token",
    });
  });

  it("prefers the plain env var names over the legacy KV_REST_API ones", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://plain.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "plain-token";
    process.env.UPSTASH_REDIS_REST_KV_REST_API_URL = "https://legacy.upstash.io";
    process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN = "legacy-token";
    limitMock.mockResolvedValue({ success: true });
    mockUpstash();

    const { isGateAttemptAllowed } = await import("./ratelimit");
    await isGateAttemptAllowed("1.2.3.4");
    expect(redisConstructorSpy).toHaveBeenCalledWith({
      url: "https://plain.upstash.io",
      token: "plain-token",
    });
  });

  it("memoizes the limiter instance across calls instead of recreating it", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";
    limitMock.mockResolvedValue({ success: true });
    mockUpstash();

    const { isGateAttemptAllowed } = await import("./ratelimit");
    await isGateAttemptAllowed("a");
    await isGateAttemptAllowed("b");
    expect(constructorSpy).toHaveBeenCalledTimes(1);
  });
});

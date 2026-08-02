import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { cookieStoreSetMock, headersGetMock, redirectMock, isGateAttemptAllowedMock, isCorrectPagePasswordMock, createSessionCookieValueMock } =
  vi.hoisted(() => ({
    cookieStoreSetMock: vi.fn(),
    headersGetMock: vi.fn(),
    redirectMock: vi.fn((path: string) => {
      throw new Error(`NEXT_REDIRECT:${path}`);
    }),
    isGateAttemptAllowedMock: vi.fn(),
    isCorrectPagePasswordMock: vi.fn(),
    createSessionCookieValueMock: vi.fn(),
  }));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({ set: cookieStoreSetMock })),
  headers: vi.fn(async () => ({ get: headersGetMock })),
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("@/lib/ratelimit", () => ({
  isGateAttemptAllowed: isGateAttemptAllowedMock,
}));

vi.mock("@/lib/session", () => ({
  isCorrectPagePassword: isCorrectPagePasswordMock,
  createSessionCookieValue: createSessionCookieValueMock,
  SESSION_COOKIE_NAME: "inwheel_session",
  SESSION_TTL_SECONDS: 12345,
}));

import { submitGatePassword } from "./actions";

function formDataWith(password?: string): FormData {
  const fd = new FormData();
  if (password !== undefined) fd.set("password", password);
  return fd;
}

beforeEach(() => {
  cookieStoreSetMock.mockReset();
  headersGetMock.mockReset().mockReturnValue(null);
  redirectMock.mockClear();
  isGateAttemptAllowedMock.mockReset().mockResolvedValue(true);
  isCorrectPagePasswordMock.mockReset().mockReturnValue(false);
  createSessionCookieValueMock.mockReset().mockResolvedValue("sealed-cookie-value");
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("submitGatePassword", () => {
  it("rejects without checking the password when rate-limited", async () => {
    isGateAttemptAllowedMock.mockResolvedValue(false);

    const result = await submitGatePassword({}, formDataWith("anything"));

    expect(result).toEqual({ error: "Trop de tentatives. Réessayez dans une minute." });
    expect(isCorrectPagePasswordMock).not.toHaveBeenCalled();
  });

  it("rejects a missing password", async () => {
    const result = await submitGatePassword({}, formDataWith());
    expect(result).toEqual({ error: "Mot de passe requis." });
  });

  it("rejects an empty password", async () => {
    const result = await submitGatePassword({}, formDataWith(""));
    expect(result).toEqual({ error: "Mot de passe requis." });
  });

  it("rejects a wrong password", async () => {
    isCorrectPagePasswordMock.mockReturnValue(false);
    const result = await submitGatePassword({}, formDataWith("wrong"));
    expect(result).toEqual({ error: "Mot de passe incorrect." });
    expect(cookieStoreSetMock).not.toHaveBeenCalled();
  });

  it("sets the session cookie and redirects home on a correct password", async () => {
    isCorrectPagePasswordMock.mockReturnValue(true);

    await expect(submitGatePassword({}, formDataWith("correct"))).rejects.toThrow(
      "NEXT_REDIRECT:/",
    );

    expect(cookieStoreSetMock).toHaveBeenCalledWith(
      "inwheel_session",
      "sealed-cookie-value",
      expect.objectContaining({
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 12345,
      }),
    );
    expect(redirectMock).toHaveBeenCalledWith("/");
  });

  it("derives the client IP from x-forwarded-for, taking the first entry", async () => {
    headersGetMock.mockImplementation((key: string) =>
      key === "x-forwarded-for" ? "203.0.113.5, 10.0.0.1" : null,
    );

    await submitGatePassword({}, formDataWith("anything"));

    expect(isGateAttemptAllowedMock).toHaveBeenCalledWith("203.0.113.5");
  });

  it("falls back to x-real-ip when x-forwarded-for is absent", async () => {
    headersGetMock.mockImplementation((key: string) => (key === "x-real-ip" ? "198.51.100.7" : null));

    await submitGatePassword({}, formDataWith("anything"));

    expect(isGateAttemptAllowedMock).toHaveBeenCalledWith("198.51.100.7");
  });

  it("falls back to 'unknown' when no IP header is present", async () => {
    await submitGatePassword({}, formDataWith("anything"));
    expect(isGateAttemptAllowedMock).toHaveBeenCalledWith("unknown");
  });
});

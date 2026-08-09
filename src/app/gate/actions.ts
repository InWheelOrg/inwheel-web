"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { isGateAttemptAllowed } from "@/lib/ratelimit";
import {
  createSessionCookieValue,
  isCorrectPagePassword,
  SESSION_COOKIE_NAME,
  SESSION_TTL_SECONDS,
} from "@/lib/session";

export type GateState = { error?: string };

async function clientIp(): Promise<string> {
  const h = await headers();
  const forwardedFor = h.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return h.get("x-real-ip") ?? "unknown";
}

export async function submitGatePassword(
  _prevState: GateState,
  formData: FormData,
): Promise<GateState> {
  if (!(await isGateAttemptAllowed(await clientIp()))) {
    return { error: "Trop de tentatives. Réessayez dans une minute." };
  }

  if (formData.get("acceptPrivacy") !== "on") {
    return { error: "Vous devez accepter la politique de confidentialité." };
  }

  const password = formData.get("password");
  if (typeof password !== "string" || password.length === 0) {
    return { error: "Mot de passe requis." };
  }
  if (!isCorrectPagePassword(password)) {
    return { error: "Mot de passe incorrect." };
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, await createSessionCookieValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });

  redirect("/");
}

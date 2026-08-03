"use server";

import { apiErrorMessage, apiFetch, apiKey } from "@/lib/api";

export type SubmitResult = { ok: true } | { ok: false; error: string };

export async function submitAccessibilityPatch(
  placeId: string,
  patch: Record<string, unknown>,
): Promise<SubmitResult> {
  const key = apiKey();
  if (!key) {
    return { ok: false, error: "Configuration serveur manquante." };
  }

  const res = await apiFetch(`/places/${placeId}/accessibility`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": key,
    },
    body: JSON.stringify(patch),
  });

  if (!res.ok) {
    return { ok: false, error: await apiErrorMessage(res) };
  }

  return { ok: true };
}

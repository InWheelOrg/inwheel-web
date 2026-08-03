import { notFound } from "next/navigation";
import { apiErrorMessage, apiFetch } from "@/lib/api";
import type { Place } from "@/lib/place-types";
import { AccessibilityForm } from "./AccessibilityForm";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function PlacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();

  const res = await apiFetch(`/places/${id}`, { cache: "no-store" });
  if (res.status === 404) notFound();
  if (!res.ok) throw new Error(await apiErrorMessage(res));

  const place: Place = await res.json();

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-1 flex-col gap-4 p-4">
      <h1 className="text-lg font-semibold">{place.name}</h1>
      <AccessibilityForm placeId={place.id} profile={place.accessibility ?? {}} />
    </main>
  );
}

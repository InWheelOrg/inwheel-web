import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { VEVEY } from "@/lib/city";
import { apiFetch } from "@/lib/api";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");

  const params = new URLSearchParams({
    lat: String(VEVEY.lat),
    lng: String(VEVEY.lng),
    radius: String(VEVEY.radius),
    limit: "20",
  });
  if (q) params.set("q", q);

  const res = await apiFetch(`/places?${params}`);
  const body = await res.text();
  return new NextResponse(body, {
    status: res.status,
    headers: { "content-type": "application/json" },
  });
}

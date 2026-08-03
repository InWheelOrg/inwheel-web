"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import type { Place, PlacePage } from "@/lib/place-types";

const CATEGORY_LABELS: Record<string, string> = {
  mall: "Centre commercial",
  airport: "Aéroport",
  train_station: "Gare",
  restaurant: "Restaurant",
  cafe: "Café",
  shop: "Commerce",
  toilet: "Toilettes",
  parking: "Parking",
  entrance: "Entrée",
  other: "Autre",
};

export function SearchBox() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Place[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const isEmpty = query.trim().length === 0;

  useEffect(() => {
    if (isEmpty) return;

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch(`/api/places?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("search failed");
        const page: PlacePage = await res.json();
        setResults(page.data);
      } catch {
        if (!controller.signal.aborted) setError(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query, isEmpty]);

  const visibleResults = isEmpty ? null : results;

  return (
    <div className="flex flex-col gap-3">
      <Input
        type="search"
        placeholder="Nom du lieu…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
      />

      {!isEmpty && !loading && error && (
        <p className="text-sm text-destructive">
          Erreur de recherche — réessayez.
        </p>
      )}

      {visibleResults !== null && !loading && !error && visibleResults.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Aucun lieu trouvé — essayez un autre nom.
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {visibleResults?.map((place) => (
          <li key={place.id}>
            <Link href={`/places/${place.id}`}>
              <Card size="sm">
                <CardContent className="flex items-center justify-between gap-2">
                  <span className="font-medium">{place.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {CATEGORY_LABELS[place.category] ?? place.category}
                  </span>
                </CardContent>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

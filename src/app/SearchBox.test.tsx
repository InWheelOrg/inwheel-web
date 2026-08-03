import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { SearchBox } from "./SearchBox";
import type { PlacePage } from "@/lib/place-types";

function jsonResponse(page: PlacePage): Response {
  return new Response(JSON.stringify(page), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

describe("SearchBox", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("fetches once, after the debounce, with the final typed query", async () => {
    const fetchMock = vi
      .spyOn(global, "fetch")
      .mockResolvedValue(jsonResponse({ data: [] }));

    render(<SearchBox />);
    const input = screen.getByPlaceholderText("Nom du lieu…");

    fireEvent.change(input, { target: { value: "g" } });
    fireEvent.change(input, { target: { value: "ga" } });
    fireEvent.change(input, { target: { value: "gare" } });

    expect(fetchMock).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(300);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/places?q=gare",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it("renders the empty state when a search returns no results", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(jsonResponse({ data: [] }));

    render(<SearchBox />);
    fireEvent.change(screen.getByPlaceholderText("Nom du lieu…"), {
      target: { value: "nonexistent" },
    });

    await vi.advanceTimersByTimeAsync(300);
    await vi.waitFor(() =>
      expect(screen.getByText("Aucun lieu trouvé — essayez un autre nom.")).toBeInTheDocument(),
    );
  });

  it("shows an error message and clears loading when the search request fails", async () => {
    vi.spyOn(global, "fetch").mockRejectedValue(new Error("network error"));

    render(<SearchBox />);
    fireEvent.change(screen.getByPlaceholderText("Nom du lieu…"), {
      target: { value: "gare" },
    });

    await vi.advanceTimersByTimeAsync(300);
    await vi.waitFor(() =>
      expect(screen.getByText("Erreur de recherche — réessayez.")).toBeInTheDocument(),
    );
  });

  it("does not show the empty state before any search", () => {
    render(<SearchBox />);
    expect(
      screen.queryByText("Aucun lieu trouvé — essayez un autre nom."),
    ).not.toBeInTheDocument();
  });
});

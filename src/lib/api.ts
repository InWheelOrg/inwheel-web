function apiBaseUrl(): string {
  const url = process.env.INWHEEL_API_URL;
  if (!url) throw new Error("INWHEEL_API_URL is not set");
  return url;
}

export function apiUrl(path: string): string {
  return `${apiBaseUrl()}${path}`;
}

export function apiKey(): string | undefined {
  return process.env.INWHEEL_API_KEY;
}

export function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(apiUrl(path), init);
}

export async function apiErrorMessage(res: Response): Promise<string> {
  const body = await res.json().catch(() => null);
  return body?.error ?? "Une erreur est survenue.";
}

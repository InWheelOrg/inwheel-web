import type { AccessibilitySection } from "@/lib/place-types";

export function buildSparsePatch(
  dirtyFields: Record<string, unknown>,
  values: Record<string, unknown>,
  nulledSections: readonly AccessibilitySection[],
): Record<string, unknown> {
  const patch = walk(dirtyFields, values);

  for (const section of nulledSections) {
    patch[section] = null;
  }

  return patch;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function walk(
  dirty: Record<string, unknown>,
  values: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};

  for (const [key, dirtyValue] of Object.entries(dirty)) {
    if (isPlainObject(dirtyValue)) {
      const nestedValues = isPlainObject(values[key]) ? values[key] : {};
      out[key] = walk(dirtyValue, nestedValues);
    } else if (dirtyValue === true) {
      out[key] = values[key];
    }
  }

  return out;
}

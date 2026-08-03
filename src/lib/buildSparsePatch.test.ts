import { describe, expect, it } from "vitest";
import { buildSparsePatch } from "@/lib/buildSparsePatch";

describe("buildSparsePatch", () => {
  it("returns an empty object when nothing is dirty", () => {
    expect(buildSparsePatch({}, {}, [])).toEqual({});
  });

  it("includes only the dirty leaf path, nested", () => {
    const dirtyFields = { entrance: { is_level: true } };
    const values = { entrance: { is_level: true, has_intercom: false } };

    expect(buildSparsePatch(dirtyFields, values, [])).toEqual({
      entrance: { is_level: true },
    });
  });

  it("includes multiple dirty leaves across different sections", () => {
    const dirtyFields = {
      entrance: { is_level: true },
      parking: { count: true },
    };
    const values = {
      entrance: { is_level: true, has_intercom: false },
      parking: { count: 3, has_disabled_spaces: true },
    };

    expect(buildSparsePatch(dirtyFields, values, [])).toEqual({
      entrance: { is_level: true },
      parking: { count: 3 },
    });
  });

  it("excludes a section that was populated at load but never touched this session", () => {
    const dirtyFields = { entrance: { is_level: true } };
    const values = {
      entrance: { is_level: true },
      parking: { count: 3, has_disabled_spaces: true },
    };

    expect(buildSparsePatch(dirtyFields, values, [])).toEqual({
      entrance: { is_level: true },
    });
  });

  it("forces a nulled section to null even when its fields are also dirty", () => {
    const dirtyFields = { entrance: { is_level: true } };
    const values = { entrance: { is_level: true } };

    expect(buildSparsePatch(dirtyFields, values, ["entrance"])).toEqual({
      entrance: null,
    });
  });

  it("nulls a section that has no dirty fields of its own", () => {
    expect(buildSparsePatch({}, {}, ["pathways"])).toEqual({ pathways: null });
  });

  it("nulls multiple sections independently of unrelated dirty fields", () => {
    const dirtyFields = { restroom: { is_accessible: true } };
    const values = { restroom: { is_accessible: true } };

    expect(
      buildSparsePatch(dirtyFields, values, ["entrance", "elevator"]),
    ).toEqual({
      restroom: { is_accessible: true },
      entrance: null,
      elevator: null,
    });
  });

  it("resolves doubly-nested dirty leaves (door.type inside entrance)", () => {
    const dirtyFields = { entrance: { door: { type: true } } };
    const values = { entrance: { door: { type: "automatic", width: "good" } } };

    expect(buildSparsePatch(dirtyFields, values, [])).toEqual({
      entrance: { door: { type: "automatic" } },
    });
  });

  it("passes through a dirty leaf cleared back to undefined as-is", () => {
    const dirtyFields = { entrance: { width: true } };
    const values = { entrance: { width: undefined } };

    expect(buildSparsePatch(dirtyFields, values, [])).toEqual({
      entrance: { width: undefined },
    });
  });
});

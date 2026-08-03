import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const { submitAccessibilityPatchMock, pushMock } = vi.hoisted(() => ({
  submitAccessibilityPatchMock: vi.fn(),
  pushMock: vi.fn(),
}));

vi.mock("./actions", () => ({
  submitAccessibilityPatch: submitAccessibilityPatchMock,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { AccessibilityForm } from "./AccessibilityForm";

describe("AccessibilityForm", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("touching one field only includes that field in the submitted patch", async () => {
    submitAccessibilityPatchMock.mockResolvedValue({ ok: true });
    const user = userEvent.setup();

    render(<AccessibilityForm placeId="place-1" profile={{}} />);

    // "De plain-pied" (entrance.is_level) is the first "Oui" toggle rendered.
    await user.click(screen.getAllByRole("button", { name: "Oui" })[0]);
    await user.click(screen.getByRole("button", { name: "Enregistrer" }));

    expect(submitAccessibilityPatchMock).toHaveBeenCalledTimes(1);
    const [placeId, patch] = submitAccessibilityPatchMock.mock.calls[0];
    expect(placeId).toBe("place-1");
    expect(patch).toEqual({ entrance: { is_level: true } });
  });

  it("excludes an already-populated section that wasn't touched this session", async () => {
    submitAccessibilityPatchMock.mockResolvedValue({ ok: true });
    const user = userEvent.setup();

    render(
      <AccessibilityForm
        placeId="place-1"
        profile={{ parking: { count: 3, has_disabled_spaces: true } }}
      />,
    );

    await user.click(screen.getAllByRole("button", { name: "Oui" })[0]);
    await user.click(screen.getByRole("button", { name: "Enregistrer" }));

    expect(submitAccessibilityPatchMock).toHaveBeenCalledTimes(1);
    const [, patch] = submitAccessibilityPatchMock.mock.calls[0];
    expect(patch).toEqual({ entrance: { is_level: true } });
  });

  it("marking a section as doesn't apply nulls it in the submitted patch, even with untouched fields", async () => {
    submitAccessibilityPatchMock.mockResolvedValue({ ok: true });
    const user = userEvent.setup();

    render(<AccessibilityForm placeId="place-1" profile={{}} />);

    await user.click(screen.getByLabelText("Ne s'applique pas", { selector: "#entrance-na" }));
    await user.click(screen.getByRole("button", { name: "Enregistrer" }));

    expect(submitAccessibilityPatchMock).toHaveBeenCalledTimes(1);
    const [, patch] = submitAccessibilityPatchMock.mock.calls[0];
    expect(patch).toEqual({ entrance: null });
  });
});

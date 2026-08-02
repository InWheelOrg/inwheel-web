import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const { submitGatePasswordMock } = vi.hoisted(() => ({
  submitGatePasswordMock: vi.fn(),
}));

vi.mock("./actions", () => ({
  submitGatePassword: submitGatePasswordMock,
}));

import GatePage from "./page";

describe("GatePage", () => {
  it("renders a password field and submit button", () => {
    render(<GatePage />);
    expect(screen.getByLabelText("Mot de passe")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Entrer" })).toBeInTheDocument();
  });

  it("shows the error returned by the action after a failed submit", async () => {
    submitGatePasswordMock.mockResolvedValue({ error: "Mot de passe incorrect." });
    const user = userEvent.setup();

    render(<GatePage />);
    await user.type(screen.getByLabelText("Mot de passe"), "wrong-password");
    await user.click(screen.getByRole("button", { name: "Entrer" }));

    expect(await screen.findByText("Mot de passe incorrect.")).toBeInTheDocument();
  });

  it("does not show an error before any submission", () => {
    render(<GatePage />);
    expect(screen.queryByText(/incorrect|requis|tentatives/)).not.toBeInTheDocument();
  });
});

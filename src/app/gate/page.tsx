"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitGatePassword, type GateState } from "./actions";

const initialState: GateState = {};

export default function GatePage() {
  const [state, formAction, pending] = useActionState(submitGatePassword, initialState);

  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <form action={formAction} className="w-full max-w-sm space-y-4">
        <h1 className="text-lg font-semibold">InWheel</h1>
        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe</Label>
          <Input
            id="password"
            type="password"
            name="password"
            autoFocus
            required
          />
        </div>
        {state.error && <p className="text-sm text-destructive">{state.error}</p>}
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "…" : "Entrer"}
        </Button>
      </form>
    </main>
  );
}

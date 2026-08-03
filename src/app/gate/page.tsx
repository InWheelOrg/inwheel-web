"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitGatePassword, type GateState } from "./actions";

const initialState: GateState = {};

export default function GatePage() {
  const [state, formAction, pending] = useActionState(submitGatePassword, initialState);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

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
        <div className="flex items-start gap-2">
          <Checkbox
            id="acceptPrivacy"
            name="acceptPrivacy"
            required
            checked={acceptedPrivacy}
            onCheckedChange={(checked) => setAcceptedPrivacy(checked === true)}
          />
          <Label htmlFor="acceptPrivacy" className="text-sm font-normal">
            J&apos;ai lu et j&apos;accepte la{" "}
            <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline">
              politique de confidentialité
            </a>
            .
          </Label>
        </div>
        {state.error && <p className="text-sm text-destructive">{state.error}</p>}
        <Button type="submit" disabled={pending || !acceptedPrivacy} className="w-full">
          {pending ? "…" : "Entrer"}
        </Button>
      </form>
    </main>
  );
}

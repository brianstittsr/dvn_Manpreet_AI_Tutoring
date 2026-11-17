"use client";

import { Button } from "@/components/ui/button";

export default function MechanixDesignError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--mx-bg)] p-6">
      <div className="max-w-md rounded-xl border border-[var(--mx-border)] bg-[var(--mx-card)] p-8 text-center shadow-[0_1px_2px_rgba(15,61,46,0.05)]">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--mx-primary)]">Concept preview error</p>
        <h1 className="mt-2 text-2xl font-bold text-[var(--mx-text)]">The workspace could not load.</h1>
        <p className="mt-3 text-sm text-[var(--mx-muted)]">
          Please retry. This public concept uses illustrative data only — no live accounts or market feeds.
        </p>
        <Button className="mt-6 bg-[var(--mx-primary)] text-white hover:bg-[var(--mx-deep)]" onClick={reset}>
          Try again
        </Button>
      </div>
    </main>
  );
}

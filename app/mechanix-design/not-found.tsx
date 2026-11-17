import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function MechanixDesignNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--mx-bg)] p-6">
      <div className="max-w-md rounded-xl border border-[var(--mx-border)] bg-[var(--mx-card)] p-8 text-center shadow-[0_1px_2px_rgba(15,61,46,0.05)]">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--mx-primary)]">MechaniX concept</p>
        <h1 className="mt-2 text-2xl font-bold text-[var(--mx-text)]">View not found</h1>
        <p className="mt-3 text-sm text-[var(--mx-muted)]">
          The requested view is not part of this public concept workspace.
        </p>
        <Button asChild className="mt-6 bg-[var(--mx-primary)] text-white hover:bg-[var(--mx-deep)]">
          <Link href="/mechanix-design/practice">Open the practice workspace</Link>
        </Button>
      </div>
    </main>
  );
}

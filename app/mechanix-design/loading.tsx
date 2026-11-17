export default function MechanixDesignLoading() {
  return (
    <div className="flex h-dvh flex-col bg-[var(--mx-bg)]">
      <div className="h-14 shrink-0 border-b border-[var(--mx-border)] bg-[var(--mx-card)]" />
      <div className="flex min-h-0 flex-1">
        <div className="hidden w-[248px] shrink-0 animate-pulse border-r border-[var(--mx-border)] bg-[var(--mx-card)] lg:block" />
        <div className="flex-1 p-3">
          <div className="h-full animate-pulse rounded-xl border border-[var(--mx-border)] bg-[var(--mx-card)]" />
        </div>
        <div className="hidden w-[300px] shrink-0 animate-pulse border-l border-[var(--mx-border)] bg-[var(--mx-card)] xl:block" />
      </div>
    </div>
  );
}

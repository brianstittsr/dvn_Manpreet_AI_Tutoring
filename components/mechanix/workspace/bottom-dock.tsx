"use client";

import { useState } from "react";
import { BookmarkPlus, ChevronDown, ChevronUp, Search, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { TRENDING } from "@/components/mechanix/workspace/mock-data";
import { useMechanix } from "@/components/mechanix/workspace/store";

const FILTERS = ["All", "Chart Analysis", "Learning Questions", "Trade Planning"];

export function CommunityDock() {
  const filter = useMechanix((s) => s.communityFilter);
  const setFilter = useMechanix((s) => s.setCommunityFilter);
  const open = useMechanix((s) => s.dockOpen);
  const setOpen = useMechanix((s) => s.setDockOpen);
  const allPosts = useMechanix((s) => s.posts);
  const addPost = useMechanix((s) => s.addPost);
  const [query, setQuery] = useState("");
  const [newPost, setNewPost] = useState(false);
  const [npTitle, setNpTitle] = useState("");
  const [npBody, setNpBody] = useState("");

  const posts = allPosts.filter(
    (p) => (filter === "All" || p.tag === filter || (filter === "Learning Questions" && p.tag === "Learning Question")) &&
      (query === "" || p.title.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <section aria-label="Community Discussion" className="shrink-0 rounded-xl border border-[var(--mx-border)] bg-[var(--mx-card)] shadow-[0_1px_2px_rgba(15,61,46,0.05)]">
      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--mx-border)] px-3 py-2">
        <h2 className="flex items-center gap-1.5 text-[13px] font-bold text-[var(--mx-text)]">
          <span className="text-base">💬</span> Community Discussion
        </h2>
        <div className="flex gap-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px] font-medium transition-colors",
                filter === f ? "bg-[var(--mx-primary)] text-white" : "bg-[var(--mx-bg)] text-[var(--mx-muted)] hover:bg-[var(--mx-hover)]"
              )}
            >{f}</button>
          ))}
        </div>
        <div className="flex-1" />
        <label className="flex items-center gap-1.5 rounded-lg border border-[var(--mx-border)] px-2 py-1">
          <Search className="h-3 w-3 text-[var(--mx-faint)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search discussions…"
            aria-label="Search discussions"
            className="w-36 bg-transparent text-[11px] outline-none"
          />
        </label>
        <Button size="sm" onClick={() => setNewPost(true)} className="h-7 bg-[var(--mx-primary)] text-[11px] text-white hover:bg-[var(--mx-deep)]">+ New Post</Button>
        <button aria-label={open ? "Collapse community dock" : "Expand community dock"} onClick={() => setOpen(!open)}
          className="rounded-md p-1 text-[var(--mx-faint)] hover:bg-[var(--mx-hover)]">
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </button>
      </div>

      {open && (
        <div className="grid gap-2 p-3 md:grid-cols-[1fr_220px]">
          <div className="grid gap-2 sm:grid-cols-2">
            {posts.slice(0, 4).map((p) => (
              <article key={p.id} className="flex gap-2.5 rounded-xl border border-[var(--mx-border)] p-2.5 transition-shadow hover:shadow-sm">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--mx-active-bg)] text-[10px] font-bold text-[var(--mx-primary)]">{p.initials}</span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 text-[11px] text-[var(--mx-muted)]">
                    <b className="text-[var(--mx-text)]">{p.author}</b> · {p.time}
                    <span className="rounded bg-amber-50 px-1 text-[9px] font-semibold text-amber-700">{p.tag}</span>
                  </p>
                  <p className="truncate text-[12px] font-semibold text-[var(--mx-text)]">{p.title}</p>
                  <p className="line-clamp-2 text-[11px] text-[var(--mx-muted)]">{p.excerpt}</p>
                  <p className="mt-1 flex gap-3 text-[10px] text-[var(--mx-faint)]">♥ {p.likes} · 💬 {p.replies}</p>
                </div>
                {p.chart && <MiniThumb />}
              </article>
            ))}
          </div>
          <aside className="rounded-xl border border-[var(--mx-border)] p-2.5">
            <p className="mb-1.5 text-[11px] font-bold text-[var(--mx-text)]">Trending in Community</p>
            {TRENDING.map((t) => (
              <div key={t.title} className="flex items-center justify-between py-1 text-[11px]">
                <span className="flex items-center gap-1 text-[var(--mx-muted)]"><TrendingUp className="h-3 w-3 text-[var(--mx-accent)]" />{t.title}</span>
                <span className="rounded-full bg-[var(--mx-bg)] px-1.5 text-[9px] font-bold text-[var(--mx-muted)]">{t.count}</span>
              </div>
            ))}
          </aside>
        </div>
      )}

      <Dialog open={newPost} onOpenChange={setNewPost}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>New discussion post</DialogTitle></DialogHeader>
          <input
            value={npTitle}
            onChange={(e) => setNpTitle(e.target.value)}
            placeholder="Title"
            aria-label="Post title"
            className="rounded-lg border border-[var(--mx-border)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--mx-accent)]/40"
          />
          <textarea
            value={npBody}
            onChange={(e) => setNpBody(e.target.value)}
            placeholder="Share your chart read or question…"
            aria-label="Post body"
            rows={4}
            className="rounded-lg border border-[var(--mx-border)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--mx-accent)]/40"
          />
          <Button
            onClick={() => {
              if (!npTitle.trim() || !npBody.trim()) {
                toast.error("Add a title and a body first.");
                return;
              }
              addPost({ title: npTitle.trim(), tag: "Chart Analysis", body: npBody.trim() });
              setNpTitle(""); setNpBody(""); setNewPost(false);
              toast.success("Posted to Community — see Discussions.");
            }}
            className="bg-[var(--mx-primary)] text-white hover:bg-[var(--mx-deep)]"
          >Post to Community</Button>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function MiniThumb() {
  return (
    <div className="relative hidden h-16 w-24 shrink-0 overflow-hidden rounded-lg border border-[var(--mx-border)] bg-[var(--mx-bg)] sm:block" aria-hidden>
      <svg viewBox="0 0 96 64" className="h-full w-full">
        {Array.from({ length: 14 }, (_, i) => {
          const x = 4 + i * 6.4;
          const up = i % 3 !== 0;
          const y = 40 - i * 1.6 + (up ? -6 : 4);
          return <rect key={i} x={x} y={Math.min(y, 52)} width={3.5} height={Math.abs(8 + (i % 4) * 3)} fill={up ? "#22A06B" : "#E5484D"} rx={0.5} />;
        })}
        <rect x={0} y={8} width={96} height={12} fill="#E5484D" opacity={0.15} />
        <rect x={0} y={48} width={96} height={10} fill="#22A06B" opacity={0.15} />
      </svg>
      <BookmarkPlus className="absolute right-1 top-1 h-3 w-3 text-[var(--mx-faint)]" />
    </div>
  );
}

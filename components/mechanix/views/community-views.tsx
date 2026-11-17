"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowBigDown, ArrowBigUp, ArrowLeft, Bell, BellOff, Copy, CornerUpLeft, Eye,
  Flag, Hash, ImagePlus, LineChart, MessageSquare, MoreHorizontal, Pin, Plus,
  Search, Send, Smile, Users, X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useMechanix, type ChatMessage } from "@/components/mechanix/workspace/store";
import { CHAT_CHANNELS, type DiscussionComment, type Post } from "@/components/mechanix/workspace/mock-data";

const NO_MESSAGES: ChatMessage[] = [];
const QUICK_REACTIONS = ["👍", "🔥", "💡", "😂"] as const;
const EMOJI_GRID = [
  "😀", "😂", "😉", "😍", "🤔", "😅", "🙌", "👀",
  "👍", "👎", "🔥", "💡", "🎯", "📈", "📉", "💪",
  "✅", "❌", "🚀", "💰", "📚", "⭐", "🏆", "🧠",
] as const;

/** Theme-agnostic name hues — deterministic pick per author. */
const AUTHOR_COLORS = ["#1D7A4F", "#B45309", "#2563EB", "#7C3AED", "#C2410C", "#0E7490"] as const;

interface CommunityMember {
  name: string;
  role?: "coach";
  presence: "online" | "idle" | "offline";
  status?: string;
}
const MEMBERS: CommunityMember[] = [
  { name: "Coach Dev", role: "coach", presence: "online", status: "Reviewing markups" },
  { name: "Coach Lena", role: "coach", presence: "idle", status: "In lesson 4" },
  { name: "Maya R.", presence: "online", status: "Trading NQ" },
  { name: "Andre K.", presence: "online", status: "Trading NQ" },
  { name: "You", presence: "online", status: "In lesson 4" },
  { name: "Priya S.", presence: "online" },
  { name: "Leo M.", presence: "idle" },
  { name: "Dre W.", presence: "offline" },
  { name: "Sam T.", presence: "offline" },
];

function authorColor(name: string): string {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return AUTHOR_COLORS[h % AUTHOR_COLORS.length];
}
function nameInitials(name: string): string {
  return name.split(" ").map((w) => w[0] ?? "").join("").slice(0, 2).toUpperCase();
}
function nowTime(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

const HEADER_ICON_BTN =
  "rounded-md p-2 text-[var(--mx-muted)] transition-colors hover:bg-[var(--mx-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mx-accent)]/40";

export function CommunityView() {
  const chatChannel = useMechanix((s) => s.chatChannel);
  const messages = useMechanix((s) => s.chat[s.chatChannel] ?? NO_MESSAGES);
  const addChat = useMechanix((s) => s.addChat);
  const toggleReaction = useMechanix((s) => s.toggleReaction);
  const pinMessage = useMechanix((s) => s.pinMessage);
  const symbol = useMechanix((s) => s.symbol);
  const timeframe = useMechanix((s) => s.timeframe);
  const channel = CHAT_CHANNELS.find((c) => c.id === chatChannel) ?? CHAT_CHANNELS[0];

  const [input, setInput] = useState("");
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [typing, setTyping] = useState(false);
  const [muted, setMuted] = useState(false);
  const [membersOpen, setMembersOpen] = useState(true);
  const [searchQ, setSearchQ] = useState("");
  const [highlight, setHighlight] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const idCounter = useRef(0);
  const replyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hlTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [messages.length, typing]);

  // Reset per-channel UI state when switching channels (adjust-during-render pattern).
  const [prevChannel, setPrevChannel] = useState(chatChannel);
  if (prevChannel !== chatChannel) {
    setPrevChannel(chatChannel);
    setReplyTo(null);
    setSearchQ("");
    setTyping(false);
  }

  useEffect(
    () => () => {
      if (replyTimer.current) clearTimeout(replyTimer.current);
      if (hlTimer.current) clearTimeout(hlTimer.current);
    },
    []
  );

  const send = (chart = false) => {
    const t = input.trim();
    if (!t && !chart) return;
    const channelId = channel.id;
    addChat(channelId, {
      id: `m${++idCounter.current}`,
      author: "You",
      text: t || `${symbol} · ${timeframe} chart snapshot`,
      mine: true,
      day: "Today",
      time: nowTime(),
      chart,
      replyTo: replyTo ? { author: replyTo.author, text: replyTo.text } : undefined,
    });
    setInput("");
    setReplyTo(null);
    setTyping(true);
    if (replyTimer.current) clearTimeout(replyTimer.current);
    replyTimer.current = setTimeout(() => {
      addChat(channelId, {
        id: `m${++idCounter.current}`,
        author: "Coach Dev",
        role: "COACH",
        text: "Nice — attach the chart next time so we can see the zone you mean.",
        day: "Today",
        time: nowTime(),
      });
      setTyping(false);
    }, 1600);
  };

  const jumpTo = (id: string) => {
    document.getElementById(`msg-${id}`)?.scrollIntoView({ block: "center", behavior: "smooth" });
    setHighlight(id);
    if (hlTimer.current) clearTimeout(hlTimer.current);
    hlTimer.current = setTimeout(() => setHighlight(null), 1600);
  };

  const query = searchQ.trim().toLowerCase();
  const results =
    query === ""
      ? []
      : messages.filter((m) => `${m.author} ${m.text}`.toLowerCase().includes(query));
  const pinned = messages.filter((m) => m.pinned);

  // Discord-style grouping: consecutive same-author rows collapse into compact rows.
  const rows: { m: ChatMessage; newDay: boolean; grouped: boolean }[] = [];
  let prevDay: string | undefined;
  let prevAuthor: string | undefined;
  for (const m of messages) {
    const newDay = m.day !== prevDay;
    const grouped = !newDay && m.author === prevAuthor && !m.replyTo;
    rows.push({ m, newDay, grouped });
    prevDay = m.day;
    prevAuthor = m.author;
  }

  return (
    <div className="flex h-full" data-testid="view-community">
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Channel header */}
        <header className="flex items-center gap-2 border-b border-[var(--mx-border)] bg-[var(--mx-card)] px-4 py-2.5">
          <Hash className="h-4 w-4 shrink-0 text-[var(--mx-faint)]" aria-hidden />
          <h1 className="text-[15px] font-bold text-[var(--mx-text)]" data-testid="channel-name">{channel.id}</h1>
          <span className="hidden min-w-0 items-center gap-2 text-[12px] text-[var(--mx-muted)] md:flex">
            <span className="h-4 w-px shrink-0 bg-[var(--mx-border)]" aria-hidden />
            <span className="truncate" data-testid="channel-topic">Topic: {channel.topic}</span>
          </span>
          <div className="ml-auto flex items-center gap-0.5">
            <Popover>
              <PopoverTrigger asChild>
                <button aria-label="Pinned messages" className={HEADER_ICON_BTN}><Pin className="h-4 w-4" /></button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 border-[var(--mx-border)] bg-[var(--mx-card)] p-0 text-[var(--mx-text)]">
                <p className="border-b border-[var(--mx-border)] px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--mx-faint)]">
                  Pinned messages
                </p>
                {pinned.length === 0 ? (
                  <p className="p-3 text-[12px] text-[var(--mx-muted)]">Nothing pinned in #{channel.id} yet.</p>
                ) : (
                  pinned.map((m) => (
                    <div key={m.id} className="border-b border-[var(--mx-bg)] px-3 py-2 last:border-0">
                      <p className="text-[11px] font-semibold" style={{ color: authorColor(m.author) }}>
                        {m.author}
                        <span className="ml-1.5 font-normal text-[var(--mx-faint)]">{m.day} {m.time}</span>
                      </p>
                      <p className="mt-0.5 text-[12px] leading-snug text-[var(--mx-text)]">{m.text}</p>
                    </div>
                  ))
                )}
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <button aria-label="Search messages" className={HEADER_ICON_BTN}><Search className="h-4 w-4" /></button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 border-[var(--mx-border)] bg-[var(--mx-card)] p-2 text-[var(--mx-text)]">
                <input
                  autoFocus
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  placeholder={`Search #${channel.id}`}
                  aria-label="Search messages in channel"
                  className="w-full rounded-md border border-[var(--mx-border)] bg-[var(--mx-bg)] px-2.5 py-1.5 text-[12px] text-[var(--mx-text)] outline-none focus:ring-2 focus:ring-[var(--mx-accent)]/40"
                />
                <div className="mt-2 max-h-56 overflow-y-auto" data-testid="search-results">
                  {query === "" ? (
                    <p className="px-1 py-2 text-[11px] text-[var(--mx-faint)]">Type to filter messages in this channel.</p>
                  ) : results.length === 0 ? (
                    <p className="px-1 py-2 text-[11px] text-[var(--mx-faint)]">No matches.</p>
                  ) : (
                    results.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => jumpTo(m.id)}
                        className="block w-full rounded-md px-2 py-1.5 text-left hover:bg-[var(--mx-hover)]"
                      >
                        <span className="text-[11px] font-semibold text-[var(--mx-muted)]">{m.author}</span>
                        <span className="block truncate text-[12px] text-[var(--mx-text)]">{m.text}</span>
                      </button>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>
            <button
              aria-label={muted ? "Unmute channel" : "Mute channel"}
              aria-pressed={muted}
              onClick={() => {
                const next = !muted;
                setMuted(next);
                toast.success(next ? `Muted #${channel.id}` : `Unmuted #${channel.id}`, {
                  description: "Notification preference only — concept prototype.",
                });
              }}
              className={HEADER_ICON_BTN}
            >
              {muted ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
            </button>
            <button
              aria-label="Toggle member list"
              aria-pressed={membersOpen}
              onClick={() => setMembersOpen((v) => !v)}
              className={cn(HEADER_ICON_BTN, membersOpen && "text-[var(--mx-primary)]")}
            >
              <Users className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Message list */}
        <div className="min-h-0 flex-1 overflow-y-auto py-2" aria-live="polite" data-testid="message-list">
          {rows.map(({ m, newDay, grouped }) => (
            <div key={m.id}>
              {newDay && (
                <div className="my-3 flex items-center gap-3 px-4" role="separator" aria-label={m.day}>
                  <span className="h-px flex-1 bg-[var(--mx-border)]" />
                  <span className="rounded-full border border-[var(--mx-border)] bg-[var(--mx-bg)] px-2.5 py-0.5 text-[10px] font-semibold text-[var(--mx-muted)]">
                    {m.day}
                  </span>
                  <span className="h-px flex-1 bg-[var(--mx-border)]" />
                </div>
              )}
              <div
                id={`msg-${m.id}`}
                data-testid="msg-row"
                data-author={m.author}
                className={cn(
                  "group relative px-4 transition-colors hover:bg-[var(--mx-hover)]/50",
                  grouped ? "py-0.5" : "mt-1 py-1",
                  highlight === m.id && "bg-[var(--mx-active-bg)]"
                )}
              >
                <div className="flex gap-3">
                  {grouped ? (
                    <span className="w-9 shrink-0 pt-0.5 text-right text-[9px] tabular-nums text-[var(--mx-faint)] opacity-0 transition-opacity group-hover:opacity-100">
                      {m.time}
                    </span>
                  ) : (
                    <span
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                        m.mine ? "bg-[var(--mx-deep)] text-white" : "bg-[var(--mx-active-bg)]"
                      )}
                      style={m.mine ? undefined : { color: authorColor(m.author) }}
                    >
                      {nameInitials(m.author)}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    {m.replyTo && (
                      <p className="mb-0.5 flex items-center gap-1.5 text-[11px] text-[var(--mx-faint)]">
                        <CornerUpLeft className="h-3 w-3 shrink-0" aria-hidden />
                        <span className="font-semibold text-[var(--mx-muted)]">@{m.replyTo.author}</span>
                        <span className="truncate italic">{m.replyTo.text}</span>
                      </p>
                    )}
                    {!grouped && (
                      <p className="flex items-baseline gap-1.5">
                        <span
                          className="text-[13px] font-semibold"
                          style={{ color: m.mine ? "var(--mx-primary)" : authorColor(m.author) }}
                        >
                          {m.author}
                        </span>
                        {m.role === "COACH" && (
                          <span className="rounded bg-[var(--mx-primary)] px-1 py-px text-[8px] font-bold tracking-wide text-white">
                            COACH
                          </span>
                        )}
                        <span className="text-[10px] text-[var(--mx-faint)]">{m.day} at {m.time}</span>
                        {m.pinned && <Pin className="h-2.5 w-2.5 self-center text-[var(--mx-faint)]" aria-label="Pinned" />}
                      </p>
                    )}
                    <p className="text-[13px] leading-snug text-[var(--mx-text)]">{m.text}</p>
                    {m.chart && <ChartAttachment />}
                    {(m.reactions?.length ?? 0) > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {(m.reactions ?? []).map((r) => (
                          <button
                            key={r.emoji}
                            onClick={() => toggleReaction(channel.id, m.id, r.emoji)}
                            aria-label={`React ${r.emoji} (${r.count})`}
                            aria-pressed={!!r.mine}
                            className={cn(
                              "flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[11px] transition-colors",
                              r.mine
                                ? "border-[var(--mx-active-border)] bg-[var(--mx-active-bg)] text-[var(--mx-primary)]"
                                : "border-[var(--mx-border)] bg-[var(--mx-card)] text-[var(--mx-muted)] hover:border-[var(--mx-active-border)]"
                            )}
                          >
                            {r.emoji}
                            <span className="font-semibold tabular-nums">{r.count}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {/* Hover action bar */}
                <div className="absolute -top-3.5 right-3 hidden items-center gap-0.5 rounded-lg border border-[var(--mx-border)] bg-[var(--mx-card)] p-0.5 shadow-sm group-hover:flex">
                  {QUICK_REACTIONS.map((e) => (
                    <button
                      key={e}
                      aria-label={`Quick react ${e}`}
                      onClick={() => toggleReaction(channel.id, m.id, e)}
                      className="rounded px-1 py-0.5 text-[13px] leading-none hover:bg-[var(--mx-hover)]"
                    >
                      {e}
                    </button>
                  ))}
                  <button
                    aria-label={`Reply to ${m.author}`}
                    onClick={() => setReplyTo(m)}
                    className="rounded p-1 text-[var(--mx-muted)] hover:bg-[var(--mx-hover)]"
                  >
                    <CornerUpLeft className="h-3.5 w-3.5" />
                  </button>
                  <button
                    aria-label={m.pinned ? "Unpin message" : "Pin message"}
                    onClick={() => {
                      pinMessage(channel.id, m.id);
                      toast.success(m.pinned ? "Message unpinned" : "Message pinned");
                    }}
                    className="rounded p-1 text-[var(--mx-muted)] hover:bg-[var(--mx-hover)]"
                  >
                    <Pin className="h-3.5 w-3.5" />
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        aria-label="More message actions"
                        className="rounded p-1 text-[var(--mx-muted)] hover:bg-[var(--mx-hover)]"
                      >
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="border-[var(--mx-border)] bg-[var(--mx-card)] text-[var(--mx-text)]">
                      <DropdownMenuItem
                        onSelect={() => {
                          void navigator.clipboard?.writeText(m.text);
                          toast.success("Copied to clipboard");
                        }}
                      >
                        <Copy className="mr-2 h-3.5 w-3.5" />Copy text
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => toast.success("Reported to coaches — concept only.")}
                      >
                        <Flag className="mr-2 h-3.5 w-3.5" />Report
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))}
          {typing && (
            <p className="px-4 py-1.5 text-[11px] italic text-[var(--mx-faint)]" data-testid="typing-indicator">
              Coach Dev is typing…
            </p>
          )}
          <div ref={endRef} />
        </div>

        {/* Composer */}
        <footer className="border-t border-[var(--mx-border)] bg-[var(--mx-card)] px-4 py-3">
          {replyTo && (
            <div className="mb-2 flex items-center gap-2 rounded-lg bg-[var(--mx-bg)] px-3 py-1.5 text-[12px] text-[var(--mx-muted)]" data-testid="reply-bar">
              <CornerUpLeft className="h-3 w-3 shrink-0" aria-hidden />
              <span className="min-w-0 truncate">Replying to <b className="text-[var(--mx-text)]">@{replyTo.author}</b></span>
              <button
                aria-label="Cancel reply"
                onClick={() => setReplyTo(null)}
                className="ml-auto shrink-0 rounded p-0.5 text-[var(--mx-faint)] hover:bg-[var(--mx-hover)]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label="Attach"
                  className="shrink-0 rounded-full bg-[var(--mx-hover)] p-1.5 text-[var(--mx-muted)] transition-colors hover:bg-[var(--mx-active-bg)] hover:text-[var(--mx-primary)]"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" side="top" className="border-[var(--mx-border)] bg-[var(--mx-card)] text-[var(--mx-text)]">
                <DropdownMenuItem onSelect={() => send(true)}>
                  <LineChart className="mr-2 h-3.5 w-3.5" />Attach chart
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => toast.info("File uploads aren't enabled in this concept prototype.")}
                >
                  <ImagePlus className="mr-2 h-3.5 w-3.5" />Upload file
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <input
              aria-label={`Message #${channel.id}`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") send();
                if (e.key === "Escape") setReplyTo(null);
              }}
              placeholder={`Message #${channel.id}`}
              className="min-w-0 flex-1 rounded-lg border border-[var(--mx-border)] bg-[var(--mx-bg)] px-3 py-2 text-[13px] text-[var(--mx-text)] outline-none focus:ring-2 focus:ring-[var(--mx-accent)]/40"
            />
            <Popover>
              <PopoverTrigger asChild>
                <button aria-label="Add emoji" className="shrink-0 rounded-md p-2 text-[var(--mx-faint)] hover:bg-[var(--mx-hover)]">
                  <Smile className="h-4 w-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" side="top" className="w-64 border-[var(--mx-border)] bg-[var(--mx-card)] p-2">
                <div className="grid grid-cols-8 gap-0.5">
                  {EMOJI_GRID.map((e) => (
                    <button
                      key={e}
                      aria-label={`Insert emoji ${e}`}
                      onClick={() => setInput((v) => v + e)}
                      className="rounded p-1 text-center text-[15px] leading-none hover:bg-[var(--mx-hover)]"
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            <Button
              onClick={() => send()}
              aria-label="Send message"
              className="shrink-0 bg-[var(--mx-primary)] text-white hover:bg-[var(--mx-deep)]"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </footer>
      </div>

      {/* Member column */}
      {membersOpen && (
        <aside
          aria-label="Channel members"
          data-testid="member-column"
          className="w-[200px] shrink-0 overflow-y-auto border-l border-[var(--mx-border)] bg-[var(--mx-card)] p-3"
        >
          <MemberGroup title="Coaches" members={MEMBERS.filter((m) => m.role === "coach")} />
          <MemberGroup title="Online" members={MEMBERS.filter((m) => !m.role && m.presence !== "offline")} />
          <MemberGroup title="Offline" members={MEMBERS.filter((m) => !m.role && m.presence === "offline")} />
        </aside>
      )}
    </div>
  );
}

function MemberGroup({ title, members }: { title: string; members: CommunityMember[] }) {
  if (members.length === 0) return null;
  return (
    <div className="mb-3">
      <p className="px-1 pb-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--mx-faint)]">
        {title} — {members.length}
      </p>
      {members.map((m) => (
        <div
          key={m.name}
          className={cn(
            "flex items-center gap-2 rounded-md px-1.5 py-1.5 hover:bg-[var(--mx-hover)]",
            m.presence === "offline" && "opacity-50"
          )}
        >
          <span
            className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--mx-active-bg)] text-[10px] font-bold"
            style={{ color: authorColor(m.name) }}
          >
            {nameInitials(m.name)}
            <span
              className={cn(
                "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[var(--mx-card)]",
                m.presence === "online" && "bg-[var(--mx-up)]",
                m.presence === "idle" && "bg-amber-500",
                m.presence === "offline" && "bg-[var(--mx-faint)]"
              )}
              aria-label={m.presence}
            />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[12px] font-medium text-[var(--mx-text)]">{m.name}</span>
            {m.status && <span className="block truncate text-[10px] text-[var(--mx-faint)]">{m.status}</span>}
          </span>
        </div>
      ))}
    </div>
  );
}

function ChartAttachment() {
  return (
    <div className="mt-1.5 rounded-lg border border-[var(--mx-border)] bg-[var(--mx-card)] p-1">
      <svg viewBox="0 0 160 60" className="h-14 w-full" aria-hidden>
        {Array.from({ length: 20 }, (_, i) => {
          const up = i % 3 !== 0;
          return <rect key={i} x={4 + i * 7.6} y={30 - i * 0.8 + (up ? -5 : 5)} width={4} height={10 + (i % 4) * 4} fill={up ? "#22A06B" : "#E5484D"} rx={0.5} />;
        })}
        <rect x={0} y={44} width={160} height={10} fill="#22A06B" opacity={0.15} />
      </svg>
    </div>
  );
}

/* ------------------------------ Discussions ------------------------------ */

const DISCUSSION_TAGS = ["All", "Chart Analysis", "Learning Question", "Trade Planning"] as const;
const DISCUSSION_SORTS = [
  { id: "top", label: "Top" },
  { id: "newest", label: "Newest" },
  { id: "replies", label: "Most replies" },
] as const;
type DiscussionSort = (typeof DISCUSSION_SORTS)[number]["id"];
const POST_TAGS = ["Chart Analysis", "Learning Question", "Trade Planning"] as const;

/** Tag filter match — also accepts the dock's legacy "Learning Questions" label. */
function matchesTag(tag: string, filter: string): boolean {
  return filter === "All" || tag === filter || (filter === "Learning Questions" && tag === "Learning Question");
}

function CoachBadge() {
  return (
    <span className="rounded bg-[var(--mx-primary)] px-1 py-px text-[8px] font-bold tracking-wide text-white">
      COACH
    </span>
  );
}

function VoteColumn({ score, title, onVote }: { score: number; title: string; onVote: (dir: 1 | -1) => void }) {
  return (
    <div className="flex w-12 shrink-0 flex-col items-center justify-start gap-0.5 border-r border-[var(--mx-border)] bg-[var(--mx-bg)] py-3">
      <button
        aria-label={`Upvote "${title}"`}
        onClick={() => onVote(1)}
        className="rounded-md p-1 text-[var(--mx-faint)] transition-colors hover:bg-[var(--mx-active-bg)] hover:text-[var(--mx-primary)]"
      >
        <ArrowBigUp className="h-4 w-4" />
      </button>
      <span className="text-[12px] font-bold tabular-nums text-[var(--mx-text)]" data-testid="post-score">{score}</span>
      <button
        aria-label={`Downvote "${title}"`}
        onClick={() => onVote(-1)}
        className="rounded-md p-1 text-[var(--mx-faint)] transition-colors hover:bg-[var(--mx-hover)] hover:text-[var(--mx-down)]"
      >
        <ArrowBigDown className="h-4 w-4" />
      </button>
    </div>
  );
}

function PostRow({ post, votes, onOpen, onVote }: { post: Post; votes: number; onOpen: () => void; onVote: (dir: 1 | -1) => void }) {
  return (
    <article
      data-testid="post-row"
      data-post-id={post.id}
      className="flex overflow-hidden rounded-xl border border-[var(--mx-border)] bg-[var(--mx-card)] transition-colors hover:border-[var(--mx-active-border)]"
    >
      <VoteColumn score={votes} title={post.title} onVote={onVote} />
      <button onClick={onOpen} className="min-w-0 flex-1 p-3 text-left transition-colors hover:bg-[var(--mx-hover)]/50">
        <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11px] text-[var(--mx-muted)]">
          <span
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--mx-active-bg)] text-[9px] font-bold"
            style={{ color: authorColor(post.author) }}
          >
            {post.initials}
          </span>
          <b className="text-[var(--mx-text)]">{post.author}</b>
          {post.author.startsWith("Coach") && <CoachBadge />}
          <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[9px] font-semibold text-amber-700">{post.tag}</span>
          <span className="text-[var(--mx-faint)]">· {post.time}</span>
        </p>
        <h2 className="mt-1.5 text-[14px] font-bold text-[var(--mx-text)]">{post.title}</h2>
        <p className="mt-1 line-clamp-2 text-[12px] leading-snug text-[var(--mx-muted)]">{post.excerpt}</p>
        <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[var(--mx-faint)]">
          <span className="flex items-center gap-1"><ArrowBigUp className="h-3 w-3" /><b className="tabular-nums">{votes}</b></span>
          <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{post.replies} replies</span>
          <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{post.views} views</span>
          {post.chart && (
            <span className="flex items-center gap-1 font-medium text-[var(--mx-primary)]"><LineChart className="h-3 w-3" />chart attached</span>
          )}
        </p>
      </button>
    </article>
  );
}

function CommentItem({
  comment, postId, depth, onReply,
}: { comment: DiscussionComment; postId: string; depth: 0 | 1; onReply?: () => void }) {
  const voteComment = useMechanix((s) => s.voteComment);
  return (
    <div data-testid="comment" className={cn(depth === 1 && "ml-6 border-l-2 border-[var(--mx-border)] pl-3")}>
      <div className="flex gap-2.5">
        <span
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
            comment.mine ? "bg-[var(--mx-deep)] text-white" : "bg-[var(--mx-active-bg)]"
          )}
          style={comment.mine ? undefined : { color: authorColor(comment.author) }}
        >
          {nameInitials(comment.author)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <b className="text-[var(--mx-text)]">{comment.author}</b>
            {comment.role === "COACH" && <CoachBadge />}
            <span className="text-[var(--mx-faint)]">· {comment.time}</span>
          </p>
          <p className="mt-0.5 text-[13px] leading-snug text-[var(--mx-text)]" data-testid="comment-body">{comment.body}</p>
          <div className="mt-1 flex items-center gap-1">
            <button
              aria-label={`Upvote comment by ${comment.author}`}
              onClick={() => voteComment(postId, comment.id, 1)}
              className="rounded p-0.5 text-[var(--mx-faint)] transition-colors hover:bg-[var(--mx-active-bg)] hover:text-[var(--mx-primary)]"
            >
              <ArrowBigUp className="h-3.5 w-3.5" />
            </button>
            <span className="min-w-4 text-center text-[11px] font-bold tabular-nums text-[var(--mx-muted)]">{comment.votes}</span>
            <button
              aria-label={`Downvote comment by ${comment.author}`}
              onClick={() => voteComment(postId, comment.id, -1)}
              className="rounded p-0.5 text-[var(--mx-faint)] transition-colors hover:bg-[var(--mx-hover)] hover:text-[var(--mx-down)]"
            >
              <ArrowBigDown className="h-3.5 w-3.5" />
            </button>
            {depth === 0 && onReply && (
              <button
                onClick={onReply}
                className="ml-1 flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-semibold text-[var(--mx-muted)] transition-colors hover:bg-[var(--mx-hover)] hover:text-[var(--mx-text)]"
              >
                <CornerUpLeft className="h-3 w-3" />Reply
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DiscussionThread({ post, onBack }: { post: Post; onBack: () => void }) {
  const comments = useMechanix((s) => s.discussionComments[post.id]) ?? [];
  const votes = useMechanix((s) => s.postVotes[post.id] ?? post.likes);
  const votePost = useMechanix((s) => s.votePost);
  const addComment = useMechanix((s) => s.addComment);
  const [draft, setDraft] = useState("");
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState("");

  const topLevel = comments.filter((c) => !c.replyToId);
  const repliesOf = (id: string) => comments.filter((c) => c.replyToId === id);

  const submitTop = () => {
    const t = draft.trim();
    if (!t) return;
    addComment(post.id, t);
    setDraft("");
    toast.success("Reply posted");
  };
  const submitReply = (parentId: string) => {
    const t = replyDraft.trim();
    if (!t) return;
    addComment(post.id, t, parentId);
    setReplyToId(null);
    setReplyDraft("");
    toast.success("Reply posted");
  };

  return (
    <div className="mx-auto max-w-3xl p-4" data-testid="thread-view">
      <button
        onClick={onBack}
        className="mb-3 flex items-center gap-1.5 rounded-md px-1 py-1 text-[12px] font-semibold text-[var(--mx-muted)] transition-colors hover:bg-[var(--mx-hover)] hover:text-[var(--mx-text)]"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> All discussions
      </button>

      <article className="flex overflow-hidden rounded-xl border border-[var(--mx-border)] bg-[var(--mx-card)]">
        <VoteColumn score={votes} title={post.title} onVote={(dir) => votePost(post.id, dir)} />
        <div className="min-w-0 flex-1 p-4">
          <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11px] text-[var(--mx-muted)]">
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--mx-active-bg)] text-[10px] font-bold"
              style={{ color: authorColor(post.author) }}
            >
              {post.initials}
            </span>
            <b className="text-[var(--mx-text)]">{post.author}</b>
            {post.author.startsWith("Coach") && <CoachBadge />}
            <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[9px] font-semibold text-amber-700">{post.tag}</span>
            <span className="text-[var(--mx-faint)]">· {post.time}</span>
          </p>
          <h1 className="mt-2 text-[17px] font-bold leading-snug text-[var(--mx-text)]">{post.title}</h1>
          {post.body.map((para, i) => (
            <p key={i} className="mt-2.5 text-[13px] leading-relaxed text-[var(--mx-text)]">{para}</p>
          ))}
          {post.chart && (
            <div className="mt-3 max-w-md">
              <ChartAttachment />
            </div>
          )}
          <p className="mt-3 flex items-center gap-3 text-[11px] text-[var(--mx-faint)]">
            <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{post.replies} replies</span>
            <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{post.views} views</span>
          </p>
        </div>
      </article>

      {/* Comments */}
      <section className="mt-4" aria-label="Comments">
        <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-[var(--mx-faint)]">
          Comments · {comments.length}
        </p>
        <div className="space-y-3 rounded-xl border border-[var(--mx-border)] bg-[var(--mx-card)] p-4">
          {topLevel.map((c) => (
            <div key={c.id} className="space-y-3">
              <CommentItem
                comment={c}
                postId={post.id}
                depth={0}
                onReply={() => { setReplyToId(replyToId === c.id ? null : c.id); setReplyDraft(""); }}
              />
              {replyToId === c.id && (
                <div className="ml-6 space-y-1.5 border-l-2 border-[var(--mx-active-border)] pl-3" data-testid="reply-composer">
                  <textarea
                    aria-label={`Reply to ${c.author}`}
                    value={replyDraft}
                    onChange={(e) => setReplyDraft(e.target.value)}
                    rows={2}
                    autoFocus
                    placeholder={`Reply to ${c.author}…`}
                    className="w-full rounded-lg border border-[var(--mx-border)] bg-[var(--mx-bg)] px-3 py-2 text-[12px] text-[var(--mx-text)] outline-none focus:ring-2 focus:ring-[var(--mx-accent)]/40"
                  />
                  <div className="flex gap-1.5">
                    <Button
                      size="sm"
                      onClick={() => submitReply(c.id)}
                      disabled={replyDraft.trim() === ""}
                      className="h-7 bg-[var(--mx-primary)] text-[11px] text-white hover:bg-[var(--mx-deep)]"
                    >
                      Reply
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setReplyToId(null)} className="h-7 text-[11px]">
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
              {repliesOf(c.id).map((r) => (
                <CommentItem key={r.id} comment={r} postId={post.id} depth={1} />
              ))}
            </div>
          ))}
          {comments.length === 0 && (
            <p className="py-2 text-[12px] text-[var(--mx-faint)]">No comments yet — start the discussion.</p>
          )}
        </div>
      </section>

      {/* Composer */}
      <div className="mt-4 rounded-xl border border-[var(--mx-border)] bg-[var(--mx-card)] p-3" data-testid="comment-composer">
        <textarea
          aria-label="Write a comment"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          placeholder="Share your read, ask a question…"
          className="w-full rounded-lg border border-[var(--mx-border)] bg-[var(--mx-bg)] px-3 py-2 text-[13px] text-[var(--mx-text)] outline-none focus:ring-2 focus:ring-[var(--mx-accent)]/40"
        />
        <div className="mt-2 flex justify-end">
          <Button
            size="sm"
            onClick={submitTop}
            disabled={draft.trim() === ""}
            className="bg-[var(--mx-primary)] text-white hover:bg-[var(--mx-deep)]"
          >
            <Send className="mr-1 h-3.5 w-3.5" />Post reply
          </Button>
        </div>
      </div>
    </div>
  );
}

export function DiscussionsView() {
  const filter = useMechanix((s) => s.communityFilter);
  const setFilter = useMechanix((s) => s.setCommunityFilter);
  const posts = useMechanix((s) => s.posts);
  const postVotes = useMechanix((s) => s.postVotes);
  const votePost = useMechanix((s) => s.votePost);
  const addPost = useMechanix((s) => s.addPost);
  const openPostId = useMechanix((s) => s.openPostId);
  const setOpenPost = useMechanix((s) => s.setOpenPost);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<DiscussionSort>("top");
  const [newPostOpen, setNewPostOpen] = useState(false);
  const [npTitle, setNpTitle] = useState("");
  const [npTag, setNpTag] = useState<string>(POST_TAGS[0]);
  const [npBody, setNpBody] = useState("");
  const [npChart, setNpChart] = useState(false);

  const openPost = posts.find((p) => p.id === openPostId) ?? null;
  if (openPost) {
    return <DiscussionThread post={openPost} onBack={() => setOpenPost(null)} />;
  }

  const q = search.trim().toLowerCase();
  const visible = posts
    .filter((p) => matchesTag(p.tag, filter))
    .filter((p) => q === "" || p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q))
    .sort((a, b) =>
      sort === "newest"
        ? b.createdAt - a.createdAt
        : sort === "replies"
          ? b.replies - a.replies
          : (postVotes[b.id] ?? b.likes) - (postVotes[a.id] ?? a.likes)
    );

  const publish = () => {
    const title = npTitle.trim();
    const body = npBody.trim();
    if (!title || !body) {
      toast.error("Add a title and a body before publishing.");
      return;
    }
    addPost({ title, tag: npTag, body, chart: npChart });
    setNpTitle(""); setNpTag(POST_TAGS[0]); setNpBody(""); setNpChart(false);
    setNewPostOpen(false);
    setSort("newest"); // fresh post lands at the top of the feed
    toast.success("Post published to Discussions");
  };

  return (
    <div className="mx-auto max-w-3xl p-4" data-testid="view-discussions">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h1 className="mr-auto text-lg font-bold text-[var(--mx-text)]">Community Discussions</h1>
        <Button
          size="sm"
          onClick={() => setNewPostOpen(true)}
          data-testid="new-post-btn"
          className="bg-[var(--mx-primary)] text-white hover:bg-[var(--mx-deep)]"
        >
          <Plus className="mr-1 h-3.5 w-3.5" />New post
        </Button>
      </div>

      {/* Feed toolbar */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <label className="flex min-w-40 flex-1 items-center gap-1.5 rounded-lg border border-[var(--mx-border)] bg-[var(--mx-card)] px-2.5 py-1.5">
          <Search className="h-3.5 w-3.5 shrink-0 text-[var(--mx-faint)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title or body…"
            aria-label="Search discussions"
            data-testid="discussion-search"
            className="w-full bg-transparent text-[12px] text-[var(--mx-text)] outline-none placeholder:text-[var(--mx-faint)]"
          />
        </label>
        <label className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--mx-faint)]">
          Sort
          <select
            aria-label="Sort posts"
            data-testid="discussion-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as DiscussionSort)}
            className="rounded-md border border-[var(--mx-border)] bg-[var(--mx-card)] px-2 py-1.5 text-[12px] text-[var(--mx-text)] focus:outline-none focus:ring-2 focus:ring-[var(--mx-accent)]/40"
          >
            {DISCUSSION_SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </label>
      </div>
      <div className="mb-3 flex flex-wrap gap-1.5" role="group" aria-label="Filter by tag">
        {DISCUSSION_TAGS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className={cn(
              "rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors",
              filter === f
                ? "bg-[var(--mx-primary)] text-white"
                : "bg-[var(--mx-card)] text-[var(--mx-muted)] ring-1 ring-[var(--mx-border)] hover:bg-[var(--mx-hover)]"
            )}
          >{f}</button>
        ))}
      </div>

      {/* Post rows */}
      <div className="space-y-2" data-testid="post-list">
        {visible.length === 0 && (
          <p className="rounded-xl border border-[var(--mx-border)] bg-[var(--mx-card)] p-6 text-center text-[12px] text-[var(--mx-faint)]" data-testid="no-results">
            No discussions match. Try another search or tag.
          </p>
        )}
        {visible.map((p) => (
          <PostRow
            key={p.id}
            post={p}
            votes={postVotes[p.id] ?? p.likes}
            onOpen={() => setOpenPost(p.id)}
            onVote={(dir) => votePost(p.id, dir)}
          />
        ))}
      </div>

      {/* New post dialog */}
      <Dialog open={newPostOpen} onOpenChange={setNewPostOpen}>
        <DialogContent className="max-w-lg border-[var(--mx-border)] bg-[var(--mx-card)] text-[var(--mx-text)]" data-testid="new-post-dialog">
          <DialogHeader><DialogTitle>New discussion post</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <label className="block">
              <span className="mb-1 block text-[11px] font-semibold text-[var(--mx-muted)]">Title</span>
              <input
                value={npTitle}
                onChange={(e) => setNpTitle(e.target.value)}
                placeholder="e.g. EURUSD 4H supply — valid after two tests?"
                aria-label="Post title"
                data-testid="np-title"
                className="w-full rounded-lg border border-[var(--mx-border)] bg-[var(--mx-bg)] px-3 py-2 text-[13px] text-[var(--mx-text)] outline-none focus:ring-2 focus:ring-[var(--mx-accent)]/40"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] font-semibold text-[var(--mx-muted)]">Tag</span>
              <select
                value={npTag}
                onChange={(e) => setNpTag(e.target.value)}
                aria-label="Post tag"
                data-testid="np-tag"
                className="w-full rounded-lg border border-[var(--mx-border)] bg-[var(--mx-bg)] px-3 py-2 text-[13px] text-[var(--mx-text)] outline-none focus:ring-2 focus:ring-[var(--mx-accent)]/40"
              >
                {POST_TAGS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] font-semibold text-[var(--mx-muted)]">Body</span>
              <textarea
                value={npBody}
                onChange={(e) => setNpBody(e.target.value)}
                rows={5}
                placeholder="Share your chart read or question. Blank lines split into paragraphs."
                aria-label="Post body"
                data-testid="np-body"
                className="w-full rounded-lg border border-[var(--mx-border)] bg-[var(--mx-bg)] px-3 py-2 text-[13px] text-[var(--mx-text)] outline-none focus:ring-2 focus:ring-[var(--mx-accent)]/40"
              />
            </label>
            <div className="flex items-center justify-between rounded-lg border border-[var(--mx-border)] bg-[var(--mx-bg)] px-3 py-2">
              <span className="flex items-center gap-1.5 text-[12px] font-medium text-[var(--mx-muted)]">
                <LineChart className="h-3.5 w-3.5" /> Attach chart snapshot
              </span>
              <button
                role="switch"
                aria-checked={npChart}
                aria-label="Attach chart"
                data-testid="np-chart-toggle"
                onClick={() => setNpChart((v) => !v)}
                className={cn("h-5 w-9 shrink-0 rounded-full transition-colors", npChart ? "bg-[var(--mx-accent)]" : "bg-slate-300")}
              >
                <span className={cn("block h-4 w-4 translate-x-0.5 rounded-full bg-[var(--mx-card)] transition-transform", npChart && "translate-x-[18px]")} />
              </button>
            </div>
            {npChart && (
              <div className="max-w-xs" data-testid="np-chart-preview">
                <ChartAttachment />
              </div>
            )}
            <div className="flex justify-end gap-1.5 pt-1">
              <Button variant="outline" onClick={() => setNewPostOpen(false)}>Cancel</Button>
              <Button
                onClick={publish}
                data-testid="np-publish"
                className="bg-[var(--mx-primary)] text-white hover:bg-[var(--mx-deep)]"
              >
                Publish
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function CoachView() {
  const coachSubmissions = useMechanix((s) => s.coachSubmissions);
  const queue = [
    ...coachSubmissions.map((s) => ({
      learner: "You",
      task: `AI Guide submission — ${s.text.length > 60 ? `${s.text.slice(0, 60)}…` : s.text}`,
      submitted: "just now",
    })),
    { learner: "Alex R.", task: "Demand zone marking — EURUSD", submitted: "2h ago" },
    { learner: "Dre W.", task: "Trade plan review — GBPUSD", submitted: "5h ago" },
    { learner: "Priya S.", task: "Quiz remediation — the Math", submitted: "1d ago" },
  ];
  return (
    <div className="grid gap-3 p-4 lg:grid-cols-[260px_1fr_260px]" data-testid="view-coach">
      <div className="rounded-xl border border-[var(--mx-border)] bg-[var(--mx-card)] p-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--mx-faint)]">Review queue</p>
        {queue.map((q, i) => (
          <button key={q.learner} className={cn("mb-1.5 w-full rounded-lg border p-2.5 text-left", i === 0 ? "border-[var(--mx-active-border)] bg-[var(--mx-active-bg)]" : "border-[var(--mx-border)] hover:bg-[var(--mx-hover)]")}>
            <p className="text-[13px] font-semibold text-[var(--mx-text)]">{q.learner}</p>
            <p className="text-[11px] text-[var(--mx-muted)]">{q.task}</p>
            <p className="text-[10px] text-[var(--mx-faint)]">{q.submitted}</p>
          </button>
        ))}
      </div>
      <div className="rounded-xl border border-[var(--mx-border)] bg-[var(--mx-card)] p-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--mx-faint)]">Submission — Alex R.</p>
        <svg viewBox="0 0 400 160" className="h-44 w-full rounded-lg border border-[var(--mx-border)] bg-[var(--mx-bg)]" aria-label="Submitted chart markup" role="img">
          {Array.from({ length: 34 }, (_, i) => {
            const up = i % 3 !== 0;
            return <rect key={i} x={8 + i * 11.4} y={110 - i * 1.4 + (up ? -12 : 10)} width={6} height={18 + (i % 5) * 8} fill={up ? "#22A06B" : "#E5484D"} rx={1} />;
          })}
          <rect x={0} y={118} width={400} height={24} fill="#22A06B" opacity={0.15} />
          <rect x={0} y={20} width={400} height={18} fill="#E5484D" opacity={0.15} />
          <text x={8} y={134} fontSize={10} fill="#14532D" fontWeight={700}>Zone marked correctly</text>
        </svg>
        <p className="mt-2 text-[12px] text-[var(--mx-muted)]">Zone boundaries are right; entry trigger note is missing. Check rubric →</p>
      </div>
      <div className="rounded-xl border border-[var(--mx-border)] bg-[var(--mx-card)] p-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--mx-faint)]">Rubric</p>
        {[["Zone boundaries", 2, 2], ["Freshness assessment", 1, 2], ["Entry trigger plan", 0, 2], ["Risk definition", 2, 2]].map(([n, s, m]) => (
          <div key={n as string} className="flex items-center justify-between py-1 text-[12px]">
            <span className="text-[var(--mx-muted)]">{n}</span><b className="tabular-nums text-[var(--mx-text)]">{s}/{m}</b>
          </div>
        ))}
        <div className="mt-2 border-t border-[var(--mx-border)] pt-2 text-right text-[13px] font-bold text-[var(--mx-primary)]">5 / 8</div>
      </div>
    </div>
  );
}

export function GroupQuizView() {
  const [picked, setPicked] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(18);
  useEffect(() => {
    const t = setInterval(() => setTimeLeft((s) => (s > 0 ? s - 1 : 18)), 1000);
    return () => clearInterval(t);
  }, []);
  const q = QUIZQ[0];
  return (
    <div className="mx-auto max-w-xl p-6" data-testid="view-group-quiz">
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-lg font-bold text-[var(--mx-text)]">Live team challenge — Q4/8</h1>
        <span className="rounded-full bg-[var(--mx-primary)] px-3 py-1 text-[12px] font-bold tabular-nums text-white">{timeLeft}s</span>
      </div>
      <div className="rounded-xl border border-[var(--mx-border)] bg-[var(--mx-card)] p-4">
        <p className="text-[15px] font-bold text-[var(--mx-text)]">{q}</p>
        <div className="mt-3 space-y-2">
          {["Buy the retest with SL below the zone", "Sell — zones fail most of the time", "Wait for a second test", "Enter at market now"].map((c, i) => (
            <button key={c} onClick={() => setPicked(i)}
              className={cn("w-full rounded-lg border p-2.5 text-left text-[13px] font-medium transition-colors",
                picked === i ? "border-[var(--mx-accent)] bg-[var(--mx-active-bg)] text-[var(--mx-primary)]" : "border-[var(--mx-border)] text-[var(--mx-text)] hover:border-[var(--mx-active-border)]")}>
              {c}
            </button>
          ))}
        </div>
        <p className="mt-3 text-center text-[11px] text-[var(--mx-faint)]">Answers lock for the whole team. Leaderboard is on the right.</p>
      </div>
    </div>
  );
}
const QUIZQ = ["Price breaks above supply, retests it as support, and holds. Highest-quality plan?"];

"use client";

import { useState } from "react";
import {
  Bell, BookOpen, CandlestickChart, Menu, MessagesSquare, Minus, Palette, Plus,
  ShieldCheck, ShoppingCart, Trash2, Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { MechanixSection } from "@/app/mechanix-design/views";
import { useMechanix, type MxTheme } from "./store";

const TABS: { label: MechanixSection; icon: typeof BookOpen }[] = [
  { label: "Learn", icon: BookOpen },
  { label: "Practice", icon: CandlestickChart },
  { label: "Trade", icon: Wallet },
  { label: "Community", icon: MessagesSquare },
  { label: "Admin", icon: ShieldCheck },
];

const THEMES: { id: MxTheme; name: string; dot: string }[] = [
  { id: "green", name: "Green", dot: "#16A34A" },
  { id: "ocean", name: "Ocean", dot: "#0284C7" },
  { id: "ember", name: "Ember", dot: "#EA580C" },
  { id: "violet", name: "Violet", dot: "#7C3AED" },
  { id: "midnight", name: "Midnight", dot: "#0B1220" },
];

interface TopNavProps {
  section: MechanixSection;
  onSection: (s: MechanixSection) => void;
  onNavigate: (slug: string) => void;
  onMenu: () => void;
  onRightPanel: () => void;
}

const iconBtn =
  "rounded-md p-2 text-[var(--mx-muted)] hover:bg-[var(--mx-hover)] focus-visible:ring-2 focus-visible:ring-[var(--mx-accent)]/40";

export function TopNav({ section, onSection, onNavigate, onMenu, onRightPanel }: TopNavProps) {
  const theme = useMechanix((s) => s.theme);
  const setTheme = useMechanix((s) => s.setTheme);
  const cart = useMechanix((s) => s.cart);
  const setCartQty = useMechanix((s) => s.setCartQty);
  const removeFromCart = useMechanix((s) => s.removeFromCart);
  const clearCart = useMechanix((s) => s.clearCart);
  const [cartOpen, setCartOpen] = useState(false);
  const count = cart.reduce((n, c) => n + c.qty, 0);
  const subtotal = cart.reduce((n, c) => n + c.price * c.qty, 0);

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-[var(--mx-border)] bg-[var(--mx-card)] px-3">
      <button aria-label="Open navigation menu" onClick={onMenu} className={cn(iconBtn, "lg:hidden")}>
        <Menu className="h-4 w-4" />
      </button>
      <button
        className="select-none text-xl font-extrabold tracking-tight text-[var(--mx-deep)]"
        onClick={() => onSection("Practice")}
        aria-label="MechaniX — go to Practice"
      >
        Mechani<span className="text-[var(--mx-accent)]">X</span>
      </button>

      <nav className="mx-2 flex items-center gap-1" aria-label="Sections">
        {TABS.map(({ label, icon: Icon }) => (
          <button
            key={label}
            onClick={() => onSection(label)}
            aria-current={section === label ? "page" : undefined}
            className={cn(
              "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mx-accent)]/40",
              section === label
                ? "border-[var(--mx-active-border)] bg-[var(--mx-active-bg)] text-[var(--mx-primary)]"
                : "border-transparent text-[var(--mx-muted)] hover:bg-[var(--mx-hover)]"
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </nav>

      <div className="flex-1" />

      <span className="hidden items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 md:flex">
        Concept • Illustrative data
      </span>
      <button
        onClick={() => onNavigate("login")}
        className="hidden rounded-md px-2 py-1.5 text-[13px] font-semibold text-[var(--mx-primary)] hover:bg-[var(--mx-hover)] focus-visible:ring-2 focus-visible:ring-[var(--mx-accent)]/40 sm:block"
      >
        Sign in
      </button>
      <Popover>
        <PopoverTrigger asChild>
          <button aria-label="Choose theme" className={iconBtn}>
            <Palette className="h-4 w-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-44 border-[var(--mx-border)] bg-[var(--mx-card)] p-1.5">
          <p className="px-2 pb-1 pt-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--mx-faint)]">Theme</p>
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              aria-pressed={theme === t.id}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[13px] font-medium text-[var(--mx-text)] hover:bg-[var(--mx-hover)]",
                theme === t.id && "bg-[var(--mx-active-bg)] font-semibold text-[var(--mx-primary)]"
              )}
            >
              <span className="h-3.5 w-3.5 rounded-full border border-black/10" style={{ background: t.dot }} />
              {t.name}
            </button>
          ))}
        </PopoverContent>
      </Popover>
      <button aria-label="Cart" onClick={() => setCartOpen(true)} className={cn("relative", iconBtn)}>
        <ShoppingCart className="h-4 w-4" />
        {count > 0 && (
          <span data-testid="cart-count" className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--mx-accent)] px-1 text-[9px] font-bold text-white">
            {count}
          </span>
        )}
      </button>
      <button aria-label="Notifications" className={cn("relative", iconBtn)}>
        <Bell className="h-4 w-4" />
        <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[var(--mx-down)]" />
      </button>
      <button aria-label="Account" onClick={onRightPanel} className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--mx-deep)] text-xs font-bold text-white">
        AB
      </button>

      <Sheet open={cartOpen} onOpenChange={setCartOpen}>
        <SheetContent className="flex w-[340px] flex-col border-[var(--mx-border)] bg-[var(--mx-card)] p-0 text-[var(--mx-text)]">
          <SheetHeader className="border-b border-[var(--mx-border)] px-4 py-3">
            <SheetTitle className="text-[var(--mx-text)]">Cart ({count})</SheetTitle>
          </SheetHeader>
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            {cart.length === 0 ? (
              <p className="text-[13px] text-[var(--mx-muted)]">Your cart is empty — add something from the Shop.</p>
            ) : (
              cart.map((c) => (
                <div key={c.id} className="flex items-center gap-2 border-b border-[var(--mx-grid)] py-2 text-[13px] last:border-0">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-[var(--mx-text)]">{c.name}</p>
                    <p className="text-[11px] tabular-nums text-[var(--mx-faint)]">${c.price} each</p>
                  </div>
                  <span className="flex items-center gap-1">
                    <button aria-label={`Decrease ${c.name}`} onClick={() => setCartQty(c.id, c.qty - 1)}
                      className="rounded p-1 text-[var(--mx-muted)] hover:bg-[var(--mx-hover)]"><Minus className="h-3 w-3" /></button>
                    <span className="w-4 text-center tabular-nums">{c.qty}</span>
                    <button aria-label={`Increase ${c.name}`} onClick={() => setCartQty(c.id, c.qty + 1)}
                      className="rounded p-1 text-[var(--mx-muted)] hover:bg-[var(--mx-hover)]"><Plus className="h-3 w-3" /></button>
                  </span>
                  <span className="w-14 text-right tabular-nums font-bold">${c.price * c.qty}</span>
                  <button aria-label={`Remove ${c.name}`} onClick={() => removeFromCart(c.id)}
                    className="rounded p-1 text-[var(--mx-faint)] hover:text-[var(--mx-down)]"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              ))
            )}
          </div>
          <div className="border-t border-[var(--mx-border)] p-4">
            <div className="mb-2 flex justify-between text-[14px] font-bold">
              <span className="text-[var(--mx-muted)]">Subtotal</span>
              <span className="tabular-nums text-[var(--mx-primary)]">${subtotal}</span>
            </div>
            <Button
              className="w-full bg-[var(--mx-primary)] text-white hover:bg-[var(--mx-deep)]"
              disabled={cart.length === 0}
              onClick={() => { clearCart(); setCartOpen(false); toast.success("Checkout complete — simulated, nothing charged."); }}
            >
              Checkout (simulated)
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}

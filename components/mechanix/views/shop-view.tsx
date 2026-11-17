"use client";

import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMechanix } from "@/components/mechanix/workspace/store";

const PRODUCTS = [
  { id: "p-sd-course", name: "Supply & Demand Mastery", price: 149, cat: "Courses", desc: "Full 18-lesson track with chart tasks." },
  { id: "p-math-course", name: "Risk & the Math", price: 89, cat: "Courses", desc: "Position sizing and expectancy deep-dive." },
  { id: "p-cheatsheet", name: "S&D Cheat-Sheet PDF", price: 19, cat: "Tools", desc: "Printable zone-ranking reference card." },
  { id: "p-prop-credit", name: "Prop Challenge Credit", price: 199, cat: "Tools", desc: "One simulated Phase-1 challenge entry." },
  { id: "p-hoodie", name: "MechaniX Hoodie", price: 59, cat: "Merch", desc: "Heavyweight, embroidered logo." },
  { id: "p-mug", name: "MechaniX Mug", price: 24, cat: "Merch", desc: "“Mark the zone” ceramic mug." },
  { id: "p-coaching", name: "1:1 Coaching Session", price: 120, cat: "Coaching", desc: "45-minute chart review with a coach." },
  { id: "p-scanner", name: "Zone Scanner Addon", price: 49, cat: "Tools", desc: "Unlocks advanced scanner filters." },
];

const CATEGORIES = ["All", "Courses", "Tools", "Merch", "Coaching"];

export function ShopView() {
  const [cat, setCat] = useState("All");
  const addToCart = useMechanix((s) => s.addToCart);
  const items = PRODUCTS.filter((p) => cat === "All" || p.cat === cat);
  return (
    <div className="space-y-3 p-4" data-testid="view-shop">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-[var(--mx-text)]">Shop</h1>
        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">Concept • Illustrative data</span>
      </div>
      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Product categories">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            role="tab"
            aria-selected={cat === c}
            onClick={() => setCat(c)}
            className={cn(
              "rounded-full border px-3 py-1 text-[12px] font-semibold transition-colors",
              cat === c
                ? "border-[var(--mx-active-border)] bg-[var(--mx-active-bg)] text-[var(--mx-primary)]"
                : "border-[var(--mx-border)] text-[var(--mx-muted)] hover:bg-[var(--mx-hover)]"
            )}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((p) => (
          <div key={p.id} className="flex flex-col rounded-xl border border-[var(--mx-border)] bg-[var(--mx-card)] p-3 shadow-[0_1px_2px_rgba(15,61,46,0.05)]">
            <div className="flex h-20 items-center justify-center rounded-lg bg-[var(--mx-bg)] text-2xl font-extrabold text-[var(--mx-active-border)]">
              {p.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
            </div>
            <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-[var(--mx-faint)]">{p.cat}</p>
            <p className="text-[13px] font-bold text-[var(--mx-text)]">{p.name}</p>
            <p className="mt-0.5 flex-1 text-[11px] leading-snug text-[var(--mx-muted)]">{p.desc}</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[15px] font-extrabold tabular-nums text-[var(--mx-primary)]">${p.price}</span>
              <Button
                size="sm"
                className="bg-[var(--mx-primary)] text-white hover:bg-[var(--mx-deep)]"
                onClick={() => { addToCart({ id: p.id, name: p.name, price: p.price }); toast.success(`${p.name} added to cart.`); }}
              >
                <ShoppingCart className="mr-1 h-3.5 w-3.5" /> Add to cart
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

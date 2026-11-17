"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { PanelRight } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import {
  DEFAULT_VIEW, SECTION_DEFAULT, getMechanixView, type MechanixSection,
} from "@/app/mechanix-design/views";
import { TopNav } from "./top-nav";
import { LeftRail } from "./left-rail";
import { RightRail } from "./right-rail";
import { CommunityDock } from "./bottom-dock";
import { useShortcuts } from "./use-shortcuts";
import { useMechanix } from "./store";
import { chartFullscreen } from "./chart-fs";
import { SYMBOLS } from "./mock-data";
import { CenterView } from "@/components/mechanix/views";

const DOCK_VIEWS = new Set(["practice", "dashboard"]);

const SHORTCUTS: [string, string][] = [
  ["F", "Toggle chart fullscreen"],
  ["Shift + F", "Toggle focus mode"],
  ["1 – 6", "Switch timeframe (1m … D)"],
  ["B / S", "Set ticket side Buy / Sell"],
  ["/", "Symbol search"],
  ["?", "This shortcut sheet"],
  ["Esc", "Close dialog / exit focus mode"],
];

function slugFromPathname(pathname: string | null): string {
  const seg = pathname?.split("/").filter(Boolean)[1];
  return seg && getMechanixView(seg) ? seg : DEFAULT_VIEW;
}

function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}

export function MechanixWorkspace() {
  const pathname = usePathname();
  const view = slugFromPathname(pathname);
  const section = (getMechanixView(view)?.section ?? "Practice") as MechanixSection;

  const focusMode = useMechanix((s) => s.focusMode);
  const setSymbol = useMechanix((s) => s.setSymbol);
  const symbol = useMechanix((s) => s.symbol);
  const theme = useMechanix((s) => s.theme);

  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  // Debug/test handle — lets automation assert on store state (positions, timeframe…)
  useEffect(() => {
    (window as unknown as { __mx?: typeof useMechanix }).__mx = useMechanix;
  }, []);

  // Apply theme to <html> too so portaled UI (popovers, dialogs, sheets,
  // toasts) inherits the --mx-* tokens — portals render outside the wrapper.
  useEffect(() => {
    const el = document.documentElement;
    ["green", "ocean", "ember", "violet", "midnight"].forEach((t) => el.classList.remove(`mx-${t}`));
    el.classList.add(`mx-${theme}`);
  }, [theme]);

  const navigate = useCallback((slug: string) => {
    if (slug === slugFromPathname(window.location.pathname)) return;
    window.history.pushState(null, "", `/mechanix-design/${slug}`);
  }, []);

  const onSection = useCallback(
    (s: MechanixSection) => navigate(SECTION_DEFAULT[s]),
    [navigate]
  );

  useShortcuts({
    onFullscreen: () => chartFullscreen.toggle(),
    onSymbolSearch: () => setSearchOpen(true),
    onHelp: () => setHelpOpen(true),
  });

  const showDock = DOCK_VIEWS.has(view) && !focusMode;

  return (
    <div className={cn("flex h-dvh flex-col overflow-hidden bg-[var(--mx-bg)] font-sans text-[var(--mx-text)]", `mx-${theme}`)}>
      <TopNav
        section={section}
        onSection={onSection}
        onNavigate={navigate}
        onMenu={() => setLeftOpen(true)}
        onRightPanel={() => setRightOpen(true)}
      />

      <div className="flex min-h-0 flex-1">
        {/* Left rail — white, per reference */}
        <aside
          aria-label="Left panel"
          className={cn(
            "hidden w-[220px] shrink-0 border-r border-[var(--mx-border)] bg-[var(--mx-card)] lg:block xl:w-[248px]",
            focusMode && "lg:hidden"
          )}
        >
          <div key={`l-${section}-${view}`} className="h-full animate-in fade-in slide-in-from-left-1 duration-200">
            <LeftRail view={view} section={section} onNavigate={navigate} />
          </div>
        </aside>

        {/* Center column */}
        <main className="flex min-w-0 flex-1 flex-col" aria-label="Workspace">
          <div
            key={view}
            data-testid={`center-${view}`}
            className="min-h-0 flex-1 animate-in fade-in slide-in-from-bottom-1 overflow-y-auto duration-200"
          >
            <CenterView view={view} onNavigate={navigate} />
          </div>
          {showDock && (
            <div className="shrink-0 overflow-y-auto px-3 pb-3 max-lg:max-h-[36dvh]">
              <CommunityDock />
            </div>
          )}
        </main>

        {/* Right rail */}
        <aside
          aria-label="Right panel"
          className={cn(
            "hidden w-[280px] shrink-0 border-l border-[var(--mx-border)] bg-[var(--mx-card)] xl:block 2xl:w-[300px]",
            focusMode && "xl:hidden"
          )}
        >
          <div key={`r-${view}`} className="h-full animate-in fade-in slide-in-from-right-1 duration-200">
            <RightRail view={view} />
          </div>
        </aside>
      </div>

      {/* Floating right-panel trigger below xl */}
      <button
        aria-label="Open side panel"
        onClick={() => setRightOpen(true)}
        className="fixed bottom-4 right-4 z-40 hidden h-10 w-10 items-center justify-center rounded-full bg-[var(--mx-primary)] text-white shadow-lg hover:bg-[var(--mx-deep)] max-xl:flex max-lg:bottom-20"
      >
        <PanelRight className="h-4 w-4" />
      </button>

      {/* Left rail as sheet below lg */}
      <Sheet open={leftOpen} onOpenChange={setLeftOpen}>
        <SheetContent side="left" className="w-[280px] bg-[var(--mx-card)] p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <LeftRail view={view} section={section} onNavigate={(s) => { navigate(s); setLeftOpen(false); }} />
        </SheetContent>
      </Sheet>

      {/* Right panel: side sheet 1024–1279, bottom sheet <1024 */}
      <Sheet open={rightOpen} onOpenChange={setRightOpen}>
        <SheetContent
          side={isDesktop ? "right" : "bottom"}
          className={cn("bg-[var(--mx-card)] p-0", isDesktop ? "w-[340px]" : "h-[70dvh]")}
        >
          <SheetTitle className="sr-only">Side panel</SheetTitle>
          <RightRail view={view} />
        </SheetContent>
      </Sheet>

      {/* Symbol search — "/" */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="top-[20%] max-w-md border-[var(--mx-border)] bg-[var(--mx-card)] p-0 text-[var(--mx-text)]" data-testid="symbol-palette">
          <DialogHeader className="sr-only"><DialogTitle>Symbol search</DialogTitle></DialogHeader>
          <Command>
            <CommandInput placeholder="Search instruments…" autoFocus />
            <CommandList>
              <CommandEmpty>No instruments found.</CommandEmpty>
              <CommandGroup heading="Instruments">
                {SYMBOLS.map((s) => (
                  <CommandItem
                    key={s.symbol}
                    onSelect={() => { setSymbol(s.symbol); setSearchOpen(false); }}
                  >
                    <span className={cn("font-semibold", s.symbol === symbol && "text-[var(--mx-primary)]")}>{s.symbol}</span>
                    <span className="ml-2 text-xs text-[var(--mx-muted)]">{s.name}</span>
                    <span className="ml-auto text-[10px] uppercase text-[var(--mx-faint)]">{s.group}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>

      {/* Shortcut sheet — "?" */}
      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent className="max-w-sm border-[var(--mx-border)] bg-[var(--mx-card)] text-[var(--mx-text)]" data-testid="shortcut-sheet">
          <DialogHeader><DialogTitle>Keyboard shortcuts</DialogTitle></DialogHeader>
          <ul className="space-y-2">
            {SHORTCUTS.map(([k, d]) => (
              <li key={k} className="flex items-center justify-between text-[13px]">
                <span className="text-[var(--mx-muted)]">{d}</span>
                <kbd className="rounded-md border border-[var(--mx-border)] bg-[var(--mx-bg)] px-2 py-0.5 font-mono text-[11px] font-semibold text-[var(--mx-text)]">{k}</kbd>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
    </div>
  );
}

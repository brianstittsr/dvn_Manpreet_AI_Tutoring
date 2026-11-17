"use client";

import { useEffect } from "react";
import { useMechanix } from "./store";
import { TIMEFRAMES } from "./mock-data";

interface ShortcutHandlers {
  onFullscreen: () => void;
  onSymbolSearch: () => void;
  onHelp: () => void;
}

export function useShortcuts({ onFullscreen, onSymbolSearch, onHelp }: ShortcutHandlers) {
  const setTimeframe = useMechanix((s) => s.setTimeframe);
  const setTicket = useMechanix((s) => s.setTicket);
  const setFocusMode = useMechanix((s) => s.setFocusMode);
  const focusMode = useMechanix((s) => s.focusMode);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        if (e.key === "Escape") (target as HTMLElement).blur();
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const num = Number.parseInt(e.key, 10);
      if (num >= 1 && num <= TIMEFRAMES.length) {
        setTimeframe(TIMEFRAMES[num - 1]);
        return;
      }
      switch (e.key) {
        case "f":
        case "F":
          if (e.shiftKey) setFocusMode(!focusMode);
          else onFullscreen();
          break;
        case "b":
        case "B":
          setTicket({ side: "buy" });
          document.getElementById("mx-ticket-price")?.focus();
          break;
        case "s":
        case "S":
          setTicket({ side: "sell" });
          document.getElementById("mx-ticket-price")?.focus();
          break;
        case "/":
          e.preventDefault();
          onSymbolSearch();
          break;
        case "?":
          onHelp();
          break;
        case "Escape":
          if (focusMode) setFocusMode(false);
          break;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focusMode, onFullscreen, onHelp, onSymbolSearch, setFocusMode, setTicket, setTimeframe]);
}

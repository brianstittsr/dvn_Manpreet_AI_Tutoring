"use client";

/**
 * Bridge that lets the workspace shell (keyboard shortcuts, header buttons)
 * trigger the chart workspace's own requestFullscreen container, which lives
 * inside the Practice/Trade views. The active ChartWorkspace registers its
 * toggle on mount and clears it on unmount.
 */
export const chartFullscreen: { toggle: () => void } = {
  toggle: () => {},
};

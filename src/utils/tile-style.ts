import type { Tile } from "../game/tile";

export function areTileArraysEqual(prev: Tile[], next: Tile[]): boolean {
  if (prev.length !== next.length) return false;
  for (let i = 0; i < prev.length; i++) {
    const a = prev[i];
    const b = next[i];
    if (a.id !== b.id || a.x !== b.x || a.y !== b.y || a.value !== b.value) {
      return false;
    }
  }
  return true;
}

export function getTileStyle(value: number): { bg: string; text: string } {
  if (value <= 2) return { bg: "var(--color-tile-2-bg)", text: "var(--color-tile-2-text)" };
  if (value <= 4) return { bg: "var(--color-tile-4-bg)", text: "var(--color-tile-4-text)" };
  if (value <= 8) return { bg: "var(--color-tile-8-bg)", text: "var(--color-tile-8-text)" };
  if (value <= 16) return { bg: "var(--color-tile-16-bg)", text: "var(--color-tile-16-text)" };
  if (value <= 32) return { bg: "var(--color-tile-32-bg)", text: "var(--color-tile-32-text)" };
  if (value <= 64) return { bg: "var(--color-tile-64-bg)", text: "var(--color-tile-64-text)" };
  if (value <= 128) return { bg: "var(--color-tile-128-bg)", text: "var(--color-tile-128-text)" };
  if (value <= 256) return { bg: "var(--color-tile-256-bg)", text: "var(--color-tile-256-text)" };
  if (value <= 512) return { bg: "var(--color-tile-512-bg)", text: "var(--color-tile-512-text)" };
  if (value <= 1024)
    return { bg: "var(--color-tile-1024-bg)", text: "var(--color-tile-1024-text)" };
  return { bg: "var(--color-tile-max-bg)", text: "var(--color-tile-max-text)" };
}

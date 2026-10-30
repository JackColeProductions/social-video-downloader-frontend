"use client";

import type { LucideIcon } from "lucide-react";
import { useSyncExternalStore } from "react";

export type ToastTone = "error" | "info";

export interface Toast {
  id: number;
  tone: ToastTone;
  title: string;
  message: string;
  Icon: LucideIcon;
  /** How long it stays, in ms. Its bar drains over this time, paused while hovered or dragged. */
  duration: number;
  /** Counts repeats: showing the same toast again refreshes the visible one instead of stacking a copy. */
  repeats: number;
}

export type ToastInput = Omit<Toast, "id" | "duration" | "repeats"> & { duration?: number };

const MAX_TOASTS = 3;
const EMPTY: Toast[] = [];

let toasts: Toast[] = EMPTY;
let nextId = 1;
/** Toasts playing their exit animation: a repeat of one of them gets a fresh toast. */
const leaving = new Set<number>();
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Shows a toast in the top right corner (newest on top, at most three). */
export function showToast({ duration = 7000, ...toast }: ToastInput): void {
  const same = toasts.find((t) => !leaving.has(t.id) && t.tone === toast.tone && t.title === toast.title && t.message === toast.message);
  toasts = same
    ? toasts.map((t) => (t === same ? { ...t, repeats: t.repeats + 1 } : t))
    : [{ ...toast, id: nextId++, duration, repeats: 0 }, ...toasts].slice(0, MAX_TOASTS);
  emit();
}

/** Called when a toast starts its exit animation. */
export function markLeaving(id: number): void {
  leaving.add(id);
}

/** Removes a toast once its exit animation has played. */
export function removeToast(id: number): void {
  leaving.delete(id);
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

export function useToasts(): Toast[] {
  return useSyncExternalStore(subscribe, () => toasts, () => EMPTY);
}

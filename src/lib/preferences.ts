"use client";

import { useSyncExternalStore } from "react";

export interface Preferences {
  /** Preferred maximum video height; the closest available quality at or below it is preselected. */
  quality: number;
  /** "mp4" for video, otherwise an audio extension ("mp3", "m4a", ...). */
  format: string;
}

const KEY = "video-downloader:preferences";
const DEFAULTS: Preferences = { quality: 1080, format: "mp4" };

let current: Preferences | null = null;
const listeners = new Set<() => void>();

function sanitize(value: unknown): Preferences {
  const v = (value && typeof value === "object" ? value : {}) as Partial<Preferences>;
  return {
    quality: typeof v.quality === "number" && v.quality > 0 ? v.quality : DEFAULTS.quality,
    format: typeof v.format === "string" && /^[a-z0-9]{2,5}$/.test(v.format) ? v.format : DEFAULTS.format,
  };
}

function read(): Preferences {
  if (current) return current;
  try {
    current = sanitize(JSON.parse(localStorage.getItem(KEY) ?? "null"));
  } catch {
    current = DEFAULTS;
  }
  return current;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function updatePreferences(patch: Partial<Preferences>): void {
  current = { ...read(), ...patch };
  try {
    localStorage.setItem(KEY, JSON.stringify(current));
  } catch {
    // storage unavailable (private mode): keep the in-memory value
  }
  for (const listener of listeners) listener();
}

/** Remembered choices from the options panel (defaults on the server and first visit). */
export function usePreferences(): Preferences {
  return useSyncExternalStore(subscribe, read, () => DEFAULTS);
}

"use client";

import {
  CalendarClock,
  HardDrive,
  Hourglass,
  Link2Off,
  ListVideo,
  Lock,
  Radio,
  SearchX,
  TimerOff,
  TriangleAlert,
  WifiOff,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useLayoutEffect, useRef } from "react";
import type { ErrorInfo } from "@/lib/api";
import { markLeaving, removeToast, showToast, useToasts, type Toast, type ToastTone } from "@/lib/toasts";
import { cn } from "./ui";

/** Short titles and icons for the server's error codes; the message itself comes from the server. */
const ERROR_KINDS: [codes: string[], title: string, Icon: LucideIcon][] = [
  [["no_video", "unavailable", "not_found"], "No video found", SearchX],
  [["unsupported_site"], "Site not supported", Link2Off],
  [["invalid_url", "unknown_host"], "Check the link", Link2Off],
  [["private", "login_required", "age_restricted", "geo_blocked"], "This video is restricted", Lock],
  [["playlist"], "That's a playlist", ListVideo],
  [["live"], "This video is live", Radio],
  [["not_started"], "Not out yet", CalendarClock],
  [["network"], "Connection problem", WifiOff],
  [["timeout"], "That took too long", TimerOff],
  [["expired"], "Download expired", TimerOff],
  [["server_busy", "rate_limited", "too_many_downloads"], "Please wait a moment", Hourglass],
  [["too_large"], "File too large", HardDrive],
];

/** Shows an API error as a toast; `fallbackTitle` is for errors without a title of their own. */
export function showErrorToast(error: ErrorInfo, fallbackTitle: string): void {
  const [, title, Icon] = ERROR_KINDS.find(([codes]) => codes.includes(error.code)) ?? [[], fallbackTitle, TriangleAlert];
  showToast({ tone: "error", title, message: error.message, Icon });
}

/** Per tone: glow colour (--tone, "r g b"), ring, icon tile and countdown bar. */
const TONES: Record<ToastTone, { vars: string; icon: string; bar: string }> = {
  error: {
    vars: "[--tone:255_92_122] [--ring:linear-gradient(135deg,rgb(255_92_122/0.85),rgb(192_77_255/0.45)_55%,rgb(91_92_255/0.15))]",
    icon: "bg-[linear-gradient(135deg,#ff6b8b,#d4337f_55%,#9b30d0)]",
    bar: "bg-[linear-gradient(90deg,#ff5c7a,#c04dff_85%,#ffd0ef)]",
  },
  info: {
    vars: "[--tone:70_150_255] [--ring:linear-gradient(135deg,rgb(74_166_255/0.85),rgb(139_92_255/0.45)_55%,rgb(91_92_255/0.15))]",
    icon: "bg-[linear-gradient(135deg,#3aa8ff,#5b5cff_55%,#8b4dff)]",
    bar: "bg-[linear-gradient(90deg,#22a6ff,#8b4dff_85%,#dcd2ff)]",
  },
};

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
/** Where toasts come from and leave to: off the right edge, or above the screen on phones, where they span the top. */
const offscreen = () => (window.matchMedia("(width >= 40rem)").matches ? "translateX(calc(100% + 2.5rem))" : "translateY(calc(-100% - 1.5rem))");
/** Slight overshoot, so toasts land with a little spring. */
const SPRING = "cubic-bezier(0.22, 1.28, 0.36, 1)";

/** The top right corner where toasts appear. Mounted once, in the root layout. */
export function Toaster() {
  const toasts = useToasts();
  return (
    <ol aria-label="Notifications" className="pointer-events-none fixed inset-x-3 top-3 z-100 flex flex-col sm:inset-x-auto sm:top-5 sm:right-5 sm:w-[23.5rem]">
      {toasts.map((toast, index) => (
        <ToastItem key={toast.id} toast={toast} layer={toasts.length - index} />
      ))}
    </ol>
  );
}

/**
 * One toast. It springs in from the corner while the ones below make room, and leaves when its
 * bar has drained (paused while hovered, focused or held), when closed, or when swiped away:
 * drag it sideways and let go past a third of its width, or flick it.
 */
function ToastItem({ toast, layer }: { toast: Toast; layer: number }) {
  const slotRef = useRef<HTMLLIElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const controls = useRef<{ dismiss: () => void; replay: () => void } | null>(null);
  const { id, duration, Icon } = toast;
  const tone = TONES[toast.tone];

  useLayoutEffect(() => {
    const slot = slotRef.current;
    const card = cardRef.current;
    const bar = barRef.current;
    if (!slot || !card || !bar) return;
    let leaving = false;
    let hovered = false;
    let focused = false;
    let drag: { pointer: number; startX: number; x: number; trail: { x: number; t: number }[] } | null = null;

    // The bar drains over `duration`; when it's empty, the toast leaves.
    const timer = bar.animate([{ transform: "translateX(0)" }, { transform: "translateX(-100%)" }], { duration, easing: "linear", fill: "forwards" });
    const syncTimer = () => {
      if (leaving || timer.playState === "finished") return;
      if (hovered || focused || drag || document.hidden) timer.pause();
      else timer.play();
    };

    const dismiss = (to = `${offscreen()} scale(0.96)`, easing = "cubic-bezier(0.5, 0, 0.75, 0)") => {
      if (leaving) return;
      leaving = true;
      timer.pause();
      markLeaving(id);
      if (reducedMotion()) return removeToast(id);
      // Leave from wherever a drag left it.
      card.animate([{ transform: card.style.transform || "none", opacity: card.style.opacity || "1" }, { transform: to, opacity: 0 }], {
        duration: 300,
        easing,
        fill: "forwards",
      });
      // Then close the gap, so the toasts below slide up.
      slot
        .animate([{ height: `${slot.offsetHeight}px`, paddingBottom: getComputedStyle(slot).paddingBottom }, { height: "0px", paddingBottom: "0px" }], {
          duration: 280,
          delay: 140,
          easing: "cubic-bezier(0.4, 0, 0.2, 1)",
          fill: "forwards",
        })
        .finished.then(
          () => removeToast(id),
          () => {},
        );
    };
    timer.onfinish = () => dismiss();

    // The same message again: restart the countdown and give the toast a shake.
    const replay = () => {
      if (leaving) return;
      timer.currentTime = 0;
      syncTimer();
      if (reducedMotion() || drag) return;
      card.animate(
        [{ transform: "none" }, { transform: "translateX(-7px)" }, { transform: "translateX(6px)" }, { transform: "translateX(-4px)" }, { transform: "translateX(2px)" }, { transform: "none" }],
        { duration: 450, easing: "ease-in-out" },
      );
    };
    controls.current = { dismiss: () => dismiss(), replay };

    // Enter: make room (height from zero) while the card springs in from the corner.
    if (reducedMotion()) {
      card.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 180, easing: "ease-out" });
    } else {
      slot.animate([{ height: "0px", paddingBottom: "0px" }, { height: `${slot.offsetHeight}px`, paddingBottom: getComputedStyle(slot).paddingBottom }], {
        duration: 420,
        easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
      });
      card.animate([{ transform: `${offscreen()} scale(0.9)`, opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 700, easing: SPRING });
    }

    const onPointerDown = (event: PointerEvent) => {
      if (leaving || event.button !== 0 || (event.target as Element).closest("button")) return;
      for (const animation of card.getAnimations()) animation.cancel(); // grab it even mid-animation
      card.setPointerCapture(event.pointerId);
      drag = { pointer: event.pointerId, startX: event.clientX, x: 0, trail: [{ x: event.clientX, t: event.timeStamp }] };
      syncTimer();
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!drag || event.pointerId !== drag.pointer) return;
      drag.x = event.clientX - drag.startX;
      drag.trail = [...drag.trail.filter((point) => event.timeStamp - point.t < 100), { x: event.clientX, t: event.timeStamp }];
      const tilt = Math.max(-5, Math.min(5, drag.x / 30));
      card.style.transform = `translateX(${drag.x}px) rotate(${tilt}deg)`;
      card.style.opacity = String(Math.max(0.25, 1 - Math.abs(drag.x) / (card.offsetWidth * 1.2)));
    };
    const onPointerUp = (event: PointerEvent) => {
      if (!drag || event.pointerId !== drag.pointer) return;
      const { x, trail } = drag;
      drag = null;
      // Speed over the last 100 ms before letting go (none if it was held still).
      const recent = [...trail.filter((point) => event.timeStamp - point.t < 100), { x: event.clientX, t: event.timeStamp }];
      const first = recent[0];
      const last = recent[recent.length - 1];
      const velocity = last.t - first.t > 0 ? (last.x - first.x) / (last.t - first.t) : 0; // px per ms
      const width = card.offsetWidth;
      const flicked = Math.abs(x) > 8 && Math.abs(velocity) > 0.45 && Math.sign(velocity) === Math.sign(x);
      if (event.type === "pointerup" && (Math.abs(x) > width * 0.3 || flicked)) {
        const direction = Math.sign(x);
        return dismiss(`translateX(${direction * (width + 80)}px) rotate(${direction * 10}deg)`, "cubic-bezier(0.25, 0.6, 0.4, 1)");
      }
      // Not far enough: spring back into place.
      const from = { transform: card.style.transform || "none", opacity: card.style.opacity || "1" };
      card.style.transform = "";
      card.style.opacity = "";
      if (x !== 0 && !reducedMotion()) card.animate([from, { transform: "none", opacity: 1 }], { duration: 550, easing: "cubic-bezier(0.25, 1.6, 0.4, 1)" });
      syncTimer();
    };
    const onPointerEnter = () => {
      hovered = true;
      syncTimer();
    };
    const onPointerLeave = () => {
      hovered = false;
      syncTimer();
    };
    const onFocusIn = () => {
      focused = true;
      syncTimer();
    };
    const onFocusOut = (event: FocusEvent) => {
      focused = card.contains(event.relatedTarget as Node | null);
      syncTimer();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };

    card.addEventListener("pointerdown", onPointerDown);
    card.addEventListener("pointermove", onPointerMove);
    card.addEventListener("pointerup", onPointerUp);
    card.addEventListener("pointercancel", onPointerUp);
    card.addEventListener("pointerenter", onPointerEnter);
    card.addEventListener("pointerleave", onPointerLeave);
    card.addEventListener("focusin", onFocusIn);
    card.addEventListener("focusout", onFocusOut);
    card.addEventListener("keydown", onKeyDown);
    document.addEventListener("visibilitychange", syncTimer);
    return () => {
      card.removeEventListener("pointerdown", onPointerDown);
      card.removeEventListener("pointermove", onPointerMove);
      card.removeEventListener("pointerup", onPointerUp);
      card.removeEventListener("pointercancel", onPointerUp);
      card.removeEventListener("pointerenter", onPointerEnter);
      card.removeEventListener("pointerleave", onPointerLeave);
      card.removeEventListener("focusin", onFocusIn);
      card.removeEventListener("focusout", onFocusOut);
      card.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("visibilitychange", syncTimer);
      timer.cancel();
      controls.current = null;
    };
  }, [id, duration]);

  useEffect(() => {
    if (toast.repeats > 0) controls.current?.replay();
  }, [toast.repeats]);

  return (
    <li ref={slotRef} className="relative pb-3" style={{ zIndex: layer }}>
      <div
        ref={cardRef}
        role={toast.tone === "error" ? "alert" : "status"}
        className={cn(
          "gradient-ring pointer-events-auto relative cursor-grab touch-pan-y overflow-hidden rounded-[1.125rem] select-none active:cursor-grabbing",
          "bg-[linear-gradient(180deg,rgb(22_29_51/0.94),rgb(11_16_31/0.95))] shadow-[0_24px_60px_-18px_rgb(0_0_0/0.9),0_0_46px_-14px_rgb(var(--tone)/0.5)] backdrop-blur-xl",
          tone.vars,
        )}
      >
        <span aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(75%_120%_at_0%_0%,rgb(var(--tone)/0.18),transparent_62%)]" />
        <div className="relative flex items-start gap-3.5 py-4 pr-12 pl-4">
          <span className={cn("relative grid size-10 shrink-0 place-items-center rounded-[30%] shadow-[0_8px_22px_-6px_rgb(var(--tone)/0.8)]", tone.icon)}>
            <Icon className="size-5 text-white" strokeWidth={2.2} aria-hidden />
            <span
              aria-hidden
              className="absolute inset-0 rounded-[inherit] bg-[linear-gradient(180deg,rgb(255_255_255/0.25),transparent_55%)] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.14)]"
            />
          </span>
          <div className="min-w-0 flex-1 pt-px">
            <p className="text-dp-15 leading-snug font-semibold text-white">{toast.title}</p>
            <p className="mt-1 text-dp-13 leading-snug text-[#aab3c8]">{toast.message}</p>
          </div>
        </div>
        <button
          type="button"
          aria-label="Dismiss notification"
          onClick={() => controls.current?.dismiss()}
          className="absolute top-3 right-3 grid size-7 cursor-pointer place-items-center rounded-full text-[#7d87a3] transition-colors hover:bg-white/8 hover:text-white focus-visible:outline-2 focus-visible:outline-[#5b8cff]"
        >
          <X className="size-4" aria-hidden />
        </button>
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-0.75 overflow-x-clip bg-white/[0.06]">
          <div ref={barRef} className={cn("size-full shadow-[0_0_12px_rgb(var(--tone)/0.9)]", tone.bar)} />
        </div>
      </div>
    </li>
  );
}

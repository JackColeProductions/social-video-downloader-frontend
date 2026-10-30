"use client";

import { Globe, Link2, X } from "lucide-react";
import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { FEATURED_PLATFORMS, MORE_PLATFORMS } from "@/lib/platforms";
import { AppIcon } from "./brand-icons";
import type { BrandKey } from "./brand-paths";
import { cn } from "./ui";

/** Colour of the glow under each icon, as "r g b". */
const GLOW: Record<BrandKey, string> = {
  youtube: "255 40 40",
  instagram: "236 64 140",
  tiktok: "37 244 238",
  facebook: "24 119 242",
  x: "170 182 210",
  vimeo: "23 179 232",
  dailymotion: "120 140 255",
  reddit: "255 69 0",
  twitch: "145 70 255",
  soundcloud: "255 102 0",
  pinterest: "230 0 35",
  threads: "170 182 210",
  bluesky: "17 133 254",
  snapchat: "255 225 0",
  tumblr: "70 110 170",
  bilibili: "0 174 236",
  rumble: "133 199 66",
  kick: "83 252 24",
};
const MORE_GLOW = "139 92 255";

const glowStyle = (rgb: string) => ({ "--glow": rgb }) as CSSProperties;

/*
 * Both states list the same four shadows (gap, ring, drop glow, halo), so the ring grows out of
 * nothing instead of morphing out of the glow. Everything eases over half a second.
 */
const ease = "duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]";
const icon = cn(
  "relative size-12 rounded-[26%] transition-[translate,scale,box-shadow,opacity,filter] sm:size-14",
  ease,
  "shadow-[0_0_0_0_transparent,0_0_0_0_transparent,0_10px_22px_-10px_rgb(var(--glow)/0.9),0_0_26px_-10px_rgb(var(--glow)/0.45)]",
);
/** The platform the pasted link belongs to: lifted, with a ring in its colour. */
const iconActive =
  "-translate-y-1 scale-110 shadow-[0_0_0_2px_var(--bg),0_0_0_3.5px_rgb(var(--glow)/0.95),0_14px_30px_-8px_rgb(var(--glow)/0.9),0_0_34px_-6px_rgb(var(--glow)/0.55)]";
const label = cn("mt-2.5 text-center text-dp-13 leading-4.5 transition-colors", ease);

/** Glass highlight and a hairline edge over an icon. */
function Gloss() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[linear-gradient(180deg,rgb(255_255_255/0.2),transparent_52%)] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.12),inset_0_1px_0_rgb(255_255_255/0.3)]"
    />
  );
}

/** Stops the page scrolling behind a dialog, keeping the scrollbar's space so nothing shifts. */
function lockScroll() {
  const root = document.documentElement;
  const hasScrollbar = window.innerWidth > root.clientWidth;
  root.style.overflow = "hidden";
  if (hasScrollbar) root.style.scrollbarGutter = "stable";
  return () => {
    root.style.overflow = "";
    root.style.scrollbarGutter = "";
  };
}

/**
 * The "More" platforms as a modal dialog: rises in over a blurred backdrop, its icons popping in
 * one after another; closes with Esc, the close button or a click outside, sinking away first.
 */
function MorePlatformsDialog({ open, active, onClose }: { open: boolean; active: BrandKey | null; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pressedOutside = useRef(false);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog) return;
    const unlock = lockScroll();
    dialog.showModal();
    return () => {
      unlock();
      dialog.removeAttribute("data-closing");
      if (dialog.open) dialog.close();
    };
  }, [open]);

  // Plays the closing animation, then closes for real; the dialog's close event updates the state.
  function requestClose() {
    const dialog = dialogRef.current;
    if (!dialog?.open || dialog.hasAttribute("data-closing")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return dialog.close();
    dialog.setAttribute("data-closing", "");
    let fallback = 0;
    const finish = (event?: AnimationEvent) => {
      if (event && event.target !== dialog) return; // an icon's animation, not the dialog's
      dialog.removeEventListener("animationend", finish);
      window.clearTimeout(fallback);
      dialog.close();
    };
    dialog.addEventListener("animationend", finish);
    fallback = window.setTimeout(finish, 400);
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={(event) => {
        event.preventDefault();
        requestClose();
      }}
      onClose={onClose}
      // Clicks on the backdrop land on the dialog itself; only close when the press started there too.
      onPointerDown={(event) => {
        pressedOutside.current = event.target === event.currentTarget;
      }}
      onClick={(event) => {
        if (pressedOutside.current && event.target === event.currentTarget) requestClose();
      }}
      className="platforms-dialog m-auto w-[min(37rem,calc(100vw-2rem))] max-w-none overflow-visible border-0 bg-transparent p-0 text-fg"
    >
      <div className="gradient-ring relative overflow-hidden rounded-[1.75rem] bg-[linear-gradient(180deg,#111a31,#0a1020_60%,#080d1a)] shadow-[0_40px_120px_-30px_rgb(0_0_0/0.95),0_0_90px_-30px_rgb(91_92_255/0.6)] [--ring:linear-gradient(180deg,rgb(140_160_255/0.5),rgb(140_160_255/0.1)_45%,rgb(170_100_255/0.3))]">
        {/* Light falling from above. */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 h-56 w-[120%] -translate-x-1/2 bg-[radial-gradient(closest-side,rgb(91_120_255/0.32),rgb(139_77_255/0.12)_55%,transparent)]"
        />
        <div className="relative max-h-[calc(100svh-2rem)] overflow-y-auto px-5 pt-6 pb-5 sm:px-8 sm:pt-8 sm:pb-7">
          <div className="flex items-center gap-4 pr-10">
            <span className="relative grid size-12 shrink-0 place-items-center rounded-[26%] bg-[linear-gradient(135deg,#1fb0ff,#5b5cff_55%,#b04dff)] shadow-[0_12px_30px_-10px_rgb(91_92_255/0.9)]">
              <Globe className="size-6 text-white" strokeWidth={2} aria-hidden />
              <Gloss />
            </span>
            <div className="min-w-0">
              <h2 id={titleId} className="text-dp-21 font-bold text-white">
                More platforms
              </h2>
              <p id={descriptionId} className="mt-1 text-dp-14 leading-snug text-muted">
                Links from these work too, along with <span className="text-gradient-brand font-semibold">1,800+</span> other sites.
              </p>
            </div>
          </div>

          <ul className="mt-7 flex flex-wrap justify-center gap-x-2 gap-y-5 sm:gap-x-3">
            {MORE_PLATFORMS.map((platform, index) => {
              const highlighted = platform.brand === active;
              return (
                <li
                  key={platform.brand}
                  className="flex w-17 flex-col items-center motion-safe:animate-tile-in sm:w-19"
                  style={{ animationDelay: `${120 + index * 35}ms` }}
                >
                  <span className={cn(icon, highlighted && iconActive)} style={glowStyle(GLOW[platform.brand])}>
                    <AppIcon brand={platform.brand} className="size-full" />
                    <Gloss />
                  </span>
                  <span className={cn(label, highlighted ? "text-fg" : "text-[#a3abc2]")}>{platform.name}</span>
                </li>
              );
            })}
          </ul>

          <p className="mt-7 flex items-center gap-3 rounded-2xl border border-white/6 bg-white/[0.025] px-4 py-3 text-dp-13 leading-snug text-[#a3abc2]">
            <Link2 className="size-4.5 shrink-0 text-[#7aa2ff]" aria-hidden />
            Don&apos;t see your site? Paste the link anyway. Most video pages work.
          </p>
        </div>

        <button
          type="button"
          aria-label="Close"
          onClick={requestClose}
          className="absolute top-4 right-4 grid size-9 cursor-pointer place-items-center rounded-full bg-white/[0.04] text-[#9aa6c4] ring-1 ring-white/8 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5b8cff] sm:top-5 sm:right-5"
        >
          <X className="size-4.5" aria-hidden />
        </button>
      </div>
    </dialog>
  );
}

export function PlatformTiles({ active }: { active: BrandKey | null }) {
  const [moreOpen, setMoreOpen] = useState(false);
  const activeInMore = MORE_PLATFORMS.some((platform) => platform.brand === active);

  return (
    <ul
      aria-label="Supported platforms"
      className="mx-auto mt-8 grid grid-cols-4 justify-items-center gap-x-3 gap-y-6 sm:flex sm:justify-center sm:gap-x-3 lg:mt-7.5 lg:gap-x-7"
    >
      {FEATURED_PLATFORMS.map((platform) => {
        const highlighted = platform.brand === active;
        return (
          <li key={platform.brand} className="flex w-full flex-col items-center sm:w-21">
            <span className={cn(icon, highlighted ? iconActive : active && "opacity-40 saturate-[0.6]")} style={glowStyle(GLOW[platform.brand])}>
              <AppIcon brand={platform.brand} className="size-full" />
              <Gloss />
            </span>
            <span className={cn(label, highlighted ? "text-fg" : active ? "text-[#6f7b93]" : "text-[#a3abc2]")}>
              {platform.name}
            </span>
          </li>
        );
      })}

      <li className="flex w-full flex-col items-center sm:w-21">
        <button
          type="button"
          aria-haspopup="dialog"
          aria-label="More supported platforms"
          onClick={() => setMoreOpen(true)}
          style={glowStyle(MORE_GLOW)}
          className={cn(
            icon,
            "grid place-items-center bg-[linear-gradient(180deg,#1a2238,#0c1220)] hover:-translate-y-0.5",
            "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5b8cff]",
            (activeInMore || moreOpen) && iconActive,
          )}
        >
          <span className="flex gap-1.25" aria-hidden>
            {[0, 1, 2].map((dot) => (
              <span key={dot} className="size-1.5 rounded-full bg-[#b9c1dc]" />
            ))}
          </span>
          <Gloss />
        </button>
        <span className={cn(label, activeInMore ? "text-fg" : "text-[#a3abc2]")}>More</span>
        <MorePlatformsDialog open={moreOpen} active={active} onClose={() => setMoreOpen(false)} />
      </li>
    </ul>
  );
}

import { Play } from "lucide-react";
import Image from "next/image";
import type { CSSProperties } from "react";
import mountain from "../../public/hero/mountain.webp";
import city from "../../public/hero/city.webp";
import { AppIcon } from "./brand-icons";
import type { BrandKey } from "./brand-paths";
import { cn } from "./ui";

/*
 * The two tilted video cards beside the headline. Positions and angles are taken from the
 * mockup (1536px canvas, in rem so they scale with the page); each side is pinned to its viewport
 * edge and slides further out on narrower screens so it never overlaps the headline. Hidden below
 * the lg breakpoint.
 */

function PlayButton({ className }: { className: string }) {
  return (
    <span
      className={cn(
        "absolute grid aspect-square -translate-1/2 place-items-center rounded-full bg-[#0b0f1a]/55 shadow-[0_6px_24px_rgb(0_0_0/0.45)] ring-[1.5px] ring-white/45 backdrop-blur-md",
        className,
      )}
    >
      <Play className="size-[38%] translate-x-[6%] fill-white text-white" strokeWidth={1.5} />
    </span>
  );
}

/**
 * Timing for one floating element (animate-float-card / animate-float-badge): its own period, and
 * how far into the cycle it starts, so the elements drift in and out of step.
 */
const drift = (seconds: number, startAt: number): CSSProperties => ({ animationDuration: `${seconds}s`, animationDelay: `-${startAt}s` });

/**
 * A platform's app icon floating beside a card. All four are the same size and style, each with
 * a glow in its brand's colour (set through `className`, with the position and tilt).
 */
function FloatingBadge({ brand, className, timing }: { brand: BrandKey; className: string; timing: CSSProperties }) {
  return (
    <span className={cn("absolute size-16 -translate-1/2 rounded-[26%] motion-safe:animate-float-badge", className)} style={timing}>
      <AppIcon brand={brand} className="size-full" />
      <span
        aria-hidden
        className="absolute inset-0 rounded-[inherit] bg-[linear-gradient(180deg,rgb(255_255_255/0.22),transparent_50%)] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.16),inset_0_1px_0_rgb(255_255_255/0.35)]"
      />
    </span>
  );
}

function Duration({ children, className }: { children: string; className: string }) {
  return (
    <span className={cn("absolute rounded-[0.5rem] bg-black/65 px-2.25 py-0.75 text-dp-15 font-semibold tracking-wide text-white backdrop-blur", className)}>
      {children}
    </span>
  );
}

export function HeroDecor() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-(--canvas-top) hidden h-117.5 lg:block">
      {/* Left: mountain lake + YouTube and Facebook badges (mockup canvas coordinates). */}
      <div className="absolute top-0 h-117.5 w-120" style={{ left: "min(0px, calc(50vw - 48rem))" }}>
        {/* The soft plate behind the card trails it slightly, for depth. */}
        <div
          className="absolute top-47.5 left-27.5 h-67.5 w-100 -translate-1/2 rotate-[-14.65deg] rounded-[2.125rem] bg-[linear-gradient(140deg,rgb(116_76_255/0.34),rgb(70_50_200/0.04)_70%)] blur-[0.375rem] motion-safe:animate-float-card"
          style={drift(8, 1.4)}
        />
        <div
          className="gradient-ring absolute top-59.5 left-44.25 h-62.75 w-101.25 -translate-1/2 rotate-[-14.65deg] rounded-[1.375rem] shadow-[0_0_44px_-6px_rgb(123_77_255/0.7),0_24px_60px_-24px_rgb(0_0_0/0.9)] [--ring-width:2.5px] [--ring:linear-gradient(225deg,#a6ecff_0%,#6b84ff_42%,#8b4dff_100%)] motion-safe:animate-float-card"
          style={drift(8, 2)}
        >
          <div className="absolute inset-[2.5px] overflow-hidden rounded-[calc(1.375rem-2.5px)]">
            <Image src={mountain} alt="" priority sizes="400px" className="size-full object-cover" />
            <PlayButton className="top-[52.6%] left-[51.5%] w-[18%]" />
            <Duration className="right-[2.5%] bottom-[3.4%]">4:32</Duration>
          </div>
        </div>
        {/*
          Two badges per card, mirrored across the page: one beside the inner edge near the top, one
          below the outer half. Each stays about 40px clear of its card, more than the two float apart.
        */}
        <FloatingBadge
          brand="youtube"
          className="top-29.5 left-108 -rotate-9 shadow-[0_0_34px_rgb(255_40_40/0.45),0_12px_26px_-10px_rgb(0_0_0/0.7)]"
          timing={drift(6, 0.5)}
        />
        <FloatingBadge
          brand="facebook"
          className="top-113.75 left-37.5 -rotate-6 shadow-[0_0_34px_rgb(24_119_242/0.5),0_12px_26px_-10px_rgb(0_0_0/0.7)]"
          timing={drift(6.6, 3.4)}
        />
      </div>

      {/* Right: city at night + TikTok and Instagram badges. */}
      <div className="absolute top-0 h-117.5 w-130" style={{ right: "min(0px, calc(50vw - 48rem))" }}>
        <div
          className="gradient-ring absolute top-60.25 left-82 h-59 w-91.75 -translate-1/2 rotate-[14.05deg] rounded-[1.375rem] shadow-[-10px_14px_44px_-8px_rgb(123_77_255/0.6),0_24px_60px_-24px_rgb(0_0_0/0.9)] [--ring-width:2px] [--ring:linear-gradient(160deg,#c3d1ff_0%,#7083c8_40%,#7b4dff_100%)] motion-safe:animate-float-card"
          style={drift(9.5, 5)}
        >
          <div className="absolute inset-[2px] overflow-hidden rounded-[calc(1.375rem-2px)]">
            <Image src={city} alt="" priority sizes="370px" className="size-full object-cover" />
            <PlayButton className="top-[54.6%] left-[48.75%] w-[18.5%]" />
            <Duration className="right-[3.6%] bottom-[4.4%]">8:14</Duration>
          </div>
        </div>
        <FloatingBadge
          brand="tiktok"
          className="top-29.5 left-22 rotate-6 shadow-[0_0_34px_rgb(37_244_238/0.28),0_12px_26px_-10px_rgb(0_0_0/0.7)]"
          timing={drift(7, 2.2)}
        />
        <FloatingBadge
          brand="instagram"
          className="top-113.75 left-92.5 rotate-10 shadow-[0_0_34px_rgb(253_89_73/0.45),0_12px_26px_-10px_rgb(0_0_0/0.7)]"
          timing={drift(5.5, 3)}
        />
      </div>
    </div>
  );
}

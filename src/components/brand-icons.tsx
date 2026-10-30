import { Play } from "lucide-react";
import type { ReactElement } from "react";
import { BRAND_PATHS, type BrandKey } from "./brand-paths";
import { cn } from "./ui";

interface MarkProps {
  className?: string;
}

/*
 * Platform marks as drawn in the mockup. Gradients use CSS backgrounds rather than SVG
 * gradient ids, so every instance renders even if another copy on the page is hidden.
 */

/** Corner radius shared by every square mark and app icon. */
const TILE = "grid place-items-center rounded-[26%]";

export function YouTubeMark({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <rect x="0.5" y="4.3" width="23" height="15.4" rx="4.6" fill="#ff1f1f" />
      <path d="M9.7 8.5v7l6-3.5z" fill="#fff" />
    </svg>
  );
}

export function InstagramMark({ className }: MarkProps) {
  return (
    <span
      aria-hidden
      className={cn(TILE, "bg-[radial-gradient(circle_at_30%_107%,#fdf497_0%,#fdf497_5%,#fd5949_45%,#d6249f_62%,#6a3cf5_95%)]", className)}
    >
      <svg viewBox="0 0 24 24" className="size-[80%]">
        <rect x="4" y="4" width="16" height="16" rx="4.8" fill="none" stroke="#fff" strokeWidth="2.1" />
        <circle cx="12" cy="12" r="3.75" fill="none" stroke="#fff" strokeWidth="2.1" />
        <circle cx="16.7" cy="7.3" r="1.2" fill="#fff" />
      </svg>
    </span>
  );
}

export function TikTokMark({ className }: MarkProps) {
  const d = BRAND_PATHS.tiktok;
  return (
    <span aria-hidden className={cn(TILE, "bg-black", className)}>
      <svg viewBox="0 0 24 24" className="size-[72%]">
        <path d={d} fill="#25f4ee" transform="translate(-0.8 -0.6)" />
        <path d={d} fill="#fe2c55" transform="translate(0.8 0.6)" />
        <path d={d} fill="#fff" />
      </svg>
    </span>
  );
}

export function FacebookMark({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="12" cy="12" r="11.4" fill="#fff" />
      <path d={BRAND_PATHS.facebook} fill="#0866ff" />
    </svg>
  );
}

export function XMark({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d={BRAND_PATHS.x} fill="#fff" transform="translate(1.8 1.8) scale(0.85)" />
    </svg>
  );
}

export function VimeoMark({ className }: MarkProps) {
  return (
    <span aria-hidden className={cn(TILE, "bg-[#17b3e8]", className)}>
      <svg viewBox="0 0 24 24" className="size-[68%]">
        <path d={BRAND_PATHS.vimeo} fill="#fff" />
      </svg>
    </span>
  );
}

/** White disc with a bold italic "D", as in the mockup. */
export function DailymotionMark({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="12" cy="12" r="12" fill="#fff" />
      <path
        fillRule="evenodd"
        fill="#0a0a0a"
        d="M8.9 6.2h4.2c3.1 0 5.1 1.9 5.1 4.8 0 3.7-2.7 6.8-7 6.8H6.6zm2.1 3.1-1.3 5.4h1.6c2.2 0 3.7-1.6 3.7-3.5 0-1.2-.9-1.9-2.4-1.9z"
      />
    </svg>
  );
}

/** App icon colours for the other brands: the tile, and the glyph when it isn't white. */
const BRAND_TILES: Partial<Record<BrandKey, { tile: string; glyph?: string }>> = {
  reddit: { tile: "from-[#ff6a2b] to-[#ff4500]" },
  twitch: { tile: "from-[#a970ff] to-[#9146ff]" },
  soundcloud: { tile: "from-[#ff8c1a] to-[#ff5500]" },
  pinterest: { tile: "from-[#ff2d55] to-[#e60023]" },
  threads: { tile: "from-[#1b1d24] to-[#050507]" },
  bluesky: { tile: "from-[#3d9bff] to-[#0a7aff]" },
  tumblr: { tile: "from-[#34557c] to-[#001935]" },
  bilibili: { tile: "from-[#3fd0ff] to-[#00a1d6]" },
  rumble: { tile: "from-[#9ad45a] to-[#6fb22e]" },
  kick: { tile: "from-[#7dff4d] to-[#53fc18]", glyph: "text-[#0b0e0f]" },
};

/** A platform's logo as an app icon: a rounded tile in the brand's colours, like on a phone. */
export function AppIcon({ brand, className }: { brand: BrandKey; className?: string }) {
  switch (brand) {
    case "youtube":
      return (
        <span aria-hidden className={cn(TILE, "bg-gradient-to-b from-[#ff4a4a] to-[#e10b0b]", className)}>
          <svg viewBox="0 0 24 24" className="size-[62.5%]">
            <rect x="3.6" y="6.2" width="16.8" height="11.6" rx="3.4" fill="#fff" />
            <path d="M10.3 9.3v5.4l4.6-2.7z" fill="#f01818" />
          </svg>
        </span>
      );
    case "instagram":
      return <InstagramMark className={className} />;
    case "tiktok":
      return <TikTokMark className={className} />;
    case "vimeo":
      return <VimeoMark className={className} />;
    case "facebook":
      return (
        <span aria-hidden className={cn(TILE, "bg-gradient-to-b from-[#2f8dff] to-[#0866ff]", className)}>
          <FacebookMark className="size-[62%]" />
        </span>
      );
    case "x":
    case "dailymotion": {
      const Mark = brand === "x" ? XMark : DailymotionMark;
      return (
        <span aria-hidden className={cn(TILE, "bg-gradient-to-b from-[#1b1d24] to-[#050507]", className)}>
          <Mark className={brand === "x" ? "size-[60%]" : "size-[56%]"} />
        </span>
      );
    }
    case "snapchat":
      // The white ghost with a black outline, on yellow.
      return (
        <span aria-hidden className={cn(TILE, "bg-gradient-to-b from-[#fffc4d] to-[#fff200]", className)}>
          <svg viewBox="0 0 24 24" className="size-[60%]">
            <path d={BRAND_PATHS.snapchat} fill="#fff" stroke="#111" strokeWidth="1.3" strokeLinejoin="round" />
          </svg>
        </span>
      );
    default: {
      const colours = BRAND_TILES[brand];
      return (
        <span aria-hidden className={cn(TILE, colours ? `bg-gradient-to-b ${colours.tile}` : "bg-[#111a2b]", className)}>
          <BrandGlyph brand={brand} className={cn("size-[56%]", colours?.glyph ?? "text-white")} />
        </span>
      );
    }
  }
}

/** Single-colour glyph for any supported brand, in the current text colour. */
export function BrandGlyph({ brand, className }: { brand: BrandKey; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d={BRAND_PATHS[brand]} />
    </svg>
  );
}

const MARKS: Partial<Record<BrandKey, (props: MarkProps) => ReactElement>> = {
  youtube: YouTubeMark,
  instagram: InstagramMark,
  tiktok: TikTokMark,
  facebook: FacebookMark,
  x: XMark,
  vimeo: VimeoMark,
  dailymotion: DailymotionMark,
};

/** Coloured mark when we have one, a mono glyph for other known brands, a play icon otherwise. */
export function PlatformMark({ brand, className }: { brand: BrandKey | null; className?: string }) {
  const Mark = brand ? MARKS[brand] : undefined;
  if (Mark) return <Mark className={className} />;
  if (brand) return <BrandGlyph brand={brand} className={cn("text-fg", className)} />;
  return <Play className={cn("fill-current text-fg", className)} aria-hidden />;
}

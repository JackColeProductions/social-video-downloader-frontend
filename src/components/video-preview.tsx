"use client";

import { Clock, Film, Play, User } from "lucide-react";
import { useState } from "react";
import { apiAssetUrl } from "@/lib/api";
import type { MediaItem } from "@/lib/api-types";
import { formatDuration } from "@/lib/format";
import { brandForPlatform } from "@/lib/platforms";
import { AppIcon, PlatformMark } from "./brand-icons";
import type { BrandKey } from "./brand-paths";
import { cn } from "./ui";

/** The tilted app icon on the thumbnail corner, like the hero cards' badges. */
function PlatformBadge({ brand }: { brand: BrandKey | null }) {
  const placement = "absolute -top-3 -right-3 size-11 rotate-[-8deg] shadow-[0_6px_22px_-4px_rgb(0_0_0/0.65)] ring-1 ring-white/15";
  if (brand) return <AppIcon brand={brand} className={placement} />;
  return (
    <span className={cn(placement, "grid place-items-center rounded-[26%] bg-tile")}>
      <PlatformMark brand={null} className="size-6" />
    </span>
  );
}

interface VideoPreviewProps {
  item: MediaItem;
  platform: string;
  sourceUrl: string;
  /** Multi-video posts: all items and the selected position. */
  items: MediaItem[];
  position: number;
  disabled: boolean;
  onPick: (position: number) => void;
}

export function VideoPreview({ item, platform, sourceUrl, items, position, disabled, onPick }: VideoPreviewProps) {
  const [thumbnail, setThumbnail] = useState<"loading" | "loaded" | "failed">("loading");
  const vertical = (item.aspectRatio ?? 16 / 9) < 1;
  const duration = formatDuration(item.duration);
  const brand = brandForPlatform(platform);

  return (
    <div className={cn("flex gap-5 sm:gap-7", vertical ? "flex-row items-start" : "flex-col sm:flex-row sm:items-center")}>
      {/* Landscape thumbnails grow on desktop, where the panel is wide; portrait ones are tall enough already. */}
      <div className={cn("relative shrink-0", vertical ? "w-29.5 sm:w-33" : "w-full sm:w-75 lg:w-100")}>
        <div className="gradient-ring rounded-[1.125rem] p-[2px] shadow-[0_0_38px_-8px_rgb(123_77_255/0.75)] [--ring-width:2px] [--ring:linear-gradient(225deg,#a6ecff_0%,#6b84ff_42%,#8b4dff_100%)]">
          <div
            className={cn(
              "relative overflow-hidden rounded-[calc(1.125rem-2px)] bg-[#0c1322]",
              vertical ? "aspect-[9/16]" : "aspect-video",
              item.thumbnail && thumbnail === "loading" && "skeleton animate-shimmer",
            )}
          >
            {item.thumbnail && thumbnail !== "failed" ? (
              // Served by the API's signed thumbnail proxy; Next's image optimizer would add nothing here.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={apiAssetUrl(item.thumbnail)}
                alt=""
                decoding="async"
                referrerPolicy="no-referrer"
                onLoad={() => setThumbnail("loaded")}
                onError={() => setThumbnail("failed")}
                className={cn("size-full object-cover transition-opacity duration-300", thumbnail === "loaded" ? "opacity-100" : "opacity-0")}
              />
            ) : (
              <div className="grid size-full place-items-center text-subtle">
                <Film className="size-9" aria-hidden />
              </div>
            )}
            <a
              href={sourceUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Open the original video"
              className="absolute top-1/2 left-1/2 grid size-14 -translate-1/2 place-items-center rounded-full bg-[#0b0f1a]/55 shadow-[0_6px_24px_rgb(0_0_0/0.45)] ring-[1.5px] ring-white/45 backdrop-blur-md transition-transform hover:scale-105"
            >
              <Play className="size-6 translate-x-0.5 fill-white text-white" strokeWidth={1.5} />
            </a>
            {duration && (
              <span className="absolute right-2 bottom-2 rounded-[0.4375rem] bg-black/65 px-2 py-0.5 text-dp-13 font-semibold tracking-wide text-white backdrop-blur">
                {duration}
              </span>
            )}
          </div>
        </div>
        <PlatformBadge brand={brand} />
      </div>

      <div className="min-w-0 flex-1">
        <span className="gradient-ring inline-flex items-center gap-2 rounded-full bg-[#0b1020]/70 px-3 py-1 text-dp-13 font-medium [--ring:linear-gradient(90deg,rgb(74_166_255/0.5),rgb(139_108_255/0.5))]">
          <span className="text-gradient-brand">{platform}</span>
        </span>
        <h2 className="mt-3 line-clamp-3 text-dp-19 leading-snug font-bold break-words text-fg sm:line-clamp-2 sm:text-dp-22">{item.title}</h2>
        <div className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-1 text-dp-15 text-muted">
          {item.uploader && (
            <span className="inline-flex min-w-0 items-center gap-2">
              <User className="size-4 shrink-0" aria-hidden />
              <span className="truncate">{item.uploader}</span>
            </span>
          )}
          {duration && (
            <span className="inline-flex items-center gap-2">
              <Clock className="size-4" aria-hidden />
              {duration}
            </span>
          )}
        </div>

        {items.length > 1 && (
          <div className="mt-4 flex flex-wrap items-center gap-2" role="radiogroup" aria-label="Video in this post">
            <span className="mr-1 text-dp-13 text-subtle">{items.length} videos in this post</span>
            {items.map((entry, index) => (
              <button
                key={`${entry.id}-${index}`}
                type="button"
                role="radio"
                aria-checked={index === position}
                disabled={disabled}
                onClick={() => onPick(index)}
                className={cn(
                  "gradient-ring grid size-9 place-items-center rounded-[0.625rem] border text-dp-14 font-semibold tabular-nums disabled:opacity-55",
                  "transition-[color,border-color,box-shadow,background-color] duration-250",
                  index === position ? "chip-selected border-transparent text-white" : "border-chip-border bg-chip text-muted hover:text-fg",
                )}
              >
                {index + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

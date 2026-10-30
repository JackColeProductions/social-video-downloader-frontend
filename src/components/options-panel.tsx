import { Check, Music, Settings, Video, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "./ui";

/** The panel shell for the fetched video. */
export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={cn(
        "rounded-[1.375rem] border border-panel-border bg-[linear-gradient(180deg,rgb(13_20_33/0.94),rgb(9_15_26/0.94))] px-5 pt-6 pb-7",
        "shadow-[inset_0_1px_0_rgb(255_255_255/0.035),0_30px_80px_-40px_rgb(0_0_0/0.9)] sm:px-8.5 sm:pt-6.75 sm:pb-8.5",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function SectionHeader({ Icon, label }: { Icon: LucideIcon; label: string }) {
  return (
    <p className="flex items-center gap-3 text-dp-17 font-medium text-[#c8cfe0]">
      <Icon className="size-5.75 text-[#9aa6c4]" strokeWidth={1.75} aria-hidden />
      {label}
    </p>
  );
}

export const SECTION_ICONS = { quality: Settings };

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5b8cff]";

/** Per tier (2K and up, HD, SD, audio): the pill's colours and the card's corner glow (--tier). */
const TIERS = {
  uhd: { pill: "bg-[linear-gradient(135deg,#7b4dff,#c04dff)] text-white shadow-[0_0_14px_-3px_rgb(170_80_255/0.85)]", glow: "[--tier:150_80_255]" },
  hd: { pill: "bg-[rgb(56_120_255/0.2)] text-[#a9c7ff]", glow: "[--tier:46_130_255]" },
  sd: { pill: "bg-[rgb(148_163_184/0.13)] text-[#b0b9cf]", glow: "[--tier:110_122_170]" },
  audio: { pill: "bg-[rgb(45_212_191/0.15)] text-[#7eead0]", glow: "[--tier:40_200_170]" },
};

export type QualityTone = keyof typeof TIERS;

/** "1080p60" -> ["1080", "p60"], "129 kbps" -> ["129", " kbps"], so the number can stand out. */
const splitLabel = (label: string) => /^(\d+)(.*)$/.exec(label)?.slice(1) ?? [label, ""];

interface QualityChipProps {
  /** "1080p60", or the bitrate for audio. */
  label: string;
  /** "4K", "Full HD", "SD", "MP3"... */
  badge: string;
  tone: QualityTone;
  size: string;
  selected: boolean;
  disabled?: boolean;
  onSelect: () => void;
}

/**
 * One quality as a card: the tier pill (and a check once chosen) on top, then the resolution and
 * file size. Cards grow to share the row. The look of each state is in globals.css (.quality-card).
 */
export function QualityChip({ label, badge, tone, size, selected, disabled, onSelect }: QualityChipProps) {
  const [value, unit] = splitLabel(label);
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        "gradient-ring quality-card flex max-w-48 min-w-0 flex-[1_1_7.5rem] flex-col gap-3 rounded-2xl border px-3.5 pt-3 pb-3.5 text-left",
        "transition-[translate,scale,border-color,box-shadow] duration-250 ease-out enabled:active:scale-[0.98]",
        TIERS[tone].glow,
        !selected && "enabled:hover:-translate-y-0.5",
        focusRing,
        "disabled:cursor-not-allowed disabled:opacity-55",
      )}
    >
      <span
        aria-hidden
        className={cn("quality-glow pointer-events-none absolute inset-0 -z-2 rounded-[inherit] transition-opacity duration-300", selected ? "opacity-100" : "opacity-0")}
      />
      <span aria-hidden className="quality-shine pointer-events-none absolute inset-0 -z-1 overflow-hidden rounded-[inherit]" />
      <span className="flex h-4.5 items-center justify-between gap-2">
        <span className={cn("truncate rounded-full px-2 py-0.75 text-dp-10.5 leading-none font-bold tracking-wide", TIERS[tone].pill)}>{badge}</span>
        <span
          aria-hidden
          className={cn(
            "grid size-4.5 shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,#22b0ff,#6a5cff_55%,#a24dff)] shadow-[0_0_12px_-1px_rgb(120_90_255/0.85)]",
            "transition-[scale,opacity] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
            selected ? "scale-100 opacity-100" : "scale-50 opacity-0",
          )}
        >
          <Check className="size-3 text-white" strokeWidth={3.5} />
        </span>
      </span>
      <span className="flex min-w-0 flex-col gap-1.5">
        <span className="truncate text-dp-20 leading-none font-bold tracking-tight text-white">
          {value}
          <span className={cn("font-semibold transition-colors duration-250", selected ? "text-[#b8a8ff]" : "text-[#7f8aa8]")}>{unit}</span>
        </span>
        <span className={cn("truncate text-dp-13 leading-tight font-medium tabular-nums transition-colors duration-250", selected ? "text-[#cfc3ff]" : "text-[#8792ae]")}>
          {size}
        </span>
      </span>
    </button>
  );
}

export interface FormatOption {
  value: string;
  label: string;
  kind: "video" | "audio";
}

/** Video or audio format as a pill-shaped toggle; the qualities below follow it. */
export function FormatSwitch({ options, value, disabled, onChange }: { options: FormatOption[]; value: string; disabled?: boolean; onChange: (value: string) => void }) {
  return (
    <div role="radiogroup" aria-label="Format" className="flex w-full gap-1 rounded-full border border-chip-border bg-chip p-1 sm:w-auto">
      {options.map((option) => {
        const selected = option.value === value;
        const Icon = option.kind === "video" ? Video : Music;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              "gradient-ring flex h-9 flex-1 items-center justify-center gap-2 rounded-full px-4 text-dp-14 font-bold sm:flex-none",
              "transition-[color,box-shadow,background-color] duration-250",
              selected ? "chip-selected-violet text-white" : "text-[#8f9ab3] hover:text-[#c8cfe0]",
              focusRing,
              "disabled:cursor-not-allowed disabled:opacity-55",
            )}
          >
            <Icon
              className={cn("size-4.5 shrink-0", selected && (option.kind === "video" ? "fill-[#7c4dff] text-[#7c4dff]" : "text-[#a37bff]"))}
              strokeWidth={option.kind === "video" ? 1.6 : 1.9}
              aria-hidden
            />
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

import { CircleAlert } from "lucide-react";
import type { ReactNode } from "react";

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5b8cff]";

export const buttonStyles = {
  /** Gradient call-to-action, as on the mockup's "Download" button. */
  primary: cn(
    "bg-gradient-cta inline-flex items-center justify-center gap-2.5 rounded-[0.875rem] px-6 font-semibold text-white",
    "shadow-[0_10px_30px_-10px_rgb(124_77_255/0.75),0_0_22px_-6px_rgb(31_176_255/0.55)] transition-[filter,transform] duration-150",
    "hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:brightness-100",
    focusRing,
  ),
  secondary: cn(
    "inline-flex items-center justify-center gap-2 rounded-[0.75rem] border border-chip-border bg-chip px-4 py-2.5 text-sm font-medium text-fg",
    "transition-colors hover:border-[#2a3756] hover:bg-[#101827] disabled:cursor-not-allowed disabled:opacity-60",
    focusRing,
  ),
  ghost: cn(
    "inline-flex items-center justify-center gap-2 rounded-[0.75rem] px-3 py-2 text-sm font-medium text-muted",
    "transition-colors hover:bg-white/5 hover:text-fg",
    focusRing,
  ),
};

export function ProgressBar({ value, indeterminate, label }: { value: number | null; indeterminate: boolean; label: string }) {
  const percent = Math.max(0, Math.min(100, value ?? 0));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={indeterminate ? undefined : Math.round(percent)}
      className="relative h-2.5 overflow-hidden rounded-full bg-[#121b2d] ring-1 ring-white/5"
    >
      {indeterminate ? (
        <div className="bg-gradient-progress absolute inset-y-0 left-0 w-2/5 animate-indeterminate rounded-full" />
      ) : (
        <div
          className="bg-gradient-progress h-full rounded-full shadow-[0_0_14px_rgb(91_92_255/0.7)] transition-[width] duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      )}
    </div>
  );
}

/** Two phases: the server prepares the file, then it's saved to the device. */
export function Steps({ current }: { current: 1 | 2 }) {
  const step = (n: 1 | 2, label: string) => {
    const done = n < current;
    const active = n === current;
    return (
      <li className={cn("flex items-center gap-2", active || done ? "text-fg" : "text-subtle")}>
        <span
          className={cn(
            "grid size-6 shrink-0 place-items-center rounded-full text-dp-11 font-bold tabular-nums",
            active && "bg-gradient-cta text-white shadow-[0_0_14px_rgb(91_92_255/0.7)]",
            done && "bg-success text-[#04211a]",
            !active && !done && "border border-chip-border bg-chip",
          )}
        >
          {done ? "✓" : n}
        </span>
        <span>{label}</span>
      </li>
    );
  };
  return (
    <ol className="flex items-center gap-3 text-dp-13 font-medium" aria-label="Download steps">
      {step(1, "Preparing on our server")}
      <li aria-hidden className="h-px min-w-4 flex-1 bg-gradient-to-r from-chip-border via-[#2b3657] to-chip-border" />
      {step(2, "Saving to your device")}
    </ol>
  );
}

export function Alert({ title, message, detail, children }: { title: string; message: string; detail?: string; children?: ReactNode }) {
  return (
    <div
      role="alert"
      className="gradient-ring rounded-[1rem] bg-[#170d1a]/80 p-4 [--ring:linear-gradient(120deg,rgb(255_92_122/0.6),rgb(192_77_255/0.35))] sm:p-5"
    >
      <div className="flex items-start gap-3">
        <CircleAlert className="mt-0.5 size-5 shrink-0 text-danger" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-fg">{title}</p>
          <p className="mt-1 text-sm text-muted">{message}</p>
          {detail && (
            <details className="mt-2 text-xs text-subtle">
              <summary className="cursor-pointer select-none hover:text-muted">Technical details</summary>
              <p className="mt-1 font-mono break-words">{detail}</p>
            </details>
          )}
          {children && <div className="mt-4 flex flex-wrap gap-2">{children}</div>}
        </div>
      </div>
    </div>
  );
}

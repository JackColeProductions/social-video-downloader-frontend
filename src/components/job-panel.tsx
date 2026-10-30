"use client";

import { Clock, Film, LoaderCircle, Music, Plus, RotateCcw } from "lucide-react";
import type { ReactNode } from "react";
import { jobFileUrl } from "@/lib/api";
import type { JobSnapshot } from "@/lib/api-types";
import { formatBytes, formatClock, formatEta, formatSpeed } from "@/lib/format";
import { Alert, buttonStyles, cn, ProgressBar, Steps } from "./ui";

interface JobPanelProps {
  job: JobSnapshot;
  /** What was picked, e.g. "MP4 · H.264 + AAC · 1080p", shown with the finished file. */
  detail?: string;
  onCancel: () => void;
  onRetry: () => void;
  onChooseAnother: () => void;
  onNewVideo: () => void;
}

function stageTitle(job: JobSnapshot): string {
  const part = job.streamCount > 1 && job.streamIndex > 0 ? ` (${job.streamIndex} of ${job.streamCount})` : "";
  switch (job.status) {
    case "queued":
      return job.queuePosition ? `You're #${job.queuePosition} in line for a free slot` : "Waiting for a free slot…";
    case "preparing":
      return "Starting download…";
    case "downloading":
      if (job.stage === "video") return `Downloading video${part}`;
      if (job.stage === "audio") return `Downloading audio${part}`;
      return "Downloading";
    case "processing":
      if (job.stage === "merge") return "Merging video and audio…";
      if (job.stage === "convert") return "Converting audio…";
      return "Finishing up…";
    default:
      return "";
  }
}

function progressDetails(job: JobSnapshot): string {
  if (job.status === "queued") return "Your download starts automatically when a slot frees up.";
  if (job.status === "preparing") return "Connecting to the platform…";
  if (job.status === "processing") return `${formatBytes(job.downloadedBytes)} downloaded · almost ready`;
  const amount = job.totalBytes ? `${formatBytes(job.downloadedBytes)} of ${formatBytes(job.totalBytes)}` : formatBytes(job.downloadedBytes);
  return [amount, formatSpeed(job.speed), formatEta(job.eta)].filter(Boolean).join(" · ");
}

function ProgressBlock({ title, percent, details, action }: { title: string; percent: number | null; details: string; action?: ReactNode }) {
  return (
    <div className="space-y-3" aria-live="polite">
      <div className="flex items-baseline justify-between gap-4">
        <p className="flex min-w-0 items-center gap-2.5 text-dp-16 font-semibold text-fg">
          <LoaderCircle className="size-4.5 shrink-0 animate-spin text-[#7c8cff]" aria-hidden />
          <span className="truncate">{title}</span>
        </p>
        {percent !== null && <p className="text-dp-15 font-bold tabular-nums text-fg">{Math.floor(percent)}%</p>}
      </div>
      <ProgressBar value={percent} indeterminate={percent === null} label={title} />
      <div className="flex min-h-9 items-center justify-between gap-4">
        <p className="text-dp-14 text-muted tabular-nums">{details}</p>
        {action}
      </div>
    </div>
  );
}

const AUDIO_EXTENSIONS = new Set(["mp3", "m4a", "aac", "opus", "ogg", "wav", "flac", "weba"]);

/** The check in a glowing disc: it pops in, draws its tick, and sends out a ring and a few sparks, once. */
function SuccessMark() {
  return (
    <span className="relative grid size-12 shrink-0 place-items-center">
      <span aria-hidden className="absolute inset-0 rounded-full opacity-0 ring-2 ring-[#3ee0b0] motion-safe:animate-success-ping" />
      {[0, 60, 120, 180, 240, 300].map((angle) => (
        <span key={angle} aria-hidden className="absolute inset-0" style={{ rotate: `${angle}deg` }}>
          <span className="absolute top-0 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-[#9af8dc] opacity-0 shadow-[0_0_6px_#3ee0b0] motion-safe:animate-spark" />
        </span>
      ))}
      <span className="relative grid size-12 place-items-center rounded-full bg-[linear-gradient(135deg,#34e3b0,#14b8c4_55%,#1f8fff)] shadow-[0_0_0_4px_rgb(34_211_160/0.12),0_10px_28px_-8px_rgb(34_211_160/0.8)] motion-safe:animate-success-pop">
        <svg viewBox="0 0 24 24" className="size-6" aria-hidden>
          <path
            d="M5.5 12.5l4.2 4.2 8.8-8.9"
            pathLength={1}
            fill="none"
            stroke="white"
            strokeWidth={2.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="[stroke-dasharray:1] motion-safe:animate-check-draw"
          />
        </svg>
        <span aria-hidden className="absolute inset-0 rounded-full bg-[linear-gradient(180deg,rgb(255_255_255/0.28),transparent_55%)]" />
      </span>
    </span>
  );
}

/**
 * The finished file: what the browser is saving, until when it can be saved again, and how. The
 * next steps (`actions`) sit beside the title on wide screens and below it on narrow ones.
 */
function DownloadStarted({ job, detail, actions }: { job: JobSnapshot; detail?: string; actions: ReactNode }) {
  const ext = job.fileName?.split(".").pop()?.toLowerCase() ?? "";
  const FileIcon = AUDIO_EXTENSIONS.has(ext) ? Music : Film;
  return (
    <div
      role="status"
      className="gradient-ring relative overflow-hidden rounded-[1.25rem] bg-[linear-gradient(180deg,rgb(10_32_34/0.9),rgb(8_16_27/0.92))] p-4 [--ring:linear-gradient(120deg,rgb(52_227_176/0.75),rgb(31_176_255/0.35)_50%,rgb(139_92_255/0.3))] sm:p-5"
    >
      <div aria-hidden className="pointer-events-none absolute -top-24 -left-20 size-72 bg-[radial-gradient(closest-side,rgb(34_211_160/0.2),transparent)]" />
      <div className="relative flex flex-wrap items-center gap-4">
        <div className="flex min-w-64 flex-1 items-center gap-4">
          <SuccessMark />
          <div className="min-w-0">
            <p className="text-dp-18 font-bold text-white">Your download has started</p>
            <p className="mt-0.5 text-dp-14 text-muted">Check your browser&apos;s downloads for progress.</p>
          </div>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">{actions}</div>
      </div>

      <div className="relative mt-4 flex items-center gap-3.5 rounded-[0.875rem] border border-white/6 bg-[#060c15]/70 py-3 pr-4 pl-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-[0.75rem] bg-[linear-gradient(135deg,#1fb0ff,#5b5cff_60%,#8b4dff)] shadow-[0_8px_20px_-8px_rgb(91_92_255/0.8),inset_0_1px_0_rgb(255_255_255/0.25)]">
          <FileIcon className="size-5 text-white" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-dp-15 font-semibold text-fg" title={job.fileName ?? undefined}>
            {job.fileName ?? "Your file"}
          </p>
          <p className="mt-0.5 truncate text-dp-13 text-muted">{detail ?? ext.toUpperCase()}</p>
        </div>
        <p className="shrink-0 text-dp-16 font-bold text-fg tabular-nums">{formatBytes(job.fileSize)}</p>
      </div>

      <p className="relative mt-3.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-dp-13 text-subtle">
        {job.expiresAt && (
          <>
            <Clock className="size-3.5 shrink-0" aria-hidden />
            Available until {formatClock(job.expiresAt)}.
          </>
        )}
        <span>Didn&apos;t start?</span>
        <a
          href={jobFileUrl(job.id)}
          className="rounded-sm font-semibold text-[#7aa2ff] underline-offset-2 transition-colors hover:text-[#a9c4ff] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5b8cff]"
        >
          Save it again
        </a>
      </p>
    </div>
  );
}

export function JobPanel({ job, detail, onCancel, onRetry, onChooseAnother, onNewVideo }: JobPanelProps) {
  if (job.status === "ready") {
    return (
      <div className="space-y-5">
        <Steps current={2} />
        <DownloadStarted
          job={job}
          detail={detail}
          actions={
            <>
              <button type="button" onClick={onChooseAnother} className={cn(buttonStyles.secondary, "h-11")}>
                Choose another quality
              </button>
              <button type="button" onClick={onNewVideo} className={cn(buttonStyles.primary, "h-11 px-5 text-dp-15")}>
                <Plus className="size-4.5" strokeWidth={2.4} aria-hidden />
                Download another video
              </button>
            </>
          }
        />
      </div>
    );
  }

  if (job.status === "failed") {
    return (
      <Alert title="Download failed" message={job.error?.message ?? "Something went wrong while preparing your file."} detail={job.error?.detail}>
        <button type="button" onClick={onRetry} className={cn(buttonStyles.primary, "h-11 text-dp-15")}>
          <RotateCcw className="size-4" aria-hidden />
          Try again
        </button>
        <button type="button" onClick={onChooseAnother} className={cn(buttonStyles.secondary, "h-11")}>
          Choose another quality
        </button>
      </Alert>
    );
  }

  if (job.status === "cancelled") {
    return (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-dp-15 text-muted">Download cancelled.</p>
        <button type="button" onClick={onChooseAnother} className={cn(buttonStyles.secondary, "h-11")}>
          Back to qualities
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Steps current={1} />
      <ProgressBlock
        title={stageTitle(job)}
        percent={job.status === "downloading" ? job.percent : null}
        details={progressDetails(job)}
        action={
          <button type="button" onClick={onCancel} className={buttonStyles.ghost}>
            Cancel
          </button>
        }
      />
    </div>
  );
}

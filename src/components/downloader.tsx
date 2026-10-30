"use client";

import { Download, Link2, LoaderCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cancelJob, fetchVideoInfo, jobFileUrl, saveFile, startDownload, TERMINAL_STATUSES, toErrorInfo, warmUpServer } from "@/lib/api";
import type { JobSnapshot, MediaItem, QualityOption, VideoInfo } from "@/lib/api-types";
import { formatBytes, formatSize } from "@/lib/format";
import { brandForPlatform, detectBrand } from "@/lib/platforms";
import { updatePreferences, usePreferences, type Preferences } from "@/lib/preferences";
import { showToast } from "@/lib/toasts";
import { useJobEvents } from "@/lib/use-job-events";
import { JobPanel } from "./job-panel";
import { FormatSwitch, Panel, QualityChip, SECTION_ICONS, SectionHeader, type FormatOption, type QualityTone } from "./options-panel";
import { PlatformTiles } from "./platform-tiles";
import { RESIZE_MS, SmoothHeight } from "./smooth-height";
import { showErrorToast } from "./toaster";
import { buttonStyles, cn } from "./ui";
import { UrlBar } from "./url-bar";
import { VideoPreview } from "./video-preview";

/** Errors are shown as toasts (see showErrorToast), so a failed lookup goes back to idle. */
type Lookup = { status: "idle" } | { status: "loading" } | { status: "done"; info: VideoInfo };

function toneOf(option: QualityOption): QualityTone {
  if (option.kind === "audio") return "audio";
  const h = option.height ?? 0;
  return h >= 1440 ? "uhd" : h >= 720 ? "hd" : "sd";
}

/** The option matching the remembered format and quality, else the closest one. */
function preferredOption(item: MediaItem | undefined, prefs: Pick<Preferences, "quality" | "format">): QualityOption | undefined {
  if (!item) return undefined;
  if (prefs.format !== "mp4") {
    const audio = item.options.find((option) => option.kind === "audio" && option.ext === prefs.format);
    if (audio) return audio;
  }
  const videos = item.options.filter((option) => option.kind === "video");
  return videos.find((option) => (option.height ?? 0) <= prefs.quality) ?? videos.at(-1) ?? item.options[0];
}

const formatOf = (option: QualityOption) => (option.kind === "video" ? "mp4" : option.ext);
const chipSize = (option: QualityOption) => (option.size == null ? "Unknown" : `${option.sizeExact ? "" : "≈ "}${formatBytes(option.size)}`);
const summary = (option: QualityOption) => (option.kind === "video" ? `${option.detail} · ${option.label}` : option.detail);

const scrollBehavior = (): ScrollBehavior => (window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth");

/** Scrolls just enough to show the whole panel, keeping as much of the page above it in view as fits. */
function revealPanel(wrapper: HTMLElement | null) {
  // Measure the panel itself: its wrapper's top padding would count as panel and stop the scroll short.
  const panel = wrapper?.firstElementChild;
  if (!panel) return;
  const margin = 16;
  const { top, bottom } = panel.getBoundingClientRect();
  const distance = Math.min(bottom + margin - window.innerHeight, top - margin);
  if (distance > 0) window.scrollBy({ top: distance, behavior: scrollBehavior() });
}

export function Downloader() {
  const prefs = usePreferences();
  const [url, setUrl] = useState("");
  const [lookup, setLookup] = useState<Lookup>({ status: "idle" });
  const [position, setPosition] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [job, setJob] = useState<JobSnapshot | null>(null);
  const [starting, setStarting] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const lookupAbort = useRef<AbortController | null>(null);
  const handledJobs = useRef(new Set<string>());

  useEffect(() => {
    warmUpServer();
  }, []);

  const info = lookup.status === "done" ? lookup.info : null;
  const item = info?.items[position] ?? info?.items[0];
  const selected = item?.options.find((option) => option.id === selectedId) ?? null;
  const jobRunning = job !== null && !TERMINAL_STATUSES.has(job.status);
  const locked = jobRunning || starting;
  const activeBrand = detectBrand(url) ?? (info ? brandForPlatform(info.platform) : null);

  useJobEvents(
    jobRunning ? job.id : null,
    (snapshot) => {
      setJob((previous) =>
        // Size estimates can shift while streaming; never let the bar move backwards.
        previous?.id === snapshot.id && snapshot.status === "downloading" && (snapshot.percent ?? 0) < (previous.percent ?? 0)
          ? { ...snapshot, percent: previous.percent }
          : snapshot,
      );
      if (snapshot.status === "ready" && !handledJobs.current.has(snapshot.id)) {
        handledJobs.current.add(snapshot.id);
        saveFile(jobFileUrl(snapshot.id));
      }
    },
    () => {
      setJob(null);
      showErrorToast({ code: "expired", message: "This download expired on the server. Please start it again." }, "Download expired");
    },
  );

  async function runLookup(input: string) {
    const text = input.trim();
    if (!text) {
      showToast({ tone: "info", title: "No link yet", message: "Paste a link to a video, then press Download.", Icon: Link2, duration: 5000 });
      inputRef.current?.focus();
      return;
    }
    lookupAbort.current?.abort();
    const controller = new AbortController();
    lookupAbort.current = controller;
    if (job && jobRunning) cancelJob(job.id);
    setJob(null);
    setLookup({ status: "loading" });

    try {
      const result = await fetchVideoInfo(text, controller.signal);
      if (controller.signal.aborted) return;
      setPosition(0);
      setSelectedId(preferredOption(result.items[0], prefs)?.id ?? null);
      setLookup({ status: "done", info: result });
    } catch (error) {
      if (controller.signal.aborted) return;
      setLookup({ status: "idle" });
      showErrorToast(toErrorInfo(error), "We couldn't get that video");
    }
  }

  async function runDownload() {
    if (!info || !item || !selected) return;
    setStarting(true);
    try {
      setJob(await startDownload({ url: info.url, optionId: selected.id, itemIndex: item.index }));
    } catch (error) {
      showErrorToast(toErrorInfo(error), "Couldn't start the download");
    } finally {
      setStarting(false);
    }
  }

  function clearFinishedJob() {
    if (job && !jobRunning) setJob(null);
  }

  function chooseFormat(format: string) {
    updatePreferences({ format });
    if (item) setSelectedId(preferredOption(item, { quality: prefs.quality, format })?.id ?? null);
    clearFinishedJob();
  }

  function chooseOption(option: QualityOption) {
    setSelectedId(option.id);
    if (option.kind === "video" && option.height) updatePreferences({ quality: option.height });
    clearFinishedJob();
  }

  function chooseItem(index: number) {
    setPosition(index);
    setSelectedId(preferredOption(info?.items[index], prefs)?.id ?? null);
    setJob(null);
  }

  function startOver() {
    if (job && jobRunning) cancelJob(job.id);
    lookupAbort.current?.abort();
    setUrl("");
    setLookup({ status: "idle" });
    setJob(null);
    window.scrollTo({ top: 0, behavior: scrollBehavior() });
    inputRef.current?.focus();
  }

  const loaded = lookup.status === "done" && item ? item : null;
  const videos = loaded?.options.filter((option) => option.kind === "video") ?? [];
  const audioFormats = [...new Set(loaded?.options.filter((option) => option.kind === "audio").map((option) => option.ext))].sort(
    (a, b) => Number(b === "mp3") - Number(a === "mp3"),
  );
  const currentFormat = selected ? formatOf(selected) : prefs.format;
  const qualityOptions = currentFormat === "mp4" ? videos : (loaded?.options.filter((option) => option.kind === "audio" && option.ext === currentFormat) ?? []);
  const videoLabel = ((selected?.kind === "video" ? selected.ext : videos[0]?.ext) ?? "mp4").toUpperCase();
  const formatOptions: FormatOption[] = [
    ...(videos.length > 0 ? [{ value: "mp4", label: videoLabel, kind: "video" as const }] : []),
    ...audioFormats.map((ext) => ({ value: ext, label: ext.toUpperCase(), kind: "audio" as const })),
  ];

  // What the bottom of the panel shows; each change fades in.
  const footerView = !job ? "options" : TERMINAL_STATUSES.has(job.status) ? job.status : "progress";

  // The panel grows when a video loads and as a download moves through its stages; keep it in view.
  // Wait for the height animation first (it starts a frame or two after the change): until the page
  // has grown, the browser can't scroll that far and would stop short.
  const panelPhase = loaded ? [loaded.id, footerView].join(":") : null;
  useEffect(() => {
    if (!panelPhase) return;
    const timer = window.setTimeout(() => revealPanel(panelRef.current), RESIZE_MS + 80);
    return () => window.clearTimeout(timer);
  }, [panelPhase]);

  // Lets the page background play its "fetching" animation (see .ribbon-pulse in globals.css).
  const fetching = lookup.status === "loading";
  useEffect(() => {
    if (!fetching) return;
    document.documentElement.setAttribute("data-fetching", "");
    return () => document.documentElement.removeAttribute("data-fetching");
  }, [fetching]);

  return (
    <div>
      <UrlBar value={url} loading={lookup.status === "loading"} inputRef={inputRef} onChange={setUrl} onSubmit={runLookup} />

      <SmoothHeight>
        {(lookup.status === "loading" || loaded) && (
          <div ref={panelRef} className="pt-6 motion-safe:animate-rise lg:pt-6.25">
            <Panel>
              {lookup.status === "loading" && <PreviewSkeleton />}
              {loaded && info && (
                <div className="motion-safe:animate-fade">
                  <VideoPreview
                    key={`${info.url}#${loaded.index}`}
                    item={loaded}
                    platform={info.platform}
                    sourceUrl={info.url}
                    items={info.items}
                    position={position}
                    disabled={locked}
                    onPick={chooseItem}
                  />
                  <div aria-hidden className="my-7 h-px bg-[#151d2c]" />

                  <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
                    <SectionHeader Icon={SECTION_ICONS.quality} label="Quality" />
                    <div className="flex w-full items-center gap-3 sm:w-auto">
                      <span className="hidden text-dp-14 text-subtle sm:inline">Format</span>
                      <FormatSwitch options={formatOptions} value={currentFormat} disabled={locked} onChange={chooseFormat} />
                    </div>
                  </div>
                  <div role="radiogroup" aria-label="Quality" className="mt-5 flex flex-wrap gap-2.5 sm:gap-3">
                    {qualityOptions.map((option) => (
                      <QualityChip
                        key={option.id}
                        label={option.kind === "video" ? option.label : (option.detail.split(" · ").at(-1) ?? option.label)}
                        badge={option.badge ?? (option.kind === "video" ? "SD" : option.ext.toUpperCase())}
                        tone={toneOf(option)}
                        size={chipSize(option)}
                        selected={option.id === selected?.id}
                        disabled={locked}
                        onSelect={() => chooseOption(option)}
                      />
                    ))}
                  </div>

                  <div key={footerView} className="mt-8 border-t border-[#151d2c] pt-7 motion-safe:animate-fade">
                    {job ? (
                      <JobPanel
                        job={job}
                        detail={selected ? summary(selected) : undefined}
                        onCancel={() => cancelJob(job.id)}
                        onRetry={runDownload}
                        onChooseAnother={clearFinishedJob}
                        onNewVideo={startOver}
                      />
                    ) : (
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <p className="text-dp-12 font-semibold tracking-[0.12em] text-subtle uppercase">
                            Total size{selected && selected.size !== null && !selected.sizeExact ? " (estimated)" : ""}
                          </p>
                          <p className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                            {selected ? (
                              <>
                                <span className="text-dp-28 font-bold text-fg tabular-nums">{formatSize(selected.size, selected.sizeExact)}</span>
                                <span className="text-dp-15 text-muted">{summary(selected)}</span>
                              </>
                            ) : (
                              <span className="text-dp-15 text-muted">Pick a quality</span>
                            )}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={runDownload}
                          disabled={!selected || starting}
                          className={cn(buttonStyles.primary, "h-15 shrink-0 text-dp-18 sm:w-59.25")}
                        >
                          {starting ? <LoaderCircle className="size-6 animate-spin" aria-hidden /> : <Download className="size-6" strokeWidth={2.2} aria-hidden />}
                          Download
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Panel>
          </div>
        )}
      </SmoothHeight>

      <PlatformTiles active={activeBrand} />
    </div>
  );
}

function PreviewSkeleton() {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const started = Date.now();
    const timer = window.setInterval(() => setElapsed(Math.floor((Date.now() - started) / 1000)), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const message =
    elapsed < 8
      ? "Fetching video details…"
      : elapsed < 25
        ? "Still working. Some platforms take a little longer…"
        : "Almost there. The server may be busy, hang tight.";

  return (
    <div role="status">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-7">
        <div className="skeleton aspect-video w-full animate-shimmer rounded-[1.125rem] sm:w-75 lg:w-100" />
        <div className="flex-1 space-y-3">
          <div className="skeleton h-6 w-24 animate-shimmer rounded-full" />
          <div className="skeleton h-6 w-11/12 animate-shimmer rounded-md" />
          <div className="skeleton h-6 w-2/3 animate-shimmer rounded-md" />
          <div className="skeleton h-4 w-1/3 animate-shimmer rounded-md" />
        </div>
      </div>
      <p className="mt-5 flex items-center gap-2 text-dp-14 text-muted">
        <LoaderCircle className="size-4 animate-spin text-[#7c8cff]" aria-hidden />
        {message}
      </p>
    </div>
  );
}

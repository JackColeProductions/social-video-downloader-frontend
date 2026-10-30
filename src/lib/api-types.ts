/**
 * API contract of the download server. Copy of backend/src/types.ts; keep both in sync.
 */

export interface QualityOption {
  /** Opaque id to send back when starting a download. */
  id: string;
  kind: "video" | "audio";
  /** "1080p60", "Audio only" */
  label: string;
  /** "4K", "Full HD", "HD", "MP3" ... */
  badge: string | null;
  /** Container/codec summary, e.g. "MP4 · H.264 + AAC". */
  detail: string;
  /** Extension of the file the user will receive. */
  ext: string;
  /** Size in bytes, null when unknown. */
  size: number | null;
  /** false when `size` is an estimate. */
  sizeExact: boolean;
  height: number | null;
  fps: number | null;
}

export interface MediaItem {
  /** Position inside a multi-video post (1-based), null for single videos. */
  index: number | null;
  id: string;
  title: string;
  uploader: string | null;
  /** Seconds. */
  duration: number | null;
  /** Path on the API server (prefix with the API origin). */
  thumbnail: string | null;
  aspectRatio: number | null;
  options: QualityOption[];
}

export interface VideoInfo {
  /** Normalised source URL; send it back when starting a download. */
  url: string;
  platform: string;
  title: string;
  items: MediaItem[];
}

export type JobStatus = "queued" | "preparing" | "downloading" | "processing" | "ready" | "failed" | "cancelled";

export type JobStage = "video" | "audio" | "media" | "merge" | "convert" | "finalize" | null;

export interface JobSnapshot {
  id: string;
  status: JobStatus;
  stage: JobStage;
  queuePosition: number | null;
  streamIndex: number;
  streamCount: number;
  downloadedBytes: number;
  totalBytes: number | null;
  percent: number | null;
  /** Bytes per second. */
  speed: number | null;
  /** Seconds remaining. */
  eta: number | null;
  fileName: string | null;
  fileSize: number | null;
  /** Epoch ms after which the finished file is deleted from the server. */
  expiresAt: number | null;
  error: ApiErrorBody["error"] | null;
}

export interface ApiErrorBody {
  error: { code: string; message: string; detail?: string };
}

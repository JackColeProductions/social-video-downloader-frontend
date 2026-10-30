import type { ApiErrorBody, JobSnapshot, VideoInfo } from "./api-types";

/** Origin of the download server (the Render service). Inlined at build time. */
export const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/+$/, "");

export const TERMINAL_STATUSES: ReadonlySet<JobSnapshot["status"]> = new Set(["ready", "failed", "cancelled"]);

export interface ErrorInfo {
  code: string;
  message: string;
  detail?: string;
  status?: number;
}

export class ApiRequestError extends Error implements ErrorInfo {
  constructor(
    message: string,
    readonly code: string,
    readonly status: number,
    readonly detail?: string,
  ) {
    super(message);
  }
}

export function toErrorInfo(error: unknown): ErrorInfo {
  if (error instanceof ApiRequestError) {
    return { code: error.code, message: error.message, detail: error.detail, status: error.status };
  }
  return { code: "unknown", message: "Something went wrong. Please try again." };
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function request<T>(path: string, init: RequestInit = {}, retries = 0): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    let response: Response;
    try {
      response = await fetch(`${API_URL}${path}`, {
        ...init,
        headers: init.body ? { "Content-Type": "application/json", ...init.headers } : init.headers,
      });
    } catch (error) {
      if (init.signal?.aborted) throw error;
      // Network failure: the server may be restarting after a deploy. Retry a few times.
      if (attempt < retries) {
        await sleep(1500 * (attempt + 1));
        continue;
      }
      throw new ApiRequestError("Couldn't reach the download server. Check your connection and try again.", "network", 0);
    }

    const body = (await response.json().catch(() => null)) as (T & Partial<ApiErrorBody>) | null;
    if (!response.ok) {
      const error = body?.error;
      throw new ApiRequestError(
        error?.message ?? `The server responded with an error (${response.status}).`,
        error?.code ?? "http_error",
        response.status,
        error?.detail,
      );
    }
    return body as T;
  }
}

export function fetchVideoInfo(url: string, signal?: AbortSignal): Promise<VideoInfo> {
  return request<VideoInfo>("/api/info", { method: "POST", body: JSON.stringify({ url }), signal }, 2);
}

export async function startDownload(input: { url: string; optionId: string; itemIndex: number | null }): Promise<JobSnapshot> {
  const { job } = await request<{ job: JobSnapshot }>("/api/downloads", { method: "POST", body: JSON.stringify(input) });
  return job;
}

export async function getJob(id: string): Promise<JobSnapshot> {
  const { job } = await request<{ job: JobSnapshot }>(`/api/downloads/${id}`);
  return job;
}

/** Cancels an unfinished job, or releases a finished file early. Fire-and-forget. */
export function cancelJob(id: string): void {
  void fetch(`${API_URL}/api/downloads/${id}`, { method: "DELETE", keepalive: true }).catch(() => {});
}

export const jobEventsUrl = (id: string) => `${API_URL}/api/downloads/${id}/events`;
export const jobFileUrl = (id: string) => `${API_URL}/api/downloads/${id}/file`;
export const apiAssetUrl = (path: string) => `${API_URL}${path}`;

/** Wakes the server up (and warms its caches) while the user is still pasting a link. */
export function warmUpServer(): void {
  void fetch(`${API_URL}/health`, { cache: "no-store" }).catch(() => {});
}

/**
 * Hands the finished file to the browser's own download manager. The server sends it as an
 * attachment with an exact Content-Length, so the browser shows size and time remaining.
 */
export function saveFile(url: string): void {
  const link = document.createElement("a");
  link.href = url;
  link.rel = "noopener";
  link.style.display = "none";
  document.body.append(link);
  link.click();
  link.remove();
}

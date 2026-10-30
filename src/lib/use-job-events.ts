"use client";

import { useEffect, useEffectEvent } from "react";
import { ApiRequestError, getJob, jobEventsUrl, TERMINAL_STATUSES } from "./api";
import type { JobSnapshot } from "./api-types";

/**
 * Follows a download job in real time over Server-Sent Events. If the event stream can't be
 * kept open (some proxies buffer it), it falls back to polling. Pass `null` to stop.
 */
export function useJobEvents(
  jobId: string | null,
  onSnapshot: (snapshot: JobSnapshot) => void,
  onLost: () => void,
): void {
  const handleSnapshot = useEffectEvent(onSnapshot);
  const handleLost = useEffectEvent(onLost);

  useEffect(() => {
    if (!jobId) return;
    let stopped = false;
    let pollTimer: number | undefined;

    const poll = async () => {
      if (stopped) return;
      try {
        const snapshot = await getJob(jobId);
        if (stopped) return;
        handleSnapshot(snapshot);
        if (!TERMINAL_STATUSES.has(snapshot.status)) pollTimer = window.setTimeout(poll, 1500);
      } catch (error) {
        if (stopped) return;
        if (error instanceof ApiRequestError && error.status === 404) handleLost();
        else pollTimer = window.setTimeout(poll, 3000);
      }
    };

    const source = new EventSource(jobEventsUrl(jobId));
    source.onmessage = (event: MessageEvent<string>) => {
      const snapshot = JSON.parse(event.data) as JobSnapshot;
      handleSnapshot(snapshot);
      if (TERMINAL_STATUSES.has(snapshot.status)) source.close();
    };
    source.addEventListener("gone", () => {
      source.close();
      handleLost();
    });
    source.onerror = () => {
      // EventSource retries on its own; once it gives up for good, poll instead.
      if (source.readyState === EventSource.CLOSED && !stopped) void poll();
    };

    return () => {
      stopped = true;
      source.close();
      window.clearTimeout(pollTimer);
    };
  }, [jobId]);
}

import type { BrandKey } from "@/components/brand-paths";

interface Platform {
  brand: BrandKey;
  name: string;
  hosts: string[];
}

/** The tiles under the link input, in the mockup's order. */
export const FEATURED_PLATFORMS: Platform[] = [
  { brand: "youtube", name: "YouTube", hosts: ["youtube.com", "youtu.be", "youtube-nocookie.com"] },
  { brand: "instagram", name: "Instagram", hosts: ["instagram.com"] },
  { brand: "tiktok", name: "TikTok", hosts: ["tiktok.com"] },
  { brand: "facebook", name: "Facebook", hosts: ["facebook.com", "fb.watch"] },
  { brand: "x", name: "X (Twitter)", hosts: ["x.com", "twitter.com"] },
  { brand: "vimeo", name: "Vimeo", hosts: ["vimeo.com"] },
  { brand: "dailymotion", name: "Dailymotion", hosts: ["dailymotion.com", "dai.ly"] },
];

/** Shown under "More". The server supports everything yt-dlp does (~1,800 sites). */
export const MORE_PLATFORMS: Platform[] = [
  { brand: "reddit", name: "Reddit", hosts: ["reddit.com", "redd.it"] },
  { brand: "twitch", name: "Twitch", hosts: ["twitch.tv"] },
  { brand: "soundcloud", name: "SoundCloud", hosts: ["soundcloud.com"] },
  { brand: "pinterest", name: "Pinterest", hosts: ["pinterest.com", "pin.it"] },
  { brand: "threads", name: "Threads", hosts: ["threads.net", "threads.com"] },
  { brand: "bluesky", name: "Bluesky", hosts: ["bsky.app"] },
  { brand: "snapchat", name: "Snapchat", hosts: ["snapchat.com"] },
  { brand: "tumblr", name: "Tumblr", hosts: ["tumblr.com"] },
  { brand: "bilibili", name: "Bilibili", hosts: ["bilibili.com", "b23.tv"] },
  { brand: "rumble", name: "Rumble", hosts: ["rumble.com"] },
  { brand: "kick", name: "Kick", hosts: ["kick.com"] },
];

const ALL_PLATFORMS = [...FEATURED_PLATFORMS, ...MORE_PLATFORMS];

/** Best-effort detection from whatever the user typed, for highlighting the matching tile. */
export function detectBrand(input: string): BrandKey | null {
  const text = input.trim();
  if (!text) return null;
  let host: string;
  try {
    host = new URL(/^[a-z][a-z\d+.-]*:\/\//i.test(text) ? text : `https://${text}`).hostname.toLowerCase();
  } catch {
    return null;
  }
  const match = ALL_PLATFORMS.find((p) => p.hosts.some((domain) => host === domain || host.endsWith(`.${domain}`)));
  return match?.brand ?? null;
}

/** Maps the platform name reported by the API ("YouTube", "X (Twitter)", ...) to a brand. */
export function brandForPlatform(platform: string): BrandKey | null {
  const name = platform.toLowerCase();
  const match = ALL_PLATFORMS.find((p) => name === p.name.toLowerCase() || name === p.brand);
  return match?.brand ?? null;
}

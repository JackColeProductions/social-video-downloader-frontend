import type { CSSProperties } from "react";

/*
 * Decorative page background matching the mockup: atmospheric glows, a faint grid, two light
 * ribbons running into the ends of the link input. The bottom corners are drawn by <HorizonGlow />.
 * Paths and colours were measured on the mockup's 1536x1024 canvas; sizes are in rem so they scale
 * with the page.
 */

const tail = (length: number) => ({ "--tail": length }) as CSSProperties;

/** A comet of light that runs along `d` into the input while a video is being fetched (see .ribbon-pulse). */
function Comet({ d, trail, body, filter, later }: { d: string; trail: string; body: string; filter: string; later?: boolean }) {
  const className = later ? "ribbon-pulse later" : "ribbon-pulse";
  return (
    <>
      <path className={className} style={tail(0.34)} pathLength={1} d={d} stroke={trail} strokeOpacity={0.6} strokeWidth="11" filter={filter} />
      <path className={className} style={tail(0.17)} pathLength={1} d={d} stroke={body} strokeOpacity={0.9} strokeWidth="2.8" />
      <path className={className} style={tail(0.035)} pathLength={1} d={d} stroke="#fff" strokeWidth="4.5" />
    </>
  );
}

export function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-275 bg-[radial-gradient(68.75rem_32.5rem_at_50%_-8%,rgb(36_52_120/0.30),transparent_70%)]" />
      <div className="absolute -top-47.5 -left-75 size-215 rounded-full bg-[radial-gradient(circle,rgb(98_56_220/0.28),transparent_60%)]" />
      <div className="absolute -top-40 -right-80 size-220 rounded-full bg-[radial-gradient(circle,rgb(70_60_200/0.24),transparent_60%)]" />
      <div className="absolute top-75 left-1/2 h-95 w-287.5 -translate-x-1/2 bg-[radial-gradient(closest-side,rgb(72_62_225/0.14),transparent)]" />

      <div className="absolute inset-0 bg-[linear-gradient(rgb(255_255_255/0.02)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.02)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_62%,black,transparent)] bg-[size:1.875rem_1.875rem]" />

      {/*
        Ribbons into the ends of the link input (at canvas y≈462), anchored to the centred content
        (canvas x = local x). Each runs on past its box (overflow visible) so it starts under the
        hero card or off-screen. While a video is being fetched they light up and comets run along
        them into the input (see globals.css).
      */}
      <svg className="absolute top-(--canvas-top) h-140 w-110 overflow-visible" style={{ left: "calc(50% - 48rem)" }} viewBox="0 0 440 560" fill="none">
        <defs>
          <filter id="bd-ribbon-l" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>
        <path className="ribbon-glow" d="M-82 297 L18 370 C 70 408, 120 436, 194 474" stroke="#7a3cff" strokeWidth="16" opacity="0.3" filter="url(#bd-ribbon-l)" />
        <path className="ribbon-line" d="M-82 297 L18 370 C 70 408, 120 436, 194 474" stroke="#8d5cff" strokeWidth="1.3" opacity="0.4" />
        <Comet d="M18 370 C 70 408, 120 436, 194 474" trail="#9a6bff" body="#d9c4ff" filter="url(#bd-ribbon-l)" />
        <Comet d="M18 370 C 70 408, 120 436, 194 474" trail="#9a6bff" body="#d9c4ff" filter="url(#bd-ribbon-l)" later />
      </svg>
      {/* canvas x = local x + 1096 */}
      <svg className="absolute top-(--canvas-top) h-200 w-110 overflow-visible" style={{ left: "calc(50% + 20.5rem)" }} viewBox="0 0 440 800" fill="none">
        <defs>
          <linearGradient id="bd-ribbon-r" gradientUnits="userSpaceOnUse" x1="250" y1="0" x2="440" y2="0">
            <stop offset="0" stopColor="#3d6bff" stopOpacity="0.35" />
            <stop offset="1" stopColor="#2f7bff" />
          </linearGradient>
          <radialGradient id="bd-ribbon-r-air" gradientUnits="userSpaceOnUse" cx="440" cy="560" r="190">
            <stop offset="0" stopColor="#1d3fa8" stopOpacity="0.55" />
            <stop offset="1" stopColor="#1d3fa8" stopOpacity="0" />
          </radialGradient>
          <filter id="bd-ribbon-r-blur" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
        </defs>
        <rect x="250" y="370" width="380" height="380" fill="url(#bd-ribbon-r-air)" />
        <path className="ribbon-glow" d="M1100 646 L470 520 C 390 504, 330 484, 250 461" stroke="url(#bd-ribbon-r)" strokeWidth="18" opacity="0.45" filter="url(#bd-ribbon-r-blur)" />
        <path className="ribbon-line" d="M1100 646 L470 520 C 390 504, 330 484, 250 461" stroke="url(#bd-ribbon-r)" strokeWidth="1.5" opacity="0.75" />
        <Comet d="M600 546 L470 520 C 390 504, 330 484, 250 461" trail="#3f9dff" body="#cde8ff" filter="url(#bd-ribbon-r-blur)" />
        <Comet d="M600 546 L470 520 C 390 504, 330 484, 250 461" trail="#3f9dff" body="#cde8ff" filter="url(#bd-ribbon-r-blur)" later />
      </svg>
    </div>
  );
}

/**
 * Glowing "planet rims" in the bottom corners of the page, as in the mockup. The drawing continues
 * 160 design px below the page edge (clipped there) and fades out, so it never ends in a hard line.
 * Coordinates: canvas y = local y + 404 (the mockup canvas ends at local y 620).
 */
export function HorizonGlow() {
  const fade = (id: string) => (
    <>
      <linearGradient id={`${id}-grad`} gradientUnits="userSpaceOnUse" x1="0" y1="600" x2="0" y2="780">
        <stop offset="0" stopColor="#fff" />
        <stop offset="1" stopColor="#000" />
      </linearGradient>
      <mask id={id} maskUnits="userSpaceOnUse" x="-200" y="-200" width="1200" height="1200">
        <rect x="-200" y="-200" width="1200" height="1200" fill={`url(#${id}-grad)`} />
      </mask>
    </>
  );

  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 -bottom-40 -z-10 h-195">
      {/* Bottom-left rim: brightest at the left edge (canvas y≈886), fading to the right. */}
      <svg className="absolute top-0 left-0 h-195 w-195" viewBox="0 0 780 780" fill="none">
        <defs>
          <linearGradient id="bd-l-rim" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="320" y2="0">
            <stop offset="0" stopColor="#ffb4c4" />
            <stop offset="0.12" stopColor="#f78782" />
            <stop offset="0.3" stopColor="#c64f86" stopOpacity="0.9" />
            <stop offset="0.5" stopColor="#7a3a9a" stopOpacity="0.6" />
            <stop offset="0.78" stopColor="#4a2a80" stopOpacity="0.25" />
            <stop offset="1" stopColor="#4a2a80" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="bd-l-air" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="300" y2="0">
            <stop offset="0" stopColor="#6a2ee0" stopOpacity="0.95" />
            <stop offset="0.45" stopColor="#4b25b8" stopOpacity="0.45" />
            <stop offset="1" stopColor="#3a1f90" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="bd-l-ground" gradientUnits="userSpaceOnUse" cx="0" cy="620" r="450">
            <stop offset="0" stopColor="#2b1b48" />
            <stop offset="0.5" stopColor="#1f1842" stopOpacity="0.97" />
            <stop offset="0.8" stopColor="#12122c" stopOpacity="0.6" />
            <stop offset="1" stopColor="#0b1020" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="bd-l-edge" gradientUnits="userSpaceOnUse" cx="0" cy="470" r="170">
            <stop offset="0" stopColor="#7a34ee" stopOpacity="0.6" />
            <stop offset="1" stopColor="#7a34ee" stopOpacity="0" />
          </radialGradient>
          {/* Region in user space: a percentage of the path's box would clip the wide blurred stroke. */}
          <filter id="bd-l-soft" filterUnits="userSpaceOnUse" x="-200" y="0" width="1200" height="1000">
            <feGaussianBlur stdDeviation="24" />
          </filter>
          <filter id="bd-l-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
          {fade("bd-l-fade")}
        </defs>
        {/* Glow above the rim, then the dim "ground" below it (cuts the glow off sharply), then the rim. */}
        <g mask="url(#bd-l-fade)">
          <path d="M-20 418 C 60 461, 180 506, 430 596" stroke="url(#bd-l-air)" strokeWidth="130" filter="url(#bd-l-soft)" />
          <circle cx="0" cy="470" r="170" fill="url(#bd-l-edge)" />
          <path d="M-20 474 C 60 517, 180 562, 430 652 L 560 800 L -20 800 Z" fill="url(#bd-l-ground)" />
          <path d="M-20 472 C 60 515, 180 560, 430 650" stroke="url(#bd-l-rim)" strokeWidth="12" opacity="0.9" filter="url(#bd-l-glow)" />
          <path d="M-20 472 C 60 515, 180 560, 430 650" stroke="url(#bd-l-rim)" strokeWidth="3.4" />
        </g>
      </svg>

      {/* Bottom-right rim: orange at the right edge (canvas y≈976), fading to the left. canvas x = local x + 756. */}
      <svg className="absolute top-0 right-0 h-195 w-195" viewBox="0 0 780 780" fill="none">
        <defs>
          <linearGradient id="bd-r-rim" gradientUnits="userSpaceOnUse" x1="540" y1="0" x2="780" y2="0">
            <stop offset="0" stopColor="#5a2e3d" stopOpacity="0" />
            <stop offset="0.25" stopColor="#8a4048" stopOpacity="0.8" />
            <stop offset="0.5" stopColor="#c86a4c" />
            <stop offset="0.75" stopColor="#f08a52" />
            <stop offset="1" stopColor="#ffa25f" />
          </linearGradient>
          <linearGradient id="bd-r-air" gradientUnits="userSpaceOnUse" x1="560" y1="0" x2="780" y2="0">
            <stop offset="0" stopColor="#7a3540" stopOpacity="0" />
            <stop offset="1" stopColor="#9a4545" stopOpacity="0.9" />
          </linearGradient>
          <radialGradient id="bd-r-ground" gradientUnits="userSpaceOnUse" cx="780" cy="620" r="320">
            <stop offset="0" stopColor="#2b1f30" />
            <stop offset="0.6" stopColor="#2a1e2e" stopOpacity="0.9" />
            <stop offset="1" stopColor="#0b1020" stopOpacity="0" />
          </radialGradient>
          <filter id="bd-r-soft" filterUnits="userSpaceOnUse" x="-200" y="0" width="1200" height="1000">
            <feGaussianBlur stdDeviation="20" />
          </filter>
          <filter id="bd-r-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
          {fade("bd-r-fade")}
        </defs>
        <g mask="url(#bd-r-fade)">
          <path d="M520 588 C 620 579, 700 563, 800 523" stroke="url(#bd-r-air)" strokeWidth="110" filter="url(#bd-r-soft)" />
          <path d="M520 627 C 620 618, 700 602, 800 562 L 800 800 L 440 800 Z" fill="url(#bd-r-ground)" />
          <path d="M520 625 C 620 616, 700 600, 800 560" stroke="url(#bd-r-rim)" strokeWidth="12" opacity="0.9" filter="url(#bd-r-glow)" />
          <path d="M520 625 C 620 616, 700 600, 800 560" stroke="url(#bd-r-rim)" strokeWidth="3.4" />
        </g>
      </svg>
    </div>
  );
}

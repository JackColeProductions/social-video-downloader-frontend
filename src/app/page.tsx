import { Backdrop, HorizonGlow } from "@/components/backdrop";
import { Downloader } from "@/components/downloader";
import { HeroDecor } from "@/components/hero-decor";
import { LiveBackdrop } from "@/components/live-backdrop";
import { cn } from "@/components/ui";
import { VpMark } from "@/components/vp-mark";
import { SITE_NAME, VP_NAME, VP_URL } from "@/lib/site";

/** Glass pill above the headline: a glowing VP+ chip, the product name, and a glint of light now and then. */
function BrandBadge() {
  return (
    <span
      className={cn(
        "gradient-ring relative inline-flex h-10 items-center gap-3 overflow-hidden rounded-full py-1 pr-4.5 pl-1",
        "bg-[linear-gradient(180deg,rgb(22_30_56/0.9),rgb(10_15_30/0.9))] [--ring:linear-gradient(90deg,rgb(128_249_255/0.75),rgb(91_140_255/0.45)_45%,rgb(170_100_255/0.8))]",
        "shadow-[inset_0_1px_0_rgb(255_255_255/0.08),0_10px_30px_-12px_rgb(91_92_255/0.75),0_0_36px_-14px_rgb(128_249_255/0.55)]",
      )}
    >
      <span className="inline-flex h-full items-center gap-1.75 rounded-full bg-[linear-gradient(180deg,rgb(128_249_255/0.18),rgb(128_255_222/0.06))] px-2.75 shadow-[inset_0_0_0_1px_rgb(128_249_255/0.38),0_0_16px_-4px_rgb(128_249_255/0.55)]">
        <VpMark className="h-3.5 w-auto drop-shadow-[0_0_6px_rgb(128_249_255/0.65)]" />
        <span className="text-dp-13 font-bold tracking-wide text-[#b4fcff]">VP+</span>
      </span>
      <span className="text-gradient-badge text-dp-16 font-semibold">{SITE_NAME}</span>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 hidden w-1/3 bg-[linear-gradient(100deg,transparent,rgb(255_255_255/0.16)_50%,transparent)] motion-safe:block motion-safe:animate-glint"
      />
    </span>
  );
}

export default function Home() {
  return (
    <div className="relative isolate flex min-h-dvh flex-col overflow-clip">
      <Backdrop />
      <LiveBackdrop />
      <HeroDecor />

      <main className="relative mx-auto w-full max-w-299 flex-1 px-4 pt-14 sm:px-5 lg:pt-[calc(var(--canvas-top)+6rem)] lg:pb-12">
        <header className="text-center">
          <BrandBadge />
          <h1 className="mt-6 text-dp-40 leading-[1.06] font-extrabold tracking-[-0.03em] sm:text-dp-56 lg:mt-5 lg:text-dp-71 lg:leading-[1.03]">
            <span className="text-fg [text-shadow:0_0_40px_rgb(255_255_255/0.14)]">Download Videos</span>
            <br />
            <span className="text-gradient-hero">from Anywhere</span>
          </h1>
          <p className="mx-auto mt-4 max-w-140 text-dp-17 leading-[1.45] text-[#a3abc6] sm:text-dp-20 lg:mt-3.5">
            Save your favorite videos in high quality, instantly. <br className="hidden sm:block" />
            Fast, secure and easy to use.
          </p>
        </header>

        <Downloader />
      </main>

      <footer className="relative flex flex-col items-center justify-center gap-x-4 gap-y-2 px-4 pt-14 pb-8 text-center lg:h-12 lg:flex-row lg:py-0">
        <a
          href={VP_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-md text-dp-13 text-[#9aa3bd] transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5b8cff]"
        >
          A product by
          <VpMark className="h-3.5 w-auto" />
          <span className="font-semibold text-fg">{VP_NAME}</span>
        </a>
        <span aria-hidden className="hidden h-3.5 w-px bg-white/15 lg:block" />
        <p className="text-dp-12.5 text-subtle">
          Only download videos you own or have permission to use, and respect each platform&apos;s terms.
        </p>
      </footer>

      <HorizonGlow />
    </div>
  );
}

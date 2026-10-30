"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

/** How long a height change takes; callers that scroll afterwards wait this long. */
export const RESIZE_MS = 320;

/**
 * Animates its height whenever its content grows or shrinks (the video panel opens, closes or
 * changes), so whatever sits below slides instead of jumping. It clips only while
 * animating, so shadows and badges can overflow the rest of the time.
 */
export function SmoothHeight({ children }: { children: ReactNode }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const box = boxRef.current;
    const content = contentRef.current;
    if (!box || !content) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let height = content.offsetHeight;
    let animation: Animation | null = null;

    const release = () => {
      animation = null;
      box.style.height = "";
      box.style.overflow = "";
    };

    const observer = new ResizeObserver(() => {
      const next = content.offsetHeight;
      if (next === height) return;
      // Start from where a running animation has got to, so quick changes stay continuous.
      const from = animation ? box.getBoundingClientRect().height : height;
      animation?.cancel();
      height = next;
      if (reducedMotion.matches) {
        release();
        return;
      }
      // Hold the old height inline right away: the animation itself only applies from the next
      // frame, and the content's new size would otherwise flash for one frame.
      box.style.height = `${from}px`;
      box.style.overflow = "clip";
      animation = box.animate([{ height: `${from}px` }, { height: `${next}px` }], {
        duration: RESIZE_MS,
        easing: "cubic-bezier(0.2, 0.7, 0.2, 1)",
      });
      animation.onfinish = release;
    });
    observer.observe(content);
    return () => {
      observer.disconnect();
      animation?.cancel();
      release();
    };
  }, []);

  return (
    <div ref={boxRef}>
      {/* flow-root keeps children's margins inside, so they are part of the measured height. */}
      <div ref={contentRef} className="flow-root">
        {children}
      </div>
    </div>
  );
}

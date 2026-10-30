"use client";

import { useEffect, useRef } from "react";

/*
 * Faint light particles drifting up behind the page, so the background feels alive. Drawn on one
 * canvas; a still frame when the user prefers reduced motion.
 */

interface Particle {
  x: number;
  y: number;
  size: number;
  alpha: number;
  color: string;
  speed: number;
  phase: number;
}

const COLORS = ["128 249 255", "124 196 255", "124 196 255", "139 125 255", "139 125 255", "183 125 255", "255 255 255"];

const random = (min: number, max: number) => min + Math.random() * (max - min);

export function LiveBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const ctx = context;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let frame = 0;
    let last = performance.now();

    const spawn = (y = random(0, height)): Particle => ({
      x: random(0, width),
      y,
      size: random(0.6, 1.9),
      alpha: random(0.18, 0.6),
      color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
      speed: random(0.12, 0.3),
      phase: random(0, Math.PI * 2),
    });

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas!.clientWidth;
      height = canvas!.clientHeight;
      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      particles = Array.from({ length: Math.min(150, Math.round((width * height) / 9000)) }, () => spawn());
    }

    function draw(now: number) {
      const dt = Math.min(3, (now - last) / 16.67); // in 60fps frames
      last = now;
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]!;
        // A slow rise with a gentle sway; respawn at the bottom once off the top.
        p.x += Math.sin(now * 0.00025 + p.phase) * 0.14 * dt;
        p.y -= p.speed * dt;
        if (p.y < -8) particles[i] = spawn(height + 8);
        else if (p.x < -8) p.x = width + 6;
        else if (p.x > width + 8) p.x = -6;
        const twinkle = 0.65 + 0.35 * Math.sin(now * 0.0021 + p.phase * 3);
        ctx.fillStyle = `rgb(${p.color} / ${p.alpha * twinkle})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!still) frame = requestAnimationFrame(draw);
    }

    const restart = () => {
      cancelAnimationFrame(frame);
      resize();
      last = performance.now();
      frame = requestAnimationFrame(draw);
    };
    window.addEventListener("resize", restart);
    restart();
    return () => {
      window.removeEventListener("resize", restart);
      cancelAnimationFrame(frame);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className="pointer-events-none fixed inset-0 -z-10 size-full" />;
}

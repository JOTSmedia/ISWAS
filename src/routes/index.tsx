import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { logline } from "@/content/packet";

export const Route = createFileRoute("/")({ component: Home });

const TIPS = [0.071, 0.255, 0.428, 0.512, 0.746, 0.913];

function BloodDrips() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const streams = TIPS.map((tip, index) => ({
      tip,
      wait: 0.35 + index * 0.28,
      period: 2.4 + (index % 3) * 0.45,
      held: false,
    }));
    const drops: { x: number; y: number; vy: number; r: number; life: number }[] = [];
    let raf = 0;
    const paint = (now: number) => {
      raf = requestAnimationFrame(paint);
      if (!host.classList.contains("is-shedding")) return;
      const width = host.clientWidth;
      const height = Math.max(host.clientHeight * 2.4, 80);
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const px = Math.round(width * dpr);
      const py = Math.round(height * dpr);
      if (canvas.width !== px || canvas.height !== py) {
        canvas.width = px;
        canvas.height = py;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const time = now / 1000;
      streams.forEach((stream) => {
        const u = ((time + stream.wait) % stream.period) / stream.period;
        const x = stream.tip * width;
        if (u < 0.42) {
          stream.held = false;
          const grow = Math.sin((u / 0.42) * Math.PI);
          const len = 3 + grow * 11;
          const widthNeck = 2.4 + grow * 1.6;
          ctx.beginPath();
          ctx.moveTo(x - widthNeck * 0.45, 0);
          ctx.quadraticCurveTo(x - widthNeck * 0.7, len * 0.55, x, len);
          ctx.quadraticCurveTo(x + widthNeck * 0.7, len * 0.55, x + widthNeck * 0.45, 0);
          ctx.closePath();
          ctx.fillStyle = "rgba(110, 8, 14, 0.95)";
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(x, len, 2.1 + grow * 1.4, 2.6 + grow * 1.8, 0, 0, Math.PI * 2);
          const bead = ctx.createRadialGradient(x - 0.6, len - 1, 0.3, x, len, 4);
          bead.addColorStop(0, "rgba(176, 32, 36, 0.95)");
          bead.addColorStop(1, "rgba(74, 4, 8, 0.95)");
          ctx.fillStyle = bead;
          ctx.fill();
        } else if (!stream.held) {
          stream.held = true;
          drops.push({ x, y: 16, vy: 0.15, r: 3.4, life: 1 });
        }
      });
      for (let i = drops.length - 1; i >= 0; i -= 1) {
        const drop = drops[i];
        drop.vy += 0.16;
        drop.y += drop.vy;
        drop.x += Math.sin(drop.y * 0.08) * 0.08;
        drop.life -= 0.008;
        if (drop.life <= 0 || drop.y > height) {
          drops.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.ellipse(drop.x, drop.y, drop.r * 0.62, drop.r * (1 + drop.vy * 0.05), 0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(128, 14, 20, ${drop.life})`;
        ctx.fill();
      }
    };
    raf = requestAnimationFrame(paint);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} className="scream-bleed" aria-hidden="true" />;
}

function Home() {
  return (
    <div className="flex flex-col gap-5">
      <p className="text-xs font-medium tracking-stamp text-secondary uppercase">
        Confidential · Preliminary presentation · Intended recipient only
      </p>
      <p className="text-sm text-muted">Trancas International Films</p>
      <h1 className="hero-title w-full font-sans font-semibold leading-tight tracking-tight text-fg">
        <span className="hero-line mark-rest">it started with a </span>
        <span className="hero-line mark-scream">
          <BloodDrips />
          <span className="scream-drip" aria-hidden="true">SCREAM</span>
          <span className="scream-face">SCREAM</span>
        </span>
      </h1>
      <p className="max-w-prose text-lg leading-relaxed text-pretty text-fg">{logline}</p>
      <p className="text-sm text-muted">WGA registration No. 2310392</p>
    </div>
  );
}
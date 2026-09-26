import { createFileRoute } from "@tanstack/react-router";
import { logline } from "@/content/packet";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <div className="flex flex-col gap-5">
      <p className="text-xs font-medium tracking-stamp text-secondary uppercase">
        Confidential · Preliminary presentation · Intended recipient only
      </p>
      <p className="text-sm text-muted">Trancas International Films</p>
      <h1 className="hero-title w-full font-sans font-semibold leading-tight tracking-tight text-fg">
        <span className="hero-line mark-rest">it started with a </span>
        <span className="hero-line mark-scream">SCREAM</span>
      </h1>
      <p className="max-w-prose text-lg leading-relaxed text-pretty text-fg">{logline}</p>
      <p className="text-sm text-muted">WGA registration No. 2310392</p>
    </div>
  );
}
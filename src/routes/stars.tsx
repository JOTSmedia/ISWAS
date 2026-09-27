import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Dossier } from "@/components/dossier";
import { stars, starsIntro, type Star } from "@/content/packet";

export const Route = createFileRoute("/stars")({ component: StarsPage });

function StarDialog({ star, onClose }: { star: Star; onClose: () => void }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="gallery-dialog" role="presentation" onClick={onClose}>
      <article
        className="gallery-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="star-title"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="gallery-kicker">Star</p>
        <h2 id="star-title">{star.name}</h2>
        <p className="gallery-credit">{star.origin}</p>
        <img src={star.image} alt="" />
        <p>{star.body}</p>
        <button type="button" className="gallery-close" onClick={onClose}>
          Close
        </button>
      </article>
    </div>
  );
}

function StarsPage() {
  const [open, setOpen] = useState<Star | null>(null);

  return (
    <Dossier index="03" kicker="Stars" title="Stars" lede={starsIntro}>
      <ol className="grid grid-cols-1 gap-4">
        {stars.map((star, index) => (
          <li
            key={star.name}
            className="star-card"
            role="button"
            tabIndex={0}
            onClick={() => setOpen(star)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setOpen(star);
              }
            }}
          >
            <img src={star.image} alt={star.name} width={452} height={580} className="star-photo" />
            <div className="star-copy">
              <p className="text-xs font-medium tracking-wider text-secondary tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h2 className="mt-1 font-sans text-xl font-semibold leading-tight tracking-tight text-fg md:text-2xl">
                {star.name}
              </h2>
              <p className="mt-1 text-sm text-muted">{star.origin}</p>
              <p className="mt-2 text-sm leading-relaxed text-fg">{star.body}</p>
            </div>
          </li>
        ))}
      </ol>
      {open ? createPortal(<StarDialog star={open} onClose={() => setOpen(null)} />, document.body) : null}
    </Dossier>
  );
}
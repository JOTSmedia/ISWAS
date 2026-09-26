import { createFileRoute } from "@tanstack/react-router";
import { Dossier } from "@/components/dossier";
import { comps, compsDistinction, compsIntro } from "@/content/packet";

export const Route = createFileRoute("/comparison")({ component: ComparisonPage });

function ComparisonPage() {
  return (
    <Dossier index="05" kicker="Comparison" title="Comparison" lede={compsIntro}>
      <aside className="max-w-prose border-l-2 border-line pl-4">
        <p className="text-xs font-medium tracking-widest text-secondary uppercase">Distinction</p>
        <p className="mt-3 text-base leading-relaxed text-pretty text-fg">
          {compsDistinction}
          <span className="mark-rest">it started with a </span>
          <span className="mark-scream">SCREAM</span> asks a narrower question: not only how the films
          were made, but what the stars remember of the credit that started the career.
        </p>
      </aside>
      <ul>
        {comps.map((item) => (
          <li key={item.title} className="border-t border-line py-4">
            <div className="flex flex-col gap-1 md:flex-row md:items-baseline md:justify-between md:gap-6">
              <h2 className="font-sans text-2xl font-semibold leading-snug tracking-tight text-balance text-fg">
                {item.title}
              </h2>
              <p className="shrink-0 text-xs font-medium tracking-wider text-muted uppercase">{item.meta}</p>
            </div>
            <p className="mt-3 max-w-prose text-base leading-relaxed text-pretty text-fg">{item.blurb}</p>
          </li>
        ))}
      </ul>
    </Dossier>
  );
}

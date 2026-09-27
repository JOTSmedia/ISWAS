import type { ReactNode } from "react";

export function Dossier({
  index,
  kicker,
  title,
  lede,
  children,
}: {
  index: string;
  kicker: string;
  title: string;
  lede?: string;
  children: ReactNode;
}) {
  return (
    <article className="pb-2">
      <p className="text-xs font-medium tracking-stamp text-secondary uppercase">
        {index} — {kicker}
      </p>
      <h1 className="mt-2 max-w-xl font-sans text-3xl font-semibold leading-tight tracking-tight text-balance text-fg md:text-5xl">
        {title}
      </h1>
      <div className="mt-5 h-px w-16 bg-line" aria-hidden="true" />
      {lede ? (
        <p className="mt-5 max-w-prose text-lg leading-relaxed text-pretty text-fg">{lede}</p>
      ) : null}
      <div className="mt-6 space-y-6">{children}</div>
    </article>
  );
}

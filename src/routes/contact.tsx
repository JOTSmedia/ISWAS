import { createFileRoute } from "@tanstack/react-router";
import { Dossier } from "@/components/dossier";
import { address, contacts, disclaimer, marks } from "@/content/packet";

export const Route = createFileRoute("/contact")({ component: ContactPage });

function ContactPage() {
  return (
    <Dossier
      index="06"
      kicker="Contact"
      title="Contact"
      lede="Trancas International Films. WGA registration No. 2310392."
    >
      <ul className="grid gap-6 sm:grid-cols-2">
        {contacts.map((person) => (
          <li key={person.email}>
            <h2 className="font-sans text-2xl font-semibold leading-tight tracking-tight text-fg">
              {person.name}
            </h2>
            <p className="mt-1 text-sm text-muted">{person.role}</p>
            <a
              href={`mailto:${person.email}`}
              className="mt-2 inline-flex min-h-11 items-center text-sm text-fg underline decoration-line underline-offset-4"
            >
              {person.email}
            </a>
          </li>
        ))}
      </ul>
      <div className="max-w-prose text-sm leading-relaxed text-fg">
        <p>
          {address.company}
          <br />
          {address.lines[0]}
          <br />
          {address.lines[1]}
        </p>
        <p className="mt-2">
          <a
            href={address.phoneHref}
            className="inline-flex min-h-11 items-center text-fg underline decoration-line underline-offset-4"
          >
            {address.phone}
          </a>
        </p>
      </div>
      <p className="text-sm text-fg">{marks.join(" · ")}</p>
      <div className="border-t border-line pt-6">
        <p className="text-xs font-medium tracking-widest text-secondary uppercase">Confidential</p>
        <div className="mt-4 space-y-4">
          {disclaimer.map((paragraph) => (
            <p key={paragraph.slice(0, 24)} className="max-w-prose text-sm leading-relaxed text-pretty text-muted">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </Dossier>
  );
}

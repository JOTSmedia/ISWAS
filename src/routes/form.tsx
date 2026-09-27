import { createFileRoute } from "@tanstack/react-router";
import { Dossier } from "@/components/dossier";
import { form } from "@/content/packet";

export const Route = createFileRoute("/form")({ component: FormPage });

function FormPage() {
  return (
    <Dossier index="04" kicker="Form" title="Form" lede={form.lede}>
      {form.paragraphs.map((paragraph) => (
        <p key={paragraph} className="max-w-prose text-base leading-relaxed text-pretty text-fg">
          {paragraph}
        </p>
      ))}
      <ul>
        {form.principles.map((item, index) => (
          <li key={item.title} className="border-t border-line py-4">
            <p className="text-xs font-medium tracking-wider text-secondary tabular-nums">
              {String(index + 1).padStart(2, "0")}
            </p>
            <h2 className="mt-2 font-sans text-2xl font-semibold leading-snug tracking-tight text-fg">
              {item.title}
            </h2>
            <p className="mt-2 max-w-prose text-base leading-relaxed text-pretty text-muted">{item.body}</p>
          </li>
        ))}
      </ul>
    </Dossier>
  );
}

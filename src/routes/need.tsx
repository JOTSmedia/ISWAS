import { createFileRoute } from "@tanstack/react-router";
import { Dossier } from "@/components/dossier";
import { need } from "@/content/packet";

export const Route = createFileRoute("/need")({ component: NeedPage });

function NeedPage() {
  return (
    <Dossier index="02" kicker="Need" title="Need" lede={need.lede}>
      {need.paragraphs.map((paragraph) => (
        <p key={paragraph} className="max-w-prose text-base leading-relaxed text-pretty text-fg">
          {paragraph}
        </p>
      ))}
    </Dossier>
  );
}

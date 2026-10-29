import { createFileRoute } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";
import { FACTOR_LABELS, FactorBars, FairGauge, PageHeader, Panel } from "@/components/shared";
import { useApp, useMe } from "@/store/app";
import type { FairFactors } from "@/data/types";

export const Route = createFileRoute("/fair-share")({
  head: () => ({ meta: [{ title: "Fair-Share Score — CampusSphare" }, { name: "description", content: "How limited seats and slots are shared fairly, explained." }, { property: "og:title", content: "Fair-Share Score — CampusSphare" }, { property: "og:description", content: "Transparent, explainable allocation." }] }),
  component: Fair,
});

function Fair() {
  const me = useMe();
  const w = useApp((s) => s.weights);
  return (
    <div>
      <PageHeader title="Your Fair-Share Score" subtitle="Used only when more people want a slot than there is room for. Higher score = earlier in line." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Score"><div className="flex justify-center py-2"><FairGauge factors={me.factors} size={220} /></div></Panel>
        <Panel title="What makes up your score"><FactorBars factors={me.factors} /></Panel>
        <Panel title="How scoring works">
          <ul className="space-y-2 text-sm">
            {(Object.keys(FACTOR_LABELS) as (keyof FairFactors)[]).map((k) => (
              <li key={k}><span className="font-medium">{FACTOR_LABELS[k].label}</span> {k !== "penalties" && <span className="text-muted-foreground">(weight {w[k]}%)</span>} — {FACTOR_LABELS[k].help}</li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">Weights are set by college administration and are the same for everyone. A manager can override with a written reason, which is logged.</p>
        </Panel>
        <Panel title={<span className="inline-flex items-center gap-2"><Lightbulb className="h-4 w-4 text-amber" />Tips to improve</span>}>
          <ul className="list-inside list-disc space-y-1 text-sm">
            <li>Check in and return on time — reliability counts.</li>
            <li>Earn skill badges from free workshops.</li>
            <li>Clearly describe a learning or community purpose.</li>
            <li>Cancel early if you can't make it — no penalty.</li>
          </ul>
        </Panel>
      </div>
    </div>
  );
}


import { Link } from "@tanstack/react-router";
import { Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, Panel } from "./shared";

/** Polished "coming soon" page so sidebar links never dead-end. */
export function FeaturePreview({ title, subtitle, features }: { title: string; subtitle: string; features: string[] }) {
  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} eyebrow={<span className="inline-flex items-center gap-1.5 rounded-full bg-amber/15 px-2.5 py-1 text-xs font-semibold text-amber-foreground"><Sparkles className="h-3.5 w-3.5" /> Feature preview</span>} />
      <Panel>
        <p className="mb-4 text-sm text-muted-foreground">This section is planned for the next phase. Here is what it will include:</p>
        <ul className="grid gap-3 sm:grid-cols-3">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-2 rounded-xl border bg-muted/40 p-4 text-sm">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {f}
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button asChild><Link to="/discover">Discover spaces</Link></Button>
          <Button asChild variant="outline"><Link to="/calendar">Open calendar</Link></Button>
        </div>
      </Panel>
    </div>
  );
}

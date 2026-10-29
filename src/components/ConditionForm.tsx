import { useState } from "react";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Field, PhotoDrop, Panel } from "@/components/shared";
import type { ConditionItem } from "@/data/types";
import { cn } from "@/lib/utils";

export function ConditionForm({ checklist, before, onSubmit, cta }: { checklist: string[]; before?: ConditionItem[]; onSubmit: (items: ConditionItem[], notes: string, photos: string[]) => void; cta: string }) {
  const [items, setItems] = useState<ConditionItem[]>(checklist.map((item) => ({ item, ok: true })));
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [err, setErr] = useState("");
  const set = (i: number, ok: boolean) => setItems(items.map((x, j) => (j === i ? { ...x, ok } : x)));
  const submit = () => {
    if (items.some((x) => !x.ok) && notes.trim().length < 5) return setErr("Please describe the issue you marked.");
    onSubmit(items, notes, photos);
  };
  return (
    <div className="space-y-5">
      <Panel title="Condition checklist">
        <ul className="space-y-3">
          {items.map((x, i) => {
            const prev = before?.find((b) => b.item === x.item);
            const changed = prev && prev.ok !== x.ok;
            return (
              <li key={x.item} className={cn("flex flex-col gap-2 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between", changed && "border-st-pending bg-st-pending/10")}>
                <div>
                  <div className="font-medium">{x.item}</div>
                  {before && <div className="text-xs text-muted-foreground">Before: {prev ? (prev.ok ? "OK" : "Issue") : "OK"}{changed && <span className="ml-2 font-semibold text-st-pending">Changed since check-in</span>}</div>}
                </div>
                <div className="flex gap-2" role="radiogroup" aria-label={x.item}>
                  <button role="radio" aria-checked={x.ok} onClick={() => set(i, true)} className={cn("flex h-12 min-w-24 items-center justify-center gap-1.5 rounded-xl border px-4 text-sm font-semibold", x.ok && "border-st-approved bg-st-approved/12 text-st-approved")}><CheckCircle2 className="h-4 w-4" /> OK</button>
                  <button role="radio" aria-checked={!x.ok} onClick={() => set(i, false)} className={cn("flex h-12 min-w-24 items-center justify-center gap-1.5 rounded-xl border px-4 text-sm font-semibold", !x.ok && "border-st-rejected bg-st-rejected/12 text-st-rejected")}><AlertTriangle className="h-4 w-4" /> Issue</button>
                </div>
              </li>
            );
          })}
        </ul>
      </Panel>
      <Panel title="Notes & photos">
        <div className="space-y-4">
          <Field label="Notes" error={err} htmlFor="notes"><Textarea id="notes" value={notes} onChange={(e) => { setNotes(e.target.value); setErr(""); }} placeholder="Anything we should know?" /></Field>
          <PhotoDrop value={photos} onChange={setPhotos} />
        </div>
      </Panel>
      <Button variant="hero" size="xl" className="w-full" onClick={submit}>{cta}</Button>
    </div>
  );
}

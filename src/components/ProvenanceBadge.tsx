import { Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Extracted } from "@/types";

export function ProvenanceBadge({ extracted, label = "Provenance" }: { extracted?: Extracted<any>; label?: string }) {
  if (!extracted || (!extracted.sources?.length && extracted.confidence == null)) return null;
  const count = extracted.sources?.length ?? 0;
  const confidencePct = Math.round((extracted.confidence ?? 0) * 100);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="ml-1 inline-flex items-center rounded-sm border border-border bg-muted/30 px-1.5 py-0.5 text-[10px] text-muted-foreground hover:bg-muted transition"
          aria-label={`${label}: ${confidencePct}% from ${count} source${count === 1 ? "" : "s"}`}
        >
          {confidencePct}% • {count} src
          <Info className="ml-1 h-3 w-3" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80">
        <div className="text-xs">
          <div className="font-medium mb-1">{label}</div>
          <div className="text-muted-foreground mb-2">Confidence {confidencePct}% • {count} source{count === 1 ? "" : "s"}</div>
          <ul className="space-y-2">
            {extracted.sources?.map((s, i) => (
              <li key={i}>
                <div className="font-medium">
                  {s.kind.toUpperCase()} • {s.ref}
                </div>
                {(s.page_from || s.page_to) && (
                  <div className="text-muted-foreground">
                    pp. {s.page_from ?? ""}
                    {s.page_to ? `-${s.page_to}` : ""}
                  </div>
                )}
                {s.snippet && (
                  <div className="mt-1 rounded bg-muted p-2 text-muted-foreground">{s.snippet}</div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </PopoverContent>
    </Popover>
  );
}

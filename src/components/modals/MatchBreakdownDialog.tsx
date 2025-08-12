import * as React from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Props {
  trigger: React.ReactNode;
  scores: { label: string; value: number }[];
}

export function MatchBreakdownDialog({ trigger, scores }: Props) {
  const total = scores.reduce((a, b) => a + b.value, 0);
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Match Breakdown</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {scores.map((s) => (
            <div key={s.label} className="grid grid-cols-3 items-center gap-2">
              <span className="text-sm text-muted-foreground col-span-1">{s.label}</span>
              <div className="col-span-2 h-2 rounded-full bg-secondary">
                <div
                  className="h-2 rounded-full bg-primary"
                  style={{ width: `${(s.value / total) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="premium">OK</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

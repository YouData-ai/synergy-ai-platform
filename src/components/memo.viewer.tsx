// components/MemoModal.tsx
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Memo = {
  latest_id?: string;
  md_url?: string;
  json_url?: string;
  generated_at?: string;
};

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  memo: Memo | null;                 // pass existing memo if you have it
  onRegenerate?: () => Promise<Memo>; // optional: callback to regenerate memo
};

export default function MemoModal({ open, onOpenChange, memo, onRegenerate }: Props) {
  const [md, setMd] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [rawMode, setRawMode] = useState(false);

  async function loadMarkdown(url?: string) {
    if (!url) return;
    setLoading(true);
    try {
      const r = await fetch(url, { credentials: "include" });
      if (!r.ok) throw new Error(`Fetch failed: ${r.status}`);
      setMd(await r.text());
    } catch (e: any) {
      console.error(e);
      setMd(`**Error loading memo.** ${e?.message || e}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open) loadMarkdown(memo?.md_url);
    else setMd("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, memo?.md_url]);

  const handleRegenerate = async () => {
    if (!onRegenerate) return;
    setLoading(true);
    try {
      const m = await onRegenerate();
      await loadMarkdown(m?.md_url);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl md:max-w-4xl lg:max-w-5xl">
        <DialogHeader>
          <DialogTitle>Investment Memo</DialogTitle>
          <DialogDescription className="text-xs">
            {memo?.generated_at
              ? `Generated: ${new Date(memo.generated_at).toLocaleString()}`
              : "—"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between mb-2 gap-2">
          <div className="text-xs text-slate-500 truncate">
            {memo?.latest_id ? `ID: ${memo.latest_id}` : ""}
          </div>
          <div className="flex items-center gap-2">
            {/* {memo?.json_url && (
              <Button variant="outline" size="sm" asChild>
                <a href={memo.json_url} target="_blank" rel="noopener noreferrer">
                  View JSON
                </a>
              </Button>
            )} */}
            <Button variant="outline" size="sm" onClick={() => setRawMode((v) => !v)}>
              {rawMode ? "Preview" : "Raw"}
            </Button>
            {onRegenerate && (
              <Button size="sm" onClick={handleRegenerate} disabled={loading}>
                {loading ? "Regenerating…" : "Regenerate"}
              </Button>
            )}
          </div>
        </div>

        <div className="max-h-[70vh] overflow-y-auto rounded border p-4">
          {loading ? (
            <div className="text-sm text-slate-500">Loading…</div>
          ) : rawMode ? (
            <pre className="text-xs whitespace-pre-wrap">{md || "No content"}</pre>
          ) : (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              // components={{
              //   h1: ({ node, ...props }) => <h1 className="font-semibold text-2xl mt-4 mb-2" {...props} />,
              //   h2: ({ node, ...props }) => <h2 className="font-semibold text-xl mt-4 mb-2" {...props} />,
              //   h3: ({ node, ...props }) => <h3 className="font-semibold text-lg mt-3 mb-1" {...props} />,
              //   strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
              //   // optional: add more if needed for lists, code blocks, etc.
              // }}
              >
                {md || "No content"}
              </ReactMarkdown>
            </div>
          )}
        </div>

        <DialogFooter className="justify-between">
          <div className="text-xs text-slate-400">
            {memo?.md_url ? (
              <a
                href={memo.md_url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Open raw .md
              </a>
            ) : null}
          </div>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
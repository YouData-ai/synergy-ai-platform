// components/UploadPdfButton.tsx
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  startupId: string;                    // e.g., "startup_123"
  kind?: "deck" | "contract" | "other"; // defaults to "deck"
  apiBase?: string;                     // defaults to http://localhost:3001
  onUploaded?: (resp: any) => void;     // callback with JSON response
};

export default function UploadPdfButton({
  startupId,
  kind = "deck",
  apiBase = "http://localhost:3001",
  onUploaded,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  async function handlePick() {
    inputRef.current?.click();
  }

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // guard: single PDF only
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      alert("Please select a PDF file.");
      e.target.value = ""; // reset
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);          // field name must be "file"
      fd.append("kind", kind);          // "deck" | "contract" | ...

      const url = `${apiBase}/api/startups/${encodeURIComponent(startupId)}/files`;
      const resp = await fetch(url, { method: "POST", body: fd });
      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || `Upload failed (${resp.status})`);
      }
      const json = await resp.json();
      onUploaded?.(json);
      // optional UX
      alert("Uploaded successfully.");
    } catch (err: any) {
      console.error(err);
      alert(`Upload error: ${err.message || err}`);
    } finally {
      setLoading(false);
      e.target.value = ""; // allow re-upload of same file
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={handleChange}
      />
      <Button variant="outline" className="w-full" onClick={handlePick} disabled={loading}>
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        {loading ? "Uploading…" : "Upload Documents"}
      </Button>
    </>
  );
}
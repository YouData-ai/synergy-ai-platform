import { Seo } from "@/components/Seo";
import { Header } from "@/components/Header";
import { Input } from "@/components/ui/input";
import { investors } from "@/data/investors";
import { InvestorCard } from "@/components/cards/InvestorCard";
import { useState } from "react";

export default function InvestorsPage() {
  const [q, setQ] = useState("");
  const filtered = investors.filter((i) => i.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <Seo title="Investor Directory — LVX AI Platform" description="Browse and analyze investors by focus, stage, and geography." />
      <Header />
      <main className="container mx-auto py-8">
        <h1 className="text-2xl font-semibold tracking-tight">Investor Directory</h1>
        <p className="text-sm text-muted-foreground mt-1">Card grid with focus areas, stages, geos, and quick metrics.</p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search investors by name…" />
          <div className="hidden md:block" />
          <div className="hidden md:block" />
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((inv) => (
            <InvestorCard key={inv.id} investor={inv} />
          ))}
        </div>
      </main>
    </div>
  );
}

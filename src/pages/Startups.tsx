import { Seo } from "@/components/Seo";
import { Header } from "@/components/Header";
import { Input } from "@/components/ui/input";
import { startups } from "@/data/startups";
import { StartupCard } from "@/components/cards/StartupCard";
import { useState } from "react";

export default function StartupsPage() {
  const [q, setQ] = useState("");
  const filtered = startups.filter((s) => s.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <Seo title="Startup Directory — LVX AI Platform" description="Analyze startups: financials, team, ICP, GTM, and fundraising." />
      <Header />
      <main className="container mx-auto py-8">
        <h1 className="text-2xl font-semibold tracking-tight">Startup Directory</h1>
        <p className="text-sm text-muted-foreground mt-1">Card grid with ARR, growth, and fundraising snapshots.</p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search startups by name…" />
          <div className="hidden md:block" />
          <div className="hidden md:block" />
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((s) => (
            <StartupCard key={s.id} startup={s} />
          ))}
        </div>
      </main>
    </div>
  );
}

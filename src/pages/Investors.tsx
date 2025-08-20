import { Seo } from "@/components/Seo";
import { Header } from "@/components/Header";
import { Input } from "@/components/ui/input";
import { InvestorCard } from "@/components/cards/InvestorCard";
import { useState, useMemo } from "react";
import { useWorkspace } from "@/hooks/useWorkspace";
import type { Investor as ApiInvestor } from "@/lib/api-types";
import type { InvestorProfile } from "@/data/investors";
export default function InvestorsPage() {
  const { data: ws } = useWorkspace();
  const [q, setQ] = useState("");

  const liveInvestors: InvestorProfile[] | null = useMemo(() => {
    if (!ws?.investors) return null;
    const adapt = (i: ApiInvestor): InvestorProfile => {
      const sectors = Array.isArray((i as any).sectors) ? (i as any).sectors : ((i as any).sectors?.value ?? []);
      const stages = Array.isArray((i as any).stages) ? (i as any).stages : ((i as any).stages?.value ?? []);
      const geos = Array.isArray((i as any).geos) ? (i as any).geos : ((i as any).geos?.value ?? []);
      const cs = (i as any).check_size_usd?.value ?? (i as any).check_size_usd ?? undefined;
      const min = cs?.min?.amount ?? undefined;
      const max = cs?.max?.amount ?? undefined;
      const avg_check_usd = typeof min === 'number' && typeof max === 'number' ? Math.round((min + max) / 2) : (min ?? max ?? 0);
      return {
        id: i.id,
        name: i.name,
        type: "VC",
        location: geos?.[0] ?? "",
        aum_usd: 0,
        avg_check_usd,
        portfolio_count: 0,
        focus_areas: sectors ?? [],
        stages: stages ?? [],
        geos: geos ?? [],
      } as InvestorProfile;
    };
    return ws.investors.map(adapt);
  }, [ws]);

  const source = liveInvestors || [];
  const filtered = source?.filter((i) => i.name.toLowerCase().includes(q.toLowerCase()));

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

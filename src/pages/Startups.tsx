import { Seo } from "@/components/Seo";
import { Header } from "@/components/Header";
import { Input } from "@/components/ui/input";
import { StartupCard } from "@/components/cards/StartupCard";
import { useState, useMemo } from "react";
import { useWorkspace } from "@/hooks/useWorkspace";
import type { Startup as ApiStartup } from "@/lib/api-types";
import type { StartupProfile } from "@/data/startups";
export default function StartupsPage() {
  const { data: ws } = useWorkspace();
  const [q, setQ] = useState("");

  const liveStartups: StartupProfile[] | null = useMemo(() => {
    if (!ws?.startups) return null;
    const adapt = (s: ApiStartup): StartupProfile => {
      const sectors = Array.isArray((s as any).sectors) ? (s as any).sectors : ((s as any).sectors?.value ?? []);
      const geos = Array.isArray((s as any).geos) ? (s as any).geos : ((s as any).geos?.value ?? []);
      const one_liner = typeof (s as any).one_liner === 'string' ? (s as any).one_liner : ((s as any).one_liner?.value ?? "");
      const stage = typeof (s as any).stage === 'string' ? (s as any).stage : ((s as any).stage?.value ?? undefined);
      const traction = (s as any).traction?.value ?? (s as any).traction ?? undefined;
      const fundraising = (s as any).fundraising?.value ?? (s as any).fundraising ?? undefined;
      const arr_usd = traction?.revenue?.amount ?? undefined;
      const growth_pct = traction?.growth_rate_percent ?? undefined;
      const valuation_usd = fundraising?.pre_money?.amount ?? undefined;
      return {
        id: s.id,
        name: (s as any).company_name ?? "",
        sectors: sectors ?? [],
        geos: geos ?? [],
        one_liner,
        stage,
        arr_usd,
        growth_pct,
        valuation_usd,
        team_size: undefined,
        raising_usd: fundraising?.raise_amount?.amount ?? undefined,
        premoney_usd: fundraising?.pre_money?.amount ?? undefined,
      } as StartupProfile;
    };
    return ws.startups.map(adapt);
  }, [ws]);

  const source = liveStartups;
  const filtered = source.filter((s) => s.name.toLowerCase().includes(q.toLowerCase()));

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

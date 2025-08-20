import { Seo } from "@/components/Seo";
import { Header } from "@/components/Header";
import { MetricCard } from "@/components/cards/MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useWorkspace } from "@/hooks/useWorkspace";
import { AGENTS_UI_DEMO } from "@/data/agent-ui.data";

export default function Dashboard() {
  const { data: ws } = useWorkspace();
  console.log(ws);
  const invCount = ws?.investors?.length ;
  const stCount = ws?.startups?.length;
  return (
    <div>
      <Seo title="LVX AI Platform — Dashboard" description="Investor & Startup matching and analysis platform." />
      <Header />

      <main className="container mx-auto py-8">
        <section className="rounded-xl p-8 bg-[image:var(--gradient-hero)] text-primary-foreground shadow-[var(--shadow-elevated)]">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">For Investors & Startups — Matching & Analysis</h1>
          <p className="mt-2 text-sm/6 md:text-base/7 opacity-90 max-w-2xl">
            Store rich profiles, run AI agents, and generate memos with explainable scores.
          </p>
          <div className="mt-4 flex gap-3">
            <Link to="/investors"><Button variant="premium">Explore Investors</Button></Link>
            <Link to="/startups"><Button variant="secondary">Explore Startups</Button></Link>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-4 mt-8">
          <MetricCard title="Investors" value={invCount} subtext="profiles stored" />
          <MetricCard title="Startups" value={stCount} subtext="profiles stored" />
          <MetricCard title="Matches" value={ws?.matches?.length ?? 42} subtext="last 7 days" />
          <MetricCard title="Active Agents" value={AGENTS_UI_DEMO.cards.length} subtext={`Run ${AGENTS_UI_DEMO.global.usage_summary_24h?.calls} in 24h`} />
        </section>

        <section className="grid md:grid-cols-3 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Investors Directory</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Browse and filter by sector, stage, geo, and check size.</p>
              <Link to="/investors"><Button className="mt-4" variant="premium">Open</Button></Link>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Startups Directory</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">View financials, team, and fundraising info at a glance.</p>
              <Link to="/startups"><Button className="mt-4" variant="premium">Open</Button></Link>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>AI Agent Network</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Monitor agent status, performance, and connections.</p>
              <Link to="/agents"><Button className="mt-4" variant="premium">Open</Button></Link>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}

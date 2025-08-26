// AgentsPage.tsx
import type { AgentsUIPayload, AgentCardVM, AgentDetailVM, AgentControlsVM } from "@/lib/ui-agent";
import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { loadAgentsUI, simulateRun } from "@/lib/agent-ui.provide";
import { Seo } from "@/components/Seo";
import { Header } from "@/components/Header";

export default function AgentsPage() {
  const [data, setData] = useState<AgentsUIPayload | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => setData(loadAgentsUI()), []);

  if (!data) return <div className="p-6">Loading…</div>;

  async function onRun(agentId: string) {
    const d = await simulateRun(data, agentId, 700 + Math.round(Math.random()*900), true);
    setData(d);
  }

  return (
    <div>
      <Seo title="LVX AI Platform — Agents" description="Investor & Startup matching and analysis platform." />
      <Header />

      <main className="container mx-auto py-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">AI Agent Network</h1>
          <p className="text-sm text-slate-500">
            Calls: {data.global.usage_summary_24h.calls} • Success: {data.global.usage_summary_24h.success_rate_pct}% •
            Cost 24h: ${data.global.usage_summary_24h.cost_usd}
          </p>
        </div>
      </header>

      {/* Cards */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {data.cards.map(card => (
          <AgentCard key={card.id} card={card} onOpen={() => setOpenId(card.id)} />
        ))}
      </div>

      {/* Detail Drawer */}
      <Sheet open={!!openId} onOpenChange={(o) => !o && setOpenId(null)}>
        <SheetContent side="right" className="w-[520px] sm:max-w-none">
          {openId && <AgentDetail
            card={data.cards.find(c => c.id === openId)!}
            detail={data.details[openId]}
            controls={data.controls[openId]}
          />}
        </SheetContent>
      </Sheet>
      </main>

    </div>
  );
}

function AgentCard({ card, onOpen }: { card: AgentCardVM; onOpen: () => void }) {
  const statusColor = card.status === "active" ? "bg-blue-600" : card.status === "degraded" ? "bg-amber-600" : "bg-slate-400";
  return (
    <div className="rounded-2xl border p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="text-xl font-semibold">{card.name}</div>
        <span className={`text-white text-sm px-3 py-1 rounded-full ${statusColor}`}>{card.status?.toUpperCase()}</span>
      </div>
      <div className="mt-1 text-sm text-slate-500">{card.protocol} • Last update {new Date(card.last_update_iso).toLocaleDateString()}</div>
      {/* <div className="mt-4 grid grid-cols-3 gap-4">
        <Metric label="Uptime" value={`${card.metrics.uptime_pct}%`} />
        <Metric label="Perf" value={String(card.metrics.perf_score)} />
        <Metric label="Latency" value={`${card.metrics.latency_ms} ms`} />
      </div> */}
      <div className="mt-4 flex flex-wrap gap-2">
        {card.tags.map(t => <span key={t} className="rounded-full bg-slate-100 px-3 py-1 text-sm">{t}</span>)}
      </div>
      <div className="mt-4"><Button variant="secondary" onClick={onOpen}>Open</Button></div>
    </div>
  );
}
function Metric({label, value}:{label:string; value:string}) {
  return <div><div className="text-slate-500 text-sm">{label}</div><div className="text-lg font-semibold">{value}</div></div>;
}

function AgentDetail({ card, detail, controls }:{ card: AgentCardVM; detail: AgentDetailVM; controls: AgentControlsVM }) {
  return (
    <>
      <SheetHeader>
        <SheetTitle>{card.name}</SheetTitle>
        <div className="text-sm text-slate-500">{detail.description}</div>
      </SheetHeader>

      {/* Controls */}
      {/* <div className="mt-4 flex gap-2">
        {controls.actions.run_endpoint && <Button onClick={() => runEndpoint(controls.actions.run_endpoint!)}>Run</Button>}
        {controls.actions.monitor_url && <a className="btn" href={controls.actions.monitor_url}>Monitor</a>}
        {controls.actions.configure_url && <a className="btn" href={controls.actions.configure_url}>Configure</a>}
        {controls.actions.curl_example && (
          <Button variant="outline" onClick={() => navigator.clipboard.writeText(controls.actions.curl_example!)}>Copy cURL</Button>
        )}
      </div> */}

      {/* IO + Logs */}
      <div className="mt-6 space-y-4">
        <section title="Capabilities">{detail.capabilities.join(" • ")}</section>
        <section title="Model">{detail.model.provider} • {detail.model.name}</section>
        <section title="Endpoints">{Object.entries(detail.endpoints).map(([k,e]:any)=> <div key={k} className="text-sm">{e.method} {e.path}</div>)}</section>
        <section title="Schemas"><pre className="bg-slate-50 p-3 rounded-lg text-xs overflow-auto">{JSON.stringify(detail.io, null, 2)}</pre></section>
        <section title="Recent Runs">
          {detail.observability.last_runs.map(r => (
            <div key={r.id} className="text-xs flex justify-between">
              <span>{r.id} • {r.status}</span>
              <span>{r.duration_ms} ms • {new Date(r.timestamp).toLocaleString()}</span>
            </div>
          ))}
        </section>
        {detail.observability.last_error && (
          <div className="text-xs text-red-600">Last error {new Date(detail.observability.last_error.when).toLocaleString()}: {detail.observability.last_error.message}</div>
        )}
      </div>
    </>
  );
}

async function runEndpoint(url: string) {
  await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
}
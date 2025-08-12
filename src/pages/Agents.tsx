import { Seo } from "@/components/Seo";
import { Header } from "@/components/Header";
import { agents } from "@/data/agents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function AgentsPage() {
  return (
    <div>
      <Seo title="AI Agent Network — LVX AI Platform" description="Monitor agent status, performance, and connections." />
      <Header />
      <main className="container mx-auto py-8">
        <h1 className="text-2xl font-semibold tracking-tight">AI Agent Network</h1>
        <p className="text-sm text-muted-foreground mt-1">Grid view of active agents with performance metrics.</p>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {agents.map((ag) => (
            <Dialog key={ag.id}>
              <DialogTrigger asChild>
                <Card className="hover:shadow-[var(--shadow-elevated)] transition-all cursor-pointer">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-medium">{ag.name}</CardTitle>
                      <Badge variant={ag.status === 'active' ? 'default' : 'secondary'}>{ag.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{ag.type} • Last update {new Date(ag.last_update).toLocaleDateString()}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Uptime</p>
                        <p className="font-medium">{ag.uptime_pct}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Perf</p>
                        <p className="font-medium">{ag.performance_score}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Latency</p>
                        <p className="font-medium">{ag.avg_latency_ms} ms</p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {ag.capabilities.map((c)=> <Badge key={c} variant="secondary">{c}</Badge>)}
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{ag.name}</DialogTitle>
                </DialogHeader>
                <div className="text-sm space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-muted-foreground">Input Schema</p>
                      <pre className="mt-1 p-3 bg-secondary rounded-md overflow-auto">{ag.input_schema}</pre>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Output Schema</p>
                      <pre className="mt-1 p-3 bg-secondary rounded-md overflow-auto">{ag.output_schema}</pre>
                    </div>
                  </div>
                  {ag.connected_to && (
                    <div>
                      <p className="text-muted-foreground">Connected to</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {ag.connected_to.map((id)=> <Badge key={id}>{id}</Badge>)}
                      </div>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      </main>
    </div>
  );
}

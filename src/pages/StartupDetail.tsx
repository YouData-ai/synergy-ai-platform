import { Seo } from "@/components/Seo";
import { Header } from "@/components/Header";
import { useParams } from "react-router-dom";
import { startups } from "@/data/startups";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ProvenanceBadge } from "@/components/ProvenanceBadge";

export default function StartupDetail() {
  const { id } = useParams();
  const startup = startups.find((s) => s.id === id);
  if (!startup) return (
    <div>
      <Header />
      <main className="container mx-auto py-8">Not found.</main>
    </div>
  );

  return (
    <div>
      <Seo title={`${startup.name} — Startup Profile`} description={`${startup.one_liner}`} />
      <Header />
      <main className="container mx-auto py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <section>
            <div className="flex items-start gap-4">
              {startup.logo ? (
                <img src={startup.logo} alt={`${startup.name} logo`} className="h-10 w-10 rounded" />
              ) : (
                <div className="h-10 w-10 rounded bg-secondary" />
              )}
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">{startup.name}</h1>
                <p className="text-sm text-muted-foreground">{startup.sectors.join(", ")} • {startup.geos.join(", ")}</p>
              </div>
            </div>

            <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-1">
                    <span>ARR</span>
                    <ProvenanceBadge extracted={startup.arr_extracted} label="ARR" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xl font-semibold">${((startup.arr_usd||0)/1_000_000).toFixed(2)}M</CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-1">
                    <span>Growth</span>
                    <ProvenanceBadge extracted={startup.growth_extracted} label="Growth" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xl font-semibold">{startup.growth_pct||0}%</CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-1">
                    <span>Valuation</span>
                    <ProvenanceBadge extracted={startup.valuation_extracted} label="Valuation" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xl font-semibold">${((startup.valuation_usd||0)/1_000_000).toFixed(0)}M</CardContent>
              </Card>
            </div>

            <Tabs defaultValue="overview" className="mt-8">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="deck">Deck Analysis</TabsTrigger>
                <TabsTrigger value="research">Market Research</TabsTrigger>
                <TabsTrigger value="matches">Matches</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-4 space-y-6">
                <div>
                  <h3 className="text-base font-medium">ICP & GTM</h3>
                  <p className="text-sm text-muted-foreground mt-1">{startup.icp || "N/A"} — {startup.gtm || "N/A"}</p>
                </div>

                {startup.founders && (
                  <div>
                    <h3 className="text-base font-medium">Team</h3>
                    <ul className="mt-2 space-y-1 text-sm">
                      {startup.founders.map((f)=> (
                        <li key={f.name}>
                          {f.name} {f.linkedin && <a className="text-primary underline-offset-4 hover:underline ml-1" href={f.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="deck" className="mt-4">
                <Card>
                  <CardContent className="p-4 text-sm text-muted-foreground">
                    Key findings, improvement areas, and tough questions will appear here after running the Deck Analysis agent.
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="research" className="mt-4">
                <Card>
                  <CardContent className="p-4 text-sm text-muted-foreground">
                    Market Research Agent summary will be shown here.
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="matches" className="mt-4">
                <Card>
                  <CardContent className="p-4 text-sm text-muted-foreground">
                    Ranked investors with detailed breakdown coming soon.
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </section>

          <aside className="lg:sticky lg:top-16 h-fit">
            <Sheet>
              <SheetTrigger asChild>
                <Button className="w-full" variant="hero">Actions & Data Room</Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>Actions</SheetTitle>
                </SheetHeader>
                <div className="mt-4 space-y-3">
                  <Button variant="premium" className="w-full">Generate Memo</Button>
                  <Button variant="secondary" className="w-full">Open Q/A Agent</Button>
                  <Button variant="secondary" className="w-full">Upload to Data Room</Button>

                  <div className="pt-4">
                    <h4 className="text-sm font-medium">Data Room</h4>
                    <p className="text-xs text-muted-foreground mt-1">No files uploaded yet.</p>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </aside>
        </div>
      </main>
    </div>
  );
}

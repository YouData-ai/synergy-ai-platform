import { Seo } from "@/components/Seo";
import { Header } from "@/components/Header";
import { useParams } from "react-router-dom";
import { startups as mockStartups } from "@/data/startups";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ProvenanceBadge } from "@/components/ProvenanceBadge";
import { useState } from "react";
import { api, postJson } from "@/lib/api";
import type { DeckAnalysis, MarketRunItem, Match, ToughQ, DeckAnalyzeResp, MarketSuggestResp, MarketRunResp, MatchForStartupResp, ToughQAResp } from "@/lib/api-types";
import { toast } from "@/components/ui/use-toast";
import { useWorkspace } from "@/hooks/useWorkspace";
import type { Startup as ApiStartup } from "@/lib/api-types";
export default function StartupDetail() {
  const { id } = useParams();
  const { data: ws } = useWorkspace();
  const adapt = (s: ApiStartup) => {
    const sectors = Array.isArray((s as any).sectors) ? (s as any).sectors : ((s as any).sectors?.value ?? []);
    const geos = Array.isArray((s as any).geos) ? (s as any).geos : ((s as any).geos?.value ?? []);
    const one_liner = typeof (s as any).one_liner === 'string' ? (s as any).one_liner : ((s as any).one_liner?.value ?? "");
    return {
      id: s.id,
      name: (s as any).company_name ?? "",
      logo: undefined,
      sectors,
      geos,
      one_liner,
      arr_usd: (s as any).traction?.value?.revenue?.amount ?? undefined,
      growth_pct: (s as any).traction?.value?.growth_rate_percent ?? undefined,
      valuation_usd: (s as any).fundraising?.value?.pre_money?.amount ?? undefined,
      founders: [],
      icp: (s as any).icp ?? (s as any).gtm_strategy?.value ?? undefined,
      gtm: (s as any).gtm_strategy?.value ?? undefined,
      stage: (s as any).stage?.value ?? undefined,
    } as any;
  };
  const wsStartup = ws?.startups?.find((s) => s.id === id);
  const startup = wsStartup ? adapt(wsStartup as any) : mockStartups.find((s) => s.id === id);
  if (!startup) return (
    <div>
      <Header />
      <main className="container mx-auto py-8">Not found.</main>
    </div>
  );

  const [deckAnalyses, setDeckAnalyses] = useState<DeckAnalysis[]>([]);
  const [marketSuggested, setMarketSuggested] = useState<string[]>([]);
  const [marketRan, setMarketRan] = useState<MarketRunItem[]>([]);
  const [matchResults, setMatchResults] = useState<Match[]>([]);
  const [toughQs, setToughQs] = useState<ToughQ[]>([]);

  const handleRunDeck = async () => {
    try {
      const r = await postJson<DeckAnalyzeResp>(`/api/startups/${startup.id}/deck/analyze`, {});
      if ((r as any).ok) {
        const da = (r as any).deck_analysis as DeckAnalysis;
        setDeckAnalyses((prev) => [da, ...prev]);
        toast({ description: "Deck analysis added." });
      }
    } catch (e: any) {
      toast({ description: e.message || "Failed to run analysis" });
    }
  };

  const handleSuggest = async () => {
    try {
      const r = await postJson<MarketSuggestResp>(`/api/startups/${startup.id}/market/suggest`, { n: 6 });
      if ((r as any).suggested_queries) setMarketSuggested((r as any).suggested_queries);
      toast({ description: "Suggestions updated." });
    } catch (e: any) {
      toast({ description: e.message || "Suggestion failed" });
    }
  };

  const handleRunMarket = async () => {
    try {
      const r = await postJson<MarketRunResp>(`/api/startups/${startup.id}/market/run`, { topK: 3, maxResults: 6 });
      if ((r as any).ran) setMarketRan((r as any).ran);
      toast({ description: "Market run completed." });
    } catch (e: any) {
      toast({ description: e.message || "Market run failed" });
    }
  };

  const handleFindMatches = async () => {
    try {
      const r = await postJson<MatchForStartupResp>(`/api/match/for-startup`, { startup_id: startup.id, topK: 5, with_rationale: true, with_intro: true });
      if ((r as any).matches) setMatchResults((r as any).matches);
      toast({ description: "Matches updated." });
    } catch (e: any) {
      toast({ description: e.message || "Match failed" });
    }
  };

  const handleGenerateQA = async () => {
    try {
      const r = await postJson<ToughQAResp>(`/api/startups/${startup.id}/qa/investor`, {});
      if ((r as any).ok) {
        toast({ description: "Generated tough questions." });
      } else {
        toast({ description: "Q/A request sent." });
      }
    } catch (e: any) {
      toast({ description: e.message || "Failed to generate Q/A" });
    }
  };

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
                <TabsTrigger value="investor_prep">Investor Prep</TabsTrigger>
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

              <TabsContent value="deck" className="mt-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={handleRunDeck}>Run Deck Analysis</Button>
                  <span className="text-xs text-muted-foreground">Appends a new analysis entry</span>
                </div>
                {deckAnalyses.length === 0 ? (
                  <Card><CardContent className="p-4 text-sm text-muted-foreground">No analyses yet. Click "Run Deck Analysis".</CardContent></Card>
                ) : (
                  <div className="grid gap-3">
                    {deckAnalyses.map((da) => (
                      <Card key={da.id}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Deck Analysis • {new Date(da.created_at).toLocaleString()}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <p className="text-sm">{da.summary}</p>
                          {da.strengths?.length ? (
                            <div>
                              <div className="text-xs font-medium">Strengths</div>
                              <ul className="text-xs text-muted-foreground list-disc ml-5 mt-1">
                                {da.strengths.slice(0,5).map((s,i)=>(<li key={i}>{s}</li>))}
                              </ul>
                            </div>
                          ) : null}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="research" className="mt-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="secondary" onClick={handleSuggest}>Suggest Queries</Button>
                  <Button size="sm" onClick={handleRunMarket}>Run Top-K</Button>
                </div>
                {marketSuggested.length ? (
                  <div className="flex flex-wrap gap-2">
                    {marketSuggested.map((q) => (<Badge key={q} variant="outline">{q}</Badge>))}
                  </div>
                ) : null}
                {marketRan.length ? (
                  <div className="space-y-3">
                    {marketRan.map((item, idx) => (
                      <Card key={idx}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">{item.query}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <ul className="text-sm list-disc ml-5">
                            {item.summary_bullets.slice(0,6).map((b,i)=>(<li key={i}>{b}</li>))}
                          </ul>
                          <div className="text-xs text-muted-foreground">Citations:{" "}
                            {item.citations.map((c,i)=>(
                              <a key={i} href={c.url} target="_blank" rel="noreferrer" className="underline underline-offset-4 mr-2">{c.title}</a>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : null}
              </TabsContent>

              <TabsContent value="matches" className="mt-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={handleFindMatches}>Find Best Matches</Button>
                </div>
                {!matchResults.length ? (
                  <Card><CardContent className="p-4 text-sm text-muted-foreground">Run to see ranked investors.</CardContent></Card>
                ) : (
                  <div className="space-y-3">
                    {matchResults.map((m) => (
                      <Card key={m.id}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Badge>{Math.round(m.score)}</Badge>
                            <span>Investor {m.investor_id}</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {m.matching_reason && <p className="text-sm">{m.matching_reason}</p>}
                          <div className="flex flex-wrap gap-2">
                            {typeof m.breakdown.sector === 'number' && <Badge variant="outline">Sector {m.breakdown.sector}</Badge>}
                            {typeof m.breakdown.stage === 'number' && <Badge variant="outline">Stage {m.breakdown.stage}</Badge>}
                            {typeof m.breakdown.geo === 'number' && <Badge variant="outline">Geo {m.breakdown.geo}</Badge>}
                            {typeof m.breakdown.check === 'number' && <Badge variant="outline">Check {m.breakdown.check}</Badge>}
                            {typeof m.breakdown.thesis_semantic === 'number' && <Badge variant="outline">Thesis {m.breakdown.thesis_semantic}</Badge>}
                          </div>
                          {m.intro ? (
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="secondary" onClick={() => { navigator.clipboard.writeText(m.intro!); toast({ description: 'Intro copied' }); }}>Copy Intro</Button>
                              <span className="text-xs text-muted-foreground truncate">{m.intro}</span>
                            </div>
                          ) : null}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="investor_prep" className="mt-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={handleGenerateQA}>Generate Tough Q/A</Button>
                  <span className="text-xs text-muted-foreground">10 questions will be generated by backend.</span>
                </div>
                {!toughQs.length ? (
                  <Card><CardContent className="p-4 text-sm text-muted-foreground">Questions will appear after generation and reload.</CardContent></Card>
                ) : (
                  <div className="space-y-3">
                    {toughQs.map((q, idx) => (
                      <Card key={idx}>
                        <CardHeader className="pb-1">
                          <CardTitle className="text-sm">{q.question}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-xs text-muted-foreground">{q.why_it_matters}</p>
                          {q.suggested_answer_outline && <p className="text-xs mt-1">{q.suggested_answer_outline}</p>}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
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

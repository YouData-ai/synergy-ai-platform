import { Seo } from "@/components/Seo";
import { Header } from "@/components/Header";
import { useParams, Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useWorkspace } from "@/hooks/useWorkspace";
export default function InvestorDetail() {
  const { id } = useParams();
  const { data: ws } = useWorkspace();
  const investor = (ws?.investors?.find((i) => i.id === id) as any);

  if (!investor) return (
    <div>
      <Header />
      <main className="container mx-auto py-8">Not found.</main>
    </div>
  );

  const topMatches = [...(ws?.startups as any)]
    .map((s:any)=> ({...s, name: s.name ?? s.company_name ?? "", sectors: s.sectors?.value ?? s.sectors ?? [], match_score: s.match_score ?? 0 }))
    .sort((a: any, b: any) => (b.match_score || 0) - (a.match_score || 0))
    .slice(0, 5);

  return (
    <div>
      <Seo title={`${(investor as any).name} — Investor Profile`} description={`${(investor as any).type || "Investor"} focusing on ${(investor as any).focus_areas?.join(", ") || (investor as any).sectors?.value?.join(", ") || "multiple"} in ${(investor as any).geos?.join(", ") || (investor as any).geos?.value?.join(", ") || "various"}.`} />
      <Header />
      <main className="container mx-auto py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <section>
            <div className="flex items-start gap-4">
              {/* {(investor as any).logo ? (
                <img src={(investor as any).logo} alt={`${(investor as any).name} logo`} className="h-10 w-10 rounded" />
              ) : (
                <div className="h-10 w-10 rounded bg-secondary" />
              )} */}
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">{(investor as any).name}</h1>
                <p className="text-sm text-muted-foreground">{(investor as any).type || "Investor"} • {(investor as any).location || (investor as any).geos?.[0] || (investor as any).geos?.value?.[0] || ""}</p>
              </div>
            </div>

            <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm">AUM</CardTitle></CardHeader><CardContent className="text-xl font-semibold">${(((investor as any).aum_usd||0)/1_000_000).toFixed(0)}M</CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Avg Check</CardTitle></CardHeader><CardContent className="text-xl font-semibold">${(((investor as any).avg_check_usd||((investor as any).check_size_usd?.value?.min?.amount ?? (investor as any).check_size_usd?.min?.amount ?? 0))/1_000_000).toFixed(2)}M</CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Portfolio</CardTitle></CardHeader><CardContent className="text-xl font-semibold">{(investor as any).portfolio_count ?? 0}</CardContent></Card>
            </div>

            <div className="mt-8 space-y-6">
              <div>
                <h2 className="text-lg font-medium">Focus</h2>
                <div className="mt-2 flex flex-wrap gap-1">
                  {((investor as any).focus_areas ?? (investor as any).sectors?.value ?? []).map((t: string)=> <Badge key={t} variant="secondary">{t}</Badge>)}
                  {((investor as any).stages ?? (investor as any).stages?.value ?? []).map((s: string)=> <Badge key={s} variant="outline">{s}</Badge>)}
                  {((investor as any).geos ?? (investor as any).geos?.value ?? []).map((g: string)=> <Badge key={g}>{g}</Badge>)}
                </div>
              </div>

              {((investor as any).philosophy || (investor as any).investment_philosophy?.value) && (
                <div>
                  <h3 className="text-base font-medium">Investment Philosophy</h3>
                  <p className="text-sm text-muted-foreground mt-1">{(investor as any).philosophy || (investor as any).investment_philosophy?.value}</p>
                </div>
              )}

              {((investor as any).anti_thesis || (investor as any).anti_thesis?.value) && (
                <div>
                  <h3 className="text-base font-medium">Anti-thesis</h3>
                  <p className="text-sm text-muted-foreground mt-1">{(investor as any).anti_thesis || (investor as any).anti_thesis?.value}</p>
                </div>
              )}

              {Array.isArray((investor as any).contacts) && (
                <div>
                  <h3 className="text-base font-medium">Contacts</h3>
                  <ul className="mt-2 space-y-1 text-sm">
                    {(investor as any).contacts.map((c:any)=> (
                      <li key={c.name}>
                        {c.name} {c.role && <span className="text-muted-foreground">— {c.role}</span>} {c.linkedin && <a className="text-primary underline-offset-4 hover:underline ml-1" href={c.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="premium">View Full Portfolio</Button>
                <Button variant="secondary">Export Profile</Button>
              </div>
            </div>
          </section>

          <aside className="lg:sticky lg:top-16 h-fit">
            <Sheet>
              <SheetTrigger asChild>
                <Button className="w-full" variant="hero">Find Best Matching Startups</Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>Matching Startups</SheetTitle>
                </SheetHeader>
                <div className="mt-4 space-y-3">
                  {topMatches.map((s) => (
                    <Card key={s.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{s.name}</p>
                            <p className="text-xs text-muted-foreground">{(s.sectors || []).join(", ")}</p>
                          </div>
                          <span className="text-sm text-muted-foreground">Score {s.match_score}</span>
                        </div>
                        <Link to={`/startups/${s.id}`} className="mt-2 inline-block"><Button size="sm" variant="premium">View</Button></Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </aside>
        </div>
      </main>
    </div>
  );
}

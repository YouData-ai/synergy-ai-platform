import { Seo } from "@/components/Seo";
import { Header } from "@/components/Header";
import { useParams, Link } from "react-router-dom";
import { investors } from "@/data/investors";
import { startups } from "@/data/startups";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export default function InvestorDetail() {
  const { id } = useParams();
  const investor = investors.find((i) => i.id === id);

  if (!investor) return (
    <div>
      <Header />
      <main className="container mx-auto py-8">Not found.</main>
    </div>
  );

  const topMatches = [...startups]
    .sort((a, b) => (b.match_score || 0) - (a.match_score || 0))
    .slice(0, 5);

  return (
    <div>
      <Seo title={`${investor.name} — Investor Profile`} description={`${investor.type} investor focusing on ${investor.focus_areas?.join(", ")} in ${investor.geos?.join(", ")}.`} />
      <Header />
      <main className="container mx-auto py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <section>
            <div className="flex items-start gap-4">
              {investor.logo ? (
                <img src={investor.logo} alt={`${investor.name} logo`} className="h-10 w-10 rounded" />
              ) : (
                <div className="h-10 w-10 rounded bg-secondary" />
              )}
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">{investor.name}</h1>
                <p className="text-sm text-muted-foreground">{investor.type} • {investor.location}</p>
              </div>
            </div>

            <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm">AUM</CardTitle></CardHeader><CardContent className="text-xl font-semibold">${(investor.aum_usd/1_000_000).toFixed(0)}M</CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Avg Check</CardTitle></CardHeader><CardContent className="text-xl font-semibold">${(investor.avg_check_usd/1_000_000).toFixed(2)}M</CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Portfolio</CardTitle></CardHeader><CardContent className="text-xl font-semibold">{investor.portfolio_count}</CardContent></Card>
            </div>

            <div className="mt-8 space-y-6">
              <div>
                <h2 className="text-lg font-medium">Focus</h2>
                <div className="mt-2 flex flex-wrap gap-1">
                  {investor.focus_areas?.map((t)=> <Badge key={t} variant="secondary">{t}</Badge>)}
                  {investor.stages?.map((s)=> <Badge key={s} variant="outline">{s}</Badge>)}
                  {investor.geos?.map((g)=> <Badge key={g}>{g}</Badge>)}
                </div>
              </div>

              {investor.philosophy && (
                <div>
                  <h3 className="text-base font-medium">Investment Philosophy</h3>
                  <p className="text-sm text-muted-foreground mt-1">{investor.philosophy}</p>
                </div>
              )}

              {investor.anti_thesis && (
                <div>
                  <h3 className="text-base font-medium">Anti-thesis</h3>
                  <p className="text-sm text-muted-foreground mt-1">{investor.anti_thesis}</p>
                </div>
              )}

              {investor.contacts && (
                <div>
                  <h3 className="text-base font-medium">Contacts</h3>
                  <ul className="mt-2 space-y-1 text-sm">
                    {investor.contacts.map((c)=> (
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
                            <p className="text-xs text-muted-foreground">{s.sectors.join(", ")}</p>
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

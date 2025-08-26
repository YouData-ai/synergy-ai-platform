import { Seo } from "@/components/Seo";
import { Header } from "@/components/Header";
import { useParams, Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

export default function InvestorDetail() {
  const { id } = useParams();
  const { data: ws } = useWorkspace();
  const [activeTab, setActiveTab] = useState("overview");
  
  const investor = (ws?.investors?.find((i) => i.id === id) as any);

  if (!investor) return (
    <div>
      <Header />
      <main className="container mx-auto py-8">Not found.</main>
    </div>
  );

  // Helper functions
  const formatAmount = (amount: number) => {
    if (!amount) return "—";
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
    return `$${amount}`;
  };

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      'Pre-Seed': 'bg-purple-100 text-purple-800',
      'Seed': 'bg-green-100 text-green-800',
      'Series A': 'bg-blue-100 text-blue-800',
      'Series B': 'bg-orange-100 text-orange-800',
      'Series C+': 'bg-red-100 text-red-800'
    };
    return colors[stage] || 'bg-gray-100 text-gray-800';
  };

  const getSectorColor = (sector: string) => {
    const colors: Record<string, string> = {
      'Enterprise': 'bg-indigo-100 text-indigo-800',
      'Consumer': 'bg-pink-100 text-pink-800',
      'FinTech': 'bg-emerald-100 text-emerald-800',
      'Healthcare': 'bg-rose-100 text-rose-800',
      'AI': 'bg-violet-100 text-violet-800',
      'Edtech': 'bg-cyan-100 text-cyan-800'
    };
    return colors[sector] || 'bg-gray-100 text-gray-800';
  };

  // Data extraction with safe fallbacks
  const investorName = investor.name || investor.company_name || "Unknown Investor";
  const investorType = investor.type || "Investor";
  const location = investor.location || investor.geos?.[0] || investor.geos?.value?.[0] || "";
  const focusAreas = investor.focus_areas || investor.sectors?.value || investor.sectors || [];
  const stages = investor.stages || investor.stages?.value || [];
  const geos = investor.geos || investor.geos?.value || [];
  const philosophy = investor.philosophy || investor.investment_philosophy?.value || investor.investment_philosophy;
  const antiThesis = investor.anti_thesis || investor.anti_thesis?.value;
  const valueAdd = investor.value_add_proposition || investor.value_add;
  const portfolioHighlights = investor.portfolio_highlights || [];
  const contacts = investor.contacts || [];
  const website = investor.website;
  
  // Financial data
  const aum = investor.aum_usd || 0;
  const avgCheck = investor.avg_check_usd || 
    investor.check_size_usd?.value?.min?.amount || 
    investor.check_size_usd?.min?.amount || 0;
  const maxCheck = investor.check_size_usd?.value?.max?.amount || 
    investor.check_size_usd?.max?.amount || 0;
  const portfolioCount = investor.portfolio_count || portfolioHighlights.length || 0;

  // Helper function to adapt matches for investor view (investor-to-startup direction)
  const adaptInvestorMatches = (rawMatches: any[], startups: any[]) => {
    try {
      return rawMatches
        .filter((match: any) => 
          match.investor_id === id || // Matches where this investor is the target
          (match.direction === 'investor_to_startup' && match.investor_id === id)
        )
        .map((match: any) => {
          const startup = startups.find((s: any) => s.id === match.startup_id);
          const startupName = startup?.company_name || `Startup ${match.startup_id}`;
          const startupSectors = startup?.sectors?.value || startup?.sectors || [];
          
          return {
            id: match.id,
            startup_id: match.startup_id,
            startup_name: startupName,
            sectors: startupSectors,
            score: match.score || 0,
            breakdown: match.breakdown || {},
            rationale: match.rationale || "No rationale provided",
            created_at: match.created_at,
            direction: match.direction
          };
        })
        .sort((a: any, b: any) => (b.score || 0) - (a.score || 0));
    } catch (error) {
      console.error("Error adapting investor matches:", error);
      return [];
    }
  };

  const topMatches = adaptInvestorMatches(ws?.matches || [], ws?.startups || []).slice(0, 5);


  return (
    <div>
      <Seo 
        title={`${investorName} — Investor Profile`} 
        description={`${investorType} focusing on ${focusAreas.join(", ") || "multiple sectors"} in ${geos.join(", ") || "various regions"}.`} 
      />
      <Header />
      <main className="container mx-auto py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <section>
            {/* Enhanced Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg p-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl">
                  {investorName.split(' ').map(word => word[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold tracking-tight">{investorName}</h1>
                    {website && (
                      <a 
                        href={website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                  </div>
                  <p className="text-lg text-muted-foreground mb-3">{investorType} • {location}</p>
                  <div className="flex flex-wrap gap-2">
                    {focusAreas.slice(0, 3).map((area: string, index: number) => (
                      <Badge key={index} className={getSectorColor(area)}>
                        {area}
                      </Badge>
                    ))}
                    {stages.slice(0, 2).map((stage: string, index: number) => (
                      <Badge key={index} variant="outline" className={getStageColor(stage)}>
                        {stage}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Metrics */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">AUM</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatAmount(aum)}</div>
                  <p className="text-xs text-muted-foreground mt-1">Assets Under Management</p>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Check Size</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {avgCheck && maxCheck ? 
                      `${formatAmount(avgCheck)} - ${formatAmount(maxCheck)}` : 
                      formatAmount(avgCheck)
                    }
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Investment Range</p>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Portfolio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{portfolioCount}</div>
                  <p className="text-xs text-muted-foreground mt-1">Companies</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Focus Areas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{focusAreas.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">Sectors</p>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="criteria">Investment Criteria</TabsTrigger>
                <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
                <TabsTrigger value="team">Team</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6 space-y-8">
                {/* Investment Philosophy */}
                {philosophy && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        Investment Philosophy
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ReactMarkdown
                        components={{
                          p: ({ node, ...props }) => (
                            <p className="text-muted-foreground leading-relaxed" {...props} />
                          ),
                        }}
                      >
                        {philosophy}
                      </ReactMarkdown>
                    </CardContent>
                  </Card>
                )}

                {/* Value Add Proposition */}
                {valueAdd && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Value Add Proposition
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                    <ReactMarkdown
                        components={{
                          p: ({ node, ...props }) => (
                            <p className="text-muted-foreground leading-relaxed" {...props} />
                          ),
                        }}
                      >
                        {valueAdd}
                      </ReactMarkdown>
                      {/* <p className="text-muted-foreground leading-relaxed">{valueAdd}</p> */}
                    </CardContent>
                  </Card>
                )}

                {/* Anti-thesis */}
                {antiThesis && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        Anti-thesis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">{antiThesis}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Focus Areas Overview */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Investment Focus</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {focusAreas.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Sectors</h4>
                          <div className="flex flex-wrap gap-2">
                            {focusAreas.map((area: string, index: number) => (
                              <Badge key={index} className={getSectorColor(area)}>
                                {area}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {stages.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Stages</h4>
                          <div className="flex flex-wrap gap-2">
                            {stages.map((stage: string, index: number) => (
                              <Badge key={index} variant="outline" className={getStageColor(stage)}>
                                {stage}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Geographic Focus</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {geos.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {geos.map((geo: string, index: number) => (
                            <Badge key={index} variant="outline" className="border-green-200 text-green-700">
                              {geo}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">Global</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="criteria" className="mt-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Investment Criteria</h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <h4 className="font-semibold text-sm mb-2">Check Size Range</h4>
                        <p className="text-2xl font-bold">
                          {avgCheck && maxCheck ? 
                            `${formatAmount(avgCheck)} - ${formatAmount(maxCheck)}` : 
                            formatAmount(avgCheck)
                          }
                        </p>
                      </div>
                      
                      <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <h4 className="font-semibold text-sm mb-2">Portfolio Size</h4>
                        <p className="text-2xl font-bold">{portfolioCount} companies</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Focus Matrix</h3>
                    <div className="space-y-3">
                      {focusAreas.map((sector: string, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <span className="font-medium">{sector}</span>
                          <Badge className={getSectorColor(sector)}>Active</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="portfolio" className="mt-6 space-y-6">
                {portfolioHighlights.length > 0 ? (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold">Portfolio Highlights</h3>
                      <Badge variant="secondary">{portfolioHighlights.length} companies</Badge>
                    </div>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {portfolioHighlights.map((company: any, index: number) => (
                        <Card key={index} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">
                                  {company.company?.split(' ')[0]?.[0] || 'C'}
                                </span>
                              </div>
                              <div>
                                <h4 className="font-semibold">{company.company}</h4>
                              </div>
                            </div>
                            {company.note && (
                              <ReactMarkdown
                              components={{
                                p: ({ node, ...props }) => (
                                  <p className="text-muted-foreground leading-relaxed" {...props} />
                                ),
                              }}
                            >
                              {company.note}
                            </ReactMarkdown>
                              // <p className="text-sm text-muted-foreground">{company.note}</p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Card className="border-dashed">
                    <CardContent className="p-8 text-center">
                      <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2m-2 0H7m10 0v-2c0-.552-.448-1-1-1s-1 .448-1 1v2m0 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v2c0 .552.448 1 1 1s1-.448 1-1V9" />
                        </svg>
                      </div>
                      <p className="text-muted-foreground">Portfolio information not available</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="team" className="mt-6">
                {contacts.length > 0 ? (
                  <div>
                    <h3 className="text-lg font-semibold mb-6">Team & Contacts</h3>
                    <div className="grid gap-4">
                      {contacts.map((contact: any, index: number) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-semibold">{contact.name}</h4>
                                {contact.role && (
                                  <p className="text-sm text-muted-foreground">{contact.role}</p>
                                )}
                                {contact.email && (
                                  <p className="text-sm text-blue-600">{contact.email}</p>
                                )}
                              </div>
                              {contact.linkedin && (
                                <a 
                                  href={contact.linkedin} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 transition-colors"
                                >
                                  <Badge variant="outline">LinkedIn</Badge>
                                </a>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Card className="border-dashed">
                    <CardContent className="p-8 text-center">
                      <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <p className="text-muted-foreground">Team information not available</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-8">
              <Button variant="default">Request Introduction</Button>
              <Button variant="secondary">Export Profile</Button>
              <Button variant="outline">Add to Pipeline</Button>
            </div>
          </section>

          {/* Enhanced Sidebar */}
          <aside className="lg:sticky lg:top-16 h-fit space-y-6">
            <Sheet>
              <SheetTrigger asChild>
                <Button className="w-full" variant="default" size="lg">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Find Matching Startups
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>Matching Startups</SheetTitle>
                </SheetHeader>
                <div className="mt-4 space-y-3">
                  {topMatches.length > 0 ? topMatches.map((s) => (
                    <Card key={s.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-medium">{s.startup_name}</p>
                            <p className="text-xs text-muted-foreground">{(s.sectors || []).join(", ")}</p>
                          </div>
                          <Badge variant={s.score > 70 ? 'default' : 'secondary'}>
                            {s.score}%
                          </Badge>
                        </div>
                        <Link to={`/startups/${s.startup_id}`}>
                          <Button size="sm" variant="outline" className="w-full">
                            View Details
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  )) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No matching startups found
                    </p>
                  )}
                </div>
              </SheetContent>
            </Sheet>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Send Message
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  Share Profile
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  Add to Favorites
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  );
}
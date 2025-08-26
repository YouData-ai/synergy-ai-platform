import { Seo } from "@/components/Seo";
import { Header } from "@/components/Header";
import { useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useState } from "react";
import { api, postJson } from "@/lib/api";
import type { DeckAnalysis, MarketRunItem, Match, ToughQ, DeckAnalyzeResp, MarketSuggestResp, MarketRunResp, MatchForStartupResp, ToughQAResp, MemoResp, MarketRunItemA } from "@/lib/api-types";
import { toast } from "@/components/ui/use-toast";
import { useWorkspace } from "@/hooks/useWorkspace";

// Import the adapters
import { 
  adaptStartup, 
  adaptDeckAnalysis, 
  adaptMarketAnalyses, 
  adaptToughQuestions,
  adaptMatches,
  safeArray
} from "@/lib/adaptor"; // Adjust path as needed
import UploadPdfButton from "@/components/uploadPdfButton";
import MemoModal from "@/components/memo.viewer";


export default function StartupDetail() {
  const { id } = useParams();
  const { data: ws } = useWorkspace();
  
  const wsStartup = ws?.startups?.find((s) => s.id === id);
  const startup = adaptStartup(wsStartup);
// Initialize with empty arrays first
const [deckAnalyses, setDeckAnalyses] = useState<DeckAnalysis[]>([]);
const [marketSuggested, setMarketSuggested] = useState<string[]>([]);
const [marketRan, setMarketRan] = useState<MarketRunItem[]>([]);
const [matchResults, setMatchResults] = useState<Match[]>([]);
const [toughQs, setToughQs] = useState<ToughQ[]>([]);
const [memo, setMemo] = useState<MemoResp | null>(null);
const [memoOpen, setMemoOpen] = useState(false);
const [loading, setLoading] = useState(false);
const [loadingM, setLoadingM] = useState(false);

// Update state when wsStartup changes
useEffect(() => {
  if (!wsStartup) return;

  try {
    if (wsStartup?.memo) {
      setMemo(wsStartup?.memo as MemoResp);
    }
  } catch (error) {
    console.error("Error initialising memo:", error);
  }

  // Update deck analyses
  try {
    const rawAnalyses = wsStartup.deck_analysis;
    if (Array.isArray(rawAnalyses)) {
      const adaptedAnalyses = rawAnalyses
        .map(adaptDeckAnalysis)
        .filter((item) => item !== null) as DeckAnalysis[];
      setDeckAnalyses(adaptedAnalyses);
    }
  } catch (error) {
    console.error("Error processing deck analyses:", error);
  }

  // Update tough questions
  try {
    const rawQuestions = wsStartup.qa_investor?.tough_questions;
    if (Array.isArray(rawQuestions)) {
      const adaptedQuestions = adaptToughQuestions(rawQuestions);
      setToughQs(adaptedQuestions);
    }
  } catch (error) {
    console.error("Error processing tough questions:", error);
  }

  // Update market suggested
  try {
    const suggested = safeArray<string>(wsStartup.market?.suggested_queries);
    setMarketSuggested(suggested);
  } catch (error) {
    console.error("Error processing market suggested:", error);
  }

  // Update market analyses
  try {
    const rawAnalyses = wsStartup.market?.analyses;
    if (Array.isArray(rawAnalyses)) {
      const adaptedMarket = adaptMarketAnalyses(rawAnalyses);
      setMarketRan(adaptedMarket);
    }
  } catch (error) {
    console.error("Error processing market analyses:", error);
  }

  // Update matches
  try {
    const rawMatches = ws?.matches?.filter((m: any) => m?.startup_id === id);
    if (Array.isArray(rawMatches)) {
      const adaptedMatches = adaptMatches(rawMatches, ws?.investors);
      setMatchResults(adaptedMatches);
    }
  } catch (error) {
    console.error("Error processing matches:", error);
  }
}, [wsStartup, ws, id]); // Dependencies: re-run when these change

// Debug logging
useEffect(() => {
  console.group("Startup Detail Debug");
  console.log("Raw wsStartup:", wsStartup);
  console.log("Adapted startup:", startup);
  console.log("Deck analyses:", deckAnalyses);
  console.log("Market suggested:", marketSuggested);
  console.log("Market ran:", marketRan);
  console.log("Match results:", matchResults);
  console.log("Tough questions:", toughQs);
  console.groupEnd();
}, [wsStartup, startup, deckAnalyses, marketSuggested, marketRan, matchResults, toughQs]);

async function handleViewClick(url) {
  try {
    const data = await api<{url}>(`/api/files/signed-url?gcs=${encodeURIComponent(url)}`);
    if (data.url) {
      window.open(data.url, "_blank", "noopener,noreferrer");
    } else {
      alert("Failed to get signed URL");
    }
  } catch (err) {
    console.error("Error fetching signed URL", err);
    alert("Error fetching signed URL");
  }
}

const regenerateMemo = useCallback(async (): Promise<MemoResp> => {
  const data = await postJson<MemoResp>("/api/memo/from-startup", { startup_id: startup?.id });
  if (!data?.md_url) throw new Error("Memo generation failed");
  setMemo(data);
  return data;
}, [startup?.id]);

const handleMemoButton = useCallback(async () => {
  console.log(memo);
  setLoadingM(true);
  if (memo?.md_url) {
    setMemoOpen(true);
    return;
  }
  // no memo yet → generate, then open
  const newMemo = await regenerateMemo();
  if (newMemo?.md_url) setMemoOpen(true);
  setLoadingM(false);
}, [memo, memo?.md_url, regenerateMemo]);


  const handleRunDeck = useCallback(async () => {
    setLoading(true);
    const operation = 'deck-analysis';
    
    try {
      const response = await 
        postJson<DeckAnalyzeResp>(`/api/deck/suggest`, { startup_id: startup?.id })
      ;
      
      if (response) {
        setDeckAnalyses(prev => [response, ...prev]);
        toast({ 
          description: `Deck analysis completed. Found ${response.improvements.length} improvement areas.`,
        });
        setLoading(false);
      } else {
        console.log(response);
        setLoading(false);
        throw new Error('Analysis failed');
      }
    } catch (error: any) {
      setLoading(false);
      console.error('Deck analysis failed:', error);
      toast({ 
        description: error.message || "Failed to analyze deck. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [startup?.id]);

  const handleSuggest = useCallback(async () => {
    setLoading(true);
    const operation = 'market-suggest';
    
    try {
      const response = await
        postJson(`/api/market/suggest`, { 
          startup_id: startup?.id, 
          n: 4 
        }) as MarketSuggestResp;
      
      if (response) {
        console.log(response);
        const queries = response.queries || [];
        console.log(queries);
        setMarketSuggested(queries);  
        toast({ 
          description: `Generated ${queries.length} market research suggestions.`,
        });
      } else {
        console.log(response);
        throw new Error('Suggestion failed');
      }
    } catch (error: any) {
      console.error('Market suggestion failed:', error);
      toast({ 
        description: error.message || "Failed to generate suggestions. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [startup?.id]);

  const handleRunMarket = useCallback(async (query: string) => {
    setLoading(true);
    const operation = 'market-run-query';
    
    try {
      const response = await 
        postJson<MarketRunItemA>(`/api/market/for-startup/query`, { 
            "query": query,
            "maxResults": 5
        })
      ;
      
      if (response) {
        setMarketRan((prev) => [
          response,  // new results first
          ...prev                // keep old ones below
        ]);
        toast({ 
          description: `Market research completed.`,
        });
      } else {
        throw new Error('Market research failed');
      }
    } catch (error: any) {
      console.error('Market research failed:', error);
      toast({ 
        description: error.message || "Market research failed. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [startup?.id]);

  const handleRunMarketAll = useCallback(async () => {
    setLoading(true);
    const operation = 'market-run';
    
    try {
      const response = await 
        postJson<MarketRunResp>(`/api/market/for-startup`, { 
            "topK": 4,
            "maxResults": 4,
            "startup_id": startup?.id
        })
      ;
      
      if (response.success && response.data) {
        setMarketRan((prev) => [
          ...response.data.analyses,  // new results first
          ...prev                // keep old ones below
        ]);
        toast({ 
          description: `Market research completed. Analyzed ${response.data.analyses.length} areas.`,
        });
      } else {
        throw new Error(response.error?.error || 'Market research failed');
      }
    } catch (error: any) {
      console.error('Market research failed:', error);
      toast({ 
        description: error.message || "Market research failed. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [startup?.id]);

  const handleFindMatches = useCallback(async () => {
    setLoading(true);
    const operation = 'find-matches';
    
    try {
      const response = await 
        postJson<MatchForStartupResp>(`/api/match/for-startup`, { 
          startup_id: startup?.id, 
          topK: 5, 
          with_rationale: true, 
          with_intro: true 
        });
      
      if (response) {
        setMatchResults(adaptMatches(response.matches, ws?.investors));
        const avgScore = response.matches.reduce((acc, m) => acc + m.score, 0) / response.matches.length;
        toast({ 
          description: `Found ${response.matches.length} investor matches (avg score: ${avgScore.toFixed(0)}).`,
        });
      } else {
        throw new Error('Matching failed');
      }
    } catch (error: any) {
      console.error('Investor matching failed:', error);
      toast({ 
        description: error.message || "Failed to find matches. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [startup?.id]);

  const handleGenerateQA = useCallback(async () => {
    setLoading(true);
    const operation = 'generate-qa';
    
    try {
      const response = await postJson<ToughQAResp>(`/api/qa/investor`, {startup_id: startup?.id});
      
      if (response) {
        setToughQs(adaptToughQuestions(response.tough_questions))
        toast({ 
          description: `Generated ${response.tough_questions.length} tough investor questions.`,
        });
      } else {
        throw new Error('Q&A generation failed');
      }
    } catch (error: any) {
      console.error('Q&A generation failed:', error);
      toast({ 
        description: error.message || "Failed to generate questions. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [startup?.id]);

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
            {/* Enhanced Header Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg p-6 mb-8">
              <div className="flex items-start gap-4">
                {startup.logo ? (
                  <img src={startup.logo} alt={`${startup.name} logo`} className="h-16 w-16 rounded-lg shadow-sm" />
                ) : (
                  <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl">
                    {startup.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold tracking-tight">{startup.name}</h1>
                    {startup.website && (
                      <a 
                        href={startup.website} 
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
                  <p className="text-lg text-muted-foreground mb-3">{startup.one_liner}</p>
                  <div className="flex flex-wrap gap-2">
                    {startup.sectors.map((sector, index) => (
                      <Badge key={index} className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                        {sector}
                      </Badge>
                    ))}
                    {startup.geos.map((geo, index) => (
                      <Badge key={index} variant="outline" className="border-green-200 text-green-700">
                        {geo}
                      </Badge>
                    ))}
                    {startup.stage && (
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                        {startup.stage}
                      </Badge>
                    )}
                    {startup.founded_year && (
                      <Badge variant="outline" className="border-gray-300">
                        Founded {startup.founded_year}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Metrics Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-1">
                    <span>ARR</span>
                    <span>{startup.arr_usd}</span>
                    {/* <ProvenanceBadge extracted={startup.arr_usd} label="ARR" /> */}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {typeof startup.arr_usd === 'number' ? `$${(startup.arr_usd/1_000_000).toFixed(2)}M` : "—"}
                  </div>
                  {startup.revenue_currency && startup.revenue_currency !== "USD" && (
                    <p className="text-xs text-muted-foreground mt-1">({startup.revenue_currency})</p>
                  )}
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-1">
                    <span>Growth</span>
                    <span>{startup.growth_pct}</span>
                    {/* <ProvenanceBadge extracted={startup.growth_pct} label="Growth" /> */}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {typeof startup.growth_pct === 'number' ? `${startup.growth_pct}%` : "—"}
                  </div>
                  {typeof startup.growth_pct === 'number' && (
                    <p className="text-xs text-muted-foreground mt-1">YoY Growth</p>
                  )}
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-1">
                    <span>Valuation</span>
                    <span>{startup.valuation_usd}</span>
                    {/* <ProvenanceBadge extracted={} label="Valuation" /> */}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {typeof startup.valuation_usd === 'number' ? `$${(startup.valuation_usd/1_000_000).toFixed(0)}M` : "—"}
                  </div>
                  {typeof startup.valuation_usd === 'number' && (
                    <p className="text-xs text-muted-foreground mt-1">Pre-money</p>
                  )}
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Fundraising</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {startup.raise_amount ? `$${(startup.raise_amount/1000).toFixed(0)}K` : "—"}
                  </div>
                  {startup.raise_amount && (
                    <p className="text-xs text-muted-foreground mt-1">Current Round</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="overview" className="mt-8">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="deck">Deck Analysis</TabsTrigger>
                <TabsTrigger value="research">Market Research</TabsTrigger>
                <TabsTrigger value="matches">Matches</TabsTrigger>
                <TabsTrigger value="investor_prep">Investor Prep</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6 space-y-8">
                {/* Problem & Solution */}
                {(startup.problem || startup.solution) && (
                  <div className="grid md:grid-cols-2 gap-6">
                    {startup.problem && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            Problem
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground leading-relaxed">{startup.problem}</p>
                        </CardContent>
                      </Card>
                    )}
                    {startup.solution && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            Solution
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground leading-relaxed">{startup.solution}</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

                {/* Product Overview */}
                {startup.product_overview && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Product Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">{startup.product_overview}</p>
                    </CardContent>
                  </Card>
                )}

                {/* ICP & GTM */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Ideal Customer Profile</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{startup.icp || "Not specified"}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Go-to-Market Strategy</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{startup.gtm || "Not specified"}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Technology Stack */}
                {(startup.tech_stack || startup.ai_models?.length || startup.data_assets?.length) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        Technology
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {startup.tech_stack && (
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Tech Stack</h4>
                          <p className="text-muted-foreground">{startup.tech_stack}</p>
                        </div>
                      )}
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        {startup.ai_models?.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm mb-2">AI Models</h4>
                            <div className="flex flex-wrap gap-2">
                              {startup.ai_models.map((model, index) => (
                                <Badge key={index} variant="outline" className="bg-blue-50">
                                  {model}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {startup.data_assets?.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm mb-2">Data Assets</h4>
                            <ul className="space-y-1">
                              {startup.data_assets.map((asset, index) => (
                                <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                  {asset}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      
                      {startup.defensibility && (
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Defensibility</h4>
                          <p className="text-muted-foreground">{startup.defensibility}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Team */}
                {startup.founders?.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        Team
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4">
                        {startup.founders.map((founder, index) => (
                          <div key={index} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-semibold">{founder.name}</h4>
                                {founder.role && (
                                  <p className="text-sm text-muted-foreground">{founder.role}</p>
                                )}
                              </div>
                              {founder.linkedin && (
                                <a 
                                  href={founder.linkedin} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 transition-colors"
                                >
                                  <Badge variant="outline" className="text-xs">
                                    LinkedIn
                                  </Badge>
                                </a>
                              )}
                            </div>
                            {founder.past_experience && (
                              <p className="text-sm text-muted-foreground">{founder.past_experience}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Fundraising Details */}
                {(startup.raise_amount || startup.use_of_funds?.length) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        Fundraising
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {startup.raise_amount && (
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Current Round</h4>
                          <p className="text-lg font-bold">
                            ${(startup.raise_amount / 1000).toFixed(0)}K
                            {startup.raise_currency && startup.raise_currency !== "USD" && ` (${startup.raise_currency})`}
                          </p>
                        </div>
                      )}
                      
                      {startup.use_of_funds?.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-sm mb-3">Use of Funds</h4>
                          <div className="space-y-2">
                            {startup.use_of_funds.map((fund, index) => (
                              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded">
                                <div>
                                  <span className="font-medium">{fund.category}</span>
                                  {fund.notes && (
                                    <p className="text-xs text-muted-foreground">{fund.notes}</p>
                                  )}
                                </div>
                                <Badge variant="outline">
                                  ${(fund.amount.amount / 1000).toFixed(0)}K
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="deck" className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button size="sm" className={`w-full ${loading ? "opacity-50 cursor-not-allowed" : ""}`} disabled={loading} onClick={handleRunDeck}>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Run Deck Analysis
                    </Button>
                    <span className="text-xs text-muted-foreground">Appends a new analysis entry</span>
                  </div>
                  {deckAnalyses.length > 0 && (
                    <Badge variant="secondary">{deckAnalyses.length} analyses</Badge>
                  )}
                </div>
                
                {deckAnalyses.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="p-8 text-center">
                      <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <p className="text-sm text-muted-foreground">No analyses yet. Click "Run Deck Analysis" to get started.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {deckAnalyses.map((da) => (
                      <Card key={da.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">Deck Analysis</CardTitle>
                            <Badge variant="outline" className="text-xs">
                              {new Date(da.created_at).toLocaleDateString()}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-sm text-muted-foreground leading-relaxed">{da.summary}</p>
                          
                          {da.strengths?.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold mb-2 text-green-700">Strengths</h4>
                              <ul className="space-y-1">
                                {da.strengths.slice(0, 3).map((strength, i) => (
                                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                                    {strength}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {da.improvements?.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold mb-2 text-orange-700">Top Improvements</h4>
                              <div className="space-y-2">
                                {da.improvements.map((improvement, i) => (
                                  <div key={i} className="p-2 bg-orange-50 dark:bg-orange-950/20 rounded text-xs">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Badge variant="outline">{improvement.severity}</Badge>
                                      <span className="font-medium">Slide {improvement.slide}</span>
                                    </div>
                                    <p className="text-muted-foreground">{improvement.issue}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="research" className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button size="sm" className={`w-full ${loading ? "opacity-50 cursor-not-allowed" : ""}`} disabled={loading} variant="secondary" onClick={handleSuggest}>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      Suggest Queries
                    </Button>
                    <Button size="sm" className={`w-full ${loading ? "opacity-50 cursor-not-allowed" : ""}`} disabled={loading} onClick={handleRunMarketAll}>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Analyse
                    </Button>
                  </div>
                  {marketRan.length > 0 && (
                    <Badge variant="secondary">{marketRan.length} analyses</Badge>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">Suggested Queries lists high-value market questions based on your startup context. Click a query to get an answer with citations, or hit Analyze to run a bulk analysis.</span>
                
                {marketSuggested.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-3">Suggested Research Queries</h4>
                    <div className="flex flex-wrap gap-2">
                      {marketSuggested.map((q, index) => (
                          <Badge onClick={()=> handleRunMarket(q)} key={index} variant="outline" className="text-xs cursor-pointer hover:bg-gray-100">
                            {q}
                          </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {marketRan.length > 0 ? (
                  <div className="space-y-4">
                    {marketRan.map((item, idx) => (
                      <Card key={idx} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">{item.query}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <ul className="space-y-2">
                            {item.summary_bullets.slice(0, 4).map((bullet, i) => (
                              <li key={i} className="text-sm flex items-start gap-2">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                {bullet}
                              </li>
                            ))}
                          </ul>
                          
                          {item.citations.length > 0 && (
                            <div>
                              <h5 className="text-xs font-semibold text-muted-foreground mb-2">Sources</h5>
                              <div className="flex flex-wrap gap-2">
                                {item.citations.slice(0, 3).map((citation, i) => (
                                  <a
                                    key={i}
                                    href={citation.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
                                  >
                                    {citation.title}
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : marketSuggested.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="p-8 text-center">
                      <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <p className="text-sm text-muted-foreground">Start by generating research suggestions</p>
                    </CardContent>
                  </Card>
                ) : null}
              </TabsContent>

              <TabsContent value="matches" className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button size="sm" className={`w-full ${loading ? "opacity-50 cursor-not-allowed" : ""}`} disabled={loading} onClick={handleFindMatches}>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Find Best Matches
                    </Button>
                  </div>
                  {matchResults.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{matchResults.length} matches</Badge>
                      <Badge variant="outline">
                        Avg: {Math.round(matchResults.reduce((acc, m) => acc + m.score, 0) / matchResults.length)}%
                      </Badge>
                    </div>
                  )}
                </div>
                
                {!matchResults.length ? (
                  <Card className="border-dashed">
                    <CardContent className="p-8 text-center">
                      <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <p className="text-sm text-muted-foreground">Find potential investors based on your startup profile</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {matchResults.map((match) => (
                      <Card key={match.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                                match.score >= 80 ? 'bg-green-500' :
                                match.score >= 60 ? 'bg-yellow-500' :
                                match.score >= 40 ? 'bg-orange-500' : 'bg-red-500'
                              }`}>
                                {Math.round(match.score)}
                              </div>
                              <div>
                                <CardTitle className="text-base">
                                  {match.investor_name || `Investor ${match.investor_id}`}
                                </CardTitle>
                                <p className="text-xs text-muted-foreground">
                                  {match.direction === 'startup_to_investor' ? 'Startup → Investor' : 'Investor → Startup'}
                                </p>
                              </div>
                            </div>
                            <Badge variant={match.score >= 70 ? 'default' : 'secondary'}>
                              {Math.round(match.score)}% match
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {match.rationale && (
                            <p className="text-sm text-muted-foreground leading-relaxed">{match.rationale}</p>
                          )}
                          
                          <div>
                            <h5 className="text-xs font-semibold text-muted-foreground mb-2">Match Breakdown</h5>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="flex justify-between text-xs">
                                <span>Sector</span>
                                <span className="font-medium">{(match.breakdown.sector * 100).toFixed(0)}%</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span>Stage</span>
                                <span className="font-medium">{(match.breakdown.stage * 100).toFixed(0)}%</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span>Geography</span>
                                <span className="font-medium">{(match.breakdown.geo * 100).toFixed(0)}%</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span>Check Size</span>
                                <span className="font-medium">{(match.breakdown.check * 100).toFixed(0)}%</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span>Thesis Fit</span>
                                <span className="font-medium">{(match.breakdown.thesis_semantic * 100).toFixed(0)}%</span>
                              </div>
                              {match.breakdown.penalties > 0 && (
                                <div className="flex justify-between text-xs text-red-600">
                                  <span>Penalties</span>
                                  <span className="font-medium">-{(match.breakdown.penalties * 100).toFixed(0)}%</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {match.investor_focus?.length > 0 && (
                            <div>
                              <h5 className="text-xs font-semibold text-muted-foreground mb-2">Focus Areas</h5>
                              <div className="flex flex-wrap gap-1">
                                {match.investor_focus.map((focus, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {focus}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {match.intro && (
                            <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="text-xs font-semibold">Suggested Introduction</h5>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => { 
                                    navigator.clipboard.writeText(match.intro!); 
                                    toast({ description: 'Introduction copied to clipboard' }); 
                                  }}
                                >
                                  Copy
                                </Button>
                              </div>
                              <p className="text-xs text-muted-foreground italic leading-relaxed">
                                {match.intro}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="investor_prep" className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button size="sm" className={`w-full ${loading ? "opacity-50 cursor-not-allowed" : ""}`} disabled={loading} onClick={handleGenerateQA}>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Generate Tough Q&A
                    </Button>
                    <span className="text-xs text-muted-foreground">AI-generated investor questions</span>
                  </div>
                  {toughQs.length > 0 && (
                    <Badge variant="secondary">{toughQs.length} questions</Badge>
                  )}
                </div>
                
                {!toughQs.length ? (
                  <Card className="border-dashed">
                    <CardContent className="p-8 text-center">
                      <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-sm text-muted-foreground">Generate tough questions investors might ask</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {toughQs.map((question, idx) => (
                      <Card key={idx} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-red-600 font-bold text-xs">{idx + 1}</span>
                            </div>
                            <CardTitle className="text-base leading-relaxed">{question.question}</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <h5 className="text-xs font-semibold text-orange-700 mb-1">Why This Matters</h5>
                            <p className="text-xs text-muted-foreground leading-relaxed">{question.why_it_matters}</p>
                          </div>
                          
                          {question.suggested_answer_outline && (
                            <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                              <h5 className="text-xs font-semibold text-blue-700 mb-1">Suggested Answer Outline</h5>
                              <p className="text-xs text-muted-foreground leading-relaxed">{question.suggested_answer_outline}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </section>

          <aside className="lg:sticky lg:top-16 h-fit">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {wsStartup?.memo && wsStartup?.memo?.md_url ?
                  <Button className="w-full" variant="default" size="lg" onClick={handleMemoButton}>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    View Investment Memo
                  </Button>
                  :
                  <Button className="w-full" variant="default" size="lg" onClick={handleMemoButton}>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {loadingM? "Processing..": "Generate Investment Memo"}
                  </Button>
                }
                
                {/* <Button variant="outline" className="w-full" size="lg">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Open Q&A Agent
                </Button> */}
                
                <UploadPdfButton
                  startupId={id}
                  kind="deck"
                  onUploaded={(r) => console.log("Uploaded:", r)}
                />
                
                {/* <Button variant="outline" className="w-full">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  Share Profile
                </Button> */}
              </CardContent>
            </Card>

            {/* Data Room Section */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                  </svg>
                  Data Room
                </CardTitle>
              </CardHeader>
              <CardContent>
                {Array.isArray(wsStartup?.dataroom) && wsStartup.dataroom.length ? (
                  <div className="space-y-3">
                    {wsStartup.dataroom.map((file: any) => (
                      <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium">{file.filename}</p>
                            <p className="text-xs text-muted-foreground">
                              {file.kind?.toUpperCase() || 'FILE'}
                            </p>
                          </div>
                        </div>
                        {file.url && (
                          <Button size="sm" variant="outline" asChild onClick={() => (handleViewClick(file.url))}>
                            <div rel="noopener noreferrer">
                              View
                            </div>
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <p className="text-xs text-muted-foreground">No documents uploaded yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </aside>
          <MemoModal
            open={memoOpen}
            onOpenChange={setMemoOpen}
            memo={memo}
            onRegenerate={regenerateMemo} // optional; remove if you don’t want a regenerate button
          />
        </div>
      </main>
    </div>
  )

  // return (
  //   <div>
  //     <Seo title={`${startup.name} — Startup Profile`} description={`${startup.one_liner}`} />
  //     <Header />
  //     <main className="container mx-auto py-8">
  //       <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
  //         <section>
  //           <div className="flex items-start gap-4">
  //             {startup.logo ? (
  //               <img src={startup.logo} alt={`${startup.name} logo`} className="h-10 w-10 rounded" />
  //             ) : (
  //               <div className="h-10 w-10 rounded bg-secondary" />
  //             )}
  //             <div>
  //               <h1 className="text-2xl font-semibold tracking-tight">{startup.name}</h1>
  //               <p className="text-sm text-muted-foreground">{startup.sectors.join(", ")} • {startup.geos.join(", ")}{startup.stage ? ` • ${startup.stage}` : ""}</p>
  //             </div>
  //           </div>

  //           <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
  //             <Card>
  //               <CardHeader className="pb-2">
  //                 <CardTitle className="text-sm flex items-center gap-1">
  //                   <span>ARR</span>
  //                   <ProvenanceBadge extracted={startup.arr_extracted} label="ARR" />
  //                 </CardTitle>
  //               </CardHeader>
  //               <CardContent className="text-xl font-semibold">{typeof startup.arr_usd === 'number' ? `$${(startup.arr_usd/1_000_000).toFixed(2)}M` : "—"}</CardContent>
  //             </Card>
  //             <Card>
  //               <CardHeader className="pb-2">
  //                 <CardTitle className="text-sm flex items-center gap-1">
  //                   <span>Growth</span>
  //                   <ProvenanceBadge extracted={startup.growth_extracted} label="Growth" />
  //                 </CardTitle>
  //               </CardHeader>
  //               <CardContent className="text-xl font-semibold">{typeof startup.growth_pct === 'number' ? `${startup.growth_pct}%` : "—"}</CardContent>
  //             </Card>
  //             <Card>
  //               <CardHeader className="pb-2">
  //                 <CardTitle className="text-sm flex items-center gap-1">
  //                   <span>Valuation</span>
  //                   <ProvenanceBadge extracted={startup.valuation_extracted} label="Valuation" />
  //                 </CardTitle>
  //               </CardHeader>
  //               <CardContent className="text-xl font-semibold">{typeof startup.valuation_usd === 'number' ? `$${(startup.valuation_usd/1_000_000).toFixed(0)}M` : "—"}</CardContent>
  //             </Card>
  //           </div>

  //           <Tabs defaultValue="overview" className="mt-8">
  //             <TabsList>
  //               <TabsTrigger value="overview">Overview</TabsTrigger>
  //               <TabsTrigger value="deck">Deck Analysis</TabsTrigger>
  //               <TabsTrigger value="research">Market Research</TabsTrigger>
  //               <TabsTrigger value="matches">Matches</TabsTrigger>
  //               <TabsTrigger value="investor_prep">Investor Prep</TabsTrigger>
  //             </TabsList>

  //             <TabsContent value="overview" className="mt-4 space-y-6">
  //               <div>
  //                 <h3 className="text-base font-medium">ICP & GTM</h3>
  //                 <p className="text-sm text-muted-foreground mt-1">{startup.icp || "N/A"} — {startup.gtm || "N/A"}</p>
  //               </div>

  //               {startup.founders && (
  //                 <div>
  //                   <h3 className="text-base font-medium">Team</h3>
  //                   <ul className="mt-2 space-y-1 text-sm">
  //                     {startup.founders.map((f)=> (
  //                       <li key={f.name}>
  //                         {f.name} {f.linkedin && <a className="text-primary underline-offset-4 hover:underline ml-1" href={f.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>}
  //                       </li>
  //                     ))}
  //                   </ul>
  //                 </div>
  //               )}
  //             </TabsContent>

  //             <TabsContent value="deck" className="mt-4 space-y-3">
  //               <div className="flex items-center gap-2">
  //                 <Button size="sm" onClick={handleRunDeck}>Run Deck Analysis</Button>
  //                 <span className="text-xs text-muted-foreground">Appends a new analysis entry</span>
  //               </div>
  //               {deckAnalyses.length === 0 ? (
  //                 <Card><CardContent className="p-4 text-sm text-muted-foreground">No analyses yet. Click "Run Deck Analysis".</CardContent></Card>
  //               ) : (
  //                 <div className="grid gap-3">
  //                   {deckAnalyses.map((da) => (
  //                     <Card key={da.id}>
  //                       <CardHeader className="pb-2">
  //                         <CardTitle className="text-sm">Deck Analysis • {new Date(da.created_at).toLocaleString()}</CardTitle>
  //                       </CardHeader>
  //                       <CardContent className="space-y-2">
  //                         <p className="text-sm">{da.summary}</p>
  //                         {da.strengths?.length ? (
  //                           <div>
  //                             <div className="text-xs font-medium">Strengths</div>
  //                             <ul className="text-xs text-muted-foreground list-disc ml-5 mt-1">
  //                               {da.strengths.slice(0,5).map((s,i)=>(<li key={i}>{s}</li>))}
  //                             </ul>
  //                           </div>
  //                         ) : null}
  //                       </CardContent>
  //                     </Card>
  //                   ))}
  //                 </div>
  //               )}
  //             </TabsContent>

  //             <TabsContent value="research" className="mt-4 space-y-3">
  //               <div className="flex items-center gap-2">
  //                 <Button size="sm" variant="secondary" onClick={handleSuggest}>Suggest Queries</Button>
  //                 <Button size="sm" onClick={handleRunMarket}>Run Top-K</Button>
  //               </div>
  //               {marketSuggested.length ? (
  //                 <div className="flex flex-wrap gap-2">
  //                   {marketSuggested.map((q) => (<Badge key={q} variant="outline">{q}</Badge>))}
  //                 </div>
  //               ) : null}
  //               {marketRan.length ? (
  //                 <div className="space-y-3">
  //                   {marketRan.map((item, idx) => (
  //                     <Card key={idx}>
  //                       <CardHeader className="pb-2">
  //                         <CardTitle className="text-sm">{item.query}</CardTitle>
  //                       </CardHeader>
  //                       <CardContent className="space-y-2">
  //                         <ul className="text-sm list-disc ml-5">
  //                           {item.summary_bullets.slice(0,6).map((b,i)=>(<li key={i}>{b}</li>))}
  //                         </ul>
  //                         <div className="text-xs text-muted-foreground">Citations:{" "}
  //                           {item.citations.map((c,i)=>(
  //                             <a key={i} href={c.url} target="_blank" rel="noreferrer" className="underline underline-offset-4 mr-2">{c.title}</a>
  //                           ))}
  //                         </div>
  //                       </CardContent>
  //                     </Card>
  //                   ))}
  //                 </div>
  //               ) : null}
  //             </TabsContent>

  //             <TabsContent value="matches" className="mt-4 space-y-3">
  //               <div className="flex items-center gap-2">
  //                 <Button size="sm" onClick={handleFindMatches}>Find Best Matches</Button>
  //               </div>
  //               {!matchResults.length ? (
  //                 <Card><CardContent className="p-4 text-sm text-muted-foreground">Run to see ranked investors.</CardContent></Card>
  //               ) : (
  //                 <div className="space-y-3">
  //                   {matchResults.map((m) => (
  //                     <Card key={m.id}>
  //                       <CardHeader className="pb-2">
  //                         <CardTitle className="text-sm flex items-center gap-2">
  //                           <Badge>{Math.round(m.score)}</Badge>
  //                           <span>Investor {m.investor_id}</span>
  //                         </CardTitle>
  //                       </CardHeader>
  //                       <CardContent className="space-y-2">
  //                         {m.matching_reason && <p className="text-sm">{m.matching_reason}</p>}
  //                         <div className="flex flex-wrap gap-2">
  //                           {typeof m.breakdown.sector === 'number' && <Badge variant="outline">Sector {m.breakdown.sector}</Badge>}
  //                           {typeof m.breakdown.stage === 'number' && <Badge variant="outline">Stage {m.breakdown.stage}</Badge>}
  //                           {typeof m.breakdown.geo === 'number' && <Badge variant="outline">Geo {m.breakdown.geo}</Badge>}
  //                           {typeof m.breakdown.check === 'number' && <Badge variant="outline">Check {m.breakdown.check}</Badge>}
  //                           {typeof m.breakdown.thesis_semantic === 'number' && <Badge variant="outline">Thesis {m.breakdown.thesis_semantic}</Badge>}
  //                         </div>
  //                         {m.intro ? (
  //                           <div className="flex items-center gap-2">
  //                             <Button size="sm" variant="secondary" onClick={() => { navigator.clipboard.writeText(m.intro!); toast({ description: 'Intro copied' }); }}>Copy Intro</Button>
  //                             <span className="text-xs text-muted-foreground truncate">{m.intro}</span>
  //                           </div>
  //                         ) : null}
  //                       </CardContent>
  //                     </Card>
  //                   ))}
  //                 </div>
  //               )}
  //             </TabsContent>

  //             <TabsContent value="investor_prep" className="mt-4 space-y-3">
  //               <div className="flex items-center gap-2">
  //                 <Button size="sm" onClick={handleGenerateQA}>Generate Tough Q/A</Button>
  //                 <span className="text-xs text-muted-foreground">10 questions will be generated by backend.</span>
  //               </div>
  //               {!toughQs.length ? (
  //                 <Card><CardContent className="p-4 text-sm text-muted-foreground">Questions will appear after generation and reload.</CardContent></Card>
  //               ) : (
  //                 <div className="space-y-3">
  //                   {toughQs.map((q, idx) => (
  //                     <Card key={idx}>
  //                       <CardHeader className="pb-1">
  //                         <CardTitle className="text-sm">{q.question}</CardTitle>
  //                       </CardHeader>
  //                       <CardContent>
  //                         <p className="text-xs text-muted-foreground">{q.why_it_matters}</p>
  //                         {q.suggested_answer_outline && <p className="text-xs mt-1">{q.suggested_answer_outline}</p>}
  //                       </CardContent>
  //                     </Card>
  //                   ))}
  //                 </div>
  //               )}
  //             </TabsContent>
  //           </Tabs>
  //         </section>

  //         <aside className="lg:sticky lg:top-16 h-fit">
  //           <Sheet>
  //             <SheetTrigger asChild>
  //               <Button className="w-full" variant="hero">Actions & Data Room</Button>
  //             </SheetTrigger>
  //             <SheetContent side="right">
  //               <SheetHeader>
  //                 <SheetTitle>Actions</SheetTitle>
  //               </SheetHeader>
  //               <div className="mt-4 space-y-3">
  //                 <Button variant="premium" className="w-full">Generate Memo</Button>
  //                 <Button variant="secondary" className="w-full">Open Q/A Agent</Button>
  //                 <Button variant="secondary" className="w-full">Upload to Data Room</Button>

  //                 <div className="pt-4">
  //                   <h4 className="text-sm font-medium">Data Room</h4>
  //                   {Array.isArray((wsStartup as any)?.dataroom) && (wsStartup as any).dataroom.length ? (
  //                     <ul className="mt-2 space-y-2">
  //                       {(wsStartup as any).dataroom.map((f: any) => (
  //                         <li key={f.id} className="text-xs">
  //                           <span className="font-medium">{f.kind?.toUpperCase() || 'FILE'}</span>: {f.filename}
  //                           {f.url ? (
  //                             <a href={f.url} target="_blank" rel="noreferrer" className="ml-2 underline text-primary">View</a>
  //                           ) : null}
  //                         </li>
  //                       ))}
  //                     </ul>
  //                   ) : (
  //                     <p className="text-xs text-muted-foreground mt-1">No files uploaded yet.</p>
  //                   )}
  //                 </div>
  //               </div>
  //             </SheetContent>
  //           </Sheet>
  //         </aside>
  //       </div>
  //     </main>
  //   </div>
  // );
}

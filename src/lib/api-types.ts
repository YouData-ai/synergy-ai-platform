// Minimal API types mirroring the backend contract shared in chat
export type ApiError = { error: string };

export type DocumentRef = {
  id: string;
  kind: "deck"|"contract"|"order_form"|"financials"|"screenshot"|"other";
  filename?: string; url?: string; gemini_file_name?: string; gemini_uri?: string;
  pages?: number; uploaded_at: string; state?: "PROCESSING"|"ACTIVE"|"FAILED"; mime_type?: string;
};

export type SlideFinding = {
  slide?: number; category: "Clarity"|"Story"|"Metrics"|"Design"|"Risk"|"Ask";
  severity: "Low"|"Medium"|"High"; issue: string; recommendation: string;
};

export type DeckAnalysis = {
  schema_version: "1.0"; id: string; startup_id: string; document_id: string;
  summary: string; strengths: string[]; improvements: SlideFinding[];
  created_at: string; generator?: { model: string; run_id: string };
};

export type Match = {
  id: string; direction: "startup_to_investor"|"investor_to_startup";
  startup_id: string; investor_id: string; score: number;
  breakdown: { sector?: number; stage?: number; geo?: number; check?: number; thesis_semantic?: number; penalties?: number };
  rationale: string; matching_reason?: string; intro?: string; created_at: string;
};

export type Startup = {
  id: string; company_name: string; website?: string;
  one_liner?: any; stage?: any; sectors?: any; geos?: any; icp?: any; gtm_strategy?: any;
  product_overview?: any; problem?: any; solution?: any;
  fundraising?: any; traction?: any; technology?: any; competition?: any;
  founders?: any; dataroom?: DocumentRef[];
  deck_analysis?: DeckAnalysis[];
  memo?: { latest_id?: string; md_url?: string; json_url?: string; generated_at?: string };
  market?: {
    suggested_queries?: string[];
    analyses?: Array<{ query: string; summary_bullets: string[]; citations: Array<{ title: string; url: string }> }>;
  };
  qa_investor?: { tough_questions?: Array<{ question: string; why_it_matters: string; suggested_answer_outline?: string }> };
  tags?: string[]; notes?: string|null; created_at?: string; updated_at?: string;
};

export type Investor = {
  id: string; name: string; website: string; slug?: string; logo_url?: string;
  investment_philosophy?: any; stages?: any; geos?: any; sectors?: any; check_size_usd?: any;
  value_add_proposition?: any; portfolio_highlights?: any; anti_thesis?: any; avoid_keywords?: any;
  updated_at?: string;
};

export type Workspace = { id: string; name: string; updated_at: string; startups: Startup[]; investors: Investor[]; matches: Match[] };
export type WorkspaceEnvelope = { workspaces: Workspace[] };

export type DeckAnalyzeResp = { ok: true; deck_analysis: DeckAnalysis } | ApiError;
export type MarketSuggestResp = { startup_id: string; suggested_queries: string[] } | ApiError;
export type MarketRunItem = { query: string; summary_bullets: string[]; citations: Array<{ title: string; url: string }> };
export type MarketRunResp = { startup_id: string; ran: MarketRunItem[] } | ApiError;
export type MarketAnalyzeResp = { query: string; results: Array<{ title: string; url: string; snippet?: string }>; summary?: string[] } | ApiError;
export type MatchForStartupResp = { startup_id: string; total: number; matches: Array<Match> } | ApiError;
export type ToughQ = { question: string; why_it_matters: string; suggested_answer_outline?: string };
export type ToughQAResp = { ok: true; count: number } | ApiError;

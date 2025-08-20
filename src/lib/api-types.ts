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
export type MemoResp = {
  latest_id: string;
  md_url: string;
  json_url: string;
  generated_at: string;
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


export type MarketAnalyzeResp = { query: string; results: Array<{ title: string; url: string; snippet?: string }>; summary?: string[] } | ApiError;
export type ToughQ = { question: string; why_it_matters: string; suggested_answer_outline?: string };

// Enhanced type definitions with better structure
export interface DeckAnalysis {
  id: string;
  startup_id: string;
  summary: string;
  strengths: string[];
  improvements: DeckImprovement[];
  missing_sections: string[];
  overall_score?: number;
  created_at: string;
}

export interface DeckImprovement {
  slide: number;
  category: 'Clarity' | 'Metrics' | 'Risk' | 'Design' | 'Story' | 'Ask';
  severity: 'Low' | 'Medium' | 'High';
  issue: string;
  recommendation: string;
  priority_score?: number;
}

export interface MarketAnalysisBrief {
  summary_bullets: string[];
  market_size: {
    estimate: string;
    method?: string;
    year?: number;
  };
  growth: {
    cagr: string;
    drivers: string[];
    forecast_period?: string;
  };
  segments: string[];
  key_players: string[];
  moats_and_barriers: string[];
  risks: string[];
  open_questions: string[];
  citations: Citation[];
}

export interface Citation {
  title: string;
  url: string;
  snippet?: string;
  relevance_score?: number;
}

export interface MarketRunItem {
  query: string;
  summary_bullets: string[];
  citations: Citation[];
  confidence_score?: number;
  last_updated?: string;
}

export interface Match {
  id: string;
  direction: 'startup_to_investor' | 'investor_to_startup';
  startup_id: string;
  investor_id: string;
  score: number;
  breakdown: {
    sector: number;
    stage: number;
    geo: number;
    check: number;
    thesis_semantic: number;
    penalties: number;
  };
  rationale: string;
  intro: string;
  created_at: string;
  investor_name?: string;
  investor_focus?: string[];
}

export interface ToughQuestion {
  question: string;
  why_it_matters: string;
  suggested_answer_outline?: string;
  category?: 'Financial' | 'Market' | 'Product' | 'Competition' | 'Operations';
  difficulty_level?: 'Medium' | 'Hard' | 'Expert';
}

// API Response wrappers with consistent structure
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: {
    timestamp: string;
    request_id?: string;
    processing_time_ms?: number;
  };
}

// Updated response types
export type DeckAnalyzeResp = DeckAnalysis;
export type MarketSuggestResp = {
  queries: string[]; };
export type MarketRunResp = APIResponse<{ startup_id: string; ran: MarketRunItem[] }>;
export type MatchForStartupResp = { startup_id: string; total: number; matches: Match[] };
export type ToughQAResp = { tough_questions: ToughQuestion[] };
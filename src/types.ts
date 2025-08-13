export type ID = string;
export type URLStr = string;
export type ISODate = string;
export type Stage = "Pre-Seed"|"Seed"|"Series A"|"Series B"|"Growth"|"Late";
export type CountryCode = string; // "IN","US",...
export type Money = { currency: "USD" | string; amount: number };
export type MoneyRange = { min?: Money; max?: Money };

export type SourceRef = { kind: "url"|"file"; ref: string; page_from?: number; page_to?: number; snippet?: string };
export type Extracted<T> = { value: T | null; confidence: number; sources: SourceRef[]; human_overridden?: boolean };

export interface DocumentRef {
  id: ID;
  kind: "deck"|"contract"|"order_form"|"financials"|"screenshot"|"other";
  filename?: string;
  url?: URLStr;                             // your public/signed URL if you mirror it
  gemini_file_name?: string;                // "files/abc123"
  gemini_uri?: string;                      // full URL, e.g. https://generativelanguage.googleapis.com/v1beta/files/abc123
  pages?: number;
  uploaded_at: ISODate;
  extracted_from?: SourceRef;
  state?: "PROCESSING"|"ACTIVE"|"FAILED";
  mime_type?: string;
  source?: "UPLOADED"|"GENERATED";
}

export interface KPI { name: string; unit?: string; series?: Array<{ date: ISODate; value: number }> }
export interface CustomerLogo { name: string; url?: URLStr }
export interface TeamMember { name: string; role?: string; linkedin_url?: URLStr; past_experience?: string }

export interface Competitor { name: string; type: "Direct"|"Indirect"|"Substitute"; url?: URLStr; notes?: string }

export interface Investor {
  id: ID;
  name: string;
  website: URLStr;
  slug?: string;
  logo_url?: URLStr;

  investment_philosophy: Extracted<string>;
  stages: Extracted<Stage[]>;
  geos: Extracted<CountryCode[]>;
  sectors: Extracted<string[]>;
  check_size_usd: Extracted<MoneyRange>;
  value_add_proposition: Extracted<string>;
  portfolio_highlights: Extracted<Array<{ company: string; url?: URLStr; note?: string }>>;
  anti_thesis: Extracted<string[]>;
  avoid_keywords?: Extracted<string[]>;
  updated_at: ISODate;
}

export interface Startup {
  id: ID;
  company_name: string;
  website?: URLStr;
  one_liner?: Extracted<string>;
  founded_year?: Extracted<number>;
  hq_location?: Extracted<string>;
  stage?: Extracted<Stage>;
  sectors?: Extracted<string[]>;
  geos?: Extracted<CountryCode[]>;
  gtm_strategy?: Extracted<string>;
  product_overview?: Extracted<string>;
  problem?: Extracted<string>;
  solution?: Extracted<string>;

  fundraising?: Extracted<{
    raise_amount?: Money;
    pre_money?: Money;
    equity_offered_percent?: number;
    use_of_funds?: Array<{ category: string; amount?: Money; notes?: string }>;
  }>;

  traction?: Extracted<{
    users?: number;
    paying_customers?: number;
    revenue?: Money;
    growth_rate_percent?: number;
    retention_rate_percent?: number;
    notable_customers?: CustomerLogo[];
    key_partnerships?: string[];
    kpis?: KPI[];
  }>;

  technology?: Extracted<{
    tech_stack?: string;
    ai_models?: string[];
    data_assets?: string[];
    ip_patents?: string[];
    defensibility?: string;
  }>;

  competition?: Extracted<Competitor[]>;
  founders?: Extracted<TeamMember[]>;
  dataroom?: DocumentRef[];

  memo?: { latest_id?: ID; md_url?: URLStr; json_url?: URLStr; generated_at?: ISODate };
  market?: {
    suggested_queries?: string[];
    analyses?: Array<{ query: string; summary_bullets: string[]; citations: Array<{ title: string; url: string }> }>;
  };
  qa_investor?: { tough_questions?: ToughQuestion[] };
  updated_at: ISODate;
}

export interface ToughQuestion {
  question: string;
  why_it_matters: string;
  suggested_answer_outline?: string;
}

export interface DeckAnalysis {
  schema_version: "1.0";
  id: ID;
  startup_id: ID;
  document_id: ID;
  summary: string;
  strengths: string[];
  improvements: SlideFinding[];
  created_at: ISODate;
  generator?: { model: string; run_id: string };
}
export interface SlideFinding {
  slide?: number;
  category: "Clarity"|"Story"|"Metrics"|"Design"|"Risk"|"Ask";
  severity: "Low"|"Medium"|"High";
  issue: string;
  recommendation: string;
}

export interface Match {
  id: ID;
  direction: "startup_to_investor"|"investor_to_startup";
  startup_id: ID;
  investor_id: ID;
  score: number; // 0-100
  breakdown: { sector?: number; stage?: number; geo?: number; check?: number; thesis_semantic?: number; penalties?: number };
  rationale: string;
  created_at: ISODate;
}

export interface Workspace {
  id: ID; name: string; updated_at: ISODate;
  startups: Startup[]; investors: Investor[]; matches: Match[];
}
export interface AppEnvelope { workspaces: Workspace[] }

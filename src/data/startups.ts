import type { Extracted } from "@/types";

export type StartupProfile = {
  id: string;
  name: string;
  logo?: string;
  sectors: string[];
  geos: string[];
  one_liner: string;
  valuation_usd?: number;
  arr_usd?: number;
  growth_pct?: number;
  team_size?: number;
  raising_usd?: number;
  premoney_usd?: number;
  icp?: string;
  gtm?: string;
  provenance?: { field: string; source: string }[];
  founders?: { name: string; linkedin?: string }[];
  stage?: string;
  match_score?: number;
  // Extracted provenance-enabled fields (optional)
  arr_extracted?: Extracted<number>;
  growth_extracted?: Extracted<number>;
  valuation_extracted?: Extracted<number>;
};

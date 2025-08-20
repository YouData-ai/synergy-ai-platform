import type { Extracted } from "@/types";

export type InvestorProfile = {
  id: string;
  name: string;
  type: "VC" | "PE" | "Angel" | "Angel Network";
  location: string;
  aum_usd: number;
  avg_check_usd: number;
  portfolio_count: number;
  focus_areas: string[];
  stages: string[];
  geos: string[];
  logo?: string;
  philosophy?: string;
  anti_thesis?: string;
  check_min_usd?: number;
  check_max_usd?: number;
  portfolio_highlights?: { name: string; logo?: string }[];
  contacts?: { name: string; role?: string; linkedin?: string }[];
  match_score?: number;
  // Extracted provenance-enabled fields (optional)
  aum_extracted?: Extracted<number>;
  avg_check_extracted?: Extracted<number>;
};
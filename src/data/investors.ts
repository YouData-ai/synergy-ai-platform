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
};

export const investors: InvestorProfile[] = [
  {
    id: "inv-aurora",
    name: "Aurora Ventures",
    type: "VC",
    location: "San Francisco, US",
    aum_usd: 1200000000,
    avg_check_usd: 2500000,
    portfolio_count: 72,
    focus_areas: ["AI", "SaaS", "Infra"],
    stages: ["Seed", "Series A"],
    geos: ["US", "EU"],
    philosophy: "Back category-defining founders in AI-first markets.",
    anti_thesis: "No pure consumer social.",
    check_min_usd: 500000,
    check_max_usd: 5000000,
    portfolio_highlights: [
      { name: "DeepFlow" },
      { name: "GraphMind" },
      { name: "NimbusAI" },
    ],
    contacts: [
      { name: "Jamie Lee", role: "Partner", linkedin: "https://www.linkedin.com/" },
    ],
    match_score: 87,
  },
  {
    id: "inv-banyan",
    name: "Banyan Capital",
    type: "PE",
    location: "Singapore",
    aum_usd: 2500000000,
    avg_check_usd: 10000000,
    portfolio_count: 35,
    focus_areas: ["Fintech", "Logistics"],
    stages: ["Series B", "Growth"],
    geos: ["IN", "SEA"],
    philosophy: "Compounding with durable economics.",
    anti_thesis: "No capex-heavy manufacturing.",
    check_min_usd: 5000000,
    check_max_usd: 25000000,
    portfolio_highlights: [
      { name: "PayKite" },
      { name: "ShipGo" },
    ],
    contacts: [
      { name: "Riya Sharma", role: "MD", linkedin: "https://www.linkedin.com/" },
    ],
    match_score: 74,
  },
  {
    id: "inv-nexus",
    name: "Nexus Angels",
    type: "Angel Network",
    location: "Bengaluru, IN",
    aum_usd: 120000000,
    avg_check_usd: 150000,
    portfolio_count: 140,
    focus_areas: ["Consumer", "Healthtech", "AI"],
    stages: ["Pre-seed", "Seed"],
    geos: ["IN", "US"],
    philosophy: "Hands-on angel collective for early teams.",
    anti_thesis: "No crypto-only projects.",
    check_min_usd: 50000,
    check_max_usd: 500000,
    match_score: 69,
  },
  {
    id: "inv-orbit",
    name: "Orbit Equity",
    type: "VC",
    location: "London, UK",
    aum_usd: 800000000,
    avg_check_usd: 3000000,
    portfolio_count: 55,
    focus_areas: ["Cybersecurity", "DevTools"],
    stages: ["Seed", "Series A"],
    geos: ["EU", "US"],
    match_score: 81,
  },
  {
    id: "inv-harbor",
    name: "Harbor Partners",
    type: "PE",
    location: "New York, US",
    aum_usd: 5200000000,
    avg_check_usd: 20000000,
    portfolio_count: 42,
    focus_areas: ["Vertical SaaS", "FinOps"],
    stages: ["Growth"],
    geos: ["US", "Global"],
    match_score: 65,
  },
];

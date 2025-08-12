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
};

export const startups: StartupProfile[] = [
  {
    id: "st-aperture",
    name: "Aperture Labs",
    sectors: ["AI", "DevTools"],
    geos: ["US"],
    one_liner: "LLM-first monitoring for production AI.",
    arr_usd: 1200000,
    growth_pct: 18,
    valuation_usd: 25000000,
    team_size: 18,
    raising_usd: 4000000,
    premoney_usd: 22000000,
    icp: "Series A AI product teams",
    gtm: "Top-down with open-source hooks",
    founders: [
      { name: "Eric Zhou", linkedin: "https://www.linkedin.com/" },
      { name: "Maya Patel", linkedin: "https://www.linkedin.com/" },
    ],
    stage: "Seed",
    match_score: 86,
  },
  {
    id: "st-voyage",
    name: "Voyage Health",
    sectors: ["Healthtech"],
    geos: ["IN", "US"],
    one_liner: "Chronic care navigation with AI coaches.",
    arr_usd: 3000000,
    growth_pct: 12,
    valuation_usd: 55000000,
    team_size: 42,
    raising_usd: 8000000,
    premoney_usd: 48000000,
    icp: "Payers & large employers",
    gtm: "Enterprise sales with clinical pilots",
    stage: "Series A",
    match_score: 73,
  },
  {
    id: "st-fleetgo",
    name: "FleetGo",
    sectors: ["Logistics", "IoT"],
    geos: ["SEA", "IN"],
    one_liner: "Sensor-driven fleet optimization.",
    arr_usd: 5200000,
    growth_pct: 9,
    valuation_usd: 120000000,
    team_size: 64,
    raising_usd: 15000000,
    premoney_usd: 110000000,
    stage: "Series B",
    match_score: 67,
  },
  {
    id: "st-quant",
    name: "QuantShield",
    sectors: ["Cybersecurity"],
    geos: ["EU", "US"],
    one_liner: "Agentic runtime protection for cloud-native apps.",
    arr_usd: 1800000,
    growth_pct: 22,
    valuation_usd: 30000000,
    team_size: 22,
    raising_usd: 6000000,
    premoney_usd: 27000000,
    stage: "Seed",
    match_score: 79,
  },
];

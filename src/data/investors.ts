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
    aum_extracted: {
      value: 1200000000,
      confidence: 0.9,
      sources: [
        { kind: "file", ref: "Fund Overview.pdf", page_from: 2 },
      ],
    },
    avg_check_extracted: {
      value: 2500000,
      confidence: 0.85,
      sources: [
        { kind: "url", ref: "https://aurora.vc/faq" },
      ],
    },
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
    aum_extracted: {
      value: 2500000000,
      confidence: 0.88,
      sources: [
        { kind: "file", ref: "Banyan Factsheet.pdf", page_from: 1 },
      ],
    },
    avg_check_extracted: {
      value: 10000000,
      confidence: 0.8,
      sources: [
        { kind: "url", ref: "https://banyan.capital/investors" },
      ],
    },
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
    aum_extracted: {
      value: 120000000,
      confidence: 0.6,
      sources: [
        { kind: "url", ref: "https://nexusangels.in/about" },
      ],
    },
    avg_check_extracted: {
      value: 150000,
      confidence: 0.7,
      sources: [
        { kind: "file", ref: "Nexus Overview.pdf", page_from: 3 },
      ],
    },
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
    aum_extracted: {
      value: 800000000,
      confidence: 0.77,
      sources: [
        { kind: "url", ref: "https://orbitequity.co/funds" },
      ],
    },
    avg_check_extracted: {
      value: 3000000,
      confidence: 0.72,
      sources: [
        { kind: "file", ref: "LP Deck.pdf", page_from: 5 },
      ],
    },
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
    aum_extracted: {
      value: 5200000000,
      confidence: 0.83,
      sources: [
        { kind: "file", ref: "Harbor Overview.pdf", page_from: 1 },
      ],
    },
    avg_check_extracted: {
      value: 20000000,
      confidence: 0.8,
      sources: [
        { kind: "url", ref: "https://harborpartners.com/strategy" },
      ],
    },
  },
];


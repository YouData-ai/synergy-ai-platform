export type AgentProfile = {
  id: string;
  name: string;
  status: "active" | "inactive";
  type: "MCP" | "A2A";
  uptime_pct: number;
  performance_score: number;
  last_update: string;
  capabilities: string[];
  last_run_at?: string;
  avg_latency_ms?: number;
  cost_usd?: number;
  input_schema?: string;
  output_schema?: string;
  connected_to?: string[];
  hitl?: boolean;
};

export const agents: AgentProfile[] = [
  {
    id: "ag-matcher",
    name: "Matching Agent",
    status: "active",
    type: "A2A",
    uptime_pct: 99.5,
    performance_score: 91,
    last_update: "2025-08-10T08:45:00Z",
    capabilities: ["Matching", "Scoring", "Explainability"],
    last_run_at: "2025-08-11T12:30:00Z",
    avg_latency_ms: 820,
    cost_usd: 3.21,
    input_schema: "InvestorProfile | StartupProfile",
    output_schema: "MatchResult[]",
    connected_to: ["ag-memo", "ag-research"],
  },
  {
    id: "ag-memo",
    name: "Memo Generator",
    status: "active",
    type: "MCP",
    uptime_pct: 98.8,
    performance_score: 86,
    last_update: "2025-08-09T09:00:00Z",
    capabilities: ["Memo", "Markdown", "Citations"],
    last_run_at: "2025-08-11T10:12:00Z",
    avg_latency_ms: 1460,
    cost_usd: 1.84,
    input_schema: "StartupProfile",
    output_schema: "Markdown",
    connected_to: ["ag-matcher"],
    hitl: true,
  },
  {
    id: "ag-research",
    name: "Market Research",
    status: "inactive",
    type: "MCP",
    uptime_pct: 96.1,
    performance_score: 78,
    last_update: "2025-08-08T17:20:00Z",
    capabilities: ["Research", "Synthesis"],
    last_run_at: "2025-08-07T11:05:00Z",
    avg_latency_ms: 2100,
    cost_usd: 4.75,
    input_schema: "Query",
    output_schema: "Report",
    connected_to: ["ag-matcher", "ag-memo"],
  },
];

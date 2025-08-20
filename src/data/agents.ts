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
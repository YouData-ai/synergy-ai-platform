// types/ui-agents.ts
export type AgentStatus = "active" | "inactive" | "degraded";

export interface AgentCardVM {
  id: string;                       // "matching"
  name: string;                     // "Matching Agent"
  protocol: "MCP"|"A2A"|"HTTP";
  status: AgentStatus;              // pill
  version: string;                  // "2.3.1"
  last_update_iso: string;          // ISO string for "Last update"
  metrics: { uptime_pct: number; perf_score: number; latency_ms: number };
  tags: string[];                   // chips on the card
}

export interface AgentDetailVM {
  id: string;
  description: string;
  capabilities: string[];
  model: { provider: string; name: string };        // e.g., {provider:"Google", name:"gemini-1.5-pro"}
  dependencies: string[];                           // ["tavily","emb","store"]
  io: {
    input_schema: any;                              // JSON schema (render JSON viewer)
    output_schema: any;
  };
  endpoints: {
    run?: { method: "GET"|"POST"; path: string };
    suggest?: { method: "GET"|"POST"; path: string };
    rebuild?: { method: "GET"|"POST"; path: string };
    ad_hoc?: { method: "GET"|"POST"; path: string };
  };
  limits: { rpm?: number; tpm?: number; concurrency?: number };
  sla: { latency_p95_ms?: number; availability_target_pct?: number };
  hitl?: { enabled: boolean; last_human_edits_pct?: number };
  observability: {
    last_runs: Array<{ id: string; status: "ok"|"error"; duration_ms: number; timestamp: string; message?: string }>;
    last_error?: { when: string; message: string } | null;
  };
}

export interface AgentControlsVM {
  id: string;
  actions: {
    run_endpoint?: string;          // POST-able URL
    configure_url?: string;         // route to settings
    monitor_url?: string;           // route to dashboards
    curl_example?: string;          // prebuilt curl to copy
    enable_toggle?: boolean;        // show enable/disable switch
  };
}

export interface GlobalVM {
  meta: { platform: string; env: string; generated_at: string; currency: string };
  usage_summary_24h: {
    calls: number; success_rate_pct: number;
    tokens: { input: number; output: number };
    cost_usd: number;
    top_agents_by_cost: Array<{ id: string; cost_usd: number }>;
  };
}

export interface AgentsUIPayload {
  global: GlobalVM;
  cards: AgentCardVM[];             // grid
  details: Record<string, AgentDetailVM>;  // drawer content by id
  controls: Record<string, AgentControlsVM>;
}
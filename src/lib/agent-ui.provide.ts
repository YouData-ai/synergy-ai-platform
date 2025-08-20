import type { AgentsUIPayload } from "@/lib/ui-agent";
import { AGENTS_UI_DEMO } from "@/data/agent-ui.data";

const LS_KEY = "lvx.agents.ui";

export function loadAgentsUI(): AgentsUIPayload {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return structuredClone(AGENTS_UI_DEMO);
}

export function saveAgentsUI(data: AgentsUIPayload) {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

/** Simulate a “Run” button: append a run log, tweak counters/latency. */
export async function simulateRun(
  data: AgentsUIPayload,
  agentId: string,
  durationMs = 800,
  ok = true
) {
  const now = new Date().toISOString();
  const d = structuredClone(data);

  // bump global usage
  d.global.usage_summary_24h.calls += 1;

  // append run log in details[agentId]
  const detail = d.details[agentId];
  if (detail?.observability?.last_runs) {
    detail.observability.last_runs.unshift({
      id: `${agentId}_${Math.random().toString(36).slice(2, 7)}`,
      status: ok ? "ok" : "error",
      duration_ms: durationMs,
      timestamp: now,
      ...(ok ? {} : { message: "Simulated failure" })
    });
    // keep last 20
    detail.observability.last_runs = detail.observability.last_runs.slice(0, 20);
  }
  // update card latency to make UI feel alive
  const card = d.cards.find(c => c.id === agentId);
  if (card) card.metrics.latency_ms = durationMs;

  saveAgentsUI(d);
  return d;
}

/** Reset to the bundled demo payload. */
export function resetAgentsUI() {
  saveAgentsUI(AGENTS_UI_DEMO as any);
  return loadAgentsUI();
}
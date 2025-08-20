import type { AgentsUIPayload } from "@/lib/ui-agent";

// Paste the rich example payload I gave earlier, or trim it.
// You can tweak numbers to “demo” changes.
export const AGENTS_UI_DEMO: AgentsUIPayload = {
    "global": {
      "meta": { "platform": "LVX AI Platform", "env": "prod", "generated_at": "2025-08-13T08:15:00Z", "currency": "USD" },
      "usage_summary_24h": {
        "calls": 187,
        "success_rate_pct": 97.9,
        "tokens": { "input": 8550000, "output": 3720000 },
        "cost_usd": 43.27,
        "top_agents_by_cost": [
          { "id": "memo", "cost_usd": 18.9 },
          { "id": "matching", "cost_usd": 12.2 },
          { "id": "market", "cost_usd": 7.1 },
          { "id": "deck", "cost_usd": 5.1 }
        ]
      }
    },
    "cards": [
      {
        "id": "matching",
        "name": "Matching Agent",
        "protocol": "A2A",
        "status": "active",
        "version": "2.3.1",
        "last_update_iso": "2025-08-10T00:00:00Z",
        "metrics": { "uptime_pct": 99.5, "perf_score": 91, "latency_ms": 820 },
        "tags": ["Matching","Scoring","Explainability"]
      },
      {
        "id": "memo",
        "name": "Memo Generator",
        "protocol": "MCP",
        "status": "active",
        "version": "1.9.0",
        "last_update_iso": "2025-08-09T00:00:00Z",
        "metrics": { "uptime_pct": 98.8, "perf_score": 86, "latency_ms": 1460 },
        "tags": ["Memo","Markdown","Citations"]
      },
      {
        "id": "market",
        "name": "Market Research",
        "protocol": "MCP",
        "status": "active",
        "version": "1.6.4",
        "last_update_iso": "2025-08-08T00:00:00Z",
        "metrics": { "uptime_pct": 96.1, "perf_score": 78, "latency_ms": 2100 },
        "tags": ["Research","Synthesis"]
      },
      {
        "id": "deck",
        "name": "Deck Analyzer",
        "protocol": "MCP",
        "status": "active",
        "version": "1.4.2",
        "last_update_iso": "2025-08-11T00:00:00Z",
        "metrics": { "uptime_pct": 99.1, "perf_score": 88, "latency_ms": 980 },
        "tags": ["Multimodal","Slide Feedback","Guideline Check"]
      }
    ],
    "details": {
      "matching": {
        "id": "matching",
        "description": "Blends rule-based scoring with Gemini embeddings (text-embedding-004) to rank Startup↔Investor fit; also drafts outreach intros.",
        "capabilities": ["Matching","Scoring","Explainability","Outreach Intro"],
        "model": { "provider": "Google", "name": "text-embedding-004" },
        "dependencies": ["emb","store"],
        "io": {
          "input_schema": {
            "type":"object",
            "properties":{
              "startup_id":{"type":"string"},
              "startup":{"type":"object"},
              "topK":{"type":"number"},
              "with_rationale":{"type":"boolean"},
              "with_intro":{"type":"boolean"}
            },
            "anyOf":[{"required":["startup_id"]},{"required":["startup"]}]
          },
          "output_schema": {
            "type":"object",
            "properties":{
              "startup_id":{"type":"string"},
              "total":{"type":"number"},
              "matches":{"type":"array","items":{"type":"object"}}
            }
          }
        },
        "endpoints": {
          "run": { "method":"POST","path":"/api/match/for-startup" },
          "rebuild": { "method":"POST","path":"/api/match/rebuild" }
        },
        "limits": { "rpm": 60, "tpm": 500000, "concurrency": 6 },
        "sla": { "latency_p95_ms": 1500, "availability_target_pct": 99.0 },
        "hitl": { "enabled": true, "last_human_edits_pct": 7.2 },
        "observability": {
          "last_runs": [
            { "id": "run_9k1", "status": "ok", "duration_ms": 910, "timestamp": "2025-08-13T06:59:00Z" },
            { "id": "run_9k0", "status": "ok", "duration_ms": 835, "timestamp": "2025-08-13T06:58:10Z" }
          ],
          "last_error": null
        }
      },
      "memo": {
        "id": "memo",
        "description": "Generates IC-ready memo (Markdown + JSON scorecard) using startup profile and dataroom citations.",
        "capabilities": ["Memo","Markdown","Citations","JSON Scorecard"],
        "model": { "provider": "Google", "name": "gemini-1.5-pro" },
        "dependencies": ["gemini","store"],
        "io": {
          "input_schema": { "type":"object","properties":{"startup_id":{"type":"string"}},"required":["startup_id"] },
          "output_schema": { "type":"object","properties":{"memo_id":{"type":"string"},"md_url":{"type":"string"},"json_url":{"type":"string"},"generated_at":{"type":"string"}} }
        },
        "endpoints": { "run": { "method":"POST","path":"/api/memo/from-startup" } },
        "limits": { "rpm": 20, "tpm": 300000, "concurrency": 3 },
        "sla": { "latency_p95_ms": 2500, "availability_target_pct": 98.5 },
        "hitl": { "enabled": true, "last_human_edits_pct": 12.1 },
        "observability": {
          "last_runs": [
            { "id":"memo_4a2","status":"ok","duration_ms":1540,"timestamp":"2025-08-13T06:57:00Z" }
          ],
          "last_error": { "when":"2025-08-12T14:11:00Z","message":"Deck source missing; memo added caveats." }
        }
      },
      "market": {
        "id": "market",
        "description": "Suggests topics from startup context, runs Tavily search, summarizes with citations.",
        "capabilities": ["Research","Synthesis","Citations"],
        "model": { "provider":"Google","name":"gemini-1.5-pro" },
        "dependencies": ["tavily","gemini","store"],
        "io": {
          "input_schema": { "type":"object","properties":{"startup_id":{"type":"string"},"queries":{"type":"array","items":{"type":"string"}},"topK":{"type":"number"},"maxResults":{"type":"number"}},"required":["startup_id"] },
          "output_schema": { "type":"object","properties":{"startup_id":{"type":"string"},"ran":{"type":"array","items":{"type":"object"}}} }
        },
        "endpoints": {
          "suggest": { "method":"POST","path":"/api/startups/:id/market/suggest" },
          "run": { "method":"POST","path":"/api/startups/:id/market/run" },
          "ad_hoc": { "method":"POST","path":"/api/market/analyze" }
        },
        "limits": { "rpm": 30, "tpm": 250000, "concurrency": 4 },
        "sla": { "latency_p95_ms": 3000, "availability_target_pct": 97.0 },
        "observability": {
          "last_runs": [
            { "id": "mkt_7p9", "status": "ok", "duration_ms": 2400, "timestamp": "2025-08-13T06:55:00Z" },
            { "id": "mkt_7p8", "status": "error", "duration_ms": 300, "timestamp": "2025-08-13T06:52:00Z", "message": "Tavily quota" }
          ],
          "last_error": { "when": "2025-08-13T06:52:00Z", "message": "Tavily quota" }
        }
      },
      "deck": {
        "id": "deck",
        "description": "Multimodal deck critique vs guidelines; slide-level issues.",
        "capabilities": ["Multimodal","Slide Feedback","Guideline Check"],
        "model": { "provider":"Google","name":"gemini-1.5-pro" },
        "dependencies": ["gemini","store"],
        "io": {
          "input_schema": { "type":"object","properties":{"startup_id":{"type":"string"},"file_uri":{"type":"string"}},"required":["startup_id"] },
          "output_schema": { "type":"object","properties":{"ok":{"type":"boolean"},"deck_analysis":{"type":"object"}} }
        },
        "endpoints": { "run": { "method":"POST","path":"/api/startups/:id/deck/analyze" } },
        "limits": { "rpm": 25, "tpm": 200000, "concurrency": 4 },
        "sla": { "latency_p95_ms": 1800, "availability_target_pct": 99.0 },
        "observability": { "last_runs":[{ "id":"deck_2fd","status":"ok","duration_ms":1010,"timestamp":"2025-08-13T06:50:00Z"}], "last_error": null }
      }
    },
    "controls": {
      "matching": {
        "id": "matching",
        "actions": {
          "run_endpoint": "/api/match/for-startup",
          "configure_url": "/agents/matching/config",
          "monitor_url": "/agents/matching/monitor",
          "enable_toggle": true,
          "curl_example": "curl -s -X POST http://localhost:3001/api/match/for-startup -H 'Content-Type: application/json' -d '{\"startup_id\":\"st2\",\"topK\":5,\"with_rationale\":true,\"with_intro\":true}'"
        }
      },
      "memo": {
        "id": "memo",
        "actions": {
          "run_endpoint": "/api/memo/from-startup",
          "configure_url": "/agents/memo/config",
          "monitor_url": "/agents/memo/monitor",
          "enable_toggle": true,
          "curl_example": "curl -s -X POST http://localhost:3001/api/memo/from-startup -H 'Content-Type: application/json' -d '{\"startup_id\":\"st2\"}'"
        }
      },
      "market": {
        "id": "market",
        "actions": {
          "run_endpoint": "/api/startups/st2/market/run",
          "configure_url": "/agents/market/config",
          "monitor_url": "/agents/market/monitor",
          "enable_toggle": true,
          "curl_example": "curl -s -X POST http://localhost:3001/api/market/analyze -H 'Content-Type: application/json' -d '{\"query\":\"pricing benchmarks for AI co-pilots India\",\"maxResults\":8,\"includeAnswers\":true}'"
        }
      },
      "deck": {
        "id": "deck",
        "actions": {
          "run_endpoint": "/api/startups/st2/deck/analyze",
          "configure_url": "/agents/deck/config",
          "monitor_url": "/agents/deck/monitor",
          "enable_toggle": true,
          "curl_example": "curl -s -X POST http://localhost:3001/api/startups/st2/deck/analyze -H 'Content-Type: application/json' -d '{\"file_uri\":\"https://generativelanguage.googleapis.com/v1beta/files/abc123\"}'"
        }
      }
    }
  } as const;
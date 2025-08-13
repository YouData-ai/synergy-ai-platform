const BASE = "https://2328e41543ab.ngrok-free.app";

function withBase(path: string) {
  if (/^https?:\/\//.test(path)) return path;
  if (path.startsWith("/")) return BASE + path;
  return `${BASE}/${path}`;
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(withBase(path), {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error((j as any)?.error || r.statusText);
  return j as T;
}

// Optional helper for POST JSON
export async function postJson<T>(path: string, body?: unknown): Promise<T> {
  return api<T>(path, { method: "POST", body: JSON.stringify(body ?? {}) });
}

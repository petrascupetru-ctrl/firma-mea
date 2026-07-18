// Minimal Redis-over-REST client compatible with Vercel KV and Upstash Redis.
// Reads connection details from whichever env vars are present.

function conn(): { url: string; token: string } | null {
  const url =
    process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "";
  const token =
    process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "";
  if (!url || !token) return null;
  return { url: url.replace(/\/$/, ""), token };
}

export function kvConfigured(): boolean {
  return conn() !== null;
}

async function cmd<T = unknown>(args: (string | number)[]): Promise<T> {
  const c = conn();
  if (!c) throw new Error("KV not configured");
  const res = await fetch(c.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${c.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`KV error ${res.status}`);
  const data = (await res.json()) as { result: T };
  return data.result;
}

export async function kvSet(key: string, value: unknown): Promise<void> {
  await cmd(["SET", key, JSON.stringify(value)]);
}

export async function kvGet<T = unknown>(key: string): Promise<T | null> {
  const raw = await cmd<string | null>(["GET", key]);
  if (raw == null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function kvDel(key: string): Promise<void> {
  await cmd(["DEL", key]);
}

export async function kvKeys(pattern: string): Promise<string[]> {
  return (await cmd<string[]>(["KEYS", pattern])) || [];
}

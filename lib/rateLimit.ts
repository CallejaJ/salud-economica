// In-memory per-IP rate limit (simple fixed window).
// Serverless instances do not share memory, so this is a first line of defense against
// a single client spending the Claude API budget, not a global limit.

type Entry = { count: number; reset: number };

export const WINDOW_MS = 60_000;
export const MAX_REQUESTS = 10;

const hits = new Map<string, Entry>();

export function rateLimit(ip: string, now: number = Date.now()): { ok: boolean; retryAfter: number } {
  const entry = hits.get(ip);
  if (!entry || now > entry.reset) {
    hits.set(ip, { count: 1, reset: now + WINDOW_MS });
    cleanup(now);
    return { ok: true, retryAfter: 0 };
  }
  if (entry.count >= MAX_REQUESTS) return { ok: false, retryAfter: Math.ceil((entry.reset - now) / 1000) };
  entry.count += 1;
  return { ok: true, retryAfter: 0 };
}

function cleanup(now: number) {
  for (const [key, value] of hits) if (now > value.reset) hits.delete(key);
}

import { MAX_REQUESTS, WINDOW_MS, rateLimit } from "../rateLimit";

test("blocks after the limit and resets after the window", () => {
  const t0 = 1_000_000;
  for (let i = 0; i < MAX_REQUESTS; i++) expect(rateLimit("1.2.3.4", t0).ok).toBe(true);
  const blocked = rateLimit("1.2.3.4", t0 + 1000);
  expect(blocked.ok).toBe(false);
  expect(blocked.retryAfter).toBe(Math.ceil((WINDOW_MS - 1000) / 1000));
  expect(rateLimit("5.6.7.8", t0).ok).toBe(true);
  expect(rateLimit("1.2.3.4", t0 + WINDOW_MS + 1).ok).toBe(true);
});

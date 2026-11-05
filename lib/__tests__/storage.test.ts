import { STORAGE_KEY, loadEntries, saveEntries } from "../storage";

function memory() {
  const data = new Map<string, string>();
  return { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => void data.set(k, v), data };
}

test("round-trips entries", () => {
  const s = memory();
  const entries = [{ id: "a", kind: "income", category: "income", amount: 5, note: "", month: "2026-11", recurring: false, createdAt: 1 }] as const;
  expect(saveEntries([...entries], s)).toBe(true);
  expect(loadEntries(s)).toEqual(entries);
});

test("returns an empty list for missing or corrupt data", () => {
  const s = memory();
  expect(loadEntries(s)).toEqual([]);
  s.data.set(STORAGE_KEY, "{not json");
  expect(loadEntries(s)).toEqual([]);
  expect(loadEntries(undefined)).toEqual([]);
});

test("reports a failed write", () => {
  expect(saveEntries([], { setItem: () => { throw new Error("quota"); } })).toBe(false);
});

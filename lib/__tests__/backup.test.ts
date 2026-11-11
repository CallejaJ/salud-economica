import { backupFileName, cleanEntry, mergeEntries, parseBackup, toBackup } from "../backup";
import type { Entry } from "../finance";

const a: Entry = { id: "a", kind: "income", category: "income", amount: 1450, note: "Nómina", month: "2026-10", recurring: true, every: 1, createdAt: 1 };
const b: Entry = { id: "b", kind: "expense", category: "food", amount: 60.25, note: "MERCADONA", month: "2026-10", date: "2026-10-03", recurring: false, source: "statement", createdAt: 2 };

test("round-trips entries through a backup file", () => {
  const text = JSON.stringify(toBackup([a, b], new Date("2026-11-06T10:00:00Z")));
  expect(JSON.parse(text)).toMatchObject({ app: "salud-economica", version: 1, exportedAt: "2026-11-06T10:00:00.000Z" });
  expect(parseBackup(text)).toEqual([a, b]);
});

test("accepts a bare array of entries", () => {
  expect(parseBackup(JSON.stringify([a]))).toEqual([a]);
});

test("rejects text that is not a backup", () => {
  expect(parseBackup("{not json")).toBeNull();
  expect(parseBackup('{"hello":1}')).toBeNull();
  expect(parseBackup("42")).toBeNull();
  expect(parseBackup("null")).toBeNull();
});

test("skips invalid entries and drops unknown fields", () => {
  const list = parseBackup(JSON.stringify([a, { ...b, amount: -5 }, { ...b, id: "" }, { ...b, month: "2026-13" }, { ...b, category: "cars" }, { ...b, id: "c", extra: "x" }]));
  expect(list).toEqual([a, { ...b, id: "c" }]);
});

test("cleans optional fields", () => {
  const { every: _every, ...noEvery } = a;
  expect(cleanEntry({ ...a, every: 7, until: "bad" })).toEqual(noEvery);
  expect(cleanEntry({ ...b, recurring: false, every: 3, until: "2027-01" })).not.toHaveProperty("every");
  expect(cleanEntry({ ...b, note: 5, createdAt: "x" })).toMatchObject({ note: "", createdAt: 0 });
  expect(cleanEntry({ ...a, kind: "income", category: "food" })?.category).toBe("income");
  expect(cleanEntry({ ...b, categoryByHand: true })).toHaveProperty("categoryByHand", true);
  expect(cleanEntry({ ...b, categoryByHand: "yes" })).not.toHaveProperty("categoryByHand");
  expect(cleanEntry(null)).toBeNull();
});

test("merges only entries that are not saved yet", () => {
  const { entries, added } = mergeEntries([a], [a, b, b]);
  expect(entries).toEqual([a, b]);
  expect(added).toBe(1);
});

test("names the file after the day", () => {
  expect(backupFileName(new Date("2026-11-06T10:00:00Z"))).toBe("salud-economica-2026-11-06.json");
});

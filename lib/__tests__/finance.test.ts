import {
  daysLeft,
  entriesFor,
  parseAmount,
  rankCategories,
  roughAmount,
  shareWord,
  shiftMonth,
  summarize,
  type Entry,
} from "../finance";

const entry = (p: Partial<Entry>): Entry => ({
  id: Math.random().toString(36),
  kind: "expense",
  category: "food",
  amount: 10,
  note: "",
  month: "2026-11",
  recurring: false,
  createdAt: 0,
  ...p,
});

describe("parseAmount", () => {
  test.each([
    ["25", 25],
    ["12,50", 12.5],
    ["1.234,56", 1234.56],
    ["1,234.56", 1234.56],
    ["25 €", 25],
    [" 7.5 ", 7.5],
  ])("%s -> %d", (input, expected) => expect(parseAmount(input)).toBeCloseTo(expected));

  test.each(["", "abc", "12a", "--3"])("rejects %p", (input) => expect(parseAmount(input)).toBeNaN());
});

describe("months", () => {
  test("shiftMonth crosses years", () => {
    expect(shiftMonth("2026-12", 1)).toBe("2027-01");
    expect(shiftMonth("2026-01", -1)).toBe("2025-12");
  });

  test("daysLeft counts today in the current month and the whole month otherwise", () => {
    const today = new Date(2026, 10, 5);
    expect(daysLeft("2026-11", today)).toBe(26);
    expect(daysLeft("2026-12", today)).toBe(31);
  });
});

describe("entriesFor", () => {
  const rent = entry({ category: "home", recurring: true, month: "2026-09", until: "2026-11" });
  const once = entry({ month: "2026-10" });

  test("includes recurring entries inside their range only", () => {
    expect(entriesFor([rent, once], "2026-08")).toEqual([]);
    expect(entriesFor([rent, once], "2026-10")).toEqual([rent, once]);
    expect(entriesFor([rent, once], "2026-11")).toEqual([rent]);
    expect(entriesFor([rent, once], "2026-12")).toEqual([]);
  });

  test("open-ended recurring entries never stop", () => {
    const salary = entry({ kind: "income", category: "income", recurring: true, month: "2026-01" });
    expect(entriesFor([salary], "2030-06")).toEqual([salary]);
  });
});

describe("summarize", () => {
  const salary = entry({ kind: "income", category: "income", amount: 1000 });

  test("empty month", () => expect(summarize([]).verdict).toBe("empty"));

  test("good, tight and short", () => {
    expect(summarize([salary, entry({ amount: 800 })]).verdict).toBe("good");
    expect(summarize([salary, entry({ amount: 950 })]).verdict).toBe("tight");
    expect(summarize([salary, entry({ amount: 1200 })]).verdict).toBe("short");
  });

  test("expenses without income", () => expect(summarize([entry({})]).verdict).toBe("noIncome"));

  test("totals by category", () => {
    const s = summarize([salary, entry({ amount: 300, category: "home" }), entry({ amount: 50 }), entry({ amount: 25 })]);
    expect(s).toMatchObject({ income: 1000, expenses: 375, left: 625, byCategory: { home: 300, food: 75 } });
    expect(rankCategories(s.byCategory)).toEqual(["home", "food"]);
  });
});

describe("friendly numbers", () => {
  test("roughAmount rounds to tens above 100", () => {
    expect(roughAmount(247)).toBe(250);
    expect(roughAmount(-1234)).toBe(1230);
    expect(roughAmount(9.6)).toBe(10);
  });

  test("shareWord", () => {
    expect(shareWord(650, 1450)).toBe("third");
    expect(shareWord(700, 1450)).toBe("half");
    expect(shareWord(280, 1450)).toBe("tenth");
    expect(shareWord(40, 1450)).toBeNull();
    expect(shareWord(10, 0)).toBeNull();
  });
});

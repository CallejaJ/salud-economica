import {
  clearableIn,
  daysLeft,
  entriesFor,
  mergeStatement,
  monthlyShare,
  monthsBetween,
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

describe("frequency", () => {
  test("monthsBetween counts across years", () => {
    expect(monthsBetween("2026-11", "2027-02")).toBe(3);
    expect(monthsBetween("2026-11", "2026-09")).toBe(-2);
  });

  test("quarterly and yearly entries appear only when due", () => {
    const insurance = entry({ recurring: true, every: 3, month: "2026-11" });
    const tax = entry({ recurring: true, every: 12, month: "2026-05" });
    const due = (key: string) => entriesFor([insurance, tax], key).length;
    expect(["2026-11", "2026-12", "2027-01", "2027-02"].map(due)).toEqual([1, 0, 0, 1]);
    expect(due("2027-05")).toBe(2);
    expect(due("2027-06")).toBe(0);
  });

  test("bimonthly entries respect their end month", () => {
    const water = entry({ recurring: true, every: 2, month: "2026-01", until: "2026-05" });
    expect(entriesFor([water], "2026-05")).toEqual([water]);
    expect(entriesFor([water], "2026-07")).toEqual([]);
  });

  test("entries saved without a frequency repeat every month", () => {
    const rent = entry({ recurring: true, month: "2026-01" });
    expect(entriesFor([rent], "2026-04")).toEqual([rent]);
  });

  test("monthlyShare spreads the charge over its months", () => {
    expect(monthlyShare(960, 3)).toBe(320);
    expect(monthlyShare(600, 12)).toBe(50);
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

  test("lists the concepts of other expenses", () => {
    const s = summarize([
      salary,
      entry({ amount: 100, category: "other", note: "comedor" }),
      entry({ amount: 41, category: "other", note: "Comedor " }),
      entry({ amount: 200, category: "other", note: "dentista" }),
      entry({ amount: 30, category: "other", note: "" }),
      entry({ amount: 60, category: "food", note: "mercado" }),
    ]);
    expect(s.byCategory.other).toBe(371);
    expect(s.otherNotes).toEqual([
      { note: "dentista", amount: 200 },
      { note: "comedor", amount: 141 },
    ]);
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

describe("clearableIn", () => {
  it("returns the month's own entries that do not repeat", () => {
    const list = [
      entry({ id: "a" }),
      entry({ id: "b", month: "2026-10" }),
      entry({ id: "c", recurring: true }),
      entry({ id: "d", kind: "income", category: "income" }),
    ];
    expect(clearableIn(list, "2026-11").map((e) => e.id)).toEqual(["a", "d"]);
  });
});

describe("mergeStatement", () => {
  const imported = (p: Partial<Entry>) => entry({ source: "statement", date: "2026-11-03", note: "COMPRA MERCADONA", amount: 60.25, ...p });

  it("updates the category of a transaction imported before instead of adding it again", () => {
    const saved = [imported({ id: "a", category: "other" }), entry({ id: "m", note: "COMPRA MERCADONA", amount: 60.25 })];
    const { entries, added, updated } = mergeStatement(saved, [imported({ id: "new", category: "food", note: "compra mercadona " })]);
    expect({ added, updated }).toEqual({ added: 0, updated: 1 });
    expect(entries).toHaveLength(2);
    expect(entries[0]).toMatchObject({ id: "a", category: "food" });
  });

  it("adds transactions that differ in day, amount or sign", () => {
    const saved = [imported({ id: "a" })];
    const incoming = [
      imported({ id: "b", date: "2026-11-04" }),
      imported({ id: "c", amount: 60.26 }),
      imported({ id: "d", kind: "income", category: "income" }),
    ];
    const { entries, added, updated } = mergeStatement(saved, incoming);
    expect({ added, updated }).toEqual({ added: 3, updated: 0 });
    expect(entries).toHaveLength(4);
  });

  it("matches one to one, so two equal charges on the same day stay two", () => {
    const saved = [imported({ id: "a" })];
    const { entries, added, updated } = mergeStatement(saved, [imported({ id: "b" }), imported({ id: "c" })]);
    expect({ added, updated }).toEqual({ added: 1, updated: 1 });
    expect(entries.map((e) => e.id)).toEqual(["a", "c"]);
  });
});

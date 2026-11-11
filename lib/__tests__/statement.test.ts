import { cleanTransactions, guessCategory, parseLines } from "../statement";

describe("guessCategory", () => {
  test.each([
    ["COMPRA TARJ. MERCADONA MALAGA", "food"],
    ["RECIBO ENDESA ENERGIA", "bills"],
    ["TRANSF. ALQUILER NOVIEMBRE", "home"],
    ["REPSOL ESTACION 123", "transport"],
    ["NETFLIX.COM", "leisure"],
    ["BASIC-FIT SPAIN CUOTA", "sports"],
    ["RECIBO COLEGIO SAN JOSE", "school"],
    ["COMEDOR+AULA MATINAL", "school"],
    ["ADEUDO AULA MATINAL CEIP", "school"],
    ["FLORISTERIA LA ROSA", "gifts"],
    ["BIZUM A PEPE", "other"],
  ])("%s -> %s", (text, cat) => expect(guessCategory(text)).toBe(cat));
});

describe("parseLines", () => {
  test("reads date, movement and balance columns", () => {
    const rows = parseLines(
      [
        "EXTRACTO DE CUENTA NOVIEMBRE",
        "03/11/2026 COMPRA MERCADONA -45,30 1.204,70",
        "05/11 NOMINA EMPRESA SL 1.450,00 2.654,70",
        "Saldo final 2.654,70",
      ],
      2026,
    );
    expect(rows).toEqual([
      { date: "2026-11-03", description: "COMPRA MERCADONA", amount: -45.3, category: "food" },
      { date: "2026-11-05", description: "NOMINA EMPRESA SL", amount: 1450, category: "income" },
    ]);
  });

  test("ignores impossible dates", () => {
    expect(parseLines(["45/13 ALGO -3,00"], 2026)).toEqual([]);
  });
});

describe("cleanTransactions", () => {
  test("drops malformed rows and forces income on positive amounts", () => {
    expect(
      cleanTransactions([
        { date: "2026-11-01", description: "Nómina", amount: 1450, category: "food" },
        { date: "2026-11-02", description: "Lidl", amount: -20, category: "nope" },
        { date: "1/11", description: "bad date", amount: -5, category: "other" },
        { date: "2026-11-03", description: "zero", amount: 0, category: "other" },
      ]),
    ).toEqual([
      { date: "2026-11-01", description: "Nómina", amount: 1450, category: "income" },
      { date: "2026-11-02", description: "Lidl", amount: -20, category: "food" },
    ]);
    expect(cleanTransactions("nope")).toEqual([]);
  });
});

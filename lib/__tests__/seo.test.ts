import { SEO, langAlternates, pageMetadata, structuredData } from "../seo";
import { STRINGS, type Lang } from "../strings";

const LANGS: Lang[] = ["en", "es"];

test.each(LANGS)("%s description is between 140 and 160 characters", (lang) => {
  const n = SEO[lang].description.length;
  expect(n).toBeGreaterThanOrEqual(140);
  expect(n).toBeLessThanOrEqual(160);
});

test("hreflang points English to the root, Spanish to /es and x-default to the root", () => {
  expect(langAlternates()).toEqual({ en: "/", es: "/es", "x-default": "/" });
});

test.each(LANGS)("%s metadata has a self canonical and the other language as alternate locale", (lang) => {
  const m = pageMetadata(lang);
  expect(m.alternates?.canonical).toBe(lang === "en" ? "/" : "/es");
  expect(m.openGraph).toMatchObject({ locale: SEO[lang].locale, alternateLocale: [SEO[lang === "en" ? "es" : "en"].locale] });
});

test.each(LANGS)("%s FAQ in structured data uses the strings the %s page shows", (lang) => {
  const graph = structuredData(lang)["@graph"] as { "@type": string; mainEntity?: { name: string }[] }[];
  const faq = graph.find((n) => n["@type"] === "FAQPage");
  expect(faq?.mainEntity?.[0].name).toBe(STRINGS[lang].help1Title);
});

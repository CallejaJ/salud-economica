import type { Metadata } from "next";
import { STRINGS, type Lang } from "./strings";
import { AUTHOR, GEO, SITE_NAME, SITE_URL, VERSION } from "./site";

/** Path of each language version. English lives at the root and is also the x-default. */
export const LANG_PATH: Record<Lang, string> = { en: "/", es: "/es" };

/** Absolute URL of a language version, written like the canonical link Next.js prints. */
export function langUrl(lang: Lang): string {
  return lang === "en" ? SITE_URL : `${SITE_URL}${LANG_PATH[lang]}`;
}

/** hreflang map shared by the page metadata and the sitemap. */
export function langAlternates(absolute = false): Record<string, string> {
  const at = (l: Lang) => (absolute ? langUrl(l) : LANG_PATH[l]);
  return { en: at("en"), es: at("es"), "x-default": at("en") };
}

// Titles follow `Brand: what it does`; descriptions stay between 140 and 160 characters.
export const SEO: Record<Lang, { title: string; description: string; ogAlt: string; locale: string }> = {
  en: {
    title: "Salud Económica: will your money last the month?",
    description:
      "Free budgeting app for people with dyscalculia. Add income and expenses or upload a bank PDF and get the answer in words and colors. Your data stays with you.",
    ogAlt: "Salud Económica logo",
    locale: "en_US",
  },
  es: {
    title: "Salud Económica: ¿llegas a fin de mes?",
    description:
      "App gratis para saber si llegas a fin de mes, pensada para personas con discalculia. Apunta gastos o sube el PDF del banco: respuesta en palabras y colores.",
    ogAlt: "Logo de Salud Económica",
    locale: "es_ES",
  },
};

// Kept for code that only needs the default (English) copy.
export const SEO_TITLE = SEO.en.title;
export const SEO_DESCRIPTION = SEO.en.description;

const OG_IMAGE = "/og.png?v=3";

/** Next.js metadata for one language version of the page. */
export function pageMetadata(lang: Lang): Metadata {
  const { title, description, ogAlt, locale } = SEO[lang];
  const other: Lang = lang === "en" ? "es" : "en";
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: title, template: `%s | ${SITE_NAME}` },
    description,
    applicationName: SITE_NAME,
    authors: [{ name: AUTHOR.name, url: AUTHOR.url }],
    creator: AUTHOR.name,
    publisher: AUTHOR.name,
    keywords: [
      "personal finance",
      "monthly budget",
      "dyscalculia",
      "make it to the end of the month",
      "bank statement PDF",
      "finanzas personales",
      "llegar a fin de mes",
      "discalculia",
      "presupuesto mensual",
      "control de gastos",
      "Málaga",
    ],
    alternates: { canonical: LANG_PATH[lang], languages: langAlternates() },
    manifest: "/site.webmanifest",
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "48x48" },
        { url: "/favicon.svg", type: "image/svg+xml" },
        { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      ],
      shortcut: "/favicon.ico",
      apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
    },
    openGraph: {
      type: "website",
      url: LANG_PATH[lang],
      siteName: SITE_NAME,
      title,
      description,
      locale,
      alternateLocale: [SEO[other].locale],
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: ogAlt }],
    },
    twitter: { card: "summary_large_image", title, description, images: [OG_IMAGE] },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
    },
    formatDetection: { telephone: false, email: false, address: false },
    category: "finance",
    other: {
      "geo.region": GEO.region,
      "geo.placename": GEO.placename,
      "geo.position": `${GEO.latitude};${GEO.longitude}`,
      ICBM: `${GEO.latitude}, ${GEO.longitude}`,
    },
  };
}

const FAQ_KEYS = [1, 2, 3, 4] as const;
const STEP_KEYS = [1, 2, 3] as const;

const FEATURES: Record<Lang, string[]> = {
  en: [
    "Monthly verdict in words and colors",
    "Rounded amounts and daily allowance",
    "Spending by category with icons",
    "Recurring monthly income and expenses",
    "Bank statement PDF import with review",
    "Data stored only on the device",
    "English and Spanish interface",
  ],
  es: [
    "Veredicto del mes en palabras y colores",
    "Importes redondeados y dinero por día",
    "Gastos por categoría con iconos",
    "Ingresos y gastos que se repiten cada mes",
    "Importación del extracto del banco en PDF con revisión",
    "Datos guardados solo en el dispositivo",
    "Interfaz en español e inglés",
  ],
};

/**
 * Schema.org graph for search engines and generative answer engines, in the language of the page.
 * HowTo and FAQPage are built from the same strings the page shows.
 */
export function structuredData(lang: Lang = "en") {
  const s = STRINGS[lang];
  const url = langUrl(lang);
  const { title, description } = SEO[lang];
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: `${SITE_URL}/`,
        name: SITE_NAME,
        description: SEO.en.description,
        inLanguage: ["en", "es"],
        publisher: { "@id": `${SITE_URL}/#author` },
      },
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: title,
        description,
        inLanguage: lang,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": `${SITE_URL}/#app` },
        primaryImageOfPage: { "@type": "ImageObject", url: `${SITE_URL}/og.png`, width: 1200, height: 630 },
        author: { "@id": `${SITE_URL}/#author` },
      },
      {
        "@type": "Person",
        "@id": `${SITE_URL}/#author`,
        name: AUTHOR.name,
        url: AUTHOR.url,
        jobTitle: "Diseño Web Málaga",
        address: { "@type": "PostalAddress", addressLocality: GEO.placename, addressRegion: "Andalucía", addressCountry: "ES" },
      },
      {
        "@type": "WebApplication",
        "@id": `${SITE_URL}/#app`,
        name: SITE_NAME,
        url,
        description,
        applicationCategory: "FinanceApplication",
        applicationSubCategory: "Personal budgeting",
        operatingSystem: "Any modern web browser",
        browserRequirements: "Requires JavaScript",
        inLanguage: ["en", "es"],
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
        softwareVersion: `${VERSION}-beta`,
        author: { "@id": `${SITE_URL}/#author` },
        areaServed: { "@type": "Country", name: "Spain" },
        accessibilityFeature: ["largePrint", "highContrastDisplay", "readingOrder"],
        featureList: FEATURES[lang],
        screenshot: `${SITE_URL}/og.png`,
      },
      {
        "@type": "HowTo",
        "@id": `${url}#howto`,
        name: s.howTitle,
        description: s.howSub,
        inLanguage: lang,
        step: STEP_KEYS.map((i) => ({
          "@type": "HowToStep",
          position: i,
          name: s[`step${i}Title` as "step1Title"],
          text: s[`step${i}Body` as "step1Body"],
        })),
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        inLanguage: lang,
        mainEntity: FAQ_KEYS.map((i) => ({
          "@type": "Question",
          name: s[`help${i}Title` as "help1Title"],
          acceptedAnswer: { "@type": "Answer", text: s[`help${i}Body` as "help1Body"] },
        })),
      },
    ],
  };
}

/** JSON-LD ready to inline in a script tag, with `<` escaped. */
export function structuredDataJson(lang: Lang): string {
  return JSON.stringify(structuredData(lang)).replace(/</g, "\\u003c");
}

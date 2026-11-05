import { STRINGS } from "./strings";
import { AUTHOR, GEO, SITE_NAME, SITE_URL, VERSION } from "./site";

const en = STRINGS.en;

export const SEO_TITLE = "Salud Económica: will your money last until the end of the month?";
export const SEO_DESCRIPTION =
  "Free personal finance app designed for people with dyscalculia. Write down income and expenses or upload your bank PDF, and get the answer in words and colors. Data stays on your device.";

export const BREADCRUMBS = [
  { name: AUTHOR.name, url: AUTHOR.url },
  { name: SITE_NAME, url: `${SITE_URL}/` },
];

const FAQ_KEYS = [1, 2, 3, 4] as const;

/** Schema.org graph for search engines and generative answer engines. */
export function structuredData() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: `${SITE_URL}/`,
        name: SITE_NAME,
        description: SEO_DESCRIPTION,
        inLanguage: ["en", "es"],
        publisher: { "@id": `${SITE_URL}/#author` },
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
        url: `${SITE_URL}/`,
        description: SEO_DESCRIPTION,
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
        featureList: [
          "Monthly verdict in words and colors",
          "Rounded amounts and daily allowance",
          "Spending by category with icons",
          "Recurring monthly income and expenses",
          "Bank statement PDF import with review",
          "Data stored only on the device",
          "English and Spanish interface",
        ],
        screenshot: `${SITE_URL}/og.png`,
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${SITE_URL}/#breadcrumbs`,
        itemListElement: BREADCRUMBS.map((b, i) => ({ "@type": "ListItem", position: i + 1, name: b.name, item: b.url })),
      },
      {
        "@type": "HowTo",
        "@id": `${SITE_URL}/#howto`,
        name: en.howTitle,
        description: en.howSub,
        step: [1, 2, 3].map((i) => ({
          "@type": "HowToStep",
          position: i,
          name: en[`step${i}Title` as "step1Title"],
          text: en[`step${i}Body` as "step1Body"],
        })),
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE_URL}/#faq`,
        mainEntity: FAQ_KEYS.map((i) => ({
          "@type": "Question",
          name: en[`help${i}Title` as "help1Title"],
          acceptedAnswer: { "@type": "Answer", text: en[`help${i}Body` as "help1Body"] },
        })),
      },
    ],
  };
}

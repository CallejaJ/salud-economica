import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { langAlternates, langUrl } from "@/lib/seo";

export const dynamic = "force-static";

// Both language versions, each listing the other through hreflang alternates.
export default function sitemap(): MetadataRoute.Sitemap {
  const languages = langAlternates(true);
  const lastModified = new Date();
  return [
    { url: langUrl("en"), changeFrequency: "monthly", priority: 1, lastModified, alternates: { languages } },
    { url: langUrl("es"), changeFrequency: "monthly", priority: 1, lastModified, alternates: { languages } },
    { url: `${SITE_URL}/llms.txt`, changeFrequency: "monthly", priority: 0.3 },
  ];
}

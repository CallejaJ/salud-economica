import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

// Lets search engines and AI answer engines crawl the pages and points them to the sitemap.
// The API route only sorts statement text, so it is kept out of crawls.
const AI_CRAWLERS = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "PerplexityBot", "Google-Extended", "Applebot-Extended", "Bingbot"];

export default function robots(): MetadataRoute.Robots {
  const rule = (userAgent: string) => ({ userAgent, allow: "/", disallow: "/api/" });
  return {
    rules: [rule("*"), ...AI_CRAWLERS.map(rule)],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}

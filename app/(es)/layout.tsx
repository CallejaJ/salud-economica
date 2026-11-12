import type { Metadata, Viewport } from "next";
import "../globals.css";
import SiteDocument from "@/components/SiteDocument";
import { pageMetadata } from "@/lib/seo";

// Spanish version at /es, so search engines index the Spanish text with its own URL.
export const metadata: Metadata = pageMetadata("es");

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f172a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <SiteDocument lang="es">{children}</SiteDocument>;
}

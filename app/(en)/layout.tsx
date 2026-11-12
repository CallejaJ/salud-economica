import type { Metadata, Viewport } from "next";
import "../globals.css";
import SiteDocument from "@/components/SiteDocument";
import { pageMetadata } from "@/lib/seo";

// English version at the root, also the x-default for hreflang.
export const metadata: Metadata = pageMetadata("en");

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f172a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <SiteDocument lang="en">{children}</SiteDocument>;
}

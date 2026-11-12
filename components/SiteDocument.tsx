import { LanguageProvider } from "@/lib/i18n";
import { structuredDataJson } from "@/lib/seo";
import type { Lang } from "@/lib/strings";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import MotionProvider from "./MotionProvider";

const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme='dark';}})();`;

/** Shared <html> shell of both language versions; `lang` comes from the URL. */
export default function SiteDocument({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return (
    <html lang={lang} suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredDataJson(lang) }} />
        <LanguageProvider initialLang={lang}>
          <MotionProvider>
            <SiteHeader />
            <main className="wrap">{children}</main>
            <SiteFooter />
          </MotionProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

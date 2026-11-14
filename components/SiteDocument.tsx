import { LanguageProvider } from "@/lib/i18n";
import { structuredDataJson } from "@/lib/seo";
import type { Lang } from "@/lib/strings";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import MotionProvider from "./MotionProvider";
import Diag from "./Diag";

const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme='dark';}})();`;

// On the English root only: a saved Spanish choice opens /es before anything renders.
const langScript = `(function(){try{if(location.pathname==='/'&&localStorage.getItem('lang')==='es'){location.replace('/es'+location.search+location.hash);}}catch(e){}})();`;

// Temporary: sends each load step to /api/diag so a crash on iPhone Safari can be located.
const diagScript = `(function(){try{var id=Math.random().toString(36).slice(2,8),t0=Date.now();window.__diag=function(s){try{navigator.sendBeacon('/api/diag',id+' '+(Date.now()-t0)+'ms '+location.pathname+' '+s)}catch(e){}};window.addEventListener('error',function(e){__diag('error '+(e.message||'')+' @'+(e.filename||'').split('/').pop()+':'+e.lineno)});window.addEventListener('unhandledrejection',function(e){__diag('rejection '+String(e.reason&&e.reason.message||e.reason))});window.addEventListener('load',function(){__diag('load')});document.addEventListener('visibilitychange',function(){__diag('visibility '+document.visibilityState)});window.addEventListener('pagehide',function(){__diag('pagehide')});__diag('start')}catch(e){}})();`;

/** Shared <html> shell of both language versions; `lang` comes from the URL. */
export default function SiteDocument({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return (
    <html lang={lang} suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: diagScript }} />
        {lang === "en" && <script dangerouslySetInnerHTML={{ __html: langScript }} />}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredDataJson(lang) }} />
        <LanguageProvider initialLang={lang}>
          <MotionProvider>
            <SiteHeader />
            <main className="wrap">{children}</main>
            <SiteFooter />
            <Diag />
          </MotionProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

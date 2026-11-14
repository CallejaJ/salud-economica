"use client";

import { createContext, useCallback, useContext } from "react";

import { STRINGS, en, type Key, type Lang } from "./strings";
import { LANG_PATH } from "./seo";

export type { Lang, Key };
type Str = string | ((...args: never[]) => string) | Record<string, string>;

type Dict = typeof en;
type Args<K extends Key> = Dict[K] extends (...a: infer A) => string ? A : [];

interface LangContext {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: <K extends Key>(key: K, ...args: Args<K>) => string;
  dict: Dict;
}

const Ctx = createContext<LangContext | null>(null);

/**
 * The language comes from the URL: `/` is English and `/es` is Spanish. Each one has its own root
 * layout, so switching language loads the other URL instead of rewriting the address in place:
 * rewriting it with `history.replaceState` left the router on a URL from the other root layout,
 * and Safari on iPhone then failed to load the page. A saved Spanish choice on the root is sent to
 * `/es` by the inline script in `SiteDocument` before the page renders.
 */
export function LanguageProvider({ initialLang = "en", children }: { initialLang?: Lang; children: React.ReactNode }) {
  const lang = initialLang;

  const setLang = useCallback(
    (l: Lang) => {
      try {
        localStorage.setItem("lang", l);
      } catch {}
      if (l === lang) return;
      const { search, hash } = window.location;
      window.location.assign(LANG_PATH[l] + search + hash);
    },
    [lang],
  );

  const dict = STRINGS[lang] as Dict;
  const t = useCallback(
    <K extends Key>(key: K, ...args: Args<K>): string => {
      const v = dict[key] as Str;
      return typeof v === "function" ? (v as (...a: unknown[]) => string)(...args) : (v as string);
    },
    [dict],
  );

  return <Ctx.Provider value={{ lang, setLang, t, dict }}>{children}</Ctx.Provider>;
}

export function useLang(): LangContext {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLang must be used inside LanguageProvider");
  return ctx;
}

"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

import { STRINGS, en, type Key, type Lang } from "./strings";
import { LANG_PATH, SEO } from "./seo";

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
 * `initialLang` comes from the URL (`/` is English, `/es` is Spanish). On the root, a saved
 * Spanish choice still wins, as before. The address bar, `<html lang>` and the title follow
 * the language so a shared or reloaded link opens in the language on screen.
 */
export function LanguageProvider({ initialLang = "en", children }: { initialLang?: Lang; children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  useEffect(() => {
    if (initialLang !== "en") return;
    try {
      if (localStorage.getItem("lang") === "es") setLangState("es");
    } catch {}
  }, [initialLang]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = SEO[lang].title;
    const path = LANG_PATH[lang];
    if (window.location.pathname !== path) {
      try {
        window.history.replaceState(window.history.state, "", path + window.location.search + window.location.hash);
      } catch {}
    }
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem("lang", l);
    } catch {}
  }, []);

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

"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

import { STRINGS, en, type Key, type Lang } from "./strings";

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

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      if (localStorage.getItem("lang") === "es") setLangState("es");
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
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

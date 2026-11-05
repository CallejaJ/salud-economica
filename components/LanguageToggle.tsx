"use client";

import { motion } from "motion/react";
import { useLang, type Lang } from "@/lib/i18n";

const LANGS: Lang[] = ["es", "en"];

export default function LanguageToggle() {
  const { lang, setLang, t } = useLang();

  return (
    <div className="lang-toggle" role="group" aria-label={t("language")}>
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          className={`lang-btn${lang === l ? " active" : ""}`}
          data-lang={l}
          aria-pressed={lang === l}
          onClick={() => setLang(l)}
        >
          {lang === l && (
            <motion.span
              layoutId="lang-pill"
              className="lang-pill"
              transition={{ type: "spring", stiffness: 500, damping: 35 }}
            />
          )}
          <span className="lang-text">{l.toUpperCase()}</span>
        </button>
      ))}
    </div>
  );
}

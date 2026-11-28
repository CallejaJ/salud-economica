"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/lib/i18n";

type Font = "plain" | "dyslexic";

/** Switches the interface between the sans-serif default and OpenDyslexic; the choice is kept in localStorage("font"). */
export default function FontToggle() {
  const { t } = useLang();
  const [font, setFont] = useState<Font>("plain");

  useEffect(() => {
    setFont(document.documentElement.dataset.font === "dyslexic" ? "dyslexic" : "plain");
  }, []);

  function toggle() {
    const next: Font = font === "plain" ? "dyslexic" : "plain";
    setFont(next);
    if (next === "dyslexic") document.documentElement.dataset.font = "dyslexic";
    else delete document.documentElement.dataset.font;
    try {
      localStorage.setItem("font", next);
    } catch {}
  }

  const label = font === "plain" ? t("fontDyslexic") : t("fontPlain");

  return (
    <button
      id="font"
      type="button"
      className="theme-toggle font-toggle"
      onClick={toggle}
      aria-label={label}
      aria-pressed={font === "dyslexic"}
      title={label}
    >
      <span aria-hidden="true">Aa</span>
    </button>
  );
}

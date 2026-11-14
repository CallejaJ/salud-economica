"use client";

import { motion } from "motion/react";
import { useLang } from "@/lib/i18n";
import type { Tab } from "./Verdict";

const TABS: { id: Tab; key: "tabMonth" | "tabAdd" | "tabImport" }[] = [
  { id: "month", key: "tabMonth" },
  { id: "add", key: "tabAdd" },
  { id: "import", key: "tabImport" },
];

/** Segmented control that switches between the three views. */
export default function ViewTabs({ tab, onChange }: { tab: Tab; onChange: (tab: Tab) => void }) {
  const { t } = useLang();
  return (
    <div className="seg view-tabs" data-tour="tabs" role="tablist" aria-label={t("tabsLabel")}>
      {TABS.map(({ id, key }) => (
        <button key={id} type="button" role="tab" id={`tab-${id}`} aria-selected={tab === id} className={`seg-card${tab === id ? " active" : ""}`} data-tour={id === "month" ? undefined : id} onClick={() => onChange(id)}>
          {tab === id && <motion.span layoutId="tab-pill" className="seg-pill" transition={{ type: "spring", stiffness: 500, damping: 35 }} />}
          <b>{t(key)}</b>
        </button>
      ))}
    </div>
  );
}

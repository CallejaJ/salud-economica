"use client";

import { useLang } from "@/lib/i18n";
import { monthLabel } from "@/lib/format";
import { ChevronIcon } from "./icons";

export default function MonthNav({ month, onShift }: { month: string; onShift: (delta: number) => void }) {
  const { t, lang } = useLang();
  return (
    <div className="month-nav">
      <button type="button" className="mini month-btn" aria-label={t("monthPrev")} onClick={() => onShift(-1)}>
        <ChevronIcon className="flip" />
      </button>
      <h1 id="month-name" className="section-title" aria-live="polite">
        {monthLabel(month, lang)}
      </h1>
      <button type="button" className="mini month-btn" aria-label={t("monthNext")} onClick={() => onShift(1)}>
        <ChevronIcon />
      </button>
    </div>
  );
}

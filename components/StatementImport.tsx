"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useLang } from "@/lib/i18n";
import { CATEGORIES, type Category } from "@/lib/finance";
import { dayLabel, euros } from "@/lib/format";
import { cleanTransactions, parseLines, type Transaction } from "@/lib/statement";
import DropZone from "./DropZone";
import CategoryBadge from "./CategoryBadge";
import { CATEGORY_NAME } from "./labels";
import { LockIcon, WarnIcon } from "./icons";

type Row = Transaction & { keep: boolean };
type Status = { key: "reading" | "sorting" } | { key: "notPdf" | "openError" | "noText" | "noneFound"; error: true } | null;

const isPdf = (f: File) => f.type === "application/pdf" || /\.pdf$/i.test(f.name);

/** Reads the transactions of a bank PDF and lets the user confirm them before saving. */
export default function StatementImport({ onSave }: { onSave: (rows: Transaction[]) => void }) {
  const { t, lang } = useLang();
  const [status, setStatus] = useState<Status>(null);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [simple, setSimple] = useState(false);
  const busy = status?.key === "reading" || status?.key === "sorting";

  async function read(file: File) {
    setRows(null);
    if (!isPdf(file)) return setStatus({ key: "notPdf", error: true });
    setStatus({ key: "reading" });
    let lines: string[];
    try {
      const { pdfToLines } = await import("@/lib/pdfText");
      lines = await pdfToLines(file);
    } catch (e) {
      console.error(e);
      return setStatus({ key: "openError", error: true });
    }
    if (!lines.length) return setStatus({ key: "noText", error: true });

    setStatus({ key: "sorting" });
    let found: Transaction[] = [];
    let usedFallback = false;
    try {
      const res = await fetch("/api/statement", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lines }) });
      if (res.ok) found = cleanTransactions((await res.json()).transactions);
    } catch (e) {
      console.warn(e);
    }
    if (!found.length) {
      found = parseLines(lines);
      usedFallback = true;
    }
    if (!found.length) return setStatus({ key: "noneFound", error: true });
    setSimple(usedFallback);
    setStatus(null);
    setRows(found.map((x) => ({ ...x, keep: true })));
  }

  function save() {
    const chosen = rows?.filter((r) => r.keep) ?? [];
    if (!chosen.length) return;
    onSave(chosen.map(({ keep: _keep, ...r }) => r));
    setRows(null);
  }

  const update = (i: number, patch: Partial<Row>) => setRows((prev) => prev!.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const incomes = rows?.filter((r) => r.amount > 0).length ?? 0;

  return (
    <div className="grid-2">
      <motion.section
        className="panel"
        aria-labelledby="importTitle"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <h2 id="importTitle">{t("importTitle")}</h2>
        <p className="panel-sub">{t("importSub")}</p>
        <DropZone onFile={read} disabled={busy} />
        <AnimatePresence>
          {status && (
            <motion.p
              id="import-status"
              key={status.key}
              className={`import-status${"error" in status ? " error" : ""}`}
              role={"error" in status ? "alert" : "status"}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {"error" in status ? <WarnIcon /> : <span className="spinner" aria-hidden="true" />}
              {t(status.key)}
            </motion.p>
          )}
        </AnimatePresence>
        <p className="privacy">
          <LockIcon />
          <span>{t("privacy")}</span>
        </p>
      </motion.section>

      {rows && (
        <motion.section
          id="review"
          className="panel review"
          aria-labelledby="reviewTitle"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <h2 id="reviewTitle">{t("reviewTitle", rows.length, incomes, rows.length - incomes)}</h2>
          <p className="panel-sub">{t("reviewSub")}</p>
          {simple && (
            <p className="size-warn">
              <WarnIcon />
              <span>{t("simpleRead")}</span>
            </p>
          )}
          <ul className="entry-list">
            {rows.map((r, i) => (
              <li key={i}>
                <div className={`entry review-row${r.keep ? "" : " off"}`}>
                  <input type="checkbox" checked={r.keep} onChange={(e) => update(i, { keep: e.target.checked })} aria-label={t("reviewKeep", r.description)} />
                  <CategoryBadge category={r.category} size="sm" />
                  <div className="entry-main">
                    <b>{r.description}</b>
                    <span>
                      {dayLabel(r.date, lang)}
                      {r.category !== "income" && (
                        <select value={r.category} aria-label={t("categoryLabel")} onChange={(e) => update(i, { category: e.target.value as Category })}>
                          {CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                              {t(CATEGORY_NAME[c])}
                            </option>
                          ))}
                        </select>
                      )}
                    </span>
                  </div>
                  <b className={`entry-amount${r.amount > 0 ? " in" : ""}`}>
                    {r.amount > 0 ? "+" : "−"}
                    {euros(Math.abs(r.amount), lang)}
                  </b>
                </div>
              </li>
            ))}
          </ul>
          <div className="review-actions">
            <button type="button" id="review-save" className="primary" disabled={!rows.some((r) => r.keep)} onClick={save}>
              {t("saveSelected")}
            </button>
            <button type="button" className="secondary" onClick={() => setRows(null)}>
              {t("cancel")}
            </button>
          </div>
        </motion.section>
      )}
    </div>
  );
}

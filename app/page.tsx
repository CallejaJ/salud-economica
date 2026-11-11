"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useLang } from "@/lib/i18n";
import { clearableIn, entriesFor, mergeStatement, monthKey, newId, shiftMonth, summarize, type Entry } from "@/lib/finance";
import { monthLabel } from "@/lib/format";
import { loadEntries, saveEntries } from "@/lib/storage";
import { mergeEntries } from "@/lib/backup";
import type { Transaction } from "@/lib/statement";
import ViewTabs from "@/components/ViewTabs";
import MonthNav from "@/components/MonthNav";
import Verdict, { type Tab } from "@/components/Verdict";
import MoneyBreakdown from "@/components/MoneyBreakdown";
import EntryList from "@/components/EntryList";
import EntryForm, { type EntryDraft } from "@/components/EntryForm";
import StatementImport from "@/components/StatementImport";
import HowItWorks from "@/components/HowItWorks";
import BackupPanel from "@/components/BackupPanel";

// Shown only while the user has no entries, always labeled as an example.
const EXAMPLE: Omit<Entry, "month">[] = [
  { id: "x1", kind: "income", category: "income", amount: 1450, note: "", recurring: true, createdAt: 0 },
  { id: "x2", kind: "expense", category: "home", amount: 650, note: "", recurring: true, createdAt: 0 },
  { id: "x3", kind: "expense", category: "food", amount: 280, note: "", recurring: false, createdAt: 0 },
  { id: "x4", kind: "expense", category: "bills", amount: 135, note: "", recurring: true, createdAt: 0 },
  { id: "x5", kind: "expense", category: "leisure", amount: 95, note: "", recurring: false, createdAt: 0 },
  { id: "x6", kind: "expense", category: "transport", amount: 40, note: "", recurring: true, createdAt: 0 },
];

export default function Home() {
  const { t, lang } = useLang();
  const [tab, setTab] = useState<Tab>("month");
  const [month, setMonth] = useState(() => monthKey(new Date()));
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setEntries(loadEntries());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(id);
  }, [toast]);

  const commit = useCallback((next: Entry[]) => {
    setEntries(next);
    return saveEntries(next);
  }, []);

  const example = loaded && entries.length === 0;
  const monthEntries = useMemo(
    () => (example ? EXAMPLE.map((e) => ({ ...e, month })) : entriesFor(entries, month)),
    [example, entries, month],
  );
  const summary = useMemo(() => summarize(monthEntries), [monthEntries]);

  function go(next: Tab) {
    setTab(next);
    window.scrollTo({ top: 0 });
  }

  function addEntry(draft: EntryDraft): boolean {
    const ok = commit([...entries, { ...draft, id: newId(), month, source: "manual", createdAt: Date.now() }]);
    if (ok) {
      setToast(t("savedIn", monthLabel(month, lang)));
      go("month");
    }
    return ok;
  }

  function addTransactions(rows: Transaction[]) {
    const now = Date.now();
    const added: Entry[] = rows.map((r) => ({
      id: newId(),
      kind: r.amount > 0 ? "income" : "expense",
      category: r.amount > 0 ? "income" : r.category,
      amount: Math.round(Math.abs(r.amount) * 100) / 100,
      note: r.description.slice(0, 80),
      month: r.date.slice(0, 7),
      date: r.date,
      recurring: false,
      source: "statement",
      createdAt: now,
    }));
    const merged = mergeStatement(entries, added);
    if (commit(merged.entries)) {
      const months = added.map((e) => e.month).sort();
      setMonth(months[months.length - 1]);
      setToast(merged.updated ? t("savedUpdated", merged.added, merged.updated) : t("savedN", merged.added));
      go("month");
    } else setToast(t("saveError"));
  }

  function restore(list: Entry[]) {
    const { entries: next, added } = mergeEntries(entries, list);
    if (added === 0) return setToast(t("backupRestored", 0));
    if (commit(next)) {
      const months = list.map((e) => e.month).sort();
      setMonth(months[months.length - 1]);
      setToast(t("backupRestored", added));
    } else setToast(t("saveError"));
  }

  function remove(id: string) {
    commit(entries.filter((e) => e.id !== id));
    setToast(t("deleted"));
  }

  function clearMonth() {
    const gone = new Set(clearableIn(entries, month).map((e) => e.id));
    if (!gone.size) return;
    if (commit(entries.filter((e) => !gone.has(e.id)))) setToast(t("clearedN", gone.size));
    else setToast(t("saveError"));
  }

  function wipe() {
    if (commit([])) setToast(t("wiped"));
    else setToast(t("saveError"));
  }

  function stopFrom(id: string) {
    const prev = shiftMonth(month, -1);
    const target = entries.find((e) => e.id === id);
    if (!target) return;
    commit(target.month > prev ? entries.filter((e) => e.id !== id) : entries.map((e) => (e.id === id ? { ...e, until: prev } : e)));
    setToast(t("removedFrom", monthLabel(month, lang)));
  }

  return (
    <>
      <div className="toolbar">
        <ViewTabs tab={tab} onChange={go} />
        {tab === "month" && <MonthNav month={month} onShift={(d) => setMonth((m) => shiftMonth(m, d))} />}
      </div>

      {tab === "month" && (
        <div className="grid-3">
          <Verdict summary={summary} month={month} example={example} onGo={go} />
          <MoneyBreakdown summary={summary} />
          <EntryList entries={monthEntries} month={month} readOnly={example} onAdd={() => go("add")} onDelete={remove} onStopFrom={stopFrom} clearable={example ? 0 : clearableIn(entries, month).length} onClear={clearMonth} />
        </div>
      )}
      {tab === "month" && loaded && <BackupPanel entries={entries} onRestore={restore} onNotice={setToast} onWipe={wipe} />}
      {tab === "add" && (
        <div className="narrow">
          <EntryForm onSave={addEntry} />
        </div>
      )}
      {tab === "import" && <StatementImport onSave={addTransactions} />}

      <HowItWorks />

      <AnimatePresence>
        {toast && (
          <motion.div id="toast" className="toast" role="status" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

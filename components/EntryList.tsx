"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { lift } from "./motion";
import { useLang } from "@/lib/i18n";
import { CATEGORIES, type Category, type Entry } from "@/lib/finance";
import { euros, monthLabel } from "@/lib/format";
import CategoryBadge from "./CategoryBadge";
import { CATEGORY_HINT, CATEGORY_NAME } from "./labels";
import { PlusIcon, TrashIcon } from "./icons";

// Value of `confirm` while the "delete all of this month" question is open; entry ids never take it.
const CLEAR = "__month__";
// Entries shown on a phone before "Show all"; the filters appear from this many on.
const SHORT = 5;

type Filter = "all" | "income" | "expense";
const FILTERS: { key: Filter; label: "filterAll" | "filterIncome" | "filterExpense" }[] = [
  { key: "all", label: "filterAll" },
  { key: "income", label: "filterIncome" },
  { key: "expense", label: "filterExpense" },
];

/**
 * Entries of the selected month, income first. Tapping an expense's icon opens an inline category picker;
 * each entry and the whole month have an inline delete confirmation. Only one of these is open at a time.
 * A long list scrolls inside the card (as tall as its row on wide screens) with a fade while more is below,
 * can be filtered to income or expenses, and on a phone shows the first few with a "Show all" button.
 */
export default function EntryList({
  entries,
  month,
  readOnly,
  onAdd,
  onDelete,
  onStopFrom,
  onRecategorize,
  clearable,
  onClear,
}: {
  entries: Entry[];
  month: string;
  readOnly: boolean;
  onAdd: () => void;
  onDelete: (id: string) => void;
  onStopFrom: (id: string) => void;
  onRecategorize: (id: string, category: Category) => void;
  /** Entries written in this month that do not repeat; "delete all of this month" removes them. */
  clearable: number;
  onClear: () => void;
}) {
  const { t, lang } = useLang();
  const [confirm, setConfirm] = useState<string | null>(null);
  const [picking, setPicking] = useState<string | null>(null);
  const ask = (id: string | null) => { setPicking(null); setConfirm(id); };
  const pick = (id: string | null) => { setConfirm(null); setPicking(id); };
  const [filter, setFilter] = useState<Filter>("all");
  const [expanded, setExpanded] = useState(false);
  const [more, setMore] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const sorted = [...entries].sort((a, b) => (a.kind === b.kind ? b.amount - a.amount : a.kind === "income" ? -1 : 1));
  const filterable = sorted.length > SHORT && sorted.some((e) => e.kind === "income") && sorted.some((e) => e.kind === "expense");
  const active = filterable ? filter : "all";
  const shown = active === "all" ? sorted : sorted.filter((e) => e.kind === active);
  const collapsed = !expanded && shown.length > SHORT;

  // A new month starts with the whole list folded and unfiltered
  useEffect(() => { setFilter("all"); setExpanded(false); }, [month]);

  // The fade at the bottom shows only while there is more to scroll to
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const check = () => setMore(el.scrollHeight - el.scrollTop - el.clientHeight > 4);
    check();
    el.addEventListener("scroll", check, { passive: true });
    const ro = new ResizeObserver(check);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    return () => { el.removeEventListener("scroll", check); ro.disconnect(); };
  }, [shown.length]);

  // An opened question or category picker near the bottom scrolls into view once it has unfolded
  const open = picking ?? (confirm !== CLEAR ? confirm : null);
  useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => scroller.current?.querySelector(`[data-id="${open}"]`)?.scrollIntoView({ block: "nearest", behavior: "smooth" }), 220);
    return () => clearTimeout(id);
  }, [open]);

  return (
    <motion.section
      className="panel entries"
      data-tour="entries"
      aria-labelledby="entriesTitle"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={lift}
      transition={{ duration: 0.45, ease: "easeOut", delay: 0.12 }}
    >
      <div className="panel-head">
        <h2 id="entriesTitle">{t("entriesTitle")}</h2>
        <button type="button" className="secondary small" onClick={onAdd}>
          <PlusIcon /> {t("add")}
        </button>
      </div>

      {filterable && (
        <div className="entry-filter" role="group" aria-label={t("entriesShow")}>
          {FILTERS.map((f) => (
            <button key={f.key} type="button" data-filter={f.key} className={active === f.key ? "active" : undefined} aria-pressed={active === f.key} onClick={() => setFilter(f.key)}>
              {t(f.label)}
            </button>
          ))}
        </div>
      )}

      {sorted.length === 0 ? (
        <p className="empty">{t("entriesEmpty", monthLabel(month, lang))}</p>
      ) : shown.length === 0 ? (
        <p className="empty">{t("filterEmpty")}</p>
      ) : (
        <div className="entry-scroll-wrap">
          <div ref={scroller} className={`entry-scroll${more ? " more" : ""}${collapsed ? " collapsed" : ""}`} tabIndex={0} role="region" aria-labelledby="entriesTitle">
            <ul id="entry-list" className="entry-list">
              <AnimatePresence initial={false}>
                {shown.map((e) => {
                  const name = e.note || t(CATEGORY_NAME[e.category]);
                  const editable = !readOnly && e.kind === "expense";
                  return (
                    <motion.li key={e.id} data-id={e.id} className={`entry-card${confirm === e.id ? " confirming" : ""}${picking === e.id ? " picking" : ""}`} layout="position" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 20 }}>
                      <div className="entry">
                        {editable ? (
                          <button
                            type="button"
                            className="cat-change"
                            aria-label={t("changeCategory", name)}
                            title={t("changeCategory", name)}
                            aria-expanded={picking === e.id}
                            onClick={() => pick(picking === e.id ? null : e.id)}
                          >
                            <CategoryBadge category={e.category} size="sm" />
                          </button>
                        ) : (
                          <CategoryBadge category={e.category} size="sm" />
                        )}
                        <div className="entry-main">
                          <b>{name}</b>
                          {(e.note || e.recurring) && (
                            <span>
                              {e.note &&
                                (editable ? (
                                  <button type="button" className="link cat-change-text" aria-expanded={picking === e.id} onClick={() => pick(picking === e.id ? null : e.id)}>
                                    {t(CATEGORY_NAME[e.category])}
                                  </button>
                                ) : (
                                  t(CATEGORY_NAME[e.category])
                                ))}
                              {e.recurring && <span className="pill">{t(`every${e.every ?? 1}`)}</span>}
                            </span>
                          )}
                        </div>
                        <b className={`entry-amount${e.kind === "income" ? " in" : ""}`}>
                          {e.kind === "income" ? "+" : "−"}
                          {euros(e.amount, lang)}
                        </b>
                        {!readOnly && (
                          <button type="button" className="icon" aria-label={t("deleteEntry", name)} onClick={() => ask(confirm === e.id ? null : e.id)}>
                            <TrashIcon />
                          </button>
                        )}
                      </div>
                      <AnimatePresence initial={false}>
                        {picking === e.id && (
                          <motion.div
                            key="pick"
                            className="confirm"
                            role="group"
                            aria-label={t("changeCategoryAsk")}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                          >
                            <div className="confirm-inner recat">
                              <span>{t("changeCategoryAsk")}</span>
                              <div className="cat-pick cat-pick-sm">
                                {CATEGORIES.map((c) => (
                                  <button
                                    key={c}
                                    type="button"
                                    data-cat={c}
                                    className={e.category === c ? "active" : undefined}
                                    aria-pressed={e.category === c}
                                    title={t(CATEGORY_HINT[c])}
                                    onClick={() => { setPicking(null); if (c !== e.category) onRecategorize(e.id, c); }}
                                  >
                                    <CategoryBadge category={c} size="sm" />
                                    <span>{t(CATEGORY_NAME[c])}</span>
                                  </button>
                                ))}
                              </div>
                              <button type="button" className="link" onClick={() => setPicking(null)}>
                                {t("cancel")}
                              </button>
                            </div>
                          </motion.div>
                        )}
                        {confirm === e.id && (
                          <motion.div
                            key="confirm"
                            className="confirm"
                            role="group"
                            aria-label={t("deleteConfirm")}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                          >
                            <div className="confirm-inner">
                              <span>{e.recurring ? t("deleteRecurring") : t("deleteConfirm")}</span>
                              {e.recurring && (
                                <button type="button" className="secondary small" onClick={() => { setConfirm(null); onStopFrom(e.id); }}>
                                  {t("deleteFromNow")}
                                </button>
                              )}
                              <button type="button" className="danger small" onClick={() => { setConfirm(null); onDelete(e.id); }}>
                                {e.recurring ? t("deleteAll") : t("deleteYes")}
                              </button>
                              <button type="button" className="link" onClick={() => setConfirm(null)}>
                                {t("cancel")}
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>
          </div>
        </div>
      )}

      {shown.length > SHORT && (
        <button type="button" id="entries-more" className="secondary small show-all" aria-expanded={expanded} aria-controls="entry-list" onClick={() => setExpanded((x) => !x)}>
          {expanded ? t("showFewer") : t("showAll", shown.length)}
        </button>
      )}

      {!readOnly && clearable > 1 && (
        <div className={`clear-month${confirm === CLEAR ? " confirming" : ""}`}>
          <button
            type="button"
            id="clear-month"
            className="link danger-link"
            aria-expanded={confirm === CLEAR}
            onClick={() => ask(confirm === CLEAR ? null : CLEAR)}
          >
            <TrashIcon /> {t("clearMonth")}
          </button>
          <AnimatePresence initial={false}>
            {confirm === CLEAR && (
              <motion.div
                key="confirm"
                className="confirm"
                role="group"
                aria-label={t("clearMonth")}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <div className="confirm-inner">
                  <span>
                    {t("clearMonthConfirm", clearable, monthLabel(month, lang))}
                    {entries.some((e) => e.recurring) && ` ${t("clearMonthKeeps")}`}
                  </span>
                  <button type="button" id="clear-month-yes" className="danger small" onClick={() => { setConfirm(null); onClear(); }}>
                    {t("clearMonthYes")}
                  </button>
                  <button type="button" className="link" onClick={() => setConfirm(null)}>
                    {t("cancel")}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.section>
  );
}

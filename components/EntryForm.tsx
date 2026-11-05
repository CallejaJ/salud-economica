"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useLang } from "@/lib/i18n";
import { CATEGORIES, EVERY, monthlyShare, parseAmount, roughAmount, type Category, type Every, type Kind } from "@/lib/finance";
import { euros } from "@/lib/format";
import CategoryBadge from "./CategoryBadge";
import { CATEGORY_HINT, CATEGORY_NAME } from "./labels";
import { MinusIcon, PlusIcon } from "./icons";

export interface EntryDraft {
  kind: Kind;
  category: Category | "income";
  amount: number;
  note: string;
  recurring: boolean;
  every?: Every;
}

/** Manual entry: expense or income, a category picked by icon, one amount field and a recurring switch with its frequency. */
export default function EntryForm({ onSave }: { onSave: (draft: EntryDraft) => boolean }) {
  const { t, lang } = useLang();
  const [kind, setKind] = useState<Kind>("expense");
  const [category, setCategory] = useState<Category>("food");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [recurring, setRecurring] = useState(false);
  const [every, setEvery] = useState<Every>(1);
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const n = parseAmount(amount);
    if (!(n > 0)) {
      setError(t("amountError"));
      document.getElementById("amount")?.focus();
      return;
    }
    const ok = onSave({
      kind,
      category: kind === "income" ? "income" : category,
      amount: Math.round(n * 100) / 100,
      note: note.trim().slice(0, 80),
      recurring,
      ...(recurring ? { every } : {}),
    });
    if (ok) {
      setAmount("");
      setNote("");
      setRecurring(false);
      setEvery(1);
      setError(null);
    } else setError(t("saveError"));
  }

  return (
    <motion.section
      className="panel entry-form"
      aria-labelledby="addTitle"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <h2 id="addTitle">{t("addTitle")}</h2>
      <p className="panel-sub">{t("addSub")}</p>

      <form onSubmit={submit} noValidate>
        <div className="kind-pick" role="group" aria-label={t("kindLabel")}>
          {(["expense", "income"] as const).map((k) => (
            <button key={k} type="button" id={`kind-${k}`} className={`big-opt${kind === k ? " active" : ""}`} aria-pressed={kind === k} onClick={() => setKind(k)}>
              <span className="big-opt-icon">{k === "expense" ? <MinusIcon size={18} /> : <PlusIcon size={18} />}</span>
              <span>
                <b>{k === "expense" ? t("kindExpense") : t("kindIncome")}</b>
                <small>{k === "expense" ? t("kindExpenseSub") : t("kindIncomeSub")}</small>
              </span>
            </button>
          ))}
        </div>

        {kind === "expense" && (
          <div className="field">
            <label id="catLabel">{t("whatFor")}</label>
            <div className="cat-pick" role="group" aria-labelledby="catLabel">
              {CATEGORIES.map((c) => (
                <button key={c} type="button" data-cat={c} className={category === c ? "active" : undefined} aria-pressed={category === c} title={t(CATEGORY_HINT[c])} onClick={() => setCategory(c)}>
                  <CategoryBadge category={c} />
                  <span>{t(CATEGORY_NAME[c])}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="field">
          <label htmlFor="amount">{t("howMuch")}</label>
          <div className={`amount-input${error ? " invalid" : ""}`}>
            <input id="amount" inputMode="decimal" autoComplete="off" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} aria-describedby="amountHint" />
            <span aria-hidden="true">€</span>
          </div>
          <small id="amountHint" className={error ? "field-error" : "field-hint"} role={error ? "alert" : undefined}>
            {error ?? t("amountHint")}
          </small>
        </div>

        <div className="field">
          <label htmlFor="note">{t("note")}</label>
          <input id="note" type="text" className="text-input" placeholder={t("notePlaceholder")} autoComplete="off" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>

        <label className="switch">
          <input id="recurring" type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} />
          <span>
            {t("recurring")}
            <small>{t("recurringHint")}</small>
          </span>
        </label>

        {recurring && (
          <div className="field">
            <label id="everyLabel">{t("everyLabel")}</label>
            <div className="every-pick" role="group" aria-labelledby="everyLabel">
              {EVERY.map((n) => (
                <button key={n} type="button" data-every={n} className={every === n ? "active" : undefined} aria-pressed={every === n} onClick={() => setEvery(n)}>
                  {t(`every${n}`)}
                </button>
              ))}
            </div>
            {every > 1 && parseAmount(amount) > 0 && (
              <small id="every-hint" className="field-hint">
                {t("everyHint", every, euros(roughAmount(monthlyShare(parseAmount(amount), every)), lang))}
              </small>
            )}
          </div>
        )}

        <button type="submit" id="save" className="primary wide">
          {t("save")}
        </button>
      </form>
    </motion.section>
  );
}

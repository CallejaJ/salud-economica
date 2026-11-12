"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useLang } from "@/lib/i18n";
import { CheckIcon, ChevronIcon } from "./icons";

const POINTS = [
  ["why1Title", "why1Body"],
  ["why2Title", "why2Body"],
  ["why3Title", "why3Body"],
  ["why4Title", "why4Body"],
  ["why5Title", "why5Body"],
  ["why6Title", "why6Body"],
] as const;

/** Fired on window when the user switches view, so the open note folds away. */
export const VIEW_CHANGE_EVENT = "salud-economica:view-change";

/** Collapsed note under the page legend that explains why the app suits people with dyscalculia. */
export default function WhyItHelps() {
  const { t } = useLang();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener(VIEW_CHANGE_EVENT, close);
    return () => window.removeEventListener(VIEW_CHANGE_EVENT, close);
  }, []);

  return (
    <div className="why">
      <button type="button" id="why-toggle" className="link why-toggle" aria-expanded={open} aria-controls="why-body" onClick={() => setOpen(!open)}>
        <ChevronIcon size={16} className={open ? "why-chevron open" : "why-chevron"} />
        {t("whyTitle")}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="why"
            id="why-body"
            className="why-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <div className="why-card">
              <p className="why-intro">{t("whyIntro")}</p>
              <ul className="why-list">
                {POINTS.map(([title, body]) => (
                  <li key={title}>
                    <span className="why-check" aria-hidden="true">
                      <CheckIcon />
                    </span>
                    <span>
                      <b>{t(title)}</b> {t(body)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

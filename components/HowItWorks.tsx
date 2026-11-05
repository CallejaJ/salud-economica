"use client";

import { motion } from "motion/react";
import { useLang } from "@/lib/i18n";

const STEPS = [
  ["step1Title", "step1Body"],
  ["step2Title", "step2Body"],
  ["step3Title", "step3Body"],
] as const;

const HELP = [
  ["help1Title", "help1Body"],
  ["help2Title", "help2Body"],
  ["help3Title", "help3Body"],
  ["help4Title", "help4Body"],
] as const;

const reveal = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.45, ease: "easeOut" as const } }),
};

export default function HowItWorks() {
  const { t } = useLang();

  return (
    <>
      <section className="how" aria-labelledby="howTitle">
        <motion.h2 id="howTitle" className="section-title" initial="hidden" whileInView="show" viewport={{ once: true }} variants={reveal} custom={0}>
          {t("howTitle")}
        </motion.h2>
        <p className="section-sub">{t("howSub")}</p>
        <div className="steps">
          {STEPS.map(([title, body], i) => (
            <motion.article
              key={title}
              className="step"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-40px" }}
              variants={reveal}
              custom={i}
              whileHover={{ y: -4 }}
            >
              <span className="step-num">{i + 1}</span>
              <h3>{t(title)}</h3>
              <p>{t(body)}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <motion.section
        className="panel help"
        aria-labelledby="helpTitle"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-40px" }}
        variants={reveal}
        custom={0}
      >
        <h2 id="helpTitle">{t("helpTitle")}</h2>
        <p className="panel-sub">{t("helpSub")}</p>
        <div className="help-grid">
          {HELP.map(([title, body]) => (
            <p key={title}>
              <b>{t(title)}</b> <span>{t(body)}</span>
            </p>
          ))}
        </div>
      </motion.section>
    </>
  );
}

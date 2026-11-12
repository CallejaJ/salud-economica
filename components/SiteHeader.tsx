"use client";

import { motion } from "motion/react";
import { useLang } from "@/lib/i18n";
import ThemeToggle from "./ThemeToggle";
import LanguageToggle from "./LanguageToggle";
import WhyItHelps from "./WhyItHelps";
import { BRAND, SITE_NAME } from "@/lib/site";

export default function SiteHeader() {
  const { t } = useLang();

  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <div className="brand-row">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <motion.img
              className="brand-logo"
              src="/images/logo.svg"
              alt={SITE_NAME}
              initial={{ rotate: -8, scale: 0.8, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
            />
            <span className="header-title">
              {BRAND.lead}
              <span className="header-title-accent">{BRAND.accent}</span>
            </span>
            <span className="beta-badge">Beta</span>
          </div>
          <div className="header-actions">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </header>
      <div className="page-intro">
        <motion.p
          className="header-legend"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {t("legend")}
        </motion.p>
        <WhyItHelps />
      </div>
    </>
  );
}

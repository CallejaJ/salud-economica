"use client";

import { useLang } from "@/lib/i18n";
import { AUTHOR, VERSION } from "@/lib/site";

// Shared footer: © year · Diseño Web Málaga · version · beta label.
export default function SiteFooter() {
  const { t } = useLang();

  return (
    <footer className="site-footer">
      <span>
        © {new Date().getFullYear()} ·{" "}
        <a href={AUTHOR.url} target="_blank" rel="noopener noreferrer">
          Diseño Web Málaga
        </a>{" "}
        · v{VERSION} · {t("footerBeta")}
      </span>
    </footer>
  );
}

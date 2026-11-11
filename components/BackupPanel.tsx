"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useLang } from "@/lib/i18n";
import type { Entry } from "@/lib/finance";
import { backupFileName, parseBackup, toBackup } from "@/lib/backup";
import { DownloadIcon, TrashIcon, UploadIcon } from "./icons";

/** Download every entry as a JSON file, or add the entries of a file saved before. Nothing leaves the browser. */
export default function BackupPanel({
  entries,
  onRestore,
  onNotice,
  onWipe,
}: {
  entries: Entry[];
  onRestore: (entries: Entry[]) => void;
  onNotice: (text: string) => void;
  onWipe: () => void;
}) {
  const { t } = useLang();
  const input = useRef<HTMLInputElement>(null);
  const [wiping, setWiping] = useState(false);

  function download() {
    const blob = new Blob([JSON.stringify(toBackup(entries), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = backupFileName();
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
    onNotice(t("backupDone"));
  }

  async function pick(file: File | undefined) {
    if (!file) return;
    const list = parseBackup(await file.text());
    if (list) onRestore(list);
    else onNotice(t("backupInvalid"));
  }

  return (
    <section className="panel backup" aria-labelledby="backupTitle">
      <div className="backup-text">
        <h2 id="backupTitle">{t("backupTitle")}</h2>
        <p className="panel-sub">{t("backupSub")}</p>
      </div>
      <div className="backup-actions">
        <button type="button" id="backup-download" className="secondary small" onClick={download} disabled={entries.length === 0}>
          <DownloadIcon /> {t("backupDownload")}
        </button>
        <button type="button" id="backup-restore" className="secondary small" onClick={() => input.current?.click()}>
          <UploadIcon size={16} /> {t("backupRestore")}
        </button>
        <input
          ref={input}
          id="backup-file"
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(e) => {
            pick(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        <button type="button" id="wipe" className="link danger-link" aria-expanded={wiping} onClick={() => setWiping(!wiping)} disabled={entries.length === 0}>
          <TrashIcon /> {t("wipeAll")}
        </button>
      </div>
      <AnimatePresence initial={false}>
        {wiping && entries.length > 0 && (
          <motion.div
            key="wipe"
            className="confirm wipe-confirm"
            role="group"
            aria-label={t("wipeAll")}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className="confirm-inner">
              <span>{t("wipeConfirm")}</span>
              <button type="button" className="secondary small" onClick={download}>
                <DownloadIcon /> {t("backupDownload")}
              </button>
              <button type="button" id="wipe-yes" className="danger small" onClick={() => { setWiping(false); onWipe(); }}>
                {t("wipeYes")}
              </button>
              <button type="button" className="link" onClick={() => setWiping(false)}>
                {t("cancel")}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

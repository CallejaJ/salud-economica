"use client";

import { useRef } from "react";
import { useLang } from "@/lib/i18n";
import type { Entry } from "@/lib/finance";
import { backupFileName, parseBackup, toBackup } from "@/lib/backup";
import { DownloadIcon, UploadIcon } from "./icons";

/** Download every entry as a JSON file, or add the entries of a file saved before. Nothing leaves the browser. */
export default function BackupPanel({
  entries,
  onRestore,
  onNotice,
}: {
  entries: Entry[];
  onRestore: (entries: Entry[]) => void;
  onNotice: (text: string) => void;
}) {
  const { t } = useLang();
  const input = useRef<HTMLInputElement>(null);

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
      </div>
    </section>
  );
}

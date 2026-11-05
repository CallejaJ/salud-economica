"use client";

import { useRef, useState } from "react";
import { motion } from "motion/react";
import { useLang } from "@/lib/i18n";
import { UploadIcon } from "./icons";

export default function DropZone({ onFile, disabled }: { onFile: (file: File) => void; disabled?: boolean }) {
  const { t } = useLang();
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  return (
    <>
      <motion.div
        id="drop"
        className={over ? "over" : undefined}
        tabIndex={0}
        role="button"
        aria-label={t("dropAria")}
        aria-disabled={disabled}
        onClick={() => !disabled && input.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            input.current?.click();
          }
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!over) setOver(true);
        }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setOver(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          const f = e.dataTransfer.files[0];
          if (f && !disabled) onFile(f);
        }}
        animate={{ scale: over ? 1.015 : 1 }}
        whileHover={{ scale: over ? 1.015 : 1.005 }}
        whileTap={{ scale: 0.99 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
      >
        <motion.span
          className="drop-icon"
          animate={over ? { y: [0, -6, 0] } : { y: 0 }}
          transition={over ? { duration: 0.9, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 }}
        >
          <UploadIcon />
        </motion.span>
        <strong>{over ? t("dropActive") : t("dropTitle")}</strong>
        <span>{t("dropSub")}</span>
      </motion.div>
      <input
        ref={input}
        id="statement-file"
        type="file"
        accept="application/pdf,.pdf"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
      />
    </>
  );
}

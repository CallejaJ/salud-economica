// Backup file: every entry as JSON, so the user can keep a copy or move it to another device.
// Framework-free; the download and file picking live in components/BackupPanel.tsx.
import { CATEGORIES, EVERY, type Entry } from "./finance";

export const BACKUP_APP = "salud-economica";
export const BACKUP_VERSION = 1;

export interface Backup {
  app: typeof BACKUP_APP;
  version: number;
  exportedAt: string;
  entries: Entry[];
}

export function toBackup(entries: Entry[], now: Date = new Date()): Backup {
  return { app: BACKUP_APP, version: BACKUP_VERSION, exportedAt: now.toISOString(), entries };
}

/** File name for a backup made on `now`, e.g. salud-economica-2026-11-06.json. */
export const backupFileName = (now: Date = new Date()): string => `${BACKUP_APP}-${now.toISOString().slice(0, 10)}.json`;

const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;
const DAY = /^\d{4}-(0[1-9]|1[0-2])-\d{2}$/;

/** Returns a clean entry, or null when the value is not a valid entry. Unknown fields are dropped. */
export function cleanEntry(v: unknown): Entry | null {
  if (!v || typeof v !== "object") return null;
  const e = v as Record<string, unknown>;
  if (typeof e.id !== "string" || !e.id) return null;
  if (e.kind !== "income" && e.kind !== "expense") return null;
  const category = e.kind === "income" ? "income" : e.category;
  if (category !== "income" && !CATEGORIES.includes(category as never)) return null;
  if (typeof e.amount !== "number" || !Number.isFinite(e.amount) || e.amount <= 0) return null;
  if (typeof e.month !== "string" || !MONTH.test(e.month)) return null;
  const out: Entry = {
    id: e.id,
    kind: e.kind,
    category: category as Entry["category"],
    amount: Math.round(e.amount * 100) / 100,
    note: typeof e.note === "string" ? e.note.slice(0, 80) : "",
    month: e.month,
    recurring: e.recurring === true,
    createdAt: typeof e.createdAt === "number" && Number.isFinite(e.createdAt) ? e.createdAt : 0,
  };
  if (out.recurring && EVERY.includes(e.every as never)) out.every = e.every as Entry["every"];
  if (out.recurring && typeof e.until === "string" && MONTH.test(e.until)) out.until = e.until;
  if (typeof e.date === "string" && DAY.test(e.date)) out.date = e.date;
  if (e.source === "manual" || e.source === "statement") out.source = e.source;
  return out;
}

/**
 * Reads a backup file. Accepts the wrapped format written by `toBackup` or a bare array of entries.
 * Returns null when the text is not a backup; invalid entries inside a valid backup are skipped.
 */
export function parseBackup(text: string): Entry[] | null {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return null;
  }
  const list = Array.isArray(data) ? data : data && typeof data === "object" && Array.isArray((data as Backup).entries) ? (data as Backup).entries : null;
  if (!list) return null;
  return list.map(cleanEntry).filter((e): e is Entry => e !== null);
}

/** Adds the backup entries that are not already saved (same id), keeping the saved ones untouched. */
export function mergeEntries(current: Entry[], incoming: Entry[]): { entries: Entry[]; added: number } {
  const ids = new Set(current.map((e) => e.id));
  const fresh = incoming.filter((e) => !ids.has(e.id) && ids.add(e.id));
  return { entries: [...current, ...fresh], added: fresh.length };
}

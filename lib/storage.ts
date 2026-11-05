// Entries are stored only in this browser (localStorage). Nothing is sent to a server.
import type { Entry } from "./finance";

export const STORAGE_KEY = "salud-economica.entries";

export function loadEntries(storage: Pick<Storage, "getItem"> | undefined = globalThis.localStorage): Entry[] {
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : [];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export function saveEntries(entries: Entry[], storage: Pick<Storage, "setItem"> | undefined = globalThis.localStorage): boolean {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(entries));
    return true;
  } catch {
    return false;
  }
}

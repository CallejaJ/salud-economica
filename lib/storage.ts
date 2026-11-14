// Entries are stored only in this browser (localStorage). Nothing is sent to a server.
import type { Entry } from "./finance";

export const STORAGE_KEY = "salud-economica.entries";

type Reader = Pick<Storage, "getItem">;
type Writer = Pick<Storage, "setItem">;

/**
 * Reading `window.localStorage` itself throws a SecurityError when the browser blocks site data
 * (Safari with "Block All Cookies"), so it is looked up inside the try, never as a default argument.
 */
function browserStorage(): Storage | undefined {
  return globalThis.localStorage;
}

export function loadEntries(storage?: Reader): Entry[] {
  try {
    const raw = (storage ?? browserStorage())?.getItem(STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : [];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export function saveEntries(entries: Entry[], storage?: Writer): boolean {
  try {
    const target = storage ?? browserStorage();
    if (!target) return false;
    target.setItem(STORAGE_KEY, JSON.stringify(entries));
    return true;
  } catch {
    return false;
  }
}

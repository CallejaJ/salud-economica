"use client";

import { useEffect } from "react";

/** Temporary: reports that React finished mounting, then a heartbeat, so a crash shows when it happens. */
export default function Diag() {
  useEffect(() => {
    const w = window as unknown as { __diag?: (s: string) => void };
    w.__diag?.("mounted");
    let n = 0;
    const id = setInterval(() => {
      n += 1;
      w.__diag?.(`alive-${n}`);
      if (n >= 8) clearInterval(id);
    }, 750);
    return () => clearInterval(id);
  }, []);
  return null;
}

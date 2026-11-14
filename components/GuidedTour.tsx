"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLang, type Key } from "@/lib/i18n";
import { HelpIcon } from "./icons";

/** localStorage key: once set, the tour has been seen (or skipped). */
export const TOUR_KEY = "salud-economica.tour";
/** Fired on window to start the tour again from any button. */
export const TOUR_EVENT = "salud-economica:start-tour";

type Step = {
  /** Value of the `data-tour` attribute to highlight. Without one, the card sits in the middle. */
  target?: string;
  title: Key;
  body: Key;
};

const STEPS: Step[] = [
  { title: "tourWelcomeTitle", body: "tourWelcomeBody" },
  { target: "tabs", title: "tourTabsTitle", body: "tourTabsBody" },
  { target: "month", title: "tourMonthTitle", body: "tourMonthBody" },
  { target: "verdict", title: "tourVerdictTitle", body: "tourVerdictBody" },
  { target: "pace", title: "tourPaceTitle", body: "tourPaceBody" },
  { target: "money", title: "tourMoneyTitle", body: "tourMoneyBody" },
  { target: "entries", title: "tourEntriesTitle", body: "tourEntriesBody" },
  { target: "add", title: "tourAddTitle", body: "tourAddBody" },
  { target: "import", title: "tourImportTitle", body: "tourImportBody" },
  { target: "backup", title: "tourBackupTitle", body: "tourBackupBody" },
  { target: "help", title: "tourHelpTitle", body: "tourHelpBody" },
];

type Rect = { top: number; left: number; width: number; height: number };

const PAD = 8; // room around the highlighted element
const GAP = 12; // space between the highlight and the card
const CARD_W = 360;

/** Viewport rectangle around every visible element with that `data-tour` value. */
function targetRect(name: string): Rect | null {
  const els = Array.from(document.querySelectorAll<HTMLElement>(`[data-tour="${name}"]`));
  let top = Infinity, left = Infinity, right = -Infinity, bottom = -Infinity;
  for (const el of els) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    top = Math.min(top, r.top);
    left = Math.min(left, r.left);
    right = Math.max(right, r.right);
    bottom = Math.max(bottom, r.bottom);
  }
  if (!isFinite(top)) return null;
  return { top: top - PAD, left: left - PAD, width: right - left + PAD * 2, height: bottom - top + PAD * 2 };
}

function firstTarget(name: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-tour="${name}"]`);
}

/**
 * Guided tour: a spotlight and a card explain each part of the page in turn. It opens by itself on
 * the first visit, is remembered in localStorage once finished or skipped, and the "?" button in the
 * header starts it again. When the browser blocks site data the tour does not open by itself,
 * because it could never remember that it was seen.
 */
export default function GuidedTour() {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [cardPos, setCardPos] = useState<{ top: number; left: number } | null>(null);
  // Step whose card is already in place: until it matches `index` the card stays hidden, so it is
  // never seen sliding across with the new step's text.
  const [shownIndex, setShownIndex] = useState(-1);
  const cardRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  const step = STEPS[index];
  const last = index === STEPS.length - 1;

  const finish = useCallback(() => {
    setOpen(false);
    try {
      localStorage.setItem(TOUR_KEY, "1");
    } catch {}
    returnFocus.current?.focus({ preventScroll: true });
  }, []);

  // First visit: start once the month view is on screen.
  useEffect(() => {
    let seen = true;
    try {
      seen = localStorage.getItem(TOUR_KEY) === "1";
    } catch {}
    if (seen) return;
    const id = window.setInterval(() => {
      if (!document.querySelector('[data-tour="verdict"]')) return;
      window.clearInterval(id);
      setIndex(0);
      setOpen(true);
    }, 700);
    return () => window.clearInterval(id);
  }, []);

  // Start again from the help button.
  useEffect(() => {
    const start = () => {
      returnFocus.current = document.activeElement as HTMLElement | null;
      setShownIndex(-1);
      setIndex(0);
      setOpen(true);
    };
    window.addEventListener(TOUR_EVENT, start);
    return () => window.removeEventListener(TOUR_EVENT, start);
  }, []);

  // Recompute the spotlight and where the card goes (also on scroll and resize).
  const measure = useCallback(() => {
    if (!open) return;
    const r = step.target ? targetRect(step.target) : null;
    setRect(r);
    const card = cardRef.current;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const cw = Math.min(CARD_W, vw - 24);
    const ch = card?.offsetHeight ?? 220;
    if (!r) {
      setCardPos({ top: Math.max(12, (vh - ch) / 2), left: (vw - cw) / 2 });
      return;
    }
    const clampLeft = (x: number) => Math.min(Math.max(12, x), vw - cw - 12);
    const clampTop = (y: number) => Math.min(Math.max(12, y), vh - ch - 12);
    let top: number;
    let left: number;
    if (r.top + r.height + GAP + ch <= vh - 12) {
      top = r.top + r.height + GAP; // below
      left = clampLeft(r.left);
    } else if (r.top - GAP - ch >= 12) {
      top = r.top - GAP - ch; // above
      left = clampLeft(r.left);
    } else if (r.left + r.width + GAP + cw <= vw - 12) {
      top = clampTop(r.top); // right
      left = r.left + r.width + GAP;
    } else if (r.left - GAP - cw >= 12) {
      top = clampTop(r.top); // left
      left = r.left - GAP - cw;
    } else {
      top = vh - ch - 12; // the element fills the screen: card at the bottom
      left = clampLeft((vw - cw) / 2);
    }
    setCardPos({ top, left });
  }, [open, step]);

  // On each step, scroll the element into view only if it is not fully visible, then show the card
  // once the smooth scroll has stopped.
  useEffect(() => {
    if (!open) return;
    const target = step.target;
    const timers: number[] = [];
    timers.push(
      window.setTimeout(() => {
        const reveal = () => {
          measure();
          setShownIndex(index);
        };
        const el = target ? firstTarget(target) : null;
        const headerEl = document.querySelector(".site-header");
        if (!el || headerEl?.contains(el)) return reveal(); // the header is always on screen
        const r = el.getBoundingClientRect();
        const header = headerEl?.getBoundingClientRect().bottom ?? 0;
        if (r.top >= header + PAD && r.bottom <= window.innerHeight - PAD) return reveal();
        // Tall panels go to the top so the card fits under them; small ones to the middle.
        const tall = r.height > window.innerHeight * 0.5;
        if (tall) window.scrollTo({ top: window.scrollY + r.top - header - PAD * 2, behavior: "smooth" });
        else el.scrollIntoView({ block: "center", behavior: "smooth" });
        let lastY = -1;
        let still = 0;
        const started = Date.now();
        const check = () => {
          const y = window.scrollY;
          still = y === lastY ? still + 1 : 0;
          lastY = y;
          if (still >= 2 || Date.now() - started > 1200) reveal();
          else timers.push(window.setTimeout(check, 50));
        };
        timers.push(window.setTimeout(check, 100));
      }, 60),
    );
    return () => timers.forEach((id) => window.clearTimeout(id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, index]);

  useLayoutEffect(() => {
    measure();
  }, [measure, t]);

  useEffect(() => {
    if (!open) return;
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    // Entrance animations move the panels for a moment after they render.
    const id = window.setInterval(measure, 250);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
      window.clearInterval(id);
    };
  }, [open, measure]);

  // Keyboard: Escape skips, arrows move. Focus goes to the card for screen readers.
  useEffect(() => {
    if (!open) return;
    cardRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish();
      else if (e.key === "ArrowRight") setIndex((i) => Math.min(i + 1, STEPS.length - 1));
      else if (e.key === "ArrowLeft") setIndex((i) => Math.max(i - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, index, finish]);

  if (!open) return null;

  return (
    <div className="tour-root" data-step={index + 1}>
      {/* Catches clicks outside the card. */}
      <div className="tour-blocker" onClick={(e) => e.stopPropagation()} />
      {rect ? (
        <div className="tour-spotlight" style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }} />
      ) : (
        <div className="tour-dim" />
      )}
      <div
        ref={cardRef}
        id="tour-card"
        className={"tour-card" + (shownIndex === index ? "" : " moving")}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
        aria-describedby="tour-body"
        tabIndex={-1}
        style={{ top: cardPos?.top ?? -9999, left: cardPos?.left ?? -9999, width: `min(${CARD_W}px, calc(100vw - 24px))` }}
      >
        <div className="tour-progress" aria-hidden="true">
          {STEPS.map((_, i) => (
            <span key={i} className={"tour-dot" + (i === index ? " active" : i < index ? " done" : "")} />
          ))}
        </div>
        <p className="tour-count">{t("tourStepOf", index + 1, STEPS.length)}</p>
        <h2 id="tour-title">{t(step.title)}</h2>
        <p id="tour-body">{t(step.body)}</p>
        <div className="tour-actions">
          {!last && (
            <button type="button" id="tour-skip" className="link tour-skip" onClick={finish}>
              {t("tourSkip")}
            </button>
          )}
          <span className="tour-spacer" />
          {index > 0 && (
            <button type="button" id="tour-prev" className="secondary tour-prev" onClick={() => setIndex(index - 1)}>
              {t("tourPrev")}
            </button>
          )}
          <button type="button" id="tour-next" className="primary tour-next" onClick={() => (last ? finish() : setIndex(index + 1))}>
            {last ? t("tourDone") : index === 0 ? t("tourStart") : t("tourNext")}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Header "?" button that starts the tour again. */
export function TourButton() {
  const { t } = useLang();
  return (
    <button
      type="button"
      id="tour-btn"
      className="theme-toggle"
      data-tour="help"
      aria-label={t("tourRelaunch")}
      title={t("tourRelaunch")}
      onClick={() => window.dispatchEvent(new Event(TOUR_EVENT))}
    >
      <HelpIcon />
    </button>
  );
}

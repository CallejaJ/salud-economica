type P = { size?: number; className?: string };
const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
});

export const UploadIcon = ({ size = 44, className }: P) => (
  <svg {...base(size)} strokeWidth={1.6} className={className}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5" />
    <path d="M12 17v-6M9 14l3-3 3 3" />
  </svg>
);
export const DownloadIcon = ({ size = 16 }: P) => (
  <svg {...base(size)}>
    <path d="M12 4v11M7 10l5 5 5-5" />
    <path d="M5 20h14" />
  </svg>
);
export const LockIcon = ({ size = 18 }: P) => (
  <svg {...base(size)}>
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
);
export const WarnIcon = ({ size = 18 }: P) => (
  <svg {...base(size)}>
    <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
    <path d="M12 9v4M12 17h.01" />
  </svg>
);
export const CheckIcon = ({ size = 14 }: P) => (
  <svg {...base(size)} strokeWidth={2.6}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);
export const SunIcon = ({ size = 20 }: P) => (
  <svg {...base(size)}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);
export const MoonIcon = ({ size = 20 }: P) => (
  <svg {...base(size)}>
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </svg>
);
export const ChevronIcon = ({ size = 18, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M9 6l6 6-6 6" />
  </svg>
);
export const PlusIcon = ({ size = 16 }: P) => (
  <svg {...base(size)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
export const MinusIcon = ({ size = 16 }: P) => (
  <svg {...base(size)}>
    <path d="M5 12h14" />
  </svg>
);
export const TrashIcon = ({ size = 16 }: P) => (
  <svg {...base(size)}>
    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
  </svg>
);
export const WalletIcon = ({ size = 16 }: P) => (
  <svg {...base(size)}>
    <rect x="3" y="6" width="18" height="13" rx="2" />
    <path d="M3 10h18M16 14.5h.01" />
  </svg>
);

/** One icon per spending category, plus income. Paths are 24×24 strokes. */
const CATEGORY_PATHS: Record<string, React.ReactNode> = {
  home: (
    <>
      <path d="M3 11l9-7 9 7" />
      <path d="M5 10v10h14V10" />
      <path d="M10 20v-6h4v6" />
    </>
  ),
  food: (
    <>
      <path d="M3 4h2l2.5 11h11L21 7H6.5" />
      <circle cx="9" cy="19" r="1.5" />
      <circle cx="17" cy="19" r="1.5" />
    </>
  ),
  transport: (
    <>
      <path d="M5 16V9l2-4h10l2 4v7" />
      <path d="M3 16h18v2H3z" />
      <circle cx="7.5" cy="12.5" r="1" />
      <circle cx="16.5" cy="12.5" r="1" />
    </>
  ),
  bills: <path d="M13 2L5 14h6l-1 8 8-12h-6z" />,
  leisure: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 14.5a4.5 4.5 0 0 0 7 0M9 9.5h.01M15 9.5h.01" />
    </>
  ),
  sports: (
    <>
      <path d="M6.5 6.5v11M17.5 6.5v11" />
      <path d="M3.5 9.5v5M20.5 9.5v5" />
      <path d="M6.5 12h11" />
    </>
  ),
  school: (
    <>
      <path d="M2 9l10-5 10 5-10 5z" />
      <path d="M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5" />
      <path d="M22 9v5" />
    </>
  ),
  activities: <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />,
  gifts: (
    <>
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M5 12v9h14v-9M12 8v13" />
      <path d="M12 8C10.5 4 6 3.5 6 6s3 2 6 2c3 0 6 .5 6-2s-4.5-2-6 2" />
    </>
  ),
  other: (
    <>
      <circle cx="5" cy="12" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="19" cy="12" r="1.6" />
    </>
  ),
  income: <path d="M12 19V5M6 11l6-6 6 6" />,
};

export const CategoryIcon = ({ category, size = 20 }: { category: string; size?: number }) => (
  <svg {...base(size)}>{CATEGORY_PATHS[category] ?? CATEGORY_PATHS.other}</svg>
);

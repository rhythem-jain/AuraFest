import type { ReactNode } from 'react';

/** One consistent modern outline icon set (24px grid, 1.75 stroke). Always decorative: text carries meaning. */
const PATHS = {
  lock: (
    <>
      <rect x="4" y="11" width="16" height="10" rx="2.5" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </>
  ),
  unlock: (
    <>
      <rect x="4" y="11" width="16" height="10" rx="2.5" />
      <path d="M8 11V7a4 4 0 0 1 7.5-2" />
    </>
  ),
  link: (
    <>
      <path d="M10 13a4.5 4.5 0 0 0 6.36 0l2.5-2.5a4.5 4.5 0 0 0-6.36-6.36l-1 1" />
      <path d="M14 11a4.5 4.5 0 0 0-6.36 0l-2.5 2.5a4.5 4.5 0 0 0 6.36 6.36l1-1" />
    </>
  ),
  printer: (
    <>
      <path d="M6 9V3h12v6" />
      <rect x="3.5" y="9" width="17" height="8.5" rx="2.5" />
      <path d="M6 14.5h12V21H6z" />
    </>
  ),
  reset: (
    <>
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v5h5" />
    </>
  ),
  check: <path d="M4.5 12.5l5 5L19.5 7" />,
  alert: (
    <>
      <path d="M12 3l9.5 17h-19z" />
      <path d="M12 9.5v5M12 17.5v.01" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M3 7.5l9 5.5 9-5.5" />
    </>
  ),
  file: (
    <>
      <path d="M6 3h8.5l4.5 4.5V21H6z" />
      <path d="M14.5 3v4.5H19M9 13h6M9 17h6" />
    </>
  ),
  circle: <circle cx="12" cy="12" r="8" />,
  sparkle: (
    <path d="M12 2.5l2.2 6.3 6.3 2.2-6.3 2.2-2.2 6.3-2.2-6.3-6.3-2.2 6.3-2.2z" />
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="16" rx="2.5" />
      <path d="M3.5 10h17M8.5 2.5v4M15.5 2.5v4" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 19.5a6.5 6.5 0 0 1 13 0" />
      <path d="M16 4.7a3.5 3.5 0 0 1 0 6.6M18 14a6.5 6.5 0 0 1 3.5 5.5" />
    </>
  ),
  wallet: (
    <>
      <rect x="3" y="5.5" width="18" height="14.5" rx="2.5" />
      <path d="M3 10h18" />
      <circle cx="16.5" cy="14.5" r="1.25" />
    </>
  ),
  store: (
    <>
      <path d="M4 9l1.5-5.5h13L20 9" />
      <path d="M4 9a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0A2.7 2.7 0 0 0 20 9" />
      <path d="M5 12v8.5h14V12" />
    </>
  ),
  pencil: <path d="M4 20l1.2-4.2L16.2 4.8a1.5 1.5 0 0 1 2.1 2.1L7.3 17.9z" />,
  route: (
    <>
      <circle cx="6" cy="6" r="2.5" />
      <circle cx="6" cy="18" r="2.5" />
      <path d="M6 8.5v7M12 6h8M12 18h8" />
    </>
  ),
  x: <path d="M6 6l12 12M18 6L6 18" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6" />
    </>
  ),
  moon: <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" />,
  stop: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M5.6 5.6l12.8 12.8" />
    </>
  ),
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof PATHS;

export function Icon({ name, className = 'h-4 w-4' }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={`shrink-0 ${className}`}
    >
      {PATHS[name]}
    </svg>
  );
}

/** Original geometric liquid prism brandmark for AuraFest */
export function BrandMark({ className = 'h-9 w-9' }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" aria-hidden="true" focusable="false" className={className}>
      <defs>
        <linearGradient id="aura-liquid" x1="10%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="50%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>
        <linearGradient id="aura-specular" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="aura-prism" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      {/* Outer rounded glass substrate */}
      <rect width="36" height="36" rx="10" fill="url(#aura-liquid)" />
      {/* Specular sheen on top half */}
      <path d="M0 10C0 4.477 4.477 0 10 0h16c5.523 0 10 4.477 10 10v6c0-5-8-10-18-10S0 11 0 16v-6z" fill="url(#aura-specular)" />
      {/* Geometric crystal facets */}
      <polygon points="18,5 29,13 18,31 7,13" fill="#ffffff" fillOpacity="0.18" />
      <polygon points="18,8 26,14 18,27 10,14" fill="url(#aura-prism)" fillOpacity="0.9" />
      {/* Center luminous core */}
      <circle cx="18" cy="15.5" r="3" fill="#ffffff" />
      <circle cx="18" cy="15.5" r="1.5" fill="#6366f1" />
    </svg>
  );
}

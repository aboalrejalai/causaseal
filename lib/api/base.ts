/** Absolute API origin for Capacitor shells; empty = same-origin (web / Hostinger). */

export function apiUrl(path: string): string {
  const base = (process.env.NEXT_PUBLIC_API_BASE || "").replace(/\/$/, "")
  const normalized = path.startsWith("/") ? path : `/${path}`
  return base ? `${base}${normalized}` : normalized
}

export const PRIMARY_TABS = [
  'discover',
  'pulse',
  'trackers',
  'perps',
  'yield',
  'vision',
  'portfolio',
  'rewards',
] as const;

export type RouteTab = (typeof PRIMARY_TABS)[number];
export type PrimaryTab = RouteTab | 'terminal';

export function isRouteTab(v: string | undefined): v is RouteTab {
  return !!v && (PRIMARY_TABS as readonly string[]).includes(v);
}

/** Map a terminal tab (plus selected token) to its URL path. */
export function pathForTab(tab: PrimaryTab, tokenAddress?: string): string {
  if (tab === 'terminal') return tokenAddress ? `/token/${tokenAddress}` : '/discover';
  return `/${tab}`;
}

/** Inverse of pathForTab. Returns null for paths that are not terminal routes. */
export function tabForPath(pathname: string): PrimaryTab | null {
  const parts = pathname.split('/').filter(Boolean);
  if (parts[0] === 'token' && parts[1]) return 'terminal';
  if (parts.length === 1 && isRouteTab(parts[0])) return parts[0];
  return null;
}

/**
 * Strip a leading numeric prefix like `01-` from a content collection slug.
 * Lets us order content files (`01-open-water.md`) but keep clean URLs (/open-water).
 */
export function cleanSlug(raw: string): string {
  return raw.replace(/^\d+-/, '')
}

/**
 * Build a sortable key from a numeric prefix; returns 99999 if there is none
 * so unprefixed entries sink to the bottom.
 */
export function orderKey(raw: string): number {
  const match = raw.match(/^(\d+)-/)
  return match ? Number(match[1]) : 99999
}

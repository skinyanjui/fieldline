/**
 * Validation constants synchronized verbatim with firebase-blueprint.json
 * and firestore.rules volumetric boundaries.
 */
export const SCHEMA_LIMITS = {
  idPattern: /^[a-zA-Z0-9_-]+$/,
  maxIdLength: 128,
  displayName: { min: 2, max: 80 },
  homeRegion: { min: 2, max: 60 },
  bio: { max: 280 },
  maxDisciplines: 6,
  photoURL: { max: 500 },
  orgName: { min: 2, max: 100 },
  location: { min: 2, max: 80 },
  outingLocation: { min: 2, max: 100 },
  founded: { min: 4, max: 20 },
  chapterCount: { max: 40 },
  website: { max: 240 },
  instagram: { max: 80 },
  summary: { min: 20, max: 600 },
  postTitle: { min: 4, max: 120 },
  postBody: { min: 10, max: 1500 },
  commentBody: { min: 2, max: 600 },
  outingTitle: { min: 4, max: 120 },
  outingDateLabel: { min: 4, max: 60 },
  outingDescription: { min: 10, max: 800 },
  outingSpots: { min: 2, max: 500 },
  departurePoint: { min: 2, max: 100 },
  itemSummary: { min: 2, max: 100 },
  offerNotes: { max: 300 },
  offerSlots: { min: 1, max: 12 },
  claimRoleTitle: { min: 2, max: 80 },
  claimNotes: { min: 10, max: 500 },
} as const;

export function sanitizeString(value: string, maxLength: number): string {
  return value.trim().slice(0, maxLength);
}

export function sanitizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed.slice(0, SCHEMA_LIMITS.website.max);
  }
  return `https://${trimmed}`.slice(0, SCHEMA_LIMITS.website.max);
}

export function isSafeExternalUrl(url: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export function slugifyId(text: string): string {
  const base = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base || 'item'}-${suffix}`;
}

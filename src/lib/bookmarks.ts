// Pure bookmark helpers. No browser APIs here so they can be unit tested in Node.

export const STORAGE_KEY = 'mona-bookmarks';
export const SEPARATOR = ' :: ';
const SLUG_PREFIX = 'mona-';
const SLUG_LENGTH = 4;
const BASE62 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

export interface Bookmark {
  url: string;
  slug: string;
}

/** Normalises user input to an absolute http(s) URL, or returns null if invalid. */
export function normalizeUrl(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  const trimmed = input.trim();
  if (!trimmed || /\s/.test(trimmed)) return null;
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const parsed = new URL(withScheme);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    if (!parsed.hostname) return null;
    return parsed.href.replace(/\/$/, '');
  } catch {
    return null;
  }
}

function randomIndex(): number {
  const c = (globalThis as { crypto?: Crypto }).crypto;
  if (c?.getRandomValues) return c.getRandomValues(new Uint32Array(1))[0];
  return Math.floor(Math.random() * 0xffffffff);
}

function randomBody(length: number): string {
  let body = '';
  for (let i = 0; i < length; i++) body += BASE62[randomIndex() % BASE62.length];
  return body;
}

/** Generates a "mona-xxxx" slug (4 base62 chars) that is not in `taken`. */
export function generateSlug(taken: Iterable<string> = []): string {
  const used = new Set(taken);
  for (let attempt = 0; attempt < 100; attempt++) {
    const slug = SLUG_PREFIX + randomBody(SLUG_LENGTH);
    if (!used.has(slug)) return slug;
  }
  return SLUG_PREFIX + randomBody(SLUG_LENGTH + 4);
}

const SLUG_PATTERN = /^mona-[0-9a-zA-Z]+$/;

/**
 * Parses a raw stored string into valid bookmarks. Never throws: empty,
 * corrupted, legacy (e.g. array of strings) and non-array values yield [] or
 * only the entries that validate.
 */
export function parseStored(raw: unknown): Bookmark[] {
  if (typeof raw !== 'string' || !raw.trim()) return [];
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(data)) return [];
  const seen = new Set<string>();
  const result: Bookmark[] = [];
  for (const item of data) {
    if (typeof item !== 'object' || item === null) continue;
    const { url, slug } = item as Record<string, unknown>;
    if (typeof url !== 'string' || typeof slug !== 'string') continue;
    const clean = normalizeUrl(url);
    if (!clean || !SLUG_PATTERN.test(slug) || seen.has(slug)) continue;
    seen.add(slug);
    result.push({ url: clean, slug });
  }
  return result;
}

export function serialize(bookmarks: Bookmark[]): string {
  return JSON.stringify(bookmarks.map(({ url, slug }) => ({ url, slug })));
}

/** Returns a new list with the bookmark added (newest first), or null if the URL is invalid. */
export function addBookmark(list: Bookmark[], input: unknown): Bookmark[] | null {
  const url = normalizeUrl(input);
  if (!url) return null;
  const slug = generateSlug(list.map((b) => b.slug));
  return [{ url, slug }, ...list];
}

export function formatBookmark(b: Bookmark): string {
  return `${b.url}${SEPARATOR}${b.slug}`;
}

/**
 * 4 distinct profile avatar SVGs (data URIs).
 * Each is a unique geometric/abstract face in a warm palette.
 */

const AVATARS = [
  // 1 — Coral circle with abstract face
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><circle cx="100" cy="100" r="100" fill="#FF6B6B"/><circle cx="70" cy="82" r="12" fill="#fff"/><circle cx="130" cy="82" r="12" fill="#fff"/><circle cx="70" cy="84" r="6" fill="#2D2D2D"/><circle cx="130" cy="84" r="6" fill="#2D2D2D"/><path d="M72 125 Q100 150 128 125" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none"/><circle cx="50" cy="100" r="14" fill="#FF5252" opacity="0.5"/><circle cx="150" cy="100" r="14" fill="#FF5252" opacity="0.5"/></svg>`)}`,

  // 2 — Teal circle with geometric face
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><circle cx="100" cy="100" r="100" fill="#26C6A0"/><rect x="62" y="72" width="20" height="20" rx="4" fill="#fff"/><rect x="118" y="72" width="20" height="20" rx="4" fill="#fff"/><rect x="68" y="78" width="8" height="8" rx="2" fill="#2D2D2D"/><rect x="124" y="78" width="8" height="8" rx="2" fill="#2D2D2D"/><line x1="78" y1="128" x2="122" y2="128" stroke="#fff" stroke-width="5" stroke-linecap="round"/><path d="M60 56 Q100 40 140 56" stroke="#1FAF8E" stroke-width="8" stroke-linecap="round" fill="none"/></svg>`)}`,

  // 3 — Purple circle with round features
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><circle cx="100" cy="100" r="100" fill="#9B72F2"/><ellipse cx="72" cy="85" rx="14" ry="16" fill="#fff"/><ellipse cx="128" cy="85" rx="14" ry="16" fill="#fff"/><circle cx="72" cy="88" r="7" fill="#2D2D2D"/><circle cx="128" cy="88" r="7" fill="#2D2D2D"/><ellipse cx="100" cy="132" rx="16" ry="10" fill="#fff"/><circle cx="100" cy="60" r="6" fill="#C9AAFF"/><circle cx="80" cy="52" r="4" fill="#C9AAFF"/><circle cx="120" cy="52" r="4" fill="#C9AAFF"/></svg>`)}`,

  // 4 — Amber circle with angular features
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><circle cx="100" cy="100" r="100" fill="#FFB347"/><polygon points="60,76 80,76 70,92" fill="#fff"/><polygon points="120,76 140,76 130,92" fill="#fff"/><circle cx="70" cy="82" r="5" fill="#2D2D2D"/><circle cx="130" cy="82" r="5" fill="#2D2D2D"/><path d="M80 126 Q100 140 120 126" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none"/><line x1="56" y1="68" x2="84" y2="68" stroke="#E89A30" stroke-width="5" stroke-linecap="round"/><line x1="116" y1="68" x2="144" y2="68" stroke="#E89A30" stroke-width="5" stroke-linecap="round"/></svg>`)}`,
] as const;

/**
 * Simple deterministic hash so the same address always maps to the same avatar,
 * identically on server and client (no localStorage, no Math.random).
 */
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/**
 * Get a deterministic avatar data URI for a given user key (address or email).
 */
export function getAvatar(userKey: string): string {
  if (!userKey) return AVATARS[0];
  return AVATARS[hashCode(userKey) % AVATARS.length];
}

/** All avatar options (for a future picker UI). */
export const AVATAR_OPTIONS = AVATARS;

const PROD_HOSTS = new Set([
  "calendar.beauty-funnels.com",
  "admin.beauty-funnels.com",
  "luxe-appoint.lovable.app",
]);

const PUBLIC_BOOKING_ORIGIN = "https://calendar.beauty-funnels.com";

export function getPublicOrigin(): string {
  if (typeof window === "undefined") return PUBLIC_BOOKING_ORIGIN;
  const host = window.location.hostname;
  if (PROD_HOSTS.has(host)) return PUBLIC_BOOKING_ORIGIN;
  // Dev / preview / lovable.app subdomains — keep current origin so link works locally.
  return window.location.origin;
}

/**
 * Short shareable referral link used in messages: {origin}/r/{code}
 * Resolves on the client via ReferralRedirectPage → /join/{slug}?ref={code}.
 */
export function buildReferralUrl(_slug: string | null | undefined, code: string): string {
  return `${getPublicOrigin()}/r/${code}`;
}

/** Long-form join URL — fallback for backward compatibility. */
export function buildJoinUrl(slug: string, code?: string | null): string {
  const base = `${getPublicOrigin()}/join/${slug}`;
  return code ? `${base}?ref=${code}` : base;
}
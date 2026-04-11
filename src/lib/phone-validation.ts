/**
 * Validates and normalizes Polish phone numbers.
 * Accepts: 9 digits, +48XXXXXXXXX, 48XXXXXXXXX, with optional spaces/dashes.
 * Returns normalized +48XXXXXXXXX format or null if invalid.
 */
export function normalizePolishPhone(phone: string): string | null {
  const cleaned = phone.replace(/[\s\-()]/g, "");

  // Match: optional +, optional 48, then 9 digits
  const match = cleaned.match(/^(?:\+?48)?(\d{9})$/);
  if (!match) return null;

  return `+48${match[1]}`;
}

export function validatePolishPhone(phone: string): boolean {
  return normalizePolishPhone(phone) !== null;
}

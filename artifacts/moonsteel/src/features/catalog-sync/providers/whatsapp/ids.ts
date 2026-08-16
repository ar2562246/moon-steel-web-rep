const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isWhatsAppBusinessAccountId(value: string) {
  const wabaId = value.trim();
  if (!wabaId) return false;
  if (UUID_RE.test(wabaId)) return false;
  return /^\d{10,20}$/.test(wabaId);
}

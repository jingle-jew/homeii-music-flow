const VALID_CARD_ID = /^[A-Za-z0-9_-]{1,64}$/;
const SCOPE_SEPARATOR = "__";

export function normalizeCardId(value) {
  const id = String(value ?? "").trim();
  if (!id) return "";
  return VALID_CARD_ID.test(id) ? id : "";
}

export function isValidCardId(value) {
  return normalizeCardId(value) !== "";
}

export function scopeStorageKey(baseKey, cardId) {
  const id = normalizeCardId(cardId);
  return id ? `${baseKey}${SCOPE_SEPARATOR}${id}` : baseKey;
}

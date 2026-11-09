const KEY = 'mirra.sidebar.preference';
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export function readSidebarPreference(storage, now = Date.now()) {
  try {
    const value = JSON.parse(storage.getItem(KEY));
    return value && typeof value.open === 'boolean' &&
      Number.isFinite(value.expiresAt) && value.expiresAt > now &&
      value.expiresAt <= now + MAX_AGE_MS ? value.open : null;
  } catch { return null; }
}

export function writeSidebarPreference(storage, open, now = Date.now()) {
  if (typeof open !== 'boolean') return;
  try { storage.setItem(KEY, JSON.stringify({open, expiresAt: now + MAX_AGE_MS})); }
  catch { /* A blocked preference store must not prevent sidebar interaction. */ }
}

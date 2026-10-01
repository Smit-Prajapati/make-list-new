// ─── constants.js — shared storage keys ─────────────────────────────────────
// Centralizes the string literals used as sessionStorage/localStorage keys so
// they aren't repeated (and risk drifting) across modules.

export const STORAGE_KEYS = {
  SELECTED_LIST_ID: "selectedListId",
  PERSON_NAME: "storedPersonName",
};

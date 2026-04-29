// Small helper file for login state in localStorage.
// Keeping this in one place means every page uses the same key and shape.

import type { StoredUser } from "@/lib/types";

// This is the localStorage key used across the app.
export const STORAGE_KEY = "feedbackai_user";

// Read the saved user from localStorage.
export function readStoredUser(): StoredUser | null {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

// Save the logged-in user to localStorage.
export function saveStoredUser(user: StoredUser) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

// Remove the logged-in user from localStorage.
export function clearStoredUser() {
  localStorage.removeItem(STORAGE_KEY);
}

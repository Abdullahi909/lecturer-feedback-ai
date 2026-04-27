"use client";

// This hook protects pages from being viewed by the wrong user.
// Every page calls this and passes in which role is allowed ("lecturer" or "student").
// If no one is logged in, the user gets sent back to the login page.
// If the wrong role is logged in, they get sent to their own page instead.

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// This is the shape of the user object we save in localStorage when someone logs in.
// Every page that needs the current user reads it through this hook.
export type StoredUser = {
  name: string;      // Full name, e.g. "Abdullahi Mohamed"
  initials: string;  // Two-letter initials shown in the avatar, e.g. "AM"
  role: "lecturer" | "student";
};

// The key we use when saving/reading the user from localStorage.
// Keeping it in one place means we never mistype it on different pages.
const STORAGE_KEY = "feedbackai_user";

export function useAuthGuard(requiredRole: "lecturer" | "student" = "lecturer") {
  // Start with no user and loading = true so pages show nothing while we check.
  const [user, setUser] = useState<StoredUser | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    // We can only read localStorage inside useEffect because Next.js renders pages
    // on the server first, and localStorage does not exist on the server.
    const saved = localStorage.getItem(STORAGE_KEY);

    // Nobody is logged in — go back to login.
    if (!saved) {
      router.replace("/login");
      return;
    }

    // Parse the JSON string back into an object.
    const parsed = JSON.parse(saved) as StoredUser;

    // The logged-in user has the wrong role — redirect them to their own area.
    if (parsed.role !== requiredRole) {
      const correctPage = parsed.role === "lecturer" ? "/dashboard" : "/student";
      router.replace(correctPage);
      return;
    }

    // Everything is fine — store the user in state and stop the loading spinner.
    setUser(parsed);
    setLoading(false);
  }, []); // Empty array means this only runs once when the page first loads.

  return { user, loading };
}

"use client";

// Auth guard hook — call this at the top of every protected page.
// It checks localStorage for a logged-in user and redirects if:
//   - nobody is logged in (→ /login)
//   - the wrong role is logged in (→ their own page)
// While checking, it returns loading: true so the page shows nothing yet.

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { readStoredUser } from "@/lib/auth";
import type { StoredUser } from "@/lib/types";

export function useAuthGuard(requiredRole: "lecturer" | "student") {
  const [user,    setUser]    = useState<StoredUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // localStorage is only available in the browser, not during server rendering.
    // useEffect only runs in the browser, so it is safe to read here.
    const parsed = readStoredUser();

    if (!parsed) {
      // No one is logged in — go to the login page.
      router.replace("/login");
      return;
    }

    if (parsed.role !== requiredRole) {
      // The logged-in user has the wrong role — send them to their own page.
      router.replace(parsed.role === "lecturer" ? "/dashboard" : "/student");
      return;
    }

    // All good — store the user so the page can use it.
    setUser(parsed);
    setLoading(false);
  }, []);

  return { user, loading };
}

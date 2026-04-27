"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * The shape of the user object stored in localStorage under "feedbackai_user".
 * Written on login, read by every protected page and the Sidebar.
 */
export type StoredUser = {
  name: string;
  initials: string;
  role: "lecturer" | "student";
};

/**
 * useAuthGuard
 *
 * Protects client pages from unauthenticated access. Must be called at the
 * top of any page that requires a logged-in user.
 *
 * On mount it reads localStorage for a session object. If none exists the user
 * is sent to /login. If the session role does not match the required role, the
 * user is sent to their own home page instead (prevents a student from viewing
 * lecturer pages and vice versa).
 *
 * Returns { user, loading }. Pages should render null while loading is true to
 * prevent a flash of protected content before the redirect fires.
 *
 * @param requiredRole - The role this page is restricted to. Defaults to "lecturer".
 *
 * @example
 * const { user, loading } = useAuthGuard("lecturer");
 * if (loading || !user) return null;
 */
export function useAuthGuard(requiredRole: "lecturer" | "student" = "lecturer"): {
  user: StoredUser | null;
  loading: boolean;
} {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const raw = localStorage.getItem("feedbackai_user");

    if (!raw) {
      // No session — send to login
      router.replace("/login");
      return;
    }

    const parsed = JSON.parse(raw) as StoredUser;

    if (parsed.role !== requiredRole) {
      // Wrong role — redirect to the user's own home page
      router.replace(parsed.role === "lecturer" ? "/dashboard" : "/student");
      return;
    }

    setUser(parsed);
    setLoading(false);
  }, []);

  return { user, loading };
}

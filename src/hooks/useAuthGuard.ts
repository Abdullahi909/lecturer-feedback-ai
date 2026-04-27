"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Shape of the session object written to localStorage on login
export type StoredUser = {
  name: string;
  initials: string;
  role: "lecturer" | "student";
};

// Protects a page by checking the stored session on mount.
// Returns { user, loading } — pages should render null while loading
// to avoid a flash of protected content before the redirect fires.
export function useAuthGuard(requiredRole: "lecturer" | "student" = "lecturer"): {
  user: StoredUser | null;
  loading: boolean;
} {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // localStorage is only safe inside useEffect — reading it at module level
    // throws a ReferenceError during server-side rendering
    const raw = localStorage.getItem("feedbackai_user");

    if (!raw) {
      router.replace("/login");
      return;
    }

    const parsed = JSON.parse(raw) as StoredUser;

    if (parsed.role !== requiredRole) {
      // Wrong role — redirect each user to their own home rather than showing a blank page
      router.replace(parsed.role === "lecturer" ? "/dashboard" : "/student");
      return;
    }

    setUser(parsed);
    setLoading(false);
  }, []);

  return { user, loading };
}

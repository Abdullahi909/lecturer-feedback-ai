"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export type StoredUser = {
  name: string;
  initials: string;
  role: "lecturer" | "student";
};

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
      router.replace("/login");
      return;
    }
    const parsed = JSON.parse(raw) as StoredUser;
    if (parsed.role !== requiredRole) {
      router.replace(parsed.role === "lecturer" ? "/dashboard" : "/student");
      return;
    }
    setUser(parsed);
    setLoading(false);
  }, []);

  return { user, loading };
}

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Upload,
  FileText,
  CheckSquare,
  Settings,
  LogOut,
} from "lucide-react";
import type { StoredUser } from "@/hooks/useAuthGuard";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Upload Assignments", href: "/upload", icon: Upload },
  { label: "Feedback Review", href: "/feedback", icon: FileText },
  { label: "Approved", href: "/approved", icon: CheckSquare },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("feedbackai_user");
    if (raw) setUser(JSON.parse(raw) as StoredUser);
  }, []);

  function handleLogout() {
    localStorage.removeItem("feedbackai_user");
    router.push("/login");
  }

  return (
    <aside
      style={{
        width: "240px",
        minHeight: "100vh",
        backgroundColor: "#1e293b",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "24px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <span
          style={{
            fontSize: "18px",
            fontWeight: "700",
            color: "#ffffff",
            letterSpacing: "-0.3px",
          }}
        >
          FeedbackAI
        </span>
        <p style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>
          Lecturer Portal
        </p>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "16px 12px" }}>
        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "4px" }}>
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    textDecoration: "none",
                    fontSize: "14px",
                    fontWeight: active ? "600" : "400",
                    color: active ? "#ffffff" : "#94a3b8",
                    backgroundColor: active ? "#3b82f6" : "transparent",
                    transition: "all 0.15s ease",
                  }}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User info */}
      <div
        style={{
          padding: "16px 20px",
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              backgroundColor: "#3b82f6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: "600",
              color: "#fff",
              flexShrink: 0,
            }}
          >
            {user?.initials ?? "—"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontSize: "13px",
                fontWeight: "500",
                color: "#f1f5f9",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {user?.name ?? ""}
            </p>
            <p style={{ fontSize: "11px", color: "#64748b" }}>Lecturer</p>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            <LogOut size={14} color="#64748b" />
          </button>
        </div>
      </div>
    </aside>
  );
}

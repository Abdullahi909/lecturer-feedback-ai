"use client";

// Sidebar navigation — shown on every lecturer page.
// Highlights the current page, shows the logged-in user's name, and has a logout button.

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { LayoutDashboard, Upload, FileText, CheckSquare, Settings, LogOut } from "lucide-react";

const STORAGE_KEY = "feedbackai_user";

// Nav links — label, URL path, and icon for each page.
const navItems = [
  { label: "Dashboard",          href: "/dashboard", icon: LayoutDashboard },
  { label: "Upload Assignments", href: "/upload",    icon: Upload           },
  { label: "Feedback Review",    href: "/feedback",  icon: FileText         },
  { label: "Approved",           href: "/approved",  icon: CheckSquare      },
  { label: "Settings",           href: "/settings",  icon: Settings         },
];

export default function Sidebar() {
  const pathname = usePathname(); // Current URL path, used to highlight the active link.
  const router   = useRouter();

  const [userName,     setUserName]     = useState("");
  const [userInitials, setUserInitials] = useState("?");

  useEffect(() => {
    // Read the logged-in user's info from localStorage.
    // Must be inside useEffect — localStorage doesn't exist during server rendering.
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setUserName(parsed.name ?? "");
      setUserInitials(parsed.initials ?? "?");
    }
  }, []);

  function handleLogout() {
    localStorage.removeItem(STORAGE_KEY);
    router.push("/login");
  }

  return (
    <aside style={{ width: "240px", minHeight: "100vh", backgroundColor: "#1e293b", display: "flex", flexDirection: "column", flexShrink: 0 }}>

      {/* App name */}
      <div style={{ padding: "24px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <span style={{ fontSize: "18px", fontWeight: "700", color: "#fff", letterSpacing: "-0.3px" }}>FeedbackAI</span>
        <p style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>Lecturer Portal</p>
      </div>

      {/* Navigation links */}
      <nav style={{ flex: 1, padding: "16px 12px" }}>
        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "4px", margin: 0, padding: 0 }}>
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href;
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
                    // Active = white on blue. Inactive = grey on transparent.
                    fontWeight: isActive ? "600" : "400",
                    color: isActive ? "#fff" : "#94a3b8",
                    backgroundColor: isActive ? "#3b82f6" : "transparent",
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

      {/* User info + logout at the bottom */}
      <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Initials avatar */}
          <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "600", color: "#fff", flexShrink: 0 }}>
            {userInitials}
          </div>
          {/* Name — truncated with "…" if it doesn't fit */}
          <p style={{ flex: 1, fontSize: "13px", fontWeight: "500", color: "#f1f5f9", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minWidth: 0 }}>
            {userName || "Loading..."}
          </p>
          {/* Logout button */}
          <button onClick={handleLogout} title="Sign out" style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center", flexShrink: 0 }}>
            <LogOut size={14} color="#64748b" />
          </button>
        </div>
      </div>
    </aside>
  );
}

"use client";

// The sidebar navigation shown on every lecturer page.
// It highlights the current page, shows the logged-in user's name and initials,
// and has a logout button that clears the session and goes back to /login.

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Upload,
  FileText,
  CheckSquare,
  Settings,
  LogOut,
} from "lucide-react";

// The list of pages in the navigation menu.
// Each item has a label (shown in the menu), a path, and an icon component.
const navItems = [
  { label: "Dashboard",          href: "/dashboard", icon: LayoutDashboard },
  { label: "Upload Assignments", href: "/upload",    icon: Upload           },
  { label: "Feedback Review",    href: "/feedback",  icon: FileText         },
  { label: "Approved",           href: "/approved",  icon: CheckSquare      },
  { label: "Settings",           href: "/settings",  icon: Settings         },
];

// The localStorage key — must match useAuthGuard.ts and login/page.tsx.
const STORAGE_KEY = "feedbackai_user";

export default function Sidebar() {
  // usePathname() gives us the current URL path so we can highlight the active link.
  const pathname = usePathname();
  const router   = useRouter();

  // The currently logged-in user's display info.
  // We read this from localStorage inside useEffect (see below).
  const [userName,     setUserName]     = useState("");
  const [userInitials, setUserInitials] = useState("?");

  useEffect(() => {
    // localStorage can only be read in the browser, not during server-side rendering.
    // useEffect only runs in the browser, so it is safe here.
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setUserName(parsed.name ?? "");
      setUserInitials(parsed.initials ?? "?");
    }
  }, []); // Empty array = run once when the sidebar first mounts.

  // Clear the session and go back to the login page.
  function handleLogout() {
    localStorage.removeItem(STORAGE_KEY);
    router.push("/login");
  }

  return (
    <aside
      style={{
        width: "240px",
        minHeight: "100vh",
        backgroundColor: "#1e293b", // Dark navy background.
        display: "flex",
        flexDirection: "column",
        flexShrink: 0, // Don't let the sidebar shrink when the window is narrow.
      }}
    >
      {/* App name and subtitle at the top */}
      <div style={{ padding: "24px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <span style={{ fontSize: "18px", fontWeight: "700", color: "#ffffff", letterSpacing: "-0.3px" }}>
          FeedbackAI
        </span>
        <p style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>
          Lecturer Portal
        </p>
      </div>

      {/* Navigation links — fills the available space between header and footer */}
      <nav style={{ flex: 1, padding: "16px 12px" }}>
        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "4px", margin: 0, padding: 0 }}>
          {navItems.map(({ label, href, icon: Icon }) => {
            // Check if this link matches the current URL.
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
                    // Active link is white text on blue; inactive is grey text on transparent.
                    fontWeight: isActive ? "600" : "400",
                    color: isActive ? "#ffffff" : "#94a3b8",
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

      {/* User info and logout button at the bottom */}
      <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Avatar circle with the user's initials */}
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              backgroundColor: "#3b82f6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "13px",
              fontWeight: "600",
              color: "#fff",
              flexShrink: 0,
            }}
          >
            {userInitials}
          </div>

          {/* User's full name — truncated with "..." if too long for the space */}
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
              {userName || "Loading..."}
            </p>
          </div>

          {/* Logout icon button — clears localStorage and redirects to /login */}
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

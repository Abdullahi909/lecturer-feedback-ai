"use client";

// Login page.
// This page now checks the database through /api/login instead of using hardcoded users.

import { saveStoredUser } from "@/lib/auth";
import type { StoredUser } from "@/lib/types";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Ask the login API route to check the database.
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Incorrect username or password. Please try again.");
        setLoading(false);
        return;
      }

      // Save the user to localStorage so other pages know who is logged in.
      const user: StoredUser = {
        id: data.id,
        name: data.name,
        initials: data.initials,
        role: data.role,
      };

      saveStoredUser(user);

      // Go to the correct page for this role.
      router.push(user.role === "lecturer" ? "/dashboard" : "/student");
    } catch {
      setError("Could not sign in right now. Please check your setup and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "40px", width: "100%", maxWidth: "400px" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#1e293b" }}>FeedbackAI</h1>
          <p style={{ fontSize: "14px", color: "#64748b", marginTop: "4px" }}>Sign in to your account</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label htmlFor="username" style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "#374151", marginBottom: "6px" }}>
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. abdullahi"
              required
              style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px", color: "#1e293b", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label htmlFor="password" style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "#374151", marginBottom: "6px" }}>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px", color: "#1e293b", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          {error && (
            <p style={{ fontSize: "13px", color: "#dc2626", backgroundColor: "#fef2f2", padding: "10px 12px", borderRadius: "8px", border: "1px solid #fecaca" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", padding: "12px", borderRadius: "8px", backgroundColor: loading ? "#94a3b8" : "#1e293b", color: "#fff", fontSize: "14px", fontWeight: "600", border: "none", cursor: loading ? "not-allowed" : "pointer", marginTop: "4px" }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div style={{ marginTop: "24px", backgroundColor: "#f8fafc", borderRadius: "8px", padding: "14px", border: "1px solid #e2e8f0" }}>
          <p style={{ fontSize: "12px", fontWeight: "600", color: "#64748b", marginBottom: "8px" }}>Demo accounts (password: password)</p>
          <p style={{ fontSize: "12px", color: "#94a3b8" }}>Lecturer: <strong style={{ color: "#1e293b" }}>abdullahi</strong></p>
          <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>Student: <strong style={{ color: "#1e293b" }}>abdulali</strong></p>
        </div>
      </div>
    </div>
  );
}

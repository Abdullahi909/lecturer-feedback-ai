"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { StoredUser } from "@/hooks/useAuthGuard";

// Hardcoded users — replace with a real auth provider for production
const USERS: Record<string, { password: string; user: StoredUser }> = {
  abdullahi: {
    password: "password",
    user: { name: "Abdullahi Mohamed", initials: "AM", role: "lecturer" },
  },
  abdulali: {
    password: "password",
    user: { name: "Abdul Ali", initials: "AA", role: "student" },
  },
};

// Shared input and label styles reused across both form fields
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 14px",
  borderRadius: "8px",
  border: "1px solid #d1d5db",
  fontSize: "14px",
  color: "#1e293b",
  outline: "none",
  backgroundColor: "#fff",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "13px",
  fontWeight: "500",
  color: "#374151",
  marginBottom: "6px",
};

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const entry = USERS[username.toLowerCase().trim()];
    if (!entry || entry.password !== password) {
      setError("Incorrect username or password.");
      return;
    }
    localStorage.setItem("feedbackai_user", JSON.stringify(entry.user));
    // Lecturers go to the dashboard; students go to their assignments view
    router.push(entry.user.role === "lecturer" ? "/dashboard" : "/student");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f1f5f9",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          backgroundColor: "#fff",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          padding: "40px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <span style={{ fontSize: "22px", fontWeight: "700", color: "#1e293b", letterSpacing: "-0.3px" }}>
            FeedbackAI
          </span>
          <p style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
            Sign in to your account
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={labelStyle}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(""); }}
              placeholder="abdullahi or abdulali"
              autoComplete="username"
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              placeholder="••••••••"
              autoComplete="current-password"
              required
              style={inputStyle}
            />
          </div>

          {error && (
            <div style={{ padding: "10px 14px", borderRadius: "8px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", fontSize: "13px", color: "#b91c1c" }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            style={{ marginTop: "4px", padding: "12px", borderRadius: "8px", backgroundColor: "#1e293b", color: "#fff", fontSize: "14px", fontWeight: "600", border: "none", cursor: "pointer", width: "100%" }}
          >
            Sign In
          </button>
        </form>

        {/* Demo hint — remove in production */}
        <div style={{ marginTop: "24px", padding: "14px", borderRadius: "8px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
          <p style={{ fontSize: "12px", fontWeight: "600", color: "#64748b", marginBottom: "6px" }}>Demo credentials</p>
          <p style={{ fontSize: "12px", color: "#64748b" }}>
            Lecturer: <strong style={{ color: "#1e293b" }}>abdullahi</strong> / password
          </p>
          <p style={{ fontSize: "12px", color: "#64748b", marginTop: "3px" }}>
            Student: <strong style={{ color: "#1e293b" }}>abdulali</strong> / password
          </p>
        </div>
      </div>
    </div>
  );
}

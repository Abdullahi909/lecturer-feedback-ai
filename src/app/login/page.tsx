"use client";

// This is the login page — the first page anyone sees when they visit the app.
// There are two accounts hardcoded here (no database needed):
//   - Abdullahi Mohamed  →  lecturer  →  goes to /dashboard
//   - Abdul Ali          →  student   →  goes to /student
// On success we save the user to localStorage so all other pages can read it.

import { useState } from "react";
import { useRouter } from "next/navigation";

// The key we use to save the logged-in user in localStorage.
// Must match the key used in useAuthGuard.ts.
const STORAGE_KEY = "feedbackai_user";

// All valid accounts. In a real app these would come from a database.
// The password for both accounts is just "password" for demo purposes.
const USERS: Record<string, { password: string; name: string; initials: string; role: "lecturer" | "student" }> = {
  abdullahi: {
    password: "password",
    name: "Abdullahi Mohamed",
    initials: "AM",
    role: "lecturer",
  },
  abdulali: {
    password: "password",
    name: "Abdul Ali",
    initials: "AA",
    role: "student",
  },
};

export default function LoginPage() {
  // Track what the user is typing in the form fields.
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Show an error message if the login fails.
  const [error, setError] = useState("");

  // Show a spinner on the button while we "process" the login.
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  function handleLogin(e: React.FormEvent) {
    // Stop the form from doing a full page reload (default browser behaviour).
    e.preventDefault();

    setLoading(true);
    setError(""); // Clear any previous error message.

    // Look up the username in our hardcoded list (lowercase so "Abdullahi" works too).
    const account = USERS[username.toLowerCase().trim()];

    // If the username doesn't exist or the password is wrong, show an error.
    if (!account || account.password !== password) {
      setError("Incorrect username or password. Please try again.");
      setLoading(false);
      return;
    }

    // Build the user object we'll store in localStorage.
    const userToSave = {
      name: account.name,
      initials: account.initials,
      role: account.role,
    };

    // Save to localStorage so every other page knows who is logged in.
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userToSave));

    // Send the user to the right place based on their role.
    if (account.role === "lecturer") {
      router.push("/dashboard");
    } else {
      router.push("/student");
    }
  }

  return (
    // Full-screen grey background with the login card centred in the middle.
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
      {/* White login card */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          padding: "40px",
          width: "100%",
          maxWidth: "400px",
        }}
      >
        {/* App name and tagline at the top of the card */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#1e293b" }}>
            FeedbackAI
          </h1>
          <p style={{ fontSize: "14px", color: "#64748b", marginTop: "4px" }}>
            Sign in to your account
          </p>
        </div>

        {/* Login form */}
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Username field */}
          <div>
            <label
              htmlFor="username"
              style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "#374151", marginBottom: "6px" }}
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. abdullahi"
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                fontSize: "14px",
                color: "#1e293b",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Password field */}
          <div>
            <label
              htmlFor="password"
              style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "#374151", marginBottom: "6px" }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                fontSize: "14px",
                color: "#1e293b",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Error message — only shown when login fails */}
          {error && (
            <p style={{ fontSize: "13px", color: "#dc2626", backgroundColor: "#fef2f2", padding: "10px 12px", borderRadius: "8px", border: "1px solid #fecaca" }}>
              {error}
            </p>
          )}

          {/* Submit button — goes grey while loading */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              backgroundColor: loading ? "#94a3b8" : "#1e293b",
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: "600",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              marginTop: "4px",
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Demo credentials hint so anyone testing knows what to type */}
        <div style={{ marginTop: "24px", backgroundColor: "#f8fafc", borderRadius: "8px", padding: "14px", border: "1px solid #e2e8f0" }}>
          <p style={{ fontSize: "12px", fontWeight: "600", color: "#64748b", marginBottom: "8px" }}>
            Demo accounts (password: password)
          </p>
          <p style={{ fontSize: "12px", color: "#94a3b8" }}>
            Lecturer: <strong style={{ color: "#1e293b" }}>abdullahi</strong>
          </p>
          <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
            Student: <strong style={{ color: "#1e293b" }}>abdulali</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

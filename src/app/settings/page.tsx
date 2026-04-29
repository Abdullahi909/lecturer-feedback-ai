"use client";

// Settings page — profile info and notification preferences.
// Settings are saved to localStorage when the lecturer clicks "Save Changes".
// They are loaded back in on the next visit so nothing is lost.

import Sidebar from "@/components/Sidebar";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useState, useEffect } from "react";
import { User, Bell, Check } from "lucide-react";

// Key used to save and load settings from localStorage.
const SETTINGS_KEY = "feedbackai_settings";

// Shared input style used on all text inputs and selects.
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
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

export default function SettingsPage() {
  const { user, loading } = useAuthGuard("lecturer");

  // Which tab is open.
  const [activeTab, setActiveTab] = useState("profile");

  // Show "Changes saved" confirmation for 2.5 seconds after clicking Save.
  const [saved, setSaved] = useState(false);

  // Profile fields.
  const [title,      setTitle]      = useState("Dr.");
  const [firstName,  setFirstName]  = useState("Abdullahi");
  const [lastName,   setLastName]   = useState("Mohamed");
  const [email,      setEmail]      = useState("abdullahi@uni.ac.uk");
  const [department, setDepartment] = useState("Computer Science");

  // Notification toggles.
  const [emailDeadlines,   setEmailDeadlines]   = useState(true);
  const [emailSubmissions, setEmailSubmissions] = useState(false);
  const [emailApprovals,   setEmailApprovals]   = useState(true);
  const [summaryDigest,    setSummaryDigest]    = useState(true);

  // Load any previously saved settings when the page first opens.
  // Must be inside useEffect because localStorage only exists in the browser.
  useEffect(() => {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return;

    const s = JSON.parse(raw);
    if (s.title      !== undefined) setTitle(s.title);
    if (s.firstName  !== undefined) setFirstName(s.firstName);
    if (s.lastName   !== undefined) setLastName(s.lastName);
    if (s.email      !== undefined) setEmail(s.email);
    if (s.department !== undefined) setDepartment(s.department);

    if (s.emailDeadlines   !== undefined) setEmailDeadlines(s.emailDeadlines);
    if (s.emailSubmissions !== undefined) setEmailSubmissions(s.emailSubmissions);
    if (s.emailApprovals   !== undefined) setEmailApprovals(s.emailApprovals);
    if (s.summaryDigest    !== undefined) setSummaryDigest(s.summaryDigest);
  }, []);

  if (loading || !user) return null;

  function handleSave() {
    // Write all current values to localStorage.
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({
      title, firstName, lastName, email, department,
      emailDeadlines, emailSubmissions, emailApprovals, summaryDigest,
    }));

    // Show "Changes saved" then hide it after 2.5 seconds.
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  // Notification toggles data — label, description, current value, setter.
  const notifications = [
    { label: "Deadline reminders",     desc: "Email alerts 48 hours before a feedback deadline.",   value: emailDeadlines,   set: setEmailDeadlines   },
    { label: "New submission alerts",  desc: "Get notified when new student work is uploaded.",      value: emailSubmissions, set: setEmailSubmissions },
    { label: "Approval confirmations", desc: "Confirmation when feedback is sent to a student.",     value: emailApprovals,   set: setEmailApprovals   },
    { label: "Weekly summary digest",  desc: "A weekly overview of pending and completed feedback.", value: summaryDigest,    set: setSummaryDigest    },
  ];

  // Shared style for the tab buttons — slightly different when active.
  function tabStyle(id: string): React.CSSProperties {
    const isActive = activeTab === id;
    return {
      width: "100%",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "10px 12px",
      borderRadius: "8px",
      border: "none",
      backgroundColor: isActive ? "#eff6ff" : "transparent",
      color: isActive ? "#2563eb" : "#64748b",
      fontSize: "14px",
      fontWeight: isActive ? "600" : "400",
      cursor: "pointer",
      textAlign: "left" as const,
      marginBottom: "2px",
    };
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />

      <main style={{ flex: 1, padding: "32px", overflowY: "auto" }}>
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#1e293b" }}>Settings</h1>
          <p style={{ fontSize: "14px", color: "#64748b", marginTop: "4px" }}>
            Manage your profile and notification preferences.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: "24px", alignItems: "start" }}>

          {/* Tab sidebar */}
          <div style={{ backgroundColor: "#fff", borderRadius: "10px", border: "1px solid #e2e8f0", padding: "8px" }}>
            <button style={tabStyle("profile")} onClick={() => setActiveTab("profile")}>
              <User size={15} /> Profile
            </button>
            <button style={tabStyle("notifications")} onClick={() => setActiveTab("notifications")}>
              <Bell size={15} /> Notifications
            </button>
          </div>

          {/* Tab content */}
          <div style={{ backgroundColor: "#fff", borderRadius: "10px", border: "1px solid #e2e8f0", padding: "28px" }}>

            {/* PROFILE TAB */}
            {activeTab === "profile" && (
              <div>
                <h2 style={{ fontSize: "15px", fontWeight: "600", color: "#1e293b", marginBottom: "24px" }}>Profile Information</h2>

                {/* Avatar preview */}
                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px", paddingBottom: "24px", borderBottom: "1px solid #f1f5f9" }}>
                  <div style={{ width: "52px", height: "52px", borderRadius: "50%", backgroundColor: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: "700", color: "#fff", flexShrink: 0 }}>
                    {user.initials}
                  </div>
                  <div>
                    {/* Updates live as fields are edited */}
                    <p style={{ fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>{title} {firstName} {lastName}</p>
                    <p style={{ fontSize: "13px", color: "#64748b", marginTop: "2px" }}>{department}</p>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "90px 1fr 1fr", gap: "16px" }}>
                    <div>
                      <label style={labelStyle}>Title</label>
                      <select value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle}>
                        <option>Dr.</option>
                        <option>Prof.</option>
                        <option>Mr.</option>
                        <option>Ms.</option>
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>First Name</label>
                      <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Last Name</label>
                      <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} style={inputStyle} />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div>
                      <label style={labelStyle}>Email Address</label>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Department</label>
                      <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} style={inputStyle} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === "notifications" && (
              <div>
                <h2 style={{ fontSize: "15px", fontWeight: "600", color: "#1e293b", marginBottom: "24px" }}>Notification Preferences</h2>

                {notifications.map(({ label, desc, value, set }, index) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "16px 0",
                      borderBottom: index < notifications.length - 1 ? "1px solid #f1f5f9" : "none",
                      gap: "24px",
                    }}
                  >
                    <div>
                      <p style={{ fontSize: "14px", fontWeight: "500", color: "#1e293b" }}>{label}</p>
                      <p style={{ fontSize: "13px", color: "#64748b", marginTop: "3px" }}>{desc}</p>
                    </div>

                    {/* Toggle switch — blue = on, grey = off */}
                    <button
                      onClick={() => set(!value)}
                      aria-label={`Toggle ${label}`}
                      style={{ width: "44px", height: "24px", borderRadius: "12px", backgroundColor: value ? "#3b82f6" : "#e2e8f0", border: "none", cursor: "pointer", position: "relative", flexShrink: 0, transition: "background-color 0.2s ease" }}
                    >
                      {/* Knob slides left/right based on the value */}
                      <span style={{ position: "absolute", top: "3px", left: value ? "23px" : "3px", width: "18px", height: "18px", borderRadius: "50%", backgroundColor: "#fff", transition: "left 0.2s ease", display: "block", boxShadow: "0 1px 3px rgba(0,0,0,0.15)" }} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Save button */}
            <div style={{ marginTop: "28px", paddingTop: "20px", borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "12px" }}>
              {saved && (
                <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#16a34a", fontWeight: "500" }}>
                  <Check size={14} /> Changes saved
                </span>
              )}
              <button onClick={handleSave} style={{ padding: "10px 24px", borderRadius: "8px", backgroundColor: "#1e293b", color: "#fff", fontSize: "14px", fontWeight: "600", border: "none", cursor: "pointer" }}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

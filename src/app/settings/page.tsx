"use client";

// Settings page — lets the lecturer update their profile info and notification preferences.
//
// The settings are saved to localStorage when the lecturer clicks "Save Changes".
// On the next visit, the saved values are loaded back in so nothing is lost.
// (Without a database this is the best we can do — data is per-browser, per-device.)

import Sidebar from "@/components/Sidebar";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useState, useEffect } from "react";
import { User, Bell, Check } from "lucide-react";

// The two tabs on the settings page.
type Tab = "profile" | "notifications";

// The key we use to save/load settings from localStorage.
const SETTINGS_KEY = "feedbackai_settings";

// Shared style for text inputs and selects — keeps them consistent.
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

// Shared style for form labels.
const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "13px",
  fontWeight: "500",
  color: "#374151",
  marginBottom: "6px",
};

export default function SettingsPage() {
  // Only lecturers can view this page.
  const { user, loading } = useAuthGuard("lecturer");

  // Which tab is currently shown: "profile" or "notifications".
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  // Show a "Changes saved" message for a couple of seconds after saving.
  const [saved, setSaved] = useState(false);

  // Profile field states — start with Abdullahi's details as sensible defaults.
  const [title,      setTitle]      = useState("Dr.");
  const [firstName,  setFirstName]  = useState("Abdullahi");
  const [lastName,   setLastName]   = useState("Mohamed");
  const [email,      setEmail]      = useState("abdullahi@uni.ac.uk");
  const [department, setDepartment] = useState("Computer Science");

  // Notification toggle states — default settings for a new account.
  const [emailDeadlines,   setEmailDeadlines]   = useState(true);
  const [emailSubmissions, setEmailSubmissions] = useState(false);
  const [emailApprovals,   setEmailApprovals]   = useState(true);
  const [summaryDigest,    setSummaryDigest]    = useState(true);

  // Load any previously saved settings from localStorage when the page first mounts.
  // We do this inside useEffect because localStorage doesn't exist on the server.
  useEffect(() => {
    const savedData = localStorage.getItem(SETTINGS_KEY);
    if (!savedData) return; // No saved settings yet — keep the defaults above.

    const s = JSON.parse(savedData);

    // Only update fields that are actually present in the saved data.
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

  // Don't render until auth check is done.
  if (loading || !user) return null;

  // Save all current settings to localStorage and show the confirmation message.
  function handleSave() {
    const settingsToSave = {
      title, firstName, lastName, email, department,
      emailDeadlines, emailSubmissions, emailApprovals, summaryDigest,
    };

    // Write to localStorage — will be read back next time the page loads.
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settingsToSave));

    // Show the "Changes saved" banner for 2.5 seconds then hide it.
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  // All four notification toggles in one list so we can render them in a loop.
  const notificationItems = [
    { label: "Deadline reminders",     description: "Email alerts 48 hours before a feedback deadline.",   value: emailDeadlines,   set: setEmailDeadlines   },
    { label: "New submission alerts",  description: "Get notified when new student work is uploaded.",      value: emailSubmissions, set: setEmailSubmissions },
    { label: "Approval confirmations", description: "Confirmation when feedback is sent to a student.",     value: emailApprovals,   set: setEmailApprovals   },
    { label: "Weekly summary digest",  description: "A weekly overview of pending and completed feedback.", value: summaryDigest,    set: setSummaryDigest    },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />

      <main style={{ flex: 1, padding: "32px", overflowY: "auto" }}>

        {/* Page title */}
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#1e293b" }}>Settings</h1>
          <p style={{ fontSize: "14px", color: "#64748b", marginTop: "4px" }}>
            Manage your profile and notification preferences.
          </p>
        </div>

        {/* Two-column layout: tab buttons on the left, tab content on the right */}
        <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: "24px", alignItems: "start" }}>

          {/* LEFT — vertical tab buttons */}
          <div style={{ backgroundColor: "#fff", borderRadius: "10px", border: "1px solid #e2e8f0", padding: "8px" }}>
            {[
              { id: "profile" as Tab,       label: "Profile",       Icon: User },
              { id: "notifications" as Tab, label: "Notifications", Icon: Bell },
            ].map(({ id, label, Icon }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "none",
                    // Highlight the active tab with a blue tint.
                    backgroundColor: isActive ? "#eff6ff" : "transparent",
                    color: isActive ? "#2563eb" : "#64748b",
                    fontSize: "14px",
                    fontWeight: isActive ? "600" : "400",
                    cursor: "pointer",
                    textAlign: "left",
                    marginBottom: "2px",
                  }}
                >
                  <Icon size={15} />
                  {label}
                </button>
              );
            })}
          </div>

          {/* RIGHT — tab content panel */}
          <div style={{ backgroundColor: "#fff", borderRadius: "10px", border: "1px solid #e2e8f0", padding: "28px" }}>

            {/* PROFILE TAB */}
            {activeTab === "profile" && (
              <div>
                <h2 style={{ fontSize: "15px", fontWeight: "600", color: "#1e293b", marginBottom: "24px" }}>
                  Profile Information
                </h2>

                {/* Avatar preview — updates live as the name fields change */}
                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px", paddingBottom: "24px", borderBottom: "1px solid #f1f5f9" }}>
                  <div style={{ width: "52px", height: "52px", borderRadius: "50%", backgroundColor: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: "700", color: "#fff", flexShrink: 0 }}>
                    {user.initials}
                  </div>
                  <div>
                    {/* Live preview of the full name as it's typed */}
                    <p style={{ fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>{title} {firstName} {lastName}</p>
                    <p style={{ fontSize: "13px", color: "#64748b", marginTop: "2px" }}>{department}</p>
                  </div>
                </div>

                {/* Profile form fields */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {/* Title, First Name, Last Name on one row */}
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

                  {/* Email and Department on one row */}
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
                <h2 style={{ fontSize: "15px", fontWeight: "600", color: "#1e293b", marginBottom: "24px" }}>
                  Notification Preferences
                </h2>

                {notificationItems.map(({ label, description, value, set }, index) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "16px 0",
                      // Border between items but not after the last one.
                      borderBottom: index < notificationItems.length - 1 ? "1px solid #f1f5f9" : "none",
                      gap: "24px",
                    }}
                  >
                    {/* Label and description */}
                    <div>
                      <p style={{ fontSize: "14px", fontWeight: "500", color: "#1e293b" }}>{label}</p>
                      <p style={{ fontSize: "13px", color: "#64748b", marginTop: "3px" }}>{description}</p>
                    </div>

                    {/* Toggle switch — blue when on, grey when off.
                        The knob moves left/right by changing its CSS "left" value. */}
                    <button
                      onClick={() => set(!value)}
                      aria-label={`Toggle ${label}`}
                      style={{
                        width: "44px",
                        height: "24px",
                        borderRadius: "12px",
                        backgroundColor: value ? "#3b82f6" : "#e2e8f0",
                        border: "none",
                        cursor: "pointer",
                        position: "relative",
                        flexShrink: 0,
                        transition: "background-color 0.2s ease",
                      }}
                    >
                      <span
                        style={{
                          position: "absolute",
                          top: "3px",
                          left: value ? "23px" : "3px",
                          width: "18px",
                          height: "18px",
                          borderRadius: "50%",
                          backgroundColor: "#fff",
                          transition: "left 0.2s ease",
                          display: "block",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                        }}
                      />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Save button row at the bottom of the panel */}
            <div style={{ marginTop: "28px", paddingTop: "20px", borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "12px" }}>
              {/* "Changes saved" confirmation — visible for 2.5 seconds after clicking Save */}
              {saved && (
                <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#16a34a", fontWeight: "500" }}>
                  <Check size={14} /> Changes saved
                </span>
              )}
              <button
                onClick={handleSave}
                style={{ padding: "10px 24px", borderRadius: "8px", backgroundColor: "#1e293b", color: "#fff", fontSize: "14px", fontWeight: "600", border: "none", cursor: "pointer" }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

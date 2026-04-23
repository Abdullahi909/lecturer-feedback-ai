"use client";

import Sidebar from "@/components/Sidebar";
import { useState } from "react";
import { User, Bell, Sliders, Check } from "lucide-react";

type Tab = "profile" | "feedback" | "notifications";

const tabs: { id: Tab; label: string; icon: typeof User }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "feedback", label: "Feedback Defaults", icon: Sliders },
  { id: "notifications", label: "Notifications", icon: Bell },
];

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
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [saved, setSaved] = useState(false);

  // Profile
  const [title, setTitle] = useState("Dr.");
  const [firstName, setFirstName] = useState("Sarah");
  const [lastName, setLastName] = useState("Mitchell");
  const [email, setEmail] = useState("s.mitchell@university.ac.uk");
  const [department, setDepartment] = useState("Computer Science");

  // Feedback prefs
  const [defaultTone, setDefaultTone] = useState("Constructive");
  const [wordLimit, setWordLimit] = useState("300");
  const [includeGrade, setIncludeGrade] = useState(true);
  const [includeStrengths, setIncludeStrengths] = useState(true);
  const [includeImprovements, setIncludeImprovements] = useState(true);

  // Notifications
  const [emailDeadlines, setEmailDeadlines] = useState(true);
  const [emailSubmissions, setEmailSubmissions] = useState(false);
  const [emailApprovals, setEmailApprovals] = useState(true);
  const [summaryDigest, setSummaryDigest] = useState(true);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const notificationItems = [
    {
      label: "Deadline reminders",
      description: "Receive email alerts 48 hours before a feedback deadline.",
      value: emailDeadlines,
      set: setEmailDeadlines,
    },
    {
      label: "New submission alerts",
      description: "Get notified when new student work is uploaded to the system.",
      value: emailSubmissions,
      set: setEmailSubmissions,
    },
    {
      label: "Approval confirmations",
      description: "Receive confirmation when feedback is successfully sent to a student.",
      value: emailApprovals,
      set: setEmailApprovals,
    },
    {
      label: "Weekly summary digest",
      description: "A weekly overview of pending feedback, completions, and upcoming deadlines.",
      value: summaryDigest,
      set: setSummaryDigest,
    },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />

      <main style={{ flex: 1, padding: "32px", overflowY: "auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#1e293b" }}>Settings</h1>
          <p style={{ fontSize: "14px", color: "#64748b", marginTop: "4px" }}>
            Manage your profile, feedback preferences and notification settings.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: "24px", alignItems: "start" }}>
          {/* Tab nav */}
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "10px",
              border: "1px solid #e2e8f0",
              padding: "8px",
            }}
          >
            {tabs.map(({ id, label, icon: Icon }) => {
              const active = activeTab === id;
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
                    backgroundColor: active ? "#eff6ff" : "transparent",
                    color: active ? "#2563eb" : "#64748b",
                    fontSize: "14px",
                    fontWeight: active ? "600" : "400",
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

          {/* Content panel */}
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "10px",
              border: "1px solid #e2e8f0",
              padding: "28px",
            }}
          >
            {/* Profile tab */}
            {activeTab === "profile" && (
              <div>
                <h2 style={{ fontSize: "15px", fontWeight: "600", color: "#1e293b", marginBottom: "24px" }}>
                  Profile Information
                </h2>

                {/* Avatar row */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    marginBottom: "24px",
                    paddingBottom: "24px",
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  <div
                    style={{
                      width: "56px",
                      height: "56px",
                      borderRadius: "50%",
                      backgroundColor: "#3b82f6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "18px",
                      fontWeight: "700",
                      color: "#fff",
                      flexShrink: 0,
                    }}
                  >
                    SM
                  </div>
                  <div>
                    <p style={{ fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>
                      {title} {firstName} {lastName}
                    </p>
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
                        <option>Mrs.</option>
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>First Name</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Last Name</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div>
                      <label style={labelStyle}>Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Department</label>
                      <input
                        type="text"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        style={inputStyle}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Feedback defaults tab */}
            {activeTab === "feedback" && (
              <div>
                <h2 style={{ fontSize: "15px", fontWeight: "600", color: "#1e293b", marginBottom: "24px" }}>
                  Feedback Generation Defaults
                </h2>

                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div>
                      <label style={labelStyle}>Default Tone</label>
                      <select
                        value={defaultTone}
                        onChange={(e) => setDefaultTone(e.target.value)}
                        style={inputStyle}
                      >
                        <option>Constructive</option>
                        <option>Direct</option>
                        <option>Encouraging</option>
                        <option>Formal</option>
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Word Limit (per feedback)</label>
                      <input
                        type="number"
                        value={wordLimit}
                        onChange={(e) => setWordLimit(e.target.value)}
                        min="100"
                        max="1000"
                        step="50"
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ ...labelStyle, marginBottom: "12px" }}>Include in Feedback</label>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {[
                        { label: "Grade suggestion", value: includeGrade, set: setIncludeGrade },
                        { label: "Strengths section", value: includeStrengths, set: setIncludeStrengths },
                        { label: "Areas for improvement", value: includeImprovements, set: setIncludeImprovements },
                      ].map(({ label, value, set }) => (
                        <label
                          key={label}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            cursor: "pointer",
                            fontSize: "14px",
                            color: "#374151",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => set(e.target.checked)}
                            style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "#3b82f6" }}
                          />
                          {label}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications tab */}
            {activeTab === "notifications" && (
              <div>
                <h2 style={{ fontSize: "15px", fontWeight: "600", color: "#1e293b", marginBottom: "24px" }}>
                  Notification Preferences
                </h2>

                <div>
                  {notificationItems.map(({ label, description, value, set }, i) => (
                    <div
                      key={label}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "16px 0",
                        borderBottom: i < notificationItems.length - 1 ? "1px solid #f1f5f9" : "none",
                        gap: "24px",
                      }}
                    >
                      <div>
                        <p style={{ fontSize: "14px", fontWeight: "500", color: "#1e293b" }}>{label}</p>
                        <p style={{ fontSize: "13px", color: "#64748b", marginTop: "3px" }}>{description}</p>
                      </div>
                      {/* Toggle switch */}
                      <button
                        onClick={() => set(!value)}
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
                        aria-label={`Toggle ${label}`}
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
              </div>
            )}

            {/* Save row */}
            <div
              style={{
                marginTop: "28px",
                paddingTop: "20px",
                borderTop: "1px solid #f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: "12px",
              }}
            >
              {saved && (
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "13px",
                    color: "#16a34a",
                    fontWeight: "500",
                  }}
                >
                  <Check size={14} />
                  Changes saved
                </span>
              )}
              <button
                onClick={handleSave}
                style={{
                  padding: "10px 24px",
                  borderRadius: "8px",
                  backgroundColor: "#1e293b",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: "600",
                  border: "none",
                  cursor: "pointer",
                }}
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

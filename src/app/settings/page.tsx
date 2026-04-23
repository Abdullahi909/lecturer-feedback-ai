"use client";

import Sidebar from "@/components/Sidebar";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useState } from "react";
import { User, Bell, Check } from "lucide-react";

type Tab = "profile" | "notifications";

const tabs: { id: Tab; label: string; icon: typeof User }[] = [
  { id: "profile", label: "Profile", icon: User },
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
  const { user, loading } = useAuthGuard("lecturer");
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [saved, setSaved] = useState(false);

  const [title, setTitle] = useState("Dr.");
  const [firstName, setFirstName] = useState("Abdullahi");
  const [lastName, setLastName] = useState("Mohamed");
  const [email, setEmail] = useState("abdullahi@uni.ac.uk");
  const [department, setDepartment] = useState("Computer Science");

  const [emailDeadlines, setEmailDeadlines] = useState(true);
  const [emailSubmissions, setEmailSubmissions] = useState(false);
  const [emailApprovals, setEmailApprovals] = useState(true);
  const [summaryDigest, setSummaryDigest] = useState(true);

  if (loading || !user) return null;

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const notificationItems = [
    { label: "Deadline reminders", description: "Email alerts 48 hours before a feedback deadline.", value: emailDeadlines, set: setEmailDeadlines },
    { label: "New submission alerts", description: "Get notified when new student work is uploaded.", value: emailSubmissions, set: setEmailSubmissions },
    { label: "Approval confirmations", description: "Confirmation when feedback is sent to a student.", value: emailApprovals, set: setEmailApprovals },
    { label: "Weekly summary digest", description: "A weekly overview of pending and completed feedback.", value: summaryDigest, set: setSummaryDigest },
  ];

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
          {/* Tab nav */}
          <div style={{ backgroundColor: "#fff", borderRadius: "10px", border: "1px solid #e2e8f0", padding: "8px" }}>
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

          {/* Content */}
          <div style={{ backgroundColor: "#fff", borderRadius: "10px", border: "1px solid #e2e8f0", padding: "28px" }}>
            {activeTab === "profile" && (
              <div>
                <h2 style={{ fontSize: "15px", fontWeight: "600", color: "#1e293b", marginBottom: "24px" }}>
                  Profile Information
                </h2>

                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px", paddingBottom: "24px", borderBottom: "1px solid #f1f5f9" }}>
                  <div style={{ width: "52px", height: "52px", borderRadius: "50%", backgroundColor: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: "700", color: "#fff", flexShrink: 0 }}>
                    {user.initials}
                  </div>
                  <div>
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

            {activeTab === "notifications" && (
              <div>
                <h2 style={{ fontSize: "15px", fontWeight: "600", color: "#1e293b", marginBottom: "24px" }}>
                  Notification Preferences
                </h2>
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
                    <button
                      onClick={() => set(!value)}
                      aria-label={`Toggle ${label}`}
                      style={{
                        width: "44px", height: "24px", borderRadius: "12px",
                        backgroundColor: value ? "#3b82f6" : "#e2e8f0",
                        border: "none", cursor: "pointer",
                        position: "relative", flexShrink: 0,
                        transition: "background-color 0.2s ease",
                      }}
                    >
                      <span style={{ position: "absolute", top: "3px", left: value ? "23px" : "3px", width: "18px", height: "18px", borderRadius: "50%", backgroundColor: "#fff", transition: "left 0.2s ease", display: "block", boxShadow: "0 1px 3px rgba(0,0,0,0.15)" }} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: "28px", paddingTop: "20px", borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "12px" }}>
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

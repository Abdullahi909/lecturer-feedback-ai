"use client";

import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useRouter } from "next/navigation";
import { LogOut, BookOpen, CheckCircle, Clock } from "lucide-react";

// Abdul Ali's submissions — in production this would be fetched from a database
const submissions = [
  {
    id: 1,
    module: "CS201",
    assignment: "Essay 1 — Critical Analysis",
    submittedDate: "12 Mar 2026",
    // "as const" narrows the type to the literal so TypeScript can narrow on s.status
    status: "approved" as const,
    grade: "B+",
    feedback: `Your essay demonstrates solid critical thinking and a clear analytical voice throughout. The central argument is well-structured and supported consistently across all three sections, and your engagement with the secondary literature — drawing on 11 well-chosen sources — is commendable.\n\nThe analysis goes beyond summary in most sections, offering genuine evaluative commentary. However, the middle section occasionally lapses into paraphrase rather than critique; strengthening the analytical thread here would elevate the work further.\n\nStructure and writing flow are strong, and the conclusion is particularly effective, offering a nuanced synthesis that revisits the thesis with added depth.\n\nThis is a well-crafted submission. Focus your revision on deepening the analytical engagement in section two and ensuring all citations include page references where required.`,
  },
  {
    id: 2,
    module: "CS310",
    assignment: "Lab Report 2",
    submittedDate: "10 Mar 2026",
    status: "pending" as const,
    grade: null,
    feedback: null,
  },
];

export default function StudentPage() {
  const { user, loading } = useAuthGuard("student");
  const router = useRouter();

  function logout() {
    localStorage.removeItem("feedbackai_user");
    router.push("/login");
  }

  // Render nothing while the auth check is in flight to prevent a content flash
  if (loading || !user) return null;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f1f5f9" }}>
      {/* Top bar — replaces the lecturer Sidebar for the student layout */}
      <header
        style={{
          backgroundColor: "#1e293b",
          padding: "0 32px",
          height: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: "17px", fontWeight: "700", color: "#fff", letterSpacing: "-0.3px" }}>
          FeedbackAI
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                backgroundColor: "#3b82f6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                fontWeight: "700",
                color: "#fff",
              }}
            >
              {user.initials}
            </div>
            <span style={{ fontSize: "14px", color: "#f1f5f9", fontWeight: "500" }}>
              {user.name}
            </span>
          </div>
          <button
            onClick={logout}
            title="Sign out"
            style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center" }}
          >
            <LogOut size={16} color="#94a3b8" />
          </button>
        </div>
      </header>

      <main style={{ maxWidth: "760px", margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#1e293b" }}>My Assignments</h1>
          <p style={{ fontSize: "14px", color: "#64748b", marginTop: "4px" }}>
            View your submitted work and feedback from your lecturer.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {submissions.map((s) => (
            <div
              key={s.id}
              style={{ backgroundColor: "#fff", borderRadius: "10px", border: "1px solid #e2e8f0", overflow: "hidden" }}
            >
              {/* Card header — border-bottom only when a feedback body follows */}
              <div
                style={{
                  padding: "18px 24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderBottom: s.status === "approved" ? "1px solid #f1f5f9" : "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      width: "38px",
                      height: "38px",
                      borderRadius: "8px",
                      backgroundColor: "#eff6ff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <BookOpen size={18} color="#3b82f6" />
                  </div>
                  <div>
                    <p style={{ fontSize: "15px", fontWeight: "600", color: "#1e293b" }}>{s.assignment}</p>
                    <p style={{ fontSize: "13px", color: "#64748b", marginTop: "2px" }}>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: "600",
                          color: "#3b82f6",
                          backgroundColor: "#eff6ff",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          marginRight: "6px",
                        }}
                      >
                        {s.module}
                      </span>
                      Submitted {s.submittedDate}
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  {s.grade && (
                    <span
                      style={{
                        fontSize: "18px",
                        fontWeight: "700",
                        color: "#1e293b",
                        backgroundColor: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        padding: "4px 14px",
                        borderRadius: "8px",
                      }}
                    >
                      {s.grade}
                    </span>
                  )}
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: "500",
                      color: s.status === "approved" ? "#16a34a" : "#d97706",
                      backgroundColor: s.status === "approved" ? "#dcfce7" : "#fef3c7",
                      padding: "4px 12px",
                      borderRadius: "20px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    {s.status === "approved" ? <CheckCircle size={12} /> : <Clock size={12} />}
                    {s.status === "approved" ? "Feedback Ready" : "Awaiting Review"}
                  </span>
                </div>
              </div>

              {/* Approved feedback body */}
              {s.feedback && (
                <div style={{ padding: "20px 24px" }}>
                  <p style={{ fontSize: "11px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px" }}>
                    Lecturer Feedback
                  </p>
                  <p style={{ fontSize: "14px", color: "#374151", lineHeight: "1.75", whiteSpace: "pre-line" }}>
                    {s.feedback}
                  </p>
                </div>
              )}

              {/* Holding message while the lecturer is still reviewing */}
              {s.status === "pending" && (
                <div style={{ padding: "14px 24px", backgroundColor: "#fffbeb", borderTop: "1px solid #fef3c7", fontSize: "13px", color: "#92400e" }}>
                  Your submission is being reviewed. Feedback will appear here once approved by your lecturer.
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

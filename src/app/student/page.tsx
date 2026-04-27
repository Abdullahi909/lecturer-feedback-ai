"use client";

// This is the student view — what Abdul Ali sees when he logs in.
// It shows his submitted assignments and any feedback the lecturer has approved.
// Students cannot access the lecturer pages (the auth guard redirects them away).

import { useAuthGuard } from "@/hooks/useAuthGuard";
import { CheckCircle, Clock, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

// The localStorage key — must match the one in useAuthGuard.ts and login/page.tsx.
const STORAGE_KEY = "feedbackai_user";

// Abdul Ali's two submissions. In a real app these would come from a database.
// "approved" means the lecturer has reviewed and sent the feedback.
// "pending" means the lecturer hasn't approved it yet.
const submissions = [
  {
    id: 1,
    module: "CS201",
    assignment: "Essay 1 — Critical Analysis",
    submittedDate: "12 Mar 2026",
    grade: "B+",
    status: "approved" as const,
    // This is the feedback the lecturer approved and sent to the student.
    feedback:
      "You demonstrate strong analytical capabilities throughout this essay. Your critical examination of distributed systems theory is well-grounded in cited literature, particularly in sections two and three.\n\nYour argument structure is coherent and logical, with each paragraph building meaningfully on the previous. The conclusion could be more developed — a stronger closing would really tie the work together.\n\nUse of sources is good overall. Two citations in section four lack page references — please check your referencing guide. Originality is evident in your comparative framework, which offers a fresh perspective.\n\nOverall a solid submission. Focus on stronger conclusions and accurate citations for your next piece.",
  },
  {
    id: 2,
    module: "CS310",
    assignment: "Lab Report 2",
    submittedDate: "14 Mar 2026",
    grade: null, // No grade yet — lecturer hasn't approved feedback.
    status: "pending" as const,
    feedback: null, // No feedback yet.
  },
];

export default function StudentPage() {
  // Only students can view this page. Lecturers get redirected to /dashboard.
  const { user, loading } = useAuthGuard("student");

  const router = useRouter();

  // Clear localStorage and send the user back to the login page.
  function handleLogout() {
    localStorage.removeItem(STORAGE_KEY);
    router.push("/login");
  }

  // Show nothing while we check if the user is logged in.
  // This prevents a flash of the page before the redirect happens.
  if (loading || !user) return null;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f1f5f9" }}>

      {/* Top navigation bar — students don't have a sidebar, just a simple top bar */}
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
        {/* App name on the left */}
        <span style={{ fontSize: "16px", fontWeight: "700", color: "#ffffff" }}>
          FeedbackAI
        </span>

        {/* User info + logout button on the right */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {/* Avatar circle with the student's initials */}
          <div
            style={{
              width: "32px",
              height: "32px",
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

          {/* Student's name */}
          <span style={{ fontSize: "13px", color: "#f1f5f9", fontWeight: "500" }}>
            {user.name}
          </span>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              borderRadius: "6px",
              backgroundColor: "transparent",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "#94a3b8",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            <LogOut size={13} />
            Sign out
          </button>
        </div>
      </header>

      {/* Main content area */}
      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 24px" }}>

        {/* Page heading */}
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#1e293b" }}>
            My Feedback
          </h1>
          <p style={{ fontSize: "14px", color: "#64748b", marginTop: "4px" }}>
            View feedback from your lecturer on submitted assignments.
          </p>
        </div>

        {/* List of submissions — one card per assignment */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {submissions.map((sub) => (
            <div
              key={sub.id}
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "10px",
                border: "1px solid #e2e8f0",
                overflow: "hidden",
              }}
            >
              {/* Card header — module code, assignment name, date, and status badge */}
              <div
                style={{
                  padding: "18px 20px",
                  borderBottom: sub.status === "approved" ? "1px solid #f1f5f9" : "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "16px",
                }}
              >
                <div>
                  {/* Module code pill */}
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: "600",
                      color: "#3b82f6",
                      backgroundColor: "#eff6ff",
                      padding: "2px 8px",
                      borderRadius: "4px",
                    }}
                  >
                    {sub.module}
                  </span>

                  {/* Assignment name and submitted date */}
                  <p style={{ fontSize: "15px", fontWeight: "600", color: "#1e293b", marginTop: "8px" }}>
                    {sub.assignment}
                  </p>
                  <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "3px" }}>
                    Submitted {sub.submittedDate}
                  </p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
                  {/* Grade badge — only shown when feedback is approved */}
                  {sub.grade && (
                    <span
                      style={{
                        fontSize: "20px",
                        fontWeight: "700",
                        color: "#1e293b",
                        backgroundColor: "#f1f5f9",
                        padding: "4px 14px",
                        borderRadius: "8px",
                      }}
                    >
                      {sub.grade}
                    </span>
                  )}

                  {/* Status badge — green tick for approved, yellow clock for pending */}
                  {sub.status === "approved" ? (
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        fontSize: "12px",
                        fontWeight: "500",
                        color: "#16a34a",
                        backgroundColor: "#dcfce7",
                        padding: "4px 10px",
                        borderRadius: "20px",
                      }}
                    >
                      <CheckCircle size={12} />
                      Feedback ready
                    </span>
                  ) : (
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        fontSize: "12px",
                        fontWeight: "500",
                        color: "#d97706",
                        backgroundColor: "#fef3c7",
                        padding: "4px 10px",
                        borderRadius: "20px",
                      }}
                    >
                      <Clock size={12} />
                      Awaiting feedback
                    </span>
                  )}
                </div>
              </div>

              {/* Feedback body — only shown for approved submissions */}
              {sub.status === "approved" && sub.feedback && (
                <div style={{ padding: "20px" }}>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "#374151",
                      lineHeight: "1.75",
                      whiteSpace: "pre-line", // Keeps the line breaks in the feedback text.
                    }}
                  >
                    {sub.feedback}
                  </p>
                </div>
              )}

              {/* Pending message — shown instead of feedback while it's not ready yet */}
              {sub.status === "pending" && (
                <div
                  style={{
                    padding: "20px",
                    backgroundColor: "#fffbeb",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <Clock size={15} color="#d97706" />
                  <p style={{ fontSize: "13px", color: "#92400e" }}>
                    Your lecturer is reviewing this submission. Feedback will appear here once it has been approved.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

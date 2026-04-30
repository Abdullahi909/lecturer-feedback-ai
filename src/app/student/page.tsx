"use client";

// Student page.
// This now reads the logged-in student's real submissions from Supabase.

import { useAuthGuard } from "@/hooks/useAuthGuard";
import { clearStoredUser } from "@/lib/auth";
import { formatGradeDisplay } from "@/lib/grading";
import { fetchStudentSubmissionDetails } from "@/lib/supabase";
import type { SubmissionWithDetails } from "@/lib/types";
import { CheckCircle, Clock, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Turn a database date into a nicer UI date.
function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function StudentPage() {
  const { user, loading } = useAuthGuard("student");
  const router = useRouter();
  const [submissions, setSubmissions] = useState<SubmissionWithDetails[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    if (!user) {
      return;
    }

    const studentId = user.id;

    // Load this student's submissions from Supabase.
    async function loadSubmissions() {
      try {
        const items = await fetchStudentSubmissionDetails(studentId);
        setSubmissions(items);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Could not load submissions.";
        setPageError(message);
      } finally {
        setPageLoading(false);
      }
    }

    loadSubmissions();
  }, [user]);

  function handleLogout() {
    clearStoredUser();
    router.push("/login");
  }

  if (loading || !user) return null;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f1f5f9" }}>
      <header style={{ backgroundColor: "#1e293b", padding: "0 32px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "16px", fontWeight: "700", color: "#fff" }}>FeedbackAI</span>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700", color: "#fff" }}>
            {user.initials}
          </div>
          <span style={{ fontSize: "13px", color: "#f1f5f9", fontWeight: "500" }}>{user.name}</span>
          <button
            onClick={handleLogout}
            style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "6px", backgroundColor: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: "#94a3b8", fontSize: "13px", cursor: "pointer" }}
          >
            <LogOut size={13} /> Sign out
          </button>
        </div>
      </header>

      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#1e293b" }}>My Feedback</h1>
          <p style={{ fontSize: "14px", color: "#64748b", marginTop: "4px" }}>
            View feedback from your lecturer on submitted assignments.
          </p>
        </div>

        {pageLoading && (
          <div style={{ backgroundColor: "#fff", borderRadius: "10px", border: "1px solid #e2e8f0", padding: "20px", fontSize: "14px", color: "#475569", marginBottom: "16px" }}>
            Loading your submissions...
          </div>
        )}

        {pageError && (
          <div style={{ backgroundColor: "#fef2f2", borderRadius: "10px", border: "1px solid #fecaca", padding: "20px", fontSize: "14px", color: "#b91c1c", marginBottom: "16px" }}>
            {pageError}
          </div>
        )}

        {!pageLoading && !pageError && submissions.length === 0 && (
          <div style={{ backgroundColor: "#fff", borderRadius: "10px", border: "1px solid #e2e8f0", padding: "20px", fontSize: "14px", color: "#475569" }}>
            No submissions found yet.
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {submissions.map((submission) => (
            <div key={submission.id} style={{ backgroundColor: "#fff", borderRadius: "10px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
              <div style={{ padding: "18px 20px", borderBottom: submission.status === "approved" ? "1px solid #f1f5f9" : "none", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
                <div>
                  <span style={{ fontSize: "11px", fontWeight: "600", color: "#3b82f6", backgroundColor: "#eff6ff", padding: "2px 8px", borderRadius: "4px" }}>
                    {submission.module?.code ?? "Module"}
                  </span>
                  <p style={{ fontSize: "15px", fontWeight: "600", color: "#1e293b", marginTop: "8px" }}>{submission.assignment}</p>
                  <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "3px" }}>Submitted {formatDate(submission.submitted_date)}</p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
                  {submission.grade && (
                    <span style={{ fontSize: "20px", fontWeight: "700", color: "#1e293b", backgroundColor: "#f1f5f9", padding: "4px 14px", borderRadius: "8px" }}>
                      {formatGradeDisplay(submission.grade)}
                    </span>
                  )}

                  {submission.status === "approved" ? (
                    <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", fontWeight: "500", color: "#16a34a", backgroundColor: "#dcfce7", padding: "4px 10px", borderRadius: "20px" }}>
                      <CheckCircle size={12} /> Feedback ready
                    </span>
                  ) : (
                    <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", fontWeight: "500", color: "#d97706", backgroundColor: "#fef3c7", padding: "4px 10px", borderRadius: "20px" }}>
                      <Clock size={12} /> Awaiting feedback
                    </span>
                  )}
                </div>
              </div>

              {submission.status === "approved" && submission.feedback && (
                <div style={{ padding: "20px" }}>
                  <p style={{ fontSize: "14px", color: "#374151", lineHeight: "1.75", whiteSpace: "pre-line" }}>
                    {submission.feedback}
                  </p>
                </div>
              )}

              {submission.status !== "approved" && (
                <div style={{ padding: "20px", backgroundColor: "#fffbeb", display: "flex", alignItems: "center", gap: "10px" }}>
                  <Clock size={15} color="#d97706" />
                  <p style={{ fontSize: "13px", color: "#92400e" }}>
                    Your lecturer is reviewing this submission. Feedback will appear here once approved.
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

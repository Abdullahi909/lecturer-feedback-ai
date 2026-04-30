"use client";

// Approved page.
// This loads approved submissions from Supabase and shows them in a simple table.

import Sidebar from "@/components/Sidebar";
import StatCard from "@/components/StatCard";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { classificationFromMark, formatGradeDisplay, gradeColour, parseMark } from "@/lib/grading";
import { fetchApprovedSubmissionDetails } from "@/lib/supabase";
import type { SubmissionWithDetails } from "@/lib/types";
import { CheckCircle, Send, BarChart2, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ApprovedPage() {
  const { user, loading } = useAuthGuard("lecturer");
  const [approvedSubmissions, setApprovedSubmissions] = useState<SubmissionWithDetails[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    async function loadApprovedSubmissions() {
      try {
        const items = await fetchApprovedSubmissionDetails();
        setApprovedSubmissions(items);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Could not load approved submissions.";
        setPageError(message);
      } finally {
        setPageLoading(false);
      }
    }

    loadApprovedSubmissions();
  }, []);

  if (loading || !user) return null;

  const gradeValues = approvedSubmissions
    .map((item) => parseMark(item.grade))
    .filter((mark): mark is number => mark !== null);

  const averageMark =
    gradeValues.length === 0
      ? 0
      : gradeValues.reduce((total, mark) => total + mark, 0) / gradeValues.length;

  const averageGrade = gradeValues.length === 0 ? "-" : `${Math.round(averageMark)}% (${classificationFromMark(averageMark)})`;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />

      <main style={{ flex: 1, padding: "32px", overflowY: "auto" }}>
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#1e293b" }}>Approved Feedback</h1>
          <p style={{ fontSize: "14px", color: "#64748b", marginTop: "4px" }}>
            All approved and sent student feedback from this term.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "32px" }}>
          <StatCard label="Total Approved" value={approvedSubmissions.length} icon={CheckCircle} iconColor="#16a34a" iconBg="#dcfce7" note="This term" />
          <StatCard label="Sent to Students" value={approvedSubmissions.length} icon={Send} iconColor="#2563eb" iconBg="#dbeafe" note="Approved records" />
          <StatCard label="Average Mark" value={averageGrade} icon={BarChart2} iconColor="#7c3aed" iconBg="#ede9fe" note="Across approved work" />
        </div>

        {pageLoading && (
          <div style={{ backgroundColor: "#fff", borderRadius: "10px", border: "1px solid #e2e8f0", padding: "20px", fontSize: "14px", color: "#475569", marginBottom: "20px" }}>
            Loading approved submissions...
          </div>
        )}

        {pageError && (
          <div style={{ backgroundColor: "#fef2f2", borderRadius: "10px", border: "1px solid #fecaca", padding: "20px", fontSize: "14px", color: "#b91c1c", marginBottom: "20px" }}>
            {pageError}
          </div>
        )}

        <div style={{ backgroundColor: "#fff", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
          <div style={{ padding: "18px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 style={{ fontSize: "15px", fontWeight: "600", color: "#1e293b" }}>Approved Submissions</h2>
            <span style={{ fontSize: "13px", color: "#64748b" }}>
              {approvedSubmissions.length} approved this term
            </span>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc" }}>
                {["Student", "Username", "Module", "Assignment", "Grade", "Approved", "Status", ""].map((heading) => (
                  <th key={heading} style={{ padding: "12px 20px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {approvedSubmissions.map((submission, index) => {
                const colours = gradeColour(submission.grade);

                return (
                  <tr key={submission.id} style={{ borderTop: index === 0 ? "none" : "1px solid #f1f5f9" }}>
                    <td style={{ padding: "14px 20px", fontSize: "14px", fontWeight: "500", color: "#1e293b" }}>{submission.student?.name ?? "Student"}</td>
                    <td style={{ padding: "14px 20px", fontSize: "13px", color: "#94a3b8" }}>{submission.student?.username ?? "-"}</td>
                    <td style={{ padding: "14px 20px" }}>
                      <span style={{ fontSize: "12px", fontWeight: "600", color: "#3b82f6", backgroundColor: "#eff6ff", padding: "3px 8px", borderRadius: "4px" }}>
                        {submission.module?.code ?? "Module"}
                      </span>
                    </td>
                    <td style={{ padding: "14px 20px", fontSize: "14px", color: "#1e293b" }}>{submission.assignment}</td>
                    <td style={{ padding: "14px 20px" }}>
                      <span style={{ fontSize: "13px", fontWeight: "700", color: colours.color, backgroundColor: colours.bg, padding: "3px 10px", borderRadius: "20px" }}>
                        {formatGradeDisplay(submission.grade)}
                      </span>
                    </td>
                    <td style={{ padding: "14px 20px", fontSize: "13px", color: "#64748b" }}>{formatDate(submission.submitted_date)}</td>
                    <td style={{ padding: "14px 20px" }}>
                      <span style={{ fontSize: "12px", fontWeight: "500", color: "#16a34a", backgroundColor: "#dcfce7", padding: "3px 10px", borderRadius: "20px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <CheckCircle size={11} /> Sent
                      </span>
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <Link href="/feedback" style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "13px", color: "#3b82f6", textDecoration: "none", fontWeight: "500" }}>
                        View <ChevronRight size={14} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

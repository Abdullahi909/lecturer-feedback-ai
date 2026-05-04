"use client";

// Dashboard page.
// This version loads real rows from Supabase and builds the numbers in plain JavaScript.

import Sidebar from "@/components/Sidebar";
import StatCard from "@/components/StatCard";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { getSubmissionStage } from "@/lib/submission-content";
import { fetchModules, fetchSubmissionDetails, fetchUsers } from "@/lib/supabase";
import { Clock, CheckCircle, BookOpen, Users, ChevronRight, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

// Badge colours for table statuses.
const statusStyles = {
  submitted: { label: "Ready to Mark", color: "#2563eb", bg: "#dbeafe" },
  generated: { label: "Pending Approval", color: "#d97706", bg: "#fef3c7" },
  rejected: { label: "Rejected", color: "#dc2626", bg: "#fee2e2" },
  approved: { label: "Approved", color: "#16a34a", bg: "#dcfce7" },
};

// One row in the dashboard table.
type AssignmentRow = {
  id: string;
  module: string;
  name: string;
  submissions: number;
  readyToMark: number;
  awaitingApproval: number;
  approved: number;
  rejected: number;
  latestDate: string;
  status: "submitted" | "generated" | "approved" | "rejected";
};

// Format dates for the UI.
function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function DashboardPage() {
  const { user, loading } = useAuthGuard("lecturer");
  const [assignments, setAssignments] = useState<AssignmentRow[]>([]);
  const [readyToMarkCount, setReadyToMarkCount] = useState(0);
  const [awaitingApprovalCount, setAwaitingApprovalCount] = useState(0);
  const [approvedCount, setApprovedCount] = useState(0);
  const [moduleCount, setModuleCount] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
  const [latestSubmissionDate, setLatestSubmissionDate] = useState("No submissions yet");
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [items, modules, students] = await Promise.all([
          fetchSubmissionDetails(),
          fetchModules(),
          fetchUsers("student"),
        ]);

        const stages = items.map((item) => getSubmissionStage(item));
        setReadyToMarkCount(stages.filter((stage) => stage === "submitted").length);
        setAwaitingApprovalCount(stages.filter((stage) => stage === "generated").length);
        setApprovedCount(stages.filter((stage) => stage === "approved").length);
        setModuleCount(modules.length);
        setStudentCount(students.length);

        const dates = items
          .map((item) => item.submitted_date)
          .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

        if (dates[0]) {
          setLatestSubmissionDate(formatDate(dates[0]));
        }

        const groups = new Map<string, AssignmentRow>();

        for (const item of items) {
          const key = `${item.module_id}-${item.assignment}`;
          const existing = groups.get(key);

          if (existing) {
            existing.submissions += 1;
            const stage = getSubmissionStage(item);

            if (stage === "submitted") {
              existing.readyToMark += 1;
            }

            if (stage === "generated") {
              existing.awaitingApproval += 1;
            }

            if (stage === "approved") {
              existing.approved += 1;
            }

            if (item.status === "rejected") {
              existing.rejected += 1;
            }

            if (new Date(item.submitted_date).getTime() > new Date(existing.latestDate).getTime()) {
              existing.latestDate = item.submitted_date;
            }

            continue;
          }

          const stage = getSubmissionStage(item);
          groups.set(key, {
            id: key,
            module: item.module?.code ?? "Module",
            name: item.assignment,
            submissions: 1,
            readyToMark: stage === "submitted" ? 1 : 0,
            awaitingApproval: stage === "generated" ? 1 : 0,
            approved: stage === "approved" ? 1 : 0,
            rejected: item.status === "rejected" ? 1 : 0,
            latestDate: item.submitted_date,
            status: stage,
          });
        }

        const rows = Array.from(groups.values()).map((row) => {
          let status: AssignmentRow["status"] = "approved";

          if (row.readyToMark > 0) {
            status = "submitted";
          } else if (row.awaitingApproval > 0) {
            status = "generated";
          } else if (row.rejected === row.submissions) {
            status = "rejected";
          }

          return {
            ...row,
            latestDate: formatDate(row.latestDate),
            status,
          };
        });

        setAssignments(rows);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Could not load dashboard data.";
        setPageError(message);
      } finally {
        setPageLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading || !user) return null;

  const firstName = user.name.split(" ")[0];

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />

      <main style={{ flex: 1, padding: "32px", overflowY: "auto" }}>
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#1e293b" }}>Good morning, {firstName}</h1>
          <p style={{ fontSize: "14px", color: "#64748b", marginTop: "4px" }}>{today}</p>
        </div>

        <div style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "10px", padding: "14px 18px", display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
          <AlertCircle size={18} color="#2563eb" />
          <p style={{ fontSize: "14px", color: "#1d4ed8" }}>
            <strong>{readyToMarkCount} submissions</strong> are ready to mark and <strong>{awaitingApprovalCount}</strong> AI drafts are waiting for approval. Latest submission: <strong>{latestSubmissionDate}</strong>.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "32px" }}>
          <StatCard label="Ready to Mark" value={readyToMarkCount} icon={Clock} iconColor="#2563eb" iconBg="#dbeafe" note="Student work waiting" />
          <StatCard label="Pending Approval" value={awaitingApprovalCount} icon={Clock} iconColor="#d97706" iconBg="#fef3c7" note="AI drafts to review" />
          <StatCard label="Approved" value={approvedCount} icon={CheckCircle} iconColor="#16a34a" iconBg="#dcfce7" note="Released to students" />
          <StatCard label="Active Modules" value={moduleCount} icon={BookOpen} iconColor="#2563eb" iconBg="#dbeafe" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "32px" }}>
          <StatCard label="Total Students" value={studentCount} icon={Users} iconColor="#7c3aed" iconBg="#ede9fe" />
          <div style={{ backgroundColor: "#fff", borderRadius: "10px", border: "1px solid #e2e8f0", padding: "18px 20px" }}>
            <h2 style={{ fontSize: "14px", fontWeight: "700", color: "#1e293b", marginBottom: "8px" }}>Workflow</h2>
            <p style={{ fontSize: "13px", color: "#475569", lineHeight: "1.7", margin: 0 }}>
              Students submit work first. Items then appear as <strong>Ready to Mark</strong>. After you generate AI feedback they move to <strong>Pending Approval</strong>. Only <strong>Approved</strong> feedback becomes visible to students.
            </p>
          </div>
        </div>

        {pageLoading && (
          <div style={{ backgroundColor: "#fff", borderRadius: "10px", border: "1px solid #e2e8f0", padding: "20px", fontSize: "14px", color: "#475569", marginBottom: "20px" }}>
            Loading dashboard...
          </div>
        )}

        {pageError && (
          <div style={{ backgroundColor: "#fef2f2", borderRadius: "10px", border: "1px solid #fecaca", padding: "20px", fontSize: "14px", color: "#b91c1c", marginBottom: "20px" }}>
            {pageError}
          </div>
        )}

        <div style={{ backgroundColor: "#fff", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px", borderBottom: "1px solid #f1f5f9" }}>
            <h2 style={{ fontSize: "15px", fontWeight: "600", color: "#1e293b" }}>Recent Assignments</h2>
            <Link href="/upload" style={{ fontSize: "13px", color: "#3b82f6", textDecoration: "none", fontWeight: "500" }}>
              + New Assignment
            </Link>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc" }}>
                {["Module", "Assignment", "Submissions", "Ready", "Approval", "Latest", "Status", ""].map((heading) => (
                  <th key={heading} style={{ padding: "12px 20px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {assignments.map((assignment, index) => {
                const styles = statusStyles[assignment.status];

                return (
                  <tr key={assignment.id} style={{ borderTop: index === 0 ? "none" : "1px solid #f1f5f9" }}>
                    <td style={{ padding: "14px 20px" }}>
                      <span style={{ fontSize: "12px", fontWeight: "600", color: "#3b82f6", backgroundColor: "#eff6ff", padding: "3px 8px", borderRadius: "4px" }}>
                        {assignment.module}
                      </span>
                    </td>
                    <td style={{ padding: "14px 20px", fontSize: "14px", color: "#1e293b" }}>{assignment.name}</td>
                    <td style={{ padding: "14px 20px", fontSize: "14px", color: "#475569" }}>{assignment.submissions}</td>
                    <td style={{ padding: "14px 20px", fontSize: "14px", color: "#475569" }}>{assignment.readyToMark}</td>
                    <td style={{ padding: "14px 20px", fontSize: "14px", color: "#475569" }}>{assignment.awaitingApproval}</td>
                    <td style={{ padding: "14px 20px", fontSize: "13px", color: "#64748b" }}>{assignment.latestDate}</td>
                    <td style={{ padding: "14px 20px" }}>
                      <span style={{ fontSize: "12px", fontWeight: "500", color: styles.color, backgroundColor: styles.bg, padding: "3px 10px", borderRadius: "20px" }}>
                        {styles.label}
                      </span>
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <Link href="/feedback" style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "13px", color: "#3b82f6", textDecoration: "none", fontWeight: "500" }}>
                        Review <ChevronRight size={14} />
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

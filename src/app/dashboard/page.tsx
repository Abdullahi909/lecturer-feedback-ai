"use client";

// Dashboard page.
// This version loads real rows from Supabase and builds the numbers in plain JavaScript.

import Sidebar from "@/components/Sidebar";
import StatCard from "@/components/StatCard";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { fetchModules, fetchSubmissionDetails, fetchUsers } from "@/lib/supabase";
import { Clock, CheckCircle, BookOpen, Users, ChevronRight, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

// Badge colours for table statuses.
const statusStyles = {
  pending: { label: "Pending", color: "#d97706", bg: "#fef3c7" },
  approved: { label: "In Progress", color: "#2563eb", bg: "#dbeafe" },
  rejected: { label: "Rejected", color: "#dc2626", bg: "#fee2e2" },
  done: { label: "Done", color: "#16a34a", bg: "#dcfce7" },
};

// One row in the dashboard table.
type AssignmentRow = {
  id: string;
  module: string;
  name: string;
  submissions: number;
  pending: number;
  rejected: number;
  deadline: string;
  status: "pending" | "approved" | "rejected" | "done";
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
  const [pendingCount, setPendingCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [moduleCount, setModuleCount] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
  const [nextDeadline, setNextDeadline] = useState("No deadline yet");
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

        setPendingCount(items.filter((item) => item.status === "pending").length);
        setCompletedCount(items.filter((item) => item.status === "approved").length);
        setModuleCount(modules.length);
        setStudentCount(students.length);

        const dates = items
          .map((item) => item.submitted_date)
          .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

        if (dates[0]) {
          setNextDeadline(formatDate(dates[0]));
        }

        const groups = new Map<string, AssignmentRow>();

        for (const item of items) {
          const key = `${item.module_id}-${item.assignment}`;
          const existing = groups.get(key);

          if (existing) {
            existing.submissions += 1;

            if (item.status === "pending") {
              existing.pending += 1;
            }

            if (item.status === "rejected") {
              existing.rejected += 1;
            }

            continue;
          }

          groups.set(key, {
            id: key,
            module: item.module?.code ?? "Module",
            name: item.assignment,
            submissions: 1,
            pending: item.status === "pending" ? 1 : 0,
            rejected: item.status === "rejected" ? 1 : 0,
            deadline: formatDate(item.submitted_date),
            status:
              item.status === "pending"
                ? "pending"
                : item.status === "rejected"
                  ? "rejected"
                  : item.status === "approved"
                    ? "done"
                    : "approved",
          });
        }

        const rows = Array.from(groups.values()).map((row) => {
          let status: AssignmentRow["status"] = "approved";

          if (row.pending === row.submissions) {
            status = "pending";
          } else if (row.rejected === row.submissions) {
            status = "rejected";
          } else if (row.pending === 0) {
            status = "done";
          }

          return {
            ...row,
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
            <strong>{pendingCount} submissions</strong> are awaiting feedback. Your next deadline is <strong>{nextDeadline}</strong>.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "32px" }}>
          <StatCard label="Pending Feedback" value={pendingCount} icon={Clock} iconColor="#d97706" iconBg="#fef3c7" note="Awaiting review" />
          <StatCard label="Completed" value={completedCount} icon={CheckCircle} iconColor="#16a34a" iconBg="#dcfce7" note="Approved so far" />
          <StatCard label="Active Modules" value={moduleCount} icon={BookOpen} iconColor="#2563eb" iconBg="#dbeafe" />
          <StatCard label="Total Students" value={studentCount} icon={Users} iconColor="#7c3aed" iconBg="#ede9fe" />
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
                {["Module", "Assignment", "Submissions", "Pending", "Deadline", "Status", ""].map((heading) => (
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
                    <td style={{ padding: "14px 20px", fontSize: "14px", color: "#475569" }}>{assignment.pending}</td>
                    <td style={{ padding: "14px 20px", fontSize: "13px", color: "#64748b" }}>{assignment.deadline}</td>
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

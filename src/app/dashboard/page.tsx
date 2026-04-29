"use client";

// Dashboard — home screen for lecturers.
// Shows a summary of pending feedback, completed work, active modules, and total students.
// Also has a table of recent assignments with their status.

import Sidebar from "@/components/Sidebar";
import StatCard from "@/components/StatCard";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { Clock, CheckCircle, BookOpen, Users, ChevronRight, AlertCircle } from "lucide-react";
import Link from "next/link";

// Demo assignment data shown in the table.
const assignments = [
  { id: 1, module: "CS201", name: "Essay 1 — Critical Analysis",  submissions: 45, pending: 45, deadline: "14 Mar 2026", status: "pending"     },
  { id: 2, module: "CS310", name: "Lab Report 2",                  submissions: 38, pending: 12, deadline: "10 Mar 2026", status: "in-progress" },
  { id: 3, module: "CS101", name: "Introductory Essay",            submissions: 62, pending: 0,  deadline: "28 Feb 2026", status: "done"        },
  { id: 4, module: "CS415", name: "Research Proposal",             submissions: 29, pending: 29, deadline: "20 Mar 2026", status: "pending"     },
];

// Colours for each status badge.
const statusStyles = {
  pending:       { label: "Pending",     color: "#d97706", bg: "#fef3c7" },
  "in-progress": { label: "In Progress", color: "#2563eb", bg: "#dbeafe" },
  done:          { label: "Done",        color: "#16a34a", bg: "#dcfce7" },
};

export default function DashboardPage() {
  const { user, loading } = useAuthGuard("lecturer");

  // Format today's date, e.g. "Monday, 14 March 2026".
  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  if (loading || !user) return null;

  // First name only for the greeting, e.g. "Good morning, Abdullahi".
  const firstName = user.name.split(" ")[0];

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />

      <main style={{ flex: 1, padding: "32px", overflowY: "auto" }}>

        {/* Greeting */}
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#1e293b" }}>Good morning, {firstName}</h1>
          <p style={{ fontSize: "14px", color: "#64748b", marginTop: "4px" }}>{today}</p>
        </div>

        {/* Deadline reminder banner */}
        <div style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "10px", padding: "14px 18px", display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
          <AlertCircle size={18} color="#2563eb" />
          <p style={{ fontSize: "14px", color: "#1d4ed8" }}>
            <strong>74 submissions</strong> are awaiting feedback across 2 modules. Your next deadline is <strong>10 Mar 2026</strong>.
          </p>
        </div>

        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "32px" }}>
          <StatCard label="Pending Feedback" value={74}  icon={Clock}       iconColor="#d97706" iconBg="#fef3c7"  note="Across 2 modules" />
          <StatCard label="Completed"         value={62}  icon={CheckCircle} iconColor="#16a34a" iconBg="#dcfce7"  note="This term"        />
          <StatCard label="Active Modules"    value={4}   icon={BookOpen}    iconColor="#2563eb" iconBg="#dbeafe"                           />
          <StatCard label="Total Students"    value={174} icon={Users}       iconColor="#7c3aed" iconBg="#ede9fe"                           />
        </div>

        {/* Assignments table */}
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
                {["Module", "Assignment", "Submissions", "Pending", "Deadline", "Status", ""].map((h) => (
                  <th key={h} style={{ padding: "12px 20px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {assignments.map((a, i) => {
                const s = statusStyles[a.status as keyof typeof statusStyles];
                return (
                  <tr key={a.id} style={{ borderTop: i === 0 ? "none" : "1px solid #f1f5f9" }}>
                    <td style={{ padding: "14px 20px" }}>
                      <span style={{ fontSize: "12px", fontWeight: "600", color: "#3b82f6", backgroundColor: "#eff6ff", padding: "3px 8px", borderRadius: "4px" }}>
                        {a.module}
                      </span>
                    </td>
                    <td style={{ padding: "14px 20px", fontSize: "14px", color: "#1e293b" }}>{a.name}</td>
                    <td style={{ padding: "14px 20px", fontSize: "14px", color: "#475569" }}>{a.submissions}</td>
                    <td style={{ padding: "14px 20px", fontSize: "14px", color: "#475569" }}>{a.pending}</td>
                    <td style={{ padding: "14px 20px", fontSize: "13px", color: "#64748b" }}>{a.deadline}</td>
                    <td style={{ padding: "14px 20px" }}>
                      <span style={{ fontSize: "12px", fontWeight: "500", color: s.color, backgroundColor: s.bg, padding: "3px 10px", borderRadius: "20px" }}>
                        {s.label}
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

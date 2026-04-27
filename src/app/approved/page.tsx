"use client";

// Approved page — shows all feedback that has been approved and sent to students this term.

import Sidebar from "@/components/Sidebar";
import StatCard from "@/components/StatCard";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { CheckCircle, Send, BarChart2, ChevronRight } from "lucide-react";
import Link from "next/link";

// The three most recently approved submissions shown in the table.
const approvedSubmissions = [
  { id: 1, studentName: "Clara Svensson",   studentId: "STU2403", module: "CS310", assignment: "Lab Report 2",       grade: "A-", approvedDate: "11 Mar 2026" },
  { id: 2, studentName: "Hassan Al-Rashid", studentId: "STU2408", module: "CS310", assignment: "Lab Report 2",       grade: "A",  approvedDate: "11 Mar 2026" },
  { id: 3, studentName: "James Carter",     studentId: "STU2309", module: "CS101", assignment: "Introductory Essay", grade: "B+", approvedDate: "01 Mar 2026" },
];

// Returns text and background colours for a grade badge.
function gradeColour(grade: string) {
  if (grade.startsWith("A")) return { color: "#16a34a", bg: "#dcfce7" };
  if (grade.startsWith("B")) return { color: "#2563eb", bg: "#dbeafe" };
  if (grade.startsWith("C")) return { color: "#d97706", bg: "#fef3c7" };
  return { color: "#dc2626", bg: "#fee2e2" };
}

export default function ApprovedPage() {
  const { user, loading } = useAuthGuard("lecturer");

  if (loading || !user) return null;

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

        {/* Summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "32px" }}>
          <StatCard label="Total Approved"   value={62}  icon={CheckCircle} iconColor="#16a34a" iconBg="#dcfce7" note="This term"          />
          <StatCard label="Sent to Students" value={62}  icon={Send}        iconColor="#2563eb" iconBg="#dbeafe" note="100% dispatched"     />
          <StatCard label="Average Grade"    value="B+"  icon={BarChart2}   iconColor="#7c3aed" iconBg="#ede9fe" note="Across all modules"  />
        </div>

        {/* Approved submissions table */}
        <div style={{ backgroundColor: "#fff", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
          <div style={{ padding: "18px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 style={{ fontSize: "15px", fontWeight: "600", color: "#1e293b" }}>Approved Submissions</h2>
            <span style={{ fontSize: "13px", color: "#64748b" }}>
              {approvedSubmissions.length} recent · 62 total this term
            </span>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc" }}>
                {["Student", "ID", "Module", "Assignment", "Grade", "Approved", "Status", ""].map((h) => (
                  <th key={h} style={{ padding: "12px 20px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {approvedSubmissions.map((s, i) => {
                const gc = gradeColour(s.grade);
                return (
                  <tr key={s.id} style={{ borderTop: i === 0 ? "none" : "1px solid #f1f5f9" }}>
                    <td style={{ padding: "14px 20px", fontSize: "14px", fontWeight: "500", color: "#1e293b" }}>{s.studentName}</td>
                    <td style={{ padding: "14px 20px", fontSize: "13px", color: "#94a3b8" }}>{s.studentId}</td>
                    <td style={{ padding: "14px 20px" }}>
                      <span style={{ fontSize: "12px", fontWeight: "600", color: "#3b82f6", backgroundColor: "#eff6ff", padding: "3px 8px", borderRadius: "4px" }}>
                        {s.module}
                      </span>
                    </td>
                    <td style={{ padding: "14px 20px", fontSize: "14px", color: "#1e293b" }}>{s.assignment}</td>
                    <td style={{ padding: "14px 20px" }}>
                      <span style={{ fontSize: "13px", fontWeight: "700", color: gc.color, backgroundColor: gc.bg, padding: "3px 10px", borderRadius: "20px" }}>
                        {s.grade}
                      </span>
                    </td>
                    <td style={{ padding: "14px 20px", fontSize: "13px", color: "#64748b" }}>{s.approvedDate}</td>
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

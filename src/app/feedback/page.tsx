"use client";

import Sidebar from "@/components/Sidebar";
import { useState } from "react";
import { CheckCircle, XCircle, Edit3, User } from "lucide-react";

type FeedbackStatus = "pending" | "approved" | "rejected";

type FeedbackItem = {
  id: number;
  studentName: string;
  studentId: string;
  module: string;
  assignment: string;
  submittedDate: string;
  status: FeedbackStatus;
  grade: string;
  feedback: string;
};

const statusConfig: Record<FeedbackStatus, { label: string; color: string; bg: string }> = {
  pending: { label: "Pending Review", color: "#d97706", bg: "#fef3c7" },
  approved: { label: "Approved", color: "#16a34a", bg: "#dcfce7" },
  rejected: { label: "Rejected", color: "#dc2626", bg: "#fee2e2" },
};

const allFeedback: FeedbackItem[] = [
  {
    id: 1,
    studentName: "Alice Johnson",
    studentId: "STU2401",
    module: "CS201",
    assignment: "Essay 1 — Critical Analysis",
    submittedDate: "12 Mar 2026",
    status: "pending",
    grade: "B+",
    feedback: `Alice demonstrates strong analytical capabilities throughout this essay. Her critical examination of distributed systems theory is well-grounded in cited literature, particularly in sections two and three where she draws on contemporary research.\n\nHer argument structure is coherent and logical, with each paragraph building meaningfully on the previous. However, the conclusion feels rushed and does not fully synthesise the preceding discussion — a more considered closing section would strengthen the overall work.\n\nUse of sources is good overall, though two citations in section four lack page references. Originality is evident in her comparative framework, which offers a fresh perspective on the topic.\n\nRecommended grade reflects solid understanding with room for refinement in argumentation and citation practice.`,
  },
  {
    id: 2,
    studentName: "Ben Okafor",
    studentId: "STU2402",
    module: "CS201",
    assignment: "Essay 1 — Critical Analysis",
    submittedDate: "12 Mar 2026",
    status: "pending",
    grade: "C+",
    feedback: `Ben's essay shows engagement with the core topic, though the analysis lacks the depth expected at this level of study. The introduction makes a reasonable attempt at framing the argument, but the central thesis remains underdeveloped throughout.\n\nStructure is adequate with a clear three-part division, but transitions between sections are abrupt. The use of sources is limited — only four references are cited, and reliance on a single textbook is evident. Broader engagement with the literature would significantly strengthen the work.\n\nOriginality is minimal; Ben largely summarises existing positions without offering independent critique. The conclusion restates key points effectively but adds little new insight.\n\nWith focused revision, particularly in deepening the analysis and expanding the source base, this work has potential to reach a higher grade.`,
  },
  {
    id: 3,
    studentName: "Clara Svensson",
    studentId: "STU2403",
    module: "CS310",
    assignment: "Lab Report 2",
    submittedDate: "10 Mar 2026",
    status: "approved",
    grade: "A-",
    feedback: `Clara's lab report is exemplary in its structure and methodological clarity. The introduction contextualises the experiment well within the broader field, and the methodology section is detailed and reproducible.\n\nResults are presented clearly with well-labelled figures and tables. The discussion demonstrates strong critical thinking, connecting outcomes to theoretical frameworks with appropriate nuance. Clara correctly identifies limitations and suggests meaningful avenues for future investigation.\n\nMinor deductions relate to two typographical errors in the bibliography and one formula that could have been explained more clearly. These are negligible given the overall quality.\n\nThis is an outstanding submission that demonstrates both technical competence and the ability to critically engage with experimental findings.`,
  },
  {
    id: 4,
    studentName: "David Kim",
    studentId: "STU2404",
    module: "CS310",
    assignment: "Lab Report 2",
    submittedDate: "10 Mar 2026",
    status: "pending",
    grade: "B",
    feedback: `David's report covers all required sections with adequate detail. The methodology is clearly laid out and the experiment appears to have been conducted rigorously. Results are presented in a logical order.\n\nThe discussion section, while competent, tends toward description rather than analysis. David identifies the key results but does not consistently connect them back to the underlying theoretical framework. Stronger interpretation of the anomalous readings in Table 3 would have been beneficial.\n\nCitation practice is consistent and correctly formatted throughout. The conclusion summarises findings accurately.\n\nThis is a solid submission that demonstrates good laboratory skills and competent scientific writing.`,
  },
  {
    id: 5,
    studentName: "Emma Patel",
    studentId: "STU2405",
    module: "CS415",
    assignment: "Research Proposal",
    submittedDate: "15 Mar 2026",
    status: "pending",
    grade: "A",
    feedback: `Emma's research proposal is exceptional in its scope, clarity, and academic rigour. The research question is precisely formulated and clearly significant within the field of machine learning for healthcare applications.\n\nThe literature review is comprehensive, covering 24 recent sources and effectively identifying the gap this research addresses. The proposed methodology is detailed and realistic, with a well-constructed timeline and clear success metrics.\n\nEthical considerations are addressed thoughtfully, including a discussion of dataset bias and patient data privacy — a mature and important addition. The writing is consistently clear and professional throughout.\n\nThis proposal demonstrates a high level of scholarly preparedness and is recommended for progression to the full research phase without revision.`,
  },
  {
    id: 6,
    studentName: "Finn Murphy",
    studentId: "STU2406",
    module: "CS415",
    assignment: "Research Proposal",
    submittedDate: "15 Mar 2026",
    status: "rejected",
    grade: "D",
    feedback: `Finn's proposal requires substantial revision before it can proceed. The research question as stated is too broad to be meaningfully addressed within the proposed scope, and no clear hypothesis is articulated.\n\nThe literature review cites only five sources, none published within the last three years, suggesting insufficient engagement with the current state of the field. The methodology section describes the intent to "collect data" without specifying sources, instruments, or analysis approaches.\n\nNo timeline, ethical considerations, or success metrics are included, which are mandatory components of a research proposal at this level.\n\nFinn should schedule a meeting with his supervisor before resubmission. A significant rework of the core research question and methodology is required.`,
  },
  {
    id: 7,
    studentName: "Grace Liu",
    studentId: "STU2407",
    module: "CS201",
    assignment: "Essay 1 — Critical Analysis",
    submittedDate: "12 Mar 2026",
    status: "pending",
    grade: "B+",
    feedback: `Grace's essay demonstrates solid critical thinking and a mature academic voice throughout. The central argument is clearly stated and consistently supported across all three main sections.\n\nEngagement with secondary literature is strong, with 11 well-chosen sources integrated effectively. Analysis goes beyond mere summary to offer genuine evaluative commentary in most instances, though the middle section occasionally lapses into paraphrase.\n\nStructure is clear and the writing flows well. The conclusion is particularly strong, offering a nuanced synthesis that revisits the thesis with added depth.\n\nThis is a well-crafted piece of academic writing that demonstrates commendable mastery of the subject matter.`,
  },
  {
    id: 8,
    studentName: "Hassan Al-Rashid",
    studentId: "STU2408",
    module: "CS310",
    assignment: "Lab Report 2",
    submittedDate: "10 Mar 2026",
    status: "approved",
    grade: "A",
    feedback: `Hassan's lab report is outstanding in both its thoroughness and analytical precision. Every section meets or exceeds expectations for this level of study.\n\nThe experimental design is sound and clearly explained. Results are not only accurately recorded but thoughtfully interrogated — Hassan demonstrates an impressive ability to reason about sources of error and their likely impact on outcomes.\n\nThe discussion draws on the wider literature effectively and proposes two novel interpretations that add genuine value to the analysis. The reference list is comprehensive, correctly formatted, and includes three primary research papers.\n\nThis is an excellent submission that reflects the work of a student operating at the top of the cohort.`,
  },
];

export default function FeedbackPage() {
  const [selectedId, setSelectedId] = useState<number>(1);
  const [filterModule, setFilterModule] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [statuses, setStatuses] = useState<Record<number, FeedbackStatus>>(
    Object.fromEntries(allFeedback.map((f) => [f.id, f.status]))
  );

  const modules = Array.from(new Set(allFeedback.map((f) => f.module)));

  const filtered = allFeedback.filter((f) => {
    if (filterModule !== "all" && f.module !== filterModule) return false;
    if (filterStatus !== "all" && statuses[f.id] !== filterStatus) return false;
    return true;
  });

  const selected = allFeedback.find((f) => f.id === selectedId) ?? allFeedback[0];

  function approve(id: number) {
    setStatuses((prev) => ({ ...prev, [id]: "approved" }));
  }

  function reject(id: number) {
    setStatuses((prev) => ({ ...prev, [id]: "rejected" }));
  }

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Sidebar />

      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <div
          style={{
            padding: "24px 28px 20px",
            borderBottom: "1px solid #e2e8f0",
            backgroundColor: "#fff",
            flexShrink: 0,
          }}
        >
          <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#1e293b" }}>
            Feedback Review
          </h1>
          <p style={{ fontSize: "14px", color: "#64748b", marginTop: "4px" }}>
            Review, edit and approve AI-generated feedback before it reaches students.
          </p>
          <div style={{ display: "flex", gap: "10px", marginTop: "16px", alignItems: "center" }}>
            <select
              value={filterModule}
              onChange={(e) => setFilterModule(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                fontSize: "13px",
                color: "#1e293b",
                backgroundColor: "#fff",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="all">All Modules</option>
              {modules.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                fontSize: "13px",
                color: "#1e293b",
                backgroundColor: "#fff",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <span style={{ fontSize: "13px", color: "#64748b", marginLeft: "auto" }}>
              {filtered.length} {filtered.length === 1 ? "submission" : "submissions"}
            </span>
          </div>
        </div>

        {/* Split panel */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {/* Student list */}
          <div
            style={{
              width: "320px",
              flexShrink: 0,
              borderRight: "1px solid #e2e8f0",
              overflowY: "auto",
              backgroundColor: "#f8fafc",
            }}
          >
            {filtered.length === 0 ? (
              <div style={{ padding: "40px 20px", textAlign: "center", color: "#94a3b8", fontSize: "14px" }}>
                No submissions match the current filters.
              </div>
            ) : (
              filtered.map((f) => {
                const s = statusConfig[statuses[f.id]];
                const isSelected = f.id === selectedId;
                return (
                  <button
                    key={f.id}
                    onClick={() => setSelectedId(f.id)}
                    style={{
                      width: "100%",
                      padding: "16px 20px",
                      textAlign: "left",
                      border: "none",
                      borderBottom: "1px solid #e2e8f0",
                      borderLeft: isSelected ? "3px solid #3b82f6" : "3px solid transparent",
                      backgroundColor: isSelected ? "#ffffff" : "transparent",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>
                        {f.studentName}
                      </span>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: "500",
                          color: s.color,
                          backgroundColor: s.bg,
                          padding: "2px 8px",
                          borderRadius: "20px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {s.label}
                      </span>
                    </div>
                    <div style={{ fontSize: "12px", color: "#64748b", display: "flex", alignItems: "center", gap: "6px" }}>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: "600",
                          color: "#3b82f6",
                          backgroundColor: "#eff6ff",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          flexShrink: 0,
                        }}
                      >
                        {f.module}
                      </span>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {f.assignment}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Detail panel */}
          <div style={{ flex: 1, overflowY: "auto", padding: "28px", backgroundColor: "#fff" }}>
            {/* Student header */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                marginBottom: "24px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    backgroundColor: "#eff6ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <User size={20} color="#3b82f6" />
                </div>
                <div>
                  <h2 style={{ fontSize: "17px", fontWeight: "700", color: "#1e293b" }}>
                    {selected.studentName}
                  </h2>
                  <p style={{ fontSize: "13px", color: "#64748b", marginTop: "2px" }}>
                    {selected.studentId} · {selected.module} · Submitted {selected.submittedDate}
                  </p>
                </div>
              </div>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: "500",
                  color: statusConfig[statuses[selected.id]].color,
                  backgroundColor: statusConfig[statuses[selected.id]].bg,
                  padding: "4px 12px",
                  borderRadius: "20px",
                  flexShrink: 0,
                }}
              >
                {statusConfig[statuses[selected.id]].label}
              </span>
            </div>

            {/* Assignment info + grade */}
            <div
              style={{
                backgroundColor: "#f8fafc",
                borderRadius: "10px",
                padding: "16px 20px",
                marginBottom: "20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "11px",
                    color: "#64748b",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Assignment
                </p>
                <p style={{ fontSize: "14px", color: "#1e293b", fontWeight: "500", marginTop: "3px" }}>
                  {selected.assignment}
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p
                  style={{
                    fontSize: "11px",
                    color: "#64748b",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Suggested Grade
                </p>
                <p style={{ fontSize: "26px", fontWeight: "700", color: "#1e293b", marginTop: "2px" }}>
                  {selected.grade}
                </p>
              </div>
            </div>

            {/* Feedback text */}
            <div
              style={{
                backgroundColor: "#fff",
                borderRadius: "10px",
                border: "1px solid #e2e8f0",
                padding: "20px",
                marginBottom: "20px",
              }}
            >
              <h3
                style={{
                  fontSize: "11px",
                  fontWeight: "600",
                  color: "#64748b",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "14px",
                }}
              >
                AI-Generated Feedback
              </h3>
              <div
                style={{
                  fontSize: "14px",
                  color: "#374151",
                  lineHeight: "1.75",
                  whiteSpace: "pre-line",
                }}
              >
                {selected.feedback}
              </div>
            </div>

            {/* Actions */}
            {statuses[selected.id] === "pending" && (
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => reject(selected.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "10px 18px",
                    borderRadius: "8px",
                    border: "1px solid #fca5a5",
                    backgroundColor: "#fff",
                    color: "#dc2626",
                    fontSize: "14px",
                    fontWeight: "500",
                    cursor: "pointer",
                  }}
                >
                  <XCircle size={16} />
                  Reject
                </button>
                <button
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "10px 18px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    backgroundColor: "#fff",
                    color: "#374151",
                    fontSize: "14px",
                    fontWeight: "500",
                    cursor: "pointer",
                  }}
                >
                  <Edit3 size={16} />
                  Edit
                </button>
                <button
                  onClick={() => approve(selected.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "10px 22px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: "#16a34a",
                    color: "#fff",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    marginLeft: "auto",
                  }}
                >
                  <CheckCircle size={16} />
                  Approve & Send
                </button>
              </div>
            )}

            {statuses[selected.id] === "approved" && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "14px 16px",
                  backgroundColor: "#f0fdf4",
                  borderRadius: "8px",
                  border: "1px solid #bbf7d0",
                }}
              >
                <CheckCircle size={16} color="#16a34a" />
                <span style={{ fontSize: "14px", color: "#15803d", fontWeight: "500" }}>
                  Feedback approved and sent to student.
                </span>
              </div>
            )}

            {statuses[selected.id] === "rejected" && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "14px 16px",
                  backgroundColor: "#fef2f2",
                  borderRadius: "8px",
                  border: "1px solid #fecaca",
                }}
              >
                <XCircle size={16} color="#dc2626" />
                <span style={{ fontSize: "14px", color: "#b91c1c", fontWeight: "500" }}>
                  Feedback rejected. This submission will need manual review.
                </span>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

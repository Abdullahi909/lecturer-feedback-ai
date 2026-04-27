"use client";

// Feedback Review page — where the lecturer reads, edits, approves, or rejects AI-generated feedback.
//
// Layout: a fixed-height split panel.
//   Left  — a scrollable list of student submissions with status badges.
//   Right — the full feedback detail for whichever submission is selected.
//
// Actions available while a submission is "pending":
//   Reject       — marks the feedback as rejected (needs manual review).
//   Edit         — opens a modal where the lecturer can rewrite the feedback text.
//   Approve & Send — marks the feedback as approved and sent to the student.
//
// All state is local (no database). Changes persist only for the current session.

import Sidebar from "@/components/Sidebar";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useState } from "react";
import { CheckCircle, XCircle, Edit3, User, X } from "lucide-react";

// The three possible statuses for a piece of feedback.
type FeedbackStatus = "pending" | "approved" | "rejected";

// The shape of each feedback item in our demo data.
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

// Colours for each status badge — used in both the list and the detail panel.
const statusConfig: Record<FeedbackStatus, { label: string; color: string; bg: string }> = {
  pending:  { label: "Pending Review", color: "#d97706", bg: "#fef3c7" },
  approved: { label: "Approved",       color: "#16a34a", bg: "#dcfce7" },
  rejected: { label: "Rejected",       color: "#dc2626", bg: "#fee2e2" },
};

// Demo data — three submissions, one for each status, so all states can be seen at once.
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
    studentName: "Clara Svensson",
    studentId: "STU2403",
    module: "CS310",
    assignment: "Lab Report 2",
    submittedDate: "10 Mar 2026",
    status: "approved",
    grade: "A-",
    feedback: `Clara's lab report is exemplary in its structure and methodological clarity. The introduction contextualises the experiment well within the broader field, and the methodology section is detailed and reproducible.\n\nResults are presented clearly with well-labelled figures and tables. The discussion demonstrates strong critical thinking, connecting outcomes to theoretical frameworks with appropriate nuance. Clara correctly identifies limitations and suggests meaningful avenues for future investigation.\n\nMinor deductions relate to two typographical errors in the bibliography. These are negligible given the overall quality.\n\nThis is an outstanding submission demonstrating both technical competence and the ability to critically engage with experimental findings.`,
  },
  {
    id: 3,
    studentName: "Finn Murphy",
    studentId: "STU2406",
    module: "CS415",
    assignment: "Research Proposal",
    submittedDate: "15 Mar 2026",
    status: "rejected",
    grade: "D",
    feedback: `Finn's proposal requires substantial revision before it can proceed. The research question as stated is too broad to be meaningfully addressed within the proposed scope, and no clear hypothesis is articulated.\n\nThe literature review cites only five sources, none published within the last three years, suggesting insufficient engagement with the current state of the field. The methodology section describes the intent to "collect data" without specifying sources, instruments, or analysis approaches.\n\nNo timeline, ethical considerations, or success metrics are included — all mandatory components at this level.\n\nFinn should schedule a meeting with his supervisor before resubmission. A significant rework of the core research question and methodology is required.`,
  },
];

export default function FeedbackPage() {
  // Only lecturers can view this page.
  const { user, loading } = useAuthGuard("lecturer");

  // Which submission is currently shown in the right panel.
  const [selectedId, setSelectedId] = useState<number>(1);

  // Filter controls — let the lecturer narrow down the list.
  const [filterModule, setFilterModule] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Track statuses separately so approving/rejecting updates the UI without
  // mutating the original allFeedback array (which holds the original data).
  const [statuses, setStatuses] = useState<Record<number, FeedbackStatus>>(
    // Build an object like { 1: "pending", 2: "approved", 3: "rejected" }
    Object.fromEntries(allFeedback.map((f) => [f.id, f.status]))
  );

  // Track edited feedback text separately so edits don't overwrite the original data.
  // If a submission hasn't been edited, we fall back to the original feedback text.
  const [editedFeedback, setEditedFeedback] = useState<Record<number, string>>({});

  // Edit modal state.
  const [showEditModal, setShowEditModal] = useState(false); // Whether the modal is open.
  const [editDraft,     setEditDraft]     = useState("");    // The text currently in the textarea.

  // Don't render until auth check is done.
  if (loading || !user) return null;

  // Build a unique list of module codes for the filter dropdown.
  const modules = Array.from(new Set(allFeedback.map((f) => f.module)));

  // Apply the active filters to get the submissions shown in the left panel.
  const filtered = allFeedback.filter((f) => {
    if (filterModule !== "all" && f.module !== filterModule) return false;
    if (filterStatus !== "all" && statuses[f.id] !== filterStatus) return false;
    return true;
  });

  // The submission currently shown in the right panel.
  const selected = allFeedback.find((f) => f.id === selectedId) ?? allFeedback[0];

  // The text to display — uses the edited version if one exists, otherwise the original.
  const displayedFeedback = editedFeedback[selected.id] ?? selected.feedback;

  // Mark a submission as approved.
  function approve(id: number) {
    setStatuses((prev) => ({ ...prev, [id]: "approved" }));
  }

  // Mark a submission as rejected.
  function reject(id: number) {
    setStatuses((prev) => ({ ...prev, [id]: "rejected" }));
  }

  // Open the edit modal, pre-filled with the current feedback text.
  function openEditModal() {
    setEditDraft(displayedFeedback); // Start the draft with whatever is currently showing.
    setShowEditModal(true);
  }

  // Save the edited text and close the modal.
  function saveEdit() {
    setEditedFeedback((prev) => ({ ...prev, [selected.id]: editDraft }));
    setShowEditModal(false);
  }

  // Discard the draft and close the modal without saving.
  function cancelEdit() {
    setEditDraft("");
    setShowEditModal(false);
  }

  return (
    // height: 100vh + overflow: hidden creates a fixed viewport.
    // Each panel then scrolls independently inside it.
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Sidebar />

      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Page header and filter controls — fixed at the top, doesn't scroll */}
        <div style={{ padding: "24px 28px 20px", borderBottom: "1px solid #e2e8f0", backgroundColor: "#fff", flexShrink: 0 }}>
          <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#1e293b" }}>Feedback Review</h1>
          <p style={{ fontSize: "14px", color: "#64748b", marginTop: "4px" }}>
            Review, edit and approve AI-generated feedback before it reaches students.
          </p>

          {/* Filter dropdowns */}
          <div style={{ display: "flex", gap: "10px", marginTop: "16px", alignItems: "center" }}>
            {/* Filter by module */}
            <select
              value={filterModule}
              onChange={(e) => setFilterModule(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "13px", color: "#1e293b", backgroundColor: "#fff", outline: "none", cursor: "pointer" }}
            >
              <option value="all">All Modules</option>
              {modules.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>

            {/* Filter by status */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "13px", color: "#1e293b", backgroundColor: "#fff", outline: "none", cursor: "pointer" }}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            {/* Count of visible submissions */}
            <span style={{ fontSize: "13px", color: "#64748b", marginLeft: "auto" }}>
              {filtered.length} {filtered.length === 1 ? "submission" : "submissions"}
            </span>
          </div>
        </div>

        {/* Split panel — left list + right detail, both scroll independently */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

          {/* LEFT PANEL — scrollable list of student submissions */}
          <div style={{ width: "320px", flexShrink: 0, borderRight: "1px solid #e2e8f0", overflowY: "auto", backgroundColor: "#f8fafc" }}>
            {filtered.length === 0 ? (
              <div style={{ padding: "40px 20px", textAlign: "center", color: "#94a3b8", fontSize: "14px" }}>
                No submissions match the current filters.
              </div>
            ) : (
              filtered.map((f) => {
                const statusStyle = statusConfig[statuses[f.id]];
                const isSelected  = f.id === selectedId;

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
                      // Blue left border highlights the currently selected item.
                      borderLeft: isSelected ? "3px solid #3b82f6" : "3px solid transparent",
                      backgroundColor: isSelected ? "#ffffff" : "transparent",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                    }}
                  >
                    {/* Student name and status badge on the same row */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>{f.studentName}</span>
                      <span style={{ fontSize: "11px", fontWeight: "500", color: statusStyle.color, backgroundColor: statusStyle.bg, padding: "2px 8px", borderRadius: "20px", whiteSpace: "nowrap" }}>
                        {statusStyle.label}
                      </span>
                    </div>
                    {/* Module code and assignment name on the row below */}
                    <div style={{ fontSize: "12px", color: "#64748b", display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "11px", fontWeight: "600", color: "#3b82f6", backgroundColor: "#eff6ff", padding: "2px 6px", borderRadius: "4px", flexShrink: 0 }}>
                        {f.module}
                      </span>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.assignment}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* RIGHT PANEL — full feedback detail for the selected submission */}
          <div style={{ flex: 1, overflowY: "auto", padding: "28px", backgroundColor: "#fff" }}>

            {/* Student identity row */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                {/* Avatar icon */}
                <div style={{ width: "44px", height: "44px", borderRadius: "50%", backgroundColor: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <User size={20} color="#3b82f6" />
                </div>
                <div>
                  <h2 style={{ fontSize: "17px", fontWeight: "700", color: "#1e293b" }}>{selected.studentName}</h2>
                  <p style={{ fontSize: "13px", color: "#64748b", marginTop: "2px" }}>
                    {selected.studentId} · {selected.module} · Submitted {selected.submittedDate}
                  </p>
                </div>
              </div>
              {/* Current status badge */}
              <span style={{ fontSize: "12px", fontWeight: "500", color: statusConfig[statuses[selected.id]].color, backgroundColor: statusConfig[statuses[selected.id]].bg, padding: "4px 12px", borderRadius: "20px", flexShrink: 0 }}>
                {statusConfig[statuses[selected.id]].label}
              </span>
            </div>

            {/* Assignment name and grade */}
            <div style={{ backgroundColor: "#f8fafc", borderRadius: "10px", padding: "16px 20px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontSize: "11px", color: "#64748b", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }}>Assignment</p>
                <p style={{ fontSize: "14px", color: "#1e293b", fontWeight: "500", marginTop: "3px" }}>{selected.assignment}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: "11px", color: "#64748b", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }}>Suggested Grade</p>
                <p style={{ fontSize: "26px", fontWeight: "700", color: "#1e293b", marginTop: "2px" }}>{selected.grade}</p>
              </div>
            </div>

            {/* Feedback text box — shows edited version if the lecturer has made edits */}
            <div style={{ backgroundColor: "#fff", borderRadius: "10px", border: "1px solid #e2e8f0", padding: "20px", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "11px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "14px" }}>
                AI-Generated Feedback
                {/* Show a small badge if the text has been edited */}
                {editedFeedback[selected.id] && (
                  <span style={{ marginLeft: "8px", fontSize: "10px", color: "#2563eb", backgroundColor: "#dbeafe", padding: "2px 6px", borderRadius: "4px", fontWeight: "500", letterSpacing: "0" }}>
                    Edited
                  </span>
                )}
              </h3>
              <div style={{ fontSize: "14px", color: "#374151", lineHeight: "1.75", whiteSpace: "pre-line" }}>
                {displayedFeedback}
              </div>
            </div>

            {/* Action buttons — only visible while the feedback is still pending */}
            {statuses[selected.id] === "pending" && (
              <div style={{ display: "flex", gap: "10px" }}>
                {/* Reject button */}
                <button
                  onClick={() => reject(selected.id)}
                  style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 18px", borderRadius: "8px", border: "1px solid #fca5a5", backgroundColor: "#fff", color: "#dc2626", fontSize: "14px", fontWeight: "500", cursor: "pointer" }}
                >
                  <XCircle size={16} /> Reject
                </button>

                {/* Edit button — opens the edit modal */}
                <button
                  onClick={openEditModal}
                  style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 18px", borderRadius: "8px", border: "1px solid #d1d5db", backgroundColor: "#fff", color: "#374151", fontSize: "14px", fontWeight: "500", cursor: "pointer" }}
                >
                  <Edit3 size={16} /> Edit
                </button>

                {/* Approve button — pushes to the right with marginLeft: auto */}
                <button
                  onClick={() => approve(selected.id)}
                  style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 22px", borderRadius: "8px", border: "none", backgroundColor: "#16a34a", color: "#fff", fontSize: "14px", fontWeight: "600", cursor: "pointer", marginLeft: "auto" }}
                >
                  <CheckCircle size={16} /> Approve & Send
                </button>
              </div>
            )}

            {/* Approved confirmation banner */}
            {statuses[selected.id] === "approved" && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "14px 16px", backgroundColor: "#f0fdf4", borderRadius: "8px", border: "1px solid #bbf7d0" }}>
                <CheckCircle size={16} color="#16a34a" />
                <span style={{ fontSize: "14px", color: "#15803d", fontWeight: "500" }}>Feedback approved and sent to student.</span>
              </div>
            )}

            {/* Rejected notice */}
            {statuses[selected.id] === "rejected" && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "14px 16px", backgroundColor: "#fef2f2", borderRadius: "8px", border: "1px solid #fecaca" }}>
                <XCircle size={16} color="#dc2626" />
                <span style={{ fontSize: "14px", color: "#b91c1c", fontWeight: "500" }}>Feedback rejected. This submission will need manual review.</span>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* EDIT MODAL — shown when the lecturer clicks the Edit button */}
      {showEditModal && (
        // Semi-transparent dark overlay that covers the whole screen.
        // Clicking the overlay cancels the edit (same as the Cancel button).
        <div
          onClick={cancelEdit}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: "24px",
          }}
        >
          {/* The white modal card — stop clicks propagating so clicking inside doesn't close it */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              width: "100%",
              maxWidth: "640px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
            }}
          >
            {/* Modal header */}
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#1e293b" }}>Edit Feedback</h3>
                <p style={{ fontSize: "13px", color: "#64748b", marginTop: "2px" }}>
                  {selected.studentName} · {selected.assignment}
                </p>
              </div>
              {/* Close button in the top-right corner */}
              <button
                onClick={cancelEdit}
                style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center" }}
              >
                <X size={18} color="#94a3b8" />
              </button>
            </div>

            {/* Textarea — pre-filled with the current feedback text */}
            <div style={{ padding: "20px 24px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "#374151", marginBottom: "8px" }}>
                Feedback Text
              </label>
              <textarea
                value={editDraft}
                onChange={(e) => setEditDraft(e.target.value)}
                rows={12}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  fontSize: "14px",
                  color: "#374151",
                  lineHeight: "1.7",
                  outline: "none",
                  resize: "vertical",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Modal footer with Cancel and Save buttons */}
            <div style={{ padding: "16px 24px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                onClick={cancelEdit}
                style={{ padding: "10px 20px", borderRadius: "8px", border: "1px solid #d1d5db", backgroundColor: "#fff", color: "#374151", fontSize: "14px", fontWeight: "500", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                style={{ padding: "10px 24px", borderRadius: "8px", border: "none", backgroundColor: "#1e293b", color: "#fff", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

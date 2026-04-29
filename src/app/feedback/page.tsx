"use client";

// Feedback review page.
// This version keeps the logic very direct:
// 1. load feedback items
// 2. show one selected item
// 3. approve, reject, or edit it

import Sidebar from "@/components/Sidebar";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { fetchFeedbackReviewItems, updateSubmission } from "@/lib/supabase";
import type { SubmissionWithDetails } from "@/lib/types";
import { CheckCircle, XCircle, Edit3, User, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const statusStyles = {
  pending: { label: "Pending Review", color: "#d97706", bg: "#fef3c7" },
  approved: { label: "Approved", color: "#16a34a", bg: "#dcfce7" },
  rejected: { label: "Rejected", color: "#dc2626", bg: "#fee2e2" },
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function FeedbackPage() {
  const { user, loading } = useAuthGuard("lecturer");
  const [items, setItems] = useState<SubmissionWithDetails[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [filterModule, setFilterModule] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editDraft, setEditDraft] = useState("");
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadItems() {
      try {
        const data = await fetchFeedbackReviewItems();
        setItems(data);

        if (data[0]) {
          setSelectedId(data[0].id);
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Could not load feedback items.";
        setPageError(message);
      } finally {
        setPageLoading(false);
      }
    }

    loadItems();
  }, []);

  const moduleOptions = useMemo(() => {
    const values = items.map((item) => item.module?.code).filter((value): value is string => Boolean(value));
    return Array.from(new Set(values));
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (filterModule !== "all" && item.module?.code !== filterModule) {
        return false;
      }

      if (filterStatus !== "all" && item.status !== filterStatus) {
        return false;
      }

      return true;
    });
  }, [items, filterModule, filterStatus]);

  useEffect(() => {
    if (!filteredItems.find((item) => item.id === selectedId) && filteredItems[0]) {
      setSelectedId(filteredItems[0].id);
    }
  }, [filteredItems, selectedId]);

  const selectedItem =
    filteredItems.find((item) => item.id === selectedId) ??
    filteredItems[0] ??
    null;

  function openEditModal() {
    if (!selectedItem) {
      return;
    }

    setEditDraft(selectedItem.feedback ?? "");
    setShowEditModal(true);
  }

  function cancelEdit() {
    setShowEditModal(false);
    setEditDraft("");
  }

  async function saveEdit() {
    if (!selectedItem) {
      return;
    }

    setSaving(true);
    setPageError("");

    try {
      const updated = await updateSubmission(selectedItem.id, {
        feedback: editDraft,
      });

      if (!updated) {
        throw new Error("Could not save feedback.");
      }

      setItems((current) =>
        current.map((item) =>
          item.id === selectedItem.id
            ? { ...item, feedback: updated.feedback }
            : item
        )
      );

      cancelEdit();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not save feedback.";
      setPageError(message);
    } finally {
      setSaving(false);
    }
  }

  async function approveItem() {
    if (!selectedItem) {
      return;
    }

    setSaving(true);
    setPageError("");

    try {
      const updated = await updateSubmission(selectedItem.id, {
        status: "approved",
      });

      if (!updated) {
        throw new Error("Could not approve feedback.");
      }

      setItems((current) =>
        current.map((item) =>
          item.id === selectedItem.id
            ? { ...item, status: "approved" }
            : item
        )
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not approve feedback.";
      setPageError(message);
    } finally {
      setSaving(false);
    }
  }

  async function rejectItem() {
    if (!selectedItem) {
      return;
    }

    setSaving(true);
    setPageError("");

    try {
      const updated = await updateSubmission(selectedItem.id, {
        status: "rejected",
      });

      if (!updated) {
        throw new Error("Could not reject feedback.");
      }

      setItems((current) =>
        current.map((item) =>
          item.id === selectedItem.id
            ? { ...item, status: "rejected" }
            : item
        )
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not reject feedback.";
      setPageError(message);
    } finally {
      setSaving(false);
    }
  }

  if (loading || !user) return null;

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      <Sidebar />

      <main style={{ flex: 1, padding: "32px", overflowY: "auto" }}>
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#1e293b" }}>Feedback Review</h1>
          <p style={{ fontSize: "14px", color: "#64748b", marginTop: "4px" }}>
            Review AI-generated feedback before it is shown to students.
          </p>
        </div>

        {pageLoading && (
          <div style={{ backgroundColor: "#fff", borderRadius: "10px", border: "1px solid #e2e8f0", padding: "20px", fontSize: "14px", color: "#475569", marginBottom: "20px" }}>
            Loading feedback items...
          </div>
        )}

        {pageError && (
          <div style={{ backgroundColor: "#fef2f2", borderRadius: "10px", border: "1px solid #fecaca", padding: "16px", fontSize: "14px", color: "#b91c1c", marginBottom: "20px" }}>
            {pageError}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: "24px", alignItems: "start" }}>
          <div style={{ backgroundColor: "#fff", borderRadius: "10px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
            <div style={{ padding: "18px 20px", borderBottom: "1px solid #f1f5f9" }}>
              <h2 style={{ fontSize: "15px", fontWeight: "600", color: "#1e293b", marginBottom: "14px" }}>Submissions</h2>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <select value={filterModule} onChange={(e) => setFilterModule(e.target.value)} style={{ padding: "10px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "13px", color: "#1e293b", backgroundColor: "#fff" }}>
                  <option value="all">All Modules</option>
                  {moduleOptions.map((module) => (
                    <option key={module} value={module}>
                      {module}
                    </option>
                  ))}
                </select>

                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ padding: "10px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "13px", color: "#1e293b", backgroundColor: "#fff" }}>
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            <div style={{ maxHeight: "calc(100vh - 220px)", overflowY: "auto" }}>
              {filteredItems.length === 0 && (
                <div style={{ padding: "18px 20px", fontSize: "14px", color: "#64748b" }}>
                  No feedback items found.
                </div>
              )}

              {filteredItems.map((item, index) => {
                const isSelected = item.id === selectedItem?.id;
                const status = statusStyles[item.status];

                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      border: "none",
                      borderTop: index === 0 ? "none" : "1px solid #f1f5f9",
                      backgroundColor: isSelected ? "#eff6ff" : "#fff",
                      padding: "18px 20px",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                      <div>
                        <p style={{ fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>{item.student?.name ?? "Student"}</p>
                        <p style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
                          {item.module?.code ?? "Module"} · {item.assignment}
                        </p>
                        <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
                          Submitted {formatDate(item.submitted_date)}
                        </p>
                      </div>

                      <span style={{ fontSize: "11px", fontWeight: "500", color: status.color, backgroundColor: status.bg, padding: "4px 8px", borderRadius: "20px", flexShrink: 0 }}>
                        {status.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ backgroundColor: "#fff", borderRadius: "10px", border: "1px solid #e2e8f0", padding: "24px" }}>
            {!selectedItem && (
              <p style={{ fontSize: "14px", color: "#64748b" }}>
                Select a submission from the left to review it.
              </p>
            )}

            {selectedItem && (
              <>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", marginBottom: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div style={{ width: "42px", height: "42px", borderRadius: "50%", backgroundColor: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <User size={18} color="#2563eb" />
                    </div>

                    <div>
                      <h2 style={{ fontSize: "17px", fontWeight: "700", color: "#1e293b" }}>{selectedItem.student?.name ?? "Student"}</h2>
                      <p style={{ fontSize: "13px", color: "#64748b", marginTop: "2px" }}>
                        {selectedItem.student?.username ?? "-"} · {selectedItem.module?.code ?? "Module"} · Submitted {formatDate(selectedItem.submitted_date)}
                      </p>
                    </div>
                  </div>

                  <span style={{ fontSize: "12px", fontWeight: "500", color: statusStyles[selectedItem.status].color, backgroundColor: statusStyles[selectedItem.status].bg, padding: "4px 12px", borderRadius: "20px", flexShrink: 0 }}>
                    {statusStyles[selectedItem.status].label}
                  </span>
                </div>

                <div style={{ backgroundColor: "#f8fafc", borderRadius: "10px", padding: "16px 20px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ fontSize: "11px", color: "#64748b", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }}>Assignment</p>
                    <p style={{ fontSize: "14px", color: "#1e293b", fontWeight: "500", marginTop: "3px" }}>{selectedItem.assignment}</p>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: "11px", color: "#64748b", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }}>Suggested Grade</p>
                    <p style={{ fontSize: "26px", fontWeight: "700", color: "#1e293b", marginTop: "2px" }}>{selectedItem.grade ?? "-"}</p>
                  </div>
                </div>

                <div style={{ backgroundColor: "#fff", borderRadius: "10px", border: "1px solid #e2e8f0", padding: "20px", marginBottom: "20px" }}>
                  <h3 style={{ fontSize: "11px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "14px" }}>
                    AI-Generated Feedback
                  </h3>

                  <p style={{ fontSize: "14px", color: "#374151", lineHeight: "1.75", whiteSpace: "pre-line" }}>
                    {selectedItem.feedback ?? "No feedback found."}
                  </p>
                </div>

                {selectedItem.status === "pending" && (
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button onClick={rejectItem} disabled={saving} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 18px", borderRadius: "8px", border: "1px solid #fca5a5", backgroundColor: "#fff", color: "#dc2626", fontSize: "14px", fontWeight: "500", cursor: "pointer" }}>
                      <XCircle size={16} /> Reject
                    </button>

                    <button onClick={openEditModal} disabled={saving} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 18px", borderRadius: "8px", border: "1px solid #d1d5db", backgroundColor: "#fff", color: "#374151", fontSize: "14px", fontWeight: "500", cursor: "pointer" }}>
                      <Edit3 size={16} /> Edit
                    </button>

                    <button onClick={approveItem} disabled={saving} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 22px", borderRadius: "8px", border: "none", backgroundColor: "#16a34a", color: "#fff", fontSize: "14px", fontWeight: "600", cursor: "pointer", marginLeft: "auto" }}>
                      <CheckCircle size={16} /> Approve & Send
                    </button>
                  </div>
                )}

                {selectedItem.status === "approved" && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "14px 16px", backgroundColor: "#f0fdf4", borderRadius: "8px", border: "1px solid #bbf7d0" }}>
                    <CheckCircle size={16} color="#16a34a" />
                    <span style={{ fontSize: "14px", color: "#15803d", fontWeight: "500" }}>Feedback approved and sent to student.</span>
                  </div>
                )}

                {selectedItem.status === "rejected" && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "14px 16px", backgroundColor: "#fef2f2", borderRadius: "8px", border: "1px solid #fecaca" }}>
                    <XCircle size={16} color="#dc2626" />
                    <span style={{ fontSize: "14px", color: "#b91c1c", fontWeight: "500" }}>Feedback rejected. This submission needs more work before approval.</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {showEditModal && selectedItem && (
        <div onClick={cancelEdit} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "24px" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", width: "100%", maxWidth: "640px", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#1e293b" }}>Edit Feedback</h3>
                <p style={{ fontSize: "13px", color: "#64748b", marginTop: "2px" }}>
                  {selectedItem.student?.name ?? "Student"} · {selectedItem.assignment}
                </p>
              </div>

              <button onClick={cancelEdit} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", display: "flex" }}>
                <X size={18} color="#94a3b8" />
              </button>
            </div>

            <div style={{ padding: "20px 24px" }}>
              <textarea
                value={editDraft}
                onChange={(e) => setEditDraft(e.target.value)}
                rows={12}
                style={{ width: "100%", padding: "14px", borderRadius: "10px", border: "1px solid #d1d5db", fontSize: "14px", color: "#1e293b", lineHeight: "1.7", resize: "vertical", boxSizing: "border-box" }}
              />

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" }}>
                <button onClick={cancelEdit} disabled={saving} style={{ padding: "10px 16px", borderRadius: "8px", border: "1px solid #d1d5db", backgroundColor: "#fff", color: "#374151", fontSize: "14px", fontWeight: "500", cursor: "pointer" }}>
                  Cancel
                </button>

                <button onClick={saveEdit} disabled={saving} style={{ padding: "10px 18px", borderRadius: "8px", border: "none", backgroundColor: "#1e293b", color: "#fff", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

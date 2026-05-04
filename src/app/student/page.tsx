"use client";

// Student page.
// This now reads the logged-in student's real submissions from Supabase.

import { useAuthGuard } from "@/hooks/useAuthGuard";
import { clearStoredUser } from "@/lib/auth";
import { formatGradeDisplay } from "@/lib/grading";
import { fetchModules, fetchStudentSubmissionDetails } from "@/lib/supabase";
import { getSubmissionStage } from "@/lib/submission-content";
import type { SubmissionWithDetails } from "@/lib/types";
import type { DatabaseModule } from "@/lib/types";
import { CheckCircle, Clock, FileText, Loader2, LogOut, Upload, AlertCircle, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const allowedFileEndings = [".pdf", ".docx", ".txt"];

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
  const [modules, setModules] = useState<DatabaseModule[]>([]);
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [assignmentName, setAssignmentName] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) {
      return;
    }

    const studentId = user.id;

    // Load this student's submissions from Supabase.
    async function loadSubmissions() {
      try {
        const [items, moduleRows] = await Promise.all([
          fetchStudentSubmissionDetails(studentId),
          fetchModules(),
        ]);
        setSubmissions(items);
        setModules(moduleRows);

        if (moduleRows[0]) {
          setSelectedModuleId(moduleRows[0].id);
        }
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

  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function isAllowedFile(file: File) {
    const name = file.name.toLowerCase();
    return allowedFileEndings.some((ending) => name.endsWith(ending));
  }

  function addFiles(fileList: FileList) {
    const incomingFiles = Array.from(fileList);
    const validFiles = incomingFiles.filter(isAllowedFile);
    const invalidFiles = incomingFiles.filter((file) => !isAllowedFile(file));

    if (invalidFiles.length > 0) {
      setSubmitError("Only PDF, DOCX, and TXT files can be uploaded.");
    } else {
      setSubmitError("");
    }

    setFiles((current) => {
      const nextFiles = [...current];

      for (const file of validFiles) {
        const duplicate = nextFiles.find(
          (item) => item.name === file.name && item.size === file.size
        );

        if (!duplicate) {
          nextFiles.push(file);
        }
      }

      return nextFiles;
    });
  }

  function removeFile(index: number) {
    setFiles((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  async function refreshSubmissions() {
    if (!user) {
      return;
    }

    const items = await fetchStudentSubmissionDetails(user.id);
    setSubmissions(items);
  }

  async function submitAssignment() {
    if (!user) {
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    setSubmitSuccess("");

    try {
      const formData = new FormData();
      formData.append("studentId", user.id);
      formData.append("moduleId", selectedModuleId);
      formData.append("assignment", assignmentName || "Assignment");
      formData.append("submittedDate", new Date().toISOString().slice(0, 10));

      for (const file of files) {
        formData.append("files", file);
      }

      const response = await fetch("/api/submit-assignment", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not submit your assignment.");
      }

      setAssignmentName("");
      setFiles([]);
      setSubmitSuccess("Assignment submitted successfully. Your lecturer can now mark it from the review queue.");
      await refreshSubmissions();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not submit your assignment.";
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
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
            Submit your work here, then come back later to read approved feedback from your lecturer.
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

        <div style={{ backgroundColor: "#fff", borderRadius: "10px", border: "1px solid #e2e8f0", padding: "24px", marginBottom: "24px" }}>
          <div style={{ marginBottom: "18px" }}>
            <h2 style={{ fontSize: "16px", fontWeight: "700", color: "#1e293b" }}>Submit Assignment</h2>
            <p style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
              Step 1: upload your file. Step 2: your lecturer reviews and marks it. Step 3: approved feedback appears below.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "#374151", marginBottom: "6px" }}>Module</label>
              <select value={selectedModuleId} onChange={(e) => setSelectedModuleId(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px", color: "#1e293b", backgroundColor: "#fff" }}>
                {modules.map((module) => (
                  <option key={module.id} value={module.id}>
                    {module.code} - {module.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "#374151", marginBottom: "6px" }}>Assignment Name</label>
              <input value={assignmentName} onChange={(e) => setAssignmentName(e.target.value)} placeholder="e.g. Essay 1" style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px", color: "#1e293b", boxSizing: "border-box" }} />
            </div>
          </div>

          <div
            onClick={() => fileInput.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              if (e.dataTransfer.files.length > 0) {
                addFiles(e.dataTransfer.files);
              }
            }}
            style={{ border: `2px dashed ${dragOver ? "#3b82f6" : "#cbd5e1"}`, borderRadius: "12px", padding: "28px 20px", textAlign: "center", backgroundColor: dragOver ? "#eff6ff" : "#f8fafc", cursor: "pointer", transition: "all 0.15s ease" }}
          >
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "10px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Upload size={20} color="#2563eb" />
              </div>
            </div>

                <p style={{ fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>Drag and drop your assignment here</p>
                <p style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>or click to choose files</p>
                <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "10px" }}>Accepted: .pdf, .docx, .txt</p>
              </div>

          <input
            ref={fileInput}
            type="file"
            multiple
            accept=".pdf,.docx,.txt"
            onChange={(e) => {
              if (e.target.files) {
                addFiles(e.target.files);
              }
            }}
            style={{ display: "none" }}
          />

          {files.length > 0 && (
            <ul style={{ listStyle: "none", margin: "18px 0 0 0", padding: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
              {files.map((file, index) => (
                <li key={`${file.name}-${index}`} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px", borderRadius: "8px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                  <FileText size={16} color="#2563eb" />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "13px", color: "#1e293b", fontWeight: "500" }}>{file.name}</p>
                    <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>{formatSize(file.size)}</p>
                  </div>
                  <button onClick={() => removeFile(index)} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", display: "flex" }}>
                    <X size={14} color="#94a3b8" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {submitError && (
            <div style={{ marginTop: "14px", padding: "12px 14px", borderRadius: "8px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", display: "flex", gap: "8px" }}>
              <AlertCircle size={15} color="#dc2626" style={{ flexShrink: 0, marginTop: "1px" }} />
              <p style={{ fontSize: "13px", color: "#b91c1c", lineHeight: "1.5" }}>{submitError}</p>
            </div>
          )}

          {submitSuccess && (
            <div style={{ marginTop: "14px", padding: "12px 14px", borderRadius: "8px", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", display: "flex", gap: "8px" }}>
              <CheckCircle size={15} color="#16a34a" style={{ flexShrink: 0, marginTop: "1px" }} />
              <p style={{ fontSize: "13px", color: "#15803d", lineHeight: "1.5" }}>{submitSuccess}</p>
            </div>
          )}

          <button
            onClick={submitAssignment}
            disabled={submitting || !selectedModuleId || !assignmentName.trim() || files.length === 0}
            style={{ marginTop: "16px", padding: "12px 18px", borderRadius: "8px", border: "none", backgroundColor: submitting ? "#475569" : "#1e293b", color: "#fff", fontSize: "14px", fontWeight: "600", cursor: submitting ? "not-allowed" : "pointer", display: "inline-flex", alignItems: "center", gap: "8px" }}
          >
            {submitting && <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />}
            {submitting ? "Submitting..." : "Submit Assignment"}
          </button>
        </div>

        {!pageLoading && !pageError && submissions.length === 0 && (
          <div style={{ backgroundColor: "#fff", borderRadius: "10px", border: "1px solid #e2e8f0", padding: "20px", fontSize: "14px", color: "#475569" }}>
            No submissions found yet.
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {submissions.map((submission) => (
            <div key={submission.id} style={{ backgroundColor: "#fff", borderRadius: "10px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
              {(() => {
                const stage = getSubmissionStage(submission);
                const stageBadge =
                  stage === "approved"
                    ? { label: "Feedback ready", color: "#16a34a", bg: "#dcfce7", icon: CheckCircle }
                    : stage === "generated"
                      ? { label: "Awaiting approval", color: "#d97706", bg: "#fef3c7", icon: Clock }
                      : { label: "Submitted", color: "#2563eb", bg: "#dbeafe", icon: Clock };
                const StageIcon = stageBadge.icon;

                return (
              <div style={{ padding: "18px 20px", borderBottom: submission.status === "approved" ? "1px solid #f1f5f9" : "none", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
                <div>
                  <span style={{ fontSize: "11px", fontWeight: "600", color: "#3b82f6", backgroundColor: "#eff6ff", padding: "2px 8px", borderRadius: "4px" }}>
                    {submission.module?.code ?? "Module"}
                  </span>
                  <p style={{ fontSize: "15px", fontWeight: "600", color: "#1e293b", marginTop: "8px" }}>{submission.assignment}</p>
                  <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "3px" }}>Submitted {formatDate(submission.submitted_date)}</p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
                  {stage === "approved" && submission.grade && (
                    <span style={{ fontSize: "20px", fontWeight: "700", color: "#1e293b", backgroundColor: "#f1f5f9", padding: "4px 14px", borderRadius: "8px" }}>
                      {formatGradeDisplay(submission.grade)}
                    </span>
                  )}

                  <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", fontWeight: "500", color: stageBadge.color, backgroundColor: stageBadge.bg, padding: "4px 10px", borderRadius: "20px" }}>
                    <StageIcon size={12} /> {stageBadge.label}
                  </span>
                </div>
              </div>
                );
              })()}

              {getSubmissionStage(submission) === "approved" && submission.feedback && (
                <div style={{ padding: "20px" }}>
                  <p style={{ fontSize: "14px", color: "#374151", lineHeight: "1.75", whiteSpace: "pre-line" }}>
                    {submission.feedback}
                  </p>
                </div>
              )}

              {getSubmissionStage(submission) !== "approved" && (
                <div style={{ padding: "20px", backgroundColor: "#fffbeb", display: "flex", alignItems: "center", gap: "10px" }}>
                  <Clock size={15} color="#d97706" />
                  <p style={{ fontSize: "13px", color: "#92400e" }}>
                    {getSubmissionStage(submission) === "submitted"
                      ? "Your work has been submitted. Your lecturer still needs to mark it."
                      : "Your lecturer has generated feedback and is reviewing it before release."}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

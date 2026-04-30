"use client";

// Upload page.
// This version sends the real uploaded files to the API route.

import Sidebar from "@/components/Sidebar";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { formatGradeDisplay } from "@/lib/grading";
import { createSubmission, fetchModules, fetchUsers } from "@/lib/supabase";
import type { DatabaseModule, PublicUser } from "@/lib/types";
import { Upload, FileText, X, Info, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const criteria = [
  { label: "Critical Analysis", weight: 30 },
  { label: "Structure & Clarity", weight: 25 },
  { label: "Use of Sources", weight: 25 },
  { label: "Originality", weight: 20 },
];

export default function UploadPage() {
  const { user, loading } = useAuthGuard("lecturer");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [assignmentName, setAssignmentName] = useState("");
  const [deadline, setDeadline] = useState("");
  const [tone, setTone] = useState("Constructive");
  const [students, setStudents] = useState<PublicUser[]>([]);
  const [modules, setModules] = useState<DatabaseModule[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ feedback: string; grade: string } | null>(null);
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadFormData() {
      try {
        const [studentRows, moduleRows] = await Promise.all([
          fetchUsers("student"),
          fetchModules(),
        ]);

        setStudents(studentRows);
        setModules(moduleRows);

        if (studentRows[0]) {
          setSelectedStudentId(studentRows[0].id);
        }

        if (moduleRows[0]) {
          setSelectedModuleId(moduleRows[0].id);
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Could not load form data.";
        setPageError(message);
      } finally {
        setPageLoading(false);
      }
    }

    loadFormData();
  }, []);

  if (loading || !user) return null;

  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function addFiles(fileList: FileList) {
    const newFiles = Array.from(fileList);
    setFiles((current) => [...current, ...newFiles]);
  }

  function removeFile(index: number) {
    setFiles((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  async function handleGenerate() {
    setGenerating(true);
    setSaving(false);
    setResult(null);
    setApiError("");
    setSuccessMessage("");

    try {
      const student = students.find((item) => item.id === selectedStudentId);
      const selectedModule = modules.find((item) => item.id === selectedModuleId);
      const formData = new FormData();

      // Send the simple text fields first.
      formData.append("studentName", student?.name ?? "Sample Student");
      formData.append("module", selectedModule?.code ?? "General");
      formData.append("assignment", assignmentName || "Assignment");
      formData.append("criteria", criteria.map((item) => `${item.label} (${item.weight}%)`).join(", "));
      formData.append("tone", tone);

      // Then send the uploaded files themselves.
      for (const file of files) {
        formData.append("files", file);
      }

      const response = await fetch("/api/generate-feedback", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setApiError(data.error || "Something went wrong. Please try again.");
        setGenerating(false);
        return;
      }

      setResult(data);
      setGenerating(false);
      setSaving(true);

      await createSubmission({
        student_id: selectedStudentId,
        module_id: selectedModuleId,
        assignment: assignmentName || "Assignment",
        submitted_date: deadline || new Date().toISOString().slice(0, 10),
        status: "pending",
        feedback: data.feedback,
        grade: data.grade,
      });

      setSuccessMessage("Feedback generated and saved to the review queue.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not generate feedback.";
      setApiError(message);
    } finally {
      setGenerating(false);
      setSaving(false);
    }
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />

      <main style={{ flex: 1, padding: "32px", overflowY: "auto" }}>
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#1e293b" }}>Upload Assignments</h1>
          <p style={{ fontSize: "14px", color: "#64748b", marginTop: "4px" }}>
            Upload student submissions and configure the assessment before generating AI feedback.
          </p>
        </div>

        {pageLoading && (
          <div style={{ backgroundColor: "#fff", borderRadius: "10px", border: "1px solid #e2e8f0", padding: "20px", fontSize: "14px", color: "#475569", marginBottom: "20px" }}>
            Loading form data...
          </div>
        )}

        {pageError && (
          <div style={{ backgroundColor: "#fef2f2", borderRadius: "10px", border: "1px solid #fecaca", padding: "20px", fontSize: "14px", color: "#b91c1c", marginBottom: "20px" }}>
            {pageError}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "24px", alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ backgroundColor: "#fff", borderRadius: "10px", border: "1px solid #e2e8f0", padding: "24px" }}>
              <h2 style={{ fontSize: "15px", fontWeight: "600", color: "#1e293b", marginBottom: "20px" }}>Assignment Details</h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "#374151", marginBottom: "6px" }}>Student</label>
                  <select value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px", color: "#1e293b", backgroundColor: "#fff", outline: "none" }}>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "#374151", marginBottom: "6px" }}>Module</label>
                  <select value={selectedModuleId} onChange={(e) => setSelectedModuleId(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px", color: "#1e293b", backgroundColor: "#fff", outline: "none" }}>
                    {modules.map((module) => (
                      <option key={module.id} value={module.id}>
                        {module.code} - {module.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "#374151", marginBottom: "6px" }}>Assignment Name</label>
                  <input value={assignmentName} onChange={(e) => setAssignmentName(e.target.value)} placeholder="e.g. Essay 1" style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px", color: "#1e293b", outline: "none", boxSizing: "border-box" }} />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "#374151", marginBottom: "6px" }}>Submission Date</label>
                  <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px", color: "#1e293b", outline: "none", boxSizing: "border-box" }} />
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: "#fff", borderRadius: "10px", border: "1px solid #e2e8f0", padding: "24px" }}>
              <h2 style={{ fontSize: "15px", fontWeight: "600", color: "#1e293b", marginBottom: "18px" }}>Student Files</h2>

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
                style={{ border: `2px dashed ${dragOver ? "#3b82f6" : "#cbd5e1"}`, borderRadius: "12px", padding: "30px 20px", textAlign: "center", backgroundColor: dragOver ? "#eff6ff" : "#f8fafc", cursor: "pointer", transition: "all 0.15s ease" }}
              >
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "10px" }}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Upload size={20} color="#2563eb" />
                  </div>
                </div>

                <p style={{ fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>Drag and drop files here</p>
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
            </div>
          </div>

          <div style={{ backgroundColor: "#fff", borderRadius: "10px", border: "1px solid #e2e8f0", padding: "24px" }}>
            <h2 style={{ fontSize: "15px", fontWeight: "600", color: "#1e293b", marginBottom: "6px" }}>Assessment Criteria</h2>
            <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "20px" }}>Weights sent to the AI when generating feedback.</p>

            {criteria.map((item) => (
              <div key={item.label} style={{ marginBottom: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontSize: "13px", color: "#374151", fontWeight: "500" }}>{item.label}</span>
                  <span style={{ fontSize: "13px", color: "#64748b" }}>{item.weight}%</span>
                </div>

                <div style={{ height: "6px", backgroundColor: "#f1f5f9", borderRadius: "99px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${item.weight}%`, backgroundColor: "#3b82f6", borderRadius: "99px" }} />
                </div>
              </div>
            ))}

            <div style={{ marginTop: "20px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "#374151", marginBottom: "6px" }}>Feedback Tone</label>
              <select value={tone} onChange={(e) => setTone(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "13px", color: "#1e293b", backgroundColor: "#fff", outline: "none" }}>
                <option>Constructive</option>
                <option>Direct</option>
                <option>Encouraging</option>
              </select>
            </div>

            <div style={{ marginTop: "16px", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "12px", display: "flex", gap: "8px" }}>
              <Info size={14} color="#16a34a" style={{ flexShrink: 0, marginTop: "1px" }} />
              <p style={{ fontSize: "12px", color: "#15803d", lineHeight: "1.5" }}>
                All AI-generated feedback is a draft only. You will review and approve each piece before students receive it.
              </p>
            </div>

            <button
              onClick={handleGenerate}
              disabled={generating || saving || !selectedStudentId || !selectedModuleId || files.length === 0}
              style={{ width: "100%", marginTop: "16px", padding: "12px", borderRadius: "8px", backgroundColor: generating || saving ? "#475569" : "#1e293b", color: "#fff", fontSize: "14px", fontWeight: "600", border: "none", cursor: generating || saving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
            >
              {(generating || saving) && <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />}
              {generating ? "Generating..." : saving ? "Saving..." : "Generate Feedback"}
            </button>

            {apiError && (
              <div style={{ marginTop: "12px", padding: "12px 14px", borderRadius: "8px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", display: "flex", gap: "8px" }}>
                <AlertCircle size={15} color="#dc2626" style={{ flexShrink: 0, marginTop: "1px" }} />
                <p style={{ fontSize: "13px", color: "#b91c1c", lineHeight: "1.5" }}>{apiError}</p>
              </div>
            )}

            {successMessage && (
              <div style={{ marginTop: "12px", padding: "12px 14px", borderRadius: "8px", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", display: "flex", gap: "8px" }}>
                <CheckCircle size={15} color="#16a34a" style={{ flexShrink: 0, marginTop: "1px" }} />
                <p style={{ fontSize: "13px", color: "#15803d", lineHeight: "1.5" }}>{successMessage}</p>
              </div>
            )}

            {result && (
              <div style={{ marginTop: "16px", borderRadius: "8px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
                <div style={{ padding: "12px 16px", backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <CheckCircle size={14} color="#16a34a" />
                    <span style={{ fontSize: "13px", fontWeight: "600", color: "#1e293b" }}>Feedback Generated</span>
                  </div>

                  <span style={{ fontSize: "15px", fontWeight: "700", color: "#1e293b", backgroundColor: "#e2e8f0", padding: "2px 10px", borderRadius: "6px" }}>
                    {formatGradeDisplay(result.grade)}
                  </span>
                </div>

                <div style={{ padding: "14px 16px", fontSize: "13px", color: "#374151", lineHeight: "1.7", whiteSpace: "pre-line", maxHeight: "200px", overflowY: "auto" }}>
                  {result.feedback}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

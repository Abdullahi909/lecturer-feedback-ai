"use client";

import Sidebar from "@/components/Sidebar";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { Upload, FileText, X, Info, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useState, useRef } from "react";

const modules = [
  { code: "CS101", name: "Introduction to Computing" },
  { code: "CS201", name: "Data Structures & Algorithms" },
  { code: "CS310", name: "Software Engineering" },
  { code: "CS415", name: "Machine Learning" },
];

// Fixed criteria weights sent to the AI with every feedback request
const criteria = [
  { label: "Critical Analysis",  weight: 30 },
  { label: "Structure & Clarity", weight: 25 },
  { label: "Use of Sources",      weight: 25 },
  { label: "Originality",         weight: 20 },
];

type UploadedFile  = { name: string; size: string };
type FeedbackResult = { feedback: string; grade: string };

export default function UploadPage() {
  const { user, loading } = useAuthGuard("lecturer");

  const [selectedModule, setSelectedModule] = useState("");
  const [assignmentName, setAssignmentName] = useState("");
  const [deadline,       setDeadline]       = useState("");
  const [tone,           setTone]           = useState("Constructive");
  const [dragOver,       setDragOver]       = useState(false);
  const [files,          setFiles]          = useState<UploadedFile[]>([]);
  const [generating,     setGenerating]     = useState(false);
  const [result,         setResult]         = useState<FeedbackResult | null>(null);
  const [apiError,       setApiError]       = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (loading || !user) return null;

  function formatSize(bytes: number): string {
    if (bytes < 1024)        return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function handleFiles(fileList: FileList) {
    const newFiles: UploadedFile[] = Array.from(fileList).map((f) => ({
      name: f.name,
      size: formatSize(f.size),
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleGenerate() {
    setGenerating(true);
    setResult(null);
    setApiError(null);

    try {
      const res = await fetch("/api/generate-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // In production, studentName would come from parsing the uploaded file
          studentName: "Sample Student",
          module:      selectedModule || "General",
          assignment:  assignmentName || "Assignment",
          criteria:    criteria.map((c) => `${c.label} (${c.weight}%)`).join(", "),
          tone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setApiError(data.error ?? "Something went wrong. Please try again.");
      } else {
        setResult(data as FeedbackResult);
      }
    } catch {
      setApiError("Network error. Please check your connection and try again.");
    } finally {
      setGenerating(false);
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

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "24px", alignItems: "start" }}>
          {/* Left — assignment details + file upload */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ backgroundColor: "#fff", borderRadius: "10px", border: "1px solid #e2e8f0", padding: "24px" }}>
              <h2 style={{ fontSize: "15px", fontWeight: "600", color: "#1e293b", marginBottom: "20px" }}>Assignment Details</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "#374151", marginBottom: "6px" }}>Module</label>
                  <select
                    value={selectedModule}
                    onChange={(e) => setSelectedModule(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px", color: "#1e293b", backgroundColor: "#fff", outline: "none", cursor: "pointer" }}
                  >
                    <option value="">Select a module...</option>
                    {modules.map((m) => (
                      <option key={m.code} value={m.code}>{m.code} — {m.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "#374151", marginBottom: "6px" }}>Assignment Name</label>
                  <input
                    type="text"
                    value={assignmentName}
                    onChange={(e) => setAssignmentName(e.target.value)}
                    placeholder="e.g. Essay 1 — Critical Analysis"
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px", color: "#1e293b", outline: "none" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "#374151", marginBottom: "6px" }}>Feedback Deadline</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px", color: "#1e293b", outline: "none" }}
                  />
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: "#fff", borderRadius: "10px", border: "1px solid #e2e8f0", padding: "24px" }}>
              <h2 style={{ fontSize: "15px", fontWeight: "600", color: "#1e293b", marginBottom: "20px" }}>Student Submissions</h2>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files) handleFiles(e.dataTransfer.files); }}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${dragOver ? "#3b82f6" : "#cbd5e1"}`,
                  borderRadius: "10px",
                  backgroundColor: dragOver ? "#eff6ff" : "#f8fafc",
                  padding: "40px 24px",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  marginBottom: files.length > 0 ? "16px" : "0",
                }}
              >
                <Upload size={28} color={dragOver ? "#3b82f6" : "#94a3b8"} style={{ margin: "0 auto 12px" }} />
                <p style={{ fontSize: "14px", fontWeight: "500", color: "#475569" }}>Drag and drop files here</p>
                <p style={{ fontSize: "13px", color: "#94a3b8", marginTop: "4px" }}>
                  or <span style={{ color: "#3b82f6", fontWeight: "500" }}>browse to upload</span>
                </p>
                <p style={{ fontSize: "12px", color: "#cbd5e1", marginTop: "8px" }}>Accepts PDF, DOCX, TXT — up to 10 MB each</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.docx,.txt"
                  style={{ display: "none" }}
                  onChange={(e) => { if (e.target.files) handleFiles(e.target.files); }}
                />
              </div>
              {files.length > 0 && (
                <ul style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {files.map((f, i) => (
                    <li key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "8px", border: "1px solid #e2e8f0", backgroundColor: "#f8fafc" }}>
                      <FileText size={16} color="#3b82f6" />
                      <span style={{ flex: 1, fontSize: "13px", color: "#1e293b" }}>{f.name}</span>
                      <span style={{ fontSize: "12px", color: "#94a3b8" }}>{f.size}</span>
                      <button onClick={() => removeFile(i)} style={{ background: "none", border: "none", cursor: "pointer", padding: "2px", display: "flex", alignItems: "center" }}>
                        <X size={14} color="#94a3b8" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Right — criteria config + generate button */}
          <div style={{ backgroundColor: "#fff", borderRadius: "10px", border: "1px solid #e2e8f0", padding: "24px" }}>
            <h2 style={{ fontSize: "15px", fontWeight: "600", color: "#1e293b", marginBottom: "6px" }}>Assessment Criteria</h2>
            <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "20px" }}>Weights sent to the AI when generating feedback.</p>

            {criteria.map((c) => (
              <div key={c.label} style={{ marginBottom: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontSize: "13px", color: "#374151", fontWeight: "500" }}>{c.label}</span>
                  <span style={{ fontSize: "13px", color: "#64748b" }}>{c.weight}%</span>
                </div>
                <div style={{ height: "6px", backgroundColor: "#f1f5f9", borderRadius: "99px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${c.weight}%`, backgroundColor: "#3b82f6", borderRadius: "99px" }} />
                </div>
              </div>
            ))}

            <div style={{ marginTop: "20px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "#374151", marginBottom: "6px" }}>Feedback Tone</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "13px", color: "#1e293b", backgroundColor: "#fff", outline: "none" }}
              >
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
              disabled={generating}
              style={{
                width: "100%",
                marginTop: "16px",
                padding: "12px",
                borderRadius: "8px",
                backgroundColor: generating ? "#475569" : "#1e293b",
                color: "#ffffff",
                fontSize: "14px",
                fontWeight: "600",
                border: "none",
                cursor: generating ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              {/* Spinner — @keyframes can't be inlined in a style prop, so it's injected below */}
              {generating && <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />}
              {generating ? "Generating..." : "Generate Feedback"}
            </button>

            {apiError && (
              <div style={{ marginTop: "12px", padding: "12px 14px", borderRadius: "8px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", display: "flex", gap: "8px" }}>
                <AlertCircle size={15} color="#dc2626" style={{ flexShrink: 0, marginTop: "1px" }} />
                <p style={{ fontSize: "13px", color: "#b91c1c", lineHeight: "1.5" }}>{apiError}</p>
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
                    {result.grade}
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

      {/* Keyframe animation for the loading spinner — can't live in a style prop */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

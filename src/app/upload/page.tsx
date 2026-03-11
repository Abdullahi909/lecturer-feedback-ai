"use client";

import Sidebar from "@/components/Sidebar";
import { Upload, FileText, X, Info } from "lucide-react";
import { useState, useRef } from "react";

const modules = [
  { code: "CS101", name: "Introduction to Computing" },
  { code: "CS201", name: "Data Structures & Algorithms" },
  { code: "CS310", name: "Software Engineering" },
  { code: "CS415", name: "Machine Learning" },
];

type UploadedFile = {
  name: string;
  size: string;
};

export default function UploadPage() {
  const [selectedModule, setSelectedModule] = useState("");
  const [assignmentName, setAssignmentName] = useState("");
  const [deadline, setDeadline] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
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

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />

      <main style={{ flex: 1, padding: "32px", overflowY: "auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#1e293b" }}>
            Upload Assignments
          </h1>
          <p style={{ fontSize: "14px", color: "#64748b", marginTop: "4px" }}>
            Upload student submissions and configure the assessment before generating feedback.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "24px", alignItems: "start" }}>
          {/* Left — main form */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Assignment details */}
            <div
              style={{
                backgroundColor: "#fff",
                borderRadius: "10px",
                border: "1px solid #e2e8f0",
                padding: "24px",
              }}
            >
              <h2 style={{ fontSize: "15px", fontWeight: "600", color: "#1e293b", marginBottom: "20px" }}>
                Assignment Details
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Module */}
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "#374151", marginBottom: "6px" }}>
                    Module
                  </label>
                  <select
                    value={selectedModule}
                    onChange={(e) => setSelectedModule(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "1px solid #d1d5db",
                      fontSize: "14px",
                      color: "#1e293b",
                      backgroundColor: "#fff",
                      outline: "none",
                      cursor: "pointer",
                    }}
                  >
                    <option value="">Select a module...</option>
                    {modules.map((m) => (
                      <option key={m.code} value={m.code}>
                        {m.code} — {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Assignment name */}
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "#374151", marginBottom: "6px" }}>
                    Assignment Name
                  </label>
                  <input
                    type="text"
                    value={assignmentName}
                    onChange={(e) => setAssignmentName(e.target.value)}
                    placeholder="e.g. Essay 1 — Critical Analysis"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "1px solid #d1d5db",
                      fontSize: "14px",
                      color: "#1e293b",
                      outline: "none",
                    }}
                  />
                </div>

                {/* Deadline */}
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "#374151", marginBottom: "6px" }}>
                    Feedback Deadline
                  </label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "1px solid #d1d5db",
                      fontSize: "14px",
                      color: "#1e293b",
                      outline: "none",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* File upload */}
            <div
              style={{
                backgroundColor: "#fff",
                borderRadius: "10px",
                border: "1px solid #e2e8f0",
                padding: "24px",
              }}
            >
              <h2 style={{ fontSize: "15px", fontWeight: "600", color: "#1e293b", marginBottom: "20px" }}>
                Student Submissions
              </h2>

              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
                }}
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
                <Upload
                  size={28}
                  color={dragOver ? "#3b82f6" : "#94a3b8"}
                  style={{ margin: "0 auto 12px" }}
                />
                <p style={{ fontSize: "14px", fontWeight: "500", color: "#475569" }}>
                  Drag and drop files here
                </p>
                <p style={{ fontSize: "13px", color: "#94a3b8", marginTop: "4px" }}>
                  or <span style={{ color: "#3b82f6", fontWeight: "500" }}>browse to upload</span>
                </p>
                <p style={{ fontSize: "12px", color: "#cbd5e1", marginTop: "8px" }}>
                  Accepts PDF, DOCX, TXT — up to 10 MB each
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.docx,.txt"
                  style={{ display: "none" }}
                  onChange={(e) => { if (e.target.files) handleFiles(e.target.files); }}
                />
              </div>

              {/* File list */}
              {files.length > 0 && (
                <ul style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {files.map((f, i) => (
                    <li
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        backgroundColor: "#f8fafc",
                      }}
                    >
                      <FileText size={16} color="#3b82f6" />
                      <span style={{ flex: 1, fontSize: "13px", color: "#1e293b" }}>{f.name}</span>
                      <span style={{ fontSize: "12px", color: "#94a3b8" }}>{f.size}</span>
                      <button
                        onClick={() => removeFile(i)}
                        style={{ background: "none", border: "none", cursor: "pointer", padding: "2px", display: "flex", alignItems: "center" }}
                      >
                        <X size={14} color="#94a3b8" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Right — rubric config (coming next) */}
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "10px",
              border: "1px solid #e2e8f0",
              padding: "24px",
            }}
          >
            <h2 style={{ fontSize: "15px", fontWeight: "600", color: "#1e293b", marginBottom: "6px" }}>
              Assessment Criteria
            </h2>
            <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "20px" }}>
              Configure what the AI should focus on when generating feedback.
            </p>

            {/* Criteria weights */}
            {[
              { label: "Critical Analysis", weight: 30 },
              { label: "Structure & Clarity", weight: 25 },
              { label: "Use of Sources", weight: 25 },
              { label: "Originality", weight: 20 },
            ].map((c) => (
              <div key={c.label} style={{ marginBottom: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontSize: "13px", color: "#374151", fontWeight: "500" }}>{c.label}</span>
                  <span style={{ fontSize: "13px", color: "#64748b" }}>{c.weight}%</span>
                </div>
                <div style={{ height: "6px", backgroundColor: "#f1f5f9", borderRadius: "99px", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${c.weight}%`,
                      backgroundColor: "#3b82f6",
                      borderRadius: "99px",
                    }}
                  />
                </div>
              </div>
            ))}

            {/* Tone */}
            <div style={{ marginTop: "20px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "#374151", marginBottom: "6px" }}>
                Feedback Tone
              </label>
              <select
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  fontSize: "13px",
                  color: "#1e293b",
                  backgroundColor: "#fff",
                  outline: "none",
                }}
              >
                <option>Constructive</option>
                <option>Direct</option>
                <option>Encouraging</option>
              </select>
            </div>

            {/* Info note */}
            <div
              style={{
                marginTop: "20px",
                backgroundColor: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: "8px",
                padding: "12px",
                display: "flex",
                gap: "8px",
              }}
            >
              <Info size={14} color="#16a34a" style={{ flexShrink: 0, marginTop: "1px" }} />
              <p style={{ fontSize: "12px", color: "#15803d", lineHeight: "1.5" }}>
                All AI-generated feedback is a draft only. You will review and approve each piece before students receive it.
              </p>
            </div>

            {/* Submit */}
            <button
              style={{
                width: "100%",
                marginTop: "20px",
                padding: "12px",
                borderRadius: "8px",
                backgroundColor: "#1e293b",
                color: "#ffffff",
                fontSize: "14px",
                fontWeight: "600",
                border: "none",
                cursor: "pointer",
              }}
            >
              Generate Feedback
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

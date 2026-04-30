// API route — called by the upload page when the lecturer clicks "Generate Feedback".
// This version reads the real uploaded files, extracts text, and sends that text to Claude.

import mammoth from "mammoth";
import { NextRequest, NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";

// Use the Node runtime because the file parsers need it.
export const runtime = "nodejs";

const MODEL = "claude-haiku-4-5-20251001";

// System prompt — tells Claude how to behave and grade.
const SYSTEM_PROMPT = `
You are an experienced university lecturer writing constructive feedback on student assignments.

GRADING SCALE (UK Higher Education):
- A  = 70% and above  — Excellent, exceeds expectations
- B+ = 65–69%         — Very good, strong understanding
- B  = 60–64%         — Good, meets expectations well
- B- = 55–59%         — Mostly good, some gaps
- C+ = 52–54%         — Satisfactory, noticeable weaknesses
- C  = 50–51%         — Adequate but needs improvement
- D  = 40–49%         — Below standard, significant issues
- F  = Below 40%      — Fails to meet requirements

FEEDBACK STRUCTURE — write exactly 3 short paragraphs:
1. Strengths — what the student did well
2. Areas for improvement — specific, actionable suggestions
3. Overall summary — brief closing comment and grade justification

TONE — match the requested tone (Constructive, Direct, or Encouraging). Always be respectful.

End your response with exactly this line (nothing else after it):
GRADE: X
`.trim();

// Limit the amount of submission text sent to the AI.
const MAX_SUBMISSION_TEXT = 12000;

// Read one uploaded file and turn it into text.
async function extractTextFromFile(file: File) {
  const fileName = file.name.toLowerCase();
  const fileBuffer = Buffer.from(await file.arrayBuffer());

  if (fileName.endsWith(".txt")) {
    return fileBuffer.toString("utf8");
  }

  if (fileName.endsWith(".docx")) {
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    return result.value;
  }

  if (fileName.endsWith(".pdf")) {
    const parser = new PDFParse({ data: fileBuffer });
    const result = await parser.getText();
    await parser.destroy();
    return result.text;
  }

  throw new Error(`Unsupported file type: ${file.name}`);
}

// Read all files and join their text together.
async function extractSubmissionText(files: File[]) {
  const parts: string[] = [];

  for (const file of files) {
    const text = await extractTextFromFile(file);
    const cleanText = text.replace(/\s+/g, " ").trim();

    if (cleanText) {
      parts.push(`File: ${file.name}\n${cleanText}`);
    }
  }

  if (parts.length === 0) {
    throw new Error("No readable text was found in the uploaded files.");
  }

  return parts.join("\n\n").slice(0, MAX_SUBMISSION_TEXT);
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY ?? "";

  if (!apiKey) {
    return NextResponse.json(
      { error: "AI service is not configured. Add ANTHROPIC_API_KEY to your environment variables." },
      { status: 503 }
    );
  }

  // Read the multipart form data from the upload page.
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const studentName = String(formData.get("studentName") ?? "the student");
  const moduleCode = String(formData.get("module") ?? "General");
  const assignment = String(formData.get("assignment") ?? "Assignment");
  const criteria = String(
    formData.get("criteria") ??
      "Critical Analysis (30%), Structure & Clarity (25%), Use of Sources (25%), Originality (20%)"
  );
  const tone = String(formData.get("tone") ?? "Constructive");
  const files = formData.getAll("files").filter((item): item is File => item instanceof File);

  if (files.length === 0) {
    return NextResponse.json({ error: "Please upload at least one file." }, { status: 400 });
  }

  let submissionText = "";

  try {
    submissionText = await extractSubmissionText(files);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not read the uploaded files.";

    return NextResponse.json({ error: message }, { status: 400 });
  }

  const userMessage = `
Please write feedback for the following student submission.

Student: ${studentName}
Module: ${moduleCode}
Assignment: ${assignment}
Assessment Criteria: ${criteria}
Requested Tone: ${tone}

Submission Content:
${submissionText}

Write the feedback now. End with GRADE: X on its own line.
`.trim();

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 900,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      return NextResponse.json({ error: err?.error?.message ?? "AI service error." }, { status: response.status });
    }

    const data = await response.json();
    const fullText: string = data.content?.[0]?.text ?? "";
    const gradeMatch = fullText.match(/GRADE:\s*([A-F][+-]?)/i);
    const grade = gradeMatch ? gradeMatch[1].toUpperCase() : "B";
    const feedback = fullText.replace(/GRADE:\s*[A-F][+-]?/i, "").trim();

    return NextResponse.json({ feedback, grade });
  } catch (err) {
    console.error("Anthropic API error:", err);
    return NextResponse.json({ error: "Could not reach the AI service. Check your connection." }, { status: 500 });
  }
}

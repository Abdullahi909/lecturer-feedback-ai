// API route for AI feedback generation.
// The upload page sends form data here, including the student file.
// This file keeps the logic simple:
// 1. read the uploaded file
// 2. turn it into plain text
// 3. send the text to Anthropic
// 4. return feedback and a mark

import { NextRequest, NextResponse } from "next/server";
import {
  buildSubmissionBundle,
  MAX_SUBMISSION_TEXT,
  type SubmissionDocument,
} from "@/lib/file-extraction";

// Use the Node runtime because file parsing needs Buffer support.
export const runtime = "nodejs";

// Keep the model in one place so it is easy to change later.
const MODEL = "claude-sonnet-4-20250514";

// System prompt — tells Claude how to behave and grade.
const SYSTEM_PROMPT = `
You are an experienced university lecturer grading student assignments against a lecturer-provided brief and rubric.

GRADING SCALE (UK Higher Education):
- 70-100 = First
- 60-69  = Upper Second (2:1)
- 50-59  = Lower Second (2:2)
- 40-49  = Third
- 0-39   = Fail

IMPORTANT RULES:
- Grade the work against the lecturer's rubric and assignment brief.
- Do not invent new criteria.
- If the work misses part of the brief, reflect that in the mark and feedback.
- Be realistic. Do not over-mark weak referencing, weak structure, or shallow analysis.
- If the rubric has weighted criteria, use them sensibly when deciding the final mark.
- Be conservative. Do not give high marks just because the essay is readable or organised.
- If one major criterion is clearly weak, do not let stronger criteria cancel it out too generously.
- If referencing is explicitly assessed and is clearly poor, the final mark should usually stay in the low 60s or below unless the rest of the work is unusually strong.

FEEDBACK STRUCTURE:
1. Overall judgement — one short paragraph
2. Strengths — one short paragraph
3. Areas for improvement — one short paragraph
4. Rubric breakdown — a short bullet list, one bullet per criterion with brief reason and awarded marks
5. Final justification — one short paragraph explaining the final band and mark

LENGTH RULE:
- Keep the whole response concise.
- Use short paragraphs.
- Keep each rubric bullet to one sentence.
- Stay under roughly 450 words so the final grade lines are always included.

RUBRIC BREAKDOWN FORMAT:
- Criterion name: awarded/weight - short reason

FINAL LINES:
TOTAL: NN/100
MARK: NN%

TONE — match the requested tone (Constructive, Direct, or Encouraging). Always be respectful.
`.trim();

export async function POST(request: NextRequest) {
  // Read the AI key from the environment.
  const apiKey = process.env.ANTHROPIC_API_KEY ?? "";

  if (!apiKey) {
    return NextResponse.json(
      { error: "AI service is not configured. Add ANTHROPIC_API_KEY to your environment variables." },
      { status: 503 }
    );
  }

  // Read the form data that came from the upload page.
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  // Pull out the simple text fields first.
  const studentName = String(formData.get("studentName") ?? "the student");
  const moduleCode = String(formData.get("module") ?? "General");
  const assignment = String(formData.get("assignment") ?? "Assignment");
  const assignmentBrief = String(formData.get("assignmentBrief") ?? "").trim();
  const rubric = String(formData.get("rubric") ?? "").trim();
  const tone = String(formData.get("tone") ?? "Constructive");
  const directSubmissionText = String(formData.get("submissionText") ?? "").trim();
  const submissionDocumentsText = String(formData.get("submissionDocuments") ?? "").trim();

  if (!assignmentBrief) {
    return NextResponse.json({ error: "Please add the assignment brief." }, { status: 400 });
  }

  if (!rubric) {
    return NextResponse.json({ error: "Please add the marking rubric." }, { status: 400 });
  }

  // Pull out the uploaded files.
  const files = formData.getAll("files").filter((item): item is File => item instanceof File);

  if (files.length === 0 && !directSubmissionText) {
    return NextResponse.json(
      { error: "Please upload at least one file or provide submission text." },
      { status: 400 }
    );
  }

  // Convert the uploaded file content into plain text.
  let submissionText = "";
  let submissionDocuments: SubmissionDocument[] = [];

  try {
    if (submissionDocumentsText) {
      submissionDocuments = JSON.parse(submissionDocumentsText) as SubmissionDocument[];
    }

    if (directSubmissionText) {
      submissionText = directSubmissionText.slice(0, MAX_SUBMISSION_TEXT);
    }

    if (files.length > 0) {
      const bundle = await buildSubmissionBundle(files);
      submissionText = bundle.text;
      submissionDocuments = bundle.documents;
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not read the uploaded files.";

    return NextResponse.json({ error: message }, { status: 400 });
  }

  // Build the prompt that gets sent to Claude.
  const contentBlocks: Array<Record<string, unknown>> = [];

  for (const document of submissionDocuments) {
    contentBlocks.push({
      type: "document",
      source: {
        type: "base64",
        media_type: document.mediaType,
        data: document.data,
      },
    });
  }

  const promptText = `
Please write feedback for the following student submission.

Student: ${studentName}
Module: ${moduleCode}
Assignment: ${assignment}
Requested Tone: ${tone}

Assignment Brief:
${assignmentBrief}

Marking Rubric:
${rubric}

${submissionText ? `Submission Content:\n${submissionText}\n` : ""}

Write the feedback now. Grade it against the brief and rubric.
Make sure the TOTAL equals the sum of the awarded criterion marks.
If the rubric weights do not total 100, still show the true total and convert it fairly into a percentage for MARK.
`.trim();

  contentBlocks.push({
    type: "text",
    text: promptText,
  });

  try {
    // Send the feedback request to Anthropic.
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1400,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: contentBlocks }],
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      return NextResponse.json({ error: err?.error?.message ?? "AI service error." }, { status: response.status });
    }

    // Read Claude's answer and pull the mark out of the final line.
    const data = await response.json();
    const fullText: string = data.content?.[0]?.text ?? "";
    const awardedMarks = Array.from(fullText.matchAll(/(\d{1,3})\s*\/\s*(\d{1,3})/g))
      .map((match) => ({
        awarded: Number(match[1]),
        weight: Number(match[2]),
      }))
      .filter((item) => !Number.isNaN(item.awarded) && !Number.isNaN(item.weight) && item.awarded >= 0 && item.weight > 0 && item.awarded <= item.weight);
    const summedAwardedMarks = awardedMarks.reduce((total, item) => total + item.awarded, 0);
    const summedWeights = awardedMarks.reduce((total, item) => total + item.weight, 0);
    const totalMatch = fullText.match(/TOTAL:\s*(\d{1,3})\s*\/\s*(\d{1,3})/i);
    const markMatch = fullText.match(/MARK:\s*(\d{1,3})\s*%/i);
    const legacyGradeMatch = fullText.match(/GRADE:\s*([A-F][+-]?)/i);
    const rubricPercentFromBreakdown =
      summedWeights > 0
        ? Math.round((summedAwardedMarks / summedWeights) * 100)
        : null;
    const rubricPercentFromTotal =
      totalMatch && Number(totalMatch[2]) > 0
        ? Math.round((Number(totalMatch[1]) / Number(totalMatch[2])) * 100)
        : null;
    const conservativeMark =
      rubricPercentFromBreakdown !== null && markMatch
        ? Math.min(rubricPercentFromBreakdown, Number(markMatch[1]))
        : null;
    const parsedMark =
      conservativeMark !== null
        ? conservativeMark
        : rubricPercentFromBreakdown !== null
          ? rubricPercentFromBreakdown
          : rubricPercentFromTotal !== null
            ? rubricPercentFromTotal
            : markMatch
              ? Number(markMatch[1])
              : null;
    const grade = parsedMark !== null
      ? `${Math.min(100, Math.max(0, parsedMark))}%`
      : legacyGradeMatch
        ? legacyGradeMatch[1].toUpperCase()
        : "60%";
    const feedback = fullText
      .replace(/TOTAL:\s*\d{1,3}\s*\/\s*\d{1,3}/i, "")
      .replace(/MARK:\s*\d{1,3}\s*%/i, "")
      .replace(/GRADE:\s*[A-F][+-]?/i, "")
      .trim();

    return NextResponse.json({ feedback, grade });
  } catch (err) {
    console.error("Anthropic API error:", err);
    return NextResponse.json({ error: "Could not reach the AI service. Check your connection." }, { status: 500 });
  }
}

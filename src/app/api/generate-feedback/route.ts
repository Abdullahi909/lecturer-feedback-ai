// This is the API route that calls the Anthropic (Claude) AI to generate feedback.
// The upload page sends a POST request here with the assignment details.
// We forward those details to Claude and return the generated feedback + grade.
//
// The API key is read from the ANTHROPIC_API_KEY environment variable.
// For local development, set it in .env.local (this file is gitignored).
// For Vercel deployment, add it in the Vercel project settings under Environment Variables.

import { NextRequest, NextResponse } from "next/server";

// The Claude model we use. Haiku is fast and cheap — good for generating feedback drafts.
const MODEL = "claude-haiku-4-5-20251001";

// The system prompt tells Claude exactly how to behave and grade.
// Keeping it here (rather than in the user message) means the lecturer cannot
// accidentally override the grading rules by changing the request body.
const GRADING_SYSTEM_PROMPT = `
You are an experienced university lecturer writing constructive feedback on student assignments.

GRADING SCALE (UK Higher Education):
- A  = 70% and above  — Excellent work, exceeds expectations
- B+ = 65–69%         — Very good work, strong understanding
- B  = 60–64%         — Good work, meets expectations well
- B- = 55–59%         — Mostly good, some gaps
- C+ = 52–54%         — Satisfactory, noticeable weaknesses
- C  = 50–51%         — Adequate but requires improvement
- D  = 40–49%         — Below standard, significant issues
- F  = Below 40%      — Fails to meet requirements

FEEDBACK STRUCTURE — always write exactly 3 short paragraphs:
1. Strengths — what the student did well
2. Areas for improvement — specific, actionable suggestions
3. Overall summary — a brief closing comment on the grade awarded

TONE RULES:
- Match the requested tone (Constructive, Direct, or Encouraging)
- Always be respectful and professional
- Be specific — avoid vague phrases like "good job"

GRADING RULE — your response must end with exactly this line (no extra words):
GRADE: X
(Replace X with the correct letter grade from the scale above)
`.trim();

export async function POST(request: NextRequest) {
  // Read the API key from environment variables.
  // If it's missing we return a 503 so the front end can show a helpful message.
  const apiKey = process.env.ANTHROPIC_API_KEY ?? "";
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI service is not configured. Please add the ANTHROPIC_API_KEY environment variable." },
      { status: 503 }
    );
  }

  // Read the request body sent by the upload page.
  let body: { studentName?: string; module?: string; assignment?: string; criteria?: string; tone?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  // Pull out the fields we need, falling back to sensible defaults.
  const studentName = body.studentName ?? "the student";
  const module      = body.module      ?? "General";
  const assignment  = body.assignment  ?? "Assignment";
  const criteria    = body.criteria    ?? "Critical Analysis (30%), Structure & Clarity (25%), Use of Sources (25%), Originality (20%)";
  const tone        = body.tone        ?? "Constructive";

  // Build the message we send to Claude. This is the per-request context.
  // The grading rules live in the system prompt (above) so they can't be overridden here.
  const userMessage = `
Please write feedback for the following student submission.

Student: ${studentName}
Module: ${module}
Assignment: ${assignment}
Assessment Criteria: ${criteria}
Requested Tone: ${tone}

Write the feedback now, following the structure and grading rules in your instructions.
Remember to end with GRADE: X on its own line.
`.trim();

  try {
    // Call the Anthropic API.
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
        system: GRADING_SYSTEM_PROMPT,   // Rules are in the system field.
        messages: [{ role: "user", content: userMessage }], // Context is in the user field.
      }),
    });

    // If the Anthropic API itself returned an error, pass the message on.
    if (!response.ok) {
      const errorData = await response.json();
      const message = errorData?.error?.message ?? "The AI service returned an error.";
      return NextResponse.json({ error: message }, { status: response.status });
    }

    const data = await response.json();

    // The full response text from Claude.
    const fullText: string = data.content?.[0]?.text ?? "";

    // Extract the grade from the last line using a regular expression.
    // We look for "GRADE: B+" or similar patterns.
    const gradeMatch = fullText.match(/GRADE:\s*([A-F][+-]?)/i);
    const grade = gradeMatch ? gradeMatch[1].toUpperCase() : "B"; // Fall back to "B" if not found.

    // Remove the "GRADE: X" line from the feedback text so we can show them separately.
    const feedback = fullText.replace(/GRADE:\s*[A-F][+-]?/i, "").trim();

    // Return both the feedback text and the grade to the upload page.
    return NextResponse.json({ feedback, grade });

  } catch (err) {
    // This catches network errors (e.g. no internet connection).
    console.error("Error calling Anthropic API:", err);
    return NextResponse.json(
      { error: "Could not reach the AI service. Please check your connection." },
      { status: 500 }
    );
  }
}

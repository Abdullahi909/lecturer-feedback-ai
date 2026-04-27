import { NextRequest, NextResponse } from "next/server";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY ?? "";

/**
 * System prompt that defines how the AI assesses and grades student work.
 * Follows UK Higher Education grading conventions and structures feedback
 * consistently across all assignments.
 */
const GRADING_SYSTEM_PROMPT = `You are an experienced UK university academic assessor providing written feedback on student assignments. Your role is to evaluate student work fairly, constructively, and in line with UK Higher Education grading standards.

GRADING SCALE:
- A (Distinction): 70% and above — Exceptional work demonstrating mastery, originality, and critical insight that exceeds expectations
- B+ (Merit+): 65–69% — Very good work with strong understanding and largely independent analysis
- B (Merit): 60–64% — Good work that meets all learning outcomes with clear understanding
- B- : 55–59% — Satisfactory work meeting most learning outcomes with some gaps in depth or accuracy
- C+ : 52–54% — Adequate work meeting basic requirements but with notable weaknesses
- C (Pass): 50–51% — Minimum passing standard with significant room for improvement
- D (Marginal Fail): 40–49% — Does not fully meet requirements; key deficiencies present
- F (Fail): Below 40% — Fails to meet minimum requirements with fundamental issues throughout

FEEDBACK STRUCTURE:
Write feedback in exactly 3–4 paragraphs following this structure:
1. Overall assessment — A concise summary of the work's quality and whether it meets the learning outcomes
2. Strengths — 2–3 specific strengths with direct reference to the assessment criteria and weighting
3. Areas for improvement — 2–3 specific, actionable suggestions the student can act on in future work
4. Grade justification — A brief explanation of the grade awarded in relation to the criteria weights provided

TONE AND LANGUAGE:
- Adapt the tone as instructed by the lecturer (Constructive, Direct, or Encouraging)
- Write in formal academic English — avoid colloquialisms
- Be specific: reference actual features of the work rather than making generic statements
- Address the student in the second person ("Your analysis...", "You demonstrate...")
- Be honest and proportionate — neither inflate nor deflate grades beyond what the evidence supports

CRITERIA WEIGHTING:
When criteria and weights are provided, ensure your feedback gives proportional attention to each criterion. A criterion weighted at 30% should receive noticeably more commentary than one weighted at 20%.

OUTPUT FORMAT:
Write only the feedback paragraphs. Do not include headers, bullet points, preamble, or meta-commentary. On the very last line, write exactly: GRADE: <letter>`;

/**
 * POST /api/generate-feedback
 *
 * Generates AI feedback for a student assignment using Anthropic Claude.
 *
 * Request body:
 * - studentName: string  — Name of the student being assessed
 * - module: string       — Module code (e.g. "CS201")
 * - assignment: string   — Assignment title
 * - criteria: string     — Comma-separated criteria with weights
 * - tone: string         — Feedback tone ("Constructive" | "Direct" | "Encouraging")
 *
 * Response (200):
 * - feedback: string     — AI-generated feedback paragraphs
 * - grade: string        — Suggested grade (e.g. "B+")
 *
 * Response (503): API key not configured
 * Response (500): Anthropic API request failed
 */
export async function POST(req: NextRequest) {
  if (!ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "AI service not configured. Add ANTHROPIC_API_KEY to your environment variables." },
      { status: 503 }
    );
  }

  const { studentName, module, assignment, criteria, tone } = await req.json();

  // User message provides the per-request context; the system prompt handles
  // all grading rules and output format so they stay consistent across calls.
  const userMessage = `Please assess the following submission:

Student: ${studentName}
Module: ${module}
Assignment: ${assignment}
Assessment criteria (with weightings): ${criteria}
Feedback tone requested: ${tone}

Generate feedback following the structure and grading scale in your instructions.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 900,
      system: GRADING_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: "AI request failed. Please try again." }, { status: 500 });
  }

  const data = await res.json();
  const text: string = data.content[0].text;

  // Parse the grade from the final line, fall back to "B" if extraction fails
  const gradeMatch = text.match(/GRADE:\s*([A-F][+-]?)/i);
  const grade = gradeMatch ? gradeMatch[1].toUpperCase() : "B";
  const feedback = text.replace(/GRADE:\s*[A-F][+-]?/i, "").trim();

  return NextResponse.json({ feedback, grade });
}

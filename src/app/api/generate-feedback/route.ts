import { NextRequest, NextResponse } from "next/server";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY ?? "";

export async function POST(req: NextRequest) {
  if (!ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "AI service not configured yet. Add your Anthropic API key to generate real feedback." },
      { status: 503 }
    );
  }

  const { studentName, module, assignment, criteria, tone } = await req.json();

  const prompt = `You are an academic assessor writing feedback for a university assignment.

Student: ${studentName}
Module: ${module}
Assignment: ${assignment}
Assessment criteria: ${criteria}
Tone: ${tone}

Write 3–4 paragraphs of specific, actionable academic feedback addressing each criterion. Then on the very last line write exactly: GRADE: <letter> (choose from A, B+, B, B-, C+, C, D, F)`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 800,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: "AI request failed. Please try again." }, { status: 500 });
  }

  const data = await res.json();
  const text: string = data.content[0].text;

  const gradeMatch = text.match(/GRADE:\s*([A-F][+-]?)/i);
  const grade = gradeMatch ? gradeMatch[1].toUpperCase() : "B";
  const feedback = text.replace(/GRADE:\s*[A-F][+-]?/i, "").trim();

  return NextResponse.json({ feedback, grade });
}

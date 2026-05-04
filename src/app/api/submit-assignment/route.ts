// Student submission route.
// This keeps file parsing on the server and creates a pending submission row.

import { NextRequest, NextResponse } from "next/server";
import { buildSubmissionBundle } from "@/lib/file-extraction";
import { createSubmission } from "@/lib/supabase";
import { buildRawSubmissionContent } from "@/lib/submission-content";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const studentId = String(formData.get("studentId") ?? "").trim();
  const moduleId = String(formData.get("moduleId") ?? "").trim();
  const assignment = String(formData.get("assignment") ?? "").trim();
  const submittedDate =
    String(formData.get("submittedDate") ?? "").trim() ||
    new Date().toISOString().slice(0, 10);

  const files = formData.getAll("files").filter((item): item is File => item instanceof File);

  if (!studentId || !moduleId || !assignment) {
    return NextResponse.json(
      { error: "Student, module, and assignment are required." },
      { status: 400 }
    );
  }

  if (files.length === 0) {
    return NextResponse.json({ error: "Please upload at least one file." }, { status: 400 });
  }

  try {
    const bundle = await buildSubmissionBundle(files);

    const created = await createSubmission({
      student_id: studentId,
      module_id: moduleId,
      assignment,
      submitted_date: submittedDate,
      status: "pending",
      feedback: buildRawSubmissionContent({
        text: bundle.text,
        fileNames: bundle.fileNames,
        documents: bundle.documents,
      }),
      grade: null,
    });

    return NextResponse.json({
      submission: created,
      message: "Submission uploaded successfully.",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not submit assignment.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}

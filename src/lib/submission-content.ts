// Helpers for the submission lifecycle.
// To keep the database simple, raw student submission text is stored
// in the feedback field until a lecturer generates real feedback.

import type { SubmissionWithDetails } from "@/lib/types";

const RAW_SUBMISSION_PREFIX = "__RAW_SUBMISSION__:";

export type RawSubmissionContent = {
  text: string;
  fileNames: string[];
};

export type SubmissionStage = "submitted" | "generated" | "approved" | "rejected";

export function buildRawSubmissionContent(text: string, fileNames: string[]) {
  return `${RAW_SUBMISSION_PREFIX}${JSON.stringify({ text, fileNames })}`;
}

export function readRawSubmissionContent(
  feedback: string | null,
  grade: string | null
): RawSubmissionContent | null {
  if (!feedback || grade || !feedback.startsWith(RAW_SUBMISSION_PREFIX)) {
    return null;
  }

  try {
    const parsed = JSON.parse(feedback.slice(RAW_SUBMISSION_PREFIX.length)) as RawSubmissionContent;

    if (!parsed.text || !Array.isArray(parsed.fileNames)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function getSubmissionStage(submission: SubmissionWithDetails): SubmissionStage {
  if (submission.status === "approved") {
    return "approved";
  }

  if (submission.status === "rejected") {
    return "rejected";
  }

  if (readRawSubmissionContent(submission.feedback, submission.grade)) {
    return "submitted";
  }

  return "generated";
}

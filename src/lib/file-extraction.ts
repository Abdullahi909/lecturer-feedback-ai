// Shared file helper used by both student submission
// and lecturer grading routes.

import mammoth from "mammoth";

// Limit the text length so a huge file does not create a giant AI request.
export const MAX_SUBMISSION_TEXT = 12000;

export type SubmissionDocument = {
  name: string;
  mediaType: "application/pdf";
  data: string;
};

function isPdfFile(file: File) {
  return file.name.toLowerCase().endsWith(".pdf");
}

async function buildPdfDocument(file: File): Promise<SubmissionDocument> {
  const fileBuffer = Buffer.from(await file.arrayBuffer());

  return {
    name: file.name,
    mediaType: "application/pdf",
    data: fileBuffer.toString("base64"),
  };
}

// Turn one uploaded non-PDF file into plain text.
export async function extractTextFromFile(file: File) {
  const fileName = file.name.toLowerCase();
  const fileBuffer = Buffer.from(await file.arrayBuffer());

  if (fileName.endsWith(".txt")) {
    return fileBuffer.toString("utf8");
  }

  if (fileName.endsWith(".docx")) {
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    return result.value;
  }

  throw new Error(`Unsupported text file type: ${file.name}`);
}

// Build one shared bundle from the uploaded files.
// TXT and DOCX become plain text.
// PDF files are kept as base64 documents so Claude can read them directly.
export async function buildSubmissionBundle(files: File[]) {
  const parts: string[] = [];
  const fileNames: string[] = [];
  const documents: SubmissionDocument[] = [];

  for (const file of files) {
    fileNames.push(file.name);

    if (isPdfFile(file)) {
      documents.push(await buildPdfDocument(file));
      continue;
    }

    const text = await extractTextFromFile(file);
    const cleanText = text.replace(/\s+/g, " ").trim();

    if (cleanText) {
      parts.push(`File: ${file.name}\n${cleanText}`);
    }
  }

  if (parts.length === 0 && documents.length === 0) {
    throw new Error("No readable content was found in the uploaded files.");
  }

  return {
    fileNames,
    text: parts.join("\n\n").slice(0, MAX_SUBMISSION_TEXT),
    documents,
  };
}

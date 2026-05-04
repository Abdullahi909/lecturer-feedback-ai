// Shared file extraction helper used by both student submission
// and lecturer grading routes.

import mammoth from "mammoth";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { WorkerMessageHandler } from "pdfjs-dist/legacy/build/pdf.worker.mjs";

// Give PDF.js the worker handler directly so it never has to dynamically
// look for a worker file at runtime. That keeps the parser much safer on Vercel.
(globalThis as typeof globalThis & {
  pdfjsWorker?: { WorkerMessageHandler: typeof WorkerMessageHandler };
}).pdfjsWorker = { WorkerMessageHandler };

// Limit the text length so a huge file does not create a giant AI request.
export const MAX_SUBMISSION_TEXT = 12000;

async function extractPdfText(fileBuffer: Buffer) {
  const loadingTask = getDocument({
    data: new Uint8Array(fileBuffer),
    useWorkerFetch: false,
    useSystemFonts: true,
  });

  const pdf = await loadingTask.promise;
  const parts: string[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    if (pageText) {
      parts.push(pageText);
    }
  }

  await loadingTask.destroy();
  return parts.join("\n\n");
}

// Turn one uploaded file into plain text.
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

  if (fileName.endsWith(".pdf")) {
    return extractPdfText(fileBuffer);
  }

  throw new Error(`Unsupported file type: ${file.name}`);
}

// Join all uploaded files into one block of text.
export async function extractSubmissionBundle(files: File[]) {
  const parts: string[] = [];
  const fileNames: string[] = [];

  for (const file of files) {
    const text = await extractTextFromFile(file);
    const cleanText = text.replace(/\s+/g, " ").trim();

    if (cleanText) {
      fileNames.push(file.name);
      parts.push(`File: ${file.name}\n${cleanText}`);
    }
  }

  if (parts.length === 0) {
    throw new Error("No readable text was found in the uploaded files.");
  }

  return {
    fileNames,
    text: parts.join("\n\n").slice(0, MAX_SUBMISSION_TEXT),
  };
}

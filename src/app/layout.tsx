// Root layout for the whole app.
// This wraps every page and sets the browser metadata.

import type { Metadata } from "next";
import "./globals.css";

// Small metadata object used by Next.js for the page title and description.
export const metadata: Metadata = {
  title: "FeedbackAI — Lecturer Portal",
  description: "AI-assisted assignment feedback for lecturers",
};

// The layout is very small on purpose.
// It just gives every page the same HTML shell.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

// Small grading helpers.
// These keep the grading display simple and consistent across the app.

// Turn a numeric mark into a common UK university classification.
export function classificationFromMark(mark: number) {
  if (mark >= 70) return "First";
  if (mark >= 60) return "2:1";
  if (mark >= 50) return "2:2";
  if (mark >= 40) return "Third";
  return "Fail";
}

// Support older letter grades as a fallback for existing seeded rows.
function letterGradeToMark(grade: string) {
  const map: Record<string, number> = {
    A: 75,
    "A-": 70,
    "B+": 67,
    B: 62,
    "B-": 57,
    "C+": 54,
    C: 50,
    D: 45,
    F: 30,
  };

  return map[grade.toUpperCase()] ?? null;
}

// Read a mark from either "68%" or an older letter grade.
export function parseMark(grade: string | null) {
  if (!grade) {
    return null;
  }

  const percentMatch = grade.match(/(\d{1,3})\s*%?/);

  if (percentMatch) {
    const value = Number(percentMatch[1]);

    if (!Number.isNaN(value) && value >= 0 && value <= 100) {
      return value;
    }
  }

  return letterGradeToMark(grade);
}

// Show the mark in a nicer student-facing way.
export function formatGradeDisplay(grade: string | null) {
  const mark = parseMark(grade);

  if (mark === null) {
    return grade ?? "-";
  }

  return `${mark}% (${classificationFromMark(mark)})`;
}

// Choose badge colours based on the numeric mark band.
export function gradeColour(grade: string | null) {
  const mark = parseMark(grade);

  if (mark === null) {
    return { color: "#64748b", bg: "#e2e8f0" };
  }

  if (mark >= 70) return { color: "#16a34a", bg: "#dcfce7" };
  if (mark >= 60) return { color: "#2563eb", bg: "#dbeafe" };
  if (mark >= 50) return { color: "#d97706", bg: "#fef3c7" };
  if (mark >= 40) return { color: "#ea580c", bg: "#ffedd5" };
  return { color: "#dc2626", bg: "#fee2e2" };
}

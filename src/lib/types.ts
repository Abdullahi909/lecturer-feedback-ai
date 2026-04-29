// Shared types used across the app.
// These are kept very simple on purpose.

// The two user roles in this project.
export type UserRole = "lecturer" | "student";

// The three submission states used in the database and UI.
export type SubmissionStatus = "pending" | "approved" | "rejected";

// A user row from the users table.
export type DatabaseUser = {
  id: string;
  username: string;
  password: string;
  name: string;
  initials: string;
  role: UserRole;
};

// A safe user shape for the browser.
// This does not include the password field.
export type PublicUser = Omit<DatabaseUser, "password">;

// A module row from the modules table.
export type DatabaseModule = {
  id: string;
  code: string;
  name: string;
};

// A submission row from the submissions table.
export type DatabaseSubmission = {
  id: string;
  student_id: string;
  module_id: string;
  assignment: string;
  submitted_date: string;
  status: SubmissionStatus;
  feedback: string | null;
  grade: string | null;
  created_at: string;
};

// The user object saved in localStorage after login.
export type StoredUser = {
  id: string;
  name: string;
  initials: string;
  role: UserRole;
};

// A joined submission object used by the UI pages.
export type SubmissionWithDetails = {
  id: string;
  student_id: string;
  module_id: string;
  assignment: string;
  submitted_date: string;
  status: SubmissionStatus;
  feedback: string | null;
  grade: string | null;
  created_at: string;
  student: PublicUser | null;
  module: DatabaseModule | null;
};

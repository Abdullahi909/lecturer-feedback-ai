// Very small Supabase REST helper.
// This uses plain fetch instead of a bigger client library.
// The goal here is to keep the code easy to read for a student project.

import type {
  DatabaseModule,
  DatabaseSubmission,
  DatabaseUser,
  PublicUser,
  UserRole,
  SubmissionWithDetails,
} from "@/lib/types";

// Read the public Supabase values from environment variables.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

// Return the headers needed for every Supabase REST request.
function getHeaders(extraHeaders?: Record<string, string>) {
  return {
    apikey: supabaseAnonKey,
    Authorization: `Bearer ${supabaseAnonKey}`,
    "Content-Type": "application/json",
    ...extraHeaders,
  };
}

// Stop early with a clear error if the env variables are missing.
function checkConfig() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase environment variables are missing.");
  }
}

// Build a full REST URL.
function buildUrl(path: string) {
  return `${supabaseUrl}/rest/v1/${path}`;
}

// Read JSON safely from a response.
async function readJson(response: Response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  return JSON.parse(text);
}

// Small generic request helper.
async function request(path: string, options?: RequestInit) {
  checkConfig();

  const response = await fetch(buildUrl(path), {
    ...options,
    headers: {
      ...getHeaders(),
      ...(options?.headers ?? {}),
    },
    cache: "no-store",
  });

  const data = await readJson(response);

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error_description ||
      data?.error ||
      "Supabase request failed.";

    throw new Error(message);
  }

  return data;
}

// Fetch users, optionally by role.
export async function fetchUsers(role?: UserRole) {
  const params = new URLSearchParams();
  params.set("select", "id,username,name,initials,role");
  params.set("order", "name.asc");

  if (role) {
    params.set("role", `eq.${role}`);
  }

  const data = await request(`users?${params.toString()}`);
  return data as PublicUser[];
}

// Fetch one user by username.
export async function fetchUserByUsername(username: string) {
  const params = new URLSearchParams();
  params.set("select", "id,username,password,name,initials,role");
  params.set("username", `eq.${username}`);
  params.set("limit", "1");

  const data = await request(`users?${params.toString()}`);
  const users = data as DatabaseUser[];

  return users[0] ?? null;
}

// Fetch all modules.
export async function fetchModules() {
  const params = new URLSearchParams();
  params.set("select", "id,code,name");
  params.set("order", "code.asc");

  const data = await request(`modules?${params.toString()}`);
  return data as DatabaseModule[];
}

// Fetch all submissions.
export async function fetchSubmissions() {
  const params = new URLSearchParams();
  params.set("select", "id,student_id,module_id,assignment,submitted_date,status,feedback,grade,created_at");
  params.set("order", "created_at.desc");

  const data = await request(`submissions?${params.toString()}`);
  return data as DatabaseSubmission[];
}

// Update a single submission row.
export async function updateSubmission(
  submissionId: string,
  values: Partial<Pick<DatabaseSubmission, "status" | "feedback" | "grade">>
) {
  const params = new URLSearchParams();
  params.set("id", `eq.${submissionId}`);
  params.set("select", "id,student_id,module_id,assignment,submitted_date,status,feedback,grade,created_at");

  const data = await request(`submissions?${params.toString()}`, {
    method: "PATCH",
    headers: {
      Prefer: "return=representation",
    },
    body: JSON.stringify(values),
  });

  const rows = data as DatabaseSubmission[];
  return rows[0] ?? null;
}

// Insert a new submission row.
export async function createSubmission(
  values: Pick<DatabaseSubmission, "student_id" | "module_id" | "assignment" | "submitted_date" | "status" | "feedback" | "grade">
) {
  const data = await request(
    "submissions?select=id,student_id,module_id,assignment,submitted_date,status,feedback,grade,created_at",
    {
      method: "POST",
      headers: {
        Prefer: "return=representation",
      },
      body: JSON.stringify(values),
    }
  );

  const rows = data as DatabaseSubmission[];
  return rows[0] ?? null;
}

// Fetch all tables we need, then join them in plain JavaScript.
// This is less clever than a nested query, but much easier to read.
export async function fetchSubmissionDetails() {
  const [submissions, users, modules] = await Promise.all([
    fetchSubmissions(),
    fetchUsers(),
    fetchModules(),
  ]);

  const items: SubmissionWithDetails[] = submissions.map((submission) => {
    const student = users.find((user) => user.id === submission.student_id) ?? null;
    const module = modules.find((item) => item.id === submission.module_id) ?? null;

    return {
      ...submission,
      student,
      module,
    };
  });

  return items;
}

// Return only the submissions for one student.
export async function fetchStudentSubmissionDetails(studentId: string) {
  const items = await fetchSubmissionDetails();
  return items.filter((item) => item.student_id === studentId);
}

// Return approved submissions only.
export async function fetchApprovedSubmissionDetails() {
  const items = await fetchSubmissionDetails();
  return items.filter((item) => item.status === "approved");
}

// Return all submissions that already have AI feedback text.
export async function fetchFeedbackReviewItems() {
  const items = await fetchSubmissionDetails();
  return items.filter((item) => item.feedback && item.grade);
}

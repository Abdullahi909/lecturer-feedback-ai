# FeedbackAI — Handoff Document

## What Was Built

A full-stack Next.js 16 (App Router) web app for a university lecturer to manage AI-generated student feedback.

**Two user roles:**
- **Lecturer (Abdullahi Mohamed)** — uploads assignments, generates AI feedback, reviews/edits/approves it
- **Student (Abdul Ali)** — views their submitted work and any approved feedback

**Pages built:**

| Route | File | Description |
|---|---|---|
| `/login` | `src/app/login/page.tsx` | Login form, hardcoded demo accounts |
| `/dashboard` | `src/app/dashboard/page.tsx` | Lecturer home: stat cards + assignments table |
| `/upload` | `src/app/upload/page.tsx` | File upload + AI feedback generation form |
| `/feedback` | `src/app/feedback/page.tsx` | Split-panel review UI: approve / reject / edit |
| `/approved` | `src/app/approved/page.tsx` | All approved feedback sent this term |
| `/settings` | `src/app/settings/page.tsx` | Profile + notification toggles (localStorage) |
| `/student` | `src/app/student/page.tsx` | Student view of their submissions and feedback |

**Shared components:**
- `src/components/Sidebar.tsx` — Nav sidebar with active-link highlight and logout
- `src/components/StatCard.tsx` — Reusable icon + number summary card
- `src/hooks/useAuthGuard.ts` — Auth guard hook; reads localStorage, redirects wrong roles

**AI integration:**
- `src/app/api/generate-feedback/route.ts` — Calls Anthropic Claude (`claude-haiku-4-5-20251001`)
- System prompt enforces UK HE grading scale, 3-paragraph structure, tone control
- Returns `{ feedback: string, grade: string }` — grade parsed from `GRADE: X` at end of response

---

## What Works

Everything in the UI is functional. Run `npm run dev` and the full app is usable end-to-end:

- Login with either demo account redirects correctly by role
- Auth guard blocks wrong-role access and unauthenticated access
- Logout clears localStorage and returns to `/login`
- Dashboard shows stat cards and assignments table
- Upload page: drag-and-drop file list, module/tone selectors, **AI feedback generation works** (live Anthropic API call)
- Feedback Review: left-panel list, right-panel detail, approve/reject updates badge in real time, edit modal saves edited text in state
- Approved page: table of approved submissions with grade colour coding
- Student page: shows one approved submission with feedback, one pending
- Settings: profile fields + notification toggles persist to localStorage across reloads

---

## What Is Broken / Not Yet Done

### 1. Everything uses hardcoded demo data — no database
All data is static arrays defined at the top of each page file. Nothing persists between sessions (except settings). Approving feedback on `/feedback` only updates React state — it resets on reload.

**Affected files and their hardcoded arrays:**

| File | Hardcoded variable | What it should be |
|---|---|---|
| `src/app/login/page.tsx` | `USERS` object | Query Supabase `users` table |
| `src/app/dashboard/page.tsx` | `assignments` array | Query Supabase `submissions` + counts |
| `src/app/feedback/page.tsx` | `allFeedback` array | Query Supabase `submissions WHERE status != 'approved'` |
| `src/app/approved/page.tsx` | `approvedSubmissions` array | Query Supabase `submissions WHERE status = 'approved'` |
| `src/app/student/page.tsx` | `submissions` array | Query Supabase `submissions WHERE student_id = <me>` |
| `src/app/upload/page.tsx` | `studentName: "Sample Student"` | Student selector dropdown + save result to DB |

### 2. AI feedback is never saved
The upload page calls `/api/generate-feedback` and shows the result on screen, but never inserts a row into any database. Navigating away loses the feedback permanently.

### 3. No Supabase client or login API route exist
These files have not been created yet:
- `src/lib/supabase.ts` — shared Supabase client
- `src/app/api/login/route.ts` — server-side credential check against DB

### 4. `StoredUser` type is missing `id`
`src/hooks/useAuthGuard.ts` defines `StoredUser` without a `id: string` field. Once DB is wired, every page will need the user's DB id to scope queries.

### 5. File parsing not implemented
The upload drop zone accepts `.pdf`, `.docx`, `.txt` files and displays them in a list, but their content is never read or sent to the AI. The AI currently receives only the assignment metadata (module name, assignment name, criteria).

---

## Key Files

```
src/
├── app/
│   ├── api/
│   │   └── generate-feedback/route.ts   ← Working AI route (Anthropic)
│   ├── login/page.tsx                   ← Hardcoded auth
│   ├── dashboard/page.tsx               ← Hardcoded stats
│   ├── upload/page.tsx                  ← AI call works; no DB save
│   ├── feedback/page.tsx                ← Full UI works; state only
│   ├── approved/page.tsx                ← Hardcoded data
│   ├── student/page.tsx                 ← Hardcoded data
│   └── settings/page.tsx                ← localStorage only (fine as-is)
├── components/
│   ├── Sidebar.tsx
│   └── StatCard.tsx
└── hooks/
    └── useAuthGuard.ts                  ← Needs id: string added to StoredUser
```

---

## Commands to Run

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:3000)
npm run dev

# Type-check
npx tsc --noEmit

# Build for production
npm run build
```

**Demo login credentials** (both password: `password`):
- Lecturer: `abdullahi`
- Student: `abdulali`

---

## Environment Variables

`.env.local` currently contains only:
```
ANTHROPIC_API_KEY=sk-ant-api03-...
```

Once Supabase is wired, add:
```
NEXT_PUBLIC_SUPABASE_URL=https://dalvdveqnvsjqwtxczkc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

The Supabase project is already created: **ai feedback db** (ref: `dalvdveqnvsjqwtxczkc`).

---

## Errors Remaining

No TypeScript or runtime errors in the current codebase. `npm run build` passes cleanly.

The only pending issue is the Supabase MCP configuration — the MCP server requires a **Personal Access Token (PAT)** from Supabase (not the anon key). Get one at:
> Supabase Dashboard → Account (top-right avatar) → Access Tokens → Generate new token

Once you paste the token, the MCP can be wired into `.mcp.json` and the DB work can begin immediately.

---

## Exact Next Steps (in order)

### Step 1 — Configure Supabase MCP
Get a Supabase Personal Access Token and provide it. This unblocks all DB work.

### Step 2 — Create database schema
Three tables needed:

```sql
-- Users (both lecturers and students)
create table users (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  password text not null,
  name text not null,
  initials text not null,
  role text not null check (role in ('lecturer', 'student'))
);

-- Modules
create table modules (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null
);

-- Submissions (one row per student per assignment)
create table submissions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references users(id),
  module_id uuid references modules(id),
  assignment text not null,
  submitted_date date default now(),
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  feedback text,
  grade text,
  created_at timestamptz default now()
);
```

Disable RLS on all three tables for the demo (or add permissive policies for the anon role).

### Step 3 — Seed the database
Insert Abdullahi (lecturer), Abdul Ali + 5 other students, 4 modules, and the demo submissions matching the current hardcoded data so the UI looks the same on first load.

### Step 4 — Create `src/lib/supabase.ts`
```typescript
import { createClient } from "@supabase/supabase-js";
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

### Step 5 — Create `src/app/api/login/route.ts`
Server-side POST handler that queries `users` by username, compares password, returns `{ name, initials, role, id }`.

### Step 6 — Update `useAuthGuard.ts`
Add `id: string` to `StoredUser` type.

### Step 7 — Update `login/page.tsx`
Replace the `USERS` object check with a `fetch("/api/login", ...)` call. Store `id` in localStorage alongside name/initials/role.

### Step 8 — Wire each page to Supabase
In order of effort (easiest first):
1. `student/page.tsx` — fetch submissions by `student_id`
2. `approved/page.tsx` — fetch `submissions WHERE status = 'approved'`
3. `feedback/page.tsx` — fetch all submissions; replace `approve`/`reject` functions with Supabase `update` calls
4. `dashboard/page.tsx` — fetch counts for stat cards; fetch recent assignments
5. `upload/page.tsx` — add student selector dropdown (fetch students from DB); after AI generates feedback, `insert` a row into `submissions`

### Step 9 — File parsing (separate task after DB is done)
Parse uploaded PDF/DOCX content and pass it as context in the AI prompt alongside the assignment metadata.

### Step 10 — QA, commit, push
Test all flows end-to-end (login → generate → review → approve → student view). Commit to `claude/finish-project-pages-UjqDs`.

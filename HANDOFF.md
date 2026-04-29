# FeedbackAI — Current Project State

## Current Status

The app is now beyond the original handoff state.

The following work is complete:

- Supabase-backed login through `src/app/api/login/route.ts`
- Shared Supabase REST helper in `src/lib/supabase.ts`
- `StoredUser` now includes `id`
- Lecturer and student pages now read from Supabase
- Upload flow now saves generated feedback to the database
- Uploaded `.pdf`, `.docx`, and `.txt` files are parsed and their extracted text is sent to the AI
- Feedback review supports edit, approve, and reject updates against Supabase
- TypeScript build passes
- Production build passes

## What Is Still Needed

These are now the real remaining tasks:

### 1. Add real environment variables

Create `.env.local` from `.env.example` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
ANTHROPIC_API_KEY=...
```

### 2. Run the database setup

Run `supabase-setup.sql` in the Supabase SQL editor so the app has its tables and seed data.

### 3. Final live QA

After the env file and SQL are in place, test:

1. Lecturer login
2. Student login
3. Upload a real `.txt`, `.pdf`, and `.docx` file
4. Generate feedback
5. Confirm the generated feedback is saved
6. Approve a submission
7. Confirm the student can see the approved result

## Known Non-Blocking Limitations

- Auth is still demo-style, not production auth
- Settings still use `localStorage`
- File parsing is basic text extraction
- Passwords are still stored simply for demo/coursework use

## Recommended Working Repo

Use this repo only:

```text
/Users/Abdullahi/desktop/FYP/lecturer-feedback-ai
```

Ignore the older Codex clone.

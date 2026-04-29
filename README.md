# FeedbackAI — Lecturer Portal

FeedbackAI is a Next.js app for managing AI-generated student feedback. A lecturer can upload a student submission, generate feedback with Anthropic Claude, review and edit the result, approve it, and then the student can view the approved feedback in their portal.

## What The App Does

- Lecturer login and student login
- Supabase-backed data for users, modules, and submissions
- Upload `.pdf`, `.docx`, and `.txt` files
- Extract text from uploaded files before sending work to the AI
- Generate feedback and a suggested grade with Anthropic Claude
- Save generated feedback to the review queue
- Review, edit, approve, or reject feedback
- Show approved feedback to the correct student
- Keep simple lecturer settings in `localStorage`

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 + inline styles |
| Database | Supabase REST API |
| AI | Anthropic Claude |
| File Parsing | `pdf-parse`, `mammoth` |
| Icons | Lucide React |

## Demo Accounts

These work after you run the SQL seed file:

| Role | Username | Password |
|---|---|---|
| Lecturer | `abdullahi` | `password` |
| Student | `abdulali` | `password` |

## Project Structure

```text
lecturer-feedback-ai/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── generate-feedback/route.ts
│   │   │   └── login/route.ts
│   │   ├── approved/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── feedback/page.tsx
│   │   ├── login/page.tsx
│   │   ├── settings/page.tsx
│   │   ├── student/page.tsx
│   │   ├── upload/page.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── Sidebar.tsx
│   │   └── StatCard.tsx
│   ├── hooks/
│   │   └── useAuthGuard.ts
│   └── lib/
│       ├── auth.ts
│       ├── supabase.ts
│       └── types.ts
├── supabase-setup.sql
├── .env.example
└── README.md
```

## Setup

### 1. Install packages

```bash
npm install
```

### 2. Create `.env.local`

Use `.env.example` as the template:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_public_anon_key
ANTHROPIC_API_KEY=your_anthropic_api_key
```

### 3. Run the Supabase SQL file

Open your Supabase SQL editor and run:

```sql
-- file in repo root
supabase-setup.sql
```

This creates:
- `users`
- `modules`
- `submissions`

It also seeds the demo lecturer, students, modules, and submission data.

### 4. Start the app

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Verification Commands

```bash
npx tsc --noEmit
npm run build
```

## Current Workflow

1. Lecturer signs in
2. Lecturer chooses a student and module
3. Lecturer uploads one or more `.pdf`, `.docx`, or `.txt` files
4. Server extracts text from the uploaded files
5. Claude generates feedback and a grade
6. The result is saved to Supabase as a pending submission
7. Lecturer reviews and approves or rejects the feedback
8. Approved feedback appears on the student page

## Important Notes

- Authentication is still demo-style and uses simple stored passwords in Supabase.
- Settings are still stored in `localStorage`.
- File parsing is simple plain-text extraction, not full document layout analysis.
- `.env.local` is intentionally not committed.

## Deployment

Push to `main` and deploy on Vercel after adding the same environment variables there.

## Licence

MIT

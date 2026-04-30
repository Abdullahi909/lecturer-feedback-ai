# FeedbackAI

FeedbackAI is a simple student-style web app for lecturers who want help generating feedback on student work. A lecturer can log in, upload a student file, ask the AI to create feedback, review the result, approve it, and then let the student see the approved feedback.

The project is intentionally kept simple:
- plain Next.js pages
- plain fetch calls to Supabase
- small helper files
- easy-to-read TypeScript
- comments throughout the main logic

## Main Features

- lecturer login
- student login
- Supabase data for users, modules, and submissions
- file upload for `.txt` and `.docx`
- AI feedback generation with Anthropic Claude
- university-style percentage marks such as `68% (2:1)`
- feedback review, edit, approve, and reject flow
- student page for approved feedback
- basic lecturer settings saved in `localStorage`

## Current File Support

The hosted app currently supports:
- `.txt`
- `.docx`

PDF support was removed from the live app to keep the production version stable and lean.

## Tech Stack

| Part | Tool |
|---|---|
| Frontend | Next.js 16 |
| Language | TypeScript |
| Styling | Global CSS + inline styles |
| Database | Supabase REST API |
| AI | Anthropic Claude |
| DOCX parsing | `mammoth` |
| Icons | `lucide-react` |

## Demo Accounts

These accounts work after you run the SQL setup file:

| Role | Username | Password |
|---|---|---|
| Lecturer | `abdullahi` | `password` |
| Student | `abdulali` | `password` |

## Folder Structure

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
│       ├── grading.ts
│       ├── supabase.ts
│       └── types.ts
├── supabase-setup.sql
├── .env.example
├── package.json
└── README.md
```

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create `.env.local`

Copy the values from `.env.example` and replace them with your real keys:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_public_anon_key
ANTHROPIC_API_KEY=your_anthropic_api_key
```

### 3. Run the SQL setup

Open Supabase SQL Editor, copy the contents of `supabase-setup.sql`, paste them into the editor, and run the script.

This creates and seeds:
- `users`
- `modules`
- `submissions`

### 4. Start the app

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

## How The App Works

### Lecturer flow

1. Sign in as a lecturer.
2. Open the upload page.
3. Pick a student.
4. Pick a module.
5. Upload a `.txt` or `.docx` file.
6. Generate AI feedback.
7. Save the generated result.
8. Review, edit, approve, or reject it.

### Student flow

1. Sign in as a student.
2. Open the student page.
3. View approved feedback and marks.

## University Marking

The app now uses percentage marks with simple UK classification labels:

- `70%+` = `First`
- `60% to 69%` = `2:1`
- `50% to 59%` = `2:2`
- `40% to 49%` = `Third`
- `Below 40%` = `Fail`

Example display:

```text
68% (2:1)
```

## Useful Commands

```bash
npm run dev
npm run lint
npx tsc --noEmit
npm run build
```

## Important Notes

- This is still a demo/coursework-style app, not production-grade auth.
- Passwords are stored simply in Supabase for demo use.
- Settings are stored in `localStorage`.
- `.env.local` must never be committed.
- The production app is intentionally limited to the stable upload types: `.txt` and `.docx`.

## Deployment

The app can be deployed to Vercel.

Make sure the Vercel project has:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `ANTHROPIC_API_KEY`

## Final QA Checklist

Before submitting or demoing the project, test:

1. Lecturer login works.
2. Student login works.
3. Uploading a `.txt` file works.
4. Uploading a `.docx` file works.
5. AI feedback is generated.
6. A percentage mark is returned.
7. The submission saves to Supabase.
8. Lecturer approval works.
9. Student can see approved feedback.

## Licence

MIT

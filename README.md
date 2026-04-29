# FeedbackAI — Lecturer Portal

An AI-powered feedback management system for university lecturers. Upload student assignments, generate structured AI feedback using Anthropic Claude, review and approve drafts, then dispatch to students — all from a single web portal.

---

## Features

- **Role-based login** — Separate lecturer and student experiences
- **Assignment upload** — Drag-and-drop file upload with module and deadline configuration
- **AI feedback generation** — Claude generates structured, criterion-weighted feedback in seconds
- **Review workflow** — Approve, reject, or edit every piece of feedback before students see it
- **Student portal** — Students log in to view their assignments and received feedback
- **Dashboard** — At-a-glance stats for pending feedback, completions, active modules and students
- **Settings** — Profile management and notification preferences

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 + React inline styles |
| AI Model | Anthropic Claude (`claude-haiku-4-5-20251001`) |
| Icons | Lucide React |
| Auth | localStorage session (prototype) |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Abdullahi909/lecturer-feedback-ai.git
cd lecturer-feedback-ai

# 2. Install dependencies
npm install

# 3. Create your local environment file and add your Anthropic API key
echo "ANTHROPIC_API_KEY=your_key_here" > .env.local

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

Create a `.env.local` file in the project root:

```env
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

| Variable | Description | Required |
|---|---|---|
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude | Yes |

> `.env.local` is listed in `.gitignore` and will never be committed to the repository.

For production, add the variable in **Vercel Dashboard → Project → Settings → Environment Variables**.

---

## Demo Credentials

| Role | Username | Password | Redirects to |
|---|---|---|---|
| Lecturer | `abdullahi` | `password` | `/dashboard` |
| Student | `abdulali` | `password` | `/student` |

---

## Project Structure

```
lecturer-feedback-ai/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── generate-feedback/
│   │   │       └── route.ts        # POST — AI feedback generation endpoint
│   │   ├── approved/
│   │   │   └── page.tsx            # Approved submissions table
│   │   ├── dashboard/
│   │   │   └── page.tsx            # Lecturer dashboard with stats
│   │   ├── feedback/
│   │   │   └── page.tsx            # Split-panel feedback review UI
│   │   ├── login/
│   │   │   └── page.tsx            # Login page (lecturer + student)
│   │   ├── settings/
│   │   │   └── page.tsx            # Profile and notification settings
│   │   ├── student/
│   │   │   └── page.tsx            # Student view — assignments and feedback
│   │   ├── upload/
│   │   │   └── page.tsx            # Upload assignments + generate feedback
│   │   ├── globals.css             # Global styles and Tailwind import
│   │   ├── layout.tsx              # Root layout with metadata
│   │   └── page.tsx                # Root redirect → /login
│   ├── components/
│   │   ├── Sidebar.tsx             # Persistent navigation sidebar (lecturer)
│   │   └── StatCard.tsx            # Reusable metric display card
│   └── hooks/
│       └── useAuthGuard.ts         # Auth guard hook — reads localStorage, redirects
├── .env.local                      # Local environment variables (not committed)
├── .gitignore
├── next.config.ts
├── package.json
└── tsconfig.json
```

---

## Pages

### `/login`
Entry point for all users. Checks credentials against hardcoded users and stores the authenticated user object in `localStorage`. Redirects to `/dashboard` (lecturer) or `/student` (student).

### `/dashboard`
Lecturer home page. Displays summary statistics (pending feedback, completions, active modules, total students) and a table of recent assignments with their status and quick links to the feedback review page.

### `/upload`
Upload student submissions and configure the assessment. The lecturer selects a module, names the assignment, sets a deadline, and uploads files via drag-and-drop. Clicking **Generate Feedback** calls the AI API and displays a draft grade and feedback in-page.

### `/feedback`
Split-panel review interface. The left panel lists all student submissions filterable by module and status. The right panel shows the selected student's AI-generated feedback, suggested grade, and action buttons to **Approve & Send**, **Reject**, or **Edit**.

### `/approved`
Table of all approved submissions with grade badges and dispatch confirmations. Shows summary stats at the top (total approved, sent count, average grade).

### `/settings`
Profile settings (name, title, email, department) and notification preferences with toggle switches.

### `/student`
Student-facing view showing submitted assignments with status indicators. Approved feedback and grades are displayed in full; pending submissions show a holding message.

---

## AI Grading System

Feedback is generated by `claude-haiku-4-5-20251001` — Anthropic's fast, cost-efficient model suited for structured text generation.

### Grading Scale (UK Higher Education)

| Grade | Percentage | Classification |
|---|---|---|
| A | 70%+ | Distinction |
| B+ | 65–69% | Merit+ |
| B | 60–64% | Merit |
| B- | 55–59% | Satisfactory |
| C+ | 52–54% | Adequate |
| C | 50–51% | Pass |
| D | 40–49% | Marginal Fail |
| F | Below 40% | Fail |

### Feedback Structure

Every generated feedback follows a consistent 3–4 paragraph structure:

1. **Overall assessment** — Quality summary and whether learning outcomes are met
2. **Strengths** — 2–3 specific strengths tied to the weighted criteria
3. **Areas for improvement** — 2–3 actionable suggestions for future work
4. **Grade justification** — Explanation of the grade relative to criteria weights

### Tone Options

| Tone | Description |
|---|---|
| Constructive | Balanced and developmental |
| Direct | Clear and unambiguous |
| Encouraging | Supportive, highlighting potential |

---

## Feedback Workflow

```
Lecturer uploads files
        ↓
Configures module, criteria, and tone
        ↓
Clicks "Generate Feedback" → POST /api/generate-feedback
        ↓
Claude returns draft feedback + suggested grade
        ↓
Lecturer reviews on /feedback
        ↓
  ┌─────┴─────┐
Approve     Reject
  ↓
Feedback visible on student's /student page
```

---

## Authentication

Authentication uses `localStorage` to persist a session object:

```ts
type StoredUser = {
  name: string;
  initials: string;
  role: "lecturer" | "student";
};
```

The `useAuthGuard` hook runs on mount in every protected page. If no user is found in `localStorage`, or the role does not match, the user is redirected to `/login`.

> For a production system this should be replaced with a proper auth provider (e.g. NextAuth, Clerk, or Supabase Auth) with server-side session validation.

---

## Deployment

The project is deployed on Vercel via GitHub integration.

```bash
# Push to main → Vercel auto-deploys to production
git push origin main
```

**Required Vercel setup:**
1. Import the GitHub repository on [vercel.com](https://vercel.com)
2. Go to **Project → Settings → Environment Variables**
3. Add `ANTHROPIC_API_KEY` for Production, Preview, and Development
4. Redeploy to apply

---

## Licence

MIT

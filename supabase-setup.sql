-- Turn on UUID generation support.
create extension if not exists pgcrypto;

-- Remove old demo tables first so the file can be re-run.
drop table if exists submissions;
drop table if exists modules;
drop table if exists users;

-- Create the users table.
create table users (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  password text not null,
  name text not null,
  initials text not null,
  role text not null check (role in ('lecturer', 'student'))
);

-- Create the modules table.
create table modules (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null
);

-- Create the submissions table.
create table submissions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references users(id),
  module_id uuid not null references modules(id),
  assignment text not null,
  submitted_date date not null default now(),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  feedback text,
  grade text,
  created_at timestamptz not null default now()
);

-- Turn RLS off to keep the student demo simple.
alter table users disable row level security;
alter table modules disable row level security;
alter table submissions disable row level security;

-- Add one lecturer and six students.
insert into users (id, username, password, name, initials, role) values
('11111111-1111-1111-1111-111111111111', 'abdullahi', 'password', 'Abdullahi Mohamed', 'AM', 'lecturer'),
('22222222-2222-2222-2222-222222222221', 'abdulali', 'password', 'Abdul Ali', 'AA', 'student'),
('22222222-2222-2222-2222-222222222222', 'alicejohnson', 'password', 'Alice Johnson', 'AJ', 'student'),
('22222222-2222-2222-2222-222222222223', 'clarasvensson', 'password', 'Clara Svensson', 'CS', 'student'),
('22222222-2222-2222-2222-222222222224', 'finnmurphy', 'password', 'Finn Murphy', 'FM', 'student'),
('22222222-2222-2222-2222-222222222225', 'hassanalrashid', 'password', 'Hassan Al-Rashid', 'HA', 'student'),
('22222222-2222-2222-2222-222222222226', 'jamescarter', 'password', 'James Carter', 'JC', 'student');

-- Add the four demo modules.
insert into modules (id, code, name) values
('33333333-3333-3333-3333-333333333331', 'CS101', 'Introduction to Computing'),
('33333333-3333-3333-3333-333333333332', 'CS201', 'Data Structures & Algorithms'),
('33333333-3333-3333-3333-333333333333', 'CS310', 'Software Engineering'),
('33333333-3333-3333-3333-333333333334', 'CS415', 'Machine Learning');

-- Add demo submissions.
insert into submissions (id, student_id, module_id, assignment, submitted_date, status, feedback, grade, created_at) values
(
  '44444444-4444-4444-4444-444444444441',
  '22222222-2222-2222-2222-222222222221',
  '33333333-3333-3333-3333-333333333332',
  'Essay 1 - Critical Analysis',
  '2026-03-12',
  'approved',
  'You show a strong understanding of the topic and your structure is clear throughout the essay. Your examples are relevant and help support your main points well.

Your conclusion could be stronger and a few citations need more detail. Try to explain your argument a little more deeply in the final section next time.

Overall this is a solid piece of work with clear strengths in analysis and organisation. The grade reflects good work with some room to improve.',
  'B+',
  '2026-03-12T10:00:00Z'
),
(
  '44444444-4444-4444-4444-444444444442',
  '22222222-2222-2222-2222-222222222221',
  '33333333-3333-3333-3333-333333333333',
  'Lab Report 2',
  '2026-03-14',
  'pending',
  null,
  null,
  '2026-03-14T10:00:00Z'
),
(
  '44444444-4444-4444-4444-444444444443',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333332',
  'Essay 1 - Critical Analysis',
  '2026-03-12',
  'pending',
  'Alice demonstrates strong analytical skill and her points are mostly well supported. The essay reads clearly and the structure helps the argument move forward in a logical way.

The ending feels a little rushed and a few references need to be completed. Try to spend a bit more time developing the final summary and checking small details.

Overall this is a good submission with a strong base and a few clear improvements for next time.',
  'B+',
  '2026-03-12T11:00:00Z'
),
(
  '44444444-4444-4444-4444-444444444444',
  '22222222-2222-2222-2222-222222222223',
  '33333333-3333-3333-3333-333333333333',
  'Lab Report 2',
  '2026-03-10',
  'approved',
  'Clara presents a very strong report with a clear method and a well organised structure. The results section is easy to follow and the discussion connects well to the main ideas from the module.

Only a few very small writing issues stop this from being perfect. Keep checking the final draft carefully before submission.

Overall this is excellent work that shows confidence, clarity, and strong technical understanding.',
  'A-',
  '2026-03-10T15:00:00Z'
),
(
  '44444444-4444-4444-4444-444444444445',
  '22222222-2222-2222-2222-222222222224',
  '33333333-3333-3333-3333-333333333334',
  'Research Proposal',
  '2026-03-15',
  'rejected',
  'The proposal shows some early ideas, but the topic is currently too broad and the method is not yet clear enough. It is hard to see exactly how the research will be carried out from the current draft.

You need to narrow the question, add newer sources, and explain the method in a much more detailed way. The proposal also needs clearer planning and ethical consideration.

Overall this draft needs a substantial rework before it is ready to move forward.',
  'D',
  '2026-03-15T09:30:00Z'
),
(
  '44444444-4444-4444-4444-444444444446',
  '22222222-2222-2222-2222-222222222225',
  '33333333-3333-3333-3333-333333333333',
  'Lab Report 2',
  '2026-03-11',
  'approved',
  'This report is clear, accurate, and easy to follow. The structure is strong and the discussion explains the meaning of the results in a confident way.

There are only a few small places where the explanation could go a little deeper. A little more detail in the comparison section would make the report even stronger.

Overall this is a high-quality submission that meets the task very well.',
  'A',
  '2026-03-11T13:20:00Z'
),
(
  '44444444-4444-4444-4444-444444444447',
  '22222222-2222-2222-2222-222222222226',
  '33333333-3333-3333-3333-333333333331',
  'Introductory Essay',
  '2026-03-01',
  'approved',
  'James writes clearly and shows a good understanding of the basic concepts from the module. The structure is simple and works well for this task.

To improve further, try to add slightly more depth in the middle paragraphs and support each point with a little more evidence.

Overall this is a good piece of work that meets the expectations of the assignment.',
  'B+',
  '2026-03-01T08:45:00Z'
);

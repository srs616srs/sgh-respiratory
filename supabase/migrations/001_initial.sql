-- SGH Respiratory Services — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query

-- ─── Documents ────────────────────────────────────────────────────────────────
create table if not exists documents (
  id          bigserial primary key,
  name        text not null,
  category    text not null,           -- Policy | Protocol | SOP | Form | Checklist | Guideline
  branch_id   text not null default 'all',
  date        date not null default current_date,
  size        text,
  icon        text,
  file_url    text,
  storage_path text,
  created_at  timestamptz default now()
);

-- ─── Certificates ─────────────────────────────────────────────────────────────
create table if not exists certificates (
  id          bigserial primary key,
  staff_id    integer not null,
  type        text not null,           -- BLS | ACLS | PALS | NRP
  expiry_date date not null,
  created_at  timestamptz default now(),
  unique (staff_id, type)
);

-- ─── Competency Records ───────────────────────────────────────────────────────
create table if not exists competency_records (
  id          bigserial primary key,
  staff_id    integer not null,
  comp_id     integer not null,
  status      text not null default 'pending',  -- completed | pending | due
  date        date,
  created_at  timestamptz default now(),
  unique (staff_id, comp_id)
);

-- ─── Courses ──────────────────────────────────────────────────────────────────
create table if not exists courses (
  id          bigserial primary key,
  name        text not null,
  instructor  text,
  duration    text,
  modules     integer default 1,
  uploaded    date default current_date,
  thumb       text default '🎓',
  branch_id   text default 'all',
  file_url    text,
  created_at  timestamptz default now()
);

create table if not exists course_attendance (
  id          bigserial primary key,
  course_id   bigint references courses(id) on delete cascade,
  staff_id    integer not null,
  created_at  timestamptz default now(),
  unique (course_id, staff_id)
);

-- ─── Meetings ─────────────────────────────────────────────────────────────────
create table if not exists meetings (
  id          bigserial primary key,
  title       text not null,
  date        date,
  time        text,
  attendees   integer[] default '{}',
  branch_id   text default 'all',
  mom         text,
  created_at  timestamptz default now()
);

create table if not exists meeting_signatures (
  id          bigserial primary key,
  meeting_id  bigint references meetings(id) on delete cascade,
  staff_id    integer not null,
  signed_at   timestamptz default now(),
  unique (meeting_id, staff_id)
);

-- ─── Staff Meta ───────────────────────────────────────────────────────────────
create table if not exists staff_meta (
  id             bigserial primary key,
  staff_id       integer not null unique,
  sgh_id         text,
  contract_start date,
  contract_end   date,
  resp           jsonb default '{"admin":false,"logistics":false,"education":false}',
  on_duty        boolean default false,
  created_at     timestamptz default now()
);

-- ─── Vacations ────────────────────────────────────────────────────────────────
create table if not exists vacations (
  id          bigserial primary key,
  staff_id    integer not null,
  start_date  date not null,
  end_date    date not null,
  type        text default 'Annual',   -- Annual | Emergency | Medical | Maternity
  days        integer,
  status      text default 'pending',  -- pending | approved | rejected
  created_at  timestamptz default now()
);

-- ─── Staff Folders ────────────────────────────────────────────────────────────
create table if not exists staff_folders (
  id          bigserial primary key,
  staff_id    integer not null,
  date        date default current_date,
  type        text not null,           -- Warning | Delay | Negligence | Commendation
  note        text,
  severity    text default 'medium',
  created_at  timestamptz default now()
);

-- ─── Branch Coverage ──────────────────────────────────────────────────────────
create table if not exists branch_coverage (
  id          bigserial primary key,
  branch_id   text not null unique,
  coverage    jsonb not null default '{}',
  updated_at  timestamptz default now()
);

-- ─── Workload ─────────────────────────────────────────────────────────────────
create table if not exists branch_workload (
  id          bigserial primary key,
  branch_id   text not null unique,
  workload    jsonb not null default '{}',
  updated_at  timestamptz default now()
);

-- ─── Logistics ────────────────────────────────────────────────────────────────
create table if not exists branch_logistics (
  id          bigserial primary key,
  branch_id   text not null unique,
  ventilators integer default 0,
  hfnc        integer default 0,
  transport_vent integer default 0,
  updated_at  timestamptz default now()
);

-- ─── Storage bucket ───────────────────────────────────────────────────────────
-- Run this in Supabase Storage tab → New bucket → "documents" (public)
-- Or run:
-- insert into storage.buckets (id, name, public) values ('documents', 'documents', true);

-- ─── Row Level Security (public read for demo) ────────────────────────────────
alter table documents         enable row level security;
alter table certificates      enable row level security;
alter table competency_records enable row level security;
alter table courses           enable row level security;
alter table course_attendance enable row level security;
alter table meetings          enable row level security;
alter table meeting_signatures enable row level security;
alter table staff_meta        enable row level security;
alter table vacations         enable row level security;
alter table staff_folders     enable row level security;
alter table branch_coverage   enable row level security;
alter table branch_workload   enable row level security;
alter table branch_logistics  enable row level security;

-- Allow all operations with anon key (tighten for production)
create policy "Public access" on documents         for all using (true) with check (true);
create policy "Public access" on certificates      for all using (true) with check (true);
create policy "Public access" on competency_records for all using (true) with check (true);
create policy "Public access" on courses           for all using (true) with check (true);
create policy "Public access" on course_attendance for all using (true) with check (true);
create policy "Public access" on meetings          for all using (true) with check (true);
create policy "Public access" on meeting_signatures for all using (true) with check (true);
create policy "Public access" on staff_meta        for all using (true) with check (true);
create policy "Public access" on vacations         for all using (true) with check (true);
create policy "Public access" on staff_folders     for all using (true) with check (true);
create policy "Public access" on branch_coverage   for all using (true) with check (true);
create policy "Public access" on branch_workload   for all using (true) with check (true);
create policy "Public access" on branch_logistics  for all using (true) with check (true);

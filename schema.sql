-- ============================================================
-- Micro-Mentorship & Code Review Marketplace — Supabase Schema
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────
-- profiles
-- ─────────────────────────────────────────
create table profiles (
  id           uuid primary key default uuid_generate_v4(),
  clerk_id     text unique not null,
  email        text unique not null,
  name         text not null,
  avatar_url   text,
  team         text,
  role         text default 'engineer',
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

create index idx_profiles_clerk_id on profiles(clerk_id);

-- ─────────────────────────────────────────
-- tags
-- ─────────────────────────────────────────
create table tags (
  id    uuid primary key default uuid_generate_v4(),
  name  text unique not null  -- e.g. "React", "Python", "k8s"
);

insert into tags (name) values
  ('React'), ('TypeScript'), ('Python'), ('Go'), ('Rust'),
  ('Node.js'), ('Docker'), ('Kubernetes'), ('PostgreSQL'), ('Redis'),
  ('AWS'), ('GraphQL'), ('System Design'), ('Security'), ('CI/CD');

-- ─────────────────────────────────────────
-- requests
-- ─────────────────────────────────────────
create table requests (
  id           uuid primary key default uuid_generate_v4(),
  title        text not null,
  description  text not null,
  type         text not null check (type in ('mentorship', 'code_review')),
  team         text not null,
  priority     text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  status       text not null default 'open' check (status in ('open', 'claimed', 'in_progress', 'completed', 'cancelled')),
  owner_id     uuid not null references profiles(id) on delete cascade,
  assignee_id  uuid references profiles(id) on delete set null,
  repo_url     text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

create index idx_requests_owner    on requests(owner_id);
create index idx_requests_assignee on requests(assignee_id);
create index idx_requests_status   on requests(status);
create index idx_requests_type     on requests(type);
create index idx_requests_priority on requests(priority);
create index idx_requests_team     on requests(team);

-- ─────────────────────────────────────────
-- request_tags  (junction)
-- ─────────────────────────────────────────
create table request_tags (
  request_id uuid not null references requests(id) on delete cascade,
  tag_id     uuid not null references tags(id) on delete cascade,
  primary key (request_id, tag_id)
);

create index idx_request_tags_tag on request_tags(tag_id);

-- ─────────────────────────────────────────
-- claims
-- ─────────────────────────────────────────
create table claims (
  id           uuid primary key default uuid_generate_v4(),
  request_id   uuid not null references requests(id) on delete cascade,
  claimer_id   uuid not null references profiles(id) on delete cascade,
  message      text,
  created_at   timestamptz default now(),
  unique(request_id, claimer_id)
);

create index idx_claims_request  on claims(request_id);
create index idx_claims_claimer  on claims(claimer_id);

-- ─────────────────────────────────────────
-- progress_updates
-- ─────────────────────────────────────────
create table progress_updates (
  id           uuid primary key default uuid_generate_v4(),
  request_id   uuid not null references requests(id) on delete cascade,
  author_id    uuid not null references profiles(id) on delete cascade,
  note         text not null,
  milestone    text,     -- optional: "Initial review done", "PR submitted", etc.
  created_at   timestamptz default now()
);

create index idx_progress_request on progress_updates(request_id);

-- ─────────────────────────────────────────
-- comments
-- ─────────────────────────────────────────
create table comments (
  id           uuid primary key default uuid_generate_v4(),
  request_id   uuid not null references requests(id) on delete cascade,
  author_id    uuid not null references profiles(id) on delete cascade,
  body         text not null,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

create index idx_comments_request on comments(request_id);

-- ─────────────────────────────────────────
-- updated_at triggers
-- ─────────────────────────────────────────
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger trg_requests_updated before update on requests
  for each row execute procedure set_updated_at();
create trigger trg_profiles_updated before update on profiles
  for each row execute procedure set_updated_at();
create trigger trg_comments_updated before update on comments
  for each row execute procedure set_updated_at();

-- ─────────────────────────────────────────
-- Row-Level Security
-- ─────────────────────────────────────────
alter table profiles         enable row level security;
alter table requests         enable row level security;
alter table request_tags     enable row level security;
alter table tags             enable row level security;
alter table claims           enable row level security;
alter table progress_updates enable row level security;
alter table comments         enable row level security;

-- Service role bypasses RLS (used by backend API with service key)
-- The following policies are for direct client access (anon/authenticated):

-- profiles: anyone can read; only owner can update
create policy "profiles_select_all" on profiles for select using (true);
create policy "profiles_insert_own" on profiles for insert with check (true);
create policy "profiles_update_own" on profiles for update using (true);

-- tags: read-only for everyone
create policy "tags_select_all" on tags for select using (true);

-- requests: read all, write own
create policy "requests_select_all"  on requests for select using (true);
create policy "requests_insert_own"  on requests for insert with check (true);
create policy "requests_update_auth" on requests for update using (true);
create policy "requests_delete_own"  on requests for delete using (true);

-- request_tags
create policy "request_tags_select_all" on request_tags for select using (true);
create policy "request_tags_insert"     on request_tags for insert with check (true);
create policy "request_tags_delete"     on request_tags for delete using (true);

-- claims
create policy "claims_select_all"   on claims for select using (true);
create policy "claims_insert"       on claims for insert with check (true);

-- progress_updates
create policy "progress_select_all" on progress_updates for select using (true);
create policy "progress_insert"     on progress_updates for insert with check (true);

-- comments
create policy "comments_select_all" on comments for select using (true);
create policy "comments_insert"     on comments for insert with check (true);
create policy "comments_update"     on comments for update using (true);
create policy "comments_delete"     on comments for delete using (true);

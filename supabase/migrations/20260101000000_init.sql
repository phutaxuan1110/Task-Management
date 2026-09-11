-- ============================================================================
-- The Daily Task — initial schema
-- profiles / categories / tasks / subtasks + RLS + triggers
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- enum types
do $$ begin
  create type task_urgency as enum ('critical', 'high', 'medium', 'low');
exception when duplicate_object then null; end $$;

do $$ begin
  create type task_status as enum ('todo', 'in_progress', 'completed', 'archived');
exception when duplicate_object then null; end $$;

-- ------------------------------------------------------------------ profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  timezone text not null default 'UTC',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- categories
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 60),
  color text not null default '#111111' check (color ~* '^#[0-9a-f]{6}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name)
);

create index if not exists categories_user_id_idx on public.categories (user_id);

-- --------------------------------------------------------------------- tasks
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category_id uuid references public.categories (id) on delete set null,
  title text not null check (char_length(trim(title)) between 1 and 200),
  description text,
  urgency task_urgency not null default 'medium',
  status task_status not null default 'todo',
  start_date date,
  due_date date,
  start_time time,
  due_time time,
  color text check (color is null or color ~* '^#[0-9a-f]{6}$'),
  position integer not null default 0,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tasks_date_range_check check (
    start_date is null or due_date is null or due_date >= start_date
  )
);

create index if not exists tasks_user_id_idx on public.tasks (user_id);
create index if not exists tasks_user_status_idx on public.tasks (user_id, status);
create index if not exists tasks_user_due_date_idx on public.tasks (user_id, due_date);
create index if not exists tasks_user_urgency_idx on public.tasks (user_id, urgency);
create index if not exists tasks_category_id_idx on public.tasks (category_id);

-- ------------------------------------------------------------------ subtasks
create table if not exists public.subtasks (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 200),
  is_completed boolean not null default false,
  position integer not null default 0,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subtasks_task_id_idx on public.subtasks (task_id, position);
create index if not exists subtasks_user_id_idx on public.subtasks (user_id);

-- ------------------------------------------------------- updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at before update on public.categories
  for each row execute function public.set_updated_at();

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at before update on public.tasks
  for each row execute function public.set_updated_at();

drop trigger if exists subtasks_set_updated_at on public.subtasks;
create trigger subtasks_set_updated_at before update on public.subtasks
  for each row execute function public.set_updated_at();

-- --------------------------------- new user: profile + default categories
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;

  insert into public.categories (user_id, name, color)
  values
    (new.id, 'Work', '#111111'),
    (new.id, 'Personal', '#CC0000'),
    (new.id, 'Study', '#404040'),
    (new.id, 'Health', '#737373')
  on conflict (user_id, name) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------- RLS
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.tasks enable row level security;
alter table public.subtasks enable row level security;

-- profiles
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- categories
drop policy if exists "categories_select_own" on public.categories;
create policy "categories_select_own" on public.categories
  for select using (auth.uid() = user_id);

drop policy if exists "categories_insert_own" on public.categories;
create policy "categories_insert_own" on public.categories
  for insert with check (auth.uid() = user_id);

drop policy if exists "categories_update_own" on public.categories;
create policy "categories_update_own" on public.categories
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "categories_delete_own" on public.categories;
create policy "categories_delete_own" on public.categories
  for delete using (auth.uid() = user_id);

-- tasks
drop policy if exists "tasks_select_own" on public.tasks;
create policy "tasks_select_own" on public.tasks
  for select using (auth.uid() = user_id);

drop policy if exists "tasks_insert_own" on public.tasks;
create policy "tasks_insert_own" on public.tasks
  for insert with check (auth.uid() = user_id);

drop policy if exists "tasks_update_own" on public.tasks;
create policy "tasks_update_own" on public.tasks
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "tasks_delete_own" on public.tasks;
create policy "tasks_delete_own" on public.tasks
  for delete using (auth.uid() = user_id);

-- subtasks
drop policy if exists "subtasks_select_own" on public.subtasks;
create policy "subtasks_select_own" on public.subtasks
  for select using (auth.uid() = user_id);

drop policy if exists "subtasks_insert_own" on public.subtasks;
create policy "subtasks_insert_own" on public.subtasks
  for insert with check (
    auth.uid() = user_id
    and exists (select 1 from public.tasks t where t.id = task_id and t.user_id = auth.uid())
  );

drop policy if exists "subtasks_update_own" on public.subtasks;
create policy "subtasks_update_own" on public.subtasks
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "subtasks_delete_own" on public.subtasks;
create policy "subtasks_delete_own" on public.subtasks
  for delete using (auth.uid() = user_id);

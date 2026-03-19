-- Enable UUID extension
create extension if not exists "pgcrypto";

-- Matters
create table if not exists matters (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  reference       text,
  completion_date date,
  status          text not null default 'active',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Tasks (AP1 checklist items)
create table if not exists tasks (
  id          uuid primary key default gen_random_uuid(),
  matter_id   uuid not null references matters(id) on delete cascade,
  label       text not null,
  completed   boolean not null default false,
  created_at  timestamptz not null default now()
);

-- Requisitions
create table if not exists requisitions (
  id          uuid primary key default gen_random_uuid(),
  matter_id   uuid not null references matters(id) on delete cascade,
  description text not null,
  raised_by   text,
  resolved    boolean not null default false,
  created_at  timestamptz not null default now()
);

-- Event logs (audit trail)
create table if not exists event_logs (
  id          uuid primary key default gen_random_uuid(),
  matter_id   uuid references matters(id) on delete set null,
  event_type  text not null,
  payload     jsonb,
  created_at  timestamptz not null default now()
);

-- Indexes
create index if not exists tasks_matter_id_idx        on tasks(matter_id);
create index if not exists requisitions_matter_id_idx on requisitions(matter_id);
create index if not exists event_logs_matter_id_idx   on event_logs(matter_id);

-- Updated_at trigger
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists matters_updated_at on matters;
create trigger matters_updated_at
  before update on matters
  for each row execute procedure set_updated_at();

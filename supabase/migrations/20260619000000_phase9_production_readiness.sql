-- CareKin — Phase 9: Production hardening and validation

create type public.production_check_status as enum ('not_started', 'in_progress', 'passed', 'failed', 'waived');
create type public.production_check_category as enum (
  'migration',
  'rls',
  'e2e',
  'billing',
  'monitoring',
  'backup',
  'security',
  'performance',
  'accessibility',
  'release'
);
create type public.operational_drill_type as enum ('backup_restore', 'incident_response', 'rollback', 'security_review');
create type public.operational_drill_status as enum ('scheduled', 'completed', 'failed', 'cancelled');
create type public.release_readiness_status as enum ('draft', 'ready', 'released', 'rolled_back');

create table public.production_readiness_checks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces (id) on delete cascade,
  category public.production_check_category not null,
  title text not null,
  status public.production_check_status not null default 'not_started',
  evidence_url text,
  notes text,
  due_at date,
  completed_at timestamptz,
  recorded_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.operational_drills (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces (id) on delete cascade,
  drill_type public.operational_drill_type not null,
  status public.operational_drill_status not null default 'scheduled',
  scheduled_for date,
  completed_at timestamptz,
  owner_name text,
  findings text,
  follow_up_actions text,
  recorded_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.release_readiness_reviews (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces (id) on delete cascade,
  release_name text not null,
  target_environment text not null default 'production',
  status public.release_readiness_status not null default 'draft',
  commit_sha text,
  migration_version text,
  health_check_url text,
  rollback_plan text,
  checklist jsonb not null default '{}',
  approved_by uuid references public.profiles (id),
  approved_at timestamptz,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index production_checks_workspace_category_idx
  on public.production_readiness_checks (workspace_id, category, status);
create index operational_drills_workspace_type_idx
  on public.operational_drills (workspace_id, drill_type, status);
create index release_readiness_workspace_status_idx
  on public.release_readiness_reviews (workspace_id, status, target_environment);

create trigger production_readiness_checks_updated_at before update on public.production_readiness_checks
  for each row execute function public.set_updated_at();
create trigger operational_drills_updated_at before update on public.operational_drills
  for each row execute function public.set_updated_at();
create trigger release_readiness_reviews_updated_at before update on public.release_readiness_reviews
  for each row execute function public.set_updated_at();

alter table public.production_readiness_checks enable row level security;
alter table public.operational_drills enable row level security;
alter table public.release_readiness_reviews enable row level security;

create policy "Production checks visible to workspace members"
  on public.production_readiness_checks for select
  using (workspace_id is null or public.is_workspace_member(workspace_id));

create policy "Production checks managed by workspace admins"
  on public.production_readiness_checks for all
  using (workspace_id is not null and public.can_manage_workspace(workspace_id))
  with check (workspace_id is not null and public.can_manage_workspace(workspace_id));

create policy "Operational drills visible to workspace members"
  on public.operational_drills for select
  using (workspace_id is null or public.is_workspace_member(workspace_id));

create policy "Operational drills managed by workspace admins"
  on public.operational_drills for all
  using (workspace_id is not null and public.can_manage_workspace(workspace_id))
  with check (workspace_id is not null and public.can_manage_workspace(workspace_id));

create policy "Release readiness visible to workspace members"
  on public.release_readiness_reviews for select
  using (workspace_id is null or public.is_workspace_member(workspace_id));

create policy "Release readiness managed by workspace admins"
  on public.release_readiness_reviews for all
  using (workspace_id is not null and public.can_manage_workspace(workspace_id))
  with check (workspace_id is not null and public.can_manage_workspace(workspace_id));

-- CareKin — Phase 6: Pilot launch operations

create type public.pilot_status as enum ('active', 'completed', 'churned', 'paused');
create type public.pilot_feedback_type as enum ('bug', 'ux', 'support', 'feature', 'other');
create type public.pilot_feedback_severity as enum ('low', 'medium', 'high', 'critical');
create type public.pilot_feedback_status as enum ('open', 'triaged', 'resolved', 'wont_fix');
create type public.pilot_retention_signal as enum ('positive', 'neutral', 'at_risk', 'churned');

create table public.pilot_cohorts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null unique references public.workspaces (id) on delete cascade,
  status public.pilot_status not null default 'active',
  pilot_started_at date not null default current_date,
  pilot_ends_at date,
  onboarding_call_at timestamptz,
  setup_completed_at timestamptz,
  target_family_count int not null default 1,
  notes text,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.pilot_baselines (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null unique references public.workspaces (id) on delete cascade,
  current_tools text[] not null default '{}',
  care_tasks_per_day int,
  primary_pain text,
  baseline_confidence_score int check (baseline_confidence_score between 1 and 5),
  workflow_notes text,
  willingness_to_pay_initial boolean,
  recorded_by uuid references public.profiles (id),
  recorded_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.pilot_interviews (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  interview_week int not null check (interview_week > 0),
  interview_date date not null default current_date,
  nps_score int check (nps_score between 0 and 10),
  retention_signal public.pilot_retention_signal not null default 'neutral',
  notes text not null,
  action_items text,
  recorded_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index pilot_interviews_workspace_week_idx
  on public.pilot_interviews (workspace_id, interview_week desc);

create table public.pilot_feedback (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  submitted_by uuid references public.profiles (id),
  feedback_type public.pilot_feedback_type not null default 'other',
  severity public.pilot_feedback_severity not null default 'medium',
  status public.pilot_feedback_status not null default 'open',
  title text not null,
  description text not null,
  page_url text,
  resolution_notes text,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index pilot_feedback_workspace_status_idx
  on public.pilot_feedback (workspace_id, status, severity);

create table public.pilot_pricing_signals (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  willingness_to_pay boolean not null default false,
  price_band text,
  valued_features text,
  objections text,
  notes text,
  recorded_by uuid references public.profiles (id),
  recorded_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index pilot_pricing_workspace_idx
  on public.pilot_pricing_signals (workspace_id, recorded_at desc);

create table public.pilot_metric_snapshots (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  period_start date not null,
  period_end date not null,
  metrics jsonb not null default '{}',
  created_at timestamptz not null default now(),
  unique (workspace_id, period_start, period_end)
);

create trigger pilot_cohorts_updated_at before update on public.pilot_cohorts
  for each row execute function public.set_updated_at();
create trigger pilot_baselines_updated_at before update on public.pilot_baselines
  for each row execute function public.set_updated_at();
create trigger pilot_interviews_updated_at before update on public.pilot_interviews
  for each row execute function public.set_updated_at();
create trigger pilot_feedback_updated_at before update on public.pilot_feedback
  for each row execute function public.set_updated_at();

alter table public.pilot_cohorts enable row level security;
alter table public.pilot_baselines enable row level security;
alter table public.pilot_interviews enable row level security;
alter table public.pilot_feedback enable row level security;
alter table public.pilot_pricing_signals enable row level security;
alter table public.pilot_metric_snapshots enable row level security;

create policy "View pilot cohorts for workspace members"
  on public.pilot_cohorts for select
  using (public.is_workspace_member(workspace_id));

create policy "Manage pilot cohorts for workspace admins"
  on public.pilot_cohorts for all
  using (public.can_manage_workspace(workspace_id))
  with check (public.can_manage_workspace(workspace_id));

create policy "View pilot baselines for workspace members"
  on public.pilot_baselines for select
  using (public.is_workspace_member(workspace_id));

create policy "Manage pilot baselines for workspace admins"
  on public.pilot_baselines for all
  using (public.can_manage_workspace(workspace_id))
  with check (public.can_manage_workspace(workspace_id));

create policy "View pilot interviews for workspace members"
  on public.pilot_interviews for select
  using (public.is_workspace_member(workspace_id));

create policy "Manage pilot interviews for workspace admins"
  on public.pilot_interviews for all
  using (public.can_manage_workspace(workspace_id))
  with check (public.can_manage_workspace(workspace_id));

create policy "View pilot feedback for workspace members"
  on public.pilot_feedback for select
  using (public.is_workspace_member(workspace_id));

create policy "Submit pilot feedback for workspace members"
  on public.pilot_feedback for insert
  with check (public.is_workspace_member(workspace_id));

create policy "Update pilot feedback for workspace admins"
  on public.pilot_feedback for update
  using (public.can_manage_workspace(workspace_id));

create policy "View pilot pricing for workspace admins"
  on public.pilot_pricing_signals for select
  using (public.can_manage_workspace(workspace_id));

create policy "Manage pilot pricing for workspace admins"
  on public.pilot_pricing_signals for all
  using (public.can_manage_workspace(workspace_id))
  with check (public.can_manage_workspace(workspace_id));

create policy "View pilot metric snapshots for workspace admins"
  on public.pilot_metric_snapshots for select
  using (public.can_manage_workspace(workspace_id));

create policy "Manage pilot metric snapshots for workspace admins"
  on public.pilot_metric_snapshots for all
  using (public.can_manage_workspace(workspace_id))
  with check (public.can_manage_workspace(workspace_id));

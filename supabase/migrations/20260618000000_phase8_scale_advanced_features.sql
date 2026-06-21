-- CareKin — Phase 8: Scale and advanced features

create type public.feature_gate_status as enum ('pending_review', 'approved', 'blocked', 'retired');
create type public.marketplace_request_status as enum ('requested', 'reviewing', 'matched', 'declined', 'completed', 'cancelled');
create type public.telecare_session_status as enum ('requested', 'scheduled', 'ready', 'completed', 'cancelled');
create type public.device_integration_status as enum ('requested', 'pending_consent', 'connected', 'paused', 'revoked');
create type public.clinical_referral_status as enum ('draft', 'sent', 'accepted', 'declined', 'completed', 'cancelled');
create type public.wellness_enrollment_status as enum ('interested', 'enrolled', 'active', 'paused', 'completed', 'cancelled');
create type public.scale_incident_status as enum ('open', 'triaged', 'mitigated', 'closed');
create type public.scale_incident_severity as enum ('low', 'medium', 'high', 'critical');

alter table public.profiles
  add column if not exists preferred_locale text not null default 'th';

create table public.feature_gates (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces (id) on delete cascade,
  feature_key text not null,
  status public.feature_gate_status not null default 'pending_review',
  review_notes text,
  approved_by uuid references public.profiles (id),
  approved_at timestamptz,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, feature_key)
);

create table public.facilities (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null unique references public.workspaces (id) on delete cascade,
  name text not null,
  facility_type text not null default 'care_home',
  capacity int,
  address text,
  contact_name text,
  contact_phone text,
  notes text,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.facility_units (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid not null references public.facilities (id) on delete cascade,
  name text not null,
  floor text,
  capacity int,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.facility_elder_census (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid not null references public.facilities (id) on delete cascade,
  elder_id uuid not null references public.elders (id) on delete cascade,
  unit_id uuid references public.facility_units (id) on delete set null,
  admitted_at date,
  discharged_at date,
  care_level text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (facility_id, elder_id)
);

create table public.caregiver_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  display_name text not null,
  service_area text,
  skills text[] not null default '{}',
  verification_status text not null default 'self_reported',
  bio text,
  hourly_rate_thb int,
  active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.marketplace_requests (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  elder_id uuid references public.elders (id) on delete set null,
  requested_by uuid references public.profiles (id),
  status public.marketplace_request_status not null default 'requested',
  care_need text not null,
  schedule_notes text,
  preferred_area text,
  matched_caregiver_profile_id uuid references public.caregiver_profiles (id) on delete set null,
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.telecare_sessions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  elder_id uuid references public.elders (id) on delete set null,
  requested_by uuid references public.profiles (id),
  clinician_name text,
  scheduled_at timestamptz,
  status public.telecare_session_status not null default 'requested',
  provider text,
  room_reference text,
  consent_confirmed boolean not null default false,
  agenda text,
  outcome_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.device_integrations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  elder_id uuid references public.elders (id) on delete cascade,
  vendor text not null,
  device_type text not null,
  status public.device_integration_status not null default 'requested',
  consent_confirmed boolean not null default false,
  external_reference text,
  notes text,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.device_readings (
  id uuid primary key default gen_random_uuid(),
  integration_id uuid not null references public.device_integrations (id) on delete cascade,
  elder_id uuid references public.elders (id) on delete cascade,
  metric text not null,
  value numeric,
  unit text,
  measured_at timestamptz not null,
  payload jsonb not null default '{}',
  idempotency_key text,
  created_at timestamptz not null default now(),
  unique (integration_id, idempotency_key)
);

create table public.device_events (
  id uuid primary key default gen_random_uuid(),
  integration_id uuid not null references public.device_integrations (id) on delete cascade,
  elder_id uuid references public.elders (id) on delete cascade,
  event_type text not null,
  severity text not null default 'info',
  occurred_at timestamptz not null,
  payload jsonb not null default '{}',
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.clinical_referrals (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  elder_id uuid references public.elders (id) on delete set null,
  report_id uuid references public.reports (id) on delete set null,
  clinic_name text not null,
  contact_name text,
  contact_email text,
  contact_phone text,
  reason text not null,
  status public.clinical_referral_status not null default 'draft',
  share_token_id uuid references public.report_shares (id) on delete set null,
  created_by uuid references public.profiles (id),
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.wellness_programs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces (id) on delete cascade,
  name text not null,
  partner_name text,
  program_type text not null default 'wellness',
  description text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.wellness_enrollments (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.wellness_programs (id) on delete cascade,
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  elder_id uuid references public.elders (id) on delete set null,
  status public.wellness_enrollment_status not null default 'interested',
  goals text,
  enrolled_by uuid references public.profiles (id),
  enrolled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.scale_incidents (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces (id) on delete cascade,
  feature_key text not null,
  severity public.scale_incident_severity not null default 'medium',
  status public.scale_incident_status not null default 'open',
  title text not null,
  description text not null,
  mitigation_notes text,
  reported_by uuid references public.profiles (id),
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index feature_gates_feature_idx on public.feature_gates (feature_key, status);
create index facility_census_elder_idx on public.facility_elder_census (elder_id);
create index marketplace_requests_workspace_status_idx on public.marketplace_requests (workspace_id, status);
create index telecare_sessions_workspace_status_idx on public.telecare_sessions (workspace_id, status, scheduled_at);
create index device_integrations_workspace_idx on public.device_integrations (workspace_id, status);
create index device_readings_elder_measured_idx on public.device_readings (elder_id, measured_at desc);
create index clinical_referrals_workspace_status_idx on public.clinical_referrals (workspace_id, status);
create index wellness_enrollments_workspace_status_idx on public.wellness_enrollments (workspace_id, status);
create index scale_incidents_feature_status_idx on public.scale_incidents (feature_key, status, severity);

create trigger feature_gates_updated_at before update on public.feature_gates
  for each row execute function public.set_updated_at();
create trigger facilities_updated_at before update on public.facilities
  for each row execute function public.set_updated_at();
create trigger facility_units_updated_at before update on public.facility_units
  for each row execute function public.set_updated_at();
create trigger facility_elder_census_updated_at before update on public.facility_elder_census
  for each row execute function public.set_updated_at();
create trigger caregiver_profiles_updated_at before update on public.caregiver_profiles
  for each row execute function public.set_updated_at();
create trigger marketplace_requests_updated_at before update on public.marketplace_requests
  for each row execute function public.set_updated_at();
create trigger telecare_sessions_updated_at before update on public.telecare_sessions
  for each row execute function public.set_updated_at();
create trigger device_integrations_updated_at before update on public.device_integrations
  for each row execute function public.set_updated_at();
create trigger clinical_referrals_updated_at before update on public.clinical_referrals
  for each row execute function public.set_updated_at();
create trigger wellness_programs_updated_at before update on public.wellness_programs
  for each row execute function public.set_updated_at();
create trigger wellness_enrollments_updated_at before update on public.wellness_enrollments
  for each row execute function public.set_updated_at();
create trigger scale_incidents_updated_at before update on public.scale_incidents
  for each row execute function public.set_updated_at();

alter table public.feature_gates enable row level security;
alter table public.facilities enable row level security;
alter table public.facility_units enable row level security;
alter table public.facility_elder_census enable row level security;
alter table public.caregiver_profiles enable row level security;
alter table public.marketplace_requests enable row level security;
alter table public.telecare_sessions enable row level security;
alter table public.device_integrations enable row level security;
alter table public.device_readings enable row level security;
alter table public.device_events enable row level security;
alter table public.clinical_referrals enable row level security;
alter table public.wellness_programs enable row level security;
alter table public.wellness_enrollments enable row level security;
alter table public.scale_incidents enable row level security;

create policy "Feature gates visible to workspace members"
  on public.feature_gates for select
  using (workspace_id is null or public.is_workspace_member(workspace_id));

create policy "Feature gates managed by workspace admins"
  on public.feature_gates for all
  using (workspace_id is not null and public.can_manage_workspace(workspace_id))
  with check (workspace_id is not null and public.can_manage_workspace(workspace_id));

create policy "Facilities visible to workspace members"
  on public.facilities for select
  using (public.is_workspace_member(workspace_id));

create policy "Facilities managed by workspace admins"
  on public.facilities for all
  using (public.can_manage_workspace(workspace_id))
  with check (public.can_manage_workspace(workspace_id));

create policy "Facility units visible to facility workspace members"
  on public.facility_units for select
  using (exists (
    select 1 from public.facilities f
    where f.id = facility_id and public.is_workspace_member(f.workspace_id)
  ));

create policy "Facility units managed by facility admins"
  on public.facility_units for all
  using (exists (
    select 1 from public.facilities f
    where f.id = facility_id and public.can_manage_workspace(f.workspace_id)
  ))
  with check (exists (
    select 1 from public.facilities f
    where f.id = facility_id and public.can_manage_workspace(f.workspace_id)
  ));

create policy "Facility census visible to facility workspace members"
  on public.facility_elder_census for select
  using (exists (
    select 1 from public.facilities f
    where f.id = facility_id and public.is_workspace_member(f.workspace_id)
  ));

create policy "Facility census managed by facility admins"
  on public.facility_elder_census for all
  using (exists (
    select 1 from public.facilities f
    where f.id = facility_id and public.can_manage_workspace(f.workspace_id)
  ))
  with check (exists (
    select 1 from public.facilities f
    where f.id = facility_id and public.can_manage_workspace(f.workspace_id)
  ));

create policy "Caregiver profiles public read active"
  on public.caregiver_profiles for select
  using (active or user_id = auth.uid());

create policy "Caregiver profile owner manage"
  on public.caregiver_profiles for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Marketplace requests visible to workspace members"
  on public.marketplace_requests for select
  using (public.is_workspace_member(workspace_id));

create policy "Marketplace requests managed by workspace members"
  on public.marketplace_requests for all
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

create policy "Telecare sessions visible to workspace members"
  on public.telecare_sessions for select
  using (public.is_workspace_member(workspace_id));

create policy "Telecare sessions managed by workspace admins"
  on public.telecare_sessions for all
  using (public.can_manage_workspace(workspace_id))
  with check (public.can_manage_workspace(workspace_id));

create policy "Device integrations visible to workspace members"
  on public.device_integrations for select
  using (public.is_workspace_member(workspace_id));

create policy "Device integrations managed by workspace admins"
  on public.device_integrations for all
  using (public.can_manage_workspace(workspace_id))
  with check (public.can_manage_workspace(workspace_id));

create policy "Device readings visible to elder viewers"
  on public.device_readings for select
  using (elder_id is null or public.can_view_elder(elder_id));

create policy "Device events visible to elder viewers"
  on public.device_events for select
  using (elder_id is null or public.can_view_elder(elder_id));

create policy "Clinical referrals visible to workspace members"
  on public.clinical_referrals for select
  using (public.is_workspace_member(workspace_id));

create policy "Clinical referrals managed by workspace admins"
  on public.clinical_referrals for all
  using (public.can_manage_workspace(workspace_id))
  with check (public.can_manage_workspace(workspace_id));

create policy "Wellness programs visible to workspace members"
  on public.wellness_programs for select
  using (workspace_id is null or public.is_workspace_member(workspace_id));

create policy "Wellness programs managed by workspace admins"
  on public.wellness_programs for all
  using (workspace_id is not null and public.can_manage_workspace(workspace_id))
  with check (workspace_id is not null and public.can_manage_workspace(workspace_id));

create policy "Wellness enrollments visible to workspace members"
  on public.wellness_enrollments for select
  using (public.is_workspace_member(workspace_id));

create policy "Wellness enrollments managed by workspace admins"
  on public.wellness_enrollments for all
  using (public.can_manage_workspace(workspace_id))
  with check (public.can_manage_workspace(workspace_id));

create policy "Scale incidents visible to workspace members"
  on public.scale_incidents for select
  using (workspace_id is null or public.is_workspace_member(workspace_id));

create policy "Scale incidents insert by authenticated users"
  on public.scale_incidents for insert
  with check (auth.uid() is not null and (workspace_id is null or public.is_workspace_member(workspace_id)));

create policy "Scale incidents update by workspace admins"
  on public.scale_incidents for update
  using (workspace_id is not null and public.can_manage_workspace(workspace_id));

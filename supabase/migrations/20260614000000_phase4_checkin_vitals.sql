-- CareKin — Phase 4: Check-in, vitals, and alerts

create type public.check_in_mood as enum ('good', 'okay', 'bad');
create type public.check_in_sleep as enum ('good', 'okay', 'bad');
create type public.vital_metric as enum (
  'systolic',
  'diastolic',
  'pulse',
  'blood_sugar',
  'temperature',
  'spo2',
  'weight'
);

alter table public.care_alerts
  add column if not exists source_type text,
  add column if not exists source_id uuid,
  add column if not exists resolved_at timestamptz;

alter table public.notification_logs
  add column if not exists care_alert_id uuid references public.care_alerts (id) on delete set null;

create table public.daily_checkins (
  id uuid primary key default gen_random_uuid(),
  elder_id uuid not null references public.elders (id) on delete cascade,
  check_in_date date not null default current_date,
  mood public.check_in_mood not null,
  has_symptoms boolean not null default false,
  had_fall boolean not null default false,
  appetite_normal boolean not null default true,
  sleep public.check_in_sleep not null,
  note text,
  recorded_by uuid references public.profiles (id),
  recorded_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (elder_id, check_in_date)
);

create index daily_checkins_elder_date_idx
  on public.daily_checkins (elder_id, check_in_date desc);

create table public.vital_logs (
  id uuid primary key default gen_random_uuid(),
  elder_id uuid not null references public.elders (id) on delete cascade,
  measured_at timestamptz not null default now(),
  systolic numeric,
  diastolic numeric,
  pulse numeric,
  blood_sugar numeric,
  temperature numeric,
  spo2 numeric,
  weight numeric,
  note text,
  recorded_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

create index vital_logs_elder_measured_idx
  on public.vital_logs (elder_id, measured_at desc);

create table public.alert_rules (
  id uuid primary key default gen_random_uuid(),
  elder_id uuid not null references public.elders (id) on delete cascade,
  metric public.vital_metric not null,
  min_value numeric,
  max_value numeric,
  severity public.care_alert_severity not null default 'family',
  enabled boolean not null default true,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint alert_rules_has_bound check (min_value is not null or max_value is not null)
);

create index alert_rules_elder_metric_idx
  on public.alert_rules (elder_id, metric)
  where enabled;

create index care_alerts_source_idx
  on public.care_alerts (source_type, source_id, alert_type);

create trigger daily_checkins_updated_at before update on public.daily_checkins
  for each row execute function public.set_updated_at();

create trigger alert_rules_updated_at before update on public.alert_rules
  for each row execute function public.set_updated_at();

alter table public.daily_checkins enable row level security;
alter table public.vital_logs enable row level security;
alter table public.alert_rules enable row level security;

create policy "View daily checkins if can view elder"
  on public.daily_checkins for select
  using (public.can_view_elder(elder_id));

create policy "Insert daily checkins if can edit elder"
  on public.daily_checkins for insert
  with check (public.can_edit_elder(elder_id));

create policy "Update daily checkins if can edit elder"
  on public.daily_checkins for update
  using (public.can_edit_elder(elder_id));

create policy "Delete daily checkins if can manage workspace"
  on public.daily_checkins for delete
  using (
    exists (
      select 1 from public.elders e
      where e.id = elder_id and public.can_manage_workspace(e.workspace_id)
    )
  );

create policy "View vital logs if can view elder"
  on public.vital_logs for select
  using (public.can_view_elder(elder_id));

create policy "Insert vital logs if can edit elder"
  on public.vital_logs for insert
  with check (public.can_edit_elder(elder_id));

create policy "Delete vital logs if can manage workspace"
  on public.vital_logs for delete
  using (
    exists (
      select 1 from public.elders e
      where e.id = elder_id and public.can_manage_workspace(e.workspace_id)
    )
  );

create policy "View alert rules if can view elder"
  on public.alert_rules for select
  using (public.can_view_elder(elder_id));

create policy "Insert alert rules if can manage elder"
  on public.alert_rules for insert
  with check (
    exists (
      select 1 from public.elders e
      where e.id = elder_id and public.can_manage_workspace(e.workspace_id)
    )
  );

create policy "Update alert rules if can manage elder"
  on public.alert_rules for update
  using (
    exists (
      select 1 from public.elders e
      where e.id = elder_id and public.can_manage_workspace(e.workspace_id)
    )
  );

create policy "Delete alert rules if can manage elder"
  on public.alert_rules for delete
  using (
    exists (
      select 1 from public.elders e
      where e.id = elder_id and public.can_manage_workspace(e.workspace_id)
    )
  );

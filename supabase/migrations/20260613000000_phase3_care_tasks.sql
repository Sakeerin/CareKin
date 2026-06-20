-- CareKin — Phase 3: Care tasks and reminders

-- Enums
create type public.task_event_status as enum ('pending', 'completed', 'missed', 'skipped');
create type public.task_source_type as enum ('medication_schedule', 'care_task');
create type public.reminder_channel as enum ('web', 'line', 'both');
create type public.queue_status as enum ('queued', 'sent', 'failed', 'cancelled');
create type public.notification_status as enum ('pending', 'sent', 'failed', 'delivered');
create type public.care_alert_status as enum ('open', 'acknowledged', 'resolved');
create type public.care_alert_severity as enum ('info', 'family', 'urgent');

-- Elder reminder preferences
alter table public.elders
  add column if not exists line_user_id text,
  add column if not exists reminder_channel public.reminder_channel not null default 'web';

-- Medications
create table public.medications (
  id uuid primary key default gen_random_uuid(),
  elder_id uuid not null references public.elders (id) on delete cascade,
  name text not null,
  dosage_text text,
  instruction text,
  start_date date not null default current_date,
  end_date date,
  active boolean not null default true,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index medications_elder_id_idx on public.medications (elder_id);

-- Medication schedules (daily time slots)
create table public.medication_schedules (
  id uuid primary key default gen_random_uuid(),
  medication_id uuid not null references public.medications (id) on delete cascade,
  schedule_time time not null,
  timezone text not null default 'Asia/Bangkok',
  label text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index medication_schedules_medication_id_idx on public.medication_schedules (medication_id);

-- Routine / care tasks
create table public.care_tasks (
  id uuid primary key default gen_random_uuid(),
  elder_id uuid not null references public.elders (id) on delete cascade,
  task_type text not null default 'routine',
  title text not null,
  instruction text,
  schedule_time time not null,
  timezone text not null default 'Asia/Bangkok',
  active boolean not null default true,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index care_tasks_elder_id_idx on public.care_tasks (elder_id);

-- Task events (instances per day)
create table public.task_events (
  id uuid primary key default gen_random_uuid(),
  elder_id uuid not null references public.elders (id) on delete cascade,
  source_type public.task_source_type not null,
  source_id uuid not null,
  title text not null,
  instruction text,
  due_at timestamptz not null,
  status public.task_event_status not null default 'pending',
  completed_by uuid references public.profiles (id),
  completed_at timestamptz,
  missed_at timestamptz,
  skip_reason text,
  note text,
  event_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (elder_id, source_type, source_id, event_date)
);

create index task_events_elder_date_idx on public.task_events (elder_id, event_date);
create index task_events_status_due_idx on public.task_events (status, due_at);

-- Reminder queue
create table public.reminder_queue (
  id uuid primary key default gen_random_uuid(),
  task_event_id uuid not null references public.task_events (id) on delete cascade,
  channel public.reminder_channel not null,
  status public.queue_status not null default 'queued',
  scheduled_at timestamptz not null,
  sent_at timestamptz,
  attempts int not null default 0,
  last_error text,
  created_at timestamptz not null default now(),
  unique (task_event_id, channel)
);

create index reminder_queue_status_scheduled_idx on public.reminder_queue (status, scheduled_at);

-- Notification logs
create table public.notification_logs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  elder_id uuid not null references public.elders (id) on delete cascade,
  task_event_id uuid references public.task_events (id) on delete set null,
  channel public.reminder_channel not null,
  notification_type text not null,
  status public.notification_status not null default 'pending',
  recipient text,
  message text not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index notification_logs_workspace_idx on public.notification_logs (workspace_id, created_at desc);

-- Care alerts (missed escalation)
create table public.care_alerts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  elder_id uuid not null references public.elders (id) on delete cascade,
  task_event_id uuid references public.task_events (id) on delete set null,
  alert_type text not null,
  severity public.care_alert_severity not null default 'family',
  title text not null,
  message text not null,
  status public.care_alert_status not null default 'open',
  acknowledged_by uuid references public.profiles (id),
  acknowledged_at timestamptz,
  created_at timestamptz not null default now()
);

create index care_alerts_workspace_status_idx on public.care_alerts (workspace_id, status);

-- Updated_at triggers
create trigger medications_updated_at before update on public.medications
  for each row execute function public.set_updated_at();
create trigger care_tasks_updated_at before update on public.care_tasks
  for each row execute function public.set_updated_at();
create trigger task_events_updated_at before update on public.task_events
  for each row execute function public.set_updated_at();

-- RLS
alter table public.medications enable row level security;
alter table public.medication_schedules enable row level security;
alter table public.care_tasks enable row level security;
alter table public.task_events enable row level security;
alter table public.reminder_queue enable row level security;
alter table public.notification_logs enable row level security;
alter table public.care_alerts enable row level security;

-- Medications policies
create policy "View medications if can view elder"
  on public.medications for select
  using (public.can_view_elder(elder_id));

create policy "Manage medications if can edit elder"
  on public.medications for insert
  with check (public.can_edit_elder(elder_id));

create policy "Update medications if can edit elder"
  on public.medications for update
  using (public.can_edit_elder(elder_id));

create policy "Delete medications if can manage workspace elder"
  on public.medications for delete
  using (
    exists (
      select 1 from public.elders e
      where e.id = elder_id and public.can_manage_workspace(e.workspace_id)
    )
  );

-- Medication schedules
create policy "View schedules via medication"
  on public.medication_schedules for select
  using (
    exists (
      select 1 from public.medications m
      where m.id = medication_id and public.can_view_elder(m.elder_id)
    )
  );

create policy "Manage schedules via medication edit"
  on public.medication_schedules for all
  using (
    exists (
      select 1 from public.medications m
      where m.id = medication_id and public.can_edit_elder(m.elder_id)
    )
  );

-- Care tasks
create policy "View care tasks if can view elder"
  on public.care_tasks for select
  using (public.can_view_elder(elder_id));

create policy "Manage care tasks if can edit elder"
  on public.care_tasks for insert
  with check (public.can_edit_elder(elder_id));

create policy "Update care tasks if can edit elder"
  on public.care_tasks for update
  using (public.can_edit_elder(elder_id));

create policy "Delete care tasks if can manage workspace"
  on public.care_tasks for delete
  using (
    exists (
      select 1 from public.elders e
      where e.id = elder_id and public.can_manage_workspace(e.workspace_id)
    )
  );

-- Task events
create policy "View task events if can view elder"
  on public.task_events for select
  using (public.can_view_elder(elder_id));

create policy "Insert task events for editable elder"
  on public.task_events for insert
  with check (public.can_edit_elder(elder_id));

create policy "Update task events if can view elder"
  on public.task_events for update
  using (public.can_view_elder(elder_id));

-- Reminder queue (read for workspace members, write via service role mostly)
create policy "View reminder queue via task event"
  on public.reminder_queue for select
  using (
    exists (
      select 1 from public.task_events te
      where te.id = task_event_id and public.can_view_elder(te.elder_id)
    )
  );

-- Notification logs
create policy "View notification logs for workspace members"
  on public.notification_logs for select
  using (public.is_workspace_member(workspace_id));

create policy "Insert notification logs for workspace members"
  on public.notification_logs for insert
  with check (public.is_workspace_member(workspace_id));

-- Care alerts
create policy "View care alerts for workspace members"
  on public.care_alerts for select
  using (public.is_workspace_member(workspace_id));

create policy "Update care alerts for admins"
  on public.care_alerts for update
  using (public.can_manage_workspace(workspace_id));

create policy "Insert care alerts for workspace members"
  on public.care_alerts for insert
  with check (public.is_workspace_member(workspace_id));

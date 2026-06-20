-- CareKin — Phase 5: Reports and AI summary

create type public.report_status as enum ('draft', 'reviewed', 'exported');
create type public.report_type as enum ('weekly', 'doctor_visit');

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  elder_id uuid not null references public.elders (id) on delete cascade,
  report_type public.report_type not null default 'weekly',
  period_days int not null check (period_days in (7, 14, 30)),
  period_start date not null,
  period_end date not null,
  status public.report_status not null default 'draft',
  aggregate_json jsonb not null default '{}',
  ai_output jsonb not null default '{}',
  reviewed_output jsonb,
  summary_text text,
  ai_model text,
  prompt_version text not null default 'carekin-report-v1',
  pdf_url text,
  created_by uuid references public.profiles (id),
  reviewed_by uuid references public.profiles (id),
  reviewed_at timestamptz,
  exported_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index reports_workspace_elder_idx on public.reports (workspace_id, elder_id, created_at desc);
create index reports_elder_period_idx on public.reports (elder_id, period_start, period_end);

create table public.report_shares (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports (id) on delete cascade,
  token text not null unique default encode(gen_random_bytes(32), 'hex'),
  expires_at timestamptz not null default (now() + interval '7 days'),
  revoked_at timestamptz,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

create index report_shares_report_idx on public.report_shares (report_id, created_at desc);
create index report_shares_token_idx on public.report_shares (token);

create trigger reports_updated_at before update on public.reports
  for each row execute function public.set_updated_at();

alter table public.reports enable row level security;
alter table public.report_shares enable row level security;

create policy "View reports if can view elder"
  on public.reports for select
  using (public.can_view_elder(elder_id));

create policy "Create reports if can view elder"
  on public.reports for insert
  with check (public.can_view_elder(elder_id) and public.is_workspace_member(workspace_id));

create policy "Update reports if can manage workspace"
  on public.reports for update
  using (public.can_manage_workspace(workspace_id));

create policy "Delete reports if can manage workspace"
  on public.reports for delete
  using (public.can_manage_workspace(workspace_id));

create policy "View reports via active share"
  on public.reports for select
  using (
    exists (
      select 1 from public.report_shares rs
      where rs.report_id = id
        and rs.revoked_at is null
        and rs.expires_at > now()
    )
  );

create policy "View report shares if can view report"
  on public.report_shares for select
  using (
    exists (
      select 1 from public.reports r
      where r.id = report_id and public.can_view_elder(r.elder_id)
    )
    or (revoked_at is null and expires_at > now())
  );

create policy "Create report shares if can manage report workspace"
  on public.report_shares for insert
  with check (
    exists (
      select 1 from public.reports r
      where r.id = report_id and public.can_manage_workspace(r.workspace_id)
    )
  );

create policy "Update report shares if can manage report workspace"
  on public.report_shares for update
  using (
    exists (
      select 1 from public.reports r
      where r.id = report_id and public.can_manage_workspace(r.workspace_id)
    )
  );

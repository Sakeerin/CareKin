-- CareKin — Security hardening: shared report access must require token validation

drop policy if exists "View reports via active share" on public.reports;
drop policy if exists "View report shares if can view report" on public.report_shares;
drop policy if exists "Launch invites viewable by authenticated users" on public.launch_invites;

create policy "View report shares if can view report"
  on public.report_shares for select
  using (
    exists (
      select 1 from public.reports r
      where r.id = report_id and public.can_view_elder(r.elder_id)
    )
  );

create or replace function public.get_shared_report_by_token(p_token text)
returns table (
  share_id uuid,
  report_id uuid,
  token text,
  expires_at timestamptz,
  revoked_at timestamptz,
  created_by uuid,
  created_at timestamptz,
  report jsonb
)
language sql
security definer
set search_path = public
as $$
  select
    rs.id as share_id,
    rs.report_id,
    rs.token,
    rs.expires_at,
    rs.revoked_at,
    rs.created_by,
    rs.created_at,
    to_jsonb(r) || jsonb_build_object(
      'elders',
      jsonb_build_object(
        'full_name', e.full_name,
        'nickname', e.nickname
      )
    ) as report
  from public.report_shares rs
  join public.reports r on r.id = rs.report_id
  join public.elders e on e.id = r.elder_id
  where rs.token = p_token
    and rs.revoked_at is null
    and rs.expires_at > now()
  limit 1;
$$;

revoke all on function public.get_shared_report_by_token(text) from public;
grant execute on function public.get_shared_report_by_token(text) to anon, authenticated;

drop policy if exists "Device readings visible to elder viewers" on public.device_readings;
drop policy if exists "Device events visible to elder viewers" on public.device_events;

create policy "Device readings visible to integration workspace members"
  on public.device_readings for select
  using (
    exists (
      select 1 from public.device_integrations di
      where di.id = integration_id
        and public.is_workspace_member(di.workspace_id)
        and (device_readings.elder_id is null or public.can_view_elder(device_readings.elder_id))
    )
  );

create policy "Device events visible to integration workspace members"
  on public.device_events for select
  using (
    exists (
      select 1 from public.device_integrations di
      where di.id = integration_id
        and public.is_workspace_member(di.workspace_id)
        and (device_events.elder_id is null or public.can_view_elder(device_events.elder_id))
    )
  );

drop policy if exists "Support tickets insert by workspace members" on public.support_tickets;
create policy "Support tickets insert by workspace members"
  on public.support_tickets for insert
  with check (
    submitted_by = auth.uid()
    and workspace_id is not null
    and public.is_workspace_member(workspace_id)
  );

drop policy if exists "Scale incidents insert by authenticated users" on public.scale_incidents;
create policy "Scale incidents insert by authenticated users"
  on public.scale_incidents for insert
  with check (
    reported_by = auth.uid()
    and workspace_id is not null
    and public.is_workspace_member(workspace_id)
  );

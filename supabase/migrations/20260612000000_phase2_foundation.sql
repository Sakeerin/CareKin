# CareKin — Phase 2 foundation schema
# Run via Supabase CLI: supabase db push
# Or paste into Supabase SQL Editor

-- Extensions
create extension if not exists "pgcrypto";

-- Enums
create type public.workspace_role as enum (
  'owner',
  'family_admin',
  'family_viewer',
  'caregiver',
  'elder',
  'clinician_viewer'
);

create type public.member_status as enum ('pending', 'active', 'inactive');

-- Profiles (extends auth.users)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Workspaces
create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_user_id uuid not null references public.profiles (id),
  plan text not null default 'free',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Workspace members
create table public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role public.workspace_role not null,
  status public.member_status not null default 'active',
  invited_at timestamptz,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  unique (workspace_id, user_id)
);

create index workspace_members_user_id_idx on public.workspace_members (user_id);
create index workspace_members_workspace_id_idx on public.workspace_members (workspace_id);

-- Invites (email-based, before user joins)
create table public.workspace_invites (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  email text not null,
  role public.workspace_role not null,
  token text not null unique default encode(gen_random_bytes(32), 'hex'),
  invited_by uuid not null references public.profiles (id),
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create index workspace_invites_token_idx on public.workspace_invites (token);
create index workspace_invites_email_idx on public.workspace_invites (email);

-- Elders
create table public.elders (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  full_name text not null,
  nickname text,
  date_of_birth date,
  gender text,
  living_arrangement text,
  allergies text,
  chronic_conditions text[] default '{}',
  mobility_notes text,
  preferred_hospital text,
  doctor_contact text,
  care_instructions text,
  notes text,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index elders_workspace_id_idx on public.elders (workspace_id);

-- Caregiver ↔ elder assignments
create table public.elder_assignments (
  id uuid primary key default gen_random_uuid(),
  elder_id uuid not null references public.elders (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  assigned_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  unique (elder_id, user_id)
);

-- Consent records
create table public.elder_consents (
  id uuid primary key default gen_random_uuid(),
  elder_id uuid not null references public.elders (id) on delete cascade,
  consent_type text not null,
  consent_given_by uuid references public.profiles (id),
  consent_status text not null default 'given',
  consent_text_version text not null default '1.0',
  given_at timestamptz not null default now(),
  withdrawn_at timestamptz
);

-- Emergency contacts
create table public.emergency_contacts (
  id uuid primary key default gen_random_uuid(),
  elder_id uuid not null references public.elders (id) on delete cascade,
  name text not null,
  relationship text not null,
  phone text not null,
  line_user_id text,
  priority int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index emergency_contacts_elder_id_idx on public.emergency_contacts (elder_id);

-- Audit logs
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  actor_user_id uuid references public.profiles (id),
  action text not null,
  resource_type text not null,
  resource_id uuid,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index audit_logs_workspace_id_idx on public.audit_logs (workspace_id, created_at desc);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger workspaces_updated_at before update on public.workspaces
  for each row execute function public.set_updated_at();
create trigger elders_updated_at before update on public.elders
  for each row execute function public.set_updated_at();
create trigger emergency_contacts_updated_at before update on public.emergency_contacts
  for each row execute function public.set_updated_at();

-- RLS helper functions
create or replace function public.is_workspace_member(ws_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = ws_id
      and user_id = auth.uid()
      and status = 'active'
  );
$$;

create or replace function public.get_workspace_role(ws_id uuid)
returns public.workspace_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.workspace_members
  where workspace_id = ws_id
    and user_id = auth.uid()
    and status = 'active'
  limit 1;
$$;

create or replace function public.can_manage_workspace(ws_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.get_workspace_role(ws_id) in ('owner', 'family_admin');
$$;

create or replace function public.can_manage_members(ws_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.get_workspace_role(ws_id) = 'owner';
$$;

create or replace function public.can_view_elder(e_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.elders e
    join public.workspace_members wm on wm.workspace_id = e.workspace_id
    where e.id = e_id
      and wm.user_id = auth.uid()
      and wm.status = 'active'
      and (
        wm.role in ('owner', 'family_admin', 'family_viewer', 'clinician_viewer')
        or (
          wm.role = 'caregiver'
          and exists (
            select 1 from public.elder_assignments ea
            where ea.elder_id = e.id and ea.user_id = auth.uid()
          )
        )
      )
  );
$$;

create or replace function public.can_edit_elder(e_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.elders e
    join public.workspace_members wm on wm.workspace_id = e.workspace_id
    where e.id = e_id
      and wm.user_id = auth.uid()
      and wm.status = 'active'
      and (
        wm.role in ('owner', 'family_admin')
        or (
          wm.role = 'caregiver'
          and exists (
            select 1 from public.elder_assignments ea
            where ea.elder_id = e.id and ea.user_id = auth.uid()
          )
        )
      )
  );
$$;

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.workspace_invites enable row level security;
alter table public.elders enable row level security;
alter table public.elder_assignments enable row level security;
alter table public.elder_consents enable row level security;
alter table public.emergency_contacts enable row level security;
alter table public.audit_logs enable row level security;

-- Profiles policies
create policy "Users can view own profile"
  on public.profiles for select
  using (id = auth.uid());

create policy "Users can update own profile"
  on public.profiles for update
  using (id = auth.uid());

create policy "Members can view co-member profiles in shared workspace"
  on public.profiles for select
  using (
    exists (
      select 1 from public.workspace_members wm1
      join public.workspace_members wm2 on wm1.workspace_id = wm2.workspace_id
      where wm1.user_id = auth.uid() and wm2.user_id = profiles.id
        and wm1.status = 'active' and wm2.status = 'active'
    )
  );

-- Workspaces policies
create policy "Members can view their workspaces"
  on public.workspaces for select
  using (public.is_workspace_member(id));

create policy "Authenticated users can create workspaces"
  on public.workspaces for insert
  with check (auth.uid() = owner_user_id);

create policy "Owners and admins can update workspaces"
  on public.workspaces for update
  using (public.can_manage_workspace(id));

-- Workspace members policies
create policy "Members can view workspace members"
  on public.workspace_members for select
  using (public.is_workspace_member(workspace_id));

create policy "Owners can insert members"
  on public.workspace_members for insert
  with check (public.can_manage_members(workspace_id) or user_id = auth.uid());

create policy "Owners can update members"
  on public.workspace_members for update
  using (public.can_manage_members(workspace_id));

create policy "Owners can delete members"
  on public.workspace_members for delete
  using (public.can_manage_members(workspace_id));

-- Workspace invites policies
create policy "Admins can view invites"
  on public.workspace_invites for select
  using (public.can_manage_workspace(workspace_id));

create policy "Admins can create invites"
  on public.workspace_invites for insert
  with check (public.can_manage_workspace(workspace_id));

create policy "Admins can delete invites"
  on public.workspace_invites for delete
  using (public.can_manage_workspace(workspace_id));

-- Elders policies
create policy "Authorized members can view elders"
  on public.elders for select
  using (public.can_view_elder(id));

create policy "Admins can create elders"
  on public.elders for insert
  with check (public.can_manage_workspace(workspace_id));

create policy "Authorized members can update elders"
  on public.elders for update
  using (public.can_edit_elder(id));

create policy "Admins can delete elders"
  on public.elders for delete
  using (public.can_manage_workspace(workspace_id));

-- Elder assignments
create policy "Members can view assignments in their workspace"
  on public.elder_assignments for select
  using (
    exists (
      select 1 from public.elders e
      where e.id = elder_id and public.is_workspace_member(e.workspace_id)
    )
  );

create policy "Admins can manage assignments"
  on public.elder_assignments for all
  using (
    exists (
      select 1 from public.elders e
      where e.id = elder_id and public.can_manage_workspace(e.workspace_id)
    )
  );

-- Elder consents
create policy "View consents if can view elder"
  on public.elder_consents for select
  using (public.can_view_elder(elder_id));

create policy "Admins can manage consents"
  on public.elder_consents for all
  using (
    exists (
      select 1 from public.elders e
      where e.id = elder_id and public.can_manage_workspace(e.workspace_id)
    )
  );

-- Emergency contacts
create policy "View emergency contacts if can view elder"
  on public.emergency_contacts for select
  using (public.can_view_elder(elder_id));

create policy "Edit emergency contacts if can edit elder"
  on public.emergency_contacts for insert
  with check (public.can_edit_elder(elder_id));

create policy "Update emergency contacts if can edit elder"
  on public.emergency_contacts for update
  using (public.can_edit_elder(elder_id));

create policy "Delete emergency contacts if can edit elder"
  on public.emergency_contacts for delete
  using (public.can_edit_elder(elder_id));

-- Audit logs (insert via service role or security definer function)
create policy "Members can view workspace audit logs"
  on public.audit_logs for select
  using (public.is_workspace_member(workspace_id));

create policy "Members can insert audit logs for their workspace"
  on public.audit_logs for insert
  with check (
    public.is_workspace_member(workspace_id)
    and actor_user_id = auth.uid()
  );

-- Create workspace with owner membership (callable after signup)
create or replace function public.create_workspace_with_owner(ws_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_workspace_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.workspaces (name, owner_user_id)
  values (ws_name, auth.uid())
  returning id into new_workspace_id;

  insert into public.workspace_members (workspace_id, user_id, role, status, accepted_at)
  values (new_workspace_id, auth.uid(), 'owner', 'active', now());

  insert into public.audit_logs (workspace_id, actor_user_id, action, resource_type, resource_id, metadata)
  values (new_workspace_id, auth.uid(), 'workspace.created', 'workspace', new_workspace_id, jsonb_build_object('name', ws_name));

  return new_workspace_id;
end;
$$;

grant execute on function public.create_workspace_with_owner(text) to authenticated;

-- Accept invite by token
create or replace function public.accept_workspace_invite(invite_token text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  inv public.workspace_invites%rowtype;
  member_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select * into inv from public.workspace_invites
  where token = invite_token
    and accepted_at is null
    and expires_at > now();

  if inv.id is null then
    raise exception 'Invalid or expired invite';
  end if;

  if (select email from public.profiles where id = auth.uid()) != inv.email then
    raise exception 'Invite email does not match your account';
  end if;

  insert into public.workspace_members (workspace_id, user_id, role, status, invited_at, accepted_at)
  values (inv.workspace_id, auth.uid(), inv.role, 'active', inv.created_at, now())
  on conflict (workspace_id, user_id) do update
  set role = excluded.role, status = 'active', accepted_at = now()
  returning id into member_id;

  update public.workspace_invites set accepted_at = now() where id = inv.id;

  insert into public.audit_logs (workspace_id, actor_user_id, action, resource_type, resource_id, metadata)
  values (inv.workspace_id, auth.uid(), 'member.invite_accepted', 'workspace_member', member_id, jsonb_build_object('role', inv.role));

  return inv.workspace_id;
end;
$$;

grant execute on function public.accept_workspace_invite(text) to authenticated;

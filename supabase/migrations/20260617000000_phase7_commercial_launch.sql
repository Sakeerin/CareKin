-- CareKin — Phase 7: Commercial launch

create type public.launch_invite_status as enum ('available', 'claimed', 'revoked');
create type public.waitlist_status as enum ('new', 'contacted', 'invited', 'converted', 'closed');
create type public.support_ticket_status as enum ('open', 'in_progress', 'waiting_customer', 'resolved', 'closed');
create type public.support_ticket_priority as enum ('low', 'medium', 'high', 'urgent');
create type public.support_ticket_type as enum ('bug', 'billing', 'privacy', 'support', 'feature', 'other');
create type public.subscription_status as enum ('trialing', 'active', 'past_due', 'cancelled', 'incomplete');

create table public.launch_batches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null default 'planned',
  capacity int not null default 25,
  starts_at date,
  ends_at date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.launch_invites (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid references public.launch_batches (id) on delete set null,
  code text not null unique default upper(substr(encode(gen_random_bytes(8), 'hex'), 1, 10)),
  email text,
  status public.launch_invite_status not null default 'available',
  claimed_by uuid references public.profiles (id),
  claimed_workspace_id uuid references public.workspaces (id) on delete set null,
  expires_at timestamptz not null default (now() + interval '30 days'),
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  claimed_at timestamptz
);

create index launch_invites_code_idx on public.launch_invites (code);
create index launch_invites_status_idx on public.launch_invites (status, expires_at);

create table public.launch_waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  audience text not null default 'family',
  organization text,
  phone text,
  care_context text,
  referral_code text,
  status public.waitlist_status not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.referral_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique default upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 8)),
  owner_user_id uuid references public.profiles (id) on delete cascade,
  workspace_id uuid references public.workspaces (id) on delete cascade,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.referrals (
  id uuid primary key default gen_random_uuid(),
  referral_code_id uuid references public.referral_codes (id) on delete set null,
  referred_email text not null,
  referred_workspace_id uuid references public.workspaces (id) on delete set null,
  status text not null default 'pending',
  reward_note text,
  created_at timestamptz not null default now(),
  converted_at timestamptz
);

create index referrals_email_idx on public.referrals (referred_email);

create table public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces (id) on delete cascade,
  submitted_by uuid references public.profiles (id),
  ticket_type public.support_ticket_type not null default 'support',
  priority public.support_ticket_priority not null default 'medium',
  status public.support_ticket_status not null default 'open',
  subject text not null,
  description text not null,
  page_url text,
  first_response_at timestamptz,
  resolved_at timestamptz,
  resolution_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index support_tickets_workspace_status_idx
  on public.support_tickets (workspace_id, status, priority);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null unique references public.workspaces (id) on delete cascade,
  plan text not null default 'free',
  status public.subscription_status not null default 'incomplete',
  provider text,
  provider_customer_id text,
  provider_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.billing_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  event_type text not null,
  provider text,
  payload jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create trigger launch_batches_updated_at before update on public.launch_batches
  for each row execute function public.set_updated_at();
create trigger launch_waitlist_updated_at before update on public.launch_waitlist
  for each row execute function public.set_updated_at();
create trigger support_tickets_updated_at before update on public.support_tickets
  for each row execute function public.set_updated_at();
create trigger subscriptions_updated_at before update on public.subscriptions
  for each row execute function public.set_updated_at();

alter table public.launch_batches enable row level security;
alter table public.launch_invites enable row level security;
alter table public.launch_waitlist enable row level security;
alter table public.referral_codes enable row level security;
alter table public.referrals enable row level security;
alter table public.support_tickets enable row level security;
alter table public.subscriptions enable row level security;
alter table public.billing_events enable row level security;

create policy "Launch batches viewable by authenticated users"
  on public.launch_batches for select
  using (auth.uid() is not null);

create policy "Launch invites viewable by authenticated users"
  on public.launch_invites for select
  using (auth.uid() is not null);

create policy "Waitlist public insert"
  on public.launch_waitlist for insert
  with check (true);

create policy "Waitlist visible to authenticated users"
  on public.launch_waitlist for select
  using (auth.uid() is not null);

create policy "Referral codes visible to workspace members"
  on public.referral_codes for select
  using (
    owner_user_id = auth.uid()
    or (workspace_id is not null and public.is_workspace_member(workspace_id))
  );

create policy "Referral codes insert by workspace admins"
  on public.referral_codes for insert
  with check (
    owner_user_id = auth.uid()
    and (workspace_id is null or public.can_manage_workspace(workspace_id))
  );

create policy "Referrals visible to workspace members"
  on public.referrals for select
  using (
    exists (
      select 1 from public.referral_codes rc
      where rc.id = referral_code_id
        and (rc.owner_user_id = auth.uid() or public.is_workspace_member(rc.workspace_id))
    )
  );

create policy "Referrals insert by authenticated users"
  on public.referrals for insert
  with check (auth.uid() is not null);

create policy "Support tickets visible to workspace members"
  on public.support_tickets for select
  using (workspace_id is null or public.is_workspace_member(workspace_id));

create policy "Support tickets insert by workspace members"
  on public.support_tickets for insert
  with check (workspace_id is null or public.is_workspace_member(workspace_id));

create policy "Support tickets update by workspace admins"
  on public.support_tickets for update
  using (workspace_id is not null and public.can_manage_workspace(workspace_id));

create policy "Subscriptions visible to workspace members"
  on public.subscriptions for select
  using (public.is_workspace_member(workspace_id));

create policy "Subscriptions managed by workspace admins"
  on public.subscriptions for all
  using (public.can_manage_workspace(workspace_id))
  with check (public.can_manage_workspace(workspace_id));

create policy "Billing events visible to workspace admins"
  on public.billing_events for select
  using (public.can_manage_workspace(workspace_id));

create policy "Billing events insert by workspace admins"
  on public.billing_events for insert
  with check (public.can_manage_workspace(workspace_id));

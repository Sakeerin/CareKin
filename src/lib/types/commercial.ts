import type { BillingPlanId } from "@/lib/plans";

export type WaitlistStatus = "new" | "contacted" | "invited" | "converted" | "closed";
export type SupportTicketStatus = "open" | "in_progress" | "waiting_customer" | "resolved" | "closed";
export type SupportTicketPriority = "low" | "medium" | "high" | "urgent";
export type SupportTicketType = "bug" | "billing" | "privacy" | "support" | "feature" | "other";
export type SubscriptionStatus = "trialing" | "active" | "past_due" | "cancelled" | "incomplete";

export interface LaunchWaitlistEntry {
  id: string;
  email: string;
  name: string | null;
  audience: string;
  organization: string | null;
  phone: string | null;
  care_context: string | null;
  referral_code: string | null;
  status: WaitlistStatus;
  created_at: string;
  updated_at: string;
}

export interface SupportTicket {
  id: string;
  workspace_id: string | null;
  submitted_by: string | null;
  ticket_type: SupportTicketType;
  priority: SupportTicketPriority;
  status: SupportTicketStatus;
  subject: string;
  description: string;
  page_url: string | null;
  first_response_at: string | null;
  resolved_at: string | null;
  resolution_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  workspace_id: string;
  plan: BillingPlanId;
  status: SubscriptionStatus;
  provider: string | null;
  provider_customer_id: string | null;
  provider_subscription_id: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReferralCode {
  id: string;
  code: string;
  owner_user_id: string | null;
  workspace_id: string | null;
  active: boolean;
  created_at: string;
}

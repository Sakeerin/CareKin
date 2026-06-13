export type WorkspaceRole =
  | "owner"
  | "family_admin"
  | "family_viewer"
  | "caregiver"
  | "elder"
  | "clinician_viewer";

export type MemberStatus = "pending" | "active" | "inactive";

export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface Workspace {
  id: string;
  name: string;
  owner_user_id: string;
  plan: string;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: WorkspaceRole;
  status: MemberStatus;
  invited_at: string | null;
  accepted_at: string | null;
  created_at: string;
  profiles?: Profile;
}

export interface WorkspaceInvite {
  id: string;
  workspace_id: string;
  email: string;
  role: WorkspaceRole;
  token: string;
  invited_by: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
}

export interface Elder {
  id: string;
  workspace_id: string;
  full_name: string;
  nickname: string | null;
  date_of_birth: string | null;
  gender: string | null;
  living_arrangement: string | null;
  allergies: string | null;
  chronic_conditions: string[];
  mobility_notes: string | null;
  preferred_hospital: string | null;
  doctor_contact: string | null;
  care_instructions: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  emergency_contacts?: EmergencyContact[];
}

export interface EmergencyContact {
  id: string;
  elder_id: string;
  name: string;
  relationship: string;
  phone: string;
  line_user_id: string | null;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  workspace_id: string;
  actor_user_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  profiles?: Pick<Profile, "display_name" | "email">;
}

export const WORKSPACE_ROLE_LABELS: Record<WorkspaceRole, string> = {
  owner: "เจ้าของ",
  family_admin: "Family Admin",
  family_viewer: "Family Viewer",
  caregiver: "ผู้ดูแล",
  elder: "ผู้สูงวัย",
  clinician_viewer: "Clinician Viewer",
};

export const INVITABLE_ROLES: WorkspaceRole[] = [
  "family_admin",
  "family_viewer",
  "caregiver",
  "elder",
  "clinician_viewer",
];

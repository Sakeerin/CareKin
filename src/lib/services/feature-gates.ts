import { createClient } from "@/lib/supabase/server";
import type { FeatureGate, Phase8FeatureKey } from "@/lib/types/scale";
import { CLINICAL_ADJACENT_FEATURES } from "@/lib/types/scale";

export async function getFeatureGates(workspaceId: string): Promise<FeatureGate[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("feature_gates")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("feature_key");

  if (error) throw error;
  return (data ?? []) as FeatureGate[];
}

export async function isFeatureApproved(
  workspaceId: string,
  featureKey: Phase8FeatureKey,
): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("feature_gates")
    .select("status")
    .eq("workspace_id", workspaceId)
    .eq("feature_key", featureKey)
    .maybeSingle();

  return data?.status === "approved";
}

export async function getFeatureGateError(
  workspaceId: string,
  featureKey: Phase8FeatureKey,
): Promise<string | null> {
  if (!CLINICAL_ADJACENT_FEATURES.includes(featureKey)) return null;
  const approved = await isFeatureApproved(workspaceId, featureKey);
  if (approved) return null;
  return "ฟีเจอร์นี้ต้องผ่าน regulatory / clinical safety review ก่อนเปิดใช้งาน";
}

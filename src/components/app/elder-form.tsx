import { FormAction, FormField, FormTextarea, FormSelect } from "@/components/app/form-action";
import { Button } from "@/components/ui/button";
import { SafetyDisclaimer } from "@/components/prototype/prototype-banner";
import type { Elder } from "@/lib/types/database";
import type { ActionResult } from "@/lib/actions/auth";

interface ElderFormProps {
  action: (prev: ActionResult, formData: FormData) => Promise<ActionResult>;
  elder?: Elder;
  showConsent?: boolean;
  submitLabel?: string;
}

export function ElderForm({
  action,
  elder,
  showConsent = false,
  submitLabel = "บันทึก",
}: ElderFormProps) {
  return (
    <FormAction action={action} className="space-y-4">
      <FormField
        label="ชื่อ-นามสกุล"
        name="fullName"
        required
        defaultValue={elder?.full_name}
      />
      <FormField
        label="ชื่อเล่น"
        name="nickname"
        defaultValue={elder?.nickname ?? ""}
      />
      <FormField
        label="วันเกิด"
        name="dateOfBirth"
        type="date"
        defaultValue={elder?.date_of_birth ?? ""}
      />
      <FormSelect
        label="เพศ"
        name="gender"
        defaultValue={elder?.gender ?? ""}
        options={[
          { value: "", label: "ไม่ระบุ" },
          { value: "female", label: "หญิง" },
          { value: "male", label: "ชาย" },
          { value: "other", label: "อื่น ๆ" },
        ]}
      />
      <FormField
        label="การอยู่อาศัย"
        name="livingArrangement"
        placeholder="เช่น อยู่คนเดียว, อยู่กับลูก"
        defaultValue={elder?.living_arrangement ?? ""}
      />
      <FormField
        label="โรคประจำตัว (คั่นด้วย comma)"
        name="chronicConditions"
        defaultValue={elder?.chronic_conditions?.join(", ") ?? ""}
      />
      <FormField
        label="แพ้ยา/อาหาร"
        name="allergies"
        defaultValue={elder?.allergies ?? ""}
      />
      <FormTextarea
        label="การเคลื่อนไหว"
        name="mobilityNotes"
        defaultValue={elder?.mobility_notes ?? ""}
      />
      <FormField
        label="โรงพยาบาลที่ใช้ประจำ"
        name="preferredHospital"
        defaultValue={elder?.preferred_hospital ?? ""}
      />
      <FormField
        label="ข้อมูลแพทย์"
        name="doctorContact"
        defaultValue={elder?.doctor_contact ?? ""}
      />
      <FormTextarea
        label="คำแนะนำการดูแล"
        name="careInstructions"
        defaultValue={elder?.care_instructions ?? ""}
      />
      <FormTextarea
        label="หมายเหตุ"
        name="notes"
        defaultValue={elder?.notes ?? ""}
      />
      {showConsent && (
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-4">
          <input type="checkbox" name="consentGiven" required className="mt-1 h-4 w-4" />
          <div>
            <p className="text-sm font-medium">ยินยอมให้เก็บข้อมูลสุขภาพ</p>
            <SafetyDisclaimer />
          </div>
        </label>
      )}
      <Button type="submit">{submitLabel}</Button>
    </FormAction>
  );
}

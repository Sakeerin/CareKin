export type BillingPlanId = "free" | "family_basic" | "family_plus" | "premium";

export interface BillingPlan {
  id: BillingPlanId;
  name: string;
  priceText: string;
  description: string;
  limits: {
    elders: number;
    familyMembers: number;
    monthlyReports: number;
  };
  features: string[];
}

export const BILLING_PLANS: BillingPlan[] = [
  {
    id: "free",
    name: "Free",
    priceText: "฿0",
    description: "ทดลองใช้สำหรับครอบครัวที่เริ่มตั้งค่าการดูแล",
    limits: { elders: 1, familyMembers: 2, monthlyReports: 1 },
    features: ["Elder profile 1 คน", "งานวันนี้", "รายงานตัวอย่าง 1 ฉบับ/เดือน"],
  },
  {
    id: "family_basic",
    name: "Family Basic",
    priceText: "฿299/เดือน",
    description: "สำหรับครอบครัวที่ต้องการ reminder และ check-in รายวัน",
    limits: { elders: 2, familyMembers: 5, monthlyReports: 4 },
    features: ["LINE reminders", "Daily check-in", "Vitals & alerts", "Weekly reports"],
  },
  {
    id: "family_plus",
    name: "Family Plus",
    priceText: "฿599/เดือน",
    description: "สำหรับครอบครัวที่มีหลายผู้ดูแลและต้องใช้รายงานสม่ำเสมอ",
    limits: { elders: 4, familyMembers: 10, monthlyReports: 12 },
    features: ["ทุกอย่างใน Basic", "หลายผู้สูงวัย", "แชร์รายงาน", "Priority support"],
  },
  {
    id: "premium",
    name: "Premium / Provider",
    priceText: "ติดต่อทีมขาย",
    description: "สำหรับ care provider หรือทีมดูแลที่ต้องการ onboarding แบบช่วยตั้งค่า",
    limits: { elders: 25, familyMembers: 50, monthlyReports: 100 },
    features: ["White-glove onboarding", "Pilot/ops dashboard", "B2B sales support", "Custom workflow"],
  },
];

export function getPlan(planId?: string | null): BillingPlan {
  return BILLING_PLANS.find((plan) => plan.id === planId) ?? BILLING_PLANS[0];
}

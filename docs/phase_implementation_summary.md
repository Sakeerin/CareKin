# CareKin Phase Implementation Summary

เอกสารนี้สรุปสิ่งที่ทำไปในแต่ละ phase ของ CareKin ตั้งแต่ prototype จนถึง production readiness review hardening โดยเน้นว่าแต่ละ phase สร้างอะไร, เกี่ยวข้องกับไฟล์ไหน, และฟังก์ชันสำคัญทำหน้าที่อะไร

> หมายเหตุ: โปรเจกต์ใช้ Next.js App Router, Server Components, Server Actions, Supabase Auth/Postgres/RLS, Zod validation และ Tailwind UI เป็นแกนหลัก

---

## ภาพรวมสถาปัตยกรรม

CareKin ถูกออกแบบเป็นระบบ Family Care Companion สำหรับครอบครัวที่ดูแลผู้สูงวัย โดยแบ่งเป็นส่วนหลัก ๆ ดังนี้

- **Frontend / Routes:** อยู่ใน `src/app/` ใช้ Next.js App Router แยก public pages, auth pages และ app pages
- **Server Actions:** อยู่ใน `src/lib/actions/` ใช้สำหรับ mutation และ data fetching ที่ผูกกับ session/workspace
- **Services:** อยู่ใน `src/lib/services/` ใช้สำหรับ business logic ที่ซับซ้อน เช่น reminder processing, alert evaluation, report aggregation
- **Schemas:** อยู่ใน `src/lib/schemas/` ใช้ Zod validate form input ก่อนบันทึก
- **Types:** อยู่ใน `src/lib/types/` เก็บ TypeScript types ของ domain ต่าง ๆ
- **Supabase migrations:** อยู่ใน `supabase/migrations/` กำหนดตาราง, enum, RLS policies, indexes และ database functions
- **Docs / Runbooks:** อยู่ใน `docs/` ใช้เก็บ operational plan, pilot plan, launch plan, runbook และ checklist

---

## Phase 0: Discovery and Validation

### ทำอะไรไปบ้าง

Phase นี้เป็นการวางรากฐานด้าน product discovery ก่อนเขียนระบบจริง โดยระบุปัญหา, target user, MVP scope, clinical boundary และแนวทางไม่ให้ product เข้าข่าย medical diagnosis/treatment ตั้งแต่แรก

### ไฟล์ที่เกี่ยวข้อง

| ไฟล์ | หน้าที่ |
|---|---|
| `implementation_plan.md` | แผนหลักของ product, personas, scope, phase plan, compliance boundary |
| `docs/ux_testing_report_template.md` | template สำหรับบันทึกผล usability test |
| `docs/ux_wireframe_spec.md` | spec แนวทาง prototype/wireframe |

### ฟังก์ชันสำคัญ

Phase นี้ยังไม่มี server action หรือ production function หลัก เพราะเป็น phase ด้าน discovery/documentation

---

## Phase 1: Prototype

### ทำอะไรไปบ้าง

สร้าง interactive prototype เพื่อ validate workflow ก่อนสร้าง backend จริง โดยเน้นให้เห็นภาพ elder UX, caregiver UX, family dashboard, onboarding และ report flow

### ไฟล์ / routes ที่เกี่ยวข้อง

| ไฟล์ / route | หน้าที่ |
|---|---|
| `src/app/prototype/page.tsx` | หน้า hub รวม prototype ทั้งหมด |
| `src/app/prototype/family/page.tsx` | prototype dashboard ฝั่งครอบครัว |
| `src/app/prototype/elder/page.tsx` | prototype หน้าผู้สูงวัย ปุ่มใหญ่ ใช้ง่าย |
| `src/app/prototype/caregiver/page.tsx` | prototype workflow ผู้ดูแล |
| `src/app/prototype/onboarding/page.tsx` | prototype onboarding setup |
| `src/app/prototype/report/page.tsx` | prototype รายงานสรุป |
| `src/app/prototype/line/page.tsx` | prototype LINE/reminder interaction |

### ฟังก์ชัน / component สำคัญ

Phase นี้เน้น static React pages/components มากกว่า server actions จึงไม่มี business function ฝั่ง backend ที่ต้องบันทึก DB

### ผลลัพธ์

- ได้ต้นแบบ UX สำหรับคุยกับผู้ใช้และ validate workflow
- ใช้เป็น reference ใน Phase ถัดไปเมื่อต้องสร้างหน้าจอจริง

---

## Phase 2: MVP Foundation

### ทำอะไรไปบ้าง

สร้างฐานระบบจริงของ CareKin ได้แก่ authentication, workspace, role-based access control, elder profile, emergency contacts, member invitation, audit log และ app shell

### ไฟล์ฐานข้อมูล

| ไฟล์ | หน้าที่ |
|---|---|
| `supabase/migrations/20260612000000_phase2_foundation.sql` | สร้างตาราง foundation เช่น profiles, workspaces, memberships, elders, emergency contacts, invites, audit logs และ RLS helper functions |

### ไฟล์ app / UI

| ไฟล์ | หน้าที่ |
|---|---|
| `src/app/(auth)/login/page.tsx` | หน้า login |
| `src/app/(auth)/signup/page.tsx` | หน้า signup |
| `src/app/workspace/new/page.tsx` | สร้าง workspace หลัง signup |
| `src/app/invite/accept/page.tsx` | รับ invite เข้า workspace |
| `src/app/(app)/dashboard/page.tsx` | dashboard หลักหลัง login |
| `src/app/(app)/elders/page.tsx` | รายชื่อผู้สูงวัยใน workspace |
| `src/app/(app)/elders/new/page.tsx` | เพิ่มผู้สูงวัย |
| `src/app/(app)/elders/[id]/page.tsx` | รายละเอียดผู้สูงวัย |
| `src/app/(app)/members/page.tsx` | จัดการสมาชิก workspace |
| `src/app/(app)/settings/page.tsx` | ตั้งค่า profile/workspace |
| `src/components/app/app-shell.tsx` | layout/navigation หลักของ app |
| `src/components/app/auth-forms.tsx` | form login/signup |
| `src/components/app/form-action.tsx` | form wrapper สำหรับ Server Actions |

### ฟังก์ชันสำคัญ

#### `src/lib/actions/auth.ts`

| ฟังก์ชัน | ทำหน้าที่ |
|---|---|
| `loginAction` | รับ email/password, validate ด้วย Zod, login ผ่าน Supabase Auth และ redirect ไป `/dashboard` |
| `signupAction` | สมัครผู้ใช้ใหม่ผ่าน Supabase Auth, บันทึก metadata เช่น display name และ legal acceptance |
| `logoutAction` | sign out ผู้ใช้และ redirect กลับ `/login` |

#### `src/lib/actions/workspace.ts`

| ฟังก์ชัน | ทำหน้าที่ |
|---|---|
| `createWorkspaceAction` | สร้าง workspace ใหม่ผ่าน RPC `create_workspace_with_owner` และผูกผู้ใช้เป็น owner |
| `updateWorkspaceAction` | แก้ชื่อ workspace โดยตรวจสิทธิ์ owner/family admin |
| `updateProfileAction` | แก้ข้อมูล profile ของผู้ใช้ เช่น display name/phone |
| `inviteMemberAction` | สร้าง invite token สำหรับเชิญสมาชิกเข้า workspace |
| `acceptInviteAction` | รับ invite ด้วย token แล้วเพิ่ม user เป็น member |
| `acceptInviteFormAction` | wrapper สำหรับ form รับ invite |

#### `src/lib/actions/elder.ts`

| ฟังก์ชัน | ทำหน้าที่ |
|---|---|
| `createElderAction` | สร้าง profile ผู้สูงวัยใน workspace |
| `updateElderAction` | แก้ข้อมูลผู้สูงวัย เช่น ชื่อ, โรคประจำตัว, ที่อยู่, hospital |
| `deleteEmergencyContactAction` | ลบ emergency contact |
| `deleteElderFormAction` | ลบ elder profile โดยตรวจสิทธิ์ก่อน |
| `addEmergencyContactAction` | เพิ่ม emergency contact ให้ผู้สูงวัย |
| `getElders` | ดึงรายชื่อผู้สูงวัยของ workspace |
| `getElder` | ดึงรายละเอียดผู้สูงวัยรายคน |
| `getEmergencyContacts` | ดึง emergency contacts ของ elder |

#### `src/lib/actions/audit.ts`

| ฟังก์ชัน | ทำหน้าที่ |
|---|---|
| `logAuditEvent` | บันทึก audit log ของ action สำคัญ เช่น สร้าง elder, share report, update ticket |
| `getAuditLogs` | ดึง audit logs ของ workspace สำหรับตรวจสอบย้อนหลัง |

### ผลลัพธ์

- มีระบบบัญชีและ workspace ใช้งานจริง
- มี role-based access control ผ่าน RLS
- มี data model สำหรับ elder care profile
- มี audit trail สำหรับเหตุการณ์สำคัญ

---

## Phase 3: Care Tasks and Reminders

### ทำอะไรไปบ้าง

เพิ่มระบบ care task, medication, routine, task events, reminder queue, notification logs, LINE messaging และ cron endpoint สำหรับประมวลผล reminder

### ไฟล์ฐานข้อมูล

| ไฟล์ | หน้าที่ |
|---|---|
| `supabase/migrations/20260613000000_phase3_care_tasks.sql` | สร้างตาราง medications, care_tasks, task_events, reminder_queue, notification_logs และ field reminder ใน elders |

### ไฟล์ app / UI / API

| ไฟล์ | หน้าที่ |
|---|---|
| `src/app/(app)/elders/[id]/medications/page.tsx` | จัดการยา |
| `src/app/(app)/elders/[id]/routines/page.tsx` | จัดการกิจวัตร |
| `src/app/(app)/tasks/page.tsx` | รายการ tasks วันนี้ |
| `src/app/(app)/tasks/[id]/page.tsx` | รายละเอียด/confirm task |
| `src/app/(app)/notifications/page.tsx` | ประวัติ notification |
| `src/app/api/cron/reminders/route.ts` | endpoint สำหรับ cron process reminder queue |
| `src/app/api/line/webhook/route.ts` | endpoint รับ LINE webhook |
| `src/components/app/task-confirm-panel.tsx` | UI confirm task |
| `src/lib/line/messaging.ts` | helper ส่ง/verify LINE message |

### ฟังก์ชันสำคัญ

#### `src/lib/actions/medications.ts`

| ฟังก์ชัน | ทำหน้าที่ |
|---|---|
| `createMedicationAction` | เพิ่มรายการยาให้ elder พร้อม dose/frequency/time |
| `deleteMedicationAction` | ลบรายการยา |
| `getMedications` | ดึงรายการยาของ elder |

#### `src/lib/actions/care-tasks.ts`

| ฟังก์ชัน | ทำหน้าที่ |
|---|---|
| `createCareTaskAction` | สร้าง routine/care task เช่น วัดความดัน ดื่มน้ำ นัดหมาย |
| `deleteCareTaskAction` | ลบ care task |
| `getCareTasks` | ดึง care tasks ของ elder |
| `updateElderReminderSettingsAction` | ตั้งค่า reminder channel/timezone/LINE user id ของ elder |

#### `src/lib/actions/task-events.ts`

| ฟังก์ชัน | ทำหน้าที่ |
|---|---|
| `confirmTaskEventAction` | confirm task event เป็น completed/skipped/missed พร้อม note |
| `confirmTaskFromQuery` | confirm task จาก query link เช่น LINE link |
| `getTodayTaskEvents` | ดึง tasks ของวันนี้ |
| `getTaskEvent` | ดึง task event รายตัว |
| `getTodayStatusSummary` | สรุป task status วันนี้ |
| `getOpenAlerts` | ดึง care alerts ที่ยังเปิดอยู่ |
| `acknowledgeAlertAction` | acknowledge alert |
| `getNotificationLogs` | ดึงประวัติ notification |
| `syncTodayTasksForWorkspace` | generate task events + enqueue reminder สำหรับวันนี้ |

#### `src/lib/services/task-events.ts`

| ฟังก์ชัน | ทำหน้าที่ |
|---|---|
| `generateTaskEventsForWorkspace` | generate task events ของ workspace ตาม care tasks และ medication schedule |
| `generateTaskEventsForElder` | generate task events เฉพาะ elder |
| `enqueueRemindersForPendingEvents` | สร้าง reminder queue สำหรับ task events ที่ยัง pending |

#### `src/lib/services/reminder-processor.ts`

| ฟังก์ชัน | ทำหน้าที่ |
|---|---|
| `processReminderQueue` | อ่าน reminder_queue ที่ถึงเวลา ส่ง notification ผ่าน channel ที่กำหนด และบันทึก notification_logs |
| `buildReminderMessage` | สร้างข้อความ reminder ที่ส่งให้ผู้ใช้ |

#### `src/lib/line/messaging.ts`

| ฟังก์ชัน | ทำหน้าที่ |
|---|---|
| `sendLinePushMessage` | ส่ง push message ผ่าน LINE Messaging API |
| `verifyLineSignature` | ตรวจ signature ของ LINE webhook |

### ผลลัพธ์

- สร้าง schedule และ task confirmation workflow ได้
- มี reminder queue สำหรับ cron
- รองรับ LINE reminder เบื้องต้น
- มี notification history ให้ครอบครัวตรวจย้อนหลัง

---

## Phase 4: Check-in, Vitals, and Alerts

### ทำอะไรไปบ้าง

เพิ่ม daily check-in, vital logs, alert rules, care alerts และ alert engine สำหรับตรวจค่าที่ผิดปกติตาม threshold ที่ผู้ใช้ตั้งเอง

### ไฟล์ฐานข้อมูล

| ไฟล์ | หน้าที่ |
|---|---|
| `supabase/migrations/20260614000000_phase4_checkin_vitals.sql` | สร้าง daily_checkins, vital_logs, alert_rules, care_alerts และ RLS |

### ไฟล์ app / UI

| ไฟล์ | หน้าที่ |
|---|---|
| `src/app/(app)/elders/[id]/check-in/page.tsx` | caregiver/family check-in page |
| `src/app/(app)/elders/[id]/check-in/elder/page.tsx` | elder-friendly check-in page |
| `src/app/(app)/elders/[id]/vitals/page.tsx` | บันทึกและดู vitals |
| `src/app/(app)/elders/[id]/thresholds/page.tsx` | ตั้ง alert rules |
| `src/app/(app)/alerts/[id]/page.tsx` | รายละเอียด alert |

### ฟังก์ชันสำคัญ

#### `src/lib/actions/health.ts`

| ฟังก์ชัน | ทำหน้าที่ |
|---|---|
| `createDailyCheckInAction` | บันทึก daily check-in เช่น mood, sleep, symptoms, fall, note |
| `createVitalLogAction` | บันทึก vital signs เช่น blood pressure, pulse, blood sugar |
| `createAlertRuleAction` | สร้าง threshold rule ที่ผู้ใช้กำหนดเอง |
| `deleteAlertRuleAction` | ลบ alert rule |
| `getDailyCheckIns` | ดึง check-in history |
| `getVitalLogs` | ดึง vital logs ล่าสุด |
| `getAlertRules` | ดึง alert rules ของ elder |
| `getCareAlert` | ดึงรายละเอียด alert รายตัว |
| `getHealthDashboardSummary` | รวมข้อมูล check-in/vitals/alerts สำหรับ dashboard |

#### `src/lib/services/alert-engine.ts`

| ฟังก์ชัน | ทำหน้าที่ |
|---|---|
| `evaluateCheckInAlerts` | ประเมิน check-in ว่าควรสร้าง alert หรือไม่ เช่น fall/symptom concern |
| `evaluateVitalLogAlerts` | ตรวจ vital log เทียบ threshold และสร้าง alert หากเกินช่วง |
| `processMissedDailyCheckIns` | ตรวจ check-in ที่ขาดหายและสร้าง alert |
| `defaultRule` | สร้าง default threshold rule ของ metric |
| `ruleHasBounds` | ตรวจว่า rule มี upper/lower bound หรือไม่ |
| `getViolation` | บอกว่าค่า vital ผิดช่วงเพราะสูง/ต่ำกว่า rule |

### ผลลัพธ์

- มี health logging พื้นฐาน
- ตั้ง threshold ได้โดยผู้ใช้ ไม่ใช่ระบบวินิจฉัยเอง
- มี alert history และ acknowledge workflow
- รักษา clinical boundary ว่าเป็น care coordination ไม่ใช่ diagnosis

---

## Phase 5: Report and AI Summary

### ทำอะไรไปบ้าง

เพิ่มรายงานสุขภาพแบบ 7/14/30 วัน, deterministic AI draft summary, human review, export view และ share link แบบ token

### ไฟล์ฐานข้อมูล

| ไฟล์ | หน้าที่ |
|---|---|
| `supabase/migrations/20260615000000_phase5_reports_ai_summary.sql` | สร้าง reports, report_shares, report status/type และ RLS |

### ไฟล์ app / UI

| ไฟล์ | หน้าที่ |
|---|---|
| `src/app/(app)/elders/[id]/reports/page.tsx` | รายการ reports และสร้าง report ใหม่ |
| `src/app/(app)/elders/[id]/reports/[reportId]/review/page.tsx` | review/edit AI draft ก่อนใช้งานจริง |
| `src/app/(app)/elders/[id]/reports/[reportId]/export/page.tsx` | หน้า export/report document |
| `src/app/report/share/[token]/page.tsx` | public shared report ผ่าน token |
| `src/components/app/report-document.tsx` | component แสดงรายงาน |

### ฟังก์ชันสำคัญ

#### `src/lib/actions/reports.ts`

| ฟังก์ชัน | ทำหน้าที่ |
|---|---|
| `createReportAction` | สร้าง report ใหม่ โดย aggregate ข้อมูล elder แล้ว generate AI draft |
| `updateReportReviewAction` | บันทึกผล human review ของรายงาน |
| `markReportExportedAction` | mark report เป็น exported และบันทึก export URL |
| `createReportShareAction` | สร้าง share token ที่มีวันหมดอายุ |
| `getReportsForElder` | ดึง reports ของ elder |
| `getReport` | ดึง report รายตัวพร้อม elder name |
| `getLatestReportShares` | ดึง share links ล่าสุดของ report |
| `getSharedReport` | ดึง shared report ผ่าน RPC ที่ validate token แล้ว |
| `parseReport` | parse/validate AI output จาก JSON เป็น typed object |
| `parseTextareaList` | แปลง textarea หลายบรรทัดเป็น string array |

#### `src/lib/services/report-aggregation.ts`

| ฟังก์ชัน | ทำหน้าที่ |
|---|---|
| `buildReportAggregate` | รวมข้อมูล medications, tasks, check-ins, vitals, alerts และ caregiver notes ในช่วงวันที่กำหนด |
| `getReportPeriod` | คำนวณวันที่เริ่ม/จบของ report period |
| `average` | คำนวณค่าเฉลี่ย vitals |
| `formatDate` | format วันที่สำหรับ report output |

#### `src/lib/services/ai-summary.ts`

| ฟังก์ชัน | ทำหน้าที่ |
|---|---|
| `generateAiDraftSummary` | สร้าง deterministic AI-like summary จาก aggregate โดยไม่เรียก external AI |
| `getReviewedReportOutput` | เลือก reviewed output ถ้ามี ไม่เช่นนั้นใช้ AI draft |
| `sanitizeDraft` | จำกัด output ให้อยู่ในกรอบ safety เช่น ไม่วินิจฉัย |
| `formatDate` | format วันที่ใน summary |

### ผลลัพธ์

- มีรายงานสรุปสำหรับครอบครัว/แพทย์
- มี human-in-the-loop review ก่อนแชร์
- มี share link แบบ token และมี security hardening เพิ่มใน review phase

---

## Phase 6: Pilot Launch

### ทำอะไรไปบ้าง

เพิ่มเครื่องมือสำหรับ pilot operations เช่น pilot cohort, baseline, interview notes, feedback tickets, pricing signals และ metric summary

### ไฟล์ฐานข้อมูล

| ไฟล์ | หน้าที่ |
|---|---|
| `supabase/migrations/20260616000000_phase6_pilot_launch.sql` | สร้างตาราง pilot cohorts, baselines, interviews, feedback, pricing signals |

### ไฟล์ app / docs

| ไฟล์ | หน้าที่ |
|---|---|
| `src/app/(app)/ops/pilot/page.tsx` | dashboard internal สำหรับติดตาม pilot |
| `src/app/(app)/feedback/page.tsx` | form รับ feedback จากผู้ใช้ |
| `docs/pilot_plan.md` | แผน pilot |
| `docs/pilot_onboarding_call_template.md` | template call onboarding |
| `docs/pilot_weekly_interview_template.md` | template interview รายสัปดาห์ |
| `docs/pilot_churn_exit_template.md` | template churn/exit interview |

### ฟังก์ชันสำคัญ

#### `src/lib/actions/pilot.ts`

| ฟังก์ชัน | ทำหน้าที่ |
|---|---|
| `requirePilotAdmin` | ตรวจ role ว่าแก้ข้อมูล pilot ops ได้หรือไม่ |
| `upsertPilotCohortAction` | สร้าง/อัปเดต cohort ของ pilot workspace |
| `upsertPilotBaselineAction` | บันทึก baseline ก่อนเริ่ม pilot เช่น current tools, pain point |
| `createPilotInterviewAction` | บันทึก interview notes |
| `createPilotFeedbackAction` | รับ feedback/bug จากผู้ใช้ |
| `updatePilotFeedbackStatusAction` | admin เปลี่ยน status ของ feedback |
| `createPilotPricingSignalAction` | บันทึก signal เรื่อง willingness to pay/pricing |
| `getPilotDashboardData` | รวมข้อมูลสำหรับหน้า pilot ops dashboard |

#### `src/lib/services/pilot-metrics.ts`

| ฟังก์ชัน | ทำหน้าที่ |
|---|---|
| `getPilotMetricSummary` | สรุป usage metrics เช่น tasks, check-ins, reports, alerts ตามช่วงเวลา |
| `emptyMetrics` | คืนค่า metric ว่างเมื่อยังไม่มีข้อมูล |

### ผลลัพธ์

- มี workflow สำหรับเรียนรู้จาก pilot users
- เก็บทั้ง quantitative usage และ qualitative feedback
- ใช้ข้อมูล pilot ช่วยตัดสินใจ commercial launch

---

## Phase 7: Commercial Launch

### ทำอะไรไปบ้าง

เพิ่ม public marketing, pricing, legal pages, waitlist, invite-only signup, support workflow, billing plan intent, referral program, onboarding, demo และ sales assets

### ไฟล์ฐานข้อมูล

| ไฟล์ | หน้าที่ |
|---|---|
| `supabase/migrations/20260617000000_phase7_commercial_launch.sql` | สร้าง launch_batches, launch_invites, launch_waitlist, support_tickets, subscriptions, billing_events, referral_codes, referrals |

### ไฟล์ app / UI / docs

| ไฟล์ | หน้าที่ |
|---|---|
| `src/app/page.tsx` | landing page + waitlist form |
| `src/app/pricing/page.tsx` | pricing page |
| `src/app/terms/page.tsx` | Terms |
| `src/app/privacy/page.tsx` | Privacy |
| `src/app/consent/page.tsx` | Health data consent |
| `src/app/help/page.tsx` | Help center |
| `src/app/demo/page.tsx` | Demo storyboard |
| `src/app/sales/page.tsx` | B2B sales page |
| `src/app/(app)/support/page.tsx` | in-app support tickets |
| `src/app/(app)/onboarding/page.tsx` | onboarding checklist |
| `src/app/(app)/settings/page.tsx` | billing plan + referral code UI |
| `src/components/marketing/marketing-shell.tsx` | public marketing layout |
| `src/lib/plans.ts` | plan definitions |
| `docs/commercial_launch_plan.md` | launch plan |
| `docs/support_sla.md` | support SLA |
| `docs/sales_assets.md` | sales/demo assets |

### ฟังก์ชันสำคัญ

#### `src/lib/actions/commercial.ts`

| ฟังก์ชัน | ทำหน้าที่ |
|---|---|
| `joinWaitlistAction` | รับ waitlist submission จาก landing page และบันทึกแบบ idempotent |
| `createSupportTicketAction` | สร้าง support ticket จากผู้ใช้ใน workspace |
| `updateSupportTicketStatusAction` | admin อัปเดตสถานะ support ticket, first response, resolved time |
| `selectBillingPlanAction` | workspace admin เลือก plan intent และบันทึก subscription/billing event |
| `createReferralCodeAction` | สร้าง referral code ของ workspace |
| `getSupportTickets` | ดึง support tickets ของ workspace |
| `getWorkspaceSubscription` | ดึง subscription ปัจจุบัน |
| `getReferralCodes` | ดึง referral codes ของ workspace |

#### `src/lib/services/launch-invites.ts`

| ฟังก์ชัน | ทำหน้าที่ |
|---|---|
| `validateLaunchInviteForSignup` | ตรวจ invite code ตอน signup เมื่อ `LAUNCH_INVITE_REQUIRED=true` โดยใช้ service role |
| `claimLaunchInvite` | mark invite เป็น claimed หลัง signup สำเร็จ |
| `attachClaimedLaunchInviteWorkspace` | ผูก invite ที่ claimed แล้วเข้ากับ workspace ที่สร้างใหม่ |

#### `src/lib/plans.ts`

| ฟังก์ชัน / constant | ทำหน้าที่ |
|---|---|
| `BILLING_PLANS` | รายการ plan เช่น Free, Family Basic, Family Plus, Premium |
| `getPlan` | หา plan จาก plan id |

### ผลลัพธ์

- เปิดตัวเชิง commercial ได้แบบ controlled launch
- มี legal/consent pages และ signup acceptance
- มี support workflow และ billing intent
- มี referral + waitlist + invite gating

---

## Phase 8: Scale and Advanced Features

### ทำอะไรไปบ้าง

เพิ่ม foundation สำหรับ scaling และ advanced workflows เช่น feature gates, caregiver marketplace, facility dashboard, telecare/device readiness, clinic referral, wellness program, multilingual preference และ incident logging

### ไฟล์ฐานข้อมูล

| ไฟล์ | หน้าที่ |
|---|---|
| `supabase/migrations/20260618000000_phase8_scale_advanced_features.sql` | สร้าง feature_gates, facilities, caregiver_profiles, marketplace_requests, telecare_sessions, device_integrations, clinical_referrals, wellness_programs, wellness_enrollments, scale_incidents |

### ไฟล์ app / UI / docs

| ไฟล์ | หน้าที่ |
|---|---|
| `src/app/(app)/scale/page.tsx` | hub และ feature gate control |
| `src/app/(app)/facility/page.tsx` | facility profile + metric cards |
| `src/app/(app)/marketplace/page.tsx` | caregiver profile + marketplace request |
| `src/app/(app)/integrations/page.tsx` | telecare/device request |
| `src/app/(app)/referrals/page.tsx` | clinic referral drafts |
| `src/app/(app)/wellness/page.tsx` | wellness programs/enrollments |
| `src/app/(app)/compliance/page.tsx` | compliance + incident log |
| `src/lib/types/scale.ts` | Phase 8 domain types และ feature keys |
| `src/lib/schemas/scale.ts` | Zod schemas ของ Phase 8 forms |
| `docs/phase8_scale_plan.md` | scale plan |
| `docs/regulatory_boundary_memo.md` | memo ด้าน regulatory boundary |
| `docs/clinical_safety_case.md` | clinical safety case checklist |
| `docs/incident_response.md` | incident response process |

### ฟังก์ชันสำคัญ

#### `src/lib/services/feature-gates.ts`

| ฟังก์ชัน | ทำหน้าที่ |
|---|---|
| `getFeatureGates` | ดึง feature gate status ของ workspace |
| `isFeatureApproved` | ตรวจว่า feature ได้รับ approval แล้วหรือไม่ |
| `getFeatureGateError` | คืน error message ถ้า feature ยังไม่ approved |

#### `src/lib/actions/scale.ts`

| ฟังก์ชัน | ทำหน้าที่ |
|---|---|
| `setPreferredLocaleAction` | ตั้งค่าภาษาที่ผู้ใช้ต้องการ เช่น `th` หรือ `en` |
| `upsertFeatureGateAction` | admin สร้าง/อัปเดต feature gate status พร้อม review notes |
| `upsertFacilityAction` | admin สร้าง/อัปเดต facility profile |
| `upsertCaregiverProfileAction` | caregiver สร้าง/อัปเดต profile listing |
| `createMarketplaceRequestAction` | ครอบครัวสร้าง request หาผู้ดูแล |
| `requestTelecareSessionAction` | admin สร้าง telecare request พร้อม consent |
| `requestDeviceIntegrationAction` | admin สร้าง device integration request พร้อม consent และ gate check |
| `createClinicalReferralAction` | admin สร้าง clinic referral draft โดยไม่ทำ diagnosis/treatment claim |
| `createWellnessProgramAction` | admin สร้าง wellness program |
| `createWellnessEnrollmentAction` | admin enroll elder เข้า wellness program |
| `createScaleIncidentAction` | สมาชิก workspace report incident ของ advanced feature |
| `getScaleDashboardData` | รวมข้อมูลทั้งหมดสำหรับหน้า scale/facility/marketplace/integrations/referrals/wellness/compliance |

#### Helper functions ใน `src/lib/actions/scale.ts`

| ฟังก์ชัน | ทำหน้าที่ |
|---|---|
| `nullable` | แปลง string ว่างเป็น `null` ก่อนบันทึก DB |
| `optionalNumber` | แปลง optional numeric input เป็น number/null |
| `validateElderInWorkspace` | ตรวจว่า elder id อยู่ใน workspace เดียวกัน ป้องกัน cross-workspace UUID injection |
| `validateReportInWorkspace` | ตรวจว่า report id อยู่ใน workspace เดียวกัน |
| `validateWellnessProgramInWorkspace` | ตรวจว่า wellness program ใช้กับ workspace นี้ได้ |
| `requireScaleAdmin` | ตรวจสิทธิ์ owner/family admin สำหรับ advanced workflows |

### ผลลัพธ์

- มี foundation สำหรับ scale โดยยังไม่ทำ clinical automation เกินขอบเขต
- Advanced features ถูก feature-gated
- มี incident logging และ regulatory docs รองรับ

---

## Phase 9: Production Hardening and Validation

### ทำอะไรไปบ้าง

เพิ่มระบบ production readiness tracking, operational drills, release readiness reviews, health endpoint และ runbooks สำหรับ deploy production อย่างมี evidence

### ไฟล์ฐานข้อมูล

| ไฟล์ | หน้าที่ |
|---|---|
| `supabase/migrations/20260619000000_phase9_production_readiness.sql` | สร้าง production_readiness_checks, operational_drills, release_readiness_reviews |

### ไฟล์ app / API / docs

| ไฟล์ | หน้าที่ |
|---|---|
| `src/app/(app)/ops/production/page.tsx` | production readiness dashboard |
| `src/app/api/health/route.ts` | public health endpoint |
| `src/lib/types/production.ts` | types ของ production readiness |
| `src/lib/schemas/production.ts` | Zod schemas ของ production forms |
| `docs/production_readiness_plan.md` | production readiness plan |
| `docs/backup_restore_runbook.md` | backup/restore runbook |
| `docs/monitoring_runbook.md` | monitoring runbook |
| `docs/production_validation_checklist.md` | checklist ก่อน production |

### ฟังก์ชันสำคัญ

#### `src/lib/actions/production.ts`

| ฟังก์ชัน | ทำหน้าที่ |
|---|---|
| `upsertProductionCheckAction` | บันทึก readiness check เช่น migration, RLS, billing, monitoring, security |
| `createOperationalDrillAction` | บันทึก drill เช่น backup restore, rollback, incident response |
| `createReleaseReadinessAction` | สร้าง release review พร้อม checklist และ rollback plan |
| `getProductionDashboardData` | ดึง checks, drills, releases และคำนวณ summary สำหรับ dashboard |

#### Helper functions ใน `src/lib/actions/production.ts`

| ฟังก์ชัน | ทำหน้าที่ |
|---|---|
| `nullable` | แปลง optional string เป็น null |
| `requireProductionAdmin` | ตรวจสิทธิ์ owner/family admin สำหรับ production ops |

#### `src/app/api/health/route.ts`

| ฟังก์ชัน | ทำหน้าที่ |
|---|---|
| `GET` | คืนสถานะ `{ status, service, timestamp }` สำหรับ uptime monitoring โดยไม่เปิดเผยรายละเอียด env ภายใน |

### ผลลัพธ์

- มี dashboard ติดตาม readiness ก่อน production
- มี runbook สำหรับ monitoring, backup/restore, release validation
- มี health endpoint สำหรับ uptime checks

---

## Post-Phase 9: Production Readiness Review Hardening

### ทำอะไรไปบ้าง

หลัง Phase 9 มีการรีวิว project แบบ security/runtime/UX และแก้จุดสำคัญก่อนเริ่ม Phase 10

### ไฟล์ฐานข้อมูล

| ไฟล์ | หน้าที่ |
|---|---|
| `supabase/migrations/20260620000000_security_hardening_shared_reports.sql` | ปิด RLS policy ที่อ่าน shared reports กว้างเกินไป, เพิ่ม RPC สำหรับ shared report token, ปิด launch invite enumeration, scope device readings/events, tighten actor RLS |

### ฟังก์ชัน / การแก้ไขสำคัญ

| ไฟล์ / ฟังก์ชัน | ทำหน้าที่ / สิ่งที่แก้ |
|---|---|
| `src/lib/actions/reports.ts` / `getSharedReport` | เปลี่ยนจาก select ผ่าน public RLS เป็น RPC `get_shared_report_by_token` ที่ validate token ก่อน |
| `src/lib/services/launch-invites.ts` | ย้าย invite helper ออกจาก `"use server"` module เพื่อลดความเสี่ยงถูก invoke เป็น server action |
| `src/lib/actions/commercial.ts` / `joinWaitlistAction` | เพิ่ม `ignoreDuplicates` ให้ waitlist duplicate email ไม่ fail |
| `src/lib/supabase/middleware.ts` | เพิ่ม protected route prefixes ของ Phase 7-9 ให้ middleware redirect login สม่ำเสมอ |
| `src/middleware.ts` | production fail closed ถ้า Supabase env หาย |
| `src/lib/services/feature-gates.ts` | บังคับ feature gate กับ Phase 8 gated workflows ทั้งหมด |
| `src/lib/types/scale.ts` | เพิ่ม `GATED_PHASE8_FEATURES` |
| `src/lib/actions/scale.ts` | align admin-only actions กับ RLS, เพิ่ม workspace scope validation, แก้ device status |
| `src/app/api/health/route.ts` | ลดข้อมูล public health response ไม่ให้เปิดเผย env names |
| `src/app/page.tsx` | รองรับ `?ref=` เพื่อ prefill waitlist referral code |
| `src/components/app/auth-forms.tsx` | invite code เป็น required เมื่อเปิด controlled launch |
| `src/components/app/form-action.tsx` | disable form ขณะ pending และเพิ่ม required/disabled ให้ select/textarea |
| `src/app/(app)/integrations/page.tsx` | ซ่อน admin-only forms จาก non-admin |
| `src/app/(app)/referrals/page.tsx` | ซ่อน admin-only referral form จาก non-admin |
| `src/app/(app)/wellness/page.tsx` | ซ่อน admin-only enrollment form จาก non-admin และเพิ่ม empty state |

### ผลลัพธ์

- ปิดช่องโหว่ shared report ที่อาจทำให้ข้อมูลสุขภาพถูกอ่านโดยไม่ต้องมี token
- ลดความเสี่ยงจาก service-role helper ที่เคยอยู่ใน server action module
- route protection ครบขึ้น
- Phase 8 workflow ตรงกับ RLS และ feature gates
- UX forms ลด error หลัง submit และลด double submit

---

## ตารางสรุป migrations ตามลำดับ

| ลำดับ | ไฟล์ | Phase | ทำหน้าที่หลัก |
|---|---|---|---|
| 1 | `20260612000000_phase2_foundation.sql` | Phase 2 | auth profile, workspace, members, elders, audit, RLS helpers |
| 2 | `20260613000000_phase3_care_tasks.sql` | Phase 3 | medications, care tasks, task events, reminders, notification logs |
| 3 | `20260614000000_phase4_checkin_vitals.sql` | Phase 4 | daily check-ins, vitals, alert rules, care alerts |
| 4 | `20260615000000_phase5_reports_ai_summary.sql` | Phase 5 | reports, report shares |
| 5 | `20260616000000_phase6_pilot_launch.sql` | Phase 6 | pilot ops tables |
| 6 | `20260617000000_phase7_commercial_launch.sql` | Phase 7 | waitlist, invites, support, billing, referrals |
| 7 | `20260618000000_phase8_scale_advanced_features.sql` | Phase 8 | scale/advanced feature foundation |
| 8 | `20260619000000_phase9_production_readiness.sql` | Phase 9 | readiness checks, drills, release reviews |
| 9 | `20260620000000_security_hardening_shared_reports.sql` | Review hardening | shared report security, invite/device/support/incident RLS hardening |

---

## สรุปภาพรวมตาม domain

### Account / Workspace

เกี่ยวข้องกับ `auth.ts`, `workspace.ts`, `session.ts`, `middleware.ts`, `app-shell.tsx`

ทำหน้าที่ให้ผู้ใช้สมัคร, login, สร้าง workspace, เชิญสมาชิก, ตรวจ role, และป้องกัน route ที่ต้อง login

### Elder Care Profile

เกี่ยวข้องกับ `elder.ts`, elder pages, Phase 2 migration

ทำหน้าที่จัดการข้อมูลผู้สูงวัยและ emergency contacts

### Tasks / Reminders

เกี่ยวข้องกับ `care-tasks.ts`, `medications.ts`, `task-events.ts`, `reminder-processor.ts`, cron route, LINE route

ทำหน้าที่สร้างตารางยา/กิจวัตร, generate task events, confirm task, enqueue/send reminders

### Check-in / Vitals / Alerts

เกี่ยวข้องกับ `health.ts`, `alert-engine.ts`, check-in/vitals/threshold pages

ทำหน้าที่บันทึกสุขภาพพื้นฐานและสร้าง alert จาก user-configured rules

### Reports / AI Summary

เกี่ยวข้องกับ `reports.ts`, `report-aggregation.ts`, `ai-summary.ts`, report pages

ทำหน้าที่ aggregate ข้อมูล, สร้าง summary draft, human review, export/share report

### Pilot / Commercial / Scale / Production Ops

เกี่ยวข้องกับ `pilot.ts`, `commercial.ts`, `scale.ts`, `production.ts` และ docs ใน `docs/`

ทำหน้าที่รองรับการทดลองใช้งานจริง, commercial launch, advanced workflows, compliance และ production readiness

---

## สิ่งที่ควรรู้ก่อนทำ Phase 10

Phase 10 ควรต่อยอดจาก production integration จริง เช่น payment provider, monitoring provider, backup automation, E2E tests, LINE production setup, deployment verification และ incident process ที่มี owner ชัดเจน

ก่อนเริ่ม Phase 10 ควรตรวจให้แน่ใจว่า:

- Apply migration ล่าสุดครบถึง `20260620000000_security_hardening_shared_reports.sql`
- ตั้งค่า `SUPABASE_SERVICE_ROLE_KEY` ใน production ถ้าใช้ cron/invite-only signup
- ตั้งค่า `CRON_SECRET`, LINE credentials และ production app URL
- ทดสอบ shared report token ว่า token ถูกต้องเท่านั้นจึงอ่านได้
- ทดสอบ role admin/non-admin ใน Phase 8 workflows
- ทดสอบ `/api/health` กับ uptime monitor

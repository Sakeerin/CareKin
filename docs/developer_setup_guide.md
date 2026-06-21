# CareKin Developer Setup Guide

คู่มือนี้สำหรับนักพัฒนาที่ต้องการนำโปรเจกต์ CareKin ไปรัน, พัฒนา, ทดสอบ, deploy หรือส่งต่อให้ทีมอื่นใช้งานต่อ

CareKin เป็น **Family Care Companion Platform** สำหรับครอบครัวที่ดูแลผู้สูงวัย ใช้ Next.js App Router, Supabase, Server Actions, Row Level Security, Zod และ Tailwind CSS

---

## 1. Tech Stack

| ส่วน | ใช้อะไร |
|---|---|
| Framework | Next.js 15 App Router |
| UI | React 19, Tailwind CSS v4 |
| Backend | Supabase Auth + PostgreSQL |
| Database security | Supabase RLS policies |
| Validation | Zod |
| Server mutations | Next.js Server Actions |
| Background jobs | Vercel Cron หรือ manual cron call |
| Notification | LINE Messaging API optional |
| Deployment target | Vercel |

---

## 2. สิ่งที่ต้องมี

### Required

- Node.js 20+
- npm
- Supabase project
- Git

### Recommended

- Vercel account สำหรับ deploy
- LINE Developers account ถ้าต้องการใช้ LINE reminder
- Supabase CLI ถ้าต้องการจัดการ migration ผ่าน CLI แทน SQL Editor

---

## 3. โครงสร้างโปรเจกต์

```text
src/
  app/                    Next.js routes/pages/API routes
  components/             UI components
  lib/
    actions/              Server Actions สำหรับ auth/workspace/elder/tasks/reports/etc.
    auth/                 session และ role helpers
    line/                 LINE Messaging helpers
    schemas/              Zod schemas
    services/             Business logic เช่น reminders, alerts, reports
    supabase/             Supabase browser/server/admin clients
    types/                TypeScript domain types
supabase/
  migrations/             SQL migrations ตาม phase
docs/                     Product docs, runbooks, setup guides
```

---

## 4. ติดตั้งโปรเจกต์

### 4.1 Clone repository

```bash
git clone https://github.com/Sakeerin/CareKin.git
cd CareKin
```

### 4.2 Install dependencies

```bash
npm install
```

### 4.3 สร้าง env file

```bash
cp .env.example .env.local
```

บน Windows PowerShell ใช้:

```powershell
Copy-Item .env.example .env.local
```

---

## 5. Environment Variables

ตั้งค่าใน `.env.local` สำหรับ local development และตั้งค่าเดียวกันใน Vercel Environment Variables เมื่อต้อง deploy

| Variable | จำเป็นไหม | ใช้ทำอะไร |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | จำเป็น | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | จำเป็น | Supabase anon key สำหรับ browser/server session client |
| `NEXT_PUBLIC_APP_URL` | จำเป็น | base URL ของ app ใช้สร้าง invite/share links |
| `SUPABASE_SERVICE_ROLE_KEY` | จำเป็นสำหรับ cron/invite launch | ใช้ admin client สำหรับ background jobs และ invite-only signup |
| `CRON_SECRET` | จำเป็นถ้าเปิด reminder cron | Bearer token ป้องกัน `/api/cron/reminders` |
| `LINE_CHANNEL_ACCESS_TOKEN` | optional | ส่ง LINE push notification |
| `LINE_CHANNEL_SECRET` | optional | verify LINE webhook signature |
| `LAUNCH_INVITE_REQUIRED` | optional | ตั้ง `true` เพื่อบังคับ signup ด้วย invite code |

ตัวอย่าง local:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
CRON_SECRET=local-dev-secret
LINE_CHANNEL_ACCESS_TOKEN=
LINE_CHANNEL_SECRET=
LAUNCH_INVITE_REQUIRED=false
```

ข้อควรระวัง:

- ห้าม commit `.env.local`
- `SUPABASE_SERVICE_ROLE_KEY` เป็น secret ระดับสูง ห้ามใช้ฝั่ง browser
- ถ้า `LAUNCH_INVITE_REQUIRED=true` ต้องมี `SUPABASE_SERVICE_ROLE_KEY`
- ใน production ถ้าไม่มี Supabase URL/anon key middleware จะตอบ 503 เพื่อ fail closed

---

## 6. ตั้งค่า Supabase

### 6.1 สร้าง Supabase project

1. เข้า Supabase Dashboard
2. สร้าง project ใหม่
3. ไปที่ Project Settings → API
4. Copy ค่า:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`

### 6.2 Apply migrations

Apply migration ตามลำดับนี้ใน Supabase SQL Editor หรือผ่าน Supabase CLI

```text
supabase/migrations/20260612000000_phase2_foundation.sql
supabase/migrations/20260613000000_phase3_care_tasks.sql
supabase/migrations/20260614000000_phase4_checkin_vitals.sql
supabase/migrations/20260615000000_phase5_reports_ai_summary.sql
supabase/migrations/20260616000000_phase6_pilot_launch.sql
supabase/migrations/20260617000000_phase7_commercial_launch.sql
supabase/migrations/20260618000000_phase8_scale_advanced_features.sql
supabase/migrations/20260619000000_phase9_production_readiness.sql
supabase/migrations/20260620000000_security_hardening_shared_reports.sql
```

สำคัญ:

- ต้อง apply ตามลำดับ เพราะ migration หลังอ้างอิง table/function จาก migration ก่อนหน้า
- migration ล่าสุด `20260620000000_security_hardening_shared_reports.sql` เป็น security hardening ต้อง apply ก่อนใช้งานจริง
- ถ้า paste ใน SQL Editor แล้ว error ให้หยุดแก้ก่อน apply ไฟล์ถัดไป

### 6.3 Auth settings

ใน Supabase Auth:

- Enable email/password signups
- ตั้ง Site URL เป็น local หรือ production URL เช่น `http://localhost:3000` หรือ `https://your-app.vercel.app`
- เพิ่ม Redirect URLs ที่จำเป็น เช่น:

```text
http://localhost:3000/**
https://your-app.vercel.app/**
```

---

## 7. รันโปรเจกต์แบบ Local

### 7.1 Start dev server

```bash
npm run dev
```

เปิด:

```text
http://localhost:3000
```

### 7.2 Build production locally

```bash
npm run build
```

### 7.3 Start production build locally

```bash
npm run start
```

ต้อง run `npm run build` ก่อน

### 7.4 Lint

```bash
npm run lint
```

หมายเหตุ: ถ้า Next.js version ปัจจุบันแจ้งว่า `next lint` deprecated ให้ใช้แนวทาง lint ใหม่ของ Next.js/ESLint ในอนาคต

---

## 8. First Run Checklist

หลังรัน local ครั้งแรก ให้ทดสอบตามนี้

1. เปิด `/signup`
2. สมัครบัญชีใหม่
3. สร้าง workspace ที่ `/workspace/new`
4. เพิ่ม elder ที่ `/elders/new`
5. เพิ่ม medication ที่ `/elders/[id]/medications`
6. เพิ่ม routine ที่ `/elders/[id]/routines`
7. เปิด `/dashboard` และ `/tasks`
8. บันทึก check-in ที่ `/elders/[id]/check-in`
9. บันทึก vitals ที่ `/elders/[id]/vitals`
10. สร้าง report ที่ `/elders/[id]/reports`
11. ทดสอบ share report แล้วเปิด `/report/share/[token]`
12. เปิด `/support` และสร้าง support ticket
13. เปิด `/ops/production` แล้วเพิ่ม readiness check

---

## 9. Role และ Permission ที่ควรรู้

ระบบใช้ workspace membership role และ Supabase RLS เป็นหลัก

| Role | ความหมายโดยสรุป |
|---|---|
| `owner` | เจ้าของ workspace จัดการทุกอย่าง |
| `family_admin` | จัดการ elder, member, report, billing, feature gates |
| `family_viewer` | ดูข้อมูลได้ แต่แก้ไขจำกัด |
| `caregiver` | บันทึก care/check-in ได้ตาม policy |
| `elder` | สำหรับ flow ผู้สูงวัย |
| `clinician_viewer` | ใช้กับการดู report ที่แชร์แบบจำกัด |

ข้อควรระวังสำหรับ dev:

- อย่า bypass `requireUser()` / `requireWorkspace()` ใน Server Actions ที่ mutate data
- ถ้าเพิ่ม table ใหม่ ต้องเพิ่ม RLS policy
- ถ้า action รับ `elderId`, `reportId`, หรือ UUID ของ resource ควร validate ว่าอยู่ใน workspace เดียวกัน

---

## 10. Important Routes

### Public routes

| Route | ใช้ทำอะไร |
|---|---|
| `/` | Landing page + waitlist |
| `/pricing` | Pricing |
| `/terms` | Terms |
| `/privacy` | Privacy policy |
| `/consent` | Health data consent |
| `/help` | Help center |
| `/demo` | Demo storyboard |
| `/sales` | B2B sales page |
| `/report/share/[token]` | Shared report ด้วย token |
| `/api/health` | Uptime health check |

### Auth routes

| Route | ใช้ทำอะไร |
|---|---|
| `/signup` | สมัครบัญชี |
| `/login` | Login |
| `/workspace/new` | สร้าง workspace |
| `/invite/accept` | รับ invite |

### App routes

| Route | ใช้ทำอะไร |
|---|---|
| `/dashboard` | Dashboard หลัก |
| `/elders` | รายชื่อผู้สูงวัย |
| `/elders/[id]` | รายละเอียด elder |
| `/elders/[id]/medications` | จัดการยา |
| `/elders/[id]/routines` | จัดการ routine |
| `/tasks` | Tasks วันนี้ |
| `/notifications` | Notification logs |
| `/alerts/[id]` | Alert detail |
| `/support` | Support tickets |
| `/settings` | Profile/workspace/billing/referral settings |
| `/ops/pilot` | Pilot ops |
| `/ops/production` | Production readiness |

### Scale routes

| Route | ใช้ทำอะไร |
|---|---|
| `/scale` | Feature gates และ advanced feature hub |
| `/facility` | Facility readiness |
| `/marketplace` | Caregiver marketplace |
| `/integrations` | Telecare/device requests |
| `/referrals` | Clinic referrals |
| `/wellness` | Wellness programs |
| `/compliance` | Compliance + incident log |

---

## 11. Background Jobs และ Cron

### 11.1 Reminder cron endpoint

Endpoint:

```text
GET /api/cron/reminders
```

ใช้ header:

```text
Authorization: Bearer <CRON_SECRET>
```

Local test:

```bash
curl -H "Authorization: Bearer local-dev-secret" http://localhost:3000/api/cron/reminders
```

หน้าที่ของ cron:

- generate task events ของวันนี้
- enqueue reminders
- process reminder queue
- mark missed tasks
- create missed check-in alerts
- send LINE push ถ้าตั้งค่า LINE แล้ว

### 11.2 Vercel Cron

ไฟล์ `vercel.json` ตั้งไว้:

```json
{
  "crons": [
    {
      "path": "/api/cron/reminders",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

แปลว่า Vercel จะเรียก `/api/cron/reminders` ทุก 5 นาที

ต้องตั้ง `CRON_SECRET` ใน Vercel env

---

## 12. LINE Messaging Setup

ถ้าต้องการใช้ LINE reminders:

1. สร้าง Messaging API channel ใน LINE Developers
2. ตั้ง env:

```env
LINE_CHANNEL_ACCESS_TOKEN=...
LINE_CHANNEL_SECRET=...
```

3. ตั้ง webhook URL:

```text
https://your-app.vercel.app/api/line/webhook
```

4. ใน elder profile page ให้ตั้ง:
   - reminder channel เป็น LINE
   - LINE User ID ของผู้รับ reminder

ไฟล์ที่เกี่ยวข้อง:

| ไฟล์ | หน้าที่ |
|---|---|
| `src/app/api/line/webhook/route.ts` | รับ LINE webhook |
| `src/lib/line/messaging.ts` | ส่ง LINE push และ verify signature |
| `src/lib/services/reminder-processor.ts` | สร้างข้อความและส่ง reminder |

---

## 13. Commercial Launch / Invite-only Signup

ถ้าต้องการเปิด controlled launch:

```env
LAUNCH_INVITE_REQUIRED=true
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

สิ่งที่ต้องเตรียมใน DB:

- สร้าง `launch_batches`
- สร้าง `launch_invites`
- ส่ง invite code ให้ลูกค้ากลุ่มแรก

Flow:

1. ผู้ใช้เข้า `/signup`
2. ระบบบังคับกรอก invite code
3. `validateLaunchInviteForSignup` ตรวจ code ด้วย service role
4. signup สำเร็จแล้ว `claimLaunchInvite` mark invite เป็น claimed
5. เมื่อสร้าง workspace แล้ว `attachClaimedLaunchInviteWorkspace` ผูก invite กับ workspace

ไฟล์ที่เกี่ยวข้อง:

| ไฟล์ | หน้าที่ |
|---|---|
| `src/lib/services/launch-invites.ts` | validate/claim/attach invite |
| `src/lib/actions/auth.ts` | signup flow |
| `src/lib/actions/workspace.ts` | create workspace แล้ว attach invite |
| `src/components/app/auth-forms.tsx` | signup form |
| `src/app/(auth)/signup/page.tsx` | ส่ง `inviteRequired` ตาม env |

---

## 14. Feature Gates สำหรับ Advanced Features

Phase 8 workflows บางอย่างต้องเปิด gate ก่อนใช้งาน เช่น:

- caregiver marketplace
- facility dashboard
- telecare sessions
- medical device integration
- fall detection
- clinic referrals
- insurance wellness

ใช้หน้า:

```text
/scale
```

ไฟล์ที่เกี่ยวข้อง:

| ไฟล์ | หน้าที่ |
|---|---|
| `src/lib/types/scale.ts` | นิยาม feature keys และ `GATED_PHASE8_FEATURES` |
| `src/lib/services/feature-gates.ts` | ตรวจว่า feature approved หรือยัง |
| `src/lib/actions/scale.ts` | block action ถ้า gate ยังไม่ approved |
| `src/app/(app)/scale/page.tsx` | UI สำหรับจัดการ gates |

ข้อควรระวัง:

- ห้ามเปิด clinical-adjacent feature โดยไม่มี review notes
- Telecare/device/referral/wellness enrollment เป็น admin-only ตาม RLS/action ปัจจุบัน

---

## 15. Reports และ Shared Report Security

Report sharing ใช้ token ที่หมดอายุได้

ไฟล์ที่เกี่ยวข้อง:

| ไฟล์ | หน้าที่ |
|---|---|
| `src/lib/actions/reports.ts` | สร้าง report, review, export, share, read shared report |
| `src/lib/services/report-aggregation.ts` | รวมข้อมูล report |
| `src/lib/services/ai-summary.ts` | deterministic AI summary |
| `src/app/report/share/[token]/page.tsx` | public shared report page |
| `supabase/migrations/20260620000000_security_hardening_shared_reports.sql` | RPC + RLS hardening สำหรับ shared reports |

ข้อควรตรวจ:

- shared report ต้องเปิดได้เฉพาะ token ที่ถูกต้อง
- expired/revoked token ต้องเปิดไม่ได้
- ห้ามเพิ่ม RLS policy ที่ทำให้ anonymous อ่าน reports โดยไม่ใช้ token

---

## 16. Production Readiness

ก่อน deploy production จริง ให้ใช้:

```text
/ops/production
```

บันทึก:

- migration applied evidence
- RLS/security review
- E2E validation
- billing readiness
- monitoring readiness
- backup/restore drill
- incident/rollback drill
- release readiness review

Docs ที่ควรอ่าน:

| ไฟล์ | ใช้ทำอะไร |
|---|---|
| `docs/production_readiness_plan.md` | แผน production readiness |
| `docs/production_validation_checklist.md` | checklist ก่อน production |
| `docs/backup_restore_runbook.md` | วิธี backup/restore |
| `docs/monitoring_runbook.md` | monitoring และ alerting |
| `docs/incident_response.md` | incident response |

---

## 17. Deploy to Vercel

### 17.1 เชื่อม repo

1. ไปที่ Vercel
2. Import GitHub repo `CareKin`
3. Framework preset: Next.js
4. Build command: `npm run build`
5. Output/default: ใช้ค่า default ของ Vercel

### 17.2 ตั้ง Environment Variables

ตั้งค่าตาม `.env.example`:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_APP_URL
SUPABASE_SERVICE_ROLE_KEY
CRON_SECRET
LINE_CHANNEL_ACCESS_TOKEN
LINE_CHANNEL_SECRET
LAUNCH_INVITE_REQUIRED
```

สำหรับ production:

- `NEXT_PUBLIC_APP_URL` ต้องเป็น production URL
- `CRON_SECRET` ต้องเป็นค่าสุ่มยาว
- `SUPABASE_SERVICE_ROLE_KEY` ต้องอยู่เฉพาะ server env
- ถ้าเปิด invite-only ต้องตั้ง `LAUNCH_INVITE_REQUIRED=true`

### 17.3 หลัง deploy

ตรวจ:

```text
https://your-app.vercel.app/api/health
```

ควรได้:

```json
{
  "status": "ok",
  "service": "carekin",
  "timestamp": "..."
}
```

---

## 18. Development Workflow

แนะนำ flow สำหรับ dev:

1. Pull ล่าสุดจาก `main`
2. สร้าง branch ใหม่
3. แก้ code
4. ถ้าเพิ่ม DB schema ให้เพิ่ม migration ใหม่ใน `supabase/migrations/`
5. เพิ่ม/แก้ Zod schema ใน `src/lib/schemas/`
6. เพิ่ม/แก้ type ใน `src/lib/types/`
7. เขียน Server Action ใน `src/lib/actions/`
8. เพิ่ม UI route ใน `src/app/`
9. รัน build
10. ทดสอบ role/RLS ที่เกี่ยวข้อง

คำสั่งหลัก:

```bash
npm run dev
npm run build
npm run start
```

---

## 19. Coding Guidelines เฉพาะโปรเจกต์นี้

### Server Actions

ทุก mutation ควร:

- validate input ด้วย Zod
- เรียก `requireUser()` ถ้าต้องรู้ actor
- เรียก `requireWorkspace()` ถ้าผูกกับ workspace
- ตรวจ role เช่น `canManageWorkspace`
- validate resource ว่าอยู่ใน workspace เดียวกัน
- บันทึก audit log ถ้าเป็น action สำคัญ
- `revalidatePath()` หลัง mutation

ตัวอย่าง pattern:

```ts
const user = await requireUser()
const { workspace, membership } = await requireWorkspace()

if (!canManageWorkspace(membership.role)) {
  return { error: "ไม่มีสิทธิ์" }
}

const parsed = schema.safeParse(...)
if (!parsed.success) {
  return { error: parsed.error.errors[0]?.message ?? "ข้อมูลไม่ถูกต้อง" }
}
```

### Supabase / RLS

ถ้าเพิ่ม table ใหม่:

- เปิด RLS เสมอ
- เพิ่ม policy สำหรับ select/insert/update/delete ตาม role
- เพิ่ม index สำหรับ query ที่ใช้บ่อย
- เพิ่ม `updated_at` trigger ถ้ามี column `updated_at`
- ระวัง policy ที่มี `... is null or ...` เพราะอาจเปิดข้อมูลข้าม workspace

### Health data

ข้อมูลสุขภาพถือเป็น sensitive data:

- ห้าม log PHI ลง console/third-party โดยไม่จำเป็น
- share report ต้องใช้ token/expiry/revocation
- AI summary ต้องมี disclaimer และไม่ทำ diagnosis/treatment claim
- clinical-adjacent feature ต้องผ่าน feature gate

---

## 20. Troubleshooting

### Signup แล้วไปต่อไม่ได้

ตรวจ:

- Supabase Auth เปิด email/password หรือไม่
- `NEXT_PUBLIC_SUPABASE_URL` และ anon key ถูกไหม
- ถ้า `LAUNCH_INVITE_REQUIRED=true` มี invite code และ service role key หรือไม่

### Dashboard redirect ไป `/workspace/new`

แปลว่าผู้ใช้ login แล้วแต่ยังไม่มี workspace membership

ให้สร้าง workspace ที่ `/workspace/new` หรือรับ invite

### Supabase RLS error

ตรวจ:

- user เป็น member ของ workspace หรือไม่
- role มีสิทธิ์ action นั้นไหม
- resource เช่น `elderId` อยู่ใน workspace เดียวกันไหม
- migration apply ครบหรือไม่

### Cron ไม่ทำงาน

ตรวจ:

- ตั้ง `CRON_SECRET` หรือยัง
- request มี header `Authorization: Bearer <CRON_SECRET>` หรือไม่
- ตั้ง `SUPABASE_SERVICE_ROLE_KEY` หรือยัง
- Vercel Cron ถูก deploy พร้อม `vercel.json` หรือไม่

### LINE ไม่ส่งข้อความ

ตรวจ:

- `LINE_CHANNEL_ACCESS_TOKEN`
- `LINE_CHANNEL_SECRET`
- webhook URL ใน LINE Developers
- LINE User ID ใน elder profile
- reminder channel ของ elder

### Shared report เปิดไม่ได้

ตรวจ:

- token ถูกต้องไหม
- token หมดอายุหรือถูก revoke หรือไม่
- apply migration `20260620000000_security_hardening_shared_reports.sql` แล้วหรือยัง

### `/api/health` ได้ `degraded`

ตรวจ env required:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL`

---

## 21. Required Checklist ก่อนส่งให้ทีมอื่นใช้งาน

- [ ] Run `npm install`
- [ ] สร้าง `.env.local`
- [ ] ตั้ง Supabase env ครบ
- [ ] Apply migrations ครบทุกไฟล์ตามลำดับ
- [ ] Run `npm run build` ผ่าน
- [ ] Signup/login ได้
- [ ] สร้าง workspace ได้
- [ ] เพิ่ม elder ได้
- [ ] สร้าง medication/routine ได้
- [ ] Cron endpoint ใช้ได้
- [ ] Report/share report ใช้ได้
- [ ] `/api/health` เป็น `ok`
- [ ] Production env ตั้งครบใน Vercel
- [ ] อ่าน `docs/production_validation_checklist.md` ก่อน go-live

---

## 22. เอกสารอื่นที่ควรอ่าน

| ไฟล์ | เนื้อหา |
|---|---|
| `README.md` | setup และ route overview แบบสั้น |
| `implementation_plan.md` | แผน product และ phase ทั้งหมด |
| `docs/phase_implementation_summary.md` | สรุปสิ่งที่ทำไปแต่ละ phase |
| `docs/rls_test_guide.md` | แนวทาง test RLS |
| `docs/commercial_launch_plan.md` | แผน commercial launch |
| `docs/support_sla.md` | support SLA |
| `docs/phase8_scale_plan.md` | แผน scale/advanced features |
| `docs/regulatory_boundary_memo.md` | regulatory boundary |
| `docs/production_readiness_plan.md` | production readiness |
| `docs/production_validation_checklist.md` | checklist production |


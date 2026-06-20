# Implementation Plan: HealthTech / AgeTech สำหรับผู้สูงวัย

> เวอร์ชัน: 1.0  
> วันที่จัดทำ: 2026-06-07  
> เป้าหมาย: วางแผนพัฒนาระบบ HealthTech / AgeTech สำหรับผู้สูงวัย ตั้งแต่ validation, MVP, architecture, development, compliance, pilot, launch และ scaling

---

## 1. Executive Summary

โปรเจกต์นี้คือระบบ **Family Care Companion Platform** สำหรับช่วยครอบครัวและผู้ดูแลติดตามสุขภาวะพื้นฐานของผู้สูงวัย เช่น การกินยา อาการประจำวัน ความดัน น้ำตาล น้ำหนัก นัดหมายแพทย์ เหตุฉุกเฉิน และกิจกรรมดูแลรายวัน โดยเริ่มจาก use case ที่ไม่เข้าเขตการวินิจฉัยหรือรักษาโรคโดยตรง เพื่อลดความเสี่ยงด้านกฎหมายและ medical device regulation

แนวทางที่แนะนำคือเริ่มจาก **care coordination + reminder + family dashboard** ก่อน แล้วค่อยขยายไปสู่ remote monitoring, caregiver marketplace, clinic integration และ telecare เมื่อมีข้อมูลการใช้งานจริงและผ่านการประเมิน compliance แล้ว

### Product positioning

ระบบนี้ไม่ควรเริ่มจากการเป็น “แอปวินิจฉัยโรค” แต่ควรวางเป็น:

- ระบบช่วยครอบครัวดูแลผู้สูงวัย
- ระบบบันทึกข้อมูลสุขภาพพื้นฐาน
- ระบบเตือนกิจวัตรและยา
- ระบบแจ้งเตือนความผิดปกติที่ผู้ใช้กำหนดเอง
- ระบบประสานงานระหว่างผู้สูงวัย ลูกหลาน caregiver และสถานพยาบาล

### Why now

ประเทศไทยเข้าสู่สังคมสูงวัยอย่างรวดเร็ว โดย NHSO ระบุว่าไทยเป็น complete aging society ตั้งแต่ปี 2022 และมีประชากรอายุ 60 ปีขึ้นไปประมาณ 19% ของประชากร พร้อมคาดการณ์สู่ super-aged society ภายในปี 2040. ขณะเดียวกัน WHO และ ITU เน้นว่าระบบ telehealth/digital health สำหรับผู้สูงวัยต้องออกแบบให้เข้าถึงง่าย ลด digital divide และคำนึงถึง accessibility ตั้งแต่ต้น.

แหล่งอ้างอิงหลัก:

- National Statistical Office Thailand: Survey of the Older Persons in Thailand
- NHSO: Thailand long-term care model and aging society
- WHO: Healthy ageing in a digital world
- ITU/WHO: Implementation toolkit for accessible telehealth services
- Thailand PDPA: health data as sensitive personal data
- Thai FDA / SaMD guidance: กรณีระบบเข้าข่าย medical device software

---

## 2. Vision, Mission, and Principles

### Vision

ทำให้ครอบครัวไทยสามารถดูแลผู้สูงวัยที่บ้านได้ปลอดภัยขึ้น เป็นระบบขึ้น และเหนื่อยน้อยลง โดยไม่จำเป็นต้องเริ่มจากอุปกรณ์ราคาแพงหรือระบบโรงพยาบาลเต็มรูปแบบ

### Mission

สร้างแพลตฟอร์มที่ช่วยให้ผู้สูงวัย ลูกหลาน และ caregiver ทำงานร่วมกันได้ง่ายผ่าน LINE, mobile web และ dashboard โดยมีข้อมูลสุขภาพพื้นฐาน ตารางดูแล การแจ้งเตือน และรายงานสรุปที่เข้าใจง่าย

### Product principles

1. **Elder-first UX**: ตัวหนังสือใหญ่ ใช้ง่าย ปุ่มน้อย ภาษาไทยชัดเจน
2. **Family-first workflow**: ลูกหลานต้องเห็นสถานะโดยไม่รบกวนผู้สูงวัยเกินไป
3. **Human-in-the-loop**: ระบบช่วยเตือนและสรุป แต่ไม่ตัดสินใจแทนแพทย์
4. **Privacy by design**: ข้อมูลสุขภาพเป็นข้อมูลอ่อนไหว ต้องออกแบบ consent, access control และ audit log ตั้งแต่แรก
5. **Low-friction adoption**: เริ่มจาก LINE และ web ไม่บังคับติดตั้งแอปตั้งแต่วันแรก
6. **Clinical boundary clarity**: ไม่เคลมว่า diagnosis/treatment เว้นแต่ผ่าน regulatory path แล้ว
7. **Caregiver-friendly**: ผู้ดูแลต้องกรอกข้อมูลเร็ว ใช้งานง่าย และลดภาระงานจริง

---

## 3. Target Users and First Niche

### Recommended first niche

**ครอบครัวเมืองไทยที่มีผู้สูงวัยอายุ 65+ อยู่บ้าน และมีลูกหลานช่วยดูแลจากระยะไกล**

เหตุผล:

- ปัญหาชัด: ลูกหลานไม่รู้ว่าพ่อแม่กินยาหรือยัง วัดความดันหรือยัง มีอาการผิดปกติไหม
- เริ่มได้โดยไม่ต้องเชื่อมโรงพยาบาลทันที
- ใช้ LINE เป็น channel หลักได้
- ขายได้ทั้ง B2C และ B2B2C เช่น คลินิก, ศูนย์ดูแลผู้สูงวัย, บริษัทประกัน, employer welfare

### Primary personas

#### Persona 1: ลูกหลานผู้ดูแลหลัก

- อายุ 30-55 ปี
- ทำงานประจำหรือทำธุรกิจ
- ไม่ได้อยู่บ้านเดียวกับผู้สูงวัยตลอดเวลา
- ต้องการรู้สถานะรายวันแบบไม่ต้องโทรถามตลอด
- ยอมจ่ายรายเดือนถ้าระบบช่วยลดความกังวลและลดเหตุฉุกเฉิน

#### Persona 2: ผู้สูงวัย

- อายุ 65-85 ปี
- ใช้ LINE ได้บ้างหรือมี caregiver ช่วย
- ไม่ชอบแอปซับซ้อน
- ต้องการปุ่มใหญ่ เสียงเตือนชัด และข้อความสั้น
- อาจมีโรคประจำตัว เช่น ความดัน เบาหวาน ไขมัน หัวใจ แต่ระบบ MVP ยังไม่วินิจฉัยหรือแนะนำการรักษา

#### Persona 3: caregiver / ผู้ช่วยดูแล

- เป็นญาติ, ผู้ดูแลประจำบ้าน, พนักงานศูนย์ดูแล หรือ อสม./เจ้าหน้าที่ชุมชนในอนาคต
- ต้องบันทึกกิจกรรม เช่น กินยา อาหาร น้ำ การนอน อาการ เวลาวัด vital signs
- ต้องการ flow ที่กรอกเร็วที่สุด

#### Persona 4: คลินิกหรือศูนย์ดูแลผู้สูงวัย

- ต้องการ dashboard ดูผู้สูงวัยหลายคน
- ต้องการ care plan template, task tracking และรายงานให้ญาติ
- ต้องการเพิ่มความน่าเชื่อถือและรายได้ recurring

---

## 4. Problem Statement

### Current pain points

1. ครอบครัวไม่รู้สถานะผู้สูงวัยแบบ real-time
2. การกินยาและนัดหมายแพทย์ตกหล่นง่าย
3. ข้อมูลสุขภาพกระจัดกระจายในกระดาษ, LINE chat, รูปถ่าย, สมุดจด
4. ผู้สูงวัยบางคนอยู่คนเดียวหรืออยู่กับ caregiver ที่ลูกหลานไม่ได้เห็นข้อมูล
5. เมื่อต้องไปพบแพทย์ ไม่มีสรุปประวัติรายวันย้อนหลัง
6. ลูกหลานกังวล แต่การโทรถามทุกวันสร้าง friction
7. ศูนย์ดูแล/คลินิกขนาดเล็กยังขาดระบบ care coordination ที่ใช้ง่ายและราคาไม่สูง

### Jobs to be done

- “เมื่อฉันอยู่ไกลพ่อแม่ ฉันอยากรู้ว่าเขากินยาและมีอาการผิดปกติไหม เพื่อให้ฉันช่วยได้ทันเวลา”
- “เมื่อ caregiver ดูแลผู้สูงวัย ฉันอยากให้บันทึกกิจกรรมรายวันง่าย ๆ เพื่อให้ครอบครัวเช็กได้”
- “เมื่อจะไปหาหมอ ฉันอยากได้สรุปข้อมูล 7-30 วันย้อนหลัง เพื่อคุยกับแพทย์ได้แม่นขึ้น”
- “เมื่อเกิดเหตุผิดปกติ ฉันอยากให้ระบบแจ้งเตือนคนที่เกี่ยวข้องทันที”

---

## 5. Scope Strategy

## 5.1 MVP scope

MVP ต้องทำให้น้อยแต่แก้ปัญหาหลักจริง โดยเน้น 5 capability:

1. **Care profile**
   - ข้อมูลผู้สูงวัย
   - ผู้ติดต่อฉุกเฉิน
   - โรคประจำตัวแบบ free text / tag
   - ยาที่ต้องกิน
   - ข้อควรระวัง

2. **Medication and routine reminder**
   - ตารางกินยา
   - ตารางวัดความดัน/น้ำตาล/น้ำหนัก
   - ตารางนัดหมายแพทย์
   - reminder ผ่าน LINE หรือ notification
   - confirm done / missed

3. **Daily check-in**
   - อารมณ์/อาการวันนี้
   - นอนหลับดีไหม
   - กินอาหาร/ดื่มน้ำ
   - ปวด/เวียนหัว/หกล้ม/หายใจเหนื่อย
   - note เพิ่มเติม

4. **Family dashboard**
   - status วันนี้
   - missed reminders
   - recent logs
   - trend เบื้องต้น
   - alert history

5. **Care summary report**
   - รายงาน 7 วัน / 30 วัน
   - export PDF
   - สรุปให้ลูกหลานหรือแพทย์อ่านง่าย
   - AI ช่วยสรุปเฉพาะข้อมูลที่ผู้ใช้บันทึก โดยห้ามวินิจฉัย

## 5.2 Out of scope สำหรับ MVP

ห้ามทำใน MVP เว้นแต่มีผู้เชี่ยวชาญและ regulatory review:

- diagnosis
- medication recommendation
- emergency triage ที่แทนบุคลากรแพทย์
- automatic treatment plan
- AI วิเคราะห์ภาพแผลเพื่อบอกโรค
- AI ประเมินโรคสมองเสื่อมแบบ medical claim
- เชื่อม medical device โดยใช้ผลเพื่อวินิจฉัย
- telemedicine prescription
- payment claim กับประกัน

## 5.3 Future scope

- caregiver marketplace
- clinic/long-term care dashboard
- IoT integration เช่น smart pill box, blood pressure monitor, fall sensor
- telecare video call
- appointment booking
- insurance wellness package
- community health worker workflow
- family finance/scam protection module
- dementia-friendly activity planner

---

## 6. Product Modules

## 6.1 Account and workspace

### Requirements

- user sign up/login
- family workspace
- role-based access control
- invite family members
- invite caregiver
- workspace owner
- consent workflow

### Roles

| Role | Permission |
|---|---|
| Owner | จัดการ workspace, billing, consent, members |
| Family Admin | ดู/แก้ไขข้อมูล, ตั้ง reminder, export report |
| Family Viewer | ดู dashboard/report |
| Caregiver | บันทึกข้อมูล, confirm task, เห็นเฉพาะข้อมูลจำเป็น |
| Elder | confirm check-in, ดู reminder ของตัวเอง |
| Clinician Viewer | ดู report ที่ครอบครัวแชร์แบบจำกัดเวลา |

## 6.2 Elder profile

### Data fields

- full name / nickname
- date of birth หรือ age range
- gender optional
- living arrangement
- emergency contact
- allergies
- chronic conditions
- mobility notes
- preferred hospital/clinic
- doctor contact optional
- care instructions

### Important rule

ข้อมูลสุขภาพต้องเก็บเท่าที่จำเป็นเท่านั้น และต้องมี explicit consent หรือ lawful basis ที่เหมาะสมตาม PDPA เพราะ health data เป็น sensitive personal data

## 6.3 Medication management

### MVP features

- add medication name
- dosage free text
- schedule time
- start/end date
- instruction
- reminder channel
- confirm taken
- skip with reason
- missed alert

### Safety boundaries

- ระบบไม่แนะนำยา
- ระบบไม่เปลี่ยน dosage
- ระบบไม่เตือน drug interaction ใน MVP
- ถ้าจะทำ drug interaction ต้องมีฐานข้อมูลที่เชื่อถือได้และ medical review

## 6.4 Routine and care tasks

ตัวอย่าง task:

- กินยาเช้า
- วัดความดัน
- วัดน้ำตาล
- ดื่มน้ำ
- ออกกำลังกายเบา ๆ
- โทรคุยกับลูกหลาน
- นัดหมายแพทย์
- เปลี่ยนผ้าปู/ทำความสะอาด
- ตรวจแผล/ผิวหนังแบบ note only

## 6.5 Daily check-in

### Questions MVP

1. วันนี้รู้สึกอย่างไร
2. มีอาการผิดปกติไหม
3. มีการหกล้มหรือเกือบหกล้มไหม
4. กินอาหารได้ปกติไหม
5. นอนหลับเป็นอย่างไร
6. มี note อื่นไหม

### UX options

- elderly mode: ปุ่มใหญ่ 3-5 ปุ่ม
- caregiver mode: checklist เร็ว
- family mode: view only + comment

## 6.6 Vital signs logging

### MVP fields

- blood pressure systolic/diastolic
- pulse
- blood sugar optional
- temperature optional
- weight optional
- oxygen saturation optional

### Alert design

ควรให้ผู้ใช้ตั้ง threshold เองหรือใช้ “flag for review” แบบไม่วินิจฉัย เช่น:

- “ค่าที่บันทึกอยู่นอกช่วงที่คุณตั้งไว้”
- “กรุณาติดต่อบุคลากรทางการแพทย์หากมีอาการผิดปกติ”

ห้ามใช้ข้อความเชิงวินิจฉัย เช่น “คุณกำลังเป็นโรค...” หรือ “ต้องเพิ่มยา...”

## 6.7 Alerts and escalation

### Alert types

- missed medication
- missed check-in
- abnormal value based on configured threshold
- fall reported
- emergency button pressed
- caregiver note marked urgent

### Escalation levels

| Level | Trigger | Action |
|---|---|---|
| Info | Task completed / normal log | บันทึกใน dashboard |
| Reminder | ยังไม่ confirm | ส่งเตือนผู้สูงวัย/caregiver |
| Family Alert | missed/abnormal | แจ้ง family admin |
| Urgent | fall/emergency | แจ้ง emergency contact หลายช่องทาง |

## 6.8 Report generation

### Report types

- weekly family summary
- monthly care summary
- doctor visit summary
- medication adherence report
- alert history report

### AI report rules

AI ใช้เพื่อ:

- สรุปข้อมูลที่บันทึก
- จัดกลุ่ม trend
- ทำภาษาให้อ่านง่าย
- highlight ประเด็นที่ควรถามแพทย์

AI ห้าม:

- วินิจฉัย
- สั่งยา
- ลด/เพิ่มยา
- รับประกันผลสุขภาพ
- แทนคำแนะนำแพทย์

---

## 7. MVP User Journey

## 7.1 Onboarding journey

1. ลูกหลานสมัครบัญชี
2. สร้าง family workspace
3. เพิ่ม profile ผู้สูงวัย
4. เลือกว่าผู้สูงวัยใช้ LINE เองหรือ caregiver ช่วย
5. เพิ่มยาและ reminder แรก
6. เพิ่ม routine เช่น วัดความดันทุกเช้า
7. เชิญสมาชิกครอบครัว
8. ตั้ง emergency contact
9. เปิดใช้งาน daily check-in
10. ระบบแสดง dashboard วันแรก

## 7.2 Daily usage journey

1. ถึงเวลา reminder
2. ผู้สูงวัยหรือ caregiver กด confirm
3. ถ้าไม่ confirm ภายในเวลาที่กำหนด ระบบเตือนซ้ำ
4. ถ้ายังไม่ confirm ระบบแจ้ง family admin
5. caregiver บันทึก check-in รายวัน
6. dashboard update สถานะ
7. ทุกสัปดาห์ ระบบส่ง summary

## 7.3 Doctor visit journey

1. ลูกหลานเลือกช่วงเวลา 7/14/30 วัน
2. กด generate report
3. ระบบรวม medication adherence, vital signs, symptoms, alerts
4. AI สรุปเป็นภาษาธรรมดา
5. ผู้ใช้ตรวจทาน
6. export PDF หรือส่ง link แบบจำกัดเวลา

---

## 8. Business Model

## 8.1 Phase 1: B2C family subscription

### Pricing hypothesis

| Plan | ราคาโดยประมาณ | เหมาะกับ |
|---|---:|---|
| Free | 0 บาท | 1 elder, reminder จำกัด, ไม่มี PDF report |
| Family Basic | 149-299 บาท/เดือน | 1 elder, family dashboard, reminders, weekly summary |
| Family Plus | 399-699 บาท/เดือน | 2-3 elders, caregiver role, PDF report, alert escalation |
| Premium Care | 999+ บาท/เดือน | support, caregiver coordination, advanced report |

## 8.2 Phase 2: B2B2C

ลูกค้า:

- คลินิกเวชศาสตร์ผู้สูงวัย
- คลินิกกายภาพ
- ศูนย์ดูแลผู้สูงวัย
- nursing home ขนาดเล็ก
- บริษัทประกัน
- employer welfare
- โรงพยาบาลเอกชน

Pricing:

- per elder per month
- per facility per month
- setup fee
- training fee
- custom integration fee

## 8.3 Phase 3: Marketplace/service revenue

- caregiver matching fee
- teleconsultation referral fee
- medical equipment referral
- wellness program package
- home safety assessment package

---

## 9. Compliance and Risk Boundaries

## 9.1 PDPA readiness

Health data เป็น sensitive personal data จึงต้องออกแบบ:

- explicit consent
- purpose limitation
- data minimization
- role-based access
- consent withdrawal
- data export
- data deletion request
- audit log
- data processing agreement สำหรับ B2B
- encryption at rest and in transit
- breach response process

## 9.2 Medical device / SaMD risk

ระบบอาจเข้าข่าย Software as a Medical Device ถ้า claim หรือ functionality ใช้เพื่อ:

- diagnosis
- prevention
- monitoring แบบมีผลต่อ clinical decision
- treatment recommendation
- prediction ของ disease risk
- interpretation ของ medical device data เพื่อ clinical action

### MVP strategy เพื่อลด regulatory risk

- วางระบบเป็น care coordination และ personal health record
- ใช้ข้อความ “แจ้งเตือนตามข้อมูลที่ผู้ใช้ตั้งค่า”
- ไม่ให้ AI ตัดสินผลสุขภาพ
- ไม่ให้ AI สั่งการรักษา
- ให้ผู้ใช้ตรวจทาน report ก่อนแชร์
- ใส่ medical disclaimer
- ทำ clinical/regulatory review ก่อนเพิ่ม feature monitoring ขั้นสูง

## 9.3 Safety disclaimers

ตัวอย่างข้อความ:

> ระบบนี้ใช้เพื่อช่วยบันทึก เตือน และสรุปข้อมูลการดูแลผู้สูงวัย ไม่ใช่เครื่องมือวินิจฉัยโรคหรือทดแทนคำแนะนำจากแพทย์ หากมีอาการฉุกเฉินหรือผิดปกติรุนแรง กรุณาติดต่อหน่วยบริการฉุกเฉินหรือบุคลากรทางการแพทย์ทันที

## 9.4 Accessibility

ต้องรองรับ:

- font size ใหญ่
- contrast ดี
- ปุ่มใหญ่
- voice prompt ในอนาคต
- ภาษาไทยเรียบง่าย
- ไม่ซ่อน action สำคัญหลายชั้น
- support caregiver-assisted mode

---

## 10. Technical Architecture

## 10.1 Recommended stack

### Frontend

- Next.js App Router
- TypeScript
- Tailwind CSS
- React Hook Form
- Zod validation
- PWA support

### Backend

- Supabase Postgres
- Supabase Auth
- Row Level Security
- Supabase Storage
- Edge Functions หรือ Node.js API routes
- Background job queue เช่น Inngest, Trigger.dev, Cloud Tasks หรือ BullMQ

### Messaging

- LINE Messaging API สำหรับ reminder และ check-in
- Email fallback
- SMS fallback ใน urgent alert phase

### AI

- OpenAI Responses API หรือ equivalent LLM provider
- structured output สำหรับ report summary
- prompt/version management
- safety guardrails
- audit log ของ AI output

### Deployment

- Vercel สำหรับ frontend/API
- Supabase hosted Postgres
- Cloudflare WAF/CDN
- Sentry monitoring
- PostHog analytics

## 10.2 High-level architecture

```text
User / Family / Caregiver
        |
        v
Next.js Web App / PWA
        |
        +--> Supabase Auth
        +--> API Layer
                |
                +--> Postgres + RLS
                +--> Reminder Scheduler
                +--> LINE Messaging API
                +--> AI Report Service
                +--> PDF Export Service
                +--> Audit Log
```

## 10.3 Core services

### Auth Service

- login/signup
- magic link
- social login optional
- role mapping
- session management

### Care Profile Service

- elder profile CRUD
- consent status
- emergency contacts
- care instructions

### Reminder Service

- medication schedules
- recurring routines
- notification queue
- completion tracking
- missed escalation

### Check-in Service

- daily check-in form
- caregiver note
- symptoms flags
- mood/food/sleep tracking

### Vitals Service

- vital signs entry
- threshold configuration
- trend view
- abnormal flagging

### Alert Service

- alert rules
- escalation policy
- notification routing
- alert acknowledgement

### Report Service

- aggregate logs
- generate summaries
- AI report draft
- human review
- PDF export

### Consent and Audit Service

- consent records
- member access history
- data access logs
- report sharing logs

---

## 11. Data Model

## 11.1 Main tables

### users

- id
- email
- phone
- display_name
- created_at

### workspaces

- id
- name
- owner_user_id
- plan
- created_at

### workspace_members

- id
- workspace_id
- user_id
- role
- status
- invited_at
- accepted_at

### elders

- id
- workspace_id
- full_name
- nickname
- date_of_birth
- gender
- living_arrangement
- notes
- created_at

### elder_consents

- id
- elder_id
- consent_type
- consent_given_by
- consent_status
- consent_text_version
- given_at
- withdrawn_at

### emergency_contacts

- id
- elder_id
- name
- relationship
- phone
- line_user_id
- priority

### medications

- id
- elder_id
- name
- dosage_text
- instruction
- start_date
- end_date
- active

### medication_schedules

- id
- medication_id
- schedule_time
- recurrence_rule
- timezone

### care_tasks

- id
- elder_id
- task_type
- title
- instruction
- recurrence_rule
- active

### task_events

- id
- elder_id
- source_type
- source_id
- due_at
- status
- completed_by
- completed_at
- missed_at
- note

### daily_checkins

- id
- elder_id
- checkin_date
- mood
- sleep_quality
- appetite
- hydration
- symptoms
- fall_reported
- note
- recorded_by

### vital_logs

- id
- elder_id
- type
- value_1
- value_2
- unit
- measured_at
- recorded_by
- note

### alert_rules

- id
- elder_id
- rule_type
- config_json
- active

### alerts

- id
- elder_id
- alert_type
- severity
- title
- message
- source_id
- status
- acknowledged_by
- acknowledged_at
- created_at

### reports

- id
- elder_id
- report_type
- period_start
- period_end
- status
- summary_text
- ai_model
- reviewed_by
- pdf_url
- created_at

### audit_logs

- id
- workspace_id
- actor_user_id
- action
- resource_type
- resource_id
- metadata
- created_at

---

## 12. Security Design

## 12.1 Security requirements

- enforce Row Level Security ทุก table สำคัญ
- principle of least privilege
- encrypt sensitive fields if needed
- audit access to health records
- rate limit login and API
- strong password/magic link controls
- 2FA สำหรับ admin/B2B phase
- signed URL สำหรับ report sharing
- short-lived share links
- secrets stored in managed secret vault
- backup and disaster recovery

## 12.2 Access control rules

- user เห็นเฉพาะ workspace ที่เป็น member
- caregiver เห็นเฉพาะ elder ที่ assign
- clinician viewer เห็นเฉพาะ report ที่แชร์ให้
- elder profile update เฉพาะ admin/caregiver ที่ได้รับสิทธิ์
- report export เฉพาะ admin
- consent management เฉพาะ owner/admin

## 12.3 Privacy controls

- consent records immutable where possible
- data deletion workflow
- data export workflow
- masking health data ใน logs
- no PHI/health data in analytics event
- no health data in AI prompt logs unless encrypted and explicitly necessary

---

## 13. AI Design

## 13.1 AI use cases in MVP

1. สรุปรายงาน 7/30 วัน
2. แปลง caregiver notes เป็น bullet points
3. สร้างคำถามที่ควรถามแพทย์จากข้อมูลที่บันทึก
4. สรุป missed tasks และ patterns
5. ช่วยแปลภาษาทางสุขภาพให้อ่านง่าย โดยไม่วินิจฉัย

## 13.2 AI output schema

ตัวอย่าง structured output:

```json
{
  "summary": "string",
  "key_observations": ["string"],
  "missed_routines": ["string"],
  "values_outside_user_configured_ranges": ["string"],
  "questions_for_doctor": ["string"],
  "caregiver_notes_summary": ["string"],
  "safety_disclaimer": "string"
}
```

## 13.3 AI guardrails

- system prompt ต้องห้าม diagnosis/treatment
- block medical advice beyond general reminder
- output ต้องมี disclaimer
- high-risk keywords trigger manual review
- no emergency reassurance เช่น “ไม่เป็นไร”
- report ต้องผ่าน user review ก่อน export
- store model version and prompt version

## 13.4 Prompt rules

AI ควรตอบแบบ:

- “จากข้อมูลที่บันทึก...”
- “ควรถามแพทย์เกี่ยวกับ...”
- “มีรายการที่ไม่ได้ยืนยัน...”
- “ค่าดังกล่าวอยู่นอกช่วงที่คุณตั้งไว้...”

AI ห้ามตอบแบบ:

- “คุณเป็นโรค...”
- “ควรเพิ่มยา...”
- “หยุดยา...”
- “ไม่ต้องพบแพทย์...”
- “นี่คือภาวะฉุกเฉินแน่นอน...”

---

## 14. Development Roadmap

## Phase 0: Discovery and validation

ระยะเวลา: 2-4 สัปดาห์

### Goals

- ยืนยันปัญหา
- เลือก niche แรก
- กำหนด scope MVP
- สัมภาษณ์ผู้ใช้จริง
- ประเมิน compliance risk

### Tasks

1. สัมภาษณ์ลูกหลานผู้ดูแล 20 คน
2. สัมภาษณ์ caregiver 5-10 คน
3. สัมภาษณ์คลินิก/ศูนย์ดูแล 3-5 แห่ง
4. เก็บ current workflow เช่น LINE, สมุดจด, Excel
5. ระบุ top 5 recurring tasks
6. ระบุ willingness to pay
7. ระบุช่องทาง acquisition
8. ทำ regulatory pre-screen ว่า MVP claim ไม่เข้า SaMD
9. สรุป PRD version 1

### Deliverables

- interview notes
- persona document
- MVP requirements
- compliance boundary memo
- pricing hypothesis
- clickable prototype

### Exit criteria

- มีผู้ใช้ pilot อย่างน้อย 10 ครอบครัวหรือ 1-2 องค์กร
- validated top pain: medication/reminder/check-in/report
- ผู้ใช้ยินดีทดลอง 30 วัน

## Phase 1: Prototype

> **สถานะ:** ✅ Implemented (code + docs) — 2026-06-12  
> **Build:** `npm run build` passes · Prototype at `/prototype`  
> **ยังไม่เสร็จ:** UX testing กับผู้ใช้ 5–8 คน, revised MVP scope (หลังทดสอบ), ไฟล์ Figma จริง (มี `docs/ux_wireframe_spec.md` สำหรับ handoff แล้ว)

ระยะเวลา: 2-3 สัปดาห์

### Goals

- ทดสอบ UX
- ทดสอบ check-in flow
- ทดสอบ reminder ผ่าน LINE/manual

### Tasks

| # | Task | Status | Notes |
|---|---|---|---|
| 1 | ทำ Figma prototype | ✅ Spec ready | `docs/ux_wireframe_spec.md` + clickable prototype at `/prototype` |
| 2 | ทำ elder mode screen | ✅ Done | `/prototype/elder` |
| 3 | ทำ family dashboard screen | ✅ Done | `/prototype/family` |
| 4 | ทำ caregiver check-in screen | ✅ Done | `/prototype/caregiver` |
| 5 | ทำ weekly report mockup | ✅ Done | `/prototype/report` + `/prototype/line` |
| 6 | ทดสอบกับผู้ใช้ 5-8 คน | ⏳ Pending | Template: `docs/ux_testing_report_template.md` |
| 7 | ปรับภาษา ปุ่ม และ flow | ⏳ Pending | หลัง UX testing |

### Deliverables

| Deliverable | Status | Location |
|---|---|---|
| Figma prototype | ✅ Spec + clickable | `docs/ux_wireframe_spec.md`, `/prototype` |
| UX testing report | ⏳ Template only | `docs/ux_testing_report_template.md` |
| revised MVP scope | ⏳ Pending | หลัง UX testing |

### Implementation checklist (code)

- [x] Next.js + Tailwind v4 + Noto Sans Thai
- [x] Prototype hub + 10-step onboarding wizard
- [x] Elder mode (tasks, check-in, success)
- [x] Caregiver check-in (RHF + Zod, 60s timer)
- [x] Family dashboard (status, missed, activity, alerts, trend)
- [x] Weekly report mock + AI summary block
- [x] LINE reminder preview
- [x] Mock data + localStorage prototype store
- [x] UX wireframe spec + testing template

### Exit criteria

| Criterion | Build status | Validated with users |
|---|---|---|
| ผู้ใช้ทำ onboarding ได้ภายใน 10 นาที | ✅ Built (10 steps, skippable) | ⏳ Pending |
| caregiver บันทึก check-in ได้ภายใน 60 วินาที | ✅ Built (timer + pre-filled form) | ⏳ Pending |
| dashboard เข้าใจได้โดยไม่ต้องอธิบายยาว | ✅ Built | ⏳ Pending |

## Phase 2: MVP foundation

> **สถานะ:** ✅ Implemented (code + schema + CI) — 2026-06-12  
> **Setup:** Copy `.env.example` → `.env.local`, run migration in Supabase SQL Editor  
> **Docs:** `README.md`, `docs/rls_test_guide.md`

ระยะเวลา: 3-4 สัปดาห์

### Goals

สร้างระบบพื้นฐาน multi-user + elder profile + security

### Tasks

| # | Task | Status | Notes |
|---|---|---|---|
| 1 | ตั้ง repo และ CI/CD | ✅ Done | `.github/workflows/ci.yml` |
| 2 | สร้าง Next.js app | ✅ Done | Extended from Phase 1 |
| 3 | ตั้ง Supabase project | ✅ Config ready | `.env.example`, apply migration manually |
| 4 | ออกแบบ DB schema | ✅ Done | `supabase/migrations/20260612000000_phase2_foundation.sql` |
| 5 | เปิด RLS policies | ✅ Done | All Phase 2 tables + helper functions |
| 6 | ทำ auth flow | ✅ Done | `/login`, `/signup`, middleware session |
| 7 | ทำ workspace/member roles | ✅ Done | 6 roles, invites, `/members` |
| 8 | ทำ elder profile CRUD | ✅ Done | `/elders`, consent on create |
| 9 | ทำ emergency contacts | ✅ Done | On elder detail page |
| 10 | ทำ audit log เบื้องต้น | ✅ Done | `audit_logs` + dashboard/settings |
| 11 | ทำ settings page | ✅ Done | `/settings` |

### Deliverables

| Deliverable | Status | Location |
|---|---|---|
| running staging app | ✅ Ready | Deploy to Vercel + Supabase |
| schema migration | ✅ Done | `supabase/migrations/` |
| auth and RBAC | ✅ Done | middleware + RLS + role checks |
| elder profile module | ✅ Done | `/elders/*` |

### Exit criteria

| Criterion | Status |
|---|---|
| user สมัครและสร้าง workspace ได้ | ✅ Built — `/signup` → `/workspace/new` |
| เพิ่มผู้สูงวัยได้ | ✅ Built — `/elders/new` |
| invite family/caregiver ได้ | ✅ Built — `/members` + `/invite/accept` |
| RLS test ผ่าน | ⏳ Manual — see `docs/rls_test_guide.md` |

## Phase 3: Care tasks and reminders

> **สถานะ:** ✅ Implemented (code + schema) — 2026-06-12  
> **Setup:** Apply `supabase/migrations/20260613000000_phase3_care_tasks.sql`, set `CRON_SECRET` + optional LINE vars  
> **Docs:** `README.md` (Phase 3 section)

ระยะเวลา: 3-4 สัปดาห์

### Goals

ทำ reminder และ task completion core

### Tasks

| # | Task | Status | Notes |
|---|---|---|---|
| 1 | ทำ medication CRUD | ✅ Done | `/elders/[id]/medications` |
| 2 | ทำ medication schedule | ✅ Done | `medication_schedules` + daily times |
| 3 | ทำ routine care task | ✅ Done | `/elders/[id]/routines` |
| 4 | สร้าง task event generator | ✅ Done | `src/lib/services/task-events.ts` |
| 5 | ทำ reminder queue | ✅ Done | `reminder_queue` + cron processor |
| 6 | เชื่อม LINE Messaging API | ✅ Done | push + webhook stub (`src/lib/line/messaging.ts`) |
| 7 | ทำ confirm done/missed | ✅ Done | `/tasks/[id]`, server actions |
| 8 | ทำ missed escalation | ✅ Done | `care_alerts` + family admin notifications |
| 9 | ทำ notification log | ✅ Done | `/notifications` |
| 10 | ทำ dashboard status วันนี้ | ✅ Done | `/dashboard` + `/tasks` |

### Deliverables

| Deliverable | Status | Location |
|---|---|---|
| medication reminder | ✅ Done | medications + schedules → task events |
| routine reminder | ✅ Done | care_tasks → task events |
| LINE notification | ✅ Done | optional — set LINE env vars |
| missed alert | ✅ Done | cron + `care_alerts` |

### Exit criteria

| Criterion | Status |
|---|---|
| reminder ถูกส่งตามเวลา | ✅ Built — `/api/cron/reminders` (schedule via Vercel Cron or external) |
| user confirm task ได้ | ✅ Built — `/tasks/[id]` |
| missed task แจ้ง family admin ได้ | ✅ Built — escalation in reminder processor |
| dashboard update real-time หรือ near real-time | ✅ Built — sync on page load + cron |

## Phase 4: Check-in, vitals, and alerts

ระยะเวลา: 3-4 สัปดาห์

### Goals

บันทึกข้อมูลรายวันและแจ้งเตือนตาม rule

### Tasks

1. ทำ daily check-in form
2. ทำ elderly mode UI
3. ทำ caregiver mode UI
4. ทำ vital signs entry
5. ทำ threshold settings
6. ทำ alert rules
7. ทำ alert list/detail
8. ทำ acknowledge alert
9. ทำ alert escalation
10. ทำ basic trend chart

### Deliverables

- daily check-in
- vitals logging
- alert engine
- trend dashboard

### Exit criteria

- caregiver กรอก check-in ได้เร็ว
- vital values ถูกบันทึกและแสดง trend
- abnormal ตาม threshold สร้าง alert ได้
- family admin acknowledge alert ได้

## Phase 5: Report and AI summary

ระยะเวลา: 3-4 สัปดาห์

### Goals

สร้างรายงานใช้งานจริงสำหรับครอบครัวและไปพบแพทย์

### Tasks

1. ทำ report period selector
2. aggregate medication adherence
3. aggregate check-ins
4. aggregate vitals
5. aggregate alerts
6. ทำ AI summary service
7. ทำ structured output validation
8. ทำ human review screen
9. ทำ PDF export
10. ทำ share link with expiry

### Deliverables

- weekly report
- doctor visit report
- AI draft summary
- PDF export

### Exit criteria

- สร้าง report 7/30 วันได้
- AI output ไม่มี diagnosis/treatment
- user review/edit ก่อน export ได้
- PDF อ่านง่าย

## Phase 6: Pilot launch

ระยะเวลา: 4-6 สัปดาห์

### Goals

ทดสอบกับผู้ใช้จริงและวัด retention

### Pilot group

- 10-30 ครอบครัว
- หรือ 1-3 care providers
- ใช้งานอย่างน้อย 30 วัน

### Tasks

1. ทำ onboarding call
2. ตั้งค่า elder profile ให้ pilot users
3. collect baseline workflow
4. monitor daily usage
5. weekly user interview
6. collect bug reports
7. measure reminder completion
8. measure report usage
9. analyze churn reasons
10. revise pricing

### Success metrics

- 70%+ reminder completion rate
- 60%+ weekly active family admin
- 50%+ pilot users generate report อย่างน้อย 1 ครั้ง
- NPS positive หรือ qualitative feedback ชัดว่าลดความกังวล
- มีอย่างน้อย 5 users ยินดีจ่ายหลัง pilot

### Exit criteria

- แก้ critical bugs หมด
- privacy/compliance flow ใช้งานได้
- มี evidence ว่าลูกค้าจ่ายเงินได้

## Phase 7: Commercial launch

ระยะเวลา: 4 สัปดาห์

### Goals

เปิดขายแบบ controlled launch

### Tasks

1. สร้าง landing page
2. ทำ pricing page
3. ทำ terms/privacy/consent
4. เพิ่ม billing
5. ทำ customer support workflow
6. ทำ onboarding guide
7. ทำ demo video
8. ทำ sales deck สำหรับ B2B
9. ทำ referral program
10. เปิดรับลูกค้า batch แรก

### Deliverables

- production app
- billing
- legal docs
- support system
- launch campaign

### Exit criteria

- 50-100 paying family accounts หรือ 3-5 B2B customers
- support response SLA พร้อม
- uptime monitoring พร้อม

## Phase 8: Scale and advanced features

ระยะเวลา: 3-12 เดือนหลัง launch

### Potential features

1. caregiver marketplace
2. facility dashboard
3. telecare video call
4. medical device integration
5. fall detection device integration
6. AI voice check-in
7. dementia-friendly UX
8. clinic referral workflow
9. insurance wellness package
10. multilingual support

### Before adding clinical features

- regulatory classification review
- clinical safety case
- medical advisor review
- risk management process
- model validation if AI involved
- incident reporting workflow

---

## 15. Sprint Plan

## Sprint 0: Setup and planning

ระยะเวลา: 1 สัปดาห์

- finalize PRD
- finalize UX flows
- setup repo
- setup Supabase
- setup staging/prod environments
- setup CI/CD
- setup design system
- create issue backlog

## Sprint 1: Auth, workspace, elder profile

ระยะเวลา: 2 สัปดาห์

- auth
- workspace
- roles
- elder profile
- emergency contacts
- basic dashboard shell
- audit logs

## Sprint 2: Medication and routine tasks

ระยะเวลา: 2 สัปดาห์

- medication CRUD
- task CRUD
- recurrence
- task event generation
- task completion
- missed status

## Sprint 3: LINE reminders and escalation

ระยะเวลา: 2 สัปดาห์

- LINE integration
- reminder job
- confirm via link/button
- missed escalation
- notification logs
- dashboard status cards

## Sprint 4: Check-in and vitals

ระยะเวลา: 2 สัปดาห์

- daily check-in
- caregiver form
- elderly mode form
- vitals logging
- threshold settings
- basic alerts

## Sprint 5: Report and AI summary

ระยะเวลา: 2 สัปดาห์

- report aggregation
- AI summary
- structured output validation
- report review UI
- PDF export
- share link

## Sprint 6: Pilot hardening

ระยะเวลา: 2 สัปดาห์

- bug fixes
- analytics
- onboarding improvements
- consent improvements
- security testing
- backup/monitoring
- pilot setup

---

## 16. QA and Testing Plan

## 16.1 Functional testing

- signup/login
- workspace invite
- role permissions
- elder profile CRUD
- medication reminder
- missed task escalation
- daily check-in
- vitals logging
- alert creation
- report generation
- PDF export
- share link expiry

## 16.2 Security testing

- RLS bypass attempt
- role privilege escalation
- unauthorized report access
- expired share link
- API rate limit
- injection tests
- sensitive data leakage in logs
- backup restore test

## 16.3 AI safety testing

- prompt injection in notes
- diagnosis-seeking prompts
- medication advice prompts
- emergency reassurance prompts
- hallucinated medical facts
- output schema validation
- disclaimer presence
- high-risk keyword detection

## 16.4 Usability testing

- elderly font size
- contrast
- button size
- Thai wording clarity
- caregiver speed
- family dashboard comprehension
- LINE message clarity

## 16.5 Reliability testing

- reminder delivery delay
- duplicate reminder prevention
- timezone correctness
- job retry
- webhook failure
- notification idempotency

---

## 17. Metrics

## 17.1 Product metrics

- activation rate
- elder profiles created
- reminders created per elder
- reminder completion rate
- missed reminders per week
- daily check-in completion
- report generated per month
- family member invites
- alert acknowledgement time

## 17.2 Business metrics

- free-to-paid conversion
- monthly recurring revenue
- churn rate
- customer acquisition cost
- lifetime value
- support tickets per customer
- pilot-to-paid conversion

## 17.3 Safety metrics

- emergency alert false positives
- emergency alert false negatives reported
- AI safety violations
- data access incidents
- consent withdrawal requests
- report sharing incidents

---

## 18. Go-to-Market Plan

## 18.1 First customer segments

### Segment A: Working adult children

ช่องทาง:

- Facebook groups
- LINE communities
- caregiver content
- YouTube/TikTok educational content
- referral from clinics

Message:

- “รู้ว่าพ่อแม่กินยาแล้วหรือยัง โดยไม่ต้องโทรถามทุกครั้ง”
- “มีรายงานสุขภาพพื้นฐานก่อนไปพบแพทย์”
- “ช่วยลดความกังวลเมื่อดูแลผู้สูงวัยจากระยะไกล”

### Segment B: Small care providers

ช่องทาง:

- direct sales
- partner clinics
- elderly care centers
- nursing schools
- caregiver agencies

Message:

- “รายงานให้ญาติอย่างเป็นระบบ”
- “ลดงานเอกสาร caregiver”
- “เพิ่มความน่าเชื่อถือของศูนย์ดูแล”

## 18.2 Content strategy

หัวข้อคอนเทนต์:

- checklist ดูแลผู้สูงวัยที่บ้าน
- วิธีจัดตารางยาให้ไม่ลืม
- เตรียมข้อมูลอะไรก่อนไปพบแพทย์
- วิธีคุยกับพ่อแม่เรื่องการใช้เทคโนโลยี
- สัญญาณที่ควรปรึกษาแพทย์
- การดูแลผู้สูงวัยจากระยะไกล

## 18.3 Sales assets

- landing page
- demo video 2 นาที
- one-page PDF
- caregiver workflow sample
- weekly report sample
- pilot proposal
- privacy/security one-pager

---

## 19. Operations Plan

## 19.1 Customer support

Channels:

- LINE OA
- email
- in-app chat
- help center

Support categories:

- onboarding
- reminder not received
- invite family member
- report export
- billing
- privacy/data deletion

## 19.2 Incident response

Incident types:

- data breach
- wrong alert recipient
- reminder failure
- report access issue
- AI unsafe output
- downtime

Process:

1. detect
2. classify severity
3. contain
4. notify internal owner
5. fix
6. user communication if needed
7. postmortem
8. prevention action

## 19.3 Clinical safety governance

ก่อนเพิ่ม feature ที่เกี่ยวกับ medical decision:

- appoint medical advisor
- define intended use
- classify regulatory risk
- create hazard analysis
- create clinical safety case
- validate with users
- document model limitations

---

## 20. Risk Register

| Risk | Impact | Mitigation |
|---|---|---|
| ผู้ใช้เข้าใจว่าแอปแทนแพทย์ | สูง | disclaimer, wording control, no diagnosis |
| ข้อมูลสุขภาพรั่วไหล | สูงมาก | RLS, encryption, audit log, access control |
| reminder ไม่ส่ง | สูง | retry, monitoring, fallback channel |
| ผู้สูงวัยใช้ยาก | สูง | LINE-first, caregiver mode, UX testing |
| AI ให้คำแนะนำผิด | สูง | guardrails, no medical advice, human review |
| API LINE/SMS เปลี่ยน | กลาง | abstraction layer, fallback email/SMS |
| pilot ไม่ยอมจ่าย | กลาง | validate pricing early |
| เข้าข่าย SaMD โดยไม่ตั้งใจ | สูง | regulatory review, limit claims |
| caregiver กรอกข้อมูลไม่ครบ | กลาง | simple form, default options, reminders |
| false alarm เยอะ | กลาง | configurable thresholds, severity levels |

---

## 21. First 30 Days Action Plan

## Week 1

- เลือก first niche: family caregiver หรือ care center
- เขียน interview script
- หา interviewees 20 คน
- ทำ landing page แบบ waitlist
- ร่าง consent/privacy concept

## Week 2

- สัมภาษณ์ 10 คนแรก
- ทำ Figma low-fidelity prototype
- สรุป top pain points
- เลือก MVP features
- ทำ compliance boundary memo

## Week 3

- สัมภาษณ์เพิ่ม 10-15 คน
- ทดสอบ prototype
- ปรับ onboarding flow
- define data model
- setup repo/Supabase staging

## Week 4

- finalize PRD
- finalize sprint backlog
- recruit pilot users
- เริ่ม Sprint 0
- เตรียม pilot agreement และ support process

---

## 22. Definition of Done

โปรเจกต์ MVP ถือว่า “เสร็จ” เมื่อ:

1. ผู้ใช้สมัครและสร้าง workspace ได้
2. เพิ่มผู้สูงวัยและข้อมูลผู้ติดต่อฉุกเฉินได้
3. ตั้ง medication/routine reminder ได้
4. reminder ส่งผ่าน LINE ได้
5. ผู้สูงวัยหรือ caregiver confirm task ได้
6. missed task แจ้ง family admin ได้
7. caregiver บันทึก daily check-in ได้
8. บันทึก vital signs ได้
9. alert ถูกสร้างจาก threshold/user rule ได้
10. dashboard แสดงสถานะวันนี้และย้อนหลังได้
11. generate report 7/30 วันได้
12. AI summary ผ่าน guardrail และไม่มี medical advice
13. export PDF ได้
14. share report แบบจำกัดเวลาได้
15. RBAC/RLS test ผ่าน
16. consent flow พร้อมใช้งาน
17. audit log สำคัญถูกบันทึก
18. pilot users ใช้งานจริงอย่างน้อย 30 วัน
19. มี paying intent หรือ paying customers ชุดแรก
20. มี operational playbook สำหรับ support และ incident response

---

## 23. Recommended Next Documents

หลังจากไฟล์นี้ ควรแตกต่อเป็นเอกสารเหล่านี้:

1. `prd.md`
2. `technical_architecture.md`
3. `database_schema.sql`
4. `security_and_privacy_plan.md`
5. `ai_safety_policy.md`
6. `ux_wireframe_spec.md`
7. `pilot_plan.md`
8. `development_backlog.md`
9. `go_to_market_plan.md`
10. `regulatory_boundary_memo.md`

---

## 24. Final Recommendation

ควรเริ่มจากระบบ **LINE-first Family Care Companion** ไม่ใช่แอป health diagnosis เต็มรูปแบบ เพราะตลาดเข้าใจง่าย เริ่มขายง่าย ลด friction สำหรับผู้สูงวัย และลด regulatory risk ได้มาก

MVP ที่ควรทำก่อนคือ:

- elder profile
- medication/routine reminders
- daily check-in
- vitals logging
- family dashboard
- missed/urgent alerts
- AI-assisted weekly/doctor-visit report

เมื่อพิสูจน์ retention และ willingness to pay แล้ว ค่อยขยายเป็น B2B สำหรับคลินิก/ศูนย์ดูแลผู้สูงวัย และค่อยพิจารณา IoT/telecare/medical-device integration ใน phase ต่อไป

---

## 25. References

1. National Statistical Office Thailand, Survey of the Older Persons in Thailand, 2024/2025 release.
2. NHSO Thailand, Thailand long-term care model and aging societies, PMAC 2026.
3. WHO, Promoting healthy ageing in a digital world, 2024.
4. ITU/WHO, Implementation toolkit for accessible telehealth services, 2025.
5. Thailand Personal Data Protection Act B.E. 2562 (2019), MDES.
6. Thai FDA / SaMD guidance references, 2024 onward.
7. The Lancet Digital Health, Digital health equity for older populations.

# UX Testing Report Template — CareKin Phase 1

> ใช้สำหรับทดสอบกับผู้ใช้ 5–8 คน  
> เป้าหมาย Phase 1: validate UX ก่อน MVP development

---

## Session Info

| Field | Value |
|---|---|
| วันที่ทดสอบ | |
| ผู้ดำเนินการ | |
| สถานที่ |  onsite / remote |
| Prototype URL | http://localhost:3000/prototype |
| Prototype version | Phase 1 v1.0 |
| อุปกรณ์ | Mobile / Desktop / Tablet |

---

## Participants (5–8 คน)

| # | บทบาท | อายุ | ประสบการณ์ดูแลผู้สูงวัย | ใช้ LINE | หมายเหตุ |
|---|---|---|---|---|---|
| P1 | ลูกหลาน | | | ใช่/ไม่ | |
| P2 | ลูกหลาน | | | ใช่/ไม่ | |
| P3 | ผู้สูงวัย | | | ใช่/ไม่ | |
| P4 | Caregiver | | | ใช่/ไม่ | |
| P5 | ลูกหลาน | | | ใช่/ไม่ | |
| P6 | | | | | |
| P7 | | | | | |
| P8 | | | | | |

---

## Test Tasks

### Task 1: Onboarding (Family Admin persona)

**Scenario:** คุณเพิ่งได้ยินเกี่ยวกับ CareKin และต้องการตั้งค่าดูแลพ่อแม่ที่บ้าน

**Steps:**
1. เปิด `/prototype/onboarding`
2. ทำ onboarding ครบ 10 ขั้นตอน
3. ไปถึง Family Dashboard

**Metrics:**
| Metric | Target | P1 | P2 | P3 | P4 | P5 | Avg |
|---|---|---|---|---|---|---|---|
| เวลาที่ใช้ (นาที) | ≤ 10 | | | | | | |
| ทำครบโดยไม่ขอความช่วยเหลือ | ใช่ | | | | | | |
| ความเข้าใจ disclaimer | 1-5 | | | | | | |

**Observations:**
- 
- 

---

### Task 2: Elder Check-in

**Scenario:** คุณเป็นผู้สูงวัย ต้องการบันทึกว่าวันนี้เป็นอย่างไร

**Steps:**
1. เปิด `/prototype/elder`
2. กด "บันทึกวันนี้"
3. ตอบคำถาม 5 ข้อ
4. บันทึกสำเร็จ

**Metrics:**
| Metric | Target | P1 | P2 | P3 | P4 | P5 | Avg |
|---|---|---|---|---|---|---|---|
| เวลาที่ใช้ (วินาที) | ≤ 120 | | | | | | |
| อ่านปุ่มได้ชัดเจน | 1-5 | | | | | | |
| ขนาดปุ่มเพียงพอ | 1-5 | | | | | | |
| ภาษาเข้าใจง่าย | 1-5 | | | | | | |

**Observations:**
- 
- 

---

### Task 3: Caregiver Check-in (Speed test)

**Scenario:** คุณเป็นผู้ดูแล ต้องบันทึก check-in ให้คุณสมศรีก่อนเริ่มงานอื่น

**Steps:**
1. เปิด `/prototype/caregiver`
2. กรอก check-in (ค่า default มีให้แล้ว)
3. กด "บันทึกเสร็จ"

**Metrics:**
| Metric | Target | P1 | P2 | P3 | P4 | P5 | Avg |
|---|---|---|---|---|---|---|---|
| เวลาที่ใช้ (วินาที) | ≤ 60 | | | | | | |
| ฟอร์มไม่สับสน | 1-5 | | | | | | |
| จำนวนขั้นตอนเหมาะสม | 1-5 | | | | | | |

**Observations:**
- 
- 

---

### Task 4: Dashboard Comprehension (No explanation)

**Scenario:** ลูกหลานเปิด dashboard หลัง caregiver บันทึก check-in แล้ว

**Steps:**
1. เปิด `/prototype/family` (หลัง Task 2 หรือ 3)
2. **ไม่อธิบายอะไร** — ถามผู้ใช้ว่าเห็นอะไร

**Questions to ask:**
1. "วันนี้สถานะผู้สูงวัยเป็นอย่างไร?"
2. "มีอะไรที่ต้องกังวลไหม?"
3. "คุณจะทำอะไรต่อจากที่เห็น?"

**Metrics:**
| Metric | Target | P1 | P2 | P3 | P4 | P5 | Avg |
|---|---|---|---|---|---|---|---|
| ตอบ Q1 ถูกต้องโดยไม่อธิบาย | ใช่ | | | | | | |
| ตอบ Q2 ถูกต้อง | ใช่ | | | | | | |
| เข้าใจ dashboard โดยรวม | 1-5 | | | | | | |

**Observations:**
- 
- 

---

### Task 5: Report & LINE (Optional)

**Scenario:** ดูรายงานสรุปและตัวอย่าง LINE reminder

**Steps:**
1. เปิด `/prototype/report` — อ่าน AI summary
2. เปิด `/prototype/line` — ดูข้อความแจ้งเตือน

**Questions:**
1. "คุณเชื่อถือสรุป AI นี้แค่ไหน?"
2. "ข้อความ LINE เข้าใจง่ายไหม?"

**Metrics:**
| Metric | P1 | P2 | P3 | P4 | P5 | Avg |
|---|---|---|---|---|---|---|
| AI summary น่าเชื่อถือ | 1-5 | | | | | |
| Disclaimer เพียงพอ | 1-5 | | | | | |
| LINE message ชัดเจน | 1-5 | | | | | |

---

## Exit Criteria Summary

| Criterion | Target | Result | Pass/Fail |
|---|---|---|---|
| Onboarding ≤ 10 min | ≤ 10 min avg | | |
| Caregiver check-in ≤ 60 sec | ≤ 60 sec avg | | |
| Dashboard self-explanatory | ≥ 4/5 avg, Q1 correct ≥ 80% | | |

---

## Findings

### What worked well
1. 
2. 
3. 

### Pain points
1. 
2. 
3. 

### Copy / language issues
| Screen | Current text | Suggested change | Priority |
|---|---|---|---|
| | | | H/M/L |

### UX flow issues
| Flow | Issue | Suggested fix | Priority |
|---|---|---|---|
| | | | H/M/L |

---

## Revised MVP Scope Recommendations

Based on testing, recommend changes to MVP scope:

### Keep as-is
- 

### Simplify
- 

### Add / prioritize
- 

### Defer
- 

---

## Next Steps

- [ ] Update Thai copy in `src/lib/copy.ts`
- [ ] Revise wireframes in Figma per `docs/ux_wireframe_spec.md`
- [ ] Share findings with team
- [ ] Proceed to Phase 2 (MVP foundation) when exit criteria pass

---

## Appendix: SUS Score (Optional)

System Usability Scale — 10 questions, score 0–100

| Participant | SUS Score |
|---|---|
| P1 | |
| P2 | |
| P3 | |
| P4 | |
| P5 | |
| **Average** | |

SUS interpretation: > 68 = above average

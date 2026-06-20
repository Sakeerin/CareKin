import { aiReportSchema, type AiReportOutput } from "@/lib/schemas/report";
import type { ReportAggregate } from "@/lib/types/reports";

const DISCLAIMER =
  "สรุปนี้สร้างจากข้อมูลที่ครอบครัวบันทึกใน CareKin เท่านั้น ไม่ใช่การวินิจฉัยหรือคำแนะนำการรักษา กรุณาปรึกษาแพทย์เมื่อต้องตัดสินใจด้านสุขภาพ";

const BANNED_PHRASES = [
  "วินิจฉัยว่า",
  "ควรรักษา",
  "ให้ปรับยา",
  "หยุดยา",
  "เพิ่มยา",
  "ลดยา",
  "diagnosis",
  "treatment",
];

export function generateAiDraftSummary(aggregate: ReportAggregate): AiReportOutput {
  const elderName = aggregate.elder.nickname ?? aggregate.elder.fullName;
  const adherence = aggregate.medicationAdherence;
  const checkIns = aggregate.checkIns;
  const vitals = aggregate.vitals.averages;

  const observations = [
    adherence.total > 0
      ? `การกินยาตามแผนอยู่ที่ ${adherence.percent}% (${adherence.completed}/${adherence.total} ครั้ง)`
      : "ยังไม่มีข้อมูลงานยาในช่วงรายงาน",
    `มี check-in ${checkIns.completed}/${checkIns.expected} วัน และพบประเด็นที่ควรติดตาม ${checkIns.concerning} วัน`,
    vitals.systolic && vitals.diastolic
      ? `ความดันเฉลี่ยประมาณ ${vitals.systolic}/${vitals.diastolic} mmHg`
      : null,
    vitals.pulse ? `ชีพจรเฉลี่ยประมาณ ${vitals.pulse} bpm` : null,
    aggregate.alerts.total > 0
      ? `มี alert ${aggregate.alerts.total} รายการ โดยเร่งด่วน ${aggregate.alerts.urgent} รายการ`
      : "ไม่มี alert ในช่วงรายงาน",
  ].filter((item): item is string => Boolean(item));

  const questions = [
    aggregate.outOfRangeValues.length > 0
      ? "ควรถามแพทย์ว่าค่าที่อยู่นอกช่วงควรติดตามอย่างไรต่อ"
      : null,
    aggregate.missedRoutines.length > 0
      ? "ควรถามทีมดูแลว่ากิจวัตรที่พลาดควรปรับเวลา/วิธีเตือนหรือไม่"
      : null,
    checkIns.concerning > 0
      ? "ควรนำประเด็นจาก check-in ที่ผิดปกติไปเล่าให้แพทย์หรือพยาบาลทราบหรือไม่"
      : null,
  ].filter((item): item is string => Boolean(item));

  const draft = {
    summary: [
      `รายงาน ${aggregate.period.days} วันของ ${elderName}`,
      `ครอบคลุมวันที่ ${formatDate(aggregate.period.startDate)} ถึง ${formatDate(aggregate.period.endDate)}`,
      `โดยมีการกินยา ${adherence.percent}% และ check-in ${checkIns.completed}/${checkIns.expected} วัน`,
      aggregate.alerts.total > 0 ? `พบ alert ${aggregate.alerts.total} รายการที่ควรทบทวน` : "ไม่พบ alert ในช่วงนี้",
    ].join(" "),
    key_observations: observations,
    missed_routines: aggregate.missedRoutines.slice(0, 8),
    values_outside_user_configured_ranges: aggregate.outOfRangeValues.slice(0, 8),
    questions_for_doctor: questions.length > 0 ? questions : ["มีข้อมูลใดในรายงานนี้ที่ควรติดตามเพิ่มเติมหรือไม่"],
    caregiver_notes_summary:
      aggregate.caregiverNotes.length > 0
        ? aggregate.caregiverNotes.slice(0, 8)
        : ["ไม่มีหมายเหตุจากผู้ดูแลในช่วงรายงาน"],
    safety_disclaimer: DISCLAIMER,
  };

  const safeDraft = sanitizeDraft(draft);
  return aiReportSchema.parse(safeDraft);
}

export function getReviewedReportOutput(
  aiOutput: AiReportOutput,
  reviewedOutput: AiReportOutput | null,
): AiReportOutput {
  return reviewedOutput ?? aiOutput;
}

function sanitizeDraft(draft: AiReportOutput): AiReportOutput {
  const sanitizeText = (value: string) =>
    BANNED_PHRASES.reduce(
      (text, phrase) => text.replaceAll(phrase, "ควรปรึกษาแพทย์เกี่ยวกับ"),
      value,
    );

  return {
    summary: sanitizeText(draft.summary),
    key_observations: draft.key_observations.map(sanitizeText),
    missed_routines: draft.missed_routines.map(sanitizeText),
    values_outside_user_configured_ranges:
      draft.values_outside_user_configured_ranges.map(sanitizeText),
    questions_for_doctor: draft.questions_for_doctor.map(sanitizeText),
    caregiver_notes_summary: draft.caregiver_notes_summary.map(sanitizeText),
    safety_disclaimer: DISCLAIMER,
  };
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("th-TH", { timeZone: "Asia/Bangkok" });
}

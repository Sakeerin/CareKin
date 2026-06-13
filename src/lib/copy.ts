export const copy = {
  appName: "CareKin",
  prototypeBanner: "โหมดต้นแบบ — ข้อมูลจำลอง",
  safetyDisclaimer:
    "ระบบนี้ใช้เพื่อช่วยบันทึก เตือน และสรุปข้อมูลการดูแลผู้สูงวัย ไม่ใช่เครื่องมือวินิจฉัยโรคหรือทดแทนคำแนะนำจากแพทย์ หากมีอาการฉุกเฉินหรือผิดปกติรุนแรง กรุณาติดต่อหน่วยบริการฉุกเฉินหรือบุคลากรทางการแพทย์ทันที",
  aiDisclaimer:
    "สรุปนี้มาจากข้อมูลที่บันทึกในระบบเท่านั้น ไม่ใช่การวินิจฉัย กรุณาปรึกษาแพทย์หากมีข้อสงสัย",

  hub: {
    title: "เลือกมุมมองทดสอบ",
    subtitle: "เลือกบทบาทเพื่อทดลองใช้งานต้นแบบ CareKin",
    onboarding: {
      title: "เริ่มต้นใช้งาน",
      description: "ทดสอบ onboarding ครบ 10 ขั้นตอน (เป้าหมาย ≤ 10 นาที)",
    },
    family: {
      title: "ลูกหลาน / Family Admin",
      description: "ดู dashboard สถานะวันนี้ การแจ้งเตือน และกิจกรรมล่าสุด",
    },
    elder: {
      title: "ผู้สูงวัย / Elder",
      description: "ยืนยันงานและ check-in ด้วยปุ่มใหญ่ ใช้งานง่าย",
    },
    caregiver: {
      title: "ผู้ดูแล / Caregiver",
      description: "บันทึก check-in รวดเร็ว (เป้าหมาย ≤ 60 วินาที)",
    },
    report: {
      title: "รายงานสรุป",
      description: "ดูตัวอย่างรายงานรายสัปดาห์และสรุป AI",
    },
    line: {
      title: "LINE Reminder",
      description: "ตัวอย่างข้อความแจ้งเตือนผ่าน LINE",
    },
  },

  onboarding: {
    steps: [
      { title: "ยินดีต้อนรับ", subtitle: "เริ่มต้นใช้ CareKin" },
      { title: "สร้าง workspace", subtitle: "ตั้งชื่อครอบครัว" },
      { title: "เพิ่มผู้สูงวัย", subtitle: "ข้อมูลพื้นฐาน" },
      { title: "ช่องทางการใช้งาน", subtitle: "LINE หรือ caregiver" },
      { title: "เพิ่มยา", subtitle: "ยาตัวแรก" },
      { title: "เพิ่ม routine", subtitle: "กิจวัตรประจำวัน" },
      { title: "เชิญครอบครัว", subtitle: "แชร์ให้ลูกหลาน" },
      { title: "ผู้ติดต่อฉุกเฉิน", subtitle: "เบอร์ติดต่อสำคัญ" },
      { title: "เปิด check-in", subtitle: "บันทึกรายวัน" },
      { title: "พร้อมใช้งาน", subtitle: "ไปที่ dashboard" },
    ],
    welcome:
      "CareKin ช่วยครอบครัวติดตามการดูแลผู้สูงวัย — กินยา check-in และรายงานสรุป",
    skip: "ข้ามไปทดสอบหน้าอื่น",
    next: "ถัดไป",
    back: "ย้อนกลับ",
    finish: "ไปที่ Dashboard",
  },

  elder: {
    todayTitle: "วันนี้",
    tasksTitle: "งานวันนี้",
    checkInTitle: "บันทึกวันนี้",
    done: "ทำแล้ว",
    notYet: "ยังไม่ได้",
    successTitle: "บันทึกเรียบร้อย",
    successMessage: "ลูกหลานจะเห็นข้อมูลในหน้า dashboard",
    questions: {
      mood: "วันนี้รู้สึกอย่างไร",
      symptoms: "มีอาการผิดปกติไหม",
      fall: "มีการหกล้มหรือเกือบหกล้มไหม",
      appetite: "กินอาหารได้ปกติไหม",
      sleep: "นอนหลับเป็นอย่างไร",
    },
    moodOptions: {
      good: "ดี",
      okay: "ปานกลาง",
      bad: "ไม่ค่อยดี",
    },
    yesNo: { yes: "ใช่", no: "ไม่" },
    sleepOptions: {
      good: "ดี",
      okay: "ปานกลาง",
      bad: "ไม่ดี",
    },
  },

  caregiver: {
    title: "บันทึก check-in",
    subtitle: "กรอกให้ครบภายใน 60 วินาที",
    elderLabel: "ผู้สูงวัย",
    vitalsTitle: "ค่าสุขภาพ (ไม่บังคับ)",
    noteLabel: "หมายเหตุเพิ่มเติม",
    submit: "บันทึกเสร็จ",
    success: "บันทึก check-in เรียบร้อย",
    viewDashboard: "ดู Dashboard",
  },

  family: {
    title: "Dashboard",
    todayStatus: "สถานะวันนี้",
    checkIn: "Check-in วันนี้",
    medications: "ยาวันนี้",
    lastVital: "ค่าล่าสุด",
    missedReminders: "งานที่ยังไม่ทำ",
    recentActivity: "กิจกรรมล่าสุด",
    alerts: "การแจ้งเตือน",
    trend: "แนวโน้ม 7 วัน",
    viewReport: "ดูรายงาน",
    remindAgain: "แจ้งเตือนซ้ำ",
    done: "เสร็จแล้ว",
    pending: "รอดำเนินการ",
    missed: "พลาด",
  },

  report: {
    title: "รายงานสรุป",
    period: "ช่วงเวลา",
    days7: "7 วัน",
    days14: "14 วัน",
    days30: "30 วัน",
    medicationAdherence: "การกินยา",
    checkInSummary: "สรุป check-in",
    vitalsTable: "ค่าสุขภาพ",
    alertsLog: "ประวัติการแจ้งเตือน",
    aiSummary: "สรุปโดย AI",
    reviewBeforeSend: "ตรวจทานก่อนส่ง",
    exportPdf: "Export PDF",
    pdfComingSoon: "ฟีเจอร์ Export PDF จะพร้อมใน Phase 5",
  },

  line: {
    title: "ตัวอย่าง LINE Reminder",
    note: "การส่งจริงจะเชื่อมใน Phase 3",
    medReminder: "ถึงเวลากินยาแล้วค่ะ",
    escalation: "แจ้งเตือน: ยังไม่ได้ยืนยันกินยา",
  },
} as const;

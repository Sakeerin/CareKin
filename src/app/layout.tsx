import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import "./globals.css";

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  variable: "--font-noto-sans-thai",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CareKin",
    template: "%s | CareKin",
  },
  description:
    "แพลตฟอร์มช่วยครอบครัวดูแลผู้สูงวัย — บันทึก แจ้งเตือน และสรุปข้อมูลการดูแล",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={`${notoSansThai.className} min-h-screen`}>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import { Noto_Sans_SC, Geist_Mono } from "next/font/google";
import { MotionConfig } from "motion/react";
import { PageChrome } from "@/components/page-chrome";
import "./globals.css";

const notoSans = Noto_Sans_SC({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "从图灵到 Harness：大语言模型的前世今生",
  description: "一本通俗易懂的大语言模型发展史：1950 图灵之问到 2026 年的 Agent 与 Harness。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`dark ${notoSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col">
        <MotionConfig reducedMotion="user">
          {children}
          <PageChrome />
        </MotionConfig>
      </body>
    </html>
  );
}

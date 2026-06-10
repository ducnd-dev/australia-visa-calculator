import type { Metadata } from "next";
import { DM_Sans, Geist } from "next/font/google";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { buildMetadata } from "@/lib/seo";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans", weight: ["500", "600", "700"] });

export const metadata: Metadata = buildMetadata({
  title: "Australia Visa Points Calculator | 189, 190, 491",
  description: "Free Schedule 6D points calculator for Australian skilled migration. Built for migration agents and applicants.",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU" className={`${geist.variable} ${dmSans.variable}`}>
      <body className="min-h-screen antialiased">{children}<GoogleAnalytics /></body>
    </html>
  );
}

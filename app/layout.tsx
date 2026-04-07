import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UKB Data Dictionary",
  description: "TypeScript + Next.js + Hono + Drizzle search application"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-background text-foreground antialiased">{children}</body>
    </html>
  );
}

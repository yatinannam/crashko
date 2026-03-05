import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import AuthSessionProvider from "@/components/AuthSessionProvider";
import AuroraOrbs from "@/components/AuroraOrbs";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Crashko — AI Burnout Predictor",
  description:
    "AI-powered burnout prediction and recovery assistant for students. Track sleep, study load, and stress to predict and prevent burnout.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ background: "#05070f" }}
      >
        <AuthSessionProvider>
          {/* Fixed iridescent background orbs */}
          <AuroraOrbs />

          {/* Page content sits above the orbs */}
          <div className="relative z-10 flex min-h-screen flex-col">
            <Navbar />
            {children}
          </div>
        </AuthSessionProvider>
      </body>
    </html>
  );
}

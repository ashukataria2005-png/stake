import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GameProvider } from "@/context/GameContext";
import MainLayoutShell from "@/components/MainLayoutShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stake Casino | Stake Originals, Slots & Live Games",
  description:
    "Experience the premier Stake clone with live demo balance, authentic Stake Originals like Mines, Crash, Plinko, and Dice, and real-time live bet stream.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full bg-[#0f212e] text-white">
        <GameProvider>
          <MainLayoutShell>{children}</MainLayoutShell>
        </GameProvider>
      </body>
    </html>
  );
}

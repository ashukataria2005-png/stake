import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GameProvider } from "@/context/GameContext";
import MainLayoutShell from "@/components/MainLayoutShell";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
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
      className={`${inter.variable} h-full antialiased dark`}
    >
      <body className="min-h-full bg-[#0f212e] text-white font-sans selection:bg-[#00e701] selection:text-[#0f212e]">
        <GameProvider>
          <MainLayoutShell>{children}</MainLayoutShell>
        </GameProvider>
      </body>
    </html>
  );
}

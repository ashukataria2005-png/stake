import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GameProvider } from "@/context/GameContext";
import MainLayoutShell from "@/components/MainLayoutShell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-stake",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});


export const metadata: Metadata = {
  title: "Stake: Online Casino & Sports Betting - Play & Bet Online",
  description:
    "Experience the premier Stake casino and sportsbook with live demo balance, authentic Stake Originals like Mines, Crash, Plinko, and Dice, and real-time live bet stream.",
  manifest: "/manifest.json",
  themeColor: "#0f212e",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Stake",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${inter.className} h-full antialiased dark`}
    >
      <body className={`${inter.variable} ${inter.className} min-h-full bg-[#1a2c38] text-white font-sans selection:bg-[#00e701] selection:text-[#0f212e]`}>
        <GameProvider>
          <MainLayoutShell>{children}</MainLayoutShell>
        </GameProvider>
      </body>
    </html>
  );
}

import React from "react";
import GamePlayModeBar from "@/components/casino/GamePlayModeBar";

export default function GamesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full pb-10 sm:pb-14">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 pt-3 pb-1">
        <GamePlayModeBar />
      </div>
      {children}
    </div>
  );
}

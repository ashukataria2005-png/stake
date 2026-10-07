"use client";

import React, { useEffect } from "react";
import { Sparkles, RotateCcw, Plus, AlertCircle, Coins } from "lucide-react";
import { useGame } from "@/context/GameContext";

interface GamePlayModeBarProps {
  isLiveCasino?: boolean;
}

export default function GamePlayModeBar({ isLiveCasino = false }: GamePlayModeBarProps) {
  const {
    playMode,
    setPlayMode,
    funBalance,
    resetFunBalance,
    realBalance,
    openWalletModal,
    formatDisplayBalance,
  } = useGame();

  // If live casino, force real play mode and block fun play
  useEffect(() => {
    if (isLiveCasino && playMode === "fun") {
      setPlayMode("real");
    }
  }, [isLiveCasino, playMode, setPlayMode]);

  // Clean up fun balance upon route exit / component unmount
  useEffect(() => {
    return () => {
      resetFunBalance();
    };
  }, [resetFunBalance]);

  const displayInfo = formatDisplayBalance(realBalance);

  if (isLiveCasino) {
    return (
      <div className="w-full bg-[#1a2c38] border border-[#213743] rounded-xl px-3 sm:px-4 py-2.5 flex items-center justify-between gap-3 text-xs shadow-md mb-4 select-none">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="font-bold text-white tracking-wide uppercase text-[11px]">
            Live Casino Dealer Table
          </span>
          <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded font-semibold hidden sm:inline">
            Real Play Only
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#b1bad3] text-xs">
            Balance:{" "}
            <strong className={realBalance > 0 ? "text-[#00e701]" : "text-amber-400"}>
              {displayInfo.symbol}{displayInfo.amount}
            </strong>
          </span>
          {realBalance <= 0 && (
            <button
              onClick={openWalletModal}
              className="bg-[#00e701] hover:bg-[#00c701] text-[#0f212e] font-black text-xs px-2.5 py-1 rounded-md transition-transform active:scale-95 shadow-[0_0_10px_rgba(0,231,1,0.3)] flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Deposit
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#1a2c38] border border-[#213743] rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs shadow-md mb-4 select-none">
      {/* Left: Mode Segmented Switcher */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-bold text-[#b1bad3] uppercase tracking-wider hidden sm:inline">
          Mode:
        </span>
        <div className="flex items-center rounded-lg bg-[#0f212e] p-1 border border-[#213743]">
          <button
            type="button"
            onClick={() => setPlayMode("real")}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              playMode === "real"
                ? "bg-[#00e701] text-[#0f212e] shadow-[0_0_10px_rgba(0,231,1,0.4)]"
                : "text-[#b1bad3] hover:text-white"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                playMode === "real" ? "bg-[#0f212e]" : "bg-[#00e701]"
              }`}
            />
            Real Play
          </button>
          <button
            type="button"
            onClick={() => setPlayMode("fun")}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              playMode === "fun"
                ? "bg-[#213743] text-[#00e701] border border-[#00e701]/40 shadow-sm"
                : "text-[#b1bad3] hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Fun Play
          </button>
        </div>
      </div>

      {/* Right: State Specific Feedback / Credits / Deposit Button */}
      {playMode === "real" ? (
        <div className="flex items-center gap-2.5">
          {realBalance <= 0 ? (
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/25 px-2.5 py-1 rounded-lg">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-[11px] font-medium text-amber-300 hidden sm:inline">
                Real Balance ₹0.00
              </span>
              <button
                type="button"
                onClick={openWalletModal}
                className="bg-[#00e701] hover:bg-[#00c701] text-[#0f212e] font-black text-xs px-2.5 py-1 rounded-md transition-transform active:scale-95 shadow-[0_0_10px_rgba(0,231,1,0.3)] flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" /> Deposit Now
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-[#b1bad3] text-xs">
                Real Funds:{" "}
                <strong className="text-[#00e701]">
                  {displayInfo.symbol}{displayInfo.amount}
                </strong>
              </span>
              <button
                type="button"
                onClick={openWalletModal}
                className="bg-[#213743] hover:bg-[#2a4555] text-white border border-[#2f4553] text-[11px] font-semibold px-2 py-1 rounded-md transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3 text-[#00e701]" /> Deposit
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#0f212e] border border-[#213743] px-2.5 py-1 rounded-lg">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] text-[#b1bad3]">
              Fun Credits:{" "}
              <strong className="text-amber-400 font-mono">
                ₹{funBalance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </strong>
            </span>
          </div>
          <button
            type="button"
            onClick={resetFunBalance}
            title="Reload session credits to ₹1,000"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#213743] hover:bg-[#2a4555] text-[#b1bad3] hover:text-white text-[11px] font-semibold border border-[#2f4553] active:scale-95 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3 h-3 text-[#00e701]" />
            <span className="hidden sm:inline">Reload</span>
          </button>
        </div>
      )}
    </div>
  );
}

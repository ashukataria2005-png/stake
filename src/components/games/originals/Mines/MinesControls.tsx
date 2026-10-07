"use client";

import React, { useState } from "react";
import { Sparkles, Dices, ChevronDown, Infinity as InfinityIcon, Sliders } from "lucide-react";
import { sounds } from "@/utils/audio";

interface MinesControlsProps {
  mode: "manual" | "auto";
  setMode: (m: "manual" | "auto") => void;
  betAmount: number;
  setBetAmount: (amt: number) => void;
  minesCount: number;
  setMinesCount: (m: number) => void;
  isPlaying: boolean;
  currentMultiplier: number;
  currentGemsOpened: number;
  balance: number;
  currency: string;
  onBet: () => void;
  onCashout: () => void;
  onRandomPick: () => void;
  // Autobet props
  isAutoRunning: boolean;
  onStartAuto: () => void;
  onStopAuto: () => void;
  autoBetsCount: number | "infinity";
  setAutoBetsCount: (c: number | "infinity") => void;
  onWinAction: "reset" | "increase";
  setOnWinAction: (a: "reset" | "increase") => void;
  onWinPercent: number;
  setOnWinPercent: (p: number) => void;
  onLossAction: "reset" | "increase";
  setOnLossAction: (a: "reset" | "increase") => void;
  onLossPercent: number;
  setOnLossPercent: (p: number) => void;
  stopOnProfit: number;
  setStopOnProfit: (p: number) => void;
  stopOnLoss: number;
  setStopOnLoss: (l: number) => void;
}

export default function MinesControls({
  mode,
  setMode,
  betAmount,
  setBetAmount,
  minesCount,
  setMinesCount,
  isPlaying,
  currentMultiplier,
  currentGemsOpened,
  balance,
  currency,
  onBet,
  onCashout,
  onRandomPick,
  isAutoRunning,
  onStartAuto,
  onStopAuto,
  autoBetsCount,
  setAutoBetsCount,
  onWinAction,
  setOnWinAction,
  onWinPercent,
  setOnWinPercent,
  onLossAction,
  setOnLossAction,
  onLossPercent,
  setOnLossPercent,
  stopOnProfit,
  setStopOnProfit,
  stopOnLoss,
  setStopOnLoss,
}: MinesControlsProps) {
  const [showAdvancedAuto, setShowAdvancedAuto] = useState(false);

  const gemsCount = 25 - minesCount;
  const cashoutValue = betAmount * currentMultiplier;

  // Half & Double bet helpers
  const handleHalfBet = () => {
    sounds.playClick();
    setBetAmount(Math.max(0.01, parseFloat((betAmount / 2).toFixed(2))));
  };

  const handleDoubleBet = () => {
    sounds.playClick();
    setBetAmount(Math.min(balance || 100000, parseFloat((betAmount * 2).toFixed(2))));
  };

  return (
    <div className="w-full lg:w-[320px] shrink-0 border-t lg:border-t-0 lg:border-r border-[#213743] bg-[#1a2c38] p-4 sm:p-5 flex flex-col justify-start space-y-4 rounded-2xl select-none">
      {/* Mode Switch Tabs: [ Manual | Auto ] */}
      <div className="flex rounded-xl bg-[#0f212e] p-1 border border-[#213743]">
        <button
          type="button"
          disabled={isPlaying || isAutoRunning}
          onClick={() => {
            sounds.playClick();
            setMode("manual");
          }}
          className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all cursor-pointer ${
            mode === "manual"
              ? "bg-[#213743] text-white shadow-sm"
              : "text-[#b1bad3] hover:text-white"
          }`}
        >
          Manual
        </button>
        <button
          type="button"
          disabled={isPlaying || isAutoRunning}
          onClick={() => {
            sounds.playClick();
            setMode("auto");
          }}
          className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all cursor-pointer ${
            mode === "auto"
              ? "bg-[#213743] text-white shadow-sm"
              : "text-[#b1bad3] hover:text-white"
          }`}
        >
          Auto
        </button>
      </div>

      {/* PRIMARY ACTION BUTTON */}
      <div className="w-full">
        {mode === "manual" ? (
          !isPlaying ? (
            <button
              type="button"
              onClick={onBet}
              disabled={betAmount > balance || betAmount <= 0}
              className="w-full py-4 text-base font-extrabold rounded-xl bg-[#1475e1] hover:bg-[#1164c2] text-white shadow-lg active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="h-5 w-5 fill-current" />
              <span>Bet</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onCashout}
              disabled={currentGemsOpened === 0}
              className={`w-full py-4 text-base font-black rounded-xl shadow-lg transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer ${
                currentGemsOpened === 0
                  ? "bg-[#213743] text-[#b1bad3] cursor-not-allowed"
                  : "bg-[#00e701] hover:bg-[#00c701] text-black shadow-[0_0_20px_rgba(0,231,1,0.4)]"
              }`}
            >
              <span>Cashout ${cashoutValue.toFixed(2)}</span>
            </button>
          )
        ) : !isAutoRunning ? (
          <button
            type="button"
            onClick={onStartAuto}
            disabled={betAmount > balance || betAmount <= 0}
            className="w-full py-4 text-base font-extrabold rounded-xl bg-[#1475e1] hover:bg-[#1164c2] text-white shadow-lg active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Start Autobet</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onStopAuto}
            className="w-full py-4 text-base font-black rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Stop Autobet</span>
          </button>
        )}
      </div>

      {/* Random Pick Button (Active in Manual Play) */}
      {isPlaying && mode === "manual" && (
        <button
          type="button"
          onClick={onRandomPick}
          className="w-full py-2.5 rounded-xl bg-[#213743] hover:bg-[#2f4553] text-[#00e701] hover:text-white border border-[#2f4553] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer active:scale-95 shadow-sm"
        >
          <Dices className="w-4 h-4" />
          <span>Random Pick</span>
        </button>
      )}

      {/* Bet Amount Input with Quick Buttons (1/2, 2x) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[#b1bad3]">Bet Amount</span>
          <span className="font-mono text-[11px] text-[#b1bad3]">
            Bal: ${balance.toFixed(2)}
          </span>
        </div>
        <div className="flex rounded-xl bg-[#0f212e] border border-[#213743] focus-within:border-[#2f4553] p-1">
          <div className="flex flex-1 items-center px-2.5">
            <span className="text-xs font-bold text-[#b1bad3] mr-1.5">$</span>
            <input
              type="number"
              step="any"
              min="0.01"
              disabled={isPlaying || isAutoRunning}
              value={betAmount}
              onChange={(e) => setBetAmount(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full bg-transparent text-sm font-bold text-white outline-none"
            />
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={isPlaying || isAutoRunning}
              onClick={handleHalfBet}
              className="rounded-lg bg-[#213743] px-2.5 py-1.5 text-xs font-bold text-[#b1bad3] hover:bg-[#2f4553] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
            >
              ½
            </button>
            <button
              type="button"
              disabled={isPlaying || isAutoRunning}
              onClick={handleDoubleBet}
              className="rounded-lg bg-[#213743] px-2.5 py-1.5 text-xs font-bold text-[#b1bad3] hover:bg-[#2f4553] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
            >
              2×
            </button>
          </div>
        </div>
      </div>

      {/* Mines vs Gems Dynamic Slider & Selector */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-[#ef4444] flex items-center gap-1">
            <span>💣</span> Mines ({minesCount})
          </span>
          <span className="text-[#00e701] flex items-center gap-1">
            Gems ({gemsCount}) <span>💎</span>
          </span>
        </div>

        {/* Range Slider dynamically balancing Mines (1-24) vs Gems (24-1) */}
        <input
          type="range"
          min="1"
          max="24"
          disabled={isPlaying || isAutoRunning}
          value={minesCount}
          onChange={(e) => {
            sounds.playClick();
            setMinesCount(Number(e.target.value));
          }}
          className="w-full accent-[#00e701] h-2 bg-[#0f212e] rounded-lg appearance-none cursor-pointer disabled:opacity-50"
        />

        {/* Dropdown Select Option for Fast Presets */}
        <div className="relative">
          <select
            disabled={isPlaying || isAutoRunning}
            value={minesCount}
            onChange={(e) => {
              sounds.playClick();
              setMinesCount(Number(e.target.value));
            }}
            className="w-full appearance-none rounded-xl bg-[#0f212e] border border-[#213743] px-3 py-2 text-xs font-bold text-white outline-none cursor-pointer disabled:opacity-50"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20, 24].map((cnt) => (
              <option key={cnt} value={cnt}>
                {cnt} Mines ({25 - cnt} Gems)
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-[#b1bad3]" />
        </div>
      </div>

      {/* AUTO MODE SETTINGS */}
      {mode === "auto" && (
        <div className="space-y-3 border-t border-[#213743] pt-3 text-xs">
          {/* Number of Bets */}
          <div className="space-y-1">
            <label className="font-bold text-[#b1bad3]">Number of Bets</label>
            <div className="flex rounded-xl bg-[#0f212e] border border-[#213743] p-1">
              <input
                type="text"
                disabled={isAutoRunning}
                value={autoBetsCount === "infinity" ? "∞" : autoBetsCount}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "" || v === "0") setAutoBetsCount(1);
                  else if (!isNaN(Number(v))) setAutoBetsCount(Number(v));
                }}
                className="w-full bg-transparent px-2.5 text-xs font-bold text-white outline-none"
              />
              <button
                type="button"
                disabled={isAutoRunning}
                onClick={() => {
                  sounds.playClick();
                  setAutoBetsCount(autoBetsCount === "infinity" ? 10 : "infinity");
                }}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-colors cursor-pointer ${
                  autoBetsCount === "infinity"
                    ? "bg-[#00e701] text-black"
                    : "bg-[#213743] text-[#b1bad3] hover:text-white"
                }`}
              >
                <InfinityIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Advanced Autobet Collapsible */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvancedAuto(!showAdvancedAuto)}
              className="flex items-center justify-between w-full py-1 text-xs font-bold text-[#b1bad3] hover:text-white cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" /> Advanced Conditions
              </span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAdvancedAuto ? "rotate-180" : ""}`} />
            </button>

            {showAdvancedAuto && (
              <div className="space-y-3 pt-2">
                {/* On Win */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-[#b1bad3]">
                    <span>On Win</span>
                    <button
                      type="button"
                      onClick={() => setOnWinAction(onWinAction === "reset" ? "increase" : "reset")}
                      className="text-[#00e701] font-bold"
                    >
                      {onWinAction === "reset" ? "Reset" : `+${onWinPercent}%`}
                    </button>
                  </div>
                </div>

                {/* On Loss */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-[#b1bad3]">
                    <span>On Loss</span>
                    <button
                      type="button"
                      onClick={() => setOnLossAction(onLossAction === "reset" ? "increase" : "reset")}
                      className="text-amber-400 font-bold"
                    >
                      {onLossAction === "reset" ? "Reset" : `+${onLossPercent}%`}
                    </button>
                  </div>
                </div>

                {/* Stop on Profit / Stop on Loss */}
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <label className="text-[#b1bad3]">Stop on Profit</label>
                    <input
                      type="number"
                      placeholder="$0.00"
                      value={stopOnProfit || ""}
                      onChange={(e) => setStopOnProfit(Number(e.target.value) || 0)}
                      className="w-full bg-[#0f212e] border border-[#213743] rounded-lg px-2 py-1 text-white font-bold text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[#b1bad3]">Stop on Loss</label>
                    <input
                      type="number"
                      placeholder="$0.00"
                      value={stopOnLoss || ""}
                      onChange={(e) => setStopOnLoss(Number(e.target.value) || 0)}
                      className="w-full bg-[#0f212e] border border-[#213743] rounded-lg px-2 py-1 text-white font-bold text-xs outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

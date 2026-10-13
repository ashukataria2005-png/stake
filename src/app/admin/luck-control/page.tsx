"use client";

import React, { useState, useEffect } from "react";
import {
  Sliders,
  RefreshCw,
  CheckCircle,
  Zap,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  AlertCircle,
} from "lucide-react";

interface GameControlItem {
  id: string;
  gameName: string;
  mode: string;
  houseEdgePercent: number;
  forcedMultiplier: number | null;
  isActive: boolean;
}

const GAME_OPTIONS = [
  { value: "ALL", label: "All Games (Global Platform)" },
  { value: "Mines", label: "Mines" },
  { value: "Crash", label: "Crash (Aviator)" },
  { value: "Dice", label: "Dice" },
  { value: "Limbo", label: "Limbo" },
  { value: "Plinko", label: "Plinko" },
  { value: "Roulette", label: "Roulette" },
  { value: "Blackjack", label: "Blackjack" },
  { value: "Keno", label: "Keno" },
  { value: "Wheel", label: "Wheel" },
  { value: "Dragon Tower", label: "Dragon Tower" },
  { value: "HiLo", label: "HiLo" },
  { value: "Video Poker", label: "Video Poker" },
];

const MODE_OPTIONS = [
  {
    value: "NORMAL",
    label: "Balanced / Default",
    desc: "Standard authentic house edge (2-3% RTP margin, fair RNG)",
    badge: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
  },
  {
    value: "HIGH_WIN",
    label: "User Win (Generous RTP)",
    desc: "Algorithm heavily favors player wins, boosting cashouts & retention",
    badge: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  },
  {
    value: "LOW_WIN",
    label: "House Win (High Margin)",
    desc: "Strict house advantage, frequent losses to recover platform bankroll",
    badge: "text-rose-400 bg-rose-500/10 border-rose-500/30",
  },
  {
    value: "JACKPOT",
    label: "Jackpot Mode",
    desc: "Rare high payout multiplier events with boosted big win frequency",
    badge: "text-purple-300 bg-purple-500/10 border-purple-500/30",
  },
];

export default function AdminLuckControlPage() {
  const [controls, setControls] = useState<GameControlItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Single unified control state
  const [selectedGame, setSelectedGame] = useState<string>("ALL");
  const [selectedMode, setSelectedMode] = useState<string>("NORMAL");

  const fetchControls = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/games");
      const data = await res.json();
      if (data.success && data.controls) {
        setControls(data.controls);
        // If a specific game is currently selected, find its current mode
        const found = data.controls.find((c: GameControlItem) => c.gameName === selectedGame);
        if (found) {
          setSelectedMode(found.mode);
        }
      }
    } catch (err: any) {
      console.error("Fetch game controls error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchControls();
  }, []);

  const handleGameSelect = (gName: string) => {
    setSelectedGame(gName);
    if (gName !== "ALL") {
      const found = controls.find((c) => c.gameName === gName);
      if (found) {
        setSelectedMode(found.mode);
      }
    }
  };

  const handleApplyMode = async () => {
    setIsApplying(true);
    try {
      const res = await fetch("/api/admin/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameName: selectedGame,
          mode: selectedMode,
          isActive: true,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update luck mode");
      }

      setToastMessage(
        `Applied "${MODE_OPTIONS.find((m) => m.value === selectedMode)?.label}" to ${
          selectedGame === "ALL" ? "All Games" : selectedGame
        } instantly!`
      );
      setTimeout(() => setToastMessage(null), 4000);
      await fetchControls();
    } catch (err: any) {
      alert("Error applying mode: " + err.message);
    } finally {
      setIsApplying(false);
    }
  };

  const activeModeDetails = MODE_OPTIONS.find((m) => m.value === selectedMode) || MODE_OPTIONS[0];

  return (
    <div className="space-y-6">
      {/* Page Header (Clean, no redundant banners) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
            Unified Luck & RTP Engine
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Centrally switch algorithm modes for individual games or platform-wide instantly.
          </p>
        </div>

        <button
          onClick={fetchControls}
          disabled={isLoading}
          className="flex items-center gap-2 px-3.5 py-2 bg-[#131722] hover:bg-[#1c2233] text-slate-200 text-xs font-semibold rounded-xl border border-[#1e2433] transition-all shadow-sm self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs sm:text-sm font-semibold flex items-center gap-2.5 shadow-lg animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* UNIFIED SINGLE-BOX LUCK / RTP CONTROL CONTAINER */}
      <div className="bg-[#131722] border border-[#1e2433] rounded-2xl p-6 sm:p-8 shadow-2xl max-w-3xl mx-auto space-y-6">
        <div className="border-b border-[#1e2433] pb-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>Master RTP / Luck Controller</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Select game scope and operational mode to commit immediate database algorithm overrides.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Dropdown 1: Select Game */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <span>1. Target Game Scope</span>
            </label>
            <select
              value={selectedGame}
              onChange={(e) => handleGameSelect(e.target.value)}
              className="w-full bg-[#0e1017] border border-[#1e2433] text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 font-semibold"
            >
              {GAME_OPTIONS.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
            <div className="text-[11px] text-slate-500">
              {selectedGame === "ALL"
                ? "Changes will immediately update every single casino title."
                : `Targeting: ${selectedGame}`}
            </div>
          </div>

          {/* Dropdown 2: Select Operational Mode */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <span>2. Operational Mode</span>
            </label>
            <select
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
              className="w-full bg-[#0e1017] border border-[#1e2433] text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 font-semibold"
            >
              {MODE_OPTIONS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            <div className="text-[11px] text-slate-500">
              Applies instantly without user page reload.
            </div>
          </div>
        </div>

        {/* Selected Mode Summary Card */}
        <div className="bg-[#0e1017] border border-[#1e2433] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-mono text-slate-400 uppercase">Selected Mode Behavior</div>
            <div className="text-sm font-bold text-white mt-0.5">{activeModeDetails.label}</div>
            <div className="text-xs text-slate-400 mt-1">{activeModeDetails.desc}</div>
          </div>
          <div className={`px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wider font-mono self-start sm:self-auto ${activeModeDetails.badge}`}>
            {activeModeDetails.value}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={handleApplyMode}
            disabled={isApplying}
            className="w-full py-3.5 px-6 rounded-xl text-sm font-bold uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2"
          >
            {isApplying ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-black" />
                <span>Applying to Database...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-black fill-black" />
                <span>Apply Mode Now</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

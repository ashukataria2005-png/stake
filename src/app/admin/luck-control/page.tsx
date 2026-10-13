"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sliders,
  RefreshCw,
  Gamepad2,
  Percent,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Zap,
} from "lucide-react";

interface GameControlItem {
  id: string;
  gameName: string;
  mode: string;
  houseEdgePercent: number;
  forcedMultiplier: number | null;
  isActive: boolean;
}

export default function AdminLuckControlPage() {
  const [controls, setControls] = useState<GameControlItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchControls = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/games");
      const data = await res.json();
      if (data.success) {
        setControls(data.controls || []);
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

  const handleUpdate = async (item: GameControlItem, updates: Partial<GameControlItem>) => {
    const payload = {
      gameName: item.gameName,
      mode: updates.mode !== undefined ? updates.mode : item.mode,
      houseEdgePercent: updates.houseEdgePercent !== undefined ? updates.houseEdgePercent : item.houseEdgePercent,
      isActive: updates.isActive !== undefined ? updates.isActive : item.isActive,
      forcedMultiplier: updates.forcedMultiplier !== undefined ? updates.forcedMultiplier : item.forcedMultiplier,
    };

    try {
      const res = await fetch("/api/admin/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update game control");
      }

      setControls((prev) =>
        prev.map((c) => (c.gameName === item.gameName ? { ...c, ...updates } : c))
      );
      setToastMessage(`Updated configuration for ${item.gameName}`);
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err: any) {
      alert("Error saving control: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              Games & RTP Luck Control Desk
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono">
              Algorithm Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure house edge margins, override crash / payout multipliers, and calibrate win/loss algorithms across all game titles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchControls}
            disabled={isLoading}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#131722] hover:bg-[#1c2233] text-slate-200 text-xs font-semibold rounded-xl border border-[#1e2433] transition-all shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isLoading ? "animate-spin" : ""}`} />
            <span>Reload Titles</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Grid of Game Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-400 mx-auto mb-2" />
            <p className="font-mono text-xs">Loading game RNG controllers...</p>
          </div>
        ) : controls.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 font-mono text-xs">
            No game titles registered in database yet.
          </div>
        ) : (
          controls.map((item) => (
            <div
              key={item.id || item.gameName}
              className="bg-[#131722] border border-[#1e2433] rounded-2xl p-5 shadow-lg space-y-4 hover:border-emerald-500/30 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#1e2433]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                      <Gamepad2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                        {item.gameName}
                      </h3>
                      <span className="text-[10px] text-slate-400 font-mono">Provably Fair RNG</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleUpdate(item, { isActive: !item.isActive })}
                    className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border transition-all ${
                      item.isActive
                        ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                        : "bg-rose-500/15 border-rose-500/30 text-rose-400"
                    }`}
                  >
                    {item.isActive ? "ONLINE" : "DISABLED"}
                  </button>
                </div>

                {/* Mode Selector */}
                <div className="space-y-1.5 mt-4">
                  <label className="text-[11px] font-mono uppercase text-slate-400">
                    Operational Mode
                  </label>
                  <select
                    value={item.mode}
                    onChange={(e) => handleUpdate(item, { mode: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0e1017] border border-[#1e2433] rounded-xl text-xs font-mono text-white focus:outline-none focus:border-emerald-500/60"
                  >
                    <option value="NORMAL">⚖️ BALANCED (Fair Play / Default RTP)</option>
                    <option value="HIGH_WIN">🟢 USER WIN (High Win / Favor Player)</option>
                    <option value="LOW_WIN">🔴 HOUSE WIN (Low Win / Fast Bust)</option>
                    <option value="JACKPOT">⭐ JACKPOT MODE (Super User Win / Streak)</option>
                    <option value="FORCED_WIN">✨ Forced Exact Multiplier</option>
                  </select>
                </div>

                {/* House Edge & Forced Multiplier */}
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono uppercase text-slate-400">
                      House Edge %
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={item.houseEdgePercent}
                      onChange={(e) =>
                        handleUpdate(item, { houseEdgePercent: parseFloat(e.target.value) || 2.5 })
                      }
                      className="w-full px-3 py-2 bg-[#0e1017] border border-[#1e2433] rounded-xl text-xs font-mono text-white focus:outline-none focus:border-emerald-500/60"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono uppercase text-slate-400">
                      Forced Multiplier
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={item.forcedMultiplier ?? ""}
                      onChange={(e) =>
                        handleUpdate(item, {
                          forcedMultiplier: e.target.value ? parseFloat(e.target.value) : null,
                        })
                      }
                      placeholder="Auto RNG"
                      className="w-full px-3 py-2 bg-[#0e1017] border border-[#1e2433] rounded-xl text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/60"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#1e2433] flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>RTP: {(100 - item.houseEdgePercent).toFixed(1)}%</span>
                <span className="text-emerald-400">● Synchronized</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

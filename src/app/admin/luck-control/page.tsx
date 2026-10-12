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
      if (data.success) {
        setControls((prev) =>
          prev.map((c) => (c.gameName === item.gameName ? { ...c, ...updates } : c))
        );
        setToastMessage(`Updated ${item.gameName} configurations.`);
        setTimeout(() => setToastMessage(null), 3000);
      }
    } catch (err: any) {
      alert("Error updating control: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-wide">
              Luck & Outcome Control Desk
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#131b24] text-[#00e701] border border-[#00e701]/30">
              RTP Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Global game payout modes, platform house edge percentage, and targeted multiplier caps.
          </p>
        </div>

        <button
          onClick={fetchControls}
          disabled={isLoading}
          className="flex items-center gap-2 px-3.5 py-2 bg-[#1f2c3a] hover:bg-[#28384a] text-white text-xs font-semibold rounded-xl border border-[#2d4054] transition-all self-start sm:self-auto shadow"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[#00e701]" : ""}`} />
          <span>Refresh Games</span>
        </button>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-between animate-in fade-in">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-emerald-400/80 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Quick Info Box */}
      <div className="bg-[#131b24] border border-[#212f3d] rounded-2xl p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h2 className="text-sm font-bold text-white">Individual User Luck vs Global Game RTP</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Per-user settings can also be toggled directly in the{" "}
            <Link href="/admin/users" className="text-[#00e701] font-bold hover:underline">
              User Management
            </Link>{" "}
            desk. Below are platform-wide game rules governing algorithms like Mines, Plinko, Crash, and Dice.
          </p>
        </div>
      </div>

      {/* Games Control Table */}
      <div className="bg-[#131b24] border border-[#212f3d] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#17222d] text-slate-400 uppercase text-[10px] font-extrabold tracking-wider border-b border-[#212f3d]">
                <th className="py-3.5 px-4">Game</th>
                <th className="py-3.5 px-4">Payout Mode</th>
                <th className="py-3.5 px-4">House Edge (%)</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Quick Apply</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#212f3d]/60">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#00e701]" />
                    <span>Loading RTP settings...</span>
                  </td>
                </tr>
              ) : (
                controls.map((g) => (
                  <tr key={g.id} className="hover:bg-[#1a2530]/50 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap font-bold text-white flex items-center gap-2">
                      <Gamepad2 className="w-4 h-4 text-slate-400" />
                      <span>{g.gameName}</span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <select
                        value={g.mode}
                        onChange={(e) => handleUpdate(g, { mode: e.target.value })}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                          g.mode === "HIGH_WIN"
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                            : g.mode === "LOW_WIN"
                            ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                            : "bg-[#0a0f14] text-white border-[#263747]"
                        }`}
                      >
                        <option value="NORMAL" className="bg-[#131b24] text-white">Normal (Provably Fair)</option>
                        <option value="HIGH_WIN" className="bg-[#131b24] text-emerald-400">High Win (Promotion Mode)</option>
                        <option value="LOW_WIN" className="bg-[#131b24] text-rose-400">Low Win (House Retain)</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="25"
                          value={g.houseEdgePercent}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val)) handleUpdate(g, { houseEdgePercent: val });
                          }}
                          className="w-20 bg-[#0a0f14] border border-[#263747] rounded-lg px-2 py-1 text-xs text-white font-mono font-bold"
                        />
                        <span className="text-slate-400 font-bold">%</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <button
                        onClick={() => handleUpdate(g, { isActive: !g.isActive })}
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase transition-colors ${
                          g.isActive
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        }`}
                      >
                        {g.isActive ? "Active" : "Disabled"}
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <span className="text-[11px] text-[#00e701] font-semibold">
                        Auto-Saved
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

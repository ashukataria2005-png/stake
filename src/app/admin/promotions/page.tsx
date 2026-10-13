"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Gift,
  Plus,
  Copy,
  Check,
  Calendar,
  Users,
  Percent,
  Coins,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Clock,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

interface PromoCampaign {
  id: string;
  code: string;
  type: "PERCENT" | "FIXED";
  value: number;
  isPublic: boolean;
  maxUses: number;
  usedCount: number;
  duration: string;
  status: "ACTIVE" | "EXPIRED";
  createdAt: string;
}

const INITIAL_PROMOS: PromoCampaign[] = [
  {
    id: "promo-1",
    code: "WELCOME100",
    type: "PERCENT",
    value: 100,
    isPublic: true,
    maxUses: 500,
    usedCount: 142,
    duration: "30 Days",
    status: "ACTIVE",
    createdAt: "2026-10-01",
  },
  {
    id: "promo-2",
    code: "VIPBONUS500",
    type: "FIXED",
    value: 500,
    isPublic: false,
    maxUses: 50,
    usedCount: 38,
    duration: "7 Days",
    status: "ACTIVE",
    createdAt: "2026-10-08",
  },
  {
    id: "promo-3",
    code: "STAKELUCK20",
    type: "PERCENT",
    value: 20,
    isPublic: true,
    maxUses: 1000,
    usedCount: 651,
    duration: "3 Days",
    status: "ACTIVE",
    createdAt: "2026-10-10",
  },
];

export default function AdminPromotionsPage() {
  const [promos, setPromos] = useState<PromoCampaign[]>(INITIAL_PROMOS);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // New Promo Form State
  const [code, setCode] = useState("");
  const [bonusType, setBonusType] = useState<"PERCENT" | "FIXED">("PERCENT");
  const [bonusValue, setBonusValue] = useState("50");
  const [isPublic, setIsPublic] = useState(true);
  const [maxUses, setMaxUses] = useState("100");
  const [duration, setDuration] = useState("7 Days");
  const [isCreating, setIsCreating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleCopy = (codeText: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCode(codeText);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCreatePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    const newPromo: PromoCampaign = {
      id: `promo-${Date.now()}`,
      code: code.trim().toUpperCase(),
      type: bonusType,
      value: parseFloat(bonusValue) || 10,
      isPublic,
      maxUses: parseInt(maxUses) || 100,
      usedCount: 0,
      duration,
      status: "ACTIVE",
      createdAt: new Date().toISOString().split("T")[0],
    };

    setPromos([newPromo, ...promos]);
    setCode("");
    setBonusValue("50");
    setToastMessage(`Promo code "${newPromo.code}" generated successfully!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const togglePromoStatus = (id: string) => {
    setPromos((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, status: p.status === "ACTIVE" ? "EXPIRED" : "ACTIVE" }
          : p
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              Promotions & Bonus Rewards Engine
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-rose-500/15 border border-rose-500/30 text-rose-400 font-mono">
              Reward Generator
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Create coupon drops, deposit match percentages, private VIP vouchers, and manage redemption thresholds.
          </p>
        </div>

        <Link
          href="/admin"
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#131722] hover:bg-[#1c2233] text-slate-200 text-xs font-semibold rounded-xl border border-[#1e2433] transition-all shadow-sm self-start sm:self-auto"
        >
          <span>← Mission Control</span>
        </Link>
      </div>

      {toastMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-rose-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Grid: Creator Form on Left, Active Campaigns List on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ========================================================
            1. PROMO CREATOR FORM (40%)
            ======================================================== */}
        <div className="lg:col-span-5 bg-[#131722] border border-[#1e2433] rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#1e2433]">
            <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Create New Campaign</h2>
              <p className="text-[11px] text-slate-400 font-mono">Configure code & parameters</p>
            </div>
          </div>

          <form onSubmit={handleCreatePromo} className="space-y-4 text-xs">
            {/* Promo Code Input */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">Promo Voucher Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. MEGAWIN100"
                required
                className="w-full px-3.5 py-2.5 bg-[#0e1017] border border-[#1e2433] rounded-xl text-white font-mono uppercase tracking-wider placeholder-slate-600 focus:outline-none focus:border-rose-500/60"
              />
            </div>

            {/* Visibility Pills: Public vs Private */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">Audience Visibility</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsPublic(true)}
                  className={`py-2 px-3 rounded-xl font-bold transition-all border ${
                    isPublic
                      ? "bg-rose-500/20 border-rose-500/40 text-rose-300 shadow-sm"
                      : "bg-[#0e1017] border-[#1e2433] text-slate-400 hover:text-white"
                  }`}
                >
                  🌐 Public Promo
                </button>
                <button
                  type="button"
                  onClick={() => setIsPublic(false)}
                  className={`py-2 px-3 rounded-xl font-bold transition-all border ${
                    !isPublic
                      ? "bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-sm"
                      : "bg-[#0e1017] border-[#1e2433] text-slate-400 hover:text-white"
                  }`}
                >
                  🔒 VIP Private Drop
                </button>
              </div>
            </div>

            {/* Bonus Type & Value */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Bonus Structure</label>
                <select
                  value={bonusType}
                  onChange={(e) => setBonusType(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-[#0e1017] border border-[#1e2433] rounded-xl text-white font-mono focus:outline-none focus:border-rose-500/60"
                >
                  <option value="PERCENT">% Deposit Match</option>
                  <option value="FIXED">₹ Fixed Cash Drop</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Bonus Amount</label>
                <input
                  type="number"
                  value={bonusValue}
                  onChange={(e) => setBonusValue(e.target.value)}
                  placeholder={bonusType === "PERCENT" ? "50%" : "500"}
                  required
                  className="w-full px-3.5 py-2.5 bg-[#0e1017] border border-[#1e2433] rounded-xl text-white font-mono placeholder-slate-600 focus:outline-none focus:border-rose-500/60"
                />
              </div>
            </div>

            {/* Usage Limit & Duration */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Max Redemptions</label>
                <input
                  type="number"
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value)}
                  placeholder="100"
                  required
                  className="w-full px-3.5 py-2.5 bg-[#0e1017] border border-[#1e2433] rounded-xl text-white font-mono placeholder-slate-600 focus:outline-none focus:border-rose-500/60"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Duration Validity</label>
                <div className="flex flex-wrap gap-1">
                  {["24h", "3 Days", "7 Days", "30 Days"].map((dur) => (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => setDuration(dur)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold border transition-all ${
                        duration === dur
                          ? "bg-rose-500/25 border-rose-500/50 text-rose-300"
                          : "bg-[#0e1017] border-[#1e2433] text-slate-400"
                      }`}
                    >
                      {dur}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-rose-500 hover:bg-rose-400 text-white shadow-lg shadow-rose-500/20 transition-all flex items-center justify-center gap-1.5 active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>Launch Promo Campaign</span>
            </button>
          </form>
        </div>

        {/* ========================================================
            2. ACTIVE CAMPAIGNS LIST (60%)
            ======================================================== */}
        <div className="lg:col-span-7 bg-[#131722] border border-[#1e2433] rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1e2433]">
            <div>
              <h2 className="text-sm font-bold text-white">Active Promotional Drops</h2>
              <p className="text-[11px] text-slate-400 font-mono">
                {promos.length} Campaigns Active in Engine
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {promos.map((p) => (
              <div
                key={p.id}
                className="bg-[#0e1017] border border-[#1e2433] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-rose-500/30 transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm text-white tracking-wider bg-[#131722] px-2.5 py-0.5 rounded border border-[#1e2433]">
                      {p.code}
                    </span>
                    <button
                      onClick={() => handleCopy(p.code)}
                      className="text-slate-500 hover:text-white"
                      title="Copy Code"
                    >
                      {copiedCode === p.code ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider ${
                        p.isPublic
                          ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                          : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      {p.isPublic ? "Public" : "VIP Only"}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                    <span className="text-rose-400 font-bold">
                      {p.type === "PERCENT" ? `${p.value}% Match` : `₹${p.value} Bonus`}
                    </span>
                    <span>•</span>
                    <span>
                      {p.usedCount} / {p.maxUses} Claimed
                    </span>
                    <span>•</span>
                    <span>{p.duration}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => togglePromoStatus(p.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
                      p.status === "ACTIVE"
                        ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                        : "bg-slate-800 text-slate-500 border-slate-700"
                    }`}
                  >
                    {p.status === "ACTIVE" ? "Active" : "Expired"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
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
  TrendingUp,
  Tag,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

interface PromoCampaign {
  id: string;
  code: string;
  discountPercent: number;
  maxDepositLimit: number;
  bonusType: "PERCENT" | "FIXED";
  bonusValue: number;
  isPublic: boolean;
  maxUses: number;
  usedCount: number;
  duration: string;
  status: "ACTIVE" | "EXPIRED";
  createdAt: string;
}

export default function AdminPromotionsPage() {
  const [promos, setPromos] = useState<PromoCampaign[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // New Promo Form State
  const [code, setCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState("10");
  const [maxDepositLimit, setMaxDepositLimit] = useState("5000");
  const [bonusType, setBonusType] = useState<"PERCENT" | "FIXED">("PERCENT");
  const [isPublic, setIsPublic] = useState(true);
  const [maxUses, setMaxUses] = useState("500");
  const [duration, setDuration] = useState("7 Days");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load promos from API
  const fetchPromos = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/promotions");
      const data = await res.json();
      if (data.success && Array.isArray(data.promos)) {
        setPromos(data.promos);
      }
    } catch (err) {
      console.error("Failed to load promotions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPromos();
  }, []);

  const handleCopy = (codeText: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCode(codeText);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          discountPercent: parseFloat(discountPercent) || 10,
          maxDepositLimit: parseFloat(maxDepositLimit) || 5000,
          bonusType,
          bonusValue: parseFloat(discountPercent) || 10,
          isPublic,
          maxUses: parseInt(maxUses) || 500,
          duration,
          status: "ACTIVE",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create promo code");
      }

      setToastMessage(`Promo code "${code.trim().toUpperCase()}" created successfully!`);
      setCode("");
      setDiscountPercent("10");
      setMaxDepositLimit("5000");
      await fetchPromos();
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to create promo code");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePromo = async (id: string) => {
    try {
      const res = await fetch("/api/promotions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        setPromos((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, status: p.status === "ACTIVE" ? "EXPIRED" : "ACTIVE" } : p
          )
        );
      }
    } catch (err) {
      console.error("Failed to toggle promo status:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              Promotions & Deposit Discount Engine
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-amber-500/15 border border-amber-500/30 text-amber-400 font-mono">
              Discount Matrix
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Generate deposit discount vouchers (e.g. 10% OFF on deposit), configure maximum deposit caps, and control player redemption thresholds.
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
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Grid: Creator Form on Left, Active Campaigns List on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ========================================================
            1. PROMO CREATOR FORM (5 cols)
            ======================================================== */}
        <div className="lg:col-span-5 bg-[#131722] border border-[#1e2433] rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#1e2433]">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Create Promo Campaign</h2>
              <p className="text-[11px] text-slate-400 font-mono">Set Discount % & Max Deposit Cap</p>
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
                placeholder="e.g. WELCOME10, STAKE20"
                required
                className="w-full px-3.5 py-2.5 bg-[#0e1017] border border-[#1e2433] rounded-xl text-white font-mono uppercase tracking-wider placeholder-slate-600 focus:outline-none focus:border-amber-500/60"
              />
            </div>

            {/* Discount Percentage & Max Deposit Cap */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium flex items-center gap-1">
                  <Percent className="w-3.5 h-3.5 text-amber-400" />
                  <span>Discount Percentage (%)</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    step="1"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                    placeholder="10"
                    required
                    className="w-full pl-3.5 pr-8 py-2.5 bg-[#0e1017] border border-[#1e2433] rounded-xl text-white font-mono placeholder-slate-600 focus:outline-none focus:border-amber-500/60"
                  />
                  <span className="absolute right-3 top-2.5 text-slate-400 font-bold">%</span>
                </div>
                <span className="text-[10px] text-slate-500">e.g. 10% off user deposit</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Max Deposit Limit (₹)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    min="100"
                    step="100"
                    value={maxDepositLimit}
                    onChange={(e) => setMaxDepositLimit(e.target.value)}
                    placeholder="5000"
                    required
                    className="w-full pl-7 pr-3 py-2.5 bg-[#0e1017] border border-[#1e2433] rounded-xl text-white font-mono placeholder-slate-600 focus:outline-none focus:border-amber-500/60"
                  />
                </div>
                <span className="text-[10px] text-slate-500">Cap amount (e.g. ₹5,000 max)</span>
              </div>
            </div>

            {/* Explanatory Calculation Card */}
            <div className="bg-[#0e1017] border border-[#1e2433] rounded-xl p-3 space-y-1.5">
              <div className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Player Checkout Calculation Preview:</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed font-mono">
                • If player deposits ₹1,000 with {discountPercent || "10"}% Discount:
                <br />
                <span className="text-emerald-400 font-bold">
                  → Player Pays: ₹{Math.max(0, 1000 - Math.round(1000 * ((parseFloat(discountPercent) || 10) / 100)))}
                </span>
                <br />
                <span className="text-cyan-400 font-bold">
                  → Wallet Credited: Full ₹1,000
                </span>
                <br />
                <span className="text-slate-400 text-[10px]">
                  (Discount applicable up to ₹{Number(maxDepositLimit || 5000).toLocaleString("en-IN")})
                </span>
              </p>
            </div>

            {/* Visibility Pills: Public vs VIP */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">Audience Visibility</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsPublic(true)}
                  className={`py-2 px-3 rounded-xl font-bold transition-all border ${
                    isPublic
                      ? "bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-sm"
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
                      ? "bg-violet-500/20 border-violet-500/40 text-violet-300 shadow-sm"
                      : "bg-[#0e1017] border-[#1e2433] text-slate-400 hover:text-white"
                  }`}
                >
                  🔒 VIP Private Drop
                </button>
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
                  placeholder="500"
                  required
                  className="w-full px-3.5 py-2.5 bg-[#0e1017] border border-[#1e2433] rounded-xl text-white font-mono placeholder-slate-600 focus:outline-none focus:border-amber-500/60"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Duration</label>
                <div className="flex flex-wrap gap-1">
                  {["24h", "3 Days", "7 Days", "30 Days"].map((dur) => (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => setDuration(dur)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold border transition-all ${
                        duration === dur
                          ? "bg-amber-500/25 border-amber-500/50 text-amber-300"
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
              disabled={isSubmitting}
              className="w-full mt-2 py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5 active:scale-98 disabled:opacity-50"
            >
              {isSubmitting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              <span>Launch Promo Campaign</span>
            </button>
          </form>
        </div>

        {/* ========================================================
            2. ACTIVE CAMPAIGNS LIST (7 cols)
            ======================================================== */}
        <div className="lg:col-span-7 bg-[#131722] border border-[#1e2433] rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1e2433]">
            <div>
              <h2 className="text-sm font-bold text-white">Active Promotional Discounts</h2>
              <p className="text-[11px] text-slate-400 font-mono">
                {promos.length} Campaigns Registered in Engine
              </p>
            </div>
            <button
              onClick={fetchPromos}
              className="p-1.5 rounded-lg bg-[#0e1017] text-slate-400 hover:text-white border border-[#1e2433]"
              title="Refresh Campaigns"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>

          <div className="space-y-3">
            {isLoading && promos.length === 0 ? (
              <div className="py-12 text-center text-slate-400 font-mono text-xs">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-amber-400" />
                Loading promo campaigns...
              </div>
            ) : promos.length === 0 ? (
              <div className="py-12 text-center text-slate-500 font-mono text-xs">
                No active promotional campaigns found. Create one using the form on the left.
              </div>
            ) : (
              promos.map((p) => (
                <div
                  key={p.id}
                  className="bg-[#0e1017] border border-[#1e2433] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-amber-500/30 transition-all"
                >
                  <div className="space-y-1.5">
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
                            : "bg-violet-500/15 text-violet-300 border border-violet-500/30"
                        }`}
                      >
                        {p.isPublic ? "Public" : "VIP Only"}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400 font-mono">
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <Percent className="w-3 h-3" />
                        {p.discountPercent || p.bonusValue}% Deposit Discount
                      </span>
                      <span>•</span>
                      <span className="text-amber-400 font-bold">
                        Max Cap: ₹{Number(p.maxDepositLimit || 5000).toLocaleString("en-IN")}
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
                      onClick={() => handleTogglePromo(p.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
                        p.status === "ACTIVE"
                          ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25"
                          : "bg-slate-800 text-slate-500 border-slate-700 hover:bg-slate-700"
                      }`}
                    >
                      {p.status === "ACTIVE" ? "Active" : "Expired"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

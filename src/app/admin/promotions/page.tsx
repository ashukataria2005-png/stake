"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Gift,
  Plus,
  Copy,
  Check,
  Percent,
  Coins,
  RefreshCw,
  Trash2,
  Edit2,
  X,
  CheckSquare,
  Square,
  AlertCircle,
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

  // Multi-select for bulk delete
  const [selectedPromoIds, setSelectedPromoIds] = useState<string[]>([]);

  // New Promo Form State
  const [code, setCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState("10");
  const [maxDepositLimit, setMaxDepositLimit] = useState("5000");
  const [isPublic, setIsPublic] = useState(true);
  const [maxUses, setMaxUses] = useState("500");
  const [duration, setDuration] = useState("7 Days");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Promo Modal State
  const [editingPromo, setEditingPromo] = useState<PromoCampaign | null>(null);
  const [editDiscountPercent, setEditDiscountPercent] = useState("10");
  const [editMaxDepositLimit, setEditMaxDepositLimit] = useState("5000");
  const [editMaxUses, setEditMaxUses] = useState("500");
  const [isUpdatingPromo, setIsUpdatingPromo] = useState(false);

  // Toast / Error Notifications
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
          bonusType: "PERCENT",
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

      setToastMessage(`Promo code "${code.trim().toUpperCase()}" created!`);
      setCode("");
      setDiscountPercent("10");
      setMaxDepositLimit("5000");
      await fetchPromos();
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to create promo code");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSingle = async (id: string) => {
    if (!confirm("Are you sure you want to delete this promo code?")) return;
    try {
      const res = await fetch("/api/promotions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to delete");

      setPromos((prev) => prev.filter((p) => p.id !== id));
      setSelectedPromoIds((prev) => prev.filter((x) => x !== id));
      setToastMessage("Promo code deleted.");
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err: any) {
      alert("Delete failed: " + err.message);
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedPromoIds.length) return;
    if (!confirm(`Delete ${selectedPromoIds.length} selected promo code(s)?`)) return;
    try {
      const res = await fetch("/api/promotions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedPromoIds }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Bulk delete failed");

      setPromos((prev) => prev.filter((p) => !selectedPromoIds.includes(p.id)));
      setSelectedPromoIds([]);
      setToastMessage("Selected promo codes deleted.");
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err: any) {
      alert("Bulk delete error: " + err.message);
    }
  };

  const openEditModal = (p: PromoCampaign) => {
    setEditingPromo(p);
    setEditDiscountPercent((p.discountPercent || 10).toString());
    setEditMaxDepositLimit((p.maxDepositLimit || 5000).toString());
    setEditMaxUses((p.maxUses || 500).toString());
  };

  const handleUpdatePromoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPromo) return;

    setIsUpdatingPromo(true);
    try {
      const res = await fetch("/api/promotions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingPromo.id,
          discountPercent: parseFloat(editDiscountPercent) || 10,
          maxDepositLimit: parseFloat(editMaxDepositLimit) || 5000,
          maxUses: parseInt(editMaxUses) || 500,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to update promo");

      setPromos((prev) =>
        prev.map((p) => (p.id === editingPromo.id ? { ...p, ...data.promo } : p))
      );
      setToastMessage(`Updated promo ${editingPromo.code}`);
      setEditingPromo(null);
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err: any) {
      alert("Update failed: " + err.message);
    } finally {
      setIsUpdatingPromo(false);
    }
  };

  const toggleSelectPromo = (id: string) => {
    setSelectedPromoIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedPromoIds.length === promos.length) {
      setSelectedPromoIds([]);
    } else {
      setSelectedPromoIds(promos.map((p) => p.id));
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Header (Clean, direct) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
            Promotions & Promo Code Manager
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure deposit discount codes, redemption caps, and bulk-manage active platform vouchers.
          </p>
        </div>

        <button
          onClick={fetchPromos}
          disabled={isLoading}
          className="flex items-center gap-2 px-3.5 py-2 bg-[#131722] hover:bg-[#1c2233] text-slate-200 text-xs font-semibold rounded-xl border border-[#1e2433] transition-all shadow-sm self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Grid: Creator Form on Left, Active Campaigns on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Creator Form (5 cols) */}
        <div className="lg:col-span-5 bg-[#131722] border border-[#1e2433] rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#1e2433]">
            <Gift className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white">Create Promo Code</h2>
          </div>

          <form onSubmit={handleCreatePromo} className="space-y-3.5 text-xs">
            {/* Promo Code Input */}
            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Promo Voucher Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. WELCOME10, STAKE20"
                required
                className="w-full px-3 py-2 bg-[#0e1017] border border-[#1e2433] rounded-xl text-white font-mono uppercase tracking-wider placeholder-slate-600 focus:outline-none focus:border-amber-500/60"
              />
            </div>

            {/* Discount Percentage & Max Deposit Cap */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium flex items-center gap-1">
                  <Percent className="w-3.5 h-3.5 text-amber-400" />
                  <span>Discount (%)</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  step="1"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  placeholder="10"
                  required
                  className="w-full px-3 py-2 bg-[#0e1017] border border-[#1e2433] rounded-xl text-white font-mono placeholder-slate-600 focus:outline-none focus:border-amber-500/60"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Max Deposit Cap (₹)</span>
                </label>
                <input
                  type="number"
                  min="100"
                  step="100"
                  value={maxDepositLimit}
                  onChange={(e) => setMaxDepositLimit(e.target.value)}
                  placeholder="5000"
                  required
                  className="w-full px-3 py-2 bg-[#0e1017] border border-[#1e2433] rounded-xl text-white font-mono placeholder-slate-600 focus:outline-none focus:border-amber-500/60"
                />
              </div>
            </div>

            {/* Usage Limit & Duration */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Max Redemptions</label>
                <input
                  type="number"
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value)}
                  placeholder="500"
                  required
                  className="w-full px-3 py-2 bg-[#0e1017] border border-[#1e2433] rounded-xl text-white font-mono placeholder-slate-600 focus:outline-none focus:border-amber-500/60"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Audience</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsPublic(true)}
                    className={`py-1.5 rounded-lg text-xs font-semibold border ${
                      isPublic ? "bg-amber-500/20 text-amber-300 border-amber-500/40" : "bg-[#0e1017] border-[#1e2433] text-slate-400"
                    }`}
                  >
                    Public
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPublic(false)}
                    className={`py-1.5 rounded-lg text-xs font-semibold border ${
                      !isPublic ? "bg-purple-500/20 text-purple-300 border-purple-500/40" : "bg-[#0e1017] border-[#1e2433] text-slate-400"
                    }`}
                  >
                    VIP
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5 active:scale-98 disabled:opacity-50"
            >
              {isSubmitting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              <span>Create Promo Code</span>
            </button>
          </form>
        </div>

        {/* Active Campaigns List (7 cols) */}
        <div className="lg:col-span-7 bg-[#131722] border border-[#1e2433] rounded-2xl p-5 shadow-xl space-y-3.5">
          <div className="flex items-center justify-between pb-3 border-b border-[#1e2433]">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleSelectAll}
                className="text-slate-400 hover:text-white"
                title="Select All"
              >
                {selectedPromoIds.length > 0 && selectedPromoIds.length === promos.length ? (
                  <CheckSquare className="w-4 h-4 text-amber-400" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
              </button>
              <h2 className="text-sm font-bold text-white">Active Promo Codes ({promos.length})</h2>
            </div>

            {selectedPromoIds.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/40 text-xs font-bold flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Selected ({selectedPromoIds.length})</span>
              </button>
            )}
          </div>

          <div className="space-y-2.5">
            {isLoading && promos.length === 0 ? (
              <div className="py-12 text-center text-slate-400 font-mono text-xs">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-amber-400" />
                Loading promo campaigns...
              </div>
            ) : promos.length === 0 ? (
              <div className="py-12 text-center text-slate-500 font-mono text-xs">
                No active promotional codes found.
              </div>
            ) : (
              promos.map((p) => {
                const isSelected = selectedPromoIds.includes(p.id);
                return (
                  <div
                    key={p.id}
                    className={`bg-[#0e1017] border rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                      isSelected ? "border-amber-500/50 bg-[#161a24]" : "border-[#1e2433] hover:border-amber-500/30"
                    }`}
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      <button
                        onClick={() => toggleSelectPromo(p.id)}
                        className="text-slate-400 hover:text-white mt-0.5 sm:mt-0"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-amber-400" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-white bg-[#131722] px-2 py-0.5 rounded border border-[#1e2433]">
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
                          <span className="text-[10px] text-amber-400 font-bold font-mono">
                            {p.discountPercent}% OFF
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 font-mono">
                          <span>Cap: ₹{Number(p.maxDepositLimit || 5000).toLocaleString("en-IN")}</span>
                          <span>•</span>
                          <span>{p.usedCount}/{p.maxUses} used</span>
                          <span>•</span>
                          <span>{p.duration}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1.5 rounded-lg bg-[#131722] hover:bg-[#1a2030] text-slate-300 border border-[#1e2433]"
                        title="Edit Promo"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteSingle(p.id)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        title="Delete Promo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* EDIT PROMO MODAL */}
      {editingPromo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#131722] border border-[#1e2433] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1e2433]">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Edit Promo: {editingPromo.code}</h3>
              </div>
              <button
                onClick={() => setEditingPromo(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdatePromoSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Discount Percentage (%)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={editDiscountPercent}
                  onChange={(e) => setEditDiscountPercent(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-[#0e1017] border border-[#1e2433] rounded-xl text-white font-mono focus:outline-none focus:border-amber-500/60"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Max Deposit Limit Cap (₹)</label>
                <input
                  type="number"
                  min="100"
                  step="100"
                  value={editMaxDepositLimit}
                  onChange={(e) => setEditMaxDepositLimit(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-[#0e1017] border border-[#1e2433] rounded-xl text-white font-mono focus:outline-none focus:border-amber-500/60"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Max Allowed Redemptions</label>
                <input
                  type="number"
                  value={editMaxUses}
                  onChange={(e) => setEditMaxUses(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-[#0e1017] border border-[#1e2433] rounded-xl text-white font-mono focus:outline-none focus:border-amber-500/60"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingPromo(null)}
                  disabled={isUpdatingPromo}
                  className="flex-1 py-2 rounded-xl bg-[#0e1017] text-slate-300 border border-[#1e2433]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingPromo}
                  className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold"
                >
                  {isUpdatingPromo ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

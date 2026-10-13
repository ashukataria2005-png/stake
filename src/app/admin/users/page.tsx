"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Wallet,
  Coins,
  Sliders,
  RefreshCw,
  PlusCircle,
  MinusCircle,
  X,
  Check,
  AlertCircle,
  Sparkles,
  ShieldAlert,
} from "lucide-react";

interface UserRow {
  id: string;
  username: string;
  email: string | null;
  phone: string | null;
  role: string;
  luckMode: "HIGH_WIN" | "MEDIUM_WIN" | "LOW_WIN" | "NO_CONTROL";
  walletBalance: number;
  currency: string;
  totalDeposited: number;
  totalWithdrawn: number;
  transactionsCount: number;
  betsCount: number;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Balance Update Modal State
  const [selectedUserForBalance, setSelectedUserForBalance] = useState<UserRow | null>(null);
  const [balanceAmount, setBalanceAmount] = useState<string>("1000");
  const [balanceMode, setBalanceMode] = useState<"ADD" | "DEDUCT">("ADD");
  const [balanceRemarks, setBalanceRemarks] = useState<string>("Admin manual wallet adjustment");
  const [isUpdatingBalance, setIsUpdatingBalance] = useState<boolean>(false);

  // Feedback Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append("search", searchQuery.trim());

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load users");
      }
      setUsers(data.users || []);
    } catch (err: any) {
      console.error("Fetch users error:", err);
      setError(err.message || "Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle Luck Mode Toggle
  const handleLuckModeChange = async (userId: string, newMode: string) => {
    try {
      const res = await fetch("/api/admin/users/luck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, luckMode: newMode }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update luck mode");
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, luckMode: newMode as any } : u))
      );
      setToastMessage(`Luck Mode set to ${newMode} for user`);
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err: any) {
      alert("Error changing luck mode: " + err.message);
    }
  };

  // Handle Balance Submit
  const handleBalanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForBalance) return;

    const numAmount = parseFloat(balanceAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert("Please enter a valid positive amount.");
      return;
    }

    setIsUpdatingBalance(true);
    try {
      const res = await fetch("/api/admin/users/balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUserForBalance.id,
          amount: numAmount,
          mode: balanceMode,
          remarks: balanceRemarks.trim() || "Admin direct adjustment",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update wallet balance");
      }

      setToastMessage(
        `Wallet updated! ${balanceMode === "ADD" ? "+" : "-"}₹${numAmount} for @${selectedUserForBalance.username}`
      );
      setTimeout(() => setToastMessage(null), 4000);

      setSelectedUserForBalance(null);
      await fetchUsers();
    } catch (err: any) {
      alert("Error updating balance: " + err.message);
    } finally {
      setIsUpdatingBalance(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              User Directory & Wallet Desk
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 font-mono">
              Directory Hub
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Player roster, instant wallet balance adjustments (+/- INR), and per-user Luck algorithm control.
          </p>
        </div>

        <button
          onClick={() => fetchUsers()}
          disabled={isLoading}
          className="flex items-center gap-2 px-3.5 py-2 bg-[#131722] hover:bg-[#1c2233] text-slate-200 text-xs font-semibold rounded-xl border border-[#1e2433] transition-all shadow-sm self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh Directory</span>
        </button>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs sm:text-sm font-semibold flex items-center gap-2.5 animate-in fade-in shadow-lg">
          <Check className="w-4 h-4 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="bg-[#131722] border border-[#1e2433] rounded-2xl p-4 shadow-md flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Username, Phone, Email or Cust ID..."
            className="w-full pl-10 pr-4 py-2 bg-[#0e1017] border border-[#1e2433] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 font-mono"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span>Total Players:</span>
          <span className="font-bold text-white bg-[#0e1017] px-2.5 py-1 rounded-lg border border-[#1e2433]">
            {users.length}
          </span>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#131722] border border-[#1e2433] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#0e1017] border-b border-[#1e2433] text-slate-400 font-mono uppercase text-[11px]">
                <th className="py-3 px-4">Player / ID</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4">Role & Status</th>
                <th className="py-3 px-4">Wallet Balance</th>
                <th className="py-3 px-4">Deposited / Withdrawn</th>
                <th className="py-3 px-4">Luck Mode Desk</th>
                <th className="py-3 px-4 text-right">Balance Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2433]">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin text-cyan-400 mx-auto mb-2" />
                    <p className="font-mono text-xs">Loading player roster...</p>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-mono">
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#181d2b]/60 transition-colors">
                    {/* Player / ID */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-[#0e1017] border border-[#1e2433] flex items-center justify-center text-slate-300 font-bold text-xs uppercase">
                          {u.username.slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-bold text-white text-xs">{u.username}</div>
                          <div className="text-[10px] text-slate-500">#{u.id.slice(-6)}</div>
                        </div>
                      </div>
                    </td>

                    {/* Contact Info */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="text-slate-200">{u.phone || "No Mobile"}</div>
                      <div className="text-[10px] text-slate-500">{u.email || "No Email"}</div>
                    </td>

                    {/* Role & Status */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                            u.role === "SUPER_ADMIN" || u.role === "ADMIN"
                              ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                              : "bg-slate-700/30 text-slate-300 border border-slate-600/30"
                          }`}
                        >
                          {u.role}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1 font-mono">
                        Joined {new Date(u.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                      </div>
                    </td>

                    {/* Wallet Balance */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="text-sm font-black text-white">
                        ₹{Number(u.walletBalance).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {u.betsCount} bets placed
                      </div>
                    </td>

                    {/* Deposited / Withdrawn */}
                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      <div className="text-emerald-400">
                        +₹{Number(u.totalDeposited).toLocaleString("en-IN")}
                      </div>
                      <div className="text-rose-400">
                        -₹{Number(u.totalWithdrawn).toLocaleString("en-IN")}
                      </div>
                    </td>

                    {/* Luck Mode */}
                    <td className="py-3.5 px-4">
                      <select
                        value={u.luckMode}
                        onChange={(e) => handleLuckModeChange(u.id, e.target.value)}
                        className={`text-xs font-bold rounded-lg px-2.5 py-1.5 border transition-all cursor-pointer font-mono ${
                          u.luckMode === "HIGH_WIN"
                            ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                            : u.luckMode === "MEDIUM_WIN"
                            ? "bg-amber-500/15 border-amber-500/30 text-amber-300"
                            : u.luckMode === "LOW_WIN"
                            ? "bg-rose-500/15 border-rose-500/30 text-rose-300"
                            : "bg-[#0e1017] border-[#1e2433] text-slate-400"
                        }`}
                      >
                        <option value="HIGH_WIN" className="bg-[#131722] text-emerald-400">
                          🟢 USER WIN (High Win)
                        </option>
                        <option value="LOW_WIN" className="bg-[#131722] text-rose-400">
                          🔴 HOUSE WIN (Low Win)
                        </option>
                        <option value="NO_CONTROL" className="bg-[#131722] text-slate-300">
                          ⚖️ BALANCED (Fair Play / Default)
                        </option>
                        <option value="MEDIUM_WIN" className="bg-[#131722] text-amber-400">
                          ⭐ JACKPOT MODE (Super User Win)
                        </option>
                      </select>
                    </td>

                    {/* Balance Edit Button */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedUserForBalance(u)}
                        className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all active:scale-95 shadow-sm"
                      >
                        Adjust Balance
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================
          MODAL: BALANCE ADJUSTMENT (+/- INR WITH REMARKS)
          ======================================================== */}
      {selectedUserForBalance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative max-w-md w-full bg-[#131722] border border-cyan-500/30 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#1e2433]">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Adjust Player Wallet</h3>
                  <p className="text-xs text-slate-400 font-mono">
                    User: @{selectedUserForBalance.username}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserForBalance(null)}
                className="text-slate-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#0e1017] p-3.5 rounded-xl border border-[#1e2433] flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400">Current Balance:</span>
              <span className="font-black text-white text-sm">
                ₹{Number(selectedUserForBalance.walletBalance).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>

            <form onSubmit={handleBalanceSubmit} className="space-y-4">
              {/* Mode Toggle: Add or Deduct */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setBalanceMode("ADD")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 ${
                    balanceMode === "ADD"
                      ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-sm"
                      : "bg-[#0e1017] border-[#1e2433] text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Credit (+) Add</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBalanceMode("DEDUCT")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 ${
                    balanceMode === "DEDUCT"
                      ? "bg-rose-500/20 border-rose-500/40 text-rose-300 shadow-sm"
                      : "bg-[#0e1017] border-[#1e2433] text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <MinusCircle className="w-4 h-4" />
                  <span>Debit (-) Deduct</span>
                </button>
              </div>

              {/* Amount Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Adjustment Amount (INR)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-mono">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="any"
                    value={balanceAmount}
                    onChange={(e) => setBalanceAmount(e.target.value)}
                    placeholder="1000"
                    required
                    className="w-full pl-8 pr-4 py-2.5 bg-[#0e1017] border border-[#1e2433] rounded-xl text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/60"
                  />
                </div>
              </div>

              {/* Remarks */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Audit Remarks / Reason
                </label>
                <input
                  type="text"
                  value={balanceRemarks}
                  onChange={(e) => setBalanceRemarks(e.target.value)}
                  placeholder="e.g. Compensation, Deposit UTR manual clearance..."
                  required
                  className="w-full px-3.5 py-2.5 bg-[#0e1017] border border-[#1e2433] rounded-xl text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/60"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedUserForBalance(null)}
                  disabled={isUpdatingBalance}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-[#0e1017] hover:bg-[#1a2030] text-slate-300 border border-[#1e2433] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingBalance}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-black shadow-lg transition-all flex items-center justify-center gap-1.5 ${
                    balanceMode === "ADD"
                      ? "bg-emerald-400 hover:bg-emerald-300 shadow-emerald-500/20"
                      : "bg-rose-400 hover:bg-rose-300 shadow-rose-500/20"
                  }`}
                >
                  {isUpdatingBalance ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <span>
                      Confirm {balanceMode === "ADD" ? "Credit" : "Debit"}
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

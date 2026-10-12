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
  ExternalLink,
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

  // Balance Update Modal State (replicates updatewalbalNow.php modal)
  const [selectedUserForBalance, setSelectedUserForBalance] = useState<UserRow | null>(null);
  const [balanceAmount, setBalanceAmount] = useState<string>("");
  const [balanceMode, setBalanceMode] = useState<"ADD" | "DEDUCT">("ADD");
  const [balanceRemarks, setBalanceRemarks] = useState<string>("");
  const [isUpdatingBalance, setIsUpdatingBalance] = useState<false | boolean>(false);

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
      setToastMessage(`Luck mode updated to ${newMode}`);
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err: any) {
      alert("Error changing luck mode: " + err.message);
    }
  };

  // Handle Balance Submit (replicates updatewalbalNow.php action)
  const handleBalanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForBalance) return;
    const num = parseFloat(balanceAmount);
    if (isNaN(num) || num <= 0) {
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
          amount: num,
          mode: balanceMode,
          remarks: balanceRemarks.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Balance update failed");
      }

      setToastMessage(data.message || "Wallet updated successfully!");
      setTimeout(() => setToastMessage(null), 4000);

      // Close modal & refresh
      setSelectedUserForBalance(null);
      setBalanceAmount("");
      setBalanceRemarks("");
      await fetchUsers();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsUpdatingBalance(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Manage User (manage_user.php)
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Player ledger from Neon PostgreSQL. Direct manual balance adjustments and per-user luck controls.
          </p>
        </div>

        <button
          onClick={() => fetchUsers()}
          disabled={isLoading}
          className="flex items-center gap-2 px-3.5 py-2 bg-[#1f2124] hover:bg-[#282b30] text-slate-200 text-xs font-semibold rounded border border-[#333] transition-colors self-start sm:self-auto shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[#007bff]" : ""}`} />
          <span>Refresh Users</span>
        </button>
      </div>

      {/* Toast Banner */}
      {toastMessage && (
        <div className="p-3.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-400/80 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-[#131414] border border-[#23272b] rounded-lg p-4">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users by Mobile, Username, Cust ID, or Email..."
            className="w-full bg-[#0c0d0e] border border-[#2e3338] rounded px-4 py-2 pl-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#007bff] transition-colors"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2 text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Users Table (Replicating manage_user.php) */}
      <div className="bg-[#131414] border border-[#23272b] rounded-lg p-4 shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border border-[#23272b] text-xs">
            <thead>
              <tr className="bg-[#1a1d20] text-slate-300 font-bold border-b border-[#23272b]">
                <th className="py-3 px-3.5 border-r border-[#23272b]">Cust ID</th>
                <th className="py-3 px-3.5 border-r border-[#23272b]">Username</th>
                <th className="py-3 px-3.5 border-r border-[#23272b]">Mobile</th>
                <th className="py-3 px-3.5 border-r border-[#23272b]">Wallet Balance</th>
                <th className="py-3 px-3.5 border-r border-[#23272b]">Recharge (Deposit)</th>
                <th className="py-3 px-3.5 border-r border-[#23272b]">Luck Mode (RTP)</th>
                <th className="py-3 px-3.5 border-r border-[#23272b]">Reg. Date</th>
                <th className="py-3 px-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#23272b] text-slate-300">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#007bff]" />
                    <span>Loading player accounts from Neon DB...</span>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-rose-400">
                    {error}
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const regDate = new Date(u.createdAt).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });

                  return (
                    <tr key={u.id} className="hover:bg-[#1a1c1e] transition-colors">
                      {/* Cust ID */}
                      <td className="py-3 px-3.5 border-r border-[#23272b] font-mono text-[11px] text-slate-400">
                        {u.id.slice(-6)}
                      </td>

                      {/* Username */}
                      <td className="py-3 px-3.5 border-r border-[#23272b] font-bold text-white">
                        @{u.username}
                      </td>

                      {/* Mobile */}
                      <td className="py-3 px-3.5 border-r border-[#23272b]">
                        <span className="text-white font-medium">{u.phone || "—"}</span>
                      </td>

                      {/* Wallet Balance */}
                      <td className="py-3 px-3.5 border-r border-[#23272b] font-bold text-amber-300">
                        ₹{u.walletBalance.toLocaleString()}
                      </td>

                      {/* Recharge */}
                      <td className="py-3 px-3.5 border-r border-[#23272b] text-emerald-400 font-bold">
                        ₹{u.totalDeposited.toLocaleString()}
                      </td>

                      {/* Luck Controller Selector */}
                      <td className="py-3 px-3.5 border-r border-[#23272b]">
                        <select
                          value={u.luckMode}
                          onChange={(e) => handleLuckModeChange(u.id, e.target.value)}
                          className="px-2 py-1 rounded text-xs font-bold bg-[#0c0d0e] border border-[#2e3338] text-white"
                        >
                          <option value="NO_CONTROL">Default (No Control)</option>
                          <option value="HIGH_WIN">High Win (Lucky)</option>
                          <option value="MEDIUM_WIN">Medium Win</option>
                          <option value="LOW_WIN">Low Win (House)</option>
                        </select>
                      </td>

                      {/* Reg Date */}
                      <td className="py-3 px-3.5 border-r border-[#23272b] text-slate-400 text-[11px]">
                        {regDate}
                      </td>

                      {/* Action: Change Amount button matching manage_user.php */}
                      <td className="py-3 px-3.5 text-center">
                        <button
                          onClick={() => {
                            setSelectedUserForBalance(u);
                            setBalanceAmount("");
                            setBalanceMode("ADD");
                            setBalanceRemarks("");
                          }}
                          className="px-3 py-1 rounded bg-[#007bff] hover:bg-[#0056b3] text-white font-bold text-[11px] transition-colors shadow-sm"
                        >
                          Change Amount
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DIRECT BALANCE EDITOR MODAL (Replicating updatewalbalNow.php modal) */}
      {selectedUserForBalance && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => !isUpdatingBalance && setSelectedUserForBalance(null)}
        >
          <div
            className="w-full max-w-md bg-[#131b24] border border-[#212f3d] rounded-2xl p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#212f3d] mb-4">
              <div>
                <h3 className="text-base font-bold text-white">
                  Change Wallet Balance
                </h3>
                <p className="text-xs text-slate-400">
                  Player: <span className="text-white font-bold">@{selectedUserForBalance.username}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedUserForBalance(null)}
                className="w-8 h-8 rounded-lg bg-[#1f2b38] hover:text-white text-slate-400 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBalanceSubmit} className="space-y-4">
              {/* Current Balance Summary */}
              <div className="p-3 bg-[#0a0f14] rounded-xl border border-[#212f3d] flex items-center justify-between text-xs">
                <span className="text-slate-400">Current Wallet Balance:</span>
                <span className="text-amber-300 font-bold text-sm">
                  ₹{selectedUserForBalance.walletBalance.toLocaleString()} {selectedUserForBalance.currency}
                </span>
              </div>

              {/* Action Mode Toggle */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Action Mode:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBalanceMode("ADD")}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      balanceMode === "ADD"
                        ? "bg-[#00e701] text-black border-[#00e701] font-black"
                        : "bg-[#0a0f14] text-slate-400 border-[#263747]"
                    }`}
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Credit (Add Funds)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBalanceMode("DEDUCT")}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      balanceMode === "DEDUCT"
                        ? "bg-rose-600 text-white border-rose-600 font-black"
                        : "bg-[#0a0f14] text-slate-400 border-[#263747]"
                    }`}
                  >
                    <MinusCircle className="w-3.5 h-3.5" />
                    <span>Debit (Deduct Funds)</span>
                  </button>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Amount (₹):</label>
                <input
                  type="number"
                  step="any"
                  min="1"
                  required
                  value={balanceAmount}
                  onChange={(e) => setBalanceAmount(e.target.value)}
                  placeholder="Enter amount to modify..."
                  className="w-full bg-[#0a0f14] border border-[#263747] rounded-xl px-4 py-2.5 text-sm text-white font-bold placeholder-slate-500 focus:outline-none focus:border-[#00e701]"
                />
              </div>

              {/* Remarks / Reason Input */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Remarks / Reason (Optional):
                </label>
                <textarea
                  rows={2}
                  value={balanceRemarks}
                  onChange={(e) => setBalanceRemarks(e.target.value)}
                  placeholder="e.g. VIP cashback, Manual deposit credit, Bonus correction..."
                  className="w-full bg-[#0a0f14] border border-[#263747] rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00e701]"
                />
              </div>

              {/* Preview calculation */}
              {balanceAmount && !isNaN(parseFloat(balanceAmount)) && (
                <div className="p-3 bg-[#17222d] rounded-xl border border-[#263747] flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-400">New Balance After:</span>
                  <span className={balanceMode === "ADD" ? "text-[#00e701]" : "text-rose-400"}>
                    ₹
                    {(
                      selectedUserForBalance.walletBalance +
                      (balanceMode === "ADD" ? parseFloat(balanceAmount) : -parseFloat(balanceAmount))
                    ).toLocaleString()}
                  </span>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedUserForBalance(null)}
                  disabled={isUpdatingBalance}
                  className="flex-1 py-2.5 rounded-xl bg-[#1f2b38] hover:bg-[#28384a] text-slate-300 hover:text-white font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingBalance}
                  className={`flex-1 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg ${
                    balanceMode === "ADD"
                      ? "bg-[#00e701] hover:bg-[#00c701] text-black"
                      : "bg-rose-600 hover:bg-rose-700 text-white"
                  }`}
                >
                  {isUpdatingBalance ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
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

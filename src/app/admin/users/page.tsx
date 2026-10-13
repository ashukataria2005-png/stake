"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Users,
  Search,
  Wallet,
  RefreshCw,
  PlusCircle,
  MinusCircle,
  X,
  Check,
  AlertCircle,
  Sliders,
  Trash2,
  Eye,
  ShieldCheck,
  Zap,
  TrendingUp,
  TrendingDown,
  Filter,
  CheckSquare,
  Square,
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
  netPL: number;
  winRate: number;
  lastActive: string;
  transactionsCount: number;
  betsCount: number;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Dropdown 1: Category Filter
  const [categoryFilter, setCategoryFilter] = useState<"ALL" | "ACTIVE" | "HIGH_ROLLERS" | "BANNED">("ALL");

  // Dropdown 2: Luck Filter & Bulk Assign
  const [luckFilter, setLuckFilter] = useState<"ALL" | "HIGH_WIN" | "MEDIUM_WIN" | "LOW_WIN" | "NO_CONTROL">("ALL");

  // Multi-select for bulk luck assign
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // Dossier Modal State
  const [dossierUser, setDossierUser] = useState<UserRow | null>(null);

  // Delete User State
  const [userToDelete, setUserToDelete] = useState<UserRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  // Handle single Luck Mode change
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
      if (dossierUser?.id === userId) {
        setDossierUser((prev) => prev ? { ...prev, luckMode: newMode as any } : null);
      }
      setToastMessage(`Luck Mode updated to ${newMode}`);
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err: any) {
      alert("Error changing luck mode: " + err.message);
    }
  };

  // Handle Bulk Luck Mode change
  const handleBulkLuckAssign = async (targetMode: string) => {
    if (!selectedUserIds.length) {
      alert("Please select at least one user from the list.");
      return;
    }
    try {
      const res = await fetch("/api/admin/users/luck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds: selectedUserIds, luckMode: targetMode }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to bulk update luck mode");
      }

      setUsers((prev) =>
        prev.map((u) => (selectedUserIds.includes(u.id) ? { ...u, luckMode: targetMode as any } : u))
      );
      setToastMessage(`Applied ${targetMode} to ${selectedUserIds.length} user(s)`);
      setSelectedUserIds([]);
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err: any) {
      alert("Error in bulk assign: " + err.message);
    }
  };

  // Handle Delete User
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch("/api/admin/users/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userToDelete.id }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete user");
      }

      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      if (dossierUser?.id === userToDelete.id) {
        setDossierUser(null);
      }
      setUserToDelete(null);
      setToastMessage(`User @${userToDelete.username} deleted from database.`);
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err: any) {
      alert("Delete failed: " + err.message);
    } finally {
      setIsDeleting(false);
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

  // Filter users based on category and luck mode
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Category filter
      if (categoryFilter === "ACTIVE" && u.betsCount === 0 && u.transactionsCount === 0) return false;
      if (categoryFilter === "HIGH_ROLLERS" && u.totalDeposited < 50000 && u.walletBalance < 25000) return false;
      if (categoryFilter === "BANNED" && u.role !== "BANNED") return false;

      // Luck mode filter
      if (luckFilter !== "ALL" && u.luckMode !== luckFilter) return false;

      return true;
    });
  }, [users, categoryFilter, luckFilter]);

  const toggleSelectUser = (id: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedUserIds.length === filteredUsers.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredUsers.map((u) => u.id));
    }
  };

  const luckModeBadge = (mode: string) => {
    switch (mode) {
      case "HIGH_WIN":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">User Win</span>;
      case "LOW_WIN":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">House Win</span>;
      case "MEDIUM_WIN":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">Jackpot</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">Balanced</span>;
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
            User Directory & Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Comprehensive player roster, user dossiers, instant wallet edits, and real-time Luck/RTP modes.
          </p>
        </div>

        <button
          onClick={() => fetchUsers()}
          disabled={isLoading}
          className="flex items-center gap-2 px-3.5 py-2 bg-[#131722] hover:bg-[#1c2233] text-slate-200 text-xs font-semibold rounded-xl border border-[#1e2433] transition-all shadow-sm self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs sm:text-sm font-semibold flex items-center gap-2.5 shadow-lg animate-in fade-in">
          <Check className="w-4 h-4 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Search & Two Combined Organized Dropdowns */}
      <div className="bg-[#131722] border border-[#1e2433] rounded-2xl p-4 shadow-md flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Username, Phone, Email or Cust ID..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#0e1017] border border-[#1e2433] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 font-mono"
          />
        </div>

        {/* Dropdown 1: User Details / Category Filter */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            className="bg-[#0e1017] border border-[#1e2433] text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-cyan-500/60 font-medium"
          >
            <option value="ALL">All Users</option>
            <option value="ACTIVE">Active Players</option>
            <option value="HIGH_ROLLERS">High Rollers (₹50k+)</option>
            <option value="BANNED">Banned / Flagged</option>
          </select>
        </div>

        {/* Dropdown 2: Luck / RTP Mode Filter & Bulk Assign */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap">Luck Filter:</span>
          <select
            value={luckFilter}
            onChange={(e) => setLuckFilter(e.target.value as any)}
            className="bg-[#0e1017] border border-[#1e2433] text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-cyan-500/60 font-medium"
          >
            <option value="ALL">All Modes</option>
            <option value="HIGH_WIN">User Win</option>
            <option value="LOW_WIN">House Win</option>
            <option value="NO_CONTROL">Balanced</option>
            <option value="MEDIUM_WIN">Jackpot</option>
          </select>

          {/* Bulk Assign Menu when selected */}
          {selectedUserIds.length > 0 && (
            <div className="flex items-center gap-1.5 pl-2 border-l border-[#1e2433]">
              <span className="text-[11px] font-mono text-cyan-400 font-bold whitespace-nowrap">
                Assign ({selectedUserIds.length}):
              </span>
              <select
                onChange={(e) => {
                  if (e.target.value) handleBulkLuckAssign(e.target.value);
                }}
                defaultValue=""
                className="bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs rounded-xl px-2.5 py-2 focus:outline-none font-bold"
              >
                <option value="" disabled>Bulk Set</option>
                <option value="HIGH_WIN">User Win</option>
                <option value="LOW_WIN">House Win</option>
                <option value="NO_CONTROL">Balanced</option>
                <option value="MEDIUM_WIN">Jackpot</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#131722] border border-[#1e2433] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#0e1017] border-b border-[#1e2433] text-slate-400 font-mono uppercase text-[11px]">
                <th className="py-3 px-3 w-8">
                  <button
                    onClick={toggleSelectAll}
                    className="text-slate-400 hover:text-white"
                  >
                    {selectedUserIds.length > 0 && selectedUserIds.length === filteredUsers.length ? (
                      <CheckSquare className="w-4 h-4 text-cyan-400" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-4">Player / ID</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Wallet Balance</th>
                <th className="py-3 px-4">Deposited / Withdrawn</th>
                <th className="py-3 px-4">Net P/L</th>
                <th className="py-3 px-4">Assigned Mode</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2433]">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin text-cyan-400 mx-auto mb-2" />
                    <p className="font-mono text-xs">Loading player roster...</p>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-mono">
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isSelected = selectedUserIds.includes(u.id);
                  return (
                    <tr
                      key={u.id}
                      className={`hover:bg-[#181d2b]/60 transition-colors ${
                        isSelected ? "bg-[#182033]/50" : ""
                      }`}
                    >
                      <td className="py-3.5 px-3">
                        <button
                          onClick={() => toggleSelectUser(u.id)}
                          className="text-slate-400 hover:text-white"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-cyan-400" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Player Profile Clickable for Dossier */}
                      <td className="py-3.5 px-4 font-mono">
                        <button
                          onClick={() => setDossierUser(u)}
                          className="flex items-center gap-2 text-left group"
                        >
                          <div className="w-7 h-7 rounded-lg bg-[#0e1017] border border-[#1e2433] flex items-center justify-center text-slate-300 font-bold text-xs uppercase group-hover:border-cyan-500/50 transition-colors">
                            {u.username.slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-bold text-white text-xs group-hover:text-cyan-400 transition-colors flex items-center gap-1">
                              <span>{u.username}</span>
                              <Eye className="w-3 h-3 text-slate-500 group-hover:text-cyan-400" />
                            </div>
                            <div className="text-[10px] text-slate-500">#{u.id.slice(-6)}</div>
                          </div>
                        </button>
                      </td>

                      {/* Contact Info */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="text-slate-200">{u.phone || "No Phone"}</div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[140px]">
                          {u.email || "No Email"}
                        </div>
                      </td>

                      {/* Wallet Balance */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="text-white font-bold text-xs">
                          ₹{u.walletBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </div>
                      </td>

                      {/* Deposited / Withdrawn */}
                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        <div className="text-emerald-400">
                          +₹{u.totalDeposited.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-rose-400">
                          -₹{u.totalWithdrawn.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </div>
                      </td>

                      {/* Net P/L */}
                      <td className="py-3.5 px-4 font-mono text-xs font-bold">
                        <span className={u.netPL >= 0 ? "text-emerald-400" : "text-rose-400"}>
                          {u.netPL >= 0 ? "+" : ""}₹{u.netPL.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </span>
                      </td>

                      {/* Luck Mode Selector */}
                      <td className="py-3.5 px-4">
                        <select
                          value={u.luckMode}
                          onChange={(e) => handleLuckModeChange(u.id, e.target.value)}
                          className="bg-[#0e1017] border border-[#1e2433] text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500/60 font-medium"
                        >
                          <option value="HIGH_WIN">User Win</option>
                          <option value="LOW_WIN">House Win</option>
                          <option value="NO_CONTROL">Balanced</option>
                          <option value="MEDIUM_WIN">Jackpot</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedUserForBalance(u);
                              setBalanceAmount("1000");
                              setBalanceMode("ADD");
                            }}
                            className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all text-xs flex items-center gap-1"
                            title="Adjust Wallet Balance"
                          >
                            <Wallet className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline text-[11px] font-semibold">Adjust</span>
                          </button>

                          <button
                            onClick={() => setUserToDelete(u)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all text-xs"
                            title="Delete User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* COMPREHENSIVE USER DOSSIER MODAL */}
      {dossierUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#131722] border border-[#1e2433] rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#1e2433] pb-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0e1017] border border-[#1e2433] flex items-center justify-center text-cyan-400 font-bold text-sm uppercase">
                  {dossierUser.username.slice(0, 2)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>{dossierUser.username}</span>
                    <span className="text-xs text-slate-500 font-mono">#{dossierUser.id.slice(-8)}</span>
                  </h3>
                  <div className="text-xs text-slate-400">A-to-Z Complete Player Dossier</div>
                </div>
              </div>
              <button
                onClick={() => setDossierUser(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="bg-[#0e1017] p-3 rounded-xl border border-[#1e2433]">
                <div className="text-slate-500 text-[10px] uppercase">User ID</div>
                <div className="text-white font-bold truncate mt-0.5">{dossierUser.id}</div>
              </div>
              <div className="bg-[#0e1017] p-3 rounded-xl border border-[#1e2433]">
                <div className="text-slate-500 text-[10px] uppercase">Assigned Luck Mode</div>
                <div className="mt-1">{luckModeBadge(dossierUser.luckMode)}</div>
              </div>
              <div className="bg-[#0e1017] p-3 rounded-xl border border-[#1e2433]">
                <div className="text-slate-500 text-[10px] uppercase">Email</div>
                <div className="text-white truncate mt-0.5">{dossierUser.email || "N/A"}</div>
              </div>
              <div className="bg-[#0e1017] p-3 rounded-xl border border-[#1e2433]">
                <div className="text-slate-500 text-[10px] uppercase">Phone</div>
                <div className="text-white truncate mt-0.5">{dossierUser.phone || "N/A"}</div>
              </div>
              <div className="bg-[#0e1017] p-3 rounded-xl border border-[#1e2433]">
                <div className="text-slate-500 text-[10px] uppercase">Registered Date</div>
                <div className="text-slate-300 mt-0.5">{new Date(dossierUser.createdAt).toLocaleDateString()}</div>
              </div>
              <div className="bg-[#0e1017] p-3 rounded-xl border border-[#1e2433]">
                <div className="text-slate-500 text-[10px] uppercase">Last Active</div>
                <div className="text-slate-300 mt-0.5">{new Date(dossierUser.lastActive).toLocaleDateString()}</div>
              </div>
              <div className="bg-[#0e1017] p-3 rounded-xl border border-[#1e2433]">
                <div className="text-slate-500 text-[10px] uppercase">Current Balance</div>
                <div className="text-cyan-400 font-bold text-sm mt-0.5">₹{dossierUser.walletBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
              </div>
              <div className="bg-[#0e1017] p-3 rounded-xl border border-[#1e2433]">
                <div className="text-slate-500 text-[10px] uppercase">Net Player P/L</div>
                <div className={`font-bold text-sm mt-0.5 ${dossierUser.netPL >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {dossierUser.netPL >= 0 ? "+" : ""}₹{dossierUser.netPL.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div className="bg-[#0e1017] p-3 rounded-xl border border-[#1e2433]">
                <div className="text-slate-500 text-[10px] uppercase">Total Deposits</div>
                <div className="text-emerald-400 font-bold mt-0.5">₹{dossierUser.totalDeposited.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
              </div>
              <div className="bg-[#0e1017] p-3 rounded-xl border border-[#1e2433]">
                <div className="text-slate-500 text-[10px] uppercase">Total Withdrawals</div>
                <div className="text-rose-400 font-bold mt-0.5">₹{dossierUser.totalWithdrawn.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
              </div>
              <div className="bg-[#0e1017] p-3 rounded-xl border border-[#1e2433]">
                <div className="text-slate-500 text-[10px] uppercase">Bets Played</div>
                <div className="text-white font-bold mt-0.5">{dossierUser.betsCount}</div>
              </div>
              <div className="bg-[#0e1017] p-3 rounded-xl border border-[#1e2433]">
                <div className="text-slate-500 text-[10px] uppercase">Win Rate (Recent)</div>
                <div className="text-purple-300 font-bold mt-0.5">{dossierUser.winRate}%</div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#1e2433]">
              <button
                onClick={() => {
                  setSelectedUserForBalance(dossierUser);
                  setDossierUser(null);
                }}
                className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-semibold"
              >
                Adjust Balance
              </button>
              <button
                onClick={() => {
                  setUserToDelete(dossierUser);
                  setDossierUser(null);
                }}
                className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/40 rounded-xl text-xs font-semibold"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#131722] border border-rose-500/40 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete User Permanently?</h3>
                <p className="text-xs text-slate-400">Cascade delete from database</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete player <strong className="text-white">@{userToDelete.username}</strong> ({userToDelete.id})? All wallets, bets, and transaction histories will be completely purged.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setUserToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 bg-[#0e1017] hover:bg-[#1a2030] text-slate-300 border border-[#1e2433] rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={isDeleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-600/30 flex items-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete User</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BALANCE ADJUSTMENT MODAL */}
      {selectedUserForBalance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#131722] border border-[#1e2433] rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#1e2433]">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">
                  Wallet Adjustment
                </h3>
              </div>
              <button
                onClick={() => setSelectedUserForBalance(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBalanceSubmit} className="space-y-4 pt-4">
              <div className="p-3 bg-[#0e1017] border border-[#1e2433] rounded-xl text-xs font-mono">
                <span className="text-slate-400">Target User:</span>{" "}
                <span className="text-white font-bold">
                  @{selectedUserForBalance.username}
                </span>{" "}
                <span className="text-slate-500 text-[10px]">
                  ({selectedUserForBalance.id.slice(-6)})
                </span>
                <div className="mt-1 flex items-center justify-between text-slate-300">
                  <span>Current Balance:</span>
                  <span className="font-bold text-white">
                    ₹{selectedUserForBalance.walletBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Add vs Deduct Toggle */}
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

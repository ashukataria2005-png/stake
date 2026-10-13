"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  UserPlus,
  Crown,
  Shield,
  RefreshCw,
  Trash2,
  Edit2,
  Check,
  AlertCircle,
  X,
  Lock,
} from "lucide-react";

interface SubAdminMember {
  id: string;
  username: string;
  role: string;
  isSuperAdmin: boolean;
  createdAt: string;
}

const ROLE_OPTIONS = [
  { value: "SUPPORT_STAFF", label: "Support Staff (Users & Chat)", permissions: ["View Users", "Live Chat", "Ticket Desk"] },
  { value: "FINANCE_DESK", label: "Finance Desk (Payments & Ledger)", permissions: ["Approve Deposits", "Review Withdrawals", "Finance"] },
  { value: "GAME_OPS", label: "Game Operations (RTP & Luck)", permissions: ["RTP Control", "Game Catalog", "Luck Settings"] },
  { value: "ADMIN", label: "General Admin (Full Operations)", permissions: ["Dashboard", "Users", "Payments", "Promotions", "Games"] },
];

export default function AdminSecurityPage() {
  const [admins, setAdmins] = useState<SubAdminMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Sub-admin creation form state
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("SUPPORT_STAFF");
  const [isCreating, setIsCreating] = useState(false);

  // Edit sub-admin modal state
  const [editingAdmin, setEditingAdmin] = useState<SubAdminMember | null>(null);
  const [editRole, setEditRole] = useState("SUPPORT_STAFF");
  const [editPassword, setEditPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchAdmins = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/subadmins");
      const data = await res.json();
      if (data.success && Array.isArray(data.admins)) {
        setAdmins(data.admins);
      }
    } catch (err) {
      console.error("Failed to fetch admin roster:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleCreateSubAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword) return;

    setIsCreating(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/admin/subadmins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: newUsername.trim(),
          password: newPassword,
          role: selectedRole,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create sub-admin");
      }

      setToastMessage(`Sub-admin @${newUsername.trim()} created!`);
      setNewUsername("");
      setNewPassword("");
      await fetchAdmins();
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err: any) {
      setErrorMessage(err?.message || "Creation error");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteAdmin = async (id: string, username: string) => {
    if (!confirm(`Are you sure you want to delete sub-admin @${username}?`)) return;

    try {
      const res = await fetch("/api/admin/subadmins", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete sub-admin");
      }

      setAdmins((prev) => prev.filter((a) => a.id !== id));
      setToastMessage(`Sub-admin @${username} removed.`);
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err: any) {
      alert("Delete failed: " + err.message);
    }
  };

  const openEditModal = (admin: SubAdminMember) => {
    setEditingAdmin(admin);
    setEditRole(admin.role);
    setEditPassword("");
  };

  const handleUpdateAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdmin) return;

    setIsUpdating(true);
    try {
      const res = await fetch("/api/admin/subadmins", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingAdmin.id,
          role: editRole,
          password: editPassword || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update sub-admin");
      }

      setAdmins((prev) =>
        prev.map((a) => (a.id === editingAdmin.id ? { ...a, role: editRole } : a))
      );
      setToastMessage(`Sub-admin @${editingAdmin.username} updated.`);
      setEditingAdmin(null);
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err: any) {
      alert("Update failed: " + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const getRolePermissions = (roleStr: string) => {
    const found = ROLE_OPTIONS.find((r) => r.value === roleStr);
    return found?.permissions || ["Read Only"];
  };

  return (
    <div className="space-y-6">
      {/* Header: Clean, direct */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
            Admin Team & Access Governance
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Delegate operational tasks with granular sub-admin roles and clearance permissions.
          </p>
        </div>

        <button
          onClick={fetchAdmins}
          disabled={isLoading}
          className="flex items-center gap-2 px-3.5 py-2 bg-[#131722] hover:bg-[#1c2233] text-slate-200 text-xs font-semibold rounded-xl border border-[#1e2433] transition-all shadow-sm self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isLoading ? "animate-spin" : ""}`} />
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

      {/* TOP: SUB-ADMIN CREATION FORM */}
      <div className="bg-[#131722] border border-[#1e2433] rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#1e2433]">
          <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
            <UserPlus className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Create Sub-Admin Member</h2>
            <p className="text-xs text-slate-400">Add operational team accounts with scoped permissions.</p>
          </div>
        </div>

        <form onSubmit={handleCreateSubAdmin} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-slate-300 font-medium">Username / Admin ID</label>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="e.g. support_lead"
              required
              className="w-full px-3.5 py-2.5 bg-[#0e1017] border border-[#1e2433] rounded-xl text-white font-mono placeholder-slate-600 focus:outline-none focus:border-cyan-500/60"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-medium">Temporary Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              className="w-full px-3.5 py-2.5 bg-[#0e1017] border border-[#1e2433] rounded-xl text-white font-mono placeholder-slate-600 focus:outline-none focus:border-cyan-500/60"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-medium">Assigned Role & Permissions</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0e1017] border border-[#1e2433] rounded-xl text-white font-semibold focus:outline-none focus:border-cyan-500/60"
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3 flex justify-end pt-1">
            <button
              type="submit"
              disabled={isCreating}
              className="py-2.5 px-5 rounded-xl text-xs font-bold uppercase tracking-wider bg-cyan-500 hover:bg-cyan-400 text-black shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {isCreating ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <UserPlus className="w-3.5 h-3.5" />
              )}
              <span>Create Sub-Admin</span>
            </button>
          </div>
        </form>
      </div>

      {/* BOTTOM: ROSTER OF ALL ADMINS */}
      <div className="bg-[#131722] border border-[#1e2433] rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#1e2433]">
          <div>
            <h2 className="text-sm font-bold text-white">Active Administrative Roster</h2>
            <p className="text-xs text-slate-400">Super Admin and all registered sub-admins.</p>
          </div>
        </div>

        <div className="space-y-3">
          {isLoading && admins.length === 0 ? (
            <div className="py-8 text-center text-slate-400 font-mono text-xs">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-cyan-400" />
              Loading administrators...
            </div>
          ) : (
            admins.map((adm) => {
              const isSuper = adm.isSuperAdmin;
              const permissions = isSuper
                ? ["Full Root Access", "All Sections", "System Master"]
                : getRolePermissions(adm.role);

              return (
                <div
                  key={adm.id}
                  className={`bg-[#0e1017] border rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3.5 transition-all ${
                    isSuper ? "border-amber-500/40 bg-[#16140f]" : "border-[#1e2433] hover:border-cyan-500/30"
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      {isSuper ? (
                        <div className="p-1 rounded bg-amber-500/20 text-amber-400">
                          <Crown className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="p-1 rounded bg-cyan-500/20 text-cyan-400">
                          <Shield className="w-4 h-4" />
                        </div>
                      )}

                      <span className="font-mono font-bold text-sm text-white">
                        @{adm.username}
                      </span>

                      {isSuper ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                          Super Admin (Protected)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-mono">
                          {adm.role}
                        </span>
                      )}
                    </div>

                    {/* Permission Pills */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <span className="text-[10px] font-mono text-slate-500 uppercase mr-1">Clearance:</span>
                      {permissions.map((p) => (
                        <span
                          key={p}
                          className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#131722] text-slate-300 border border-[#1e2433]"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions: Protected for Super Admin */}
                  <div className="flex items-center gap-2 self-end md:self-center">
                    {isSuper ? (
                      <span className="text-[11px] text-amber-400/80 font-mono italic">
                        Permanent Master Root
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => openEditModal(adm)}
                          className="p-1.5 rounded-lg bg-[#131722] hover:bg-[#1a2030] text-slate-300 border border-[#1e2433]"
                          title="Edit Sub-Admin"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteAdmin(adm.id, adm.username)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          title="Delete Sub-Admin"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* EDIT SUB-ADMIN MODAL */}
      {editingAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#131722] border border-[#1e2433] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1e2433]">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Edit Sub-Admin: @{editingAdmin.username}</h3>
              </div>
              <button
                onClick={() => setEditingAdmin(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateAdminSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Assigned Role</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0e1017] border border-[#1e2433] rounded-xl text-white font-semibold focus:outline-none focus:border-cyan-500/60"
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">New Password (leave empty to keep current)</label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 bg-[#0e1017] border border-[#1e2433] rounded-xl text-white font-mono focus:outline-none focus:border-cyan-500/60"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingAdmin(null)}
                  disabled={isUpdating}
                  className="flex-1 py-2 rounded-xl bg-[#0e1017] text-slate-300 border border-[#1e2433]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold"
                >
                  {isUpdating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

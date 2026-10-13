"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Key,
  Lock,
  UserCheck,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  UserPlus,
  Crown,
  Shield,
  RefreshCw,
} from "lucide-react";

interface AdminMember {
  id: string;
  username: string;
  role: string;
  clearance: string[];
  lastLogin: string;
}

const INITIAL_ADMINS: AdminMember[] = [
  {
    id: "admin-1",
    username: "admin",
    role: "SUPER_ADMIN",
    clearance: ["Dashboard", "Payments", "Users", "RTP", "Promos", "Finance", "Security", "Settings"],
    lastLogin: "Active Now",
  },
  {
    id: "admin-2",
    username: "finance_lead",
    role: "FINANCE_DESK",
    clearance: ["Dashboard", "Payments", "Finance"],
    lastLogin: "2 hours ago",
  },
  {
    id: "admin-3",
    username: "support_ops",
    role: "SUPPORT_STAFF",
    clearance: ["Dashboard", "Users"],
    lastLogin: "Yesterday",
  },
];

export default function AdminSecurityPage() {
  const [admins, setAdmins] = useState<AdminMember[]>(INITIAL_ADMINS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Password Update Form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("New password and confirm password do not match.");
      return;
    }

    setIsUpdatingPassword(true);
    // Simulate updating password
    setTimeout(() => {
      setIsUpdatingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setToastMessage("Master security key updated successfully!");
      setTimeout(() => setToastMessage(null), 4000);
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              Admin Team & Security Clearance
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 font-mono">
              Access Governance
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage administrators, sub-admin role permissions, and rotate security keys.
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
        <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ========================================================
            1. ADMINISTRATORS DIRECTORY (60%)
            ======================================================== */}
        <div className="lg:col-span-7 bg-[#131722] border border-[#1e2433] rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1e2433]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Active Administrators</h2>
                <p className="text-[11px] text-slate-400 font-mono">Module permissions matrix</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {admins.map((adm) => (
              <div
                key={adm.id}
                className="bg-[#0e1017] border border-[#1e2433] rounded-xl p-4 space-y-2 hover:border-cyan-500/30 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                      <Crown className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-xs">{adm.username}</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          {adm.role}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono">Last active: {adm.lastLogin}</p>
                    </div>
                  </div>

                  <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    ● Granted
                  </span>
                </div>

                <div className="pt-2 border-t border-[#1e2433]/60">
                  <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1">
                    Allowed Clearance Scopes:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {adm.clearance.map((mod) => (
                      <span
                        key={mod}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#131722] border border-[#1e2433] text-slate-300"
                      >
                        {mod}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================
            2. ROTATE MASTER SECURITY KEY FORM (40%)
            ======================================================== */}
        <div className="lg:col-span-5 bg-[#131722] border border-[#1e2433] rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#1e2433]">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Rotate Master Security Key</h2>
              <p className="text-[11px] text-slate-400 font-mono">Password encryption</p>
            </div>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">Current Admin Password</label>
              <input
                type={showPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current password"
                required
                className="w-full px-3.5 py-2.5 bg-[#0e1017] border border-[#1e2433] rounded-xl text-white font-mono placeholder-slate-600 focus:outline-none focus:border-amber-500/60"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">New Security Key / Password</label>
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                required
                className="w-full px-3.5 py-2.5 bg-[#0e1017] border border-[#1e2433] rounded-xl text-white font-mono placeholder-slate-600 focus:outline-none focus:border-amber-500/60"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">Confirm New Password</label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type new password"
                required
                className="w-full px-3.5 py-2.5 bg-[#0e1017] border border-[#1e2433] rounded-xl text-white font-mono placeholder-slate-600 focus:outline-none focus:border-amber-500/60"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="hover:text-white flex items-center gap-1 font-mono"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showPassword ? "Hide Characters" : "Show Characters"}</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={isUpdatingPassword}
              className="w-full mt-2 py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5 active:scale-98"
            >
              {isUpdatingPassword ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Rotating Keys...</span>
                </>
              ) : (
                <span>Update Master Password</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

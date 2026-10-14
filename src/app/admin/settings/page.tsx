"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Database,
  Key,
  CheckCircle,
  QrCode,
  Save,
  Lock,
  RefreshCw,
  AlertCircle,
  Zap,
} from "lucide-react";

export default function AdminSettingsPage() {
  const [upiId, setUpiId] = useState("");
  const [merchantName, setMerchantName] = useState("");
  const [gatewayMode, setGatewayMode] = useState<"MANUAL" | "LGPAY_AUTO">("MANUAL");
  const [lgpayMerchantId, setLgpayMerchantId] = useState("");
  const [lgpayApiKey, setLgpayApiKey] = useState("");
  const [lgpayBaseUrl, setLgpayBaseUrl] = useState("");
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isSavingUPI, setIsSavingUPI] = useState(false);
  const [isSavingGateway, setIsSavingGateway] = useState(false);

  // Master Admin Password Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load persisted platform settings from DB/KV
  const fetchSettings = async () => {
    setIsLoadingSettings(true);
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (data.success && data.settings) {
        setUpiId(data.settings.upiId || "stakeofficial@upi");
        setMerchantName(data.settings.upiName || "Stake Gaming");
        setGatewayMode(data.settings.gatewayMode || "MANUAL");
        setLgpayMerchantId(data.settings.lgpayMerchantId || "stake_lgpay_merchant");
        setLgpayApiKey(data.settings.lgpayApiKey || "lgpay_secret_key_prod_8829");
        setLgpayBaseUrl(data.settings.lgpayBaseUrl || "https://www.lg-pay.com");
      }
    } catch (err) {
      console.error("Failed to fetch platform settings:", err);
    } finally {
      setIsLoadingSettings(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSavePaymentConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!upiId.trim() || !merchantName.trim()) return;

    setIsSavingUPI(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_UPI",
          upiId: upiId.trim(),
          upiName: merchantName.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save UPI parameters");
      }

      setToastMessage("Payment receiver parameters successfully saved & persisted!");
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to persist UPI settings");
    } finally {
      setIsSavingUPI(false);
    }
  };

  const handleSaveGatewayConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingGateway(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_GATEWAY",
          gatewayMode,
          lgpayMerchantId: lgpayMerchantId.trim(),
          lgpayApiKey: lgpayApiKey.trim(),
          lgpayBaseUrl: lgpayBaseUrl.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save Gateway parameters");
      }

      setToastMessage("Gateway settings & routing mode saved successfully!");
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to persist Gateway settings");
    } finally {
      setIsSavingGateway(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;

    if (newPassword !== confirmPassword) {
      setErrorMessage("New password and confirm password do not match.");
      return;
    }

    setIsUpdatingPassword(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_PASSWORD",
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to change admin password");
      }

      setToastMessage("Master Admin password changed securely!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err: any) {
      setErrorMessage(err?.message || "Password change failed");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header (Clean, direct) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
            Platform Settings & Gateway Config
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Persist payment gateway receiver details, manage master security keys, and inspect database connectivity.
          </p>
        </div>

        <button
          onClick={fetchSettings}
          disabled={isLoadingSettings}
          className="flex items-center gap-2 px-3.5 py-2 bg-[#131722] hover:bg-[#1c2233] text-slate-200 text-xs font-semibold rounded-xl border border-[#1e2433] transition-all shadow-sm self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isLoadingSettings ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* UPI RECEIVER CONFIGURATION (PERSISTENT DB/KV) */}
        <div className="bg-[#131722] border border-[#1e2433] rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-3 pb-3 border-b border-[#1e2433]">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Payment Receiver Details (UPI)</h3>
              <p className="text-xs text-slate-400 font-mono">Persisted into Neon database</p>
            </div>
          </div>

          <form onSubmit={handleSavePaymentConfig} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">Merchant VPA / UPI ID</label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="stakeofficial@upi"
                required
                className="w-full px-3.5 py-2.5 bg-[#0e1017] border border-[#1e2433] rounded-xl text-white font-mono placeholder-slate-600 focus:outline-none focus:border-cyan-500/60"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">Receiver Display Name</label>
              <input
                type="text"
                value={merchantName}
                onChange={(e) => setMerchantName(e.target.value)}
                placeholder="Stake Gaming"
                required
                className="w-full px-3.5 py-2.5 bg-[#0e1017] border border-[#1e2433] rounded-xl text-white font-mono placeholder-slate-600 focus:outline-none focus:border-cyan-500/60"
              />
            </div>

            <div className="pt-1 flex justify-end">
              <button
                type="submit"
                disabled={isSavingUPI}
                className="px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-cyan-500 hover:bg-cyan-400 text-black shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-1.5"
              >
                {isSavingUPI ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Save & Persist UPI</span>
              </button>
            </div>
          </form>
        </div>

        {/* LG-PAY AUTOMATIC GATEWAY CONTROL & API CREDENTIALS */}
        <div className="bg-[#131722] border border-[#1e2433] rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-3 pb-3 border-b border-[#1e2433]">
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">LG-Pay Automatic Gateway</h3>
              <p className="text-xs text-slate-400 font-mono">Automated IPN payment processing</p>
            </div>
          </div>

          <form onSubmit={handleSaveGatewayConfig} className="space-y-3.5 text-xs">
            {/* Mode Toggle: Manual Approval vs LG-Pay Auto */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">Payment Mode Routing</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setGatewayMode("MANUAL")}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    gatewayMode === "MANUAL"
                      ? "bg-cyan-500/15 border-cyan-500 text-cyan-300 shadow-sm"
                      : "bg-[#0e1017] border-[#1e2433] text-slate-400 hover:text-white"
                  }`}
                >
                  Manual Approval
                </button>
                <button
                  type="button"
                  onClick={() => setGatewayMode("LGPAY_AUTO")}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    gatewayMode === "LGPAY_AUTO"
                      ? "bg-purple-500/15 border-purple-500 text-purple-300 shadow-sm"
                      : "bg-[#0e1017] border-[#1e2433] text-slate-400 hover:text-white"
                  }`}
                >
                  LG-Pay Automatic
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Merchant ID</label>
              <input
                type="text"
                value={lgpayMerchantId}
                onChange={(e) => setLgpayMerchantId(e.target.value)}
                placeholder="stake_lgpay_merchant"
                className="w-full px-3.5 py-2.5 bg-[#0e1017] border border-[#1e2433] rounded-xl text-white font-mono placeholder-slate-600 focus:outline-none focus:border-purple-500/60"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-medium">API Secret Key</label>
              <input
                type="password"
                value={lgpayApiKey}
                onChange={(e) => setLgpayApiKey(e.target.value)}
                placeholder="lgpay_secret_key_prod_••••"
                className="w-full px-3.5 py-2.5 bg-[#0e1017] border border-[#1e2433] rounded-xl text-white font-mono placeholder-slate-600 focus:outline-none focus:border-purple-500/60"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Base URL / Endpoint</label>
              <input
                type="text"
                value={lgpayBaseUrl}
                onChange={(e) => setLgpayBaseUrl(e.target.value)}
                placeholder="https://api.lgpay.internal"
                className="w-full px-3.5 py-2.5 bg-[#0e1017] border border-[#1e2433] rounded-xl text-white font-mono placeholder-slate-600 focus:outline-none focus:border-purple-500/60"
              />
            </div>

            <div className="pt-1 flex justify-end">
              <button
                type="submit"
                disabled={isSavingGateway}
                className="px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {isSavingGateway ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Save Gateway Config</span>
              </button>
            </div>
          </form>
        </div>

        {/* MASTER ADMIN PASSWORD CHANGE (MIGRATED SECURELY HERE) */}
        <div className="bg-[#131722] border border-[#1e2433] rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-3 pb-3 border-b border-[#1e2433]">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Master Admin Security Key</h3>
              <p className="text-xs text-slate-400 font-mono">Rotate Super Admin password</p>
            </div>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full px-3.5 py-2.5 bg-[#0e1017] border border-[#1e2433] rounded-xl text-white font-mono focus:outline-none focus:border-amber-500/60"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-medium">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full px-3.5 py-2.5 bg-[#0e1017] border border-[#1e2433] rounded-xl text-white font-mono focus:outline-none focus:border-amber-500/60"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full px-3.5 py-2.5 bg-[#0e1017] border border-[#1e2433] rounded-xl text-white font-mono focus:outline-none focus:border-amber-500/60"
              />
            </div>

            <div className="pt-1 flex justify-end">
              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5"
              >
                {isUpdatingPassword ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
                <span>Update Admin Password</span>
              </button>
            </div>
          </form>
        </div>

        {/* Neon Database Status */}
        <div className="bg-[#131722] border border-[#1e2433] rounded-2xl p-6 space-y-3 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Neon Serverless PostgreSQL</h3>
              <p className="text-xs text-slate-400 font-mono">Active Connection Pool</p>
            </div>
          </div>
          <div className="bg-[#0e1017] p-3 rounded-xl border border-[#1e2433] text-xs font-mono space-y-1 text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-500">Engine:</span>
              <span className="text-white">Prisma Client v6.4.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Status:</span>
              <span className="text-emerald-400 font-bold">Online & Synchronized</span>
            </div>
          </div>
        </div>

        {/* Security & Token Engine */}
        <div className="bg-[#131722] border border-[#1e2433] rounded-2xl p-6 space-y-3 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Session & Token Engine</h3>
              <p className="text-xs text-slate-400 font-mono">HTTP-only signed JWT</p>
            </div>
          </div>
          <div className="bg-[#0e1017] p-3 rounded-xl border border-[#1e2433] text-xs font-mono space-y-1 text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-500">Cookie:</span>
              <span className="text-cyan-300 font-bold">stake_admin_token</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Expiry:</span>
              <span className="text-white">7 Days (Auto-renew)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

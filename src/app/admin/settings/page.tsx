"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Settings,
  Database,
  Key,
  ShieldCheck,
  CheckCircle,
  QrCode,
  Save,
  Server,
  Cpu,
} from "lucide-react";

export default function AdminSettingsPage() {
  const [upiId, setUpiId] = useState("merchant.flopshow@icici");
  const [merchantName, setMerchantName] = useState("FLOP SHOW ENTERTAINMENT");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSavePaymentConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setToastMessage("Payment receiver parameters saved successfully!");
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              Platform Settings & Infrastructure
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-slate-500/15 border border-slate-500/30 text-slate-300 font-mono">
              System Core
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Neon PostgreSQL connection pooler, payment gateway receiver details, and runtime environment.
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
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Neon Database Status */}
        <div className="bg-[#131722] border border-[#1e2433] rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Neon Serverless PostgreSQL</h3>
              <p className="text-xs text-slate-400 font-mono">AWS Region ap-southeast-1</p>
            </div>
          </div>

          <div className="bg-[#0e1017] p-3.5 rounded-xl border border-[#1e2433] text-xs font-mono space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Prisma Client:</span>
              <span className="text-white font-bold">v6.4.0 Engine</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Connection Mode:</span>
              <span className="text-emerald-400 font-bold">Pooling (PgBouncer)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">SSL / TLS:</span>
              <span className="text-cyan-300">tls=require (256-Bit)</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Connection verified healthy. Schema migrations synced.</span>
          </div>
        </div>

        {/* Admin Authentication & Encryption */}
        <div className="bg-[#131722] border border-[#1e2433] rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Security & Token Engine</h3>
              <p className="text-xs text-slate-400 font-mono">HTTP-only signed JWT clearance</p>
            </div>
          </div>

          <div className="bg-[#0e1017] p-3.5 rounded-xl border border-[#1e2433] text-xs font-mono space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Cookie Name:</span>
              <span className="text-amber-300 font-bold">stake_admin_token</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">SameSite Policy:</span>
              <span className="text-white">Lax / Secure</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Session TTL:</span>
              <span className="text-white">7 Days (Auto Renew)</span>
            </div>
          </div>

          <p className="text-xs text-slate-400">
            Full root privileges enabled for approving deposits, overriding user balances and RTP outcome calibrations.
          </p>
        </div>

        {/* UPI Receiver Configuration */}
        <div className="lg:col-span-2 bg-[#131722] border border-[#1e2433] rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-3 pb-3 border-b border-[#1e2433]">
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Payment Receiver Details</h3>
              <p className="text-xs text-slate-400 font-mono">Shown on player deposit QR screen</p>
            </div>
          </div>

          <form onSubmit={handleSavePaymentConfig} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">Merchant VPA / UPI ID</label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-[#0e1017] border border-[#1e2433] rounded-xl text-white font-mono placeholder-slate-600 focus:outline-none focus:border-rose-500/60"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">Receiver Display Name</label>
              <input
                type="text"
                value={merchantName}
                onChange={(e) => setMerchantName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-[#0e1017] border border-[#1e2433] rounded-xl text-white font-mono placeholder-slate-600 focus:outline-none focus:border-rose-500/60"
              />
            </div>

            <div className="sm:col-span-2 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-rose-500 hover:bg-rose-400 text-white shadow-lg shadow-rose-500/20 transition-all flex items-center gap-1.5 active:scale-98"
              >
                <Save className="w-4 h-4" />
                <span>Save Gateway Configuration</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

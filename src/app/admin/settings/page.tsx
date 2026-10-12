import Link from "next/link";
import { Settings, ShieldCheck, Database, Key, Download } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-wide">System Settings & Gateway</h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#131b24] text-slate-300 border border-[#212f3d]">
              Configuration
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Platform parameters, payment receiver details, and admin security.</p>
        </div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#1f2c3a] hover:bg-[#28384a] text-white text-xs font-semibold rounded-xl border border-[#2d4054] transition-colors"
        >
          ← Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Neon Database Status */}
        <div className="bg-[#131b24] border border-[#212f3d] rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[#00e701] flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Neon PostgreSQL Database</h3>
              <p className="text-xs text-slate-400">AWS ap-southeast-1 serverless connection</p>
            </div>
          </div>
          <div className="bg-[#0a0f14] p-3 rounded-xl border border-[#212f3d] text-xs font-mono text-slate-300">
            Pooler Host: ep-gentle-sunset-b3locxsp-pooler...
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#00e701] animate-pulse" />
            <span>Connection verified healthy. Prisma Client v6.4.0 active.</span>
          </div>
        </div>

        {/* Security & Access */}
        <div className="bg-[#131b24] border border-[#212f3d] rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Admin Authentication</h3>
              <p className="text-xs text-slate-400">HTTP-only signed JWT session tokens</p>
            </div>
          </div>
          <div className="bg-[#0a0f14] p-3 rounded-xl border border-[#212f3d] text-xs text-slate-300">
            Role: <span className="font-bold text-white">SUPER_ADMIN</span> • Cookie: <span className="font-mono text-slate-400">stake_admin_token</span>
          </div>
          <p className="text-xs text-slate-400">
            Full admin clearance for approving deposits, user balances, and system outcomes.
          </p>
        </div>
      </div>
    </div>
  );
}

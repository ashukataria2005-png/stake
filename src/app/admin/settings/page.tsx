import Link from "next/link";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-wide">Settings & Export</h1>
          <p className="text-xs text-slate-400 mt-1">System preferences, payment gateway configurations, and DB backups.</p>
        </div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#213743] hover:bg-[#2a4554] text-white text-xs font-semibold rounded-lg border border-[#2f4553] transition-colors"
        >
          ← Back to Dashboard
        </Link>
      </div>

      <div className="bg-[#1a2c38] border border-[#2f4553] rounded-2xl p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-slate-500/10 border border-slate-500/20 text-slate-300 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
          ⚙️
        </div>
        <h2 className="text-lg font-bold text-white mb-2">Platform Configuration & Data Export</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
          Admin account credentials rotation, UPI QR code endpoints, and CSV ledger exports.
        </p>
        <Link
          href="/admin"
          className="px-5 py-2.5 bg-[#00e701] hover:bg-[#00c701] text-[#0f212e] font-bold text-xs uppercase tracking-wider rounded-lg transition-all"
        >
          Return to Overview
        </Link>
      </div>
    </div>
  );
}

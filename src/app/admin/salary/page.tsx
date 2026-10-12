import Link from "next/link";

export default function AdminSalaryPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">Daily Salary & Agent Commission</h1>
          <p className="text-xs text-slate-400 mt-1">Manage partner revenue shares, referral payouts, and agent tier commissions.</p>
        </div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#213743] hover:bg-[#2a4554] text-white text-xs font-semibold rounded-lg border border-[#2f4553] transition-colors"
        >
          ← Back to Dashboard
        </Link>
      </div>

      <div className="bg-[#131414] border border-[#23272b] rounded-xl p-8 text-center text-white">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
          💼
        </div>
        <h2 className="text-lg font-bold text-white mb-2">Daily Salary & Agent Commission Engine</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
          Calculates automated tier payouts based on referral turnover and subordinate bet volumes.
        </p>
        <Link
          href="/admin"
          className="px-5 py-2.5 bg-[#007bff] hover:bg-[#0056b3] text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}

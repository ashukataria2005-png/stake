"use client";

import React from "react";
import Link from "next/link";
import { Gamepad2, Sliders, ArrowRight } from "lucide-react";

export default function AdminGamesManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              Game Catalog & Provider Gateway
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono">
              Catalog Hub
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Browse game titles, RTP settings, and payout controls.
          </p>
        </div>
        <Link
          href="/admin"
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#131722] hover:bg-[#1c2233] text-slate-200 text-xs font-semibold rounded-xl border border-[#1e2433] transition-all shadow-sm self-start sm:self-auto"
        >
          <span>← Mission Control</span>
        </Link>
      </div>

      <div className="bg-[#131722] border border-[#1e2433] rounded-2xl p-8 text-center text-white space-y-4 shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-2xl font-bold">
          <Gamepad2 className="w-7 h-7" />
        </div>
        <h2 className="text-base font-bold text-white">Pragmatic & In-House Game Titles</h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Manage win multipliers, house edge percentages, and game algorithms directly in the RTP Luck Control desk.
        </p>
        <Link
          href="/admin/luck-control"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-emerald-500/20"
        >
          <span>Configure RTP & Luck Controls</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

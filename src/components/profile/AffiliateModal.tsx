"use client";

import React, { useState } from "react";
import {
  Users,
  Copy,
  Check,
  Share2,
  X,
  Sparkles,
  TrendingUp,
  DollarSign,
  Gift,
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import { sounds } from "@/utils/audio";

interface AffiliateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AffiliateModal({ isOpen, onClose }: AffiliateModalProps) {
  const { user } = useGame();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [claimToast, setClaimToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const username = user?.username || user?.name || "partner";
  const refCode = `STAKE-${username.toUpperCase().replace(/[^A-Z0-9]/g, "")}`;
  const refLink = typeof window !== "undefined"
    ? `${window.location.origin}/?c=${encodeURIComponent(refCode)}`
    : `https://stake.com/?c=${encodeURIComponent(refCode)}`;

  const handleCopyCode = () => {
    sounds.playClick();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(refCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleCopyLink = () => {
    sounds.playClick();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(refLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleClaim = () => {
    sounds.playCashout();
    setClaimToast("No pending commissions available to claim right now. Share your link to start earning!");
    setTimeout(() => setClaimToast(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-[#213743] bg-[#1a2c38] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#213743] px-5 py-4 bg-[#14232d] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-1.5">
                <span>Affiliate Program</span>
                <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Partner
                </span>
              </h2>
              <p className="text-xs text-[#b1bad3]">Earn lifetime recurring commissions on every wager</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#b1bad3] hover:bg-[#213743] hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 overscroll-contain custom-scrollbar">
          {/* Referral Link & Code Container */}
          <div className="bg-[#0f212e] border border-[#213743] rounded-xl p-4 space-y-3">
            <div>
              <label className="text-[11px] font-bold text-[#b1bad3] uppercase tracking-wider block mb-1">
                Your Referral Link
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-[#213743] bg-[#1a2c38] px-3 py-2 text-xs">
                <input
                  type="text"
                  readOnly
                  value={refLink}
                  className="w-full bg-transparent text-white font-mono truncate outline-none select-all"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-1 rounded-lg bg-[#213743] hover:bg-[#2f4553] text-white font-bold transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-[#00e701]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#b1bad3] uppercase tracking-wider block mb-1">
                Referral Code
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-[#213743] bg-[#1a2c38] px-3 py-2 text-xs">
                <span className="w-full text-amber-400 font-mono font-bold tracking-wider">{refCode}</span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-3 py-1 rounded-lg bg-[#213743] hover:bg-[#2f4553] text-white font-bold transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-[#00e701]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-[#0f212e] border border-[#213743] rounded-xl p-3 text-center space-y-1">
              <span className="text-[10px] font-bold text-[#b1bad3] uppercase tracking-wider block">Total Referrals</span>
              <span className="text-base sm:text-lg font-black text-white font-mono">0</span>
            </div>
            <div className="bg-[#0f212e] border border-[#213743] rounded-xl p-3 text-center space-y-1">
              <span className="text-[10px] font-bold text-[#b1bad3] uppercase tracking-wider block">Total Wagered</span>
              <span className="text-base sm:text-lg font-black text-white font-mono">₹0.00</span>
            </div>
            <div className="bg-[#0f212e] border border-[#213743] rounded-xl p-3 text-center space-y-1">
              <span className="text-[10px] font-bold text-[#b1bad3] uppercase tracking-wider block">Available</span>
              <span className="text-base sm:text-lg font-black text-[#00e701] font-mono">₹0.00</span>
            </div>
          </div>

          {/* Commission Breakdown */}
          <div className="bg-[#0f212e] border border-[#213743] rounded-xl p-4 space-y-2">
            <div className="text-xs font-bold text-[#b1bad3] uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[#00e701]" />
              <span>Commission Structure</span>
            </div>

            <div className="space-y-2 text-xs text-[#b1bad3]">
              <div className="flex justify-between items-center py-1 border-b border-[#213743]">
                <span>Casino Games Commission</span>
                <span className="text-white font-bold font-mono">0.5% of Edge</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#213743]">
                <span>Sportsbook Turnover</span>
                <span className="text-white font-bold font-mono">0.4% Volume</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span>Settlement Frequency</span>
                <span className="text-[#00e701] font-bold">Instant Real-Time</span>
              </div>
            </div>
          </div>

          {claimToast && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium animate-in fade-in">
              {claimToast}
            </div>
          )}

          {/* Claim Action */}
          <button
            type="button"
            onClick={handleClaim}
            className="w-full py-3 px-4 rounded-xl font-black text-sm text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-500/25 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Gift className="w-4 h-4" />
            <span>Claim Commission</span>
          </button>
        </div>
      </div>
    </div>
  );
}

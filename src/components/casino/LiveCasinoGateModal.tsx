"use client";

import React from "react";
import { X, ShieldAlert, ArrowRight, Lock } from "lucide-react";
import { useGame } from "@/context/GameContext";

interface LiveCasinoGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableName?: string;
}

export default function LiveCasinoGateModal({
  isOpen,
  onClose,
  tableName = "Live Casino Tables",
}: LiveCasinoGateModalProps) {
  const { openWalletModal } = useGame();

  if (!isOpen) return null;

  const handleDepositNow = () => {
    onClose();
    openWalletModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-md rounded-2xl bg-[#1a2c38] border border-[#2f4553] shadow-2xl overflow-hidden p-6 text-center space-y-5 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#b1bad3] hover:text-white hover:bg-[#213743] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Icon Shield */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>

        {/* Header and Details */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-black uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5" /> Table Access Restricted
          </div>
          <h3 className="text-xl font-black text-white">
            Real Balance Required
          </h3>
          <p className="text-xs sm:text-sm text-[#b1bad3] leading-relaxed px-2">
            ⚠️ <strong>Real Balance Required:</strong> Live Casino tables require an active balance. Please deposit to join live dealer tables.
          </p>
        </div>

        {/* Notice Info Card */}
        <div className="bg-[#0f212e] border border-[#213743] rounded-xl p-3.5 text-left text-xs space-y-1.5 text-[#b1bad3]">
          <div className="flex items-center justify-between text-white font-semibold">
            <span>Selected Table:</span>
            <span className="text-red-400 font-bold">{tableName}</span>
          </div>
          <p className="text-[11px] text-[#87909e]">
            Live dealer video streams and real-time dealer seating are exclusive to accounts with verified deposit funds. Fun/Demo play is not supported on live tables.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            onClick={handleDepositNow}
            className="w-full py-3.5 px-4 rounded-xl bg-[#00e701] hover:bg-[#00c701] text-[#0f212e] font-black text-sm tracking-wide transition-all shadow-[0_0_20px_rgba(0,231,1,0.35)] hover:shadow-[0_0_25px_rgba(0,231,1,0.5)] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Deposit Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-transparent hover:bg-[#213743]/50 text-[#b1bad3] hover:text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            Cancel & Return to Lobby
          </button>
        </div>
      </div>
    </div>
  );
}

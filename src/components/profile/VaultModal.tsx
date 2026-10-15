"use client";

import React, { useState, useEffect } from "react";
import {
  Lock,
  Unlock,
  Shield,
  ArrowRightLeft,
  X,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import { sounds } from "@/utils/audio";
import FiatCoinIcon from "@/components/FiatCoinIcon";

interface VaultModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VaultModal({ isOpen, onClose }: VaultModalProps) {
  const { realBalance, updateBalance, formatDisplayBalance, syncWalletBalance } = useGame();
  const [tab, setTab] = useState<"deposit" | "withdraw">("deposit");
  const [amount, setAmount] = useState<string>("");
  const [vaultBalance, setVaultBalance] = useState<number>(0);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Load vault balance from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("stake_vault_balance");
      if (saved) {
        setVaultBalance(Math.max(0, parseFloat(saved) || 0));
      }
    } catch {}
  }, [isOpen]);

  if (!isOpen) return null;

  // INR representation (86.5 rate)
  const inrMainBalance = parseFloat((realBalance * 86.5).toFixed(2));
  const maxAvailable = tab === "deposit" ? inrMainBalance : vaultBalance;

  const handlePercentage = (percent: number) => {
    sounds.playClick();
    const val = (maxAvailable * percent) / 100;
    setAmount(val > 0 ? val.toFixed(2) : "");
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const transferNum = parseFloat(amount);
    if (isNaN(transferNum) || transferNum <= 0) {
      setFeedback({ type: "error", message: "Please enter a valid amount greater than ₹0." });
      return;
    }

    if (transferNum > maxAvailable) {
      setFeedback({
        type: "error",
        message: `Insufficient funds. Max available: ₹${maxAvailable.toLocaleString("en-IN")}`,
      });
      return;
    }

    // Convert INR to USD diff
    const usdDiff = transferNum / 86.5;

    if (tab === "deposit") {
      // Main -> Vault
      const success = updateBalance(-usdDiff);
      if (success) {
        const newVault = vaultBalance + transferNum;
        setVaultBalance(newVault);
        try {
          localStorage.setItem("stake_vault_balance", newVault.toFixed(2));
        } catch {}
        sounds.playCashout();
        setFeedback({
          type: "success",
          message: `Successfully transferred ₹${transferNum.toLocaleString("en-IN")} into your Vault!`,
        });
        setAmount("");
        syncWalletBalance(true);
      } else {
        setFeedback({ type: "error", message: "Failed to deduct from main wallet balance." });
      }
    } else {
      // Vault -> Main
      const success = updateBalance(usdDiff);
      if (success) {
        const newVault = Math.max(0, vaultBalance - transferNum);
        setVaultBalance(newVault);
        try {
          localStorage.setItem("stake_vault_balance", newVault.toFixed(2));
        } catch {}
        sounds.playSuccessChime();
        setFeedback({
          type: "success",
          message: `Successfully withdrawn ₹${transferNum.toLocaleString("en-IN")} to main balance!`,
        });
        setAmount("");
        syncWalletBalance(true);
      } else {
        setFeedback({ type: "error", message: "Failed to credit to main wallet balance." });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-[#213743] bg-[#1a2c38] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#213743] px-5 py-4 bg-[#14232d]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-1.5">
                <span>Stake Vault</span>
                <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Secure
                </span>
              </h2>
              <p className="text-xs text-[#b1bad3]">Stash & lock funds away from active play</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#b1bad3] hover:bg-[#213743] hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Balance Overview Cards */}
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#0f212e] border border-[#213743] rounded-xl p-3 space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#b1bad3] flex items-center gap-1">
                <FiatCoinIcon currency="INR" size={14} />
                <span>Main Balance</span>
              </div>
              <div className="text-sm sm:text-base font-black text-white font-mono">
                ₹{inrMainBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="bg-[#0f212e] border border-[#213743] rounded-xl p-3 space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" />
                <span>Vault Balance</span>
              </div>
              <div className="text-sm sm:text-base font-black text-white font-mono">
                ₹{vaultBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Tab Selector: Deposit vs Withdraw */}
          <div className="grid grid-cols-2 bg-[#0f212e] p-1 rounded-xl border border-[#213743]">
            <button
              type="button"
              onClick={() => {
                setTab("deposit");
                setAmount("");
                setFeedback(null);
                sounds.playClick();
              }}
              className={`py-2 px-3 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                tab === "deposit"
                  ? "bg-[#1475e1] text-white shadow-md"
                  : "text-[#b1bad3] hover:text-white"
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Deposit to Vault</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("withdraw");
                setAmount("");
                setFeedback(null);
                sounds.playClick();
              }}
              className={`py-2 px-3 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                tab === "withdraw"
                  ? "bg-[#1475e1] text-white shadow-md"
                  : "text-[#b1bad3] hover:text-white"
              }`}
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>Withdraw to Main</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleTransfer} className="space-y-3.5">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-[#b1bad3] uppercase tracking-wider">Amount</span>
                <span className="text-white font-mono text-[11px]">
                  Available: ₹{maxAvailable.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex items-center rounded-xl border border-[#213743] bg-[#0f212e] px-3.5 py-2.5 focus-within:border-[#1475e1] transition-colors shadow-inner">
                <span className="text-base font-black text-white font-mono mr-2">₹</span>
                <input
                  type="number"
                  step="any"
                  min="0"
                  max={maxAvailable}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-transparent text-white font-mono text-base font-bold focus:outline-none placeholder-[#557086]"
                />
              </div>

              {/* Quick Percentage Chips */}
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {[
                  { label: "25%", val: 0.25 },
                  { label: "50%", val: 0.5 },
                  { label: "75%", val: 0.75 },
                  { label: "Max", val: 1.0 },
                ].map((chip) => (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => handlePercentage(chip.val)}
                    className="py-1.5 rounded-lg bg-[#0f212e] hover:bg-[#213743] border border-[#213743] hover:border-[#2f4553] text-[#b1bad3] hover:text-white text-xs font-bold font-mono transition-all cursor-pointer"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback alert */}
            {feedback && (
              <div
                className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-semibold animate-in fade-in ${
                  feedback.type === "success"
                    ? "bg-[#00e701]/10 border-[#00e701]/30 text-[#00e701]"
                    : "bg-red-500/10 border-red-500/30 text-red-400"
                }`}
              >
                {feedback.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-[#00e701]" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                )}
                <span>{feedback.message}</span>
              </div>
            )}

            {/* Submit Action Button */}
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl font-black text-sm text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-500/25 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>{tab === "deposit" ? "Transfer into Vault" : "Withdraw from Vault"}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

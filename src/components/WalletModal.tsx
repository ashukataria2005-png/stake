"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Check,
  Building,
  Smartphone,
  Copy,
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import { sounds } from "@/utils/audio";
import FiatCoinIcon from "@/components/FiatCoinIcon";
import CryptoIcon from "@/components/CryptoIcon";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TransactionRecord {
  id: string;
  type: "Deposit" | "Withdraw";
  amount: number;
  currency: string;
  date: string;
  status: "Confirmed" | "Processing";
  details?: string;
}

const QUICK_AMOUNTS = [300, 500, 1000, 5000, 10000, 25000];

export default function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const router = useRouter();
  const { balance, updateBalance, currency, formatDisplayBalance } = useGame();

  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw">("deposit");

  // Deposit Tab State
  const [depositAmount, setDepositAmount] = useState<string>("500");
  const [selectedQuickChip, setSelectedQuickChip] = useState<number>(500);

  // Withdrawal Tab State
  const [withdrawMethod, setWithdrawMethod] = useState<"upi" | "bank">("upi");
  const [withdrawAmount, setWithdrawAmount] = useState<string>("500");
  const [upiId, setUpiId] = useState<string>("");
  const [bankAccount, setBankAccount] = useState<string>("");
  const [ifscCode, setIfscCode] = useState<string>("");
  const [accountHolder, setAccountHolder] = useState<string>("");
  const [withdrawSuccessMsg, setWithdrawSuccessMsg] = useState<string>("");
  const [isSubmittingWithdraw, setIsSubmittingWithdraw] = useState<boolean>(false);

  // Approximate balance in INR (rate 86.5)
  const inrBalance = Math.floor(balance * 86.5);
  const displayInfo = formatDisplayBalance();

  if (!isOpen) return null;

  const handleChipClick = (amt: number) => {
    setSelectedQuickChip(amt);
    setDepositAmount(amt.toString());
    sounds.playClick();
  };

  const handleAmountChange = (val: string) => {
    setDepositAmount(val);
    const num = parseFloat(val);
    if (QUICK_AMOUNTS.includes(num)) {
      setSelectedQuickChip(num);
    } else {
      setSelectedQuickChip(0);
    }
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(depositAmount);
    if (isNaN(num) || num < 300) {
      alert("Minimum deposit amount is ₹300. Please enter a valid amount.");
      return;
    }

    sounds.playClick();
    const orderId = `STK-DEP-${Date.now()}`;
    onClose();
    router.push(`/deposit/pay?orderId=${orderId}&amount=${num}`);
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(withdrawAmount);
    if (isNaN(num) || num < 500) {
      alert("Minimum withdrawal amount is ₹500.");
      return;
    }

    if (num > inrBalance) {
      alert(`Insufficient balance! Your current balance is ₹${inrBalance.toLocaleString("en-IN")}.`);
      return;
    }

    if (withdrawMethod === "upi" && (!upiId.trim() || !upiId.includes("@"))) {
      alert("Please enter a valid UPI ID (e.g. yourname@okhdfcbank).");
      return;
    }

    if (withdrawMethod === "bank") {
      if (!bankAccount.trim() || !ifscCode.trim() || !accountHolder.trim()) {
        alert("Please fill in all bank details (Account No, IFSC, Holder Name).");
        return;
      }
    }

    setIsSubmittingWithdraw(true);
    sounds.playClick();

    setTimeout(() => {
      // Deduct balance in USD equivalent
      const deductionUsd = num / 86.5;
      updateBalance(-deductionUsd);
      sounds.playCashout();
      setIsSubmittingWithdraw(false);

      // Save to notification drawer
      try {
        const savedNotifs = localStorage.getItem("stake_notifications");
        const existing = savedNotifs ? JSON.parse(savedNotifs) : [];
        const newNotif = {
          id: `notif-wd-${Date.now()}`,
          type: "Transactions",
          title: "Withdrawal Processed",
          description: `Your withdrawal of ₹${num.toLocaleString("en-IN")} via ${
            withdrawMethod === "upi" ? `UPI (${upiId})` : `Bank (${bankAccount.slice(-4)})`
          } has been submitted.`,
          time: "Just now",
          isRead: false,
          iconType: "withdrawal",
        };
        localStorage.setItem("stake_notifications", JSON.stringify([newNotif, ...existing]));
        window.dispatchEvent(new Event("stake_notifications_updated"));
      } catch {}

      setWithdrawSuccessMsg(
        `Withdrawal of ₹${num.toLocaleString("en-IN")} submitted successfully! Funds will reflect in your account shortly.`
      );

      setTimeout(() => {
        setWithdrawSuccessMsg("");
      }, 5000);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-lg rounded-2xl border border-[#213743] bg-[#1a2c38] shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between border-b border-[#213743] px-5 py-4 bg-[#14232f]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1475e1]/15 text-[#1475e1] border border-[#1475e1]/30">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Wallet & Recharge Gateway</h3>
              <div className="flex items-center gap-1.5 text-xs text-[#b1bad3]">
                <span>Active Balance:</span>
                <span className="font-mono text-[#00e701] font-bold">
                  ₹{inrBalance.toLocaleString("en-IN")}
                </span>
                <span className="text-[10px] text-[#7a889b]">
                  (${parseFloat(balance.toString()).toFixed(2)} USD)
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#b1bad3] hover:bg-[#213743] hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Primary Navigation Tabs: Deposit vs Withdrawal */}
        <div className="flex border-b border-[#213743] bg-[#14232f]/60 p-2 gap-2">
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab("deposit");
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
              activeTab === "deposit"
                ? "bg-[#1475e1] text-white shadow-lg shadow-[#1475e1]/20 border border-[#1475e1]"
                : "text-[#b1bad3] hover:text-white hover:bg-[#213743]/50"
            }`}
          >
            <ArrowDownLeft className="h-4 w-4" />
            <span>Deposit (UPI & QR)</span>
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab("withdraw");
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
              activeTab === "withdraw"
                ? "bg-[#213743] text-[#00e701] shadow-sm border border-[#00e701]/30"
                : "text-[#b1bad3] hover:text-white hover:bg-[#213743]/50"
            }`}
          >
            <ArrowUpRight className="h-4 w-4" />
            <span>Withdrawal</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* ============================================================== */}
          {/* TAB 1: DEPOSIT */}
          {/* ============================================================== */}
          {activeTab === "deposit" && (
            <form onSubmit={handleDepositSubmit} className="space-y-4 animate-in fade-in duration-150">
              {/* Header Note Banner */}
              <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-400">
                <Zap className="h-4 w-4 shrink-0 fill-current" />
                <span className="font-bold">Instant UPI & QR Code Deposit (0% Fee)</span>
              </div>

              {/* Amount Input with Currency Badge */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#b1bad3] uppercase tracking-wider flex justify-between">
                  <span>Enter Deposit Amount</span>
                  <span className="text-white font-mono">Min: ₹300</span>
                </label>
                <div className="flex items-center rounded-xl border border-[#213743] bg-[#0f212e] px-3.5 py-3 focus-within:border-[#1475e1] transition-colors shadow-inner">
                  {/* Left Rupee Coin Badge */}
                  <div className="flex items-center gap-1.5 mr-2.5 shrink-0">
                    <FiatCoinIcon currency="INR" size={24} className="w-6 h-6" />
                    <span className="text-base font-extrabold text-white">₹</span>
                  </div>
                  <input
                    type="number"
                    min="300"
                    step="1"
                    value={depositAmount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    placeholder="Enter amount (Min ₹300)"
                    className="w-full bg-transparent text-base sm:text-lg font-black text-white placeholder-[#7a889b] focus:outline-none font-mono"
                    required
                  />
                  {parseFloat(depositAmount) >= 300 && (
                    <span className="text-xs font-bold text-[#00e701] shrink-0 font-mono">
                      ₹{parseFloat(depositAmount || "0").toLocaleString("en-IN")}
                    </span>
                  )}
                </div>
              </div>

              {/* Quick Amount Selector Chips */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#7a889b] uppercase tracking-wider">
                  Quick Amount Selector
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {QUICK_AMOUNTS.map((amt) => {
                    const isSelected = selectedQuickChip === amt;
                    return (
                      <button
                        type="button"
                        key={amt}
                        onClick={() => handleChipClick(amt)}
                        className={`py-2 px-1 rounded-xl text-xs font-extrabold font-mono transition-all cursor-pointer border ${
                          isSelected
                            ? "bg-[#1475e1] text-white border-[#1475e1] shadow-md shadow-[#1475e1]/30 scale-[1.02]"
                            : "bg-[#0f212e] text-[#b1bad3] border-[#213743] hover:border-[#2f4553] hover:text-white"
                        }`}
                      >
                        ₹{amt.toLocaleString("en-IN")}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Supported Payment Methods Badge Row */}
              <div className="rounded-xl border border-[#213743] bg-[#0f212e] p-3 space-y-2">
                <div className="text-[11px] font-bold text-[#7a889b] uppercase tracking-wider">
                  Supported Instant Payment Apps
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { name: "Google Pay", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
                    { name: "PhonePe", color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
                    { name: "Paytm", color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" },
                    { name: "BHIM UPI", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
                    { name: "CRED UPI", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
                  ].map((app) => (
                    <span
                      key={app.name}
                      className={`rounded-lg border px-2.5 py-1 text-[11px] font-bold ${app.color}`}
                    >
                      {app.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button: Deposit Now */}
              <button
                type="submit"
                className="w-full rounded-xl bg-[#1475e1] hover:bg-[#1268c7] py-3.5 text-sm sm:text-base font-extrabold text-white shadow-xl shadow-[#1475e1]/25 transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Deposit Now</span>
                <span className="font-mono">
                  (₹{parseFloat(depositAmount || "300").toLocaleString("en-IN")})
                </span>
                <ArrowDownLeft className="h-4 w-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#7a889b]">
                <ShieldCheck className="h-3.5 w-3.5 text-[#00e701]" />
                <span>256-Bit Encrypted Payment Node • Instant Automated Crediting</span>
              </div>
            </form>
          )}

          {/* ============================================================== */}
          {/* TAB 2: WITHDRAWAL */}
          {/* ============================================================== */}
          {activeTab === "withdraw" && (
            <form onSubmit={handleWithdrawSubmit} className="space-y-4 animate-in fade-in duration-150">
              {/* Success Notification Banner */}
              {withdrawSuccessMsg && (
                <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/15 p-3 text-xs font-bold text-emerald-400 flex items-center gap-2">
                  <Check className="h-4 w-4 shrink-0" />
                  <span>{withdrawSuccessMsg}</span>
                </div>
              )}

              {/* Available Balance Box */}
              <div className="rounded-xl border border-[#213743] bg-[#0f212e] p-3.5 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold uppercase text-[#7a889b]">
                    Withdrawable Balance
                  </div>
                  <div className="text-xl font-black text-white font-mono">
                    ₹{inrBalance.toLocaleString("en-IN")}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setWithdrawAmount(inrBalance.toString())}
                  className="rounded-lg bg-[#213743] hover:bg-[#2f4553] px-3 py-1.5 text-xs font-bold text-[#00e701] transition-colors"
                >
                  Max All
                </button>
              </div>

              {/* Method Selector: UPI vs Direct Bank */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#b1bad3]">
                  Withdrawal Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setWithdrawMethod("upi")}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-extrabold transition-all cursor-pointer ${
                      withdrawMethod === "upi"
                        ? "bg-[#1475e1] border-[#1475e1] text-white shadow-md"
                        : "bg-[#0f212e] border-[#213743] text-[#b1bad3] hover:text-white"
                    }`}
                  >
                    <Smartphone className="h-4 w-4" />
                    <span>UPI Transfer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setWithdrawMethod("bank")}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-extrabold transition-all cursor-pointer ${
                      withdrawMethod === "bank"
                        ? "bg-[#1475e1] border-[#1475e1] text-white shadow-md"
                        : "bg-[#0f212e] border-[#213743] text-[#b1bad3] hover:text-white"
                    }`}
                  >
                    <Building className="h-4 w-4" />
                    <span>Bank Account (IMPS)</span>
                  </button>
                </div>
              </div>

              {/* Amount Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#b1bad3] uppercase tracking-wider flex justify-between">
                  <span>Withdrawal Amount</span>
                  <span className="text-white font-mono">Min: ₹500</span>
                </label>
                <div className="flex items-center rounded-xl border border-[#213743] bg-[#0f212e] px-3.5 py-3 focus-within:border-[#1475e1] transition-colors">
                  <span className="text-base font-extrabold text-[#00e701] mr-2">₹</span>
                  <input
                    type="number"
                    min="500"
                    max={inrBalance}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Enter amount (Min ₹500)"
                    className="w-full bg-transparent text-base font-bold text-white placeholder-[#7a889b] focus:outline-none font-mono"
                    required
                  />
                </div>
              </div>

              {/* Form Fields: UPI vs Bank */}
              {withdrawMethod === "upi" ? (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#b1bad3]">
                    Your UPI ID (VPA)
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. mobile@paytm or name@okhdfcbank"
                    className="w-full rounded-xl border border-[#213743] bg-[#0f212e] px-3.5 py-2.5 text-xs font-bold text-white placeholder-[#7a889b] focus:border-[#1475e1] focus:outline-none"
                    required
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#b1bad3]">
                      Account Holder Name
                    </label>
                    <input
                      type="text"
                      value={accountHolder}
                      onChange={(e) => setAccountHolder(e.target.value)}
                      placeholder="Account holder name as per bank"
                      className="w-full rounded-xl border border-[#213743] bg-[#0f212e] px-3.5 py-2 text-xs font-bold text-white placeholder-[#7a889b] focus:border-[#1475e1] focus:outline-none"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-[#b1bad3]">
                        Bank Account Number
                      </label>
                      <input
                        type="text"
                        value={bankAccount}
                        onChange={(e) => setBankAccount(e.target.value)}
                        placeholder="Account Number"
                        className="w-full rounded-xl border border-[#213743] bg-[#0f212e] px-3.5 py-2 text-xs font-bold text-white placeholder-[#7a889b] focus:border-[#1475e1] focus:outline-none font-mono"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-[#b1bad3]">
                        IFSC Code
                      </label>
                      <input
                        type="text"
                        value={ifscCode}
                        onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                        placeholder="HDFC0001234"
                        className="w-full rounded-xl border border-[#213743] bg-[#0f212e] px-3.5 py-2 text-xs font-bold text-white placeholder-[#7a889b] focus:border-[#1475e1] focus:outline-none font-mono uppercase"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Withdrawal Request Button */}
              <button
                type="submit"
                disabled={isSubmittingWithdraw}
                className="w-full rounded-xl bg-[#213743] hover:bg-[#2f4553] text-[#00e701] border border-[#00e701]/30 py-3.5 text-sm font-extrabold shadow-lg transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmittingWithdraw ? (
                  <span>Processing Withdrawal...</span>
                ) : (
                  <>
                    <span>Submit Withdrawal Request</span>
                    <span className="font-mono">
                      (₹{parseFloat(withdrawAmount || "500").toLocaleString("en-IN")})
                    </span>
                    <ArrowUpRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

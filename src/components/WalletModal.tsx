"use client";

import React, { useState, useEffect } from "react";
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
  History,
  Clock,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import { sounds } from "@/utils/audio";
import FiatCoinIcon from "@/components/FiatCoinIcon";
import CryptoIcon from "@/components/CryptoIcon";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface DepositOrder {
  orderId: string;
  amountINR: number;
  amountUSD: number;
  date: string;
  status: "Pending UTR" | "Success";
  utr: string | null;
}

export interface WithdrawalOrder {
  id: string;
  amountINR: number;
  destination: string;
  method: "upi" | "bank";
  date: string;
  status: "Processing" | "Completed";
}

const QUICK_AMOUNTS = [300, 500, 1000, 5000, 10000, 25000];

export default function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const router = useRouter();
  const { balance, updateBalance, currency, formatDisplayBalance } = useGame();

  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw">("deposit");

  // Sub-view toggles for ledger history
  const [depositSubView, setDepositSubView] = useState<"form" | "history">("form");
  const [withdrawSubView, setWithdrawSubView] = useState<"form" | "history">("form");

  // Deposit Tab State
  const [depositAmount, setDepositAmount] = useState<string>("500");
  const [selectedQuickChip, setSelectedQuickChip] = useState<number>(500);

  // Deposit Orders Ledger state
  const [depositOrders, setDepositOrders] = useState<DepositOrder[]>([]);
  const [selectedPendingOrder, setSelectedPendingOrder] = useState<DepositOrder | null>(null);
  const [reverifyUtrInput, setReverifyUtrInput] = useState<string>("");
  const [reverifyError, setReverifyError] = useState<string>("");
  const [reverifySuccessMsg, setReverifySuccessMsg] = useState<string>("");
  const [isReverifying, setIsReverifying] = useState<boolean>(false);

  // Withdrawal Tab State
  const [withdrawMethod, setWithdrawMethod] = useState<"upi" | "bank">("upi");
  const [withdrawAmount, setWithdrawAmount] = useState<string>("500");
  const [upiId, setUpiId] = useState<string>("");
  const [bankAccount, setBankAccount] = useState<string>("");
  const [ifscCode, setIfscCode] = useState<string>("");
  const [accountHolder, setAccountHolder] = useState<string>("");
  const [withdrawSuccessMsg, setWithdrawSuccessMsg] = useState<string>("");
  const [isSubmittingWithdraw, setIsSubmittingWithdraw] = useState<boolean>(false);
  const [withdrawalOrders, setWithdrawalOrders] = useState<WithdrawalOrder[]>([]);

  // Approximate balance in INR (rate 86.5)
  const inrBalance = Math.floor(balance * 86.5);
  const displayInfo = formatDisplayBalance();

  // Load persistent orders from localStorage
  const loadLedgers = () => {
    try {
      const savedDep = localStorage.getItem("stake_deposit_orders");
      if (savedDep) {
        setDepositOrders(JSON.parse(savedDep));
      }
      const savedWd = localStorage.getItem("stake_withdrawals");
      if (savedWd) {
        setWithdrawalOrders(JSON.parse(savedWd));
      }
    } catch (e) {
      console.error("Failed to load ledgers", e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadLedgers();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleUpdate = () => loadLedgers();
    window.addEventListener("stake_deposit_orders_updated", handleUpdate);
    return () => window.removeEventListener("stake_deposit_orders_updated", handleUpdate);
  }, []);

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

    // Create persistent record in localStorage (stake_deposit_orders)
    const newOrder: DepositOrder = {
      orderId,
      amountINR: num,
      amountUSD: parseFloat((num / 86.5).toFixed(2)),
      date: new Date().toLocaleString(),
      status: "Pending UTR",
      utr: null,
    };

    try {
      const updated = [newOrder, ...depositOrders];
      setDepositOrders(updated);
      localStorage.setItem("stake_deposit_orders", JSON.stringify(updated));
      window.dispatchEvent(new Event("stake_deposit_orders_updated"));
    } catch (err) {
      console.error("Failed to save deposit order", err);
    }

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
      updateBalance(-deductionUsd, true);
      sounds.playCashout();
      setIsSubmittingWithdraw(false);

      const destination =
        withdrawMethod === "upi"
          ? `UPI (${upiId})`
          : `Bank (${bankAccount.slice(-4)}) - ${ifscCode}`;

      // Save to withdrawals ledger (stake_withdrawals)
      const newWithdrawal: WithdrawalOrder = {
        id: `STK-WD-${Date.now()}`,
        amountINR: num,
        destination,
        method: withdrawMethod,
        date: new Date().toLocaleString(),
        status: "Processing",
      };

      try {
        const updatedWd = [newWithdrawal, ...withdrawalOrders];
        setWithdrawalOrders(updatedWd);
        localStorage.setItem("stake_withdrawals", JSON.stringify(updatedWd));
      } catch {}

      // Save to notification drawer
      try {
        const savedNotifs = localStorage.getItem("stake_notifications");
        const existing = savedNotifs ? JSON.parse(savedNotifs) : [];
        const newNotif = {
          id: `notif-wd-${Date.now()}`,
          type: "Transactions",
          title: "Withdrawal Processed",
          description: `Your withdrawal of ₹${num.toLocaleString("en-IN")} via ${destination} has been submitted.`,
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

  // Re-verify pending UTR directly inside history modal
  const handleReverifyUtr = (order: DepositOrder) => {
    const cleanUtr = reverifyUtrInput.replace(/\D/g, "").slice(0, 12);
    if (cleanUtr.length !== 12) {
      setReverifyError("Please enter a valid 12-digit numeric UTR.");
      return;
    }

    setReverifyError("");
    setIsReverifying(true);
    sounds.playClick();

    setTimeout(() => {
      // Credit balance
      const creditedUsd = order.amountINR / 86.5;
      updateBalance(creditedUsd, true);

      // Update order status in ledger
      const updated = depositOrders.map((o) =>
        o.orderId === order.orderId ? { ...o, status: "Success" as const, utr: cleanUtr } : o
      );
      setDepositOrders(updated);
      try {
        localStorage.setItem("stake_deposit_orders", JSON.stringify(updated));
        window.dispatchEvent(new Event("stake_deposit_orders_updated"));
      } catch {}

      // Notification
      try {
        const savedNotifs = localStorage.getItem("stake_notifications");
        const existing = savedNotifs ? JSON.parse(savedNotifs) : [];
        const newNotif = {
          id: `notif-dep-${Date.now()}`,
          type: "Transactions",
          title: "Deposit Verified! 💰",
          description: `₹${order.amountINR.toLocaleString("en-IN")} (UTR: ${cleanUtr}) has been credited.`,
          timestamp: "Just now",
          isUnread: true,
          link: "/casino/home",
        };
        localStorage.setItem("stake_notifications", JSON.stringify([newNotif, ...existing]));
        window.dispatchEvent(new Event("stake_notifications_updated"));
      } catch {}

      sounds.playCashout();
      setIsReverifying(false);
      setReverifySuccessMsg(`₹${order.amountINR} credited successfully to your active balance!`);
      setTimeout(() => {
        setReverifySuccessMsg("");
        setSelectedPendingOrder(null);
        setReverifyUtrInput("");
      }, 2500);
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
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* ============================================================== */}
          {/* TAB 1: DEPOSIT */}
          {/* ============================================================== */}
          {activeTab === "deposit" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Sub-navigation: Recharge Form vs Deposit History */}
              <div className="flex items-center justify-between pb-2 border-b border-[#213743]">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setDepositSubView("form");
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      depositSubView === "form"
                        ? "bg-[#213743] text-white"
                        : "text-[#b1bad3] hover:text-white"
                    }`}
                  >
                    Deposit Now
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setDepositSubView("history");
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      depositSubView === "history"
                        ? "bg-[#213743] text-[#00e701]"
                        : "text-[#b1bad3] hover:text-white"
                    }`}
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>Deposit History</span>
                    {depositOrders.filter((o) => o.status === "Pending UTR").length > 0 && (
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                    )}
                  </button>
                </div>
              </div>

              {depositSubView === "form" ? (
                <form onSubmit={handleDepositSubmit} className="space-y-4">
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
              ) : (
                /* DEPOSIT HISTORY LIST */
                <div className="space-y-3">
                  {reverifySuccessMsg && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      <span>{reverifySuccessMsg}</span>
                    </div>
                  )}

                  {/* Re-verify pending UTR modal / drawer inside history */}
                  {selectedPendingOrder && (
                    <div className="p-4 rounded-xl bg-[#0f212e] border border-amber-500/40 space-y-3 shadow-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-400" />
                          <span className="text-xs font-bold text-white">
                            Verify Order: {selectedPendingOrder.orderId}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedPendingOrder(null)}
                          className="text-[#b1bad3] hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-xs text-[#b1bad3]">
                        Amount: <span className="font-bold text-[#00e701]">₹{selectedPendingOrder.amountINR}</span> • Date: {selectedPendingOrder.date}
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-[11px] text-[#b1bad3] font-semibold">
                          Enter 12-Digit UTR to Credit Balance Instantly:
                        </label>
                        <input
                          type="text"
                          maxLength={12}
                          value={reverifyUtrInput}
                          onChange={(e) => setReverifyUtrInput(e.target.value.replace(/\D/g, "").slice(0, 12))}
                          placeholder="4278XXXXXXXX"
                          className="w-full bg-[#1a2c38] border border-[#213743] rounded-lg px-3 py-2 text-xs font-mono text-white outline-none focus:border-[#1475e1]"
                        />
                        {reverifyError && <p className="text-[11px] text-red-400 font-semibold">{reverifyError}</p>}

                        <div className="flex gap-2 mt-1">
                          <button
                            type="button"
                            disabled={isReverifying}
                            onClick={() => handleReverifyUtr(selectedPendingOrder)}
                            className="flex-1 bg-[#00e701] text-black font-extrabold text-xs py-2.5 rounded-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            {isReverifying ? (
                              <span>Verifying...</span>
                            ) : (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Verify & Credit Now</span>
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              router.push(
                                `/deposit/pay?orderId=${selectedPendingOrder.orderId}&amount=${selectedPendingOrder.amountINR}`
                              );
                            }}
                            className="px-3 bg-[#213743] hover:bg-[#2f4553] text-white text-xs font-bold rounded-lg border border-[#2f4553] flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Open QR Page</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {depositOrders.length === 0 ? (
                    <div className="text-center py-8 text-[#7a889b] text-xs">
                      No deposit records found yet.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                      {depositOrders.map((ord) => (
                        <div
                          key={ord.orderId}
                          className="p-3 rounded-xl bg-[#0f212e] border border-[#213743] hover:border-[#2f4553] flex items-center justify-between gap-3 text-xs transition-colors"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-white text-sm">
                                ₹{ord.amountINR.toLocaleString("en-IN")}
                              </span>
                              <span className="text-[10px] text-[#7a889b]">
                                (${ord.amountUSD} USD)
                              </span>
                            </div>
                            <div className="text-[11px] font-mono text-[#b1bad3] mt-0.5">
                              {ord.orderId}
                            </div>
                            <div className="text-[10px] text-[#7a889b] mt-0.5">{ord.date}</div>
                            {ord.utr && (
                              <div className="text-[10px] text-[#00e701] font-mono mt-0.5">
                                UTR: {ord.utr}
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col items-end gap-1.5 shrink-0">
                            {ord.status === "Success" ? (
                              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-[#00e701] border border-[#00e701]/30 text-[11px] font-bold flex items-center gap-1">
                                <Check className="w-3 h-3" /> Success
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedPendingOrder(ord);
                                  setReverifyUtrInput("");
                                  setReverifyError("");
                                  sounds.playClick();
                                }}
                                className="px-2.5 py-1 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                              >
                                <Clock className="w-3 h-3 animate-pulse" />
                                <span>Pending UTR</span>
                                <ChevronRight className="w-3 h-3 ml-0.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: WITHDRAWAL */}
          {/* ============================================================== */}
          {activeTab === "withdraw" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Sub-navigation: Request Form vs Withdrawal History */}
              <div className="flex items-center justify-between pb-2 border-b border-[#213743]">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setWithdrawSubView("form");
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      withdrawSubView === "form"
                        ? "bg-[#213743] text-white"
                        : "text-[#b1bad3] hover:text-white"
                    }`}
                  >
                    Request Withdrawal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setWithdrawSubView("history");
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      withdrawSubView === "history"
                        ? "bg-[#213743] text-[#00e701]"
                        : "text-[#b1bad3] hover:text-white"
                    }`}
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>Withdrawal History</span>
                    {withdrawalOrders.length > 0 && (
                      <span className="text-[10px] bg-[#2f4553] px-1.5 py-0.5 rounded-full text-white">
                        {withdrawalOrders.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {withdrawSubView === "form" ? (
                <form onSubmit={handleWithdrawSubmit} className="space-y-4">
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
                      className="rounded-lg bg-[#213743] hover:bg-[#2f4553] px-3 py-1.5 text-xs font-bold text-[#00e701] transition-colors cursor-pointer"
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
              ) : (
                /* WITHDRAWAL HISTORY LIST */
                <div className="space-y-3">
                  {withdrawalOrders.length === 0 ? (
                    <div className="text-center py-8 text-[#7a889b] text-xs">
                      No withdrawal records found yet.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                      {withdrawalOrders.map((wd) => (
                        <div
                          key={wd.id}
                          className="p-3 rounded-xl bg-[#0f212e] border border-[#213743] hover:border-[#2f4553] flex items-center justify-between gap-3 text-xs transition-colors"
                        >
                          <div>
                            <div className="font-mono font-bold text-white text-sm">
                              ₹{wd.amountINR.toLocaleString("en-IN")}
                            </div>
                            <div className="text-[11px] text-[#b1bad3] mt-0.5">{wd.destination}</div>
                            <div className="text-[10px] text-[#7a889b] mt-0.5">{wd.date}</div>
                          </div>

                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[11px] font-bold flex items-center gap-1">
                              <Clock className="w-3 h-3 animate-pulse" />
                              <span>{wd.status}</span>
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

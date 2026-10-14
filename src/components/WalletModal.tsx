"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  X,
  Wallet,
  ArrowLeft,
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
  Upload,
  CheckCircle2,
  Tag,
  Sparkles,
  AlertTriangle,
  Loader2,
  Gift,
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import { sounds } from "@/utils/audio";
import { compressImage } from "@/utils/image";
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
  status: "Pending UTR" | "Success" | "Pending";
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
  const { balance, realBalance, updateBalance, syncWalletBalance, currency, formatDisplayBalance, user } = useGame();

  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw">("deposit");

  // Client mount state for React Portal
  const [mounted, setMounted] = useState<boolean>(false);

  // Deposit Tab State (Step: Amount Selection -> QR Code & UTR Submission)
  const [depositStep, setDepositStep] = useState<"amount" | "qr">("amount");
  const [depositAmount, setDepositAmount] = useState<string>("500");
  const [selectedQuickChip, setSelectedQuickChip] = useState<number>(500);
  const [minDepositAmount, setMinDepositAmount] = useState<number>(100);
  const [minWithdrawalAmount, setMinWithdrawalAmount] = useState<number>(500);
  const [currentOrderId, setCurrentOrderId] = useState<string>("");
  const [utrInput, setUtrInput] = useState<string>("");
  const [utrError, setUtrError] = useState<string>("");
  const [isSubmittingUtr, setIsSubmittingUtr] = useState<boolean>(false);
  const [depositSuccessMsg, setDepositSuccessMsg] = useState<string>("");
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);

  // Screenshot upload state
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [screenshotFeedback, setScreenshotFeedback] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discountPercent: number;
    discountAmount: number;
    payableAmount: number;
    creditedAmount: number;
    maxDepositLimit: number;
  } | null>(null);
  const [promoInput, setPromoInput] = useState<string>("");
  const [promoError, setPromoError] = useState<string>("");
  const [isApplyingPromo, setIsApplyingPromo] = useState<boolean>(false);
  const [selectedBonusOffer, setSelectedBonusOffer] = useState<string>("none");

  const baseDepositNum = Math.max(minDepositAmount, parseFloat(depositAmount || String(minDepositAmount)) || minDepositAmount);
  const finalPayableAmount = appliedPromo ? appliedPromo.payableAmount : baseDepositNum;
  const finalCreditAmount = appliedPromo ? appliedPromo.creditedAmount : baseDepositNum;

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setIsApplyingPromo(true);
    setPromoError("");
    const num = Math.max(minDepositAmount, parseFloat(depositAmount || String(minDepositAmount)) || minDepositAmount);

    try {
      const res = await fetch(
        `/api/promotions?code=${encodeURIComponent(promoInput.trim().toUpperCase())}&amount=${num}`
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Invalid promo voucher code");
      }
      setAppliedPromo({
        code: data.promo?.code || promoInput.trim().toUpperCase(),
        discountPercent: data.discountPercent,
        discountAmount: data.discountAmount,
        payableAmount: data.payableAmount,
        creditedAmount: data.creditedAmount,
        maxDepositLimit: data.maxDepositLimit,
      });
      sounds.playCashout();
    } catch (err: any) {
      setPromoError(err?.message || "Invalid or expired promo code");
      setAppliedPromo(null);
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoInput("");
    setPromoError("");
    sounds.playClick();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please upload an image file (PNG, JPG, or WEBP).");
        return;
      }
      try {
        const compressedBase64 = await compressImage(file);
        setScreenshotPreview(compressedBase64);
        setScreenshotFeedback("Screenshot uploaded & verified");
        sounds.playClick();
      } catch (err) {
        console.error("Screenshot upload failed:", err);
      }
    }
  };

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

  // Active currency balance resolution (reads exact active currency without double conversion)
  const displayInfo = formatDisplayBalance(realBalance);
  const inrBalance = Math.floor(realBalance * 86.5);

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
    setMounted(true);
  }, []);

  const [receiverUpi, setReceiverUpi] = useState<string>("stakeofficial@upi");
  const [receiverName, setReceiverName] = useState<string>("Stake Casino");
  const [gatewayMode, setGatewayMode] = useState<"MANUAL" | "LGPAY_AUTO">("MANUAL");
  const [isRedirectingToGateway, setIsRedirectingToGateway] = useState<boolean>(false);
  const [gatewayError, setGatewayError] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      loadLedgers();
      setGatewayError("");
      fetch("/api/admin/settings")
        .then((r) => r.json())
        .then((data) => {
          if (data?.success && data?.settings) {
            if (data.settings.upiId) setReceiverUpi(data.settings.upiId);
            if (data.settings.upiName) setReceiverName(data.settings.upiName);
            if (data.settings.gatewayMode) setGatewayMode(data.settings.gatewayMode);
            if (data.settings.minDepositAmount !== undefined) setMinDepositAmount(Number(data.settings.minDepositAmount));
            if (data.settings.minWithdrawalAmount !== undefined) setMinWithdrawalAmount(Number(data.settings.minWithdrawalAmount));
          }
        })
        .catch(() => { });
    } else {
      setDepositStep("amount");
      setUtrInput("");
      setUtrError("");
      setDepositSuccessMsg("");
      setGatewayError("");
      setIsRedirectingToGateway(false);
      setScreenshotPreview(null);
      setScreenshotFeedback("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [isOpen]);

  useEffect(() => {
    const handleUpdate = () => loadLedgers();
    window.addEventListener("stake_deposit_orders_updated", handleUpdate);
    return () => window.removeEventListener("stake_deposit_orders_updated", handleUpdate);
  }, []);

  const handleCloseModal = () => {
    setDepositStep("amount");
    setUtrInput("");
    setUtrError("");
    setDepositSuccessMsg("");
    setGatewayError("");
    onClose();
  };

  if (!isOpen || !mounted) return null;

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

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(depositAmount);
    if (isNaN(num) || num < minDepositAmount) {
      setGatewayError(`Minimum deposit amount is ₹${minDepositAmount}. Please enter a valid amount.`);
      return;
    }

    // Automatic Gateway mode
    if (gatewayMode === "LGPAY_AUTO" || (gatewayMode && gatewayMode !== "MANUAL")) {
      sounds.playClick();
      setIsRedirectingToGateway(true);
      setGatewayError("");
      try {
        const res = await fetch("/api/payment/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: finalPayableAmount,
            userId: user?.username || user?.id || "ashuk",
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success || !data.payUrl) {
          throw new Error(data.error || "Payment gateway returned an invalid response.");
        }

        const newOrder: DepositOrder = {
          orderId: data.orderId || `GW-${Date.now()}`,
          amountINR: finalPayableAmount,
          amountUSD: parseFloat((finalPayableAmount / 86.5).toFixed(2)),
          date: new Date().toLocaleString(),
          status: "Pending",
          utr: null,
        };

        try {
          const updated = [newOrder, ...depositOrders];
          setDepositOrders(updated);
          localStorage.setItem("stake_deposit_orders", JSON.stringify(updated));
          window.dispatchEvent(new Event("stake_deposit_orders_updated"));
        } catch { }

        // Immediate seamless redirect to gateway checkout
        window.location.href = data.payUrl;
        return;
      } catch (err: any) {
        console.error("[Universal Gateway Order Flow Error]:", err);
        setGatewayError(err.message || "Unable to connect to instant payment gateway. You can proceed via Manual UPI.");
        setIsRedirectingToGateway(false);
        return;
      }
    }

    sounds.playClick();
    const orderId = `STK-DEP-${Date.now()}`;
    setCurrentOrderId(orderId);

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

    // Seamlessly advance to QR Code & UTR input view inside the modal
    setDepositStep("qr");
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(receiverUpi);
    setCopiedUpi(true);
    sounds.playClick();
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  // UTR submission and balance crediting right inside the modal
  const handleUtrSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUtr = utrInput.replace(/\D/g, "").slice(0, 12);
    if (cleanUtr.length !== 12) {
      setUtrError("Please enter a valid 12-digit numeric UTR reference number.");
      return;
    }

    setUtrError("");
    setIsSubmittingUtr(true);
    sounds.playClick();

    const num = parseFloat(depositAmount || "500");

    // Dynamically resolve actual logged-in user from GameContext or localStorage
    const activeUser = user || (typeof window !== "undefined" ? (() => {
      try {
        const authRaw = localStorage.getItem("stake_clone_auth");
        if (authRaw) {
          const parsed = JSON.parse(authRaw);
          if (parsed?.user) return parsed.user;
        }
      } catch { }
      return null;
    })() : null);

    const currentUserId = (activeUser as any)?.id || activeUser?.name || activeUser?.email || "guest_player";
    const currentUsername = activeUser?.name || "guest_player";
    const currentUserEmail = activeUser?.email || (currentUsername.includes("@") ? currentUsername : `${currentUsername}@stake.internal`);

    try {
      console.log("[WalletModal] Submitting deposit to /api/wallet/deposit:", {
        userId: currentUserId,
        username: currentUsername,
        email: currentUserEmail,
        amount: num,
        currency: "INR",
        utrNumber: cleanUtr,
        hasScreenshot: Boolean(screenshotPreview),
      });

      // 1. Persist to Neon PostgreSQL Transaction with STRICT PENDING status and NO auto-credit
      const finalCreditAmount = appliedPromo ? appliedPromo.creditedAmount : num;
      const finalPayableAmount = appliedPromo ? appliedPromo.payableAmount : num;

      const res = await fetch("/api/wallet/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUserId,
          username: currentUsername,
          email: currentUserEmail,
          amount: finalCreditAmount,
          paidAmount: finalPayableAmount,
          promoCode: appliedPromo?.code || null,
          discountPercent: appliedPromo?.discountPercent || 0,
          currency: "INR",
          utrNumber: cleanUtr,
          screenshotUrl: screenshotPreview || null,
          orderId: currentOrderId,
          method: "UPI",
          status: "PENDING",
          autoCredit: false, // CRITICAL: NEVER auto-credit deposits
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.success) {
        const errorMsg = data?.error || `Server responded with HTTP ${res.status}`;
        throw new Error(errorMsg);
      }

      console.log("[WalletModal] Deposit persisted successfully in Neon DB (PENDING approval):", data.transaction);

      // CRITICAL: DO NOT CALL updateBalance! Wallet balance only updates upon ADMIN approval!

      // 3. Update order status in ledger as Pending
      const updated = depositOrders.map((o) =>
        o.orderId === currentOrderId ? { ...o, status: "Pending" as const, utr: cleanUtr } : o
      );
      setDepositOrders(updated);
      try {
        localStorage.setItem("stake_deposit_orders", JSON.stringify(updated));
        window.dispatchEvent(new Event("stake_deposit_orders_updated"));
      } catch { }

      // 4. Add Notification
      try {
        const savedNotifs = localStorage.getItem("stake_notifications");
        const existing = savedNotifs ? JSON.parse(savedNotifs) : [];
        const newNotif = {
          id: `notif-dep-${Date.now()}`,
          type: "Transactions",
          title: "Deposit Submitted ⏳",
          description: `₹${finalPayableAmount.toLocaleString("en-IN")} (UTR: ${cleanUtr}) submitted. Balance of ₹${finalCreditAmount.toLocaleString("en-IN")} will be credited once verified by Admin.`,
          timestamp: "Just now",
          isUnread: true,
          link: "/casino/home",
        };
        localStorage.setItem("stake_notifications", JSON.stringify([newNotif, ...existing]));
        window.dispatchEvent(new Event("stake_notifications_updated"));
      } catch { }

      sounds.playClick();
      setIsSubmittingUtr(false);
      setDepositSuccessMsg(`Deposit submitted! Awaiting Admin verification for ₹${finalCreditAmount.toLocaleString("en-IN")}.`);
      setTimeout(() => {
        setDepositSuccessMsg("");
        setDepositStep("amount");
        setUtrInput("");
        onClose();
      }, 2500);
    } catch (err: any) {
      console.error("[WalletModal] Deposit submission error:", err);
      setIsSubmittingUtr(false);
      const errMsg = err?.message || "Failed to save transaction to database.";
      setUtrError(`Deposit failed to record in database: ${errMsg}`);
      alert(`Deposit failed to record in database: ${errMsg}`);
      return;
    }
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(withdrawAmount);
    if (isNaN(num) || num < minWithdrawalAmount) {
      alert(`Minimum withdrawal amount is ₹${minWithdrawalAmount}.`);
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

    const targetUserId = user?.id || user?.username || "guest_player";
    fetch("/api/wallet/withdraw", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: targetUserId,
        amount: num,
        currency: "INR",
        method: withdrawMethod,
        details: {
          upiId: withdrawMethod === "upi" ? upiId : undefined,
          bankAccount: withdrawMethod === "bank" ? bankAccount : undefined,
          ifscCode: withdrawMethod === "bank" ? ifscCode : undefined,
          accountHolder: withdrawMethod === "bank" ? accountHolder : undefined,
        },
      }),
    })
      .then(async (res) => {
        setIsSubmittingWithdraw(false);
        const data = await res.json();
        if (!res.ok || data.error) {
          alert(data.error || "Failed to process withdrawal request.");
          return;
        }

        sounds.playCashout();
        // Live sync wallet balance safely from the server without double-deduction
        syncWalletBalance();

        const destination =
          withdrawMethod === "upi"
            ? `UPI (${upiId})`
            : `Bank (${bankAccount.slice(-4)}) - ${ifscCode}`;

        // Save to withdrawals ledger (stake_withdrawals)
        const newWithdrawal: WithdrawalOrder = {
          id: data.transaction?.id || `STK-WD-${Date.now()}`,
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
        } catch { }

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
        } catch { }

        setWithdrawSuccessMsg(
          `Withdrawal of ₹${num.toLocaleString("en-IN")} submitted successfully! Funds will reflect in your account shortly.`
        );

        setTimeout(() => {
          setWithdrawSuccessMsg("");
        }, 5000);
      })
      .catch((err) => {
        setIsSubmittingWithdraw(false);
        console.error("Withdraw DB sync error:", err);
        alert("Failed to submit withdrawal request. Please check your connection.");
      });
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
      // Persist to Neon PostgreSQL Transaction and Wallet tables
      fetch("/api/wallet/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: order.amountINR,
          currency: "INR",
          utrNumber: cleanUtr,
          orderId: order.orderId,
          method: "UPI",
          autoCredit: true,
        }),
      }).catch((err) => console.error("Reverify deposit DB sync error:", err));

      // Update order status in ledger
      const updated = depositOrders.map((o) =>
        o.orderId === order.orderId ? { ...o, status: "Success" as const, utr: cleanUtr } : o
      );
      setDepositOrders(updated);
      try {
        localStorage.setItem("stake_deposit_orders", JSON.stringify(updated));
        window.dispatchEvent(new Event("stake_deposit_orders_updated"));
      } catch { }

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
      } catch { }

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

  return createPortal(
    <div
      onClick={handleCloseModal}
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200 select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl border border-[#213743] bg-[#1a2c38] shadow-2xl overflow-hidden flex flex-col max-h-[94vh]"
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between border-b border-[#213743] px-4 py-3 bg-[#14232f]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1475e1]/15 text-[#1475e1] border border-[#1475e1]/30">
              <Wallet className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white">Wallet</h3>
              <div className="flex items-center gap-1.5 text-xs text-[#b1bad3]">
                <span>Active Balance:</span>
                <span className="font-mono text-[#00e701] font-bold">
                  {displayInfo.symbol}{displayInfo.amount} {displayInfo.code}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={handleCloseModal}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#b1bad3] hover:bg-[#213743] hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Primary Navigation Tabs: Deposit vs Withdrawal */}
        <div className="flex border-b border-[#213743] bg-[#14232f]/60 p-1.5 gap-1.5">
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab("deposit");
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${activeTab === "deposit"
              ? "bg-[#1475e1] text-white shadow-lg shadow-[#1475e1]/20 border border-[#1475e1]"
              : "text-[#b1bad3] hover:text-white hover:bg-[#213743]/50"
              }`}
          >
            <ArrowDownLeft className="h-4 w-4" />
            <span>Deposit</span>
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab("withdraw");
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${activeTab === "withdraw"
              ? "bg-[#213743] text-[#00e701] shadow-sm border border-[#00e701]/30"
              : "text-[#b1bad3] hover:text-white hover:bg-[#213743]/50"
              }`}
          >
            <ArrowUpRight className="h-4 w-4" />
            <span>Withdrawal</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-3.5 sm:p-5 overflow-y-auto space-y-3">
          {/* ============================================================== */}
          {/* TAB 1: DEPOSIT */}
          {/* ============================================================== */}
          {activeTab === "deposit" && (
            <div className="space-y-3 animate-in fade-in duration-150">
              {depositStep === "amount" ? (
                <form onSubmit={handleDepositSubmit} className="space-y-3">

                  {/* Amount Input with Currency Badge */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#b1bad3] uppercase tracking-wider flex justify-between">
                      <span>Enter Deposit Amount</span>
                      <span className="text-white font-mono">Min: ₹{minDepositAmount}</span>
                    </label>
                    <div className="flex items-center rounded-xl border border-[#213743] bg-[#0f212e] px-3.5 py-2.5 focus-within:border-[#1475e1] transition-colors shadow-inner">
                      {/* Left Rupee Coin Badge */}
                      <div className="flex items-center gap-1.5 mr-2.5 shrink-0">
                        <FiatCoinIcon currency="INR" size={22} className="w-5.5 h-5.5" />
                        <span className="text-base font-extrabold text-white">₹</span>
                      </div>
                      <input
                        type="number"
                        min={minDepositAmount}
                        step="1"
                        value={depositAmount}
                        onChange={(e) => handleAmountChange(e.target.value)}
                        placeholder={`Enter amount (Min ₹${minDepositAmount})`}
                        className="w-full bg-transparent text-base sm:text-lg font-black text-white placeholder-[#7a889b] focus:outline-none font-mono"
                        required
                      />
                      {parseFloat(depositAmount) >= minDepositAmount && (
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
                            className={`py-2 px-1 rounded-xl text-xs font-extrabold font-mono transition-all cursor-pointer border ${isSelected
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

                  {/* ========================================================
                        SELECT A BONUS OFFER DROPDOWN / DRAWER
                        ======================================================== */}
                  <div className="rounded-xl border border-[#213743] bg-[#0f212e] p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                        <Gift className="w-3.5 h-3.5 text-amber-400" />
                        <span>Select a Deposit Bonus</span>
                      </div>
                      <span className="text-[10px] text-[#00e701] font-bold">
                        Up to 500% + Free Spins
                      </span>
                    </div>
                    <div className="relative">
                      <select
                        value={selectedBonusOffer}
                        onChange={(e) => {
                          setSelectedBonusOffer(e.target.value);
                          sounds.playClick();
                        }}
                        className="w-full bg-[#1a2c38] border border-[#213743] focus:border-amber-400 rounded-xl px-3 py-2.5 text-white text-xs font-bold outline-none cursor-pointer appearance-none"
                      >
                        <option value="none">No Bonus (Standard Deposit)</option>
                        <option value="bonus-1">🎁 1st Deposit: 100% Bonus + 70 Free Spins</option>
                        <option value="bonus-2">🎁 2nd Deposit: 120% Bonus + 100 Free Spins</option>
                        <option value="bonus-3">🎁 3rd Deposit: 130% Bonus + 150 Free Spins</option>
                        <option value="bonus-4">🎁 4th Deposit: 150% Bonus + 180 Free Spins</option>
                      </select>
                      <ChevronRight className="w-4 h-4 text-[#557086] absolute right-3 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
                    </div>
                    {selectedBonusOffer !== "none" && (
                      <div className="text-[11px] font-semibold text-[#00e701] bg-[#00e701]/10 border border-[#00e701]/20 rounded-lg p-2 flex items-center gap-1.5 animate-in fade-in">
                        <Sparkles className="w-3.5 h-3.5 shrink-0" />
                        <span>Bonus active! Bonus credits and Free Spins will be allocated upon approval.</span>
                      </div>
                    )}
                  </div>

                  {/* ========================================================
                        HAVE A PROMO CODE? INPUT BOX & APPLY BUTTON
                        ======================================================== */}
                  <div className="rounded-xl border border-[#213743] bg-[#0f212e] p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                        <Tag className="w-3.5 h-3.5 text-amber-400" />
                        <span>Have a Promo Code?</span>
                      </div>
                      <span className="text-[10px] text-amber-400 font-mono font-bold">
                        e.g. WELCOME10, STAKE20
                      </span>
                    </div>

                    {appliedPromo ? (
                      <div className="bg-[#00e701]/10 border border-[#00e701]/30 rounded-lg p-2.5 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-[#00e701] text-black font-black text-xs font-mono uppercase">
                              {appliedPromo.code}
                            </span>
                            <span className="text-xs font-bold text-[#00e701]">
                              🎉 {appliedPromo.discountPercent}% Discount Applied!
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={handleRemovePromo}
                            className="text-xs font-bold text-[#b1bad3] hover:text-white flex items-center gap-1 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        </div>
                        <div className="flex items-center justify-between text-[11px] font-mono text-[#b1bad3] pt-1 border-t border-[#00e701]/20">
                          <span>You Pay via UPI: <strong className="text-amber-300">₹{finalPayableAmount}</strong></span>
                          <span>Wallet Credit: <strong className="text-[#00e701]">₹{finalCreditAmount}</strong></span>
                        </div>
                        <div className="text-[10px] text-[#00e701]/80">
                          ✓ Full ₹{finalCreditAmount} will be credited to your balance upon Admin approval!
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={promoInput}
                          onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                          placeholder="Enter Promo Code (e.g. WELCOME10)"
                          className="flex-1 px-3 py-2 bg-[#1a2c38] border border-[#213743] rounded-lg text-xs font-mono text-white uppercase placeholder-[#7a889b] focus:outline-none focus:border-amber-400"
                        />
                        <button
                          type="button"
                          onClick={handleApplyPromo}
                          disabled={isApplyingPromo || !promoInput.trim()}
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-lg transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1"
                        >
                          {isApplyingPromo ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Sparkles className="w-3 h-3" />
                          )}
                          <span>APPLY</span>
                        </button>
                      </div>
                    )}

                    {promoError && (
                      <div className="text-[11px] font-semibold text-rose-400 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>{promoError}</span>
                      </div>
                    )}
                  </div>

                  {/* In-Modal Gateway Error Banner */}
                  {gatewayError && (
                    <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div className="flex-1 space-y-1">
                        <p className="font-semibold">{gatewayError}</p>
                        <button
                          type="button"
                          onClick={() => {
                            setGatewayError("");
                            setDepositStep("qr");
                          }}
                          className="text-[11px] font-bold text-amber-300 hover:text-amber-200 underline cursor-pointer"
                        >
                          Proceed with Manual UPI / QR instead &rarr;
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Action Button: Clean simple Pay ₹{amount} > */}
                  <button
                    type="submit"
                    disabled={isRedirectingToGateway}
                    className="w-full rounded-xl bg-[#1475e1] hover:bg-[#1268c7] py-3 text-sm sm:text-base font-extrabold text-white shadow-xl shadow-[#1475e1]/25 transition-all active:scale-[0.99] flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    {isRedirectingToGateway ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Connecting to Payment Gateway...</span>
                      </>
                    ) : (
                      <span>Pay ₹{finalPayableAmount.toLocaleString("en-IN")} &gt;</span>
                    )}
                  </button>
                </form>
              ) : (
                /* QR CODE & UTR FORM (depositStep === "qr") */
                <div className="space-y-4 animate-in fade-in duration-200">
                  {/* Back button to change amount */}
                  <button
                    type="button"
                    onClick={() => setDepositStep("amount")}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#b1bad3] hover:text-white transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Change Deposit Amount</span>
                  </button>

                  {/* Success Notice if just credited */}
                  {depositSuccessMsg && (
                    <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center justify-center gap-2 shadow-lg animate-in zoom-in-95">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>{depositSuccessMsg}</span>
                    </div>
                  )}

                  {/* Order & Payment Summary Bar */}
                  <div className="p-3.5 rounded-xl bg-[#0f212e] border border-[#213743] flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-[#7a889b]">Order Reference</div>
                      <div className="font-mono text-xs font-bold text-white">{currentOrderId}</div>
                      {appliedPromo && (
                        <div className="text-[10px] text-[#00e701] font-mono mt-0.5">
                          Promo: {appliedPromo.code} ({appliedPromo.discountPercent}% OFF)
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-bold text-[#7a889b]">
                        {appliedPromo ? "Amount to Pay via UPI" : "Amount Due"}
                      </div>
                      <div className="font-mono text-base font-black text-[#00e701]">
                        ₹{finalPayableAmount.toLocaleString("en-IN")}
                      </div>
                      {appliedPromo && (
                        <div className="text-[10px] text-[#b1bad3] font-mono">
                          Wallet gets full ₹{finalCreditAmount.toLocaleString("en-IN")}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* QR Code Container */}
                  <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#0f212e] border border-[#213743] space-y-3">
                    <div className="text-xs font-bold text-white text-center">
                      Scan QR Code with any UPI App
                    </div>
                    <div className="p-3 bg-white rounded-xl shadow-lg border border-white/20">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                          `upi://pay?pa=${receiverUpi}&pn=${encodeURIComponent(receiverName)}&am=${finalPayableAmount.toFixed(2)}&cu=INR&tn=${currentOrderId}`
                        )}`}
                        alt="Deposit UPI QR Code"
                        className="w-36 h-36 sm:w-44 sm:h-44 object-contain"
                      />
                    </div>
                    <p className="text-[11px] text-[#7a889b] text-center font-medium">
                      Google Pay • PhonePe • Paytm • BHIM • CRED
                    </p>
                  </div>

                  {/* Copy UPI ID Bar */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#0f212e] border border-[#213743]">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-[#7a889b]">UPI ID (VPA)</span>
                      <span className="font-mono text-xs font-bold text-white">{receiverUpi}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#213743] hover:bg-[#2f4553] text-xs font-bold text-white transition-colors cursor-pointer"
                    >
                      {copiedUpi ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#00e701]" />
                          <span className="text-[#00e701]">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Step 2: 12-Digit UTR Form */}
                  <form onSubmit={handleUtrSubmit} className="space-y-3 pt-1">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#b1bad3] flex items-center justify-between">
                        <span>Enter 12-Digit UTR / Ref Number</span>
                        <span className="text-[10px] text-amber-400">Required for instant credit</span>
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={12}
                        value={utrInput}
                        onChange={(e) => {
                          setUtrInput(e.target.value.replace(/\D/g, "").slice(0, 12));
                          if (utrError) setUtrError("");
                        }}
                        placeholder="e.g. 427819283741"
                        className="w-full rounded-xl border border-[#213743] bg-[#0f212e] px-3.5 py-3 text-sm sm:text-base font-mono font-bold text-white placeholder-[#7a889b] focus:border-[#1475e1] focus:outline-none transition-colors"
                      />
                      {utrError && (
                        <div className="flex items-center gap-1.5 text-xs text-red-400 font-semibold mt-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{utrError}</span>
                        </div>
                      )}
                    </div>

                    {/* Payment Screenshot Upload with Live Preview & Remove option */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#b1bad3] flex items-center justify-between">
                        <span>Payment Screenshot / Receipt</span>
                        <span className="text-[10px] text-[#7a889b]">Optional for express audit</span>
                      </label>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />

                      {screenshotPreview ? (
                        <div className="border border-[#2f4553] bg-[#0f212e] rounded-xl p-2.5 flex items-center justify-between gap-3 animate-in fade-in">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={screenshotPreview}
                              alt="Receipt preview"
                              className="w-12 h-12 object-cover rounded-lg border border-[#213743] shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-white truncate">Receipt Attached</div>
                              <div className="text-[11px] text-[#00e701] flex items-center gap-1 font-semibold">
                                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                <span>{screenshotFeedback || "Screenshot uploaded successfully"}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="text-xs font-semibold text-[#b1bad3] hover:text-white px-2 py-1 bg-[#213743] hover:bg-[#2a4454] rounded-lg transition-colors cursor-pointer"
                            >
                              Change
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setScreenshotPreview(null);
                                setScreenshotFeedback("");
                                if (fileInputRef.current) fileInputRef.current.value = "";
                              }}
                              className="text-xs font-semibold text-red-400 hover:text-red-300 px-2 py-1 bg-[#213743] hover:bg-red-500/20 rounded-lg transition-colors cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="cursor-pointer border-2 border-dashed border-[#2f4553] hover:border-[#1475e1] bg-[#0f212e]/70 hover:bg-[#0f212e] rounded-xl p-3 flex items-center justify-center gap-2.5 transition-colors group text-center"
                        >
                          <div className="w-8 h-8 rounded-lg bg-[#213743] group-hover:bg-[#1475e1]/20 flex items-center justify-center text-[#b1bad3] group-hover:text-[#1475e1] transition-colors shrink-0">
                            <Upload className="w-4 h-4" />
                          </div>
                          <div className="text-left">
                            <div className="text-xs font-bold text-white group-hover:text-[#1475e1] transition-colors">
                              Upload Payment Screenshot
                            </div>
                            <div className="text-[10px] text-[#7a889b]">
                              PNG, JPG or receipt from GPay, PhonePe, Paytm
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingUtr || utrInput.replace(/\D/g, "").length !== 12}
                      className="w-full rounded-xl bg-[#00e701] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed py-3 text-sm font-black text-black shadow-lg shadow-[#00e701]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isSubmittingUtr ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Verifying UTR Reference...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>
                            Verify & Credit ₹{parseFloat(depositAmount || "3").toLocaleString("en-IN")}
                          </span>
                        </>
                      )}
                    </button>
                  </form>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1 text-[11px] text-[#7a889b]">
                      <ShieldCheck className="h-3.5 w-3.5 text-[#00e701]" />
                      <span>Instant Automated Node</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        handleCloseModal();
                        router.push(
                          `/deposit/pay?orderId=${currentOrderId}&amount=${depositAmount}`
                        );
                      }}
                      className="text-[11px] text-[#1475e1] hover:underline flex items-center gap-1"
                    >
                      <span>Full payment page</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: WITHDRAWAL */}
          {/* ============================================================== */}
          {activeTab === "withdraw" && (
            <div className="space-y-4 animate-in fade-in duration-150">
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
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-extrabold transition-all cursor-pointer ${withdrawMethod === "upi"
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
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-extrabold transition-all cursor-pointer ${withdrawMethod === "bank"
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
                    <span className="text-white font-mono">Min: ₹{minWithdrawalAmount}</span>
                  </label>
                  <div className="flex items-center rounded-xl border border-[#213743] bg-[#0f212e] px-3.5 py-3 focus-within:border-[#1475e1] transition-colors">
                    <span className="text-base font-extrabold text-[#00e701] mr-2">₹</span>
                    <input
                      type="number"
                      min={minWithdrawalAmount}
                      max={inrBalance}
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder={`Enter amount (Min ₹${minWithdrawalAmount})`}
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
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

"use client";

import React, { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  Copy,
  Check,
  ShieldCheck,
  AlertTriangle,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Loader2,
  ExternalLink,
  Info,
  Lock,
  Sparkles,
  Tag,
  Percent,
  X,
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import { sounds } from "@/utils/audio";
import { compressImage } from "@/utils/image";
import FiatCoinIcon from "@/components/FiatCoinIcon";

function DepositPayContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useGame();

  const rawOrderId = searchParams.get("orderId") || `STK-DEP-${Date.now()}`;
  const rawAmount = searchParams.get("amount") || "500";
  const baseAmount = Math.max(300, parseFloat(rawAmount) || 500);

  // Promo Code States
  const [promoInput, setPromoInput] = useState<string>("");
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discountPercent: number;
    discountAmount: number;
    payableAmount: number;
    creditedAmount: number;
    maxDepositLimit: number;
  } | null>(null);
  const [promoError, setPromoError] = useState<string>("");
  const [isApplyingPromo, setIsApplyingPromo] = useState<boolean>(false);

  // Dynamically compute payable vs wallet credited amounts
  const payableAmount = appliedPromo ? appliedPromo.payableAmount : baseAmount;
  const walletCreditAmount = appliedPromo ? appliedPromo.creditedAmount : baseAmount;

  // Merchant details (Amount payable via UPI)
  const [merchantUpi, setMerchantUpi] = useState<string>("stakeofficial@upi");
  const [merchantName, setMerchantName] = useState<string>("StakeGaming");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data?.success && data?.settings?.upiId) {
          setMerchantUpi(data.settings.upiId);
          if (data.settings.upiName) setMerchantName(data.settings.upiName);
        }
      })
      .catch(() => {});
  }, []);

  const upiUrl = `upi://pay?pa=${merchantUpi}&pn=${encodeURIComponent(
    merchantName
  )}&am=${payableAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(rawOrderId)}`;

  // 10:00 minutes countdown timer (600 seconds)
  const [timeLeft, setTimeLeft] = useState<number>(600);
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);
  const [copiedOrderId, setCopiedOrderId] = useState<boolean>(false);

  // Form states
  const [utrNumber, setUtrNumber] = useState<string>("");
  const [utrError, setUtrError] = useState<string>("");
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Submission state
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationStep, setVerificationStep] = useState<string>("");
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);

  // Apply Promo Handler
  const handleApplyPromo = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!promoInput.trim()) return;

    setIsApplyingPromo(true);
    setPromoError("");

    try {
      const res = await fetch(
        `/api/promotions?code=${encodeURIComponent(
          promoInput.trim().toUpperCase()
        )}&amount=${baseAmount}`
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

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(merchantUpi);
    setCopiedUpi(true);
    sounds.playClick();
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(rawOrderId);
    setCopiedOrderId(true);
    sounds.playClick();
    setTimeout(() => setCopiedOrderId(false), 2000);
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
        sounds.playClick();
      } catch (err) {
        console.error("Screenshot preview error:", err);
      }
    }
  };

  const handleUtrChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 12);
    setUtrNumber(val);
    if (val.length === 12) {
      setUtrError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (utrNumber.length !== 12) {
      setUtrError("Please enter a valid 12-digit UTR reference number.");
      return;
    }

    setUtrError("");
    setIsVerifying(true);
    setVerificationStep("Connecting to Banking Node & Admin Desk...");
    sounds.playClick();

    setTimeout(() => {
      setVerificationStep("Recording UTR and generating transaction ticket in database...");
    }, 600);

    // Dynamically resolve actual logged-in user from GameContext or localStorage
    const activeUser = user || (typeof window !== "undefined" ? (() => {
      try {
        const authRaw = localStorage.getItem("stake_clone_auth");
        if (authRaw) {
          const parsed = JSON.parse(authRaw);
          if (parsed?.user) return parsed.user;
        }
      } catch {}
      return null;
    })() : null);

    const currentUserId = (activeUser as any)?.id || activeUser?.name || activeUser?.email || "guest_player";
    const currentUsername = activeUser?.name || "guest_player";
    const currentUserEmail = activeUser?.email || (currentUsername.includes("@") ? currentUsername : `${currentUsername}@stake.internal`);

    try {
      console.log("[DepositPay] Submitting deposit to /api/wallet/deposit (strictly PENDING, NO auto-credit):", {
        userId: currentUserId,
        username: currentUsername,
        email: currentUserEmail,
        amount: walletCreditAmount,
        paidAmount: payableAmount,
        promoCode: appliedPromo?.code || null,
        discountPercent: appliedPromo?.discountPercent || 0,
        currency: "INR",
        utrNumber,
        orderId: rawOrderId,
        hasScreenshot: Boolean(screenshotPreview),
      });

      // STRICT: Submit transaction with status: PENDING and autoCredit: false
      const res = await fetch("/api/wallet/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUserId,
          username: currentUsername,
          email: currentUserEmail,
          amount: walletCreditAmount, // Amount credited once approved by Admin
          paidAmount: payableAmount, // Actual amount paid via UPI
          promoCode: appliedPromo?.code || null,
          discountPercent: appliedPromo?.discountPercent || 0,
          currency: "INR",
          utrNumber,
          screenshotUrl: screenshotPreview || null,
          orderId: rawOrderId,
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

      console.log("[DepositPay] Deposit record saved to Neon DB with PENDING status:", data.transaction);

      // CRITICAL FIX: DO NOT CALL updateBalance! Wallet balance will only update upon ADMIN approval.

      // 1. Add notification to drawer & localStorage
      try {
        const savedNotifs = localStorage.getItem("stake_notifications");
        const existing = savedNotifs ? JSON.parse(savedNotifs) : [];
        const newNotif = {
          id: `notif-dep-${Date.now()}`,
          type: "Transactions",
          title: "Deposit Submitted ⏳",
          description: `₹${payableAmount.toLocaleString("en-IN")} submitted via UPI (UTR: ${utrNumber}). Balance of ₹${walletCreditAmount.toLocaleString("en-IN")} will be credited once verified by Admin Desk.`,
          timestamp: "Just now",
          isUnread: true,
          link: "/casino/home",
          metadata: {
            amount: walletCreditAmount,
            paidAmount: payableAmount,
            promoCode: appliedPromo?.code || null,
            currency: "INR",
            utr: utrNumber,
            orderId: rawOrderId,
            status: "PENDING",
          },
        };
        localStorage.setItem("stake_notifications", JSON.stringify([newNotif, ...existing]));
        window.dispatchEvent(new Event("stake_notifications_updated"));
      } catch (err) {
        console.error("Failed to save deposit notification", err);
      }

      // 2. Update persistent deposit order ledger in stake_deposit_orders as Pending
      try {
        const savedOrders = localStorage.getItem("stake_deposit_orders");
        const existingOrders = savedOrders ? JSON.parse(savedOrders) : [];
        let orderFound = false;
        const updatedOrders = existingOrders.map((ord: any) => {
          if (ord.orderId === rawOrderId) {
            orderFound = true;
            return {
              ...ord,
              status: "Pending",
              utr: utrNumber,
              paidAmount: payableAmount,
              promoCode: appliedPromo?.code || null,
            };
          }
          return ord;
        });
        if (!orderFound) {
          updatedOrders.unshift({
            orderId: rawOrderId,
            amountINR: walletCreditAmount,
            paidAmount: payableAmount,
            promoCode: appliedPromo?.code || null,
            amountUSD: parseFloat((walletCreditAmount / 86.5).toFixed(2)),
            date: new Date().toLocaleString(),
            status: "Pending",
            utr: utrNumber,
          });
        }
        localStorage.setItem("stake_deposit_orders", JSON.stringify(updatedOrders));
        window.dispatchEvent(new Event("stake_deposit_orders_updated"));
      } catch (err) {
        console.error("Failed to update deposit orders", err);
      }

      // Audio notification chime
      sounds.playClick();

      setIsVerifying(false);
      setIsSuccessModalOpen(true);
    } catch (err: any) {
      console.error("[DepositPay] Database deposit submission failed:", err);
      setIsVerifying(false);
      const errMsg = err?.message || "Failed to persist deposit.";
      setUtrError(`Deposit failed to record in database: ${errMsg}`);
      alert(`Deposit failed to record in database: ${errMsg}`);
      return;
    }
  };

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(
    upiUrl
  )}&margin=10`;

  return (
    <div className="min-h-screen bg-[#071824] text-white flex flex-col justify-between py-4 px-3 sm:px-6">
      {/* Top Navigation */}
      <div className="max-w-xl mx-auto w-full mb-4">
        <div className="flex items-center justify-between py-2 border-b border-[#213743]">
          <Link
            href="/casino/home"
            className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#b1bad3] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Casino</span>
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-[#00e701] font-semibold bg-[#00e701]/10 px-2.5 py-1 rounded-full border border-[#00e701]/20">
            <Lock className="w-3 h-3" />
            <span>256-Bit SSL Encrypted Gateway</span>
          </div>
        </div>
      </div>

      {/* Main Checkout Container */}
      <div className="max-w-xl mx-auto w-full bg-[#0f212e] border border-[#213743] rounded-2xl shadow-2xl overflow-hidden">
        {/* Top Order & Timer Bar */}
        <div className="bg-[#1a2c38] px-4 py-4 sm:px-6 border-b border-[#213743]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] text-[#b1bad3] font-medium uppercase tracking-wider">
                Order ID
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs sm:text-sm font-mono text-white font-bold truncate max-w-[150px] sm:max-w-none">
                  {rawOrderId}
                </span>
                <button
                  type="button"
                  onClick={handleCopyOrderId}
                  className="text-[#b1bad3] hover:text-white transition-colors p-1"
                  title="Copy Order ID"
                >
                  {copiedOrderId ? (
                    <Check className="w-3.5 h-3.5 text-[#00e701]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[11px] text-[#b1bad3] font-medium uppercase tracking-wider">
                {appliedPromo ? "Discounted Total to Pay" : "Total Amount Due"}
              </div>
              <div className="flex flex-col items-end mt-0.5">
                <div className="text-xl sm:text-2xl font-black text-[#00e701] flex items-center justify-end gap-1.5">
                  <span>₹{payableAmount.toLocaleString("en-IN")}.00</span>
                  {appliedPromo && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#00e701]/20 border border-[#00e701]/40 text-[#00e701]">
                      {appliedPromo.discountPercent}% OFF
                    </span>
                  )}
                </div>
                {appliedPromo && (
                  <div className="text-[10px] text-[#b1bad3] font-mono">
                    Wallet gets full ₹{walletCreditAmount.toLocaleString("en-IN")}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Countdown Timer Alert */}
          <div
            className={`mt-3 flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold ${
              timeLeft < 120
                ? "bg-red-500/10 text-red-400 border border-red-500/30"
                : "bg-[#213743] text-[#b1bad3] border border-[#2f4553]"
            }`}
          >
            <div className="flex items-center gap-2">
              <Clock
                className={`w-4 h-4 ${
                  timeLeft < 120 ? "text-red-400 animate-pulse" : "text-[#1475e1]"
                }`}
              />
              <span>Payment expires in</span>
            </div>
            <span
              className={`font-mono text-sm font-bold ${
                timeLeft < 120 ? "text-red-400" : "text-white"
              }`}
            >
              {formatTimer(timeLeft)}
            </span>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-4 sm:p-6 space-y-6">
          {/* ========================================================
              PROMO CODE VOUCHER INPUT BOX
              ======================================================== */}
          <div className="bg-[#14232f] border border-[#213743] rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <Tag className="w-4 h-4 text-amber-400" />
                <span>Apply Promo Voucher & Deposit Discount</span>
              </div>
              <span className="text-[10px] text-amber-400/90 font-mono font-bold">
                e.g. WELCOME10, STAKE20
              </span>
            </div>

            {appliedPromo ? (
              <div className="bg-[#00e701]/10 border border-[#00e701]/30 rounded-lg p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#00e701] text-black font-black text-xs font-mono uppercase tracking-wider">
                      {appliedPromo.code}
                    </span>
                    <span className="text-xs font-extrabold text-[#00e701]">
                      🎉 {appliedPromo.discountPercent}% Instant Discount Applied!
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

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-[11px] font-mono border-t border-[#00e701]/20 text-[#b1bad3]">
                  <div>
                    <span className="text-slate-400">Selected Deposit:</span>{" "}
                    <span className="text-white font-bold">₹{baseAmount}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Discount ({appliedPromo.discountPercent}%):</span>{" "}
                    <span className="text-[#00e701] font-bold">-₹{appliedPromo.discountAmount}</span>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-slate-400">You Pay:</span>{" "}
                    <span className="text-amber-300 font-extrabold">₹{payableAmount}</span>
                  </div>
                </div>
                <div className="text-[10px] text-[#00e701]/80">
                  ✓ Full ₹{walletCreditAmount.toLocaleString("en-IN")} will be credited to your wallet balance once approved! (Promo cap: ₹{appliedPromo.maxDepositLimit.toLocaleString("en-IN")})
                </div>
              </div>
            ) : (
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                    placeholder="Enter Promo Code (e.g. WELCOME10)"
                    className="w-full px-3 py-2 bg-[#0a151d] border border-[#213743] rounded-lg text-xs font-mono text-white uppercase placeholder-[#557086] focus:outline-none focus:border-amber-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isApplyingPromo || !promoInput.trim()}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 active:scale-95 text-black font-extrabold text-xs rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
                >
                  {isApplyingPromo ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>APPLY</span>
                </button>
              </form>
            )}

            {promoError && (
              <div className="text-[11px] font-semibold text-rose-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{promoError}</span>
              </div>
            )}
          </div>

          {/* STEP 1: SCAN & PAY SECTION */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-[#1475e1] text-white text-xs font-black flex items-center justify-center">
                1
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                Scan QR Code with Any UPI App
              </h2>
            </div>

            <div className="bg-[#1a2c38] border border-[#213743] rounded-xl p-4 sm:p-5 flex flex-col items-center text-center">
              {/* QR Container */}
              <div className="relative bg-white p-3 rounded-2xl shadow-lg border-4 border-[#2f4553]">
                {/* Fallback image with clean QR render */}
                <img
                  src={qrImageUrl}
                  alt="UPI QR Code"
                  width={220}
                  height={220}
                  className="rounded-lg object-contain w-[180px] h-[180px] sm:w-[220px] sm:h-[220px]"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-10 h-10 rounded-full bg-[#0f212e] border-2 border-[#1475e1] flex items-center justify-center shadow-lg">
                    <span className="font-black text-white text-xs tracking-tighter">
                      Stake
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 text-xs text-[#b1bad3]">
                Scan to pay <span className="font-bold text-white">₹{payableAmount}</span> via Google Pay, PhonePe, Paytm, CRED or BHIM
              </div>

              {/* Merchant UPI Box with Copy */}
              <div className="mt-4 w-full bg-[#0f212e] border border-[#2f4553] rounded-xl p-3 flex items-center justify-between gap-2">
                <div className="text-left overflow-hidden">
                  <div className="text-[10px] text-[#b1bad3] uppercase tracking-wider font-semibold">
                    Official Merchant UPI VPA
                  </div>
                  <div className="text-xs sm:text-sm font-mono font-bold text-white truncate">
                    {merchantUpi}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="flex items-center gap-1 px-3 py-1.5 bg-[#213743] hover:bg-[#2f4553] active:scale-95 text-xs font-bold text-white rounded-lg border border-[#3b5569] transition-all shrink-0"
                >
                  {copiedUpi ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#00e701]" />
                      <span className="text-[#00e701]">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#b1bad3]" />
                      <span>Copy UPI</span>
                    </>
                  )}
                </button>
              </div>

              {/* Mobile Quick Intent Links */}
              <div className="w-full mt-4 pt-4 border-t border-[#213743]">
                <div className="text-[11px] font-semibold text-[#b1bad3] mb-2 uppercase tracking-wider">
                  Or Open Directly In Your UPI App
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <a
                    href={`phonepe://pay?pa=${merchantUpi}&pn=${encodeURIComponent(
                      merchantName
                    )}&am=${payableAmount}&cu=INR`}
                    className="flex flex-col items-center justify-center p-2 rounded-lg bg-[#213743] hover:bg-[#2f4553] border border-[#2f4553] text-[11px] font-bold text-white transition-all active:scale-95"
                  >
                    <span className="w-6 h-6 rounded-full bg-[#5f259f] flex items-center justify-center text-white text-[10px] font-black mb-1">
                      Pe
                    </span>
                    <span>PhonePe</span>
                  </a>

                  <a
                    href={`gpay://upi/pay?pa=${merchantUpi}&pn=${encodeURIComponent(
                      merchantName
                    )}&am=${payableAmount}&cu=INR`}
                    className="flex flex-col items-center justify-center p-2 rounded-lg bg-[#213743] hover:bg-[#2f4553] border border-[#2f4553] text-[11px] font-bold text-white transition-all active:scale-95"
                  >
                    <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-[#4285F4] text-[10px] font-black mb-1">
                      G
                    </span>
                    <span>GPay</span>
                  </a>

                  <a
                    href={`paytmmp://pay?pa=${merchantUpi}&pn=${encodeURIComponent(
                      merchantName
                    )}&am=${payableAmount}&cu=INR`}
                    className="flex flex-col items-center justify-center p-2 rounded-lg bg-[#213743] hover:bg-[#2f4553] border border-[#2f4553] text-[11px] font-bold text-white transition-all active:scale-95"
                  >
                    <span className="w-6 h-6 rounded-full bg-[#00baf2] flex items-center justify-center text-white text-[10px] font-black mb-1">
                      P
                    </span>
                    <span>Paytm</span>
                  </a>

                  <a
                    href={upiUrl}
                    className="flex flex-col items-center justify-center p-2 rounded-lg bg-[#213743] hover:bg-[#2f4553] border border-[#2f4553] text-[11px] font-bold text-white transition-all active:scale-95"
                  >
                    <span className="w-6 h-6 rounded-full bg-[#ff7700] flex items-center justify-center text-white text-[10px] font-black mb-1">
                      BH
                    </span>
                    <span>BHIM</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 2: PAYMENT VERIFICATION SECTION */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#1475e1] text-white text-xs font-black flex items-center justify-center">
                2
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                Submit 12-Digit UTR for Instant Credit
              </h2>
            </div>

            {/* UTR Input */}
            <div>
              <label className="block text-xs font-bold text-[#b1bad3] mb-1.5">
                12-Digit UTR / UPI Reference No. <span className="text-[#00e701]">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  value={utrNumber}
                  onChange={handleUtrChange}
                  placeholder="Enter 12-digit UTR Number e.g. 4278XXXXXXXX"
                  maxLength={12}
                  className={`w-full bg-[#1a2c38] border ${
                    utrError
                      ? "border-red-500 focus:border-red-500"
                      : utrNumber.length === 12
                      ? "border-[#00e701] focus:border-[#00e701]"
                      : "border-[#213743] focus:border-[#1475e1]"
                  } rounded-xl px-4 py-3.5 text-sm font-mono text-white placeholder-[#557086] outline-none transition-colors tracking-wider`}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-[#b1bad3]">
                  {utrNumber.length}/12
                </div>
              </div>
              {utrError && (
                <p className="mt-1.5 text-xs text-red-400 font-semibold">{utrError}</p>
              )}
            </div>

            {/* Screenshot Upload with Live Preview */}
            <div>
              <label className="block text-xs font-bold text-[#b1bad3] mb-1.5">
                Upload Payment Screenshot (Optional for Faster Verification)
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {screenshotPreview ? (
                <div className="relative border border-[#2f4553] bg-[#1a2c38] rounded-xl p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={screenshotPreview}
                      alt="Screenshot Preview"
                      className="w-14 h-14 object-cover rounded-lg border border-[#213743]"
                    />
                    <div>
                      <div className="text-xs font-bold text-white">Screenshot Attached</div>
                      <div className="text-[11px] text-[#00e701] flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Ready for submission</span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setScreenshotPreview(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="text-xs font-bold text-[#b1bad3] hover:text-red-400 px-2 py-1 bg-[#213743] rounded-lg border border-[#2f4553] transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer border-2 border-dashed border-[#2f4553] hover:border-[#1475e1] bg-[#1a2c38]/60 hover:bg-[#1a2c38] rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-[#213743] group-hover:bg-[#1475e1]/20 flex items-center justify-center text-[#b1bad3] group-hover:text-[#1475e1] transition-colors mb-2">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold text-white">
                    Tap to upload payment receipt
                  </div>
                  <div className="text-[11px] text-[#b1bad3] mt-0.5">
                    Supports PNG, JPG, or screenshot from Google Pay / PhonePe
                  </div>
                </div>
              )}
            </div>

            {/* Warning Banner */}
            <div className="bg-[#e9113c]/10 border border-[#e9113c]/30 rounded-xl p-3 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-[#e9113c] shrink-0 mt-0.5" />
              <div className="text-xs text-[#b1bad3] leading-relaxed">
                <span className="font-bold text-white">Warning:</span> Please enter the correct
                12-digit UTR generated from your bank app. Submitting fake or manipulated UTR
                numbers will lead to immediate automated account suspension.
              </div>
            </div>

            {/* Action: SUBMIT UTR Button */}
            <button
              type="submit"
              disabled={isVerifying}
              className="w-full bg-[#00e701] text-black font-extrabold text-base py-3.5 rounded-lg shadow-lg hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-black" />
                  <span>Verifying Payment...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5 text-black" />
                  <span>SUBMIT UTR</span>
                </>
              )}
            </button>

            {/* Mandatory UTR Submission Warning Disclaimer */}
            <div className="bg-[#2b1717] border border-[#ff4949]/40 rounded-xl p-3.5 mt-3 text-left">
              <p className="text-xs text-[#ffb4b4] leading-relaxed font-medium">
                ⚠️ <span className="font-bold text-[#ff6b6b]">IMPORTANT WARNING:</span> Submitting your 12-digit UTR is strictly mandatory. If you complete the UPI transfer but leave or close this page without submitting the UTR, your payment cannot be verified automatically, and funds may be delayed or permanently lost. Do not refresh or exit until your UTR is submitted.
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Simulated Verification Processing Modal */}
      {isVerifying && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f212e] border border-[#213743] rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="relative w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-[#1475e1]/20 border-t-[#00e701] animate-spin" />
              <ShieldCheck className="w-8 h-8 text-[#00e701]" />
            </div>
            <h3 className="text-lg font-black text-white mb-2">Processing Payment</h3>
            <p className="text-xs text-[#b1bad3] leading-relaxed mb-4">
              {verificationStep || "Verifying payment with banking node..."}
            </p>
            <div className="w-full bg-[#1a2c38] rounded-full h-1.5 overflow-hidden">
              <div className="bg-gradient-to-r from-[#1475e1] to-[#00e701] h-full w-2/3 animate-pulse" />
            </div>
          </div>
        </div>
      )}

      {/* Deposit Submitted - Awaiting Admin Approval Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0f212e] border-2 border-amber-500/60 rounded-2xl max-w-md w-full p-6 text-center shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 text-amber-400 flex items-center justify-center mx-auto mb-4 shadow-[0_0_25px_rgba(245,158,11,0.35)]">
              <Clock className="w-9 h-9 text-amber-400" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-300 text-xs font-bold rounded-full mb-3 border border-amber-500/30">
              <Clock className="w-3.5 h-3.5 animate-spin" />
              <span>Awaiting Admin Verification</span>
            </div>

            <h2 className="text-2xl font-black text-white mb-1">
              Deposit Submitted! ⏳
            </h2>
            <p className="text-xs text-[#b1bad3] mb-5 leading-relaxed">
              Your 12-digit UTR payment ticket has been submitted to the Admin Approval Desk. Balance will be credited automatically once verified.
            </p>

            <div className="bg-[#1a2c38] border border-[#213743] rounded-xl p-4 text-left space-y-2.5 mb-6 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[#b1bad3]">Wallet Credit Requested</span>
                <span className="font-extrabold text-[#00e701] text-base">
                  ₹{walletCreditAmount.toLocaleString("en-IN")}.00
                </span>
              </div>
              {appliedPromo && (
                <div className="flex justify-between items-center border-t border-[#213743] pt-2">
                  <span className="text-[#b1bad3]">Amount Paid via UPI</span>
                  <span className="font-extrabold text-amber-300">
                    ₹{payableAmount.toLocaleString("en-IN")}.00 ({appliedPromo.code} - {appliedPromo.discountPercent}% OFF)
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center border-t border-[#213743] pt-2">
                <span className="text-[#b1bad3]">Order Reference</span>
                <span className="font-mono text-white font-bold">{rawOrderId}</span>
              </div>
              <div className="flex justify-between items-center border-t border-[#213743] pt-2">
                <span className="text-[#b1bad3]">UTR Number</span>
                <span className="font-mono text-amber-300 font-bold">{utrNumber}</span>
              </div>
              <div className="flex justify-between items-center border-t border-[#213743] pt-2">
                <span className="text-[#b1bad3]">Verification Status</span>
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Pending Admin Approval
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.push("/casino/home")}
              className="w-full bg-[#1475e1] hover:bg-[#1268c7] active:scale-[0.99] text-white font-black text-sm py-3.5 rounded-xl shadow-lg transition-all cursor-pointer"
            >
              Return to Casino Lobby
            </button>
          </div>
        </div>
      )}

      {/* Footer Branding */}
      <div className="max-w-xl mx-auto w-full text-center text-[11px] text-[#557086] mt-4">
        Protected by Stake Secure Gateway • 100% Provably Fair Gaming
      </div>
    </div>
  );
}

export default function DepositPayPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#071824] flex items-center justify-center text-white">
          <Loader2 className="w-8 h-8 animate-spin text-[#1475e1]" />
        </div>
      }
    >
      <DepositPayContent />
    </Suspense>
  );
}

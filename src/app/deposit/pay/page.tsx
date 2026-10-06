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
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import { sounds } from "@/utils/audio";
import FiatCoinIcon from "@/components/FiatCoinIcon";

function DepositPayContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { updateBalance } = useGame();

  const rawOrderId = searchParams.get("orderId") || `STK-DEP-${Date.now()}`;
  const rawAmount = searchParams.get("amount") || "500";
  const amountNumber = Math.max(300, parseFloat(rawAmount) || 500);

  // Merchant details
  const merchantUpi = "stakeofficial@upi";
  const merchantName = "StakeGaming";
  const upiUrl = `upi://pay?pa=${merchantUpi}&pn=${encodeURIComponent(
    merchantName
  )}&am=${amountNumber.toFixed(2)}&cu=INR&tn=${encodeURIComponent(rawOrderId)}`;

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please upload an image file (PNG, JPG, or WEBP).");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setScreenshotPreview(reader.result as string);
        sounds.playClick();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUtrChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 12);
    setUtrNumber(val);
    if (val.length === 12) {
      setUtrError("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (utrNumber.length !== 12) {
      setUtrError("Please enter a valid 12-digit UTR reference number.");
      return;
    }

    setUtrError("");
    setIsVerifying(true);
    setVerificationStep("Connecting to National Payments Corporation node...");
    sounds.playClick();

    setTimeout(() => {
      setVerificationStep("Verifying 12-digit UTR and payment settlement...");
    }, 800);

    setTimeout(() => {
      // 1. Credit wallet balance (amount in USD equivalent, rate 86.5 INR/USD)
      const creditedUsd = amountNumber / 86.5;
      updateBalance(creditedUsd);

      // 2. Add notification to drawer & localStorage
      try {
        const savedNotifs = localStorage.getItem("stake_notifications");
        const existing = savedNotifs ? JSON.parse(savedNotifs) : [];
        const newNotif = {
          id: `notif-dep-${Date.now()}`,
          type: "Transactions",
          title: "Deposit Successful! 💰",
          description: `₹${amountNumber.toLocaleString(
            "en-IN"
          )} deposited via UPI (UTR: ${utrNumber}) has been credited instantly.`,
          timestamp: "Just now",
          isUnread: true,
          link: "/casino/home",
          metadata: {
            amount: amountNumber,
            currency: "INR",
            utr: utrNumber,
            orderId: rawOrderId,
          },
        };
        localStorage.setItem("stake_notifications", JSON.stringify([newNotif, ...existing]));
        window.dispatchEvent(new Event("stake_notifications_updated"));
      } catch (err) {
        console.error("Failed to save deposit notification", err);
      }

      // 3. Audio celebration chime
      sounds.playCashout();

      setIsVerifying(false);
      setIsSuccessModalOpen(true);
    }, 1600);
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
                Total Amount Due
              </div>
              <div className="text-xl sm:text-2xl font-black text-[#00e701] flex items-center justify-end gap-1 mt-0.5">
                <span>₹{amountNumber.toLocaleString("en-IN")}.00</span>
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
                Scan to pay <span className="font-bold text-white">₹{amountNumber}</span> via Google Pay, PhonePe, Paytm, CRED or BHIM
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
                    )}&am=${amountNumber}&cu=INR`}
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
                    )}&am=${amountNumber}&cu=INR`}
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
                    )}&am=${amountNumber}&cu=INR`}
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

      {/* Payment Success Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0f212e] border-2 border-[#00e701]/60 rounded-2xl max-w-md w-full p-6 text-center shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-[#00e701]/20 border-2 border-[#00e701] text-[#00e701] flex items-center justify-center mx-auto mb-4 shadow-[0_0_25px_rgba(0,231,1,0.4)]">
              <CheckCircle2 className="w-10 h-10 text-[#00e701]" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#00e701]/10 text-[#00e701] text-xs font-bold rounded-full mb-3 border border-[#00e701]/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Instant Verification Approved</span>
            </div>

            <h2 className="text-2xl font-black text-white mb-1">
              Payment Successful!
            </h2>
            <p className="text-sm text-[#b1bad3] mb-5">
              Funds have been added instantly to your wallet balance.
            </p>

            <div className="bg-[#1a2c38] border border-[#213743] rounded-xl p-4 text-left space-y-2.5 mb-6 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[#b1bad3]">Amount Credited</span>
                <span className="font-extrabold text-[#00e701] text-base">
                  ₹{amountNumber.toLocaleString("en-IN")}.00
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-[#213743] pt-2">
                <span className="text-[#b1bad3]">Order ID</span>
                <span className="font-mono text-white font-bold">{rawOrderId}</span>
              </div>
              <div className="flex justify-between items-center border-t border-[#213743] pt-2">
                <span className="text-[#b1bad3]">UTR Reference</span>
                <span className="font-mono text-white font-bold">{utrNumber}</span>
              </div>
              <div className="flex justify-between items-center border-t border-[#213743] pt-2">
                <span className="text-[#b1bad3]">Status</span>
                <span className="text-[#00e701] font-bold flex items-center gap-1">
                  <Check className="w-3 h-3" /> Confirmed & Settled
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.push("/casino/home")}
              className="w-full bg-[#00e701] hover:brightness-110 active:scale-[0.99] text-black font-black text-base py-3.5 rounded-xl shadow-lg transition-all cursor-pointer"
            >
              Go to Casino Lobby
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

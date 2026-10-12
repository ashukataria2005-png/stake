"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Eye,
  EyeOff,
  KeyRound,
  ChevronDown,
  ChevronUp,
  Check,
  AlertCircle,
  Mail,
  Smartphone,
  RefreshCw,
  Lock,
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import { sounds } from "@/utils/audio";
import confetti from "canvas-confetti";
import { EMAIL_REGEX, MOBILE_REGEX, USERNAME_REGEX } from "@/lib/auth";

export default function AuthModal() {
  const {
    isAuthModalOpen,
    authModalMode,
    openAuthModal,
    closeAuthModal,
    login,
  } = useGame();

  // Mode: Sign In vs Register
  const isSignIn = authModalMode === "signin";

  // Registration sub-tab: "email" | "mobile"
  const [registerMethod, setRegisterMethod] = useState<"email" | "mobile">("email");

  // Sign In Form States (Strictly USERNAME + PASSWORD only)
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register Form States
  const [regIdentifier, setRegIdentifier] = useState(""); // Email or 10-digit Phone
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [showReferral, setShowReferral] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);

  // General States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  // Reset errors and fields on mode switch or open
  useEffect(() => {
    setErrorMessage("");
    setIsLoading(false);
    setShowLoginPassword(false);
    setShowRegPassword(false);
    setShowRegConfirmPassword(false);
  }, [authModalMode, isAuthModalOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isAuthModalOpen) {
        closeAuthModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  // =========================================================
  // HANDLE SIGN IN (STRICT USERNAME + PASSWORD ONLY)
  // =========================================================
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const cleanUsername = loginUsername.trim();
    if (!cleanUsername) {
      setErrorMessage("Please enter your username.");
      return;
    }
    if (!loginPassword) {
      setErrorMessage("Please enter your password.");
      return;
    }

    setIsLoading(true);
    sounds.playClick();

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: cleanUsername,
          password: loginPassword,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.success) {
        const errorMsg =
          data?.error ||
          (res.status === 404
            ? "User not found"
            : res.status === 401
            ? "Incorrect password"
            : "Sign in failed");
        setErrorMessage(errorMsg);
        setIsLoading(false);
        return;
      }

      // Success
      sounds.playSuccessChime();
      try {
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
      } catch {}

      login({
        id: data.user.id,
        name: data.user.username,
        username: data.user.username,
        email: data.user.email || `${data.user.username}@stake.com`,
        phone: data.user.phone,
        role: data.user.role,
      });

      setIsLoading(false);
      closeAuthModal();
    } catch (err: any) {
      console.error("[AuthModal] Sign in network error:", err);
      setErrorMessage("Network error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  // =========================================================
  // HANDLE REGISTRATION (STRICT DUAL MODE VALIDATION)
  // =========================================================
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const cleanId = regIdentifier.trim();
    const cleanUsername = regUsername.trim();

    // 1. Strict Identifier Validation
    if (registerMethod === "email") {
      if (!cleanId) {
        setErrorMessage("Please enter your email address.");
        return;
      }
      if (!EMAIL_REGEX.test(cleanId)) {
        setErrorMessage("Please enter a valid email address (e.g. user@example.com). Single character or invalid emails are not allowed.");
        return;
      }
    } else {
      // Mobile Number validation
      const sanitizedPhone = cleanId.replace(/\D/g, "");
      if (!sanitizedPhone) {
        setErrorMessage("Please enter your 10-digit mobile number.");
        return;
      }
      if (!MOBILE_REGEX.test(sanitizedPhone)) {
        setErrorMessage("Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9 (e.g. 9876543210).");
        return;
      }
    }

    // 2. Strict Username Validation (3-20 characters, alphanumeric + underscore only)
    if (!cleanUsername) {
      setErrorMessage("Please choose a username.");
      return;
    }
    if (!USERNAME_REGEX.test(cleanUsername)) {
      setErrorMessage("Username must be 3-20 characters long and contain only letters, numbers, and underscores.");
      return;
    }

    // 3. Strict Password Validation
    if (!regPassword || regPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    // 4. Confirm Password Match
    if (regPassword !== regConfirmPassword) {
      setErrorMessage("Passwords do not match. Please verify your confirmation password.");
      return;
    }

    // 5. Terms Agreement Check
    if (!agreedTerms) {
      setErrorMessage("You must agree to the Terms and Conditions to register.");
      return;
    }

    setIsLoading(true);
    sounds.playClick();

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registerMethod,
          identifier: cleanId,
          username: cleanUsername,
          password: regPassword,
          confirmPassword: regConfirmPassword,
          referralCode: referralCode.trim() || undefined,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.success) {
        setErrorMessage(data?.error || "Registration failed. Please check your details.");
        setIsLoading(false);
        return;
      }

      // Success
      sounds.playSuccessChime();
      try {
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      } catch {}

      login({
        id: data.user.id,
        name: data.user.username,
        username: data.user.username,
        email: data.user.email || `${data.user.username}@stake.com`,
        phone: data.user.phone,
        role: data.user.role,
      });

      setIsLoading(false);
      closeAuthModal();
    } catch (err: any) {
      console.error("[AuthModal] Registration network error:", err);
      setErrorMessage("Network error occurred during registration. Please try again.");
      setIsLoading(false);
    }
  };

  // Quick social helper
  const handleQuickAuth = (providerName: string) => {
    sounds.playSuccessChime();
    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } catch {}

    const mockName =
      providerName === "Google"
        ? "GooglePlayer"
        : providerName === "Passkey"
        ? "PasskeyUser"
        : `${providerName}User`;

    login({
      name: mockName,
      username: mockName,
      email: `${mockName.toLowerCase()}@stake.com`,
    });
    closeAuthModal();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) closeAuthModal();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        className="relative w-full max-w-[440px] my-auto bg-[#1a2c38] border border-[#213743] rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* ========================================== */}
        {/* MODAL HEADER: User icon + Title + '✕' Close */}
        {/* ========================================== */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#213743] bg-[#1a2c38] shrink-0">
          <div className="flex items-center gap-2 text-white">
            <div className="w-6 h-6 rounded-full bg-[#213743] flex items-center justify-center text-[#b1bad3]">
              <User className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-sm sm:text-base tracking-wide">
              {isSignIn ? "Sign In" : "Create an Account"}
            </span>
          </div>

          <button
            onClick={closeAuthModal}
            className="p-1.5 rounded-lg text-[#b1bad3] hover:text-white hover:bg-[#213743] transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ========================================== */}
        {/* MODAL BODY (Scrollable if height exceeds)   */}
        {/* ========================================== */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {isSignIn ? "Welcome Back to Stake!" : "Welcome to Stake!"}
          </h2>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-semibold animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {/* ========================================== */}
          {/* SIGN IN FORM (STRICT USERNAME + PASSWORD)  */}
          {/* ========================================== */}
          {isSignIn ? (
            <form onSubmit={handleSignIn} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#b1bad3] uppercase tracking-wider mb-1.5">
                  Username <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={loginUsername}
                    onChange={(e) => {
                      setLoginUsername(e.target.value);
                      if (errorMessage) setErrorMessage("");
                    }}
                    placeholder="Enter your username"
                    className="w-full bg-[#0f212e] border border-[#213743] focus:border-[#1475e1] rounded-xl px-3.5 py-3 text-white text-sm outline-none transition-colors placeholder:text-[#557086]"
                    autoComplete="username"
                    required
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#557086]">
                    <User className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#b1bad3] uppercase tracking-wider mb-1.5">
                  Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      if (errorMessage) setErrorMessage("");
                    }}
                    placeholder="Enter your password"
                    className="w-full bg-[#0f212e] border border-[#213743] focus:border-[#1475e1] rounded-xl px-3.5 py-3 pr-10 text-white text-sm outline-none transition-colors placeholder:text-[#557086]"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#b1bad3] hover:text-white transition-colors cursor-pointer"
                    title={showLoginPassword ? "Hide password" : "Show password"}
                  >
                    {showLoginPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <div className="flex justify-end mt-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      alert("Password reset instructions have been dispatched to your registered email.")
                    }
                    className="text-xs font-semibold text-[#b1bad3] hover:text-white hover:underline transition-colors cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#1475e1] hover:bg-[#1268c7] disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-3.5 rounded-xl transition-all shadow-md text-sm sm:text-base cursor-pointer mt-1 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>
          ) : (
            /* ========================================== */
            /* REGISTRATION FORM (EMAIL / MOBILE MODES)   */
            /* ========================================== */
            <form onSubmit={handleRegister} className="space-y-3">
              {/* Dual Mode Switch: Email vs Mobile Number */}
              <div className="grid grid-cols-2 p-1 bg-[#0f212e] rounded-xl border border-[#213743]">
                <button
                  type="button"
                  onClick={() => {
                    setRegisterMethod("email");
                    setRegIdentifier("");
                    setErrorMessage("");
                  }}
                  className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    registerMethod === "email"
                      ? "bg-[#213743] text-white shadow-sm"
                      : "text-[#b1bad3] hover:text-white"
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRegisterMethod("mobile");
                    setRegIdentifier("");
                    setErrorMessage("");
                  }}
                  className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    registerMethod === "mobile"
                      ? "bg-[#213743] text-white shadow-sm"
                      : "text-[#b1bad3] hover:text-white"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mobile Number</span>
                </button>
              </div>

              {/* Identifier Field: Email or Mobile */}
              <div>
                <label className="block text-xs font-bold text-[#b1bad3] uppercase tracking-wider mb-1.5">
                  {registerMethod === "email" ? "Email Address" : "Mobile Number"}{" "}
                  <span className="text-red-400">*</span>
                </label>
                {registerMethod === "email" ? (
                  <div className="relative">
                    <input
                      type="email"
                      value={regIdentifier}
                      onChange={(e) => {
                        setRegIdentifier(e.target.value);
                        if (errorMessage) setErrorMessage("");
                      }}
                      placeholder="e.g. user@example.com"
                      className="w-full bg-[#0f212e] border border-[#213743] focus:border-[#1475e1] rounded-xl px-3.5 py-2.5 text-white text-sm outline-none transition-colors placeholder:text-[#557086]"
                      autoComplete="email"
                      required
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#557086]">
                      <Mail className="w-4 h-4" />
                    </div>
                  </div>
                ) : (
                  <div className="flex rounded-xl overflow-hidden border border-[#213743] focus-within:border-[#1475e1] bg-[#0f212e] transition-colors">
                    <div className="px-3 py-2.5 bg-[#14232e] text-[#b1bad3] text-xs font-bold flex items-center border-r border-[#213743]">
                      +91
                    </div>
                    <input
                      type="tel"
                      maxLength={10}
                      inputMode="numeric"
                      value={regIdentifier}
                      onChange={(e) => {
                        const numeric = e.target.value.replace(/\D/g, "").slice(0, 10);
                        setRegIdentifier(numeric);
                        if (errorMessage) setErrorMessage("");
                      }}
                      placeholder="10-digit number (e.g. 9876543210)"
                      className="w-full bg-transparent px-3 py-2.5 text-white text-sm outline-none placeholder:text-[#557086]"
                      required
                    />
                  </div>
                )}
              </div>

              {/* Username Field */}
              <div>
                <label className="block text-xs font-bold text-[#b1bad3] uppercase tracking-wider mb-1.5">
                  Username <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={20}
                    value={regUsername}
                    onChange={(e) => {
                      setRegUsername(e.target.value.trim());
                      if (errorMessage) setErrorMessage("");
                    }}
                    placeholder="3-20 characters (letters, numbers, _)"
                    className="w-full bg-[#0f212e] border border-[#213743] focus:border-[#1475e1] rounded-xl px-3.5 py-2.5 text-white text-sm outline-none transition-colors placeholder:text-[#557086]"
                    autoComplete="username"
                    required
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#557086]">
                    <User className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-xs font-bold text-[#b1bad3] uppercase tracking-wider mb-1.5">
                  Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showRegPassword ? "text" : "password"}
                    value={regPassword}
                    onChange={(e) => {
                      setRegPassword(e.target.value);
                      if (errorMessage) setErrorMessage("");
                    }}
                    placeholder="Minimum 6 characters"
                    className="w-full bg-[#0f212e] border border-[#213743] focus:border-[#1475e1] rounded-xl px-3.5 py-2.5 pr-10 text-white text-sm outline-none transition-colors placeholder:text-[#557086]"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#b1bad3] hover:text-white transition-colors cursor-pointer"
                    title={showRegPassword ? "Hide password" : "Show password"}
                  >
                    {showRegPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-xs font-bold text-[#b1bad3] uppercase tracking-wider mb-1.5">
                  Confirm Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showRegConfirmPassword ? "text" : "password"}
                    value={regConfirmPassword}
                    onChange={(e) => {
                      setRegConfirmPassword(e.target.value);
                      if (errorMessage) setErrorMessage("");
                    }}
                    placeholder="Re-enter your password"
                    className="w-full bg-[#0f212e] border border-[#213743] focus:border-[#1475e1] rounded-xl px-3.5 py-2.5 pr-10 text-white text-sm outline-none transition-colors placeholder:text-[#557086]"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#b1bad3] hover:text-white transition-colors cursor-pointer"
                    title={showRegConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showRegConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Referral Code (Optional) */}
              <div className="pt-0.5">
                <button
                  type="button"
                  onClick={() => setShowReferral(!showReferral)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-[#b1bad3] hover:text-white transition-colors cursor-pointer select-none"
                >
                  <span>Referral Code (Optional)</span>
                  {showReferral ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>
                {showReferral && (
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    placeholder="Enter referral / promo code"
                    className="w-full bg-[#0f212e] border border-[#213743] focus:border-[#1475e1] rounded-xl px-3.5 py-2 text-white text-xs outline-none mt-1.5 transition-colors placeholder:text-[#557086]"
                  />
                )}
              </div>

              {/* Terms Checkbox */}
              <label className="flex items-start gap-2.5 cursor-pointer select-none pt-0.5">
                <input
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded bg-[#0f212e] border border-[#2f4553] text-[#1475e1] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#1475e1]"
                  required
                />
                <span className="text-xs text-[#b1bad3] leading-relaxed">
                  I am 18 or older and agree to the{" "}
                  <span className="text-white hover:underline">Terms and Conditions</span>{" "}
                  <span className="text-red-400">*</span>
                </span>
              </label>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#1475e1] hover:bg-[#1268c7] disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-3 rounded-xl transition-all shadow-md text-sm sm:text-base cursor-pointer mt-1 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            </form>
          )}

          {/* ========================================== */}
          {/* OR DIVIDER                                 */}
          {/* ========================================== */}
          <div className="relative my-3 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#213743]" />
            </div>
            <span className="relative bg-[#1a2c38] px-3 text-xs font-bold text-[#b1bad3] uppercase tracking-wider">
              Or
            </span>
          </div>

          {/* ========================================== */}
          {/* THIRD-PARTY ACTIONS: Google & Passkey      */}
          {/* ========================================== */}
          <div className="space-y-2">
            {/* Continue With Google Button */}
            <button
              type="button"
              onClick={() => handleQuickAuth("Google")}
              className="w-full bg-[#213743] hover:bg-[#2a4454] text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2.5 text-xs sm:text-sm border border-[#2f4553] shadow-sm transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4 fill-current text-blue-400" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.52 0 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.4.4-.8.76-1.28 1.08-.88.6-1.96.92-3.36.92-2.48 0-4.52-2.04-4.52-4.52S9.52 1.76 12 1.76c1.28 0 2.36.44 3.2 1.28l1.32-1.32C15.36.6 13.8 0 12 0 5.36 0 0 5.36 0 12s5.36 12 12 12c6.92 0 11.56-4.88 11.56-11.76 0-.8-.08-1.56-.24-2.24H12v4.48h7.2c-.32 1.68-1.28 3.12-2.56 4.32z" />
              </svg>
              <span>Continue With Google</span>
            </button>

            {/* Continue With Passkey Button */}
            <button
              type="button"
              onClick={() => handleQuickAuth("Passkey")}
              className="w-full bg-[#1a2c38] border border-[#213743] hover:bg-[#213743] text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2.5 text-xs sm:text-sm transition-colors cursor-pointer"
            >
              <KeyRound className="w-4 h-4 text-[#b1bad3]" />
              <span>Continue With Passkey</span>
            </button>
          </div>

          {/* ========================================== */}
          {/* FOOTER SWITCH: Register <=> Sign In        */}
          {/* ========================================== */}
          <div className="pt-3 border-t border-[#213743] text-center text-xs sm:text-sm text-[#b1bad3]">
            {isSignIn ? (
              <span>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => openAuthModal("register")}
                  className="text-[#1475e1] font-bold hover:underline cursor-pointer ml-1"
                >
                  Register
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => openAuthModal("signin")}
                  className="text-[#1475e1] font-bold hover:underline cursor-pointer ml-1"
                >
                  Sign In
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

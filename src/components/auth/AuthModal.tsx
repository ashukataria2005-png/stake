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
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import { sounds } from "@/utils/audio";
import confetti from "canvas-confetti";

export default function AuthModal() {
  const {
    isAuthModalOpen,
    authModalMode,
    openAuthModal,
    closeAuthModal,
    login,
  } = useGame();

  // Form states
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [showReferral, setShowReferral] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Reset errors and fields on mode switch or open
  useEffect(() => {
    setErrorMessage("");
    setShowPassword(false);
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

  const isSignIn = authModalMode === "signin";

  // Handle Sign In submission
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!emailOrUsername.trim()) {
      setErrorMessage("Please enter your email or username");
      return;
    }
    if (!password.trim()) {
      setErrorMessage("Please enter your password");
      return;
    }

    // Authenticate
    sounds.playSuccessChime();
    try {
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
    } catch {}

    const isEmail = emailOrUsername.includes("@");
    login({
      name: isEmail ? emailOrUsername.split("@")[0] : emailOrUsername,
      email: isEmail ? emailOrUsername : `${emailOrUsername.toLowerCase()}@stake.com`,
    });
    closeAuthModal();
  };

  // Handle Registration submission
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address");
      return;
    }
    if (!username.trim() || username.length < 3) {
      setErrorMessage("Username must be at least 3 characters");
      return;
    }
    if (!password.trim() || password.length < 6) {
      setErrorMessage("Password must be at least 6 characters");
      return;
    }
    if (!agreedTerms) {
      setErrorMessage("You must agree to the Terms and Conditions to register");
      return;
    }

    // Authenticate
    sounds.playSuccessChime();
    try {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    } catch {}

    login({
      name: username.trim(),
      email: email.trim(),
    });
    closeAuthModal();
  };

  // Social / Third-Party Quick Login (Google, Passkey, etc.)
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
          {/* Welcome Heading matching Screenshots 73 & 75 */}
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {isSignIn ? "Welcome Back to Stake!" : "Welcome to Stake!"}
          </h2>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-semibold animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ========================================== */}
          {/* SIGN IN FORM (Screenshots 73 & 74)        */}
          {/* ========================================== */}
          {isSignIn ? (
            <form onSubmit={handleSignIn} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#b1bad3] uppercase tracking-wider mb-1.5">
                  Email or Username <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  placeholder="e.g. Satoshi or user@example.com"
                  className="w-full bg-[#0f212e] border border-[#213743] focus:border-[#557086] rounded-xl px-3.5 py-3 text-white text-sm outline-none transition-colors placeholder:text-[#557086]"
                  autoComplete="username"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#b1bad3] uppercase tracking-wider mb-1.5">
                  Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-[#0f212e] border border-[#213743] focus:border-[#557086] rounded-xl px-3.5 py-3 pr-10 text-white text-sm outline-none transition-colors placeholder:text-[#557086]"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#b1bad3] hover:text-white transition-colors cursor-pointer"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
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
                      alert("Password reset instructions have been dispatched to your email.")
                    }
                    className="text-xs font-semibold text-[#b1bad3] hover:text-white hover:underline transition-colors cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#2f4553] hover:bg-[#395364] active:bg-[#243743] text-white font-bold py-3.5 rounded-xl transition-all shadow-md text-sm sm:text-base cursor-pointer mt-1"
              >
                Sign In
              </button>
            </form>
          ) : (
            /* ========================================== */
            /* CREATE AN ACCOUNT FORM (Screenshots 75 & 76)*/
            /* ========================================== */
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#b1bad3] uppercase tracking-wider mb-1.5">
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full bg-[#0f212e] border border-[#213743] focus:border-[#557086] rounded-xl px-3.5 py-3 text-white text-sm outline-none transition-colors placeholder:text-[#557086]"
                  autoComplete="email"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#b1bad3] uppercase tracking-wider mb-1.5">
                  Username <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a username"
                  className="w-full bg-[#0f212e] border border-[#213743] focus:border-[#557086] rounded-xl px-3.5 py-3 text-white text-sm outline-none transition-colors placeholder:text-[#557086]"
                  autoComplete="username"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#b1bad3] uppercase tracking-wider mb-1.5">
                  Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full bg-[#0f212e] border border-[#213743] focus:border-[#557086] rounded-xl px-3.5 py-3 pr-10 text-white text-sm outline-none transition-colors placeholder:text-[#557086]"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#b1bad3] hover:text-white transition-colors cursor-pointer"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Referral Code (Optional) Accordion Row */}
              <div className="pt-1">
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
                    className="w-full bg-[#0f212e] border border-[#213743] focus:border-[#557086] rounded-xl px-3.5 py-2.5 text-white text-sm outline-none mt-2 transition-colors placeholder:text-[#557086]"
                  />
                )}
              </div>

              {/* Terms Checkbox */}
              <label className="flex items-start gap-2.5 cursor-pointer select-none pt-1">
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
                className="w-full bg-[#2f4553] hover:bg-[#395364] active:bg-[#243743] text-white font-bold py-3.5 rounded-xl transition-all shadow-md text-sm sm:text-base cursor-pointer mt-1"
              >
                Register With Email
              </button>
            </form>
          )}

          {/* ========================================== */}
          {/* OR DIVIDER                                 */}
          {/* ========================================== */}
          <div className="relative my-4 flex items-center justify-center">
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
          <div className="space-y-2.5">
            {/* Continue With Google Button (Solid Blue #1475e1) */}
            <button
              type="button"
              onClick={() => handleQuickAuth("Google")}
              className="w-full bg-[#1475e1] hover:bg-[#1268c7] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2.5 text-sm sm:text-base shadow-sm transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.52 0 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.4.4-.8.76-1.28 1.08-.88.6-1.96.92-3.36.92-2.48 0-4.52-2.04-4.52-4.52S9.52 1.76 12 1.76c1.28 0 2.36.44 3.2 1.28l1.32-1.32C15.36.6 13.8 0 12 0 5.36 0 0 5.36 0 12s5.36 12 12 12c6.92 0 11.56-4.88 11.56-11.76 0-.8-.08-1.56-.24-2.24H12v4.48h7.2c-.32 1.68-1.28 3.12-2.56 4.32z" />
              </svg>
              <span>Continue With Google</span>
            </button>

            {/* Continue With Passkey Button */}
            <button
              type="button"
              onClick={() => handleQuickAuth("Passkey")}
              className="w-full bg-[#1a2c38] border border-[#213743] hover:bg-[#213743] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2.5 text-sm sm:text-base transition-colors cursor-pointer"
            >
              <KeyRound className="w-4 h-4 text-[#b1bad3]" />
              <span>Continue With Passkey</span>
            </button>

            {/* See More Options Toggle */}
            <div className="pt-1 text-center">
              <button
                type="button"
                onClick={() => setShowMoreOptions(!showMoreOptions)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#b1bad3] hover:text-white transition-colors cursor-pointer py-1"
              >
                <span>{showMoreOptions ? "Hide Options" : "See More Options"}</span>
                {showMoreOptions ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>

              {showMoreOptions && (
                <div className="grid grid-cols-4 gap-2 pt-2 animate-in fade-in duration-200">
                  {/* Facebook */}
                  <button
                    type="button"
                    onClick={() => handleQuickAuth("Facebook")}
                    title="Continue with Facebook"
                    className="p-2.5 rounded-xl bg-[#0f212e] border border-[#213743] hover:border-[#1877F2] flex items-center justify-center text-[#1877F2] transition-colors cursor-pointer"
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </button>

                  {/* Kick */}
                  <button
                    type="button"
                    onClick={() => handleQuickAuth("Kick")}
                    title="Continue with Kick"
                    className="p-2.5 rounded-xl bg-[#0f212e] border border-[#213743] hover:border-[#53fc18] flex items-center justify-center text-[#53fc18] transition-colors cursor-pointer"
                  >
                    <span className="font-black text-lg leading-none">K</span>
                  </button>

                  {/* Line */}
                  <button
                    type="button"
                    onClick={() => handleQuickAuth("Line")}
                    title="Continue with Line"
                    className="p-2.5 rounded-xl bg-[#0f212e] border border-[#213743] hover:border-[#00c300] flex items-center justify-center text-[#00c300] transition-colors cursor-pointer"
                  >
                    <span className="font-black text-xs leading-none">LINE</span>
                  </button>

                  {/* Web3 / MetaMask */}
                  <button
                    type="button"
                    onClick={() => handleQuickAuth("Web3")}
                    title="Continue with Web3 / MetaMask"
                    className="p-2.5 rounded-xl bg-[#0f212e] border border-[#213743] hover:border-[#f6851b] flex items-center justify-center text-[#f6851b] transition-colors cursor-pointer"
                  >
                    <span className="font-bold text-xs leading-none">🦊 Web3</span>
                  </button>
                </div>
              )}
            </div>
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
                  className="text-white font-bold hover:underline cursor-pointer ml-1"
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
                  className="text-white font-bold hover:underline cursor-pointer ml-1"
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

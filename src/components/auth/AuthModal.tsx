"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Eye,
  EyeOff,
  KeyRound,
  ChevronDown,
  ChevronUp,
  Check,
  AlertCircle,
  Calendar,
  ArrowLeft,
  RefreshCw,
  FileText,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import { sounds } from "@/utils/audio";
import confetti from "canvas-confetti";
import StakeLogo from "@/components/StakeLogo";

const US_AND_IN_STATES = [
  "California", "Texas", "Florida", "New York", "Illinois", "Pennsylvania", "Ohio", "Georgia", "North Carolina", "Michigan",
  "Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", "Uttar Pradesh", "Gujarat", "West Bengal", "Telangana", "Rajasthan", "Punjab",
  "Ontario", "Quebec", "British Columbia", "Alberta", "England", "Scotland", "Wales", "New South Wales", "Victoria", "Queensland",
  "Other / International",
];

export default function AuthModal() {
  const {
    isAuthModalOpen,
    authModalMode,
    openAuthModal,
    closeAuthModal,
    login,
  } = useGame();

  const isSignIn = authModalMode === "signin";

  // Registration step: 1 or 2
  const [regStep, setRegStep] = useState<1 | 2>(1);

  // Sign In Form States
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Registration Step 1 Form States
  const [regEmail, setRegEmail] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regState, setRegState] = useState("");
  const [regDob, setRegDob] = useState(""); // YYYY-MM-DD
  const [hasPhone, setHasPhone] = useState(false);
  const [regPhone, setRegPhone] = useState("");
  const [hasReferral, setHasReferral] = useState(false);
  const [referralCode, setReferralCode] = useState("");

  // Registration Step 2 Form States
  const [agreedTerms, setAgreedTerms] = useState(false);

  // UI States
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Background scroll lock
  useEffect(() => {
    if (isAuthModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow || "unset";
      };
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isAuthModalOpen]);

  // Reset errors and fields on mode switch or open
  useEffect(() => {
    setErrorMessage("");
    setFieldErrors({});
    setIsLoading(false);
    setShowLoginPassword(false);
    setShowRegPassword(false);
    setRegStep(1);
    setShowMoreOptions(false);
  }, [authModalMode, isAuthModalOpen]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isAuthModalOpen) {
        closeAuthModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => {
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
    if (errorMessage) setErrorMessage("");
  };

  // Toast auto-clear
  useEffect(() => {
    if (toastMessage) {
      const t = setTimeout(() => {
        setToastMessage(null);
      }, 4000);
      return () => clearTimeout(t);
    }
  }, [toastMessage]);

  if (!isAuthModalOpen && !toastMessage) return null;

  // =========================================================
  // HANDLE SIGN IN
  // =========================================================
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    const cleanIdentifier = loginIdentifier.trim();
    if (!cleanIdentifier) {
      setErrorMessage("Please enter your email or username.");
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
          username: cleanIdentifier,
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
      setToastMessage(`Welcome back, ${data.user.username}!`);
    } catch (err: any) {
      console.error("[AuthModal] Sign in network error:", err);
      setErrorMessage("Network error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  // =========================================================
  // HANDLE STEP 1 CONTINUE (VALIDATION & TRANSITION)
  // =========================================================
  const handleContinueToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    const errors: Record<string, string> = {};

    const cleanEmail = regEmail.trim();
    const cleanUsername = regUsername.trim();

    if (!cleanEmail) {
      errors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      errors.email = "Please enter a valid email address.";
    }

    if (!cleanUsername) {
      errors.username = "Username is required.";
    } else if (cleanUsername.length < 3 || cleanUsername.length > 20) {
      errors.username = "Username must be between 3 and 20 characters.";
    } else if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
      errors.username = "Username can only contain letters, numbers, and underscores.";
    }

    if (!regPassword || regPassword.length < 6) {
      errors.password = "Password must be at least 6 characters long.";
    }

    if (!regState) {
      errors.state = "Please select your State / Province.";
    }

    if (!regDob) {
      errors.dob = "Date of birth is required.";
    } else {
      // Age check (must be at least 18)
      const dobDate = new Date(regDob);
      const today = new Date();
      let age = today.getFullYear() - dobDate.getFullYear();
      const m = today.getMonth() - dobDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
        age--;
      }
      if (isNaN(dobDate.getTime())) {
        errors.dob = "Please enter a valid date of birth (dd/mm/yyyy).";
      } else if (age < 18) {
        errors.dob = "You must be at least 18 years of age to register.";
      }
    }

    if (hasPhone && regPhone.trim()) {
      const sanitizedPhone = regPhone.replace(/\D/g, "");
      if (sanitizedPhone.length < 10) {
        errors.phone = "Please enter a valid phone number.";
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      sounds.playClick();
      return;
    }

    sounds.playClick();
    setFieldErrors({});
    setRegStep(2);
  };

  // =========================================================
  // HANDLE STEP 2 SUBMIT (TERMS ACCEPTANCE & ACCOUNT CREATION)
  // =========================================================
  const handleFinalRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedTerms) {
      setFieldErrors({ terms: "You must agree to the Terms and Conditions." });
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    sounds.playClick();

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registerMethod: "email",
          identifier: regEmail.trim().toLowerCase(),
          username: regUsername.trim(),
          password: regPassword,
          state: regState,
          dateOfBirth: regDob,
          phone: hasPhone ? regPhone.trim() : undefined,
          referralCode: hasReferral ? referralCode.trim() : undefined,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.success) {
        const errorText = data?.error || "Registration failed. Please review your details.";
        if (data?.field === "username") {
          setRegStep(1);
          setFieldErrors({ username: errorText });
        } else if (data?.field === "identifier" || errorText.toLowerCase().includes("email")) {
          setRegStep(1);
          setFieldErrors({ email: errorText });
        } else {
          setErrorMessage(errorText);
        }
        setIsLoading(false);
        return;
      }

      // Success!
      sounds.playSuccessChime();
      try {
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
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
      setToastMessage(`Welcome ${data.user.username}!`);
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
    setToastMessage(`Welcome ${mockName}!`);
  };

  return (
    <>
      {/* Toast Notification (Top Right Corner) */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[9999] bg-[#00e701] text-[#0f212e] font-black px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-[#0f212e]" />
          <span className="text-sm tracking-wide">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 p-1 text-[#0f212e]/70 hover:text-[#0f212e] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {isAuthModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) closeAuthModal();
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto overscroll-contain animate-in fade-in duration-200"
          style={{ overscrollBehavior: "contain" }}
        >
          <div
            className="relative w-full max-w-[440px] my-auto bg-[#1a2c38] border border-[#213743] rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col overscroll-contain animate-in zoom-in-95 duration-200"
            style={{ overscrollBehavior: "contain" }}
            role="dialog"
            aria-modal="true"
          >
            {/* Header with Stake Logo & Close */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#213743] bg-[#1a2c38] shrink-0">
              <div className="flex items-center gap-2.5">
                <StakeLogo className="h-6 w-auto text-white" />
              </div>

              <button
                onClick={closeAuthModal}
                className="p-1.5 rounded-lg text-[#b1bad3] hover:text-white hover:bg-[#213743] transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div
              className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 overscroll-contain custom-scrollbar"
              style={{ overscrollBehavior: "contain" }}
            >
              {/* Title & Subheading */}
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {isSignIn
                    ? "Welcome Back to Stake!"
                    : regStep === 1
                    ? "Create an Account"
                    : "Terms and Conditions"}
                </h2>
                {!isSignIn && (
                  <div className="mt-2.5 flex items-center justify-between">
                    <span className="text-xs font-bold text-[#b1bad3] uppercase tracking-wider">
                      Step {regStep} / 2
                    </span>
                    <div className="w-32 h-1.5 bg-[#0f212e] rounded-full overflow-hidden border border-[#213743]">
                      <div
                        className="h-full bg-[#1475e1] transition-all duration-300"
                        style={{ width: regStep === 1 ? "50%" : "100%" }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-semibold animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                  <span className="leading-relaxed">{errorMessage}</span>
                </div>
              )}

              {/* ==================================================== */}
              {/* 1. SIGN IN TAB                                       */}
              {/* ==================================================== */}
              {isSignIn ? (
                <form onSubmit={handleSignIn} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-[#b1bad3] uppercase tracking-wider mb-1.5">
                      Email or Username <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={loginIdentifier}
                      onChange={(e) => {
                        setLoginIdentifier(e.target.value);
                        if (errorMessage) setErrorMessage("");
                      }}
                      placeholder="Email or Username"
                      className="w-full bg-[#0f212e] border border-[#213743] focus:border-[#1475e1] rounded-xl px-3.5 py-3 text-white text-sm outline-none transition-colors placeholder:text-[#557086]"
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
                        type={showLoginPassword ? "text" : "password"}
                        value={loginPassword}
                        onChange={(e) => {
                          setLoginPassword(e.target.value);
                          if (errorMessage) setErrorMessage("");
                        }}
                        placeholder="Enter password"
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
                          alert("Password reset instructions have been dispatched to your registered address.")
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
                    className="w-full bg-[#1475e1] hover:bg-[#1268c7] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all shadow-md text-sm sm:text-base cursor-pointer mt-1 flex items-center justify-center gap-2"
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
              ) : regStep === 1 ? (
                /* ==================================================== */
                /* 2. REGISTRATION STEP 1 (CREATE AN ACCOUNT)            */
                /* ==================================================== */
                <form onSubmit={handleContinueToStep2} className="space-y-3">
                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-[#b1bad3] uppercase tracking-wider mb-1.5">
                      Email <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => {
                        setRegEmail(e.target.value);
                        clearFieldError("email");
                      }}
                      placeholder="e.g. user@example.com"
                      className={`w-full bg-[#0f212e] border rounded-xl px-3.5 py-2.5 text-white text-sm outline-none transition-colors placeholder:text-[#557086] ${
                        fieldErrors.email
                          ? "border-red-500/80 focus:border-red-500"
                          : "border-[#213743] focus:border-[#1475e1]"
                      }`}
                      autoComplete="email"
                      required
                    />
                    {fieldErrors.email && (
                      <p className="flex items-center gap-1.5 text-xs text-red-400 font-semibold mt-1 animate-in fade-in">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{fieldErrors.email}</span>
                      </p>
                    )}
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-xs font-bold text-[#b1bad3] uppercase tracking-wider mb-1.5">
                      Username <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={20}
                      value={regUsername}
                      onChange={(e) => {
                        setRegUsername(e.target.value);
                        clearFieldError("username");
                      }}
                      placeholder="Choose a username"
                      className={`w-full bg-[#0f212e] border rounded-xl px-3.5 py-2.5 text-white text-sm outline-none transition-colors placeholder:text-[#557086] ${
                        fieldErrors.username
                          ? "border-red-500/80 focus:border-red-500"
                          : "border-[#213743] focus:border-[#1475e1]"
                      }`}
                      autoComplete="username"
                      required
                    />
                    {fieldErrors.username && (
                      <p className="flex items-center gap-1.5 text-xs text-red-400 font-semibold mt-1 animate-in fade-in">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{fieldErrors.username}</span>
                      </p>
                    )}
                  </div>

                  {/* Password */}
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
                          clearFieldError("password");
                        }}
                        placeholder="At least 6 characters"
                        className={`w-full bg-[#0f212e] border rounded-xl px-3.5 py-2.5 pr-10 text-white text-sm outline-none transition-colors placeholder:text-[#557086] ${
                          fieldErrors.password
                            ? "border-red-500/80 focus:border-red-500"
                            : "border-[#213743] focus:border-[#1475e1]"
                        }`}
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
                    {fieldErrors.password && (
                      <p className="flex items-center gap-1.5 text-xs text-red-400 font-semibold mt-1 animate-in fade-in">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{fieldErrors.password}</span>
                      </p>
                    )}
                  </div>

                  {/* State Select Dropdown */}
                  <div>
                    <label className="block text-xs font-bold text-[#b1bad3] uppercase tracking-wider mb-1.5">
                      State <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={regState}
                        onChange={(e) => {
                          setRegState(e.target.value);
                          clearFieldError("state");
                        }}
                        className={`w-full bg-[#0f212e] border rounded-xl px-3.5 py-2.5 text-white text-sm outline-none transition-colors appearance-none cursor-pointer ${
                          fieldErrors.state
                            ? "border-red-500/80 focus:border-red-500"
                            : "border-[#213743] focus:border-[#1475e1]"
                        }`}
                        required
                      >
                        <option value="" disabled className="text-[#557086]">
                          Select your State / Region
                        </option>
                        {US_AND_IN_STATES.map((st) => (
                          <option key={st} value={st} className="bg-[#1a2c38] text-white">
                            {st}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-[#557086] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    {fieldErrors.state && (
                      <p className="flex items-center gap-1.5 text-xs text-red-400 font-semibold mt-1 animate-in fade-in">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{fieldErrors.state}</span>
                      </p>
                    )}
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="block text-xs font-bold text-[#b1bad3] uppercase tracking-wider mb-1.5">
                      Date of Birth <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={regDob}
                        onChange={(e) => {
                          setRegDob(e.target.value);
                          clearFieldError("dob");
                        }}
                        className={`w-full bg-[#0f212e] border rounded-xl px-3.5 py-2.5 text-white text-sm outline-none transition-colors ${
                          fieldErrors.dob
                            ? "border-red-500/80 focus:border-red-500"
                            : "border-[#213743] focus:border-[#1475e1]"
                        }`}
                        required
                      />
                    </div>
                    {fieldErrors.dob && (
                      <p className="flex items-center gap-1.5 text-xs text-red-400 font-semibold mt-1 animate-in fade-in">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{fieldErrors.dob}</span>
                      </p>
                    )}
                  </div>

                  {/* Optional Checkbox 1: Phone */}
                  <div className="pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={hasPhone}
                        onChange={(e) => {
                          setHasPhone(e.target.checked);
                          if (!e.target.checked) setRegPhone("");
                        }}
                        className="h-4 w-4 rounded bg-[#0f212e] border border-[#2f4553] text-[#1475e1] focus:ring-0 cursor-pointer accent-[#1475e1]"
                      />
                      <span className="text-xs font-bold text-[#b1bad3]">
                        Phone (Optional)
                      </span>
                    </label>
                    {hasPhone && (
                      <div className="mt-2 animate-in fade-in">
                        <input
                          type="tel"
                          value={regPhone}
                          onChange={(e) => {
                            setRegPhone(e.target.value);
                            clearFieldError("phone");
                          }}
                          placeholder="Enter your phone number"
                          className="w-full bg-[#0f212e] border border-[#213743] focus:border-[#1475e1] rounded-xl px-3.5 py-2 text-white text-xs outline-none transition-colors placeholder:text-[#557086]"
                        />
                        {fieldErrors.phone && (
                          <p className="flex items-center gap-1.5 text-xs text-red-400 font-semibold mt-1 animate-in fade-in">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{fieldErrors.phone}</span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Optional Checkbox 2: Referral Code */}
                  <div className="pt-0.5">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={hasReferral}
                        onChange={(e) => {
                          setHasReferral(e.target.checked);
                          if (!e.target.checked) setReferralCode("");
                        }}
                        className="h-4 w-4 rounded bg-[#0f212e] border border-[#2f4553] text-[#1475e1] focus:ring-0 cursor-pointer accent-[#1475e1]"
                      />
                      <span className="text-xs font-bold text-[#b1bad3]">
                        Referral Code (Optional)
                      </span>
                    </label>
                    {hasReferral && (
                      <div className="mt-2 animate-in fade-in">
                        <input
                          type="text"
                          value={referralCode}
                          onChange={(e) => setReferralCode(e.target.value)}
                          placeholder="Enter referral or promo code"
                          className="w-full bg-[#0f212e] border border-[#213743] focus:border-[#1475e1] rounded-xl px-3.5 py-2 text-white text-xs outline-none transition-colors placeholder:text-[#557086]"
                        />
                      </div>
                    )}
                  </div>

                  {/* Continue Button */}
                  <button
                    type="submit"
                    className="w-full bg-[#1475e1] hover:bg-[#1268c7] text-white font-bold py-3.5 rounded-xl transition-all shadow-md text-sm sm:text-base cursor-pointer mt-2 flex items-center justify-center gap-2"
                  >
                    <span>Continue</span>
                  </button>
                </form>
              ) : (
                /* ==================================================== */
                /* 3. REGISTRATION STEP 2 (TERMS & CONDITIONS)           */
                /* ==================================================== */
                <form onSubmit={handleFinalRegister} className="space-y-4">
                  {/* Back Navigation Button */}
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setRegStep(1);
                    }}
                    className="flex items-center gap-2 text-xs font-bold text-[#b1bad3] hover:text-white transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Account Details</span>
                  </button>

                  {/* Scrollable Terms & Conditions Box */}
                  <div className="p-4 bg-[#0f212e] border border-[#213743] rounded-xl max-h-56 overflow-y-auto text-xs text-[#b1bad3] space-y-2.5 custom-scrollbar leading-relaxed">
                    <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider pb-1 border-b border-[#213743]">
                      <FileText className="w-4 h-4 text-[#1475e1]" />
                      <span>Stake Platform Terms & Conditions</span>
                    </div>

                    <p className="font-semibold text-white/90">
                      IMPORTANT NOTICE: PLEASE READ CAREFULLY BEFORE CREATING AN ACCOUNT.
                    </p>

                    <p>
                      <strong>1. Eligibility:</strong> You must be at least 18 years of age or the legal age of majority in your jurisdiction, whichever is greater. You represent and warrant that all registration details submitted are true, accurate, and complete.
                    </p>

                    <p>
                      <strong>2. Prohibited Jurisdictions & Clause 26:</strong> Access from restricted territories, sanctioned areas, or jurisdictions where online entertainment is prohibited by applicable local legislation is strictly disallowed. Use of unauthorized proxy networks or spoofed coordinates to circumvent access controls is an express violation of our guidelines.
                    </p>

                    <p>
                      <strong>3. Mandatory Arbitration & Dispute Resolution:</strong> All disputes, claims, or controversies arising out of or relating to this agreement shall be settled through binding individual arbitration rather than in court. Class action waivers apply in full force.
                    </p>

                    <p>
                      <strong>4. Responsible Entertainment:</strong> We are committed to responsible participation. You have access to deposit limits, self-exclusion tools, and cooling-off periods at all times in your security dashboard.
                    </p>

                    <p>
                      <strong>5. Security & Verification:</strong> Stake reserves the right to request proof of age, identity verification, and source of funds at any point to uphold anti-money laundering and fair play protocols.
                    </p>
                  </div>

                  {/* Mandatory Checkbox */}
                  <div>
                    <label className="flex items-start gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={agreedTerms}
                        onChange={(e) => {
                          setAgreedTerms(e.target.checked);
                          clearFieldError("terms");
                        }}
                        className="mt-0.5 h-4 w-4 rounded bg-[#0f212e] border border-[#2f4553] text-[#1475e1] focus:ring-0 cursor-pointer accent-[#1475e1]"
                        required
                      />
                      <span className="text-xs text-[#b1bad3] leading-relaxed">
                        I have read and agree to the{" "}
                        <span className="text-white font-semibold underline">
                          Terms and Conditions
                        </span>
                        . <span className="text-red-400">*</span>
                      </span>
                    </label>
                    {fieldErrors.terms && (
                      <p className="flex items-center gap-1.5 text-xs text-red-400 font-semibold mt-1 animate-in fade-in">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{fieldErrors.terms}</span>
                      </p>
                    )}
                  </div>

                  {/* Create Account Final Button */}
                  <button
                    type="submit"
                    disabled={!agreedTerms || isLoading}
                    className="w-full bg-[#1475e1] hover:bg-[#1268c7] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all shadow-md text-sm sm:text-base cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Creating Account...</span>
                      </>
                    ) : (
                      <span>Create an Account</span>
                    )}
                  </button>
                </form>
              )}

              {/* ==================================================== */}
              {/* SOCIAL LOGINS SECTION (Shown on Sign In & Step 1)     */}
              {/* ==================================================== */}
              {(isSignIn || regStep === 1) && (
                <>
                  {/* Or Horizontal Divider */}
                  <div className="relative my-3 flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[#213743]" />
                    </div>
                    <span className="relative bg-[#1a2c38] px-3 text-xs font-bold text-[#b1bad3] uppercase tracking-wider">
                      Or
                    </span>
                  </div>

                  {/* Social Buttons Stack */}
                  <div className="space-y-2">
                    {/* Continue With Google (Blue button with Google icon) */}
                    <button
                      type="button"
                      onClick={() => handleQuickAuth("Google")}
                      className="w-full bg-[#1475e1] hover:bg-[#1268c7] text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2.5 text-xs sm:text-sm shadow-sm transition-colors cursor-pointer"
                    >
                      <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.52 0 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.4.4-.8.76-1.28 1.08-.88.6-1.96.92-3.36.92-2.48 0-4.52-2.04-4.52-4.52S9.52 1.76 12 1.76c1.28 0 2.36.44 3.2 1.28l1.32-1.32C15.36.6 13.8 0 12 0 5.36 0 0 5.36 0 12s5.36 12 12 12c6.92 0 11.56-4.88 11.56-11.76 0-.8-.08-1.56-.24-2.24H12v4.48h7.2c-.32 1.68-1.28 3.12-2.56 4.32z" />
                      </svg>
                      <span>Continue With Google</span>
                    </button>

                    {/* Continue With Passkey (Dark button with passkey icon) */}
                    <button
                      type="button"
                      onClick={() => handleQuickAuth("Passkey")}
                      className="w-full bg-[#0f212e] border border-[#213743] hover:bg-[#14232e] text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2.5 text-xs sm:text-sm transition-colors cursor-pointer"
                    >
                      <KeyRound className="w-4 h-4 text-[#b1bad3]" />
                      <span>Continue With Passkey</span>
                    </button>

                    {/* See More Options Accordion Toggle */}
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setShowMoreOptions(!showMoreOptions)}
                        className="w-full py-2 text-xs font-bold text-[#b1bad3] hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span>See More Options</span>
                        {showMoreOptions ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {showMoreOptions && (
                        <div className="grid grid-cols-3 gap-2 mt-1.5 animate-in fade-in duration-150">
                          <button
                            type="button"
                            onClick={() => handleQuickAuth("Facebook")}
                            className="bg-[#0f212e] hover:bg-[#1877F2]/20 border border-[#213743] hover:border-[#1877F2] text-white font-semibold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <span className="font-bold text-[#1877F2]">f</span>
                            <span>Facebook</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickAuth("Kick")}
                            className="bg-[#0f212e] hover:bg-[#53FC18]/20 border border-[#213743] hover:border-[#53FC18] text-white font-semibold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <span className="font-bold text-[#53FC18]">K</span>
                            <span>Kick</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickAuth("Twitch")}
                            className="bg-[#0f212e] hover:bg-[#9146FF]/20 border border-[#213743] hover:border-[#9146FF] text-white font-semibold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <span className="font-bold text-[#9146FF]">T</span>
                            <span>Twitch</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* ==================================================== */}
              {/* FOOTER SWITCH (Sign In <=> Register)                 */}
              {/* ==================================================== */}
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
      )}
    </>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, User, Eye, EyeOff, RefreshCw, AlertCircle, ArrowRight } from "lucide-react";
import { sounds } from "@/utils/audio";

export default function AdminLoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Check if already authenticated; if so, redirect directly to /admin
  useEffect(() => {
    async function checkExistingAuth() {
      try {
        const res = await fetch("/api/admin/auth/me");
        const data = await res.json();
        if (data?.authenticated) {
          router.replace("/admin");
          return;
        }
      } catch {}
      setIsCheckingAuth(false);
    }
    checkExistingAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const cleanUsername = username.trim();
    if (!cleanUsername || !password) {
      setErrorMessage("Please enter both username and security key.");
      return;
    }

    setIsLoading(true);
    sounds.playClick();

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: cleanUsername,
          password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.success) {
        setErrorMessage(data?.error || "Invalid admin credentials");
        setIsLoading(false);
        return;
      }

      sounds.playSuccessChime();
      router.push("/admin");
    } catch (err: any) {
      console.error("[Admin Login] Network error:", err);
      setErrorMessage("Network error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#0f212e] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-[#00e701]" />
          <p className="text-xs font-mono text-[#b1bad3]">Verifying terminal authorization...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f212e] text-white flex flex-col items-center justify-center p-4 selection:bg-[#00e701] selection:text-black">
      {/* Background ambient radial glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <div className="w-[500px] h-[500px] bg-[#1475e1]/10 rounded-full blur-3xl" />
        <div className="w-[300px] h-[300px] bg-[#00e701]/5 rounded-full blur-2xl" />
      </div>

      <div className="w-full max-w-[420px] relative z-10 space-y-6">
        {/* Brand / Terminal Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#1a2c38] border border-[#213743] shadow-xl text-[#00e701] mb-2">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            <span>Stake</span>
            <span className="text-[#00e701] font-mono text-sm px-2 py-0.5 rounded bg-[#00e701]/10 border border-[#00e701]/20">
              TERMINAL
            </span>
          </h1>
          <p className="text-xs text-[#b1bad3]">Super Admin Authentication & Management Gateway</p>
        </div>

        {/* Login Box */}
        <div className="bg-[#1a2c38] border border-[#213743] rounded-2xl p-6 sm:p-7 shadow-2xl space-y-5">
          {errorMessage && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-semibold animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-[#b1bad3] uppercase tracking-wider">
                Admin Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (errorMessage) setErrorMessage("");
                  }}
                  placeholder="e.g. admin"
                  className="w-full bg-[#0f212e] border border-[#213743] focus:border-[#00e701] rounded-xl px-3.5 py-3 text-white text-sm outline-none transition-colors placeholder:text-[#557086]"
                  autoComplete="username"
                  required
                />
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#557086]">
                  <User className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-[#b1bad3] uppercase tracking-wider">
                Security Key / Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage("");
                  }}
                  placeholder="Enter admin password"
                  className="w-full bg-[#0f212e] border border-[#213743] focus:border-[#00e701] rounded-xl px-3.5 py-3 pr-10 text-white text-sm outline-none transition-colors placeholder:text-[#557086]"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#557086] hover:text-white transition-colors cursor-pointer"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#00e701] hover:brightness-110 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-[#0f212e] font-black py-3 rounded-xl transition-all shadow-lg text-sm cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#0f212e]" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Access Terminal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <div className="text-center text-[11px] text-[#557086] space-y-1 font-mono">
          <p>Protected System • IP & Activity Logged</p>
          <p>Stake Casino Control Protocol v2.5</p>
        </div>
      </div>
    </div>
  );
}

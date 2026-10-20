"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { StakeLogo } from "@/components/common/StakeLogo";
import {
  Lock,
  User,
  Eye,
  EyeOff,
  RefreshCw,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
  Zap,
} from "lucide-react";
import { sounds } from "@/utils/audio";

export default function AdminLoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Check if already authenticated; if so, redirect directly to /admin
  useEffect(() => {
    let isMounted = true;
    async function checkExistingAuth() {
      try {
        const res = await fetch("/api/admin/auth/me");
        const data = await res.json().catch(() => ({}));
        if (data?.authenticated && isMounted) {
          router.replace("/admin");
          return;
        }
      } catch {}
    }
    checkExistingAuth();
    return () => {
      isMounted = false;
    };
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
        setErrorMessage(data?.error || "Invalid administrator credentials");
        setIsLoading(false);
        return;
      }

      sounds.playSuccessChime();
      router.push("/admin");
    } catch (err: any) {
      console.error("[Admin Login] Network error:", err);
      setErrorMessage("Network connection error. Please try again.");
      setIsLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#0f212e] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-7 h-7 animate-spin text-[#00e701]" />
          <p className="text-xs font-mono text-[#b1bad3]">Verifying Mission Control clearance...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f212e] text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-[#00e701] selection:text-black font-sans relative overflow-hidden">
      {/* Background ambient radial glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <div className="w-[600px] h-[600px] bg-[#1475e1]/10 rounded-full blur-[140px]" />
        <div className="w-[400px] h-[400px] bg-[#00e701]/5 rounded-full blur-[120px] -translate-y-24" />
      </div>

      <div className="w-full max-w-[420px] relative z-10 space-y-6">
        {/* Brand / Full Stake Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center">
            <StakeLogo collapsed={false} className="h-9 sm:h-10 w-auto text-white drop-shadow-md" />
          </div>
          <p className="text-xs text-[#b1bad3]">
            Admin Portal
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-[#1a2c38] border border-[#213743] rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/80 backdrop-blur-xl relative">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Username */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                MASTER USERNAME
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  required
                  autoFocus
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0f212e] border border-[#213743] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00e701]/60 focus:ring-1 focus:ring-[#00e701]/40 transition-all font-mono"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                MASTER PASSWORD
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-2.5 bg-[#0f212e] border border-[#213743] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00e701]/60 focus:ring-1 focus:ring-[#00e701]/40 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider bg-[#00e701] hover:bg-[#00c701] text-[#0f212e] hover:opacity-95 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none transition-all shadow-lg shadow-[#00e701]/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#0f212e]" />
                  <span>SIGNING IN...</span>
                </>
              ) : (
                <span>SIGN IN TO ADMIN PANEL</span>
              )}
            </button>
          </form>
        </div>

        {/* Back link to player lobby */}
        <div className="text-center">
          <a
            href="/"
            className="text-xs text-slate-400 hover:text-white transition-colors font-mono"
          >
            ← Return to Stake Casino Lobby
          </a>
        </div>
      </div>
    </div>
  );
}

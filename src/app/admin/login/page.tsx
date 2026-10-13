"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
      <div className="min-h-screen bg-[#090a0f] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-7 h-7 animate-spin text-amber-400" />
          <p className="text-xs font-mono text-slate-400">Verifying Mission Control clearance...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-amber-500 selection:text-black font-sans relative overflow-hidden">
      {/* Background ambient obsidian radial glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <div className="w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[140px]" />
        <div className="w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[120px] -translate-y-24" />
        <div className="w-[300px] h-[300px] bg-violet-500/5 rounded-full blur-[100px] translate-y-36" />
      </div>

      <div className="w-full max-w-[420px] relative z-10 space-y-6">
        {/* Brand / FlopShow Mission Control Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center text-black font-black text-xl shadow-xl shadow-amber-500/20 border border-amber-300/30">
              FS
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-wider text-white">
                  FLOP<span className="text-amber-400">SHOW</span>
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-black tracking-widest uppercase bg-amber-500/15 border border-amber-500/40 text-amber-400 shadow-sm">
                  ADMIN
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono tracking-wider">Mission-Control Portal</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Authorized personnel only. All access attempts and administrative actions are cryptographically logged.
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-[#131722] border border-[#1e2433] rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/80 backdrop-blur-xl relative">
          <div className="flex items-center justify-between pb-5 border-b border-[#1e2433] mb-6">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-slate-200 tracking-wider uppercase">
                Terminal Clearance
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
              ● Secure Port
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Username */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">
                Administrator Username / ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
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
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0e1017] border border-[#1e2433] rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40 transition-all font-mono"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-slate-300">
                  Security Key / Password
                </label>
                <span className="text-[11px] text-slate-500 font-mono">Default: admin123</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-2.5 bg-[#0e1017] border border-[#1e2433] rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-black hover:opacity-95 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-black" />
                  <span>Authorizing Session...</span>
                </>
              ) : (
                <>
                  <span>Enter Mission Control</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Security notice footer */}
          <div className="mt-6 pt-5 border-t border-[#1e2433] flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5 font-mono">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500/80" />
              256-Bit TLS Guarded
            </span>
            <span className="font-mono text-slate-500">v4.8 • Core</span>
          </div>
        </div>

        {/* Back link to player lobby */}
        <div className="text-center">
          <a
            href="/"
            className="text-xs text-slate-500 hover:text-amber-400 transition-colors font-mono"
          >
            ← Return to FlopShow Player Lobby
          </a>
        </div>
      </div>
    </div>
  );
}

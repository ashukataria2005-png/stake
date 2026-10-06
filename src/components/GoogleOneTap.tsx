"use client";

import React, { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import { useGame } from "@/context/GameContext";
import { sounds } from "@/utils/audio";

interface GoogleAccount {
  id: string;
  name: string;
  email?: string;
  initial: string;
  bgColor: string;
}

export default function GoogleOneTap() {
  const { isAuthenticated, login, isOneTapOpen, closeOneTap, openOneTap } = useGame();
  const [isVisible, setIsVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  // Initial 1.2 second auto-trigger for guest users
  useEffect(() => {
    if (isAuthenticated || dismissed) return;

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1200);

    return () => clearTimeout(timer);
  }, [isAuthenticated, dismissed]);

  // Sync with manual open requests from Navbar/Hero CTA
  useEffect(() => {
    if (isOneTapOpen && !isAuthenticated) {
      setIsVisible(true);
      setDismissed(false);
    }
  }, [isOneTapOpen, isAuthenticated]);

  const accounts: GoogleAccount[] = [
    {
      id: "acc-1",
      name: "Anuj",
      email: "ashukataria2005@gmail.com",
      initial: "A",
      bgColor: "bg-purple-600",
    },
    {
      id: "acc-2",
      name: "Mohit Bhanker",
      email: "mohitbhanker1@gmail.com",
      initial: "M",
      bgColor: "bg-red-600",
    },
    {
      id: "acc-3",
      name: "Mohit Bhanker",
      initial: "M",
      bgColor: "bg-blue-600",
    },
  ];

  const handleSelectAccount = (acc: GoogleAccount) => {
    setSelectedAccountId(acc.id);
    sounds.playSuccessChime();

    setTimeout(() => {
      login({
        name: acc.name,
        email: acc.email || `${acc.name.toLowerCase().replace(/\s+/g, "")}@gmail.com`,
        avatarColor: acc.bgColor.replace("bg-", ""),
      });
      setIsVisible(false);
      closeOneTap();
    }, 300);
  };

  const handleClose = () => {
    setIsVisible(false);
    setDismissed(true);
    closeOneTap();
  };

  if (!isVisible || isAuthenticated) return null;

  return (
    <>
      {/* Dark Stake Backdrop Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
        onClick={handleClose}
      />

      {/* Native Google One-Tap Bottom Sheet / Floating Drawer */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center p-0 sm:bottom-6 sm:right-6 sm:left-auto sm:p-0">
        <div
          role="dialog"
          aria-labelledby="google-one-tap-title"
          className="w-full sm:w-[400px] rounded-t-2xl sm:rounded-2xl bg-[#1e293b] border border-[#334155] shadow-2xl text-white overflow-hidden transform transition-all duration-300 ease-out animate-in slide-in-from-bottom"
        >
          {/* Top Bar: Multi-color Google "G" logo + Title + Close */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#334155]/80 bg-[#0f172a]/60">
            <div className="flex items-center gap-2.5">
              {/* Authentic Google Multi-Color "G" SVG */}
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.04h3.88c2.27-2.09 3.665-5.17 3.665-9.14z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.04c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.13C3.25 21.35 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.28c-.25-.72-.38-1.49-.38-2.28s.13-1.56.38-2.28V6.59H1.26C.46 8.19 0 9.99 0 12s.46 3.81 1.26 5.41l4.02-3.13z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.65 1.26 6.59l4.02 3.13c.95-2.83 3.6-4.97 6.72-4.97z"
                />
              </svg>
              <span id="google-one-tap-title" className="text-xs sm:text-sm font-medium text-slate-200">
                Sign in to <span className="font-semibold text-white">stake</span> with google.com
              </span>
            </div>

            <button
              onClick={handleClose}
              aria-label="Close Google sign-in"
              className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Account Picker Header */}
          <div className="px-4 pt-3 pb-1">
            <p className="text-xs font-semibold text-slate-300">Choose an account</p>
          </div>

          {/* Account Picker List */}
          <div className="px-2 py-1 space-y-1">
            {accounts.map((acc) => {
              const isSelected = selectedAccountId === acc.id;
              return (
                <button
                  key={acc.id}
                  onClick={() => handleSelectAccount(acc)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all text-left ${
                    isSelected
                      ? "bg-slate-700/80 border border-emerald-500/50"
                      : "hover:bg-slate-800/80 hover:border-slate-700 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Avatar Pill */}
                    <div
                      className={`w-9 h-9 rounded-full ${acc.bgColor} flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0`}
                    >
                      {acc.initial}
                    </div>

                    {/* Account Info */}
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white truncate">
                        {acc.name}
                      </div>
                      {acc.email && (
                        <div className="text-xs text-slate-400 truncate">
                          {acc.email}
                        </div>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Google Consent & Footer Note */}
          <div className="p-4 border-t border-[#334155]/60 bg-[#0f172a]/30 mt-1">
            <p className="text-[11px] leading-relaxed text-slate-400">
              To continue, Google will share your name, email address, and language preference with Stake.
            </p>
            <div className="mt-2.5 flex items-center justify-between text-[11px] text-blue-400 font-medium">
              <span className="hover:underline cursor-pointer">Privacy Policy</span>
              <span className="text-slate-500">•</span>
              <span className="hover:underline cursor-pointer">Terms of Service</span>
              <span className="text-slate-500">•</span>
              <span className="text-emerald-400 font-bold">$1,000 Demo Ready</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

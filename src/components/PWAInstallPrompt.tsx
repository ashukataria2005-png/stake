"use client";

import React, { useState, useEffect } from "react";
import { Download, X, Smartphone, Sparkles } from "lucide-react";
import { StakeLogo } from "@/components/common/StakeLogo";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState<boolean>(false);
  const [isInstalling, setIsInstalling] = useState<boolean>(false);

  useEffect(() => {
    // Check if already installed in standalone mode
    if (typeof window !== "undefined") {
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;

      if (isStandalone) {
        return;
      }

      // Check if user recently dismissed in this session
      const dismissed = sessionStorage.getItem("stake_pwa_prompt_dismissed");
      if (dismissed) {
        return;
      }

      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
        setShowPrompt(true);
      };

      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

      // Mobile device detection for demonstration banner
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

      // If mobile and not dismissed, show prompt after a short delay
      let timer: NodeJS.Timeout | null = null;
      if (isMobile) {
        timer = setTimeout(() => {
          setShowPrompt(true);
        }, 3500);
      }

      return () => {
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        if (timer) clearTimeout(timer);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      setIsInstalling(true);
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === "accepted") {
          setShowPrompt(false);
        }
      } catch (err) {
        console.error("PWA install error:", err);
      } finally {
        setIsInstalling(false);
        setDeferredPrompt(null);
      }
    } else {
      // Manual fallback instructions for iOS / browsers without beforeinstallprompt
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        alert("To install Stake on iOS:\n1. Tap the Share icon (box with arrow)\n2. Select 'Add to Home Screen'");
      } else {
        alert("To install Stake:\nOpen browser settings (⋮) and tap 'Install app' or 'Add to Home screen'");
      }
      setShowPrompt(false);
      sessionStorage.setItem("stake_pwa_prompt_dismissed", "true");
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem("stake_pwa_prompt_dismissed", "true");
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:w-96 z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-[#14232d] border border-[#213743] hover:border-[#2f4553] shadow-[0_10px_35px_rgba(0,0,0,0.7)] rounded-2xl p-4 text-white relative flex items-center gap-3.5 backdrop-blur-md">
        {/* Stake Icon Badge */}
        <div className="h-12 w-12 rounded-xl bg-[#0f212e] border border-[#213743] flex items-center justify-center p-2 shrink-0 shadow-inner">
          <StakeLogo className="w-8 h-8 text-[#1475e1]" collapsed={true} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center gap-1.5">
            <h4 className="text-sm font-black text-white truncate">Install Stake App</h4>
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          </div>
          <p className="text-xs text-[#b1bad3] leading-snug mt-0.5 line-clamp-2">
            Add Stake to Home Screen for fast native access and smooth gameplay.
          </p>

          <div className="flex items-center gap-2 mt-2.5">
            <button
              type="button"
              onClick={handleInstallClick}
              disabled={isInstalling}
              className="bg-[#00e701] hover:bg-[#00c801] active:scale-95 text-[#0f212e] font-black text-xs px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{isInstalling ? "Installing..." : "Install"}</span>
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="bg-[#213743] hover:bg-[#2a4555] text-[#b1bad3] hover:text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              Later
            </button>
          </div>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-2.5 right-2.5 text-[#b1bad3] hover:text-white p-1 rounded-lg hover:bg-[#213743] transition-colors cursor-pointer"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

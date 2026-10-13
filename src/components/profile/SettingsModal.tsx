"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Settings,
  User,
  Shield,
  Sliders,
  Key,
  CheckCircle2,
  FileCheck,
  Gift,
  ChevronRight,
  ChevronLeft,
  Lock,
  Smartphone,
  Mail,
  Volume2,
  VolumeX,
  Bell,
  Globe,
  Upload,
  Copy,
  Check,
  RefreshCw,
  LogOut,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import { sounds } from "@/utils/audio";

export type SettingsSection =
  | "MENU"
  | "ACCOUNT"
  | "SECURITY"
  | "PREFERENCES"
  | "API"
  | "VERIFICATION"
  | "ENHANCED_VERIFICATION"
  | "OFFERS";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSection?: SettingsSection;
}

export default function SettingsModal({
  isOpen,
  onClose,
  initialSection = "MENU",
}: SettingsModalProps) {
  const {
    user,
    selectedFiat,
    setSelectedFiat,
    currencySymbol,
  } = useGame();

  const [mounted, setMounted] = useState(false);
  const [currentSection, setCurrentSection] = useState<SettingsSection>(initialSection);
  const [copiedKey, setCopiedKey] = useState(false);

  // Account form
  const [username, setUsername] = useState(user?.username || "StakeUser");
  const [email, setEmail] = useState(user?.email || "user@stake.bet");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [accountSaved, setAccountSaved] = useState(false);

  // Security form
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [twoFactorSecret] = useState("JBSWY3DPEHPK3PXP");
  const [securitySuccess, setSecuritySuccess] = useState("");

  // Preferences form
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("English (US)");

  // API keys
  const [apiKey, setApiKey] = useState("sk_live_948fbc8a213490efbc");
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);

  // Verification Level 1
  const [firstName, setFirstName] = useState("Aman");
  const [lastName, setLastName] = useState("Kumar");
  const [dob, setDob] = useState("1998-05-14");
  const [country, setCountry] = useState("India");
  const [address, setAddress] = useState("14 Sector 22");
  const [city, setCity] = useState("Delhi");
  const [postalCode, setPostalCode] = useState("110001");
  const [isLevel1Verified, setIsLevel1Verified] = useState(true);

  // Enhanced Verification (Level 2/3)
  const [idUploaded, setIdUploaded] = useState(false);
  const [proofAddressUploaded, setProofAddressUploaded] = useState(false);

  // Offers
  const [emailPromotions, setEmailPromotions] = useState(true);
  const [smsPromotions, setSmsPromotions] = useState(true);
  const [telegramAlerts, setTelegramAlerts] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setCurrentSection(initialSection);
      setAccountSaved(false);
      setSecuritySuccess("");
    }
  }, [isOpen, initialSection]);

  // Lock background scroll
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow || "unset";
      };
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const menuItems = [
    {
      id: "ACCOUNT" as SettingsSection,
      title: "Account",
      desc: "Username, Email, Phone, Currency preferences",
      icon: User,
      badge: "Basic",
      badgeColor: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    },
    {
      id: "SECURITY" as SettingsSection,
      title: "Security",
      desc: "Change Password, 2FA setup, Session history",
      icon: Shield,
      badge: is2FAEnabled ? "2FA On" : "2FA Off",
      badgeColor: is2FAEnabled
        ? "bg-[#00e701]/15 text-[#00e701] border-[#00e701]/30"
        : "bg-amber-500/15 text-amber-300 border-amber-500/30",
    },
    {
      id: "PREFERENCES" as SettingsSection,
      title: "Preferences",
      desc: "Sounds, Notifications, Language",
      icon: Sliders,
    },
    {
      id: "API" as SettingsSection,
      title: "API",
      desc: "API keys, Developer access",
      icon: Key,
    },
    {
      id: "VERIFICATION" as SettingsSection,
      title: "Verification",
      desc: "Level 1 KYC verification status",
      icon: CheckCircle2,
      badge: isLevel1Verified ? "Verified" : "Pending",
      badgeColor: isLevel1Verified
        ? "bg-[#00e701]/15 text-[#00e701] border-[#00e701]/30"
        : "bg-amber-500/15 text-amber-300 border-amber-500/30",
    },
    {
      id: "ENHANCED_VERIFICATION" as SettingsSection,
      title: "Enhanced Verification",
      desc: "Level 2/3 ID document upload",
      icon: FileCheck,
      badge: idUploaded ? "In Review" : "Upload Req.",
      badgeColor: idUploaded
        ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/30"
        : "bg-purple-500/15 text-purple-300 border-purple-500/30",
    },
    {
      id: "OFFERS" as SettingsSection,
      title: "Offers",
      desc: "Bonus preferences, Marketing toggles",
      icon: Gift,
    },
  ];

  const sectionTitles: Record<SettingsSection, string> = {
    MENU: "Settings",
    ACCOUNT: "Account",
    SECURITY: "Security",
    PREFERENCES: "Preferences",
    API: "API",
    VERIFICATION: "Verification (Level 1)",
    ENHANCED_VERIFICATION: "Enhanced Verification",
    OFFERS: "Offers & Promotions",
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(twoFactorSecret);
    sounds.playClick();
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return createPortal(
    <div className="fixed inset-0 z-[9990] flex items-center justify-center sm:p-4 select-none">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={() => {
          sounds.playClick();
          onClose();
        }}
      />

      {/* Main Container */}
      <div className="relative w-full sm:max-w-md md:max-w-lg h-full sm:h-auto sm:max-h-[92vh] flex flex-col bg-[#1a2c38] sm:border sm:border-[#213743] sm:rounded-2xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* ========================================================= */}
        {/* HEADER */}
        {/* ========================================================= */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#213743] bg-[#14232d] shrink-0">
          <div className="flex items-center gap-2.5">
            {currentSection !== "MENU" && (
              <button
                onClick={() => {
                  sounds.playClick();
                  setCurrentSection("MENU");
                }}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#213743] text-[#b1bad3] hover:text-white hover:bg-[#2a4454] transition-colors cursor-pointer mr-1"
                title="Back to Settings"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}

            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#213743] text-white">
              <Settings className="h-4.5 w-4.5 text-cyan-400" />
            </div>
            <h2 className="text-base font-black text-white tracking-wide">
              {sectionTitles[currentSection]}
            </h2>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#879097] hover:text-white hover:bg-[#213743] transition-colors cursor-pointer"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ========================================================= */}
        {/* BODY */}
        {/* ========================================================= */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {/* ------------------------------------------------------- */}
          {/* MAIN SETTINGS LIST (Screenshot 183) */}
          {/* ------------------------------------------------------- */}
          {currentSection === "MENU" && (
            <div className="space-y-2 py-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      sounds.playClick();
                      setCurrentSection(item.id);
                    }}
                    className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[#213743]/60 hover:bg-[#213743] border border-[#284252]/60 hover:border-[#2f4553] transition-all cursor-pointer group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#14232d] text-[#b1bad3] group-hover:text-white">
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-2">
                          <span>{item.title}</span>
                          {item.badge && (
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-black border ${item.badgeColor}`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#879097] mt-0.5">{item.desc}</p>
                      </div>
                    </div>

                    <ChevronRight className="h-4 w-4 text-[#879097] group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                  </button>
                );
              })}
            </div>
          )}

          {/* ------------------------------------------------------- */}
          {/* 1. ACCOUNT SUB-VIEW */}
          {/* ------------------------------------------------------- */}
          {currentSection === "ACCOUNT" && (
            <div className="space-y-4">
              <div className="rounded-xl bg-[#14232d] border border-[#213743] p-4 space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#879097] uppercase">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0f212e] border border-[#213743] focus:border-cyan-400 text-white font-medium text-sm outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#879097] uppercase">Email</label>
                    <span className="text-[10px] font-bold text-[#00e701] flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Verified
                    </span>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0f212e] border border-[#213743] focus:border-cyan-400 text-white font-medium text-sm outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#879097] uppercase">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0f212e] border border-[#213743] focus:border-cyan-400 text-white font-medium text-sm outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#879097] uppercase">Display Currency</label>
                  <select
                    value={selectedFiat}
                    onChange={(e) => {
                      setSelectedFiat(e.target.value);
                      sounds.playClick();
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-[#0f212e] border border-[#213743] focus:border-cyan-400 text-white font-medium text-sm outline-none cursor-pointer"
                  >
                    <option value="INR">INR (₹) - Indian Rupee</option>
                    <option value="USD">USD ($) - US Dollar</option>
                    <option value="EUR">EUR (€) - Euro</option>
                    <option value="USDT">USDT - Tether</option>
                  </select>
                </div>

                {accountSaved && (
                  <p className="text-xs font-bold text-[#00e701] flex items-center gap-1">
                    <Check className="h-3.5 w-3.5" /> Account settings updated successfully.
                  </p>
                )}

                <button
                  onClick={() => {
                    sounds.playSuccessChime();
                    setAccountSaved(true);
                    setTimeout(() => setAccountSaved(false), 2500);
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#00e701] hover:bg-[#00c801] text-[#0f212e] font-black text-xs transition-transform active:scale-98 cursor-pointer shadow-lg shadow-[#00e701]/20"
                >
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------- */}
          {/* 2. SECURITY SUB-VIEW */}
          {/* ------------------------------------------------------- */}
          {currentSection === "SECURITY" && (
            <div className="space-y-4">
              {/* Change Password */}
              <div className="rounded-xl bg-[#14232d] border border-[#213743] p-4 space-y-3">
                <h3 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2">
                  <Lock className="h-4 w-4 text-cyan-400" />
                  <span>Change Password</span>
                </h3>

                <div className="space-y-2">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Old Password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0f212e] border border-[#213743] text-white text-xs outline-none"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0f212e] border border-[#213743] text-white text-xs outline-none"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0f212e] border border-[#213743] text-white text-xs outline-none"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="text-[11px] text-[#879097] hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    <span>{showPassword ? "Hide" : "Show"} passwords</span>
                  </button>

                  <button
                    onClick={() => {
                      if (!newPassword || newPassword !== confirmPassword) {
                        setSecuritySuccess("Passwords must match and cannot be empty.");
                        return;
                      }
                      sounds.playSuccessChime();
                      setSecuritySuccess("Password updated successfully.");
                      setOldPassword("");
                      setNewPassword("");
                      setConfirmPassword("");
                    }}
                    className="px-4 py-2 rounded-lg bg-[#213743] hover:bg-[#2a4454] text-white font-bold text-xs cursor-pointer"
                  >
                    Update Password
                  </button>
                </div>

                {securitySuccess && (
                  <p className="text-xs font-bold text-cyan-400">{securitySuccess}</p>
                )}
              </div>

              {/* Two-Factor Authentication */}
              <div className="rounded-xl bg-[#14232d] border border-[#213743] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-[#00e701]" />
                    <span className="text-xs font-black uppercase text-white">
                      Two-Factor Authentication (2FA)
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      sounds.playClick();
                      setIs2FAEnabled((prev) => !prev);
                    }}
                    className={`w-11 h-6 rounded-full transition-colors p-1 cursor-pointer flex items-center ${
                      is2FAEnabled ? "bg-[#00e701] justify-end" : "bg-[#213743] justify-start"
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-[#0f212e]" />
                  </button>
                </div>

                <p className="text-[11px] text-[#879097] leading-relaxed">
                  Protect your withdrawals and account security using Google Authenticator or Authy.
                </p>

                {is2FAEnabled && (
                  <div className="p-3 rounded-lg bg-[#0f212e] border border-[#213743] space-y-2">
                    <span className="text-[10px] font-bold uppercase text-[#879097]">
                      Secret Key
                    </span>
                    <div className="flex items-center justify-between font-mono text-xs text-white">
                      <span>{twoFactorSecret}</span>
                      <button
                        onClick={handleCopySecret}
                        className="p-1 hover:text-[#00e701] text-[#879097] cursor-pointer"
                      >
                        {copiedKey ? <Check className="h-3.5 w-3.5 text-[#00e701]" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Active Sessions */}
              <div className="rounded-xl bg-[#14232d] border border-[#213743] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-white">Active Sessions</span>
                  <span className="text-[10px] font-bold text-[#00e701]">1 Current</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#0f212e] text-xs flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white">Chrome on Windows (Current)</p>
                    <p className="text-[10px] text-[#879097]">IP: 103.21.244.12 • Active Now</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------- */}
          {/* 3. PREFERENCES SUB-VIEW */}
          {/* ------------------------------------------------------- */}
          {currentSection === "PREFERENCES" && (
            <div className="space-y-4">
              <div className="rounded-xl bg-[#14232d] border border-[#213743] p-4 space-y-4">
                {/* Sound Effects */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {soundEnabled ? (
                      <Volume2 className="h-4.5 w-4.5 text-[#00e701]" />
                    ) : (
                      <VolumeX className="h-4.5 w-4.5 text-[#879097]" />
                    )}
                    <div>
                      <p className="text-xs font-bold text-white">Game Sound Effects</p>
                      <p className="text-[10px] text-[#879097]">Play audio on bets, wins, and rolls</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      sounds.playClick();
                      setSoundEnabled((s) => !s);
                    }}
                    className={`w-11 h-6 rounded-full transition-colors p-1 cursor-pointer flex items-center ${
                      soundEnabled ? "bg-[#00e701] justify-end" : "bg-[#213743] justify-start"
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-[#0f212e]" />
                  </button>
                </div>

                {/* In-app Notifications */}
                <div className="flex items-center justify-between pt-2 border-t border-[#213743]">
                  <div className="flex items-center gap-2.5">
                    <Bell className="h-4.5 w-4.5 text-cyan-400" />
                    <div>
                      <p className="text-xs font-bold text-white">In-App Notifications</p>
                      <p className="text-[10px] text-[#879097]">Show badges for deposits and promos</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      sounds.playClick();
                      setNotificationsEnabled((n) => !n);
                    }}
                    className={`w-11 h-6 rounded-full transition-colors p-1 cursor-pointer flex items-center ${
                      notificationsEnabled ? "bg-[#00e701] justify-end" : "bg-[#213743] justify-start"
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-[#0f212e]" />
                  </button>
                </div>

                {/* Language */}
                <div className="space-y-1.5 pt-2 border-t border-[#213743]">
                  <label className="text-xs font-bold text-[#879097] uppercase flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5" /> Language
                  </label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => {
                      setSelectedLanguage(e.target.value);
                      sounds.playClick();
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-[#0f212e] border border-[#213743] text-white text-xs outline-none cursor-pointer"
                  >
                    <option>English (US)</option>
                    <option>Hindi (हिन्दी)</option>
                    <option>Spanish (Español)</option>
                    <option>Portuguese (Português)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------- */}
          {/* 4. API SUB-VIEW */}
          {/* ------------------------------------------------------- */}
          {currentSection === "API" && (
            <div className="space-y-4">
              <div className="rounded-xl bg-[#14232d] border border-[#213743] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-cyan-400" />
                    <span className="text-xs font-black uppercase text-white">API Keys</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-400 text-[10px] font-bold">
                    Active
                  </span>
                </div>

                <p className="text-[11px] text-[#879097] leading-relaxed">
                  Generate personal API access tokens to automate betting strategies or read your profile statistics.
                </p>

                <div className="p-3 rounded-lg bg-[#0f212e] border border-[#213743] space-y-1.5">
                  <span className="text-[10px] font-bold text-[#879097] uppercase">Active Key</span>
                  <div className="flex items-center justify-between font-mono text-xs text-white">
                    <span className="truncate max-w-[280px]">{apiKey}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(apiKey);
                        sounds.playClick();
                      }}
                      className="p-1 hover:text-cyan-400 text-[#879097] cursor-pointer"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => {
                    sounds.playClick();
                    setIsGeneratingKey(true);
                    setTimeout(() => {
                      setApiKey(`sk_live_${Math.random().toString(36).slice(2, 18)}`);
                      setIsGeneratingKey(false);
                      sounds.playSuccessChime();
                    }, 800);
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#213743] hover:bg-[#2a4454] text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  {isGeneratingKey ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <span>Regenerate API Key</span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------- */}
          {/* 5. VERIFICATION SUB-VIEW (Level 1) */}
          {/* ------------------------------------------------------- */}
          {currentSection === "VERIFICATION" && (
            <div className="space-y-4">
              <div className="rounded-xl bg-[#14232d] border border-[#213743] p-4 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#00e701]" />
                    <span className="text-xs font-black uppercase text-white">Level 1 Verification</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-[#00e701]/15 border border-[#00e701]/30 text-[#00e701] text-[10px] font-black">
                    Verified
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-[#879097] uppercase">First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-lg bg-[#0f212e] border border-[#213743] text-white outline-none mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#879097] uppercase">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-lg bg-[#0f212e] border border-[#213743] text-white outline-none mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#879097] uppercase">Date of Birth</label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-lg bg-[#0f212e] border border-[#213743] text-white outline-none mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#879097] uppercase">Country</label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-lg bg-[#0f212e] border border-[#213743] text-white outline-none mt-1"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-[#879097] uppercase">Address</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-lg bg-[#0f212e] border border-[#213743] text-white outline-none mt-1"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#00e701]/10 border border-[#00e701]/20 text-[#00e701] text-xs font-bold text-center">
                  ✓ Level 1 basic identity requirements are completely fulfilled.
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------- */}
          {/* 6. ENHANCED VERIFICATION SUB-VIEW (Level 2/3) */}
          {/* ------------------------------------------------------- */}
          {currentSection === "ENHANCED_VERIFICATION" && (
            <div className="space-y-4">
              {/* Level 2: ID Document */}
              <div className="rounded-xl bg-[#14232d] border border-[#213743] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCheck className="h-4 w-4 text-cyan-400" />
                    <span className="text-xs font-black uppercase text-white">
                      Level 2: Proof of Identity
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-black border ${
                      idUploaded
                        ? "bg-[#00e701]/15 text-[#00e701] border-[#00e701]/30"
                        : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                    }`}
                  >
                    {idUploaded ? "Verified / Approved" : "Action Required"}
                  </span>
                </div>

                <p className="text-[11px] text-[#879097] leading-relaxed">
                  Upload an official Aadhaar card, Passport, or Driver&apos;s License.
                </p>

                <label className="flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-[#2f4553] hover:border-cyan-400/50 bg-[#0f212e]/50 cursor-pointer transition-colors text-center">
                  <Upload className="h-6 w-6 text-cyan-400 mb-1" />
                  <span className="text-xs font-bold text-white">
                    {idUploaded ? "Document Uploaded ✓" : "Drop identity document or click to browse"}
                  </span>
                  <span className="text-[10px] text-[#879097] mt-0.5">PNG, JPG, PDF up to 10MB</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={() => {
                      sounds.playSuccessChime();
                      setIdUploaded(true);
                    }}
                  />
                </label>
              </div>

              {/* Level 3: Proof of Address */}
              <div className="rounded-xl bg-[#14232d] border border-[#213743] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCheck className="h-4 w-4 text-purple-400" />
                    <span className="text-xs font-black uppercase text-white">
                      Level 3: Proof of Address
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-black border ${
                      proofAddressUploaded
                        ? "bg-[#00e701]/15 text-[#00e701] border-[#00e701]/30"
                        : "bg-purple-500/15 text-purple-300 border-purple-500/30"
                    }`}
                  >
                    {proofAddressUploaded ? "In Review" : "Optional"}
                  </span>
                </div>

                <p className="text-[11px] text-[#879097] leading-relaxed">
                  Utility bill or bank statement showing your residential address issued in the last 3 months.
                </p>

                <label className="flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-[#2f4553] hover:border-purple-400/50 bg-[#0f212e]/50 cursor-pointer transition-colors text-center">
                  <Upload className="h-6 w-6 text-purple-400 mb-1" />
                  <span className="text-xs font-bold text-white">
                    {proofAddressUploaded ? "Address Proof Attached ✓" : "Upload proof of address document"}
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={() => {
                      sounds.playSuccessChime();
                      setProofAddressUploaded(true);
                    }}
                  />
                </label>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------- */}
          {/* 7. OFFERS SUB-VIEW */}
          {/* ------------------------------------------------------- */}
          {currentSection === "OFFERS" && (
            <div className="space-y-4">
              <div className="rounded-xl bg-[#14232d] border border-[#213743] p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Gift className="h-4.5 w-4.5 text-purple-400" />
                    <div>
                      <p className="text-xs font-bold text-white">Promotional Emails</p>
                      <p className="text-[10px] text-[#879097]">Receive weekly reload bonuses & rakeback alerts</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      sounds.playClick();
                      setEmailPromotions((p) => !p);
                    }}
                    className={`w-11 h-6 rounded-full transition-colors p-1 cursor-pointer flex items-center ${
                      emailPromotions ? "bg-[#00e701] justify-end" : "bg-[#213743] justify-start"
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-[#0f212e]" />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#213743]">
                  <div className="flex items-center gap-2.5">
                    <Smartphone className="h-4.5 w-4.5 text-amber-400" />
                    <div>
                      <p className="text-xs font-bold text-white">SMS Bonus Notifications</p>
                      <p className="text-[10px] text-[#879097]">Get SMS codes for VIP exclusive tournaments</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      sounds.playClick();
                      setSmsPromotions((p) => !p);
                    }}
                    className={`w-11 h-6 rounded-full transition-colors p-1 cursor-pointer flex items-center ${
                      smsPromotions ? "bg-[#00e701] justify-end" : "bg-[#213743] justify-start"
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-[#0f212e]" />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#213743]">
                  <div className="flex items-center gap-2.5">
                    <Mail className="h-4.5 w-4.5 text-cyan-400" />
                    <div>
                      <p className="text-xs font-bold text-white">Marketing Consent</p>
                      <p className="text-[10px] text-[#879097]">Personalized promotions tailored to your games</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      sounds.playClick();
                      setTelegramAlerts((p) => !p);
                    }}
                    className={`w-11 h-6 rounded-full transition-colors p-1 cursor-pointer flex items-center ${
                      telegramAlerts ? "bg-[#00e701] justify-end" : "bg-[#213743] justify-start"
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-[#0f212e]" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

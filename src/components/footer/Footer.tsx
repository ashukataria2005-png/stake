"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ExternalLink,
  ShieldCheck,
  Shield,
  Award,
  HelpCircle,
  FileText,
  Lock,
  MessageSquare,
  Send,
  Sparkles,
  Wallet,
  X,
  Users,
  AlertTriangle,
  Check,
  Globe,
  Radio,
  HeartHandshake,
} from "lucide-react";
import { StakeLogo } from "@/components/common/StakeLogo";
import { useGame } from "@/context/GameContext";
import VIPModal from "@/components/profile/VIPModal";
import AffiliateModal from "@/components/profile/AffiliateModal";

interface FooterLinkItem {
  label: string;
  href?: string;
  isExternal?: boolean;
  action?: () => void;
}

interface FooterColumn {
  id: string;
  title: string;
  links: FooterLinkItem[];
}

export default function Footer() {
  const { openWalletModal, setChatOpen } = useGame();

  // Accordion state for mobile view
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  // Modals state
  const [isVIPOpen, setIsVIPOpen] = useState(false);
  const [isAffiliateOpen, setIsAffiliateOpen] = useState(false);
  const [isFairnessOpen, setIsFairnessOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isResponsibleOpen, setIsResponsibleOpen] = useState(false);
  const [policyModal, setPolicyModal] = useState<{
    isOpen: boolean;
    title: string;
    content: string;
  }>({
    isOpen: false,
    title: "",
    content: "",
  });

  // Client seed simulation for fairness modal
  const [clientSeed, setClientSeed] = useState("stake-client-seed-2026");
  const [serverSeedHash] = useState("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
  const [nonce, setNonce] = useState(42);

  const openPolicy = (title: string, content: string) => {
    setPolicyModal({ isOpen: true, title, content });
  };

  const toggleAccordion = (id: string) => {
    setOpenAccordion((prev) => (prev === id ? null : id));
  };

  // 5 Dedicated Columns strictly matching specification
  const columns: FooterColumn[] = [
    {
      id: "casino",
      title: "Casino",
      links: [
        { label: "Casino Games", href: "/casino/home" },
        { label: "Slots", href: "/casino/group/slots" },
        { label: "Live Casino", href: "/casino/group/live-casino" },
        { label: "Roulette", href: "/games/roulette" },
        { label: "Blackjack", href: "/games/blackjack" },
        { label: "Poker", href: "/games/video-poker" },
        { label: "Publishers/Providers", href: "/casino/collection/providers" },
        { label: "Promos & Competitions", href: "/casino/home#promotions" },
        {
          label: "Stake Engine",
          action: () =>
            openPolicy(
              "Stake Engine Overview",
              "Stake Engine is our proprietary high-throughput gaming infrastructure delivering instant RNG verification, sub-10ms wager resolution, and mathematically audited 99.00% certified RTP."
            ),
        },
        {
          label: "Stake Vendors",
          action: () =>
            openPolicy(
              "Stake Certified Vendors",
              "Stake partners directly with tier-1 certified studios including Evolution Gaming, Pragmatic Play, Hacksaw, InOut, SmartSoft, and Spribe to host authentic licensed titles worldwide."
            ),
        },
      ],
    },
    {
      id: "sports",
      title: "Sports",
      links: [
        { label: "Sportsbook", href: "/sports" },
        { label: "Live Sports", href: "/sports" },
        { label: "Soccer", href: "/sports/soccer" },
        { label: "Basketball", href: "/sports/basketball" },
        { label: "Tennis", href: "/sports/tennis" },
        { label: "Esports", href: "/sports/esports" },
        {
          label: "Bet Bonuses",
          action: () =>
            openPolicy(
              "Sportsbook Bet Bonuses",
              "Enjoy Multi-Sport Acca Boosts, Double Winnings on UFC Main Cards, Everton Clean Sheet Specials, and 100% Cashout availability on all major fixtures."
            ),
        },
        {
          label: "Sports Rules",
          action: () =>
            openPolicy(
              "General Sports Rules",
              "All bets are settled strictly based on the official scoreline provided by the governing federation at regular full-time whistle unless specified otherwise."
            ),
        },
        {
          label: "Racing Rules",
          action: () =>
            openPolicy(
              "Thoroughbred & Greyhound Racing Rules",
              "Wagers settle under official industry starting price (SP) and confirmed steward inquiries. Dead-heat deductions apply proportionally."
            ),
        },
      ],
    },
    {
      id: "support",
      title: "Support",
      links: [
        {
          label: "Help Center",
          action: () => setIsHelpOpen(true),
        },
        {
          label: "Fairness",
          action: () => setIsFairnessOpen(true),
        },
        {
          label: "Responsible Gambling",
          action: () => setIsResponsibleOpen(true),
        },
        {
          label: "Gambling Helpline",
          href: "https://www.gamblingtherapy.org",
          isExternal: true,
        },
        {
          label: "Live Support",
          action: () => setChatOpen(true),
        },
        {
          label: "Self Exclusion",
          action: () => setIsResponsibleOpen(true),
        },
        {
          label: "Law Enforcement Request",
          action: () =>
            openPolicy(
              "Law Enforcement & Compliance Guidelines",
              "Formal inquiries and verified judicial requests should be routed through legal@stake.com. Certified KYC and audit documentation will be processed in accordance with Curaçao eGaming statutory standards."
            ),
        },
      ],
    },
    {
      id: "about-us",
      title: "About Us",
      links: [
        {
          label: "VIP Club",
          action: () => setIsVIPOpen(true),
        },
        {
          label: "Affiliate",
          action: () => setIsAffiliateOpen(true),
        },
        {
          label: "Privacy Policy",
          action: () =>
            openPolicy(
              "Privacy Policy",
              "Stake employs bank-grade SSL encryption and strict data minimization. We never sell, lease, or monetize customer identity information, wagering history, or financial records to third parties."
            ),
        },
        {
          label: "AML Policy",
          action: () =>
            openPolicy(
              "Anti-Money Laundering (AML) Compliance",
              "In strict adherence to international FATF guidelines and Curaçao eGaming directives, Stake conducts automated transaction monitoring, risk scoring, and PEP/sanctions verification."
            ),
        },
        {
          label: "Terms of Service",
          action: () =>
            openPolicy(
              "Terms of Service",
              "By accessing Stake.com, players confirm they are at least 18 years of age (or legal gambling age in their jurisdiction) and agree to operate within our provably fair and fair play standards."
            ),
        },
      ],
    },
    {
      id: "payment-info",
      title: "Payment Info",
      links: [
        {
          label: "Deposit & Withdrawals",
          action: () => openWalletModal("deposit"),
        },
        {
          label: "Currency Guide",
          action: () =>
            openPolicy(
              "Global Currency Guide",
              "Stake natively supports fiat accounts (INR, USD, EUR, BRL, JPY, CAD) alongside major digital assets (USDT, BTC, ETH, LTC, SOL, DOGE, XRP, TRX). Real-time conversions are executed with 0% hidden exchange markups."
            ),
        },
        {
          label: "Crypto Gambling Guide",
          action: () =>
            openPolicy(
              "Crypto Gambling Masterclass",
              "Deposit securely using native on-chain addresses or MoonPay. Transactions credit after minimal network confirmations with zero processing fees deducted on deposits."
            ),
        },
      ],
    },
  ];

  const currentYear = new Date().getFullYear();

  return (
    <>
      <footer className="border-t border-[#213743] bg-[#0f212e] text-[#b1bad3] pt-12 pb-24 md:pb-8 px-4 sm:px-6 lg:px-8 select-none transition-all">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* SECTION A: NAVIGATION COLUMNS (Desktop 5-Column Grid / Mobile Single-Active Accordion) */}
          
          {/* Desktop 5-Column Grid */}
          <div className="hidden md:grid md:grid-cols-5 gap-8 lg:gap-10">
            {columns.map((col) => (
              <div key={col.id} className="space-y-3.5">
                <div className="flex items-center gap-1.5 text-sm font-black text-white tracking-wide uppercase">
                  <span>{col.title}</span>
                  <span className="text-[#00e701] text-xs">▾</span>
                </div>
                <ul className="space-y-2.5 text-xs font-semibold text-[#b1bad3]">
                  {col.links.map((link, idx) => (
                    <li key={idx}>
                      {link.action ? (
                        <button
                          type="button"
                          onClick={link.action}
                          className="hover:text-white transition-colors flex items-center gap-1 text-left cursor-pointer group"
                        >
                          <span className="group-hover:translate-x-0.5 transition-transform">
                            {link.label}
                          </span>
                        </button>
                      ) : (
                        <Link
                          href={link.href || "#"}
                          target={link.isExternal ? "_blank" : undefined}
                          rel={link.isExternal ? "noreferrer noopener" : undefined}
                          className="hover:text-white transition-colors flex items-center gap-1 group"
                        >
                          <span className="group-hover:translate-x-0.5 transition-transform">
                            {link.label}
                          </span>
                          {link.isExternal && (
                            <ExternalLink className="w-3 h-3 text-[#7a889b] group-hover:text-white" />
                          )}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Mobile Accordion */}
          <div className="block md:hidden space-y-2">
            {columns.map((col) => {
              const isOpen = openAccordion === col.id;
              return (
                <div
                  key={col.id}
                  className="bg-[#1a2c38] rounded-xl border border-[#213743] overflow-hidden transition-all shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => toggleAccordion(col.id)}
                    aria-expanded={isOpen}
                    className="w-full text-sm font-bold text-white px-4 py-3.5 flex items-center justify-between cursor-pointer hover:bg-[#213743]/50 transition-colors"
                  >
                    <span className="tracking-wide">{col.title}</span>
                    <ChevronDown
                      className={`h-4 w-4 text-[#b1bad3] transition-transform duration-300 ${
                        isOpen ? "rotate-180 text-[#00e701]" : ""
                      }`}
                    />
                  </button>

                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <ul className="space-y-3 px-4 pt-1 pb-4 text-xs font-medium text-[#b1bad3] border-t border-[#213743]/50">
                        {col.links.map((link, idx) => (
                          <li key={idx}>
                            {link.action ? (
                              <button
                                type="button"
                                onClick={link.action}
                                className="w-full text-left py-0.5 hover:text-white transition-colors cursor-pointer"
                              >
                                {link.label}
                              </button>
                            ) : (
                              <Link
                                href={link.href || "#"}
                                target={link.isExternal ? "_blank" : undefined}
                                rel={link.isExternal ? "noreferrer noopener" : undefined}
                                className="flex items-center justify-between py-0.5 hover:text-white transition-colors"
                              >
                                <span>{link.label}</span>
                                {link.isExternal && (
                                  <ExternalLink className="w-3 h-3 text-[#7a889b]" />
                                )}
                              </Link>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* SECTION B: OFFICIAL STAKE PARTNERSHIPS BAR */}
          <div className="pt-6 border-t border-[#213743]">
            <div className="text-center mb-5">
              <span className="text-[11px] font-black uppercase tracking-widest text-[#7a889b]">
                Official Global Partners & Ambassadors
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-4xl mx-auto">
              {/* Partner 1: Drake */}
              <div className="flex items-center justify-center sm:justify-start gap-3 rounded-xl bg-[#1a2c38]/70 border border-[#213743] p-3 shadow-inner hover:border-[#2f4553] transition-all">
                <div className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center font-black text-sm shrink-0">
                  🦉
                </div>
                <div className="text-left">
                  <div className="text-xs font-black text-white">DRAKE</div>
                  <div className="text-[10px] text-[#00e701] font-bold">Official Global Ambassador</div>
                </div>
              </div>

              {/* Partner 2: Everton F.C. */}
              <div className="flex items-center justify-center sm:justify-start gap-3 rounded-xl bg-[#1a2c38]/70 border border-[#213743] p-3 shadow-inner hover:border-[#2f4553] transition-all">
                <div className="w-9 h-9 rounded-lg bg-blue-600/15 border border-blue-500/30 text-blue-400 flex items-center justify-center font-black text-sm shrink-0">
                  ⚽
                </div>
                <div className="text-left">
                  <div className="text-xs font-black text-white">EVERTON F.C.</div>
                  <div className="text-[10px] text-blue-400 font-bold">Main Club Partner</div>
                </div>
              </div>

              {/* Partner 3: UFC */}
              <div className="flex items-center justify-center sm:justify-start gap-3 rounded-xl bg-[#1a2c38]/70 border border-[#213743] p-3 shadow-inner hover:border-[#2f4553] transition-all">
                <div className="w-9 h-9 rounded-lg bg-red-600/15 border border-red-500/30 text-red-400 flex items-center justify-center font-black text-sm shrink-0">
                  🥊
                </div>
                <div className="text-left">
                  <div className="text-xs font-black text-white">UFC®</div>
                  <div className="text-[10px] text-red-400 font-bold">Official Betting Partner</div>
                </div>
              </div>
            </div>
          </div>

          {/* SOCIAL COMMUNITY LINKS */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {/* Telegram */}
            <a
              href="https://t.me/StakeCasino"
              target="_blank"
              rel="noreferrer"
              title="Stake Telegram Channel"
              className="w-10 h-10 rounded-full bg-[#1a2c38] hover:bg-[#213743] border border-[#213743] text-[#b1bad3] hover:text-[#229ED9] flex items-center justify-center transition-all cursor-pointer shadow-sm hover:scale-105"
            >
              <Send className="w-4 h-4" />
            </a>

            {/* Twitter / X */}
            <a
              href="https://x.com/Stake"
              target="_blank"
              rel="noreferrer"
              title="Stake on X (Twitter)"
              className="w-10 h-10 rounded-full bg-[#1a2c38] hover:bg-[#213743] border border-[#213743] text-[#b1bad3] hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm hover:scale-105"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>

            {/* Instagram */}
            <a
              href="https://instagram.com/stake"
              target="_blank"
              rel="noreferrer"
              title="Stake Instagram"
              className="w-10 h-10 rounded-full bg-[#1a2c38] hover:bg-[#213743] border border-[#213743] text-[#b1bad3] hover:text-[#E4405F] flex items-center justify-center transition-all cursor-pointer shadow-sm hover:scale-105"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>

            {/* Stake Community Forum */}
            <a
              href="https://forum.stake.com"
              target="_blank"
              rel="noreferrer"
              title="Stake Community Forum"
              className="w-10 h-10 rounded-full bg-[#1a2c38] hover:bg-[#213743] border border-[#213743] text-[#b1bad3] hover:text-[#00e701] flex items-center justify-center transition-all cursor-pointer shadow-sm hover:scale-105"
            >
              <MessageSquare className="w-4 h-4" />
            </a>
          </div>

          {/* COMPLIANCE, 18+ RESPONSIBLE GAMING & CURACAO LICENSE VERIFICATION SEAL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto pt-2">
            {/* Responsible Gaming Badge */}
            <div className="flex items-center gap-3.5 rounded-2xl border border-[#213743] bg-[#1a2c38]/60 p-4 shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center font-black text-red-400 text-sm shrink-0">
                18+
              </div>
              <div className="text-left text-xs space-y-0.5">
                <div className="font-black text-white flex items-center gap-1.5">
                  <span>Responsible Gaming Certified</span>
                  <ShieldCheck className="w-4 h-4 text-[#00e701]" />
                </div>
                <p className="text-[11px] text-[#7a889b] leading-tight">
                  Gambling can be addictive. Please play responsibly. Strictly 18+ only.
                </p>
              </div>
            </div>

            {/* Clean Curacao / eGaming verified license verification seal representation */}
            <div className="flex items-center gap-3.5 rounded-2xl border border-[#213743] bg-[#1a2c38]/60 p-4 shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div className="text-left text-xs space-y-0.5">
                <div className="font-black text-white flex items-center gap-1.5">
                  <span>Curaçao eGaming Verified</span>
                  <span className="text-[10px] font-mono text-[#00e701] bg-[#00e701]/10 px-1.5 py-0.5 rounded border border-[#00e701]/20">
                    LICENSED
                  </span>
                </div>
                <p className="text-[11px] text-[#7a889b] leading-tight">
                  Official License No. 145353/JAZ | Medium Rare N.V. Regulated.
                </p>
              </div>
            </div>
          </div>

          {/* LEGAL & STATUTORY DISCLAIMER TEXT */}
          <div className="space-y-2 text-center max-w-3xl mx-auto text-[11px] leading-relaxed text-[#7a889b]">
            <p>
              Stake is owned and operated by Medium Rare N.V., registration number: 145353, registered address: Korporaalweg 10, Willemstad, Curaçao. Contact us at support@stake.com.
            </p>
            <p className="text-slate-400">
              Stake is strictly committed to responsible gambling and player player protection. For confidential support, please visit{" "}
              <a
                href="https://www.gamblingtherapy.org"
                target="_blank"
                rel="noreferrer"
                className="text-[#00e701] hover:underline font-semibold"
              >
                GamblingTherapy.org
              </a>
              .
            </p>
            <p className="pt-2 text-slate-500 text-xs font-bold font-mono">
              © {currentYear} Stake.com | All Rights Reserved.
            </p>
          </div>

          {/* CENTERED BRAND LOGO */}
          <div className="flex justify-center pt-2">
            <Link href="/" className="inline-block group cursor-pointer" aria-label="Stake Home">
              <StakeLogo
                className="h-9 sm:h-11 w-auto text-white/30 group-hover:text-white transition-colors duration-300"
                collapsed={false}
              />
            </Link>
          </div>

        </div>
      </footer>

      {/* MODAL 1: VIP CLUB */}
      <VIPModal isOpen={isVIPOpen} onClose={() => setIsVIPOpen(false)} />

      {/* MODAL 2: AFFILIATE PROGRAM */}
      <AffiliateModal isOpen={isAffiliateOpen} onClose={() => setIsAffiliateOpen(false)} />

      {/* MODAL 3: CERTIFIED PROVABLY FAIR */}
      {isFairnessOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl border border-[#213743] bg-[#1a2c38] p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#213743] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#00e701]/15 text-[#00e701] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Provably Fair Verification</h3>
                  <p className="text-xs text-[#b1bad3]">Cryptographic seed transparency</p>
                </div>
              </div>
              <button
                onClick={() => setIsFairnessOpen(false)}
                className="p-1 rounded-lg text-[#b1bad3] hover:text-white hover:bg-[#213743] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-bold text-[#b1bad3] uppercase">Active Client Seed</label>
                <input
                  type="text"
                  value={clientSeed}
                  onChange={(e) => setClientSeed(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-[#0f212e] border border-[#213743] text-white font-mono text-xs focus:outline-none focus:border-[#00e701]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#b1bad3] uppercase">Hashed Server Seed (SHA-256)</label>
                <div className="w-full mt-1 px-3 py-2 rounded-lg bg-[#0f212e] border border-[#213743] text-[#7a889b] font-mono text-[11px] truncate select-all">
                  {serverSeedHash}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-[11px] font-bold text-[#b1bad3] uppercase">Current Nonce</label>
                  <div className="font-mono text-white text-sm font-bold">{nonce}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setNonce((n) => n + 1)}
                  className="px-3 py-1.5 rounded-lg bg-[#213743] hover:bg-[#2a4555] text-xs font-bold text-white transition-colors cursor-pointer"
                >
                  Increment Nonce
                </button>
              </div>

              <div className="p-3 rounded-xl bg-[#0f212e] border border-[#213743] text-[11px] text-[#b1bad3] leading-relaxed">
                Stake operates with a certified 99% Return-to-Player (RTP) and 1% house edge. Every outcome is predetermined by the combination of your Client Seed, the Server Seed, and Nonce before bets are placed.
              </div>
            </div>

            <button
              onClick={() => setIsFairnessOpen(false)}
              className="w-full py-2.5 rounded-xl bg-[#1475e1] hover:bg-[#1164c2] text-xs font-bold text-white transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* MODAL 4: HELP CENTER */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl border border-[#213743] bg-[#1a2c38] p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#213743] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Stake Help Center</h3>
                  <p className="text-xs text-[#b1bad3]">24/7 dedicated assistance</p>
                </div>
              </div>
              <button
                onClick={() => setIsHelpOpen(false)}
                className="p-1 rounded-lg text-[#b1bad3] hover:text-white hover:bg-[#213743] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-[#0f212e] border border-[#213743] space-y-1">
                <span className="font-bold text-white block">How do deposits and withdrawals work?</span>
                <p className="text-[#b1bad3] text-[11px]">
                  Deposits are credited immediately upon network confirmation. Withdrawals are processed instantly through your authentic wallet drawer.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#0f212e] border border-[#213743] space-y-1">
                <span className="font-bold text-white block">Need Live Help?</span>
                <p className="text-[#b1bad3] text-[11px]">
                  Our live chat support and player community are active 24 hours a day, 7 days a week.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsHelpOpen(false);
                    setChatOpen(true);
                  }}
                  className="mt-2 w-full py-1.5 rounded-lg bg-[#00e701] hover:bg-[#00c801] text-black font-bold text-xs transition-colors cursor-pointer"
                >
                  Launch Live Support
                </button>
              </div>
            </div>

            <button
              onClick={() => setIsHelpOpen(false)}
              className="w-full py-2.5 rounded-xl bg-[#213743] hover:bg-[#2a4555] text-xs font-bold text-white transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* MODAL 5: RESPONSIBLE GAMBLING */}
      {isResponsibleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl border border-[#213743] bg-[#1a2c38] p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#213743] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-500/15 text-red-400 flex items-center justify-center">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Responsible Gaming</h3>
                  <p className="text-xs text-[#b1bad3]">Player safety & self exclusion</p>
                </div>
              </div>
              <button
                onClick={() => setIsResponsibleOpen(false)}
                className="p-1 rounded-lg text-[#b1bad3] hover:text-white hover:bg-[#213743] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#b1bad3] leading-relaxed">
              <p>
                Stake promotes responsible wagering as a recreational pastime. If gaming ceases to be fun, we provide immediate safeguards:
              </p>

              <div className="space-y-2">
                <div className="p-2.5 rounded-lg bg-[#0f212e] border border-[#213743] text-white font-medium flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#00e701] shrink-0" />
                  <span>24-Hour Cooling Off & Deposit Limits</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#0f212e] border border-[#213743] text-white font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Permanent Account Self-Exclusion</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#0f212e] border border-[#213743] text-white font-medium flex items-center gap-2">
                  <Radio className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>24/7 International Help Hotline Access</span>
                </div>
              </div>

              <div className="pt-1">
                <a
                  href="https://www.gamblingtherapy.org"
                  target="_blank"
                  rel="noreferrer"
                  className="block text-center w-full py-2 rounded-xl bg-red-600/20 border border-red-500/30 text-red-300 hover:text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Visit Gambling Therapy Helpline
                </a>
              </div>
            </div>

            <button
              onClick={() => setIsResponsibleOpen(false)}
              className="w-full py-2.5 rounded-xl bg-[#213743] hover:bg-[#2a4555] text-xs font-bold text-white transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* MODAL 6: GENERAL POLICY / INFORMATION MODAL */}
      {policyModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl border border-[#213743] bg-[#1a2c38] p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#213743] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#1475e1]/15 text-[#1475e1] flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">{policyModal.title}</h3>
                  <p className="text-xs text-[#b1bad3]">Stake Official Documentation</p>
                </div>
              </div>
              <button
                onClick={() => setPolicyModal({ isOpen: false, title: "", content: "" })}
                className="p-1 rounded-lg text-[#b1bad3] hover:text-white hover:bg-[#213743] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-[#0f212e] border border-[#213743] text-xs text-[#b1bad3] leading-relaxed">
              {policyModal.content}
            </div>

            <button
              onClick={() => setPolicyModal({ isOpen: false, title: "", content: "" })}
              className="w-full py-2.5 rounded-xl bg-[#1475e1] hover:bg-[#1164c2] text-xs font-bold text-white transition-colors cursor-pointer"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </>
  );
}

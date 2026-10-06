"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ExternalLink,
  Newspaper,
  MessageSquare,
  Send,
  ShoppingBag,
  Globe,
  Check,
  ShieldCheck,
  Award,
} from "lucide-react";

interface FooterLink {
  label: string;
  href: string;
  isExternal?: boolean;
}

interface FooterSection {
  id: string;
  title: string;
  links: FooterLink[];
}

export default function StakeFooter() {
  // Mobile Single-Active Accordion: Only one open section at a time
  const [openSection, setOpenSection] = useState<string | null>(null);

  // Language selector state
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("English");

  const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Español" },
    { code: "pt", name: "Português" },
    { code: "ja", name: "日本語" },
    { code: "de", name: "Deutsch" },
    { code: "fr", name: "Français" },
    { code: "ru", name: "Русский" },
    { code: "hi", name: "हिन्दी" },
  ];

  const sections: FooterSection[] = [
    {
      id: "casino",
      title: "Casino",
      links: [
        { label: "Casino Games", href: "/casino/home" },
        { label: "Slots", href: "/casino/group/slots" },
        { label: "Live Casino", href: "/casino/group/live-casino" },
        { label: "Roulette", href: "/games/roulette" },
        { label: "Blackjack", href: "/games/blackjack" },
        { label: "Poker", href: "#poker" },
        { label: "Publishers", href: "/casino/collection/providers" },
        { label: "Promos & Competitions", href: "#promotions" },
        { label: "Stake Engine", href: "#stake-engine", isExternal: true },
        { label: "Stake Vendors", href: "#stake-vendors", isExternal: true },
      ],
    },
    {
      id: "sports",
      title: "Sports",
      links: [
        { label: "Sportsbook", href: "/#sports" },
        { label: "Live Sports", href: "/#sports" },
        { label: "Soccer", href: "/#sports" },
        { label: "Basketball", href: "/#sports" },
        { label: "Tennis", href: "/#sports" },
        { label: "Esports", href: "/#sports" },
        { label: "Bet Bonuses", href: "#bonuses" },
        { label: "Sports Rules", href: "#sports-rules" },
        { label: "Racing Rules", href: "#racing-rules" },
      ],
    },
    {
      id: "support",
      title: "Support",
      links: [
        { label: "Help Center", href: "#help", isExternal: true },
        { label: "Fairness", href: "#provably-fair" },
        { label: "Responsible Gambling", href: "#responsible-gambling" },
        { label: "Gambling Helpline", href: "https://www.gamblingtherapy.org", isExternal: true },
        { label: "Live Support", href: "#support" },
        { label: "Self Exclusion", href: "#self-exclusion" },
        { label: "Law Enforcement Request", href: "#legal" },
      ],
    },
    {
      id: "about-us",
      title: "About Us",
      links: [
        { label: "VIP Club", href: "#vip" },
        { label: "Affiliate", href: "#affiliate" },
        { label: "Privacy Policy", href: "#privacy" },
        { label: "AML Policy", href: "#aml" },
        { label: "Terms of Service", href: "#terms" },
      ],
    },
    {
      id: "payment-info",
      title: "Payment Info",
      links: [
        { label: "Deposit & Withdrawals", href: "#payments" },
        { label: "Currency Guide", href: "#currency-guide" },
        { label: "Crypto Guide", href: "#crypto-guide" },
        { label: "Supported Crypto", href: "#supported-crypto" },
        { label: "How to Use the Vault", href: "#vault-guide" },
        { label: "How Much to Bet With", href: "#bankroll-guide" },
      ],
    },
    {
      id: "faq",
      title: "FAQ",
      links: [
        { label: "How-to Guides", href: "#guides" },
        { label: "Online Casino Guide", href: "#casino-guide" },
        { label: "Sports Betting Guide", href: "#sports-guide" },
        { label: "How to Live Stream Sports", href: "#stream-guide" },
        { label: "Stake VIP Guide", href: "#vip-guide" },
        { label: "House Edge Guide", href: "#house-edge" },
      ],
    },
  ];

  const handleToggleAccordion = (id: string) => {
    // Mutual exclusivity: only one section can be open at a time
    setOpenSection((prev) => (prev === id ? null : id));
  };

  return (
    <footer className="border-t border-[#213743] bg-[#0f212e] text-[#b1bad3] pt-10 pb-16 px-4 sm:px-6 lg:px-8 select-none">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* 1. DESKTOP VIEW: 6-Column Open Links Layout (hidden on mobile, visible md:grid) */}
        <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-6 gap-8">
          {sections.map((section) => (
            <div key={section.id} className="space-y-3">
              <h3 className="text-sm font-bold text-white tracking-wide">
                {section.title}
              </h3>
              <ul className="space-y-2 text-xs">
                {section.links.map((link, idx) => (
                  <li key={idx}>
                    <Link
                      href={link.href}
                      className="hover:text-white transition-colors flex items-center gap-1 group"
                    >
                      <span className="group-hover:translate-x-0.5 transition-transform">
                        {link.label}
                      </span>
                      {link.isExternal && (
                        <ExternalLink className="w-3 h-3 text-[#7a889b] group-hover:text-white" />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* 2. MOBILE VIEW: Single-Active Accordion System (visible block, hidden md:hidden) */}
        <div className="block md:hidden space-y-2.5">
          {sections.map((section) => {
            const isOpen = openSection === section.id;
            return (
              <div
                key={section.id}
                className="bg-[#1a2c38] rounded-lg border border-[#213743] overflow-hidden transition-colors"
              >
                {/* Accordion Header */}
                <button
                  type="button"
                  onClick={() => handleToggleAccordion(section.id)}
                  aria-expanded={isOpen}
                  className="w-full text-sm font-semibold text-white px-4 py-3.5 flex items-center justify-between cursor-pointer hover:bg-[#213743]/50 transition-colors"
                >
                  <span>{section.title}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-[#b1bad3] transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-white" : ""
                    }`}
                  />
                </button>

                {/* Sub-links with Smooth Height / Transition */}
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <ul className="space-y-2.5 px-4 pt-1 pb-4 text-xs font-medium text-[#b1bad3]">
                      {section.links.map((link, idx) => (
                        <li key={idx}>
                          <Link
                            href={link.href}
                            className="hover:text-white transition-colors flex items-center gap-1.5"
                          >
                            <span>{link.label}</span>
                            {link.isExternal && (
                              <ExternalLink className="w-3 h-3 text-[#7a889b]" />
                            )}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 3. SOCIAL ICONS BAR (9 Circular Buttons) */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-[#213743]/60">
          {/* 1. Newspaper / Blog */}
          <a
            href="#blog"
            title="Blog"
            className="w-9 h-9 rounded-full bg-[#213743] hover:bg-[#2a4555] text-[#b1bad3] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <Newspaper className="w-4 h-4" />
          </a>

          {/* 2. Forum */}
          <a
            href="#forum"
            title="Stake Forum"
            className="w-9 h-9 rounded-full bg-[#213743] hover:bg-[#2a4555] text-[#b1bad3] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
          </a>

          {/* 3. Facebook */}
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noreferrer"
            title="Facebook"
            className="w-9 h-9 rounded-full bg-[#213743] hover:bg-[#2a4555] text-[#b1bad3] hover:text-[#1877F2] flex items-center justify-center transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </a>

          {/* 4. X (Twitter) */}
          <a
            href="https://x.com"
            target="_blank"
            rel="noreferrer"
            title="X (Twitter)"
            className="w-9 h-9 rounded-full bg-[#213743] hover:bg-[#2a4555] text-[#b1bad3] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>

          {/* 5. Instagram */}
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            title="Instagram"
            className="w-9 h-9 rounded-full bg-[#213743] hover:bg-[#2a4555] text-[#b1bad3] hover:text-[#E4405F] flex items-center justify-center transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </a>

          {/* 6. YouTube */}
          <a
            href="https://youtube.com"
            target="_blank"
            rel="noreferrer"
            title="YouTube"
            className="w-9 h-9 rounded-full bg-[#213743] hover:bg-[#2a4555] text-[#b1bad3] hover:text-[#CD201F] flex items-center justify-center transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </a>

          {/* 7. TikTok */}
          <a
            href="https://tiktok.com"
            target="_blank"
            rel="noreferrer"
            title="TikTok"
            className="w-9 h-9 rounded-full bg-[#213743] hover:bg-[#2a4555] text-[#b1bad3] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
            </svg>
          </a>

          {/* 8. Telegram */}
          <a
            href="https://telegram.org"
            target="_blank"
            rel="noreferrer"
            title="Telegram"
            className="w-9 h-9 rounded-full bg-[#213743] hover:bg-[#2a4555] text-[#b1bad3] hover:text-[#229ED9] flex items-center justify-center transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </a>

          {/* 9. Shop */}
          <a
            href="#shop"
            title="Stake Merch Shop"
            className="w-9 h-9 rounded-full bg-[#213743] hover:bg-[#2a4555] text-[#b1bad3] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
          </a>
        </div>

        {/* 4. LANGUAGE SELECTOR PILL DROPDOWN */}
        <div className="flex justify-center relative">
          <button
            onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
            className="flex items-center gap-2 rounded-full border border-[#213743] bg-[#1a2c38] px-4 py-2 text-xs font-semibold text-white hover:border-[#2f4553] hover:bg-[#213743] transition-colors cursor-pointer shadow-sm"
          >
            <Globe className="w-3.5 h-3.5 text-[#00e701]" />
            <span>{selectedLanguage}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-[#b1bad3] transition-transform ${isLangMenuOpen ? "rotate-180" : ""}`} />
          </button>

          {isLangMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setIsLangMenuOpen(false)}
              />
              <div className="absolute bottom-full mb-2 z-40 w-44 rounded-xl border border-[#213743] bg-[#1a2c38] p-1.5 shadow-2xl space-y-0.5">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setSelectedLanguage(lang.name);
                      setIsLangMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium text-white hover:bg-[#213743] transition-colors cursor-pointer"
                  >
                    <span>{lang.name}</span>
                    {selectedLanguage === lang.name && (
                      <Check className="w-3.5 h-3.5 text-[#00e701]" />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* 5. CERTIFICATION & REGULATORY BADGES */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-2">
          {/* Badge 1: GAMECHECK Badge */}
          <div className="flex items-center gap-2 rounded-xl border border-[#213743] bg-[#1a2c38] px-3.5 py-2 shadow-sm">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-[#00e701] flex items-center justify-center font-black text-xs border border-[#00e701]/30">
              ✓
            </div>
            <div className="text-left">
              <div className="text-[10px] font-black text-white tracking-wider">GAMECHECK</div>
              <div className="text-[9px] text-[#00e701] font-semibold">VERIFIED FAIR</div>
            </div>
          </div>

          {/* Badge 2: GCB Curaçao Badge */}
          <div className="flex items-center gap-2 rounded-xl border border-[#213743] bg-[#1a2c38] px-3.5 py-2 shadow-sm">
            <div className="w-6 h-6 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center font-black text-xs border border-blue-400/30">
              🛡️
            </div>
            <div className="text-left">
              <div className="text-[10px] font-black text-white tracking-wider">GCB CERTIFIED</div>
              <div className="text-[9px] text-blue-400 font-semibold">cert.gcb.cw</div>
            </div>
          </div>

          {/* Badge 3: TANZANITE CERTIFIED Badge */}
          <div className="flex items-center gap-2 rounded-xl border border-[#213743] bg-[#1a2c38] px-3.5 py-2 shadow-sm">
            <div className="w-6 h-6 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center font-black text-xs border border-purple-400/30">
              💎
            </div>
            <div className="text-left">
              <div className="text-[10px] font-black text-white tracking-wider">TANZANITE</div>
              <div className="text-[9px] text-purple-400 font-semibold">SECURITY AUDIT</div>
            </div>
          </div>
        </div>

        {/* 6. CURRENCY EXCHANGE PEG */}
        <div className="text-xs text-[#b1bad3] text-center font-mono my-3">
          1 USDT = $1.00
        </div>

        {/* 7. LEGAL & COMPLIANCE TEXT */}
        <div className="space-y-2 text-center max-w-3xl mx-auto text-[11px] leading-relaxed text-[#7a889b]">
          <p>
            Stake is owned and operated by Medium Rare N.V., registration number: 145353, registered address: Seru Loraweg 17 B, Curaçao. Payment agent companies are Medium Rare Limited and MRS Tech Limited. Contact us at support@stake.com.support@stake.com.
          </p>
          <p className="text-slate-400">
            Stake is committed to responsible gambling, for more information visit{" "}
            <a
              href="https://www.gamblingtherapy.org"
              target="_blank"
              rel="noreferrer"
              className="text-[#00e701] hover:underline"
            >
              Gamblingtherapy.org
            </a>
          </p>
          <p className="pt-2 text-slate-500 text-[10px]">
            © 2026 Stake.com | All Rights Reserved.
          </p>
        </div>

        {/* 8. STAKE CENTERED LARGE BRAND WORDMARK */}
        <div className="flex justify-center pt-4 pb-2">
          <Link href="/" className="inline-block group cursor-pointer" aria-label="Stake Home">
            <svg
              viewBox="0 0 114 43"
              className="h-10 sm:h-12 w-auto text-white/30 group-hover:text-white fill-current transition-colors duration-300"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M19.387 18.067c-1.89-.472-3.64-.756-5.253-.85.663-1.23 1.516-2.036 2.559-2.415 1.042-.379 2.226-.379 3.55 0l1.09-3.884c-1.893-.568-3.884-.71-5.576-.202-1.692.508-3.138 1.587-4.337 3.237-.616-.853-1.421-1.564-2.415-2.132-.995-.569-2.18-.948-3.554-1.137-1.374-.19-2.892-.19-4.551 0L0 14.123c1.42-.19 2.557-.237 3.41-.142.853.095 1.516.355 1.99.853.474.497.71 1.184.71 2.06 0 .664-.19 1.564-.568 2.702-.853 2.463-1.682 4.263-2.487 5.399-.806 1.137-1.8 1.99-2.843 2.416l1.8 3.884c1.8-.758 3.27-1.942 4.406-3.553 1.137-1.611 2.108-3.673 2.913-6.183 1.327.094 2.701.284 4.122.568 1.42.284 2.653.616 3.695.995-.284.948-.663 1.942-1.137 2.984-.474 1.043-1.09 2.18-1.848 3.411-.758 1.232-1.705 2.416-2.842 3.553l3.032 2.842c1.516-1.516 2.795-3.126 3.837-4.832 1.042-1.705 1.848-3.41 2.416-5.116.568-1.705.852-3.316.852-4.831-.047-.616-.142-1.09-.284-1.422zm15.922 2.37l-1.09 3.884c.71.19 1.374.426 1.99.71.616.284 1.137.64 1.563 1.066.427.427.735.948.924 1.564.19.615.19 1.326 0 2.131-.426 1.516-1.137 2.7-2.132 3.553-.995.853-2.226 1.326-3.695 1.42-1.468.095-3.079-.142-4.831-.71l-1.09 3.885c2.132.663 4.193.971 6.183.923 1.99-.047 3.742-.616 5.258-1.705 1.516-1.089 2.676-2.629 3.482-4.619.568-1.421.758-2.89.568-4.405-.189-1.516-.805-2.818-1.848-3.908-1.042-1.09-2.77-1.942-5.282-2.984zm14.593-.853c-1.516 0-2.913.332-4.192.995-1.28.663-2.345 1.611-3.198 2.842-.616-1.231-1.469-2.179-2.558-2.842-1.09-.663-2.345-.995-3.766-.995-1.658 0-3.22.474-4.689 1.421l1.61 3.411c.995-.616 1.99-.924 2.985-.924.947 0 1.681.308 2.203.924.52.616.781 1.492.781 2.629v8.81h4.264v-8.526c0-1.042.284-1.824.853-2.345.568-.521 1.326-.782 2.274-.782.947 0 1.752.284 2.415.853.664.568 1.09 1.374 1.28 2.416.19 1.042.19 2.226 0 3.552l-1.137 4.832h4.264l1.137-4.832c.284-1.61.355-3.078.213-4.405-.142-1.326-.64-2.463-1.492-3.41-.853-.948-1.966-1.516-3.34-1.705-1.374-.19-2.913-.19-4.619 0zm19.8 0c-1.516 0-2.913.332-4.192.995-1.28.663-2.345 1.611-3.198 2.842-.616-1.231-1.469-2.179-2.558-2.842-1.09-.663-2.345-.995-3.766-.995-1.658 0-3.22.474-4.689 1.421l1.61 3.411c.995-.616 1.99-.924 2.985-.924.947 0 1.681.308 2.203.924.52.616.781 1.492.781 2.629v8.81h4.264v-8.526c0-1.042.284-1.824.853-2.345.568-.521 1.326-.782 2.274-.782.947 0 1.752.284 2.415.853.664.568 1.09 1.374 1.28 2.416.19 1.042.19 2.226 0 3.552l-1.137 4.832h4.264l1.137-4.832c.284-1.61.355-3.078.213-4.405-.142-1.326-.64-2.463-1.492-3.41-.853-.948-1.966-1.516-3.34-1.705-1.374-.19-2.913-.19-4.619 0z" />
            </svg>
          </Link>
        </div>

      </div>
    </footer>
  );
}

"use client";

import React, { useState } from "react";
import { X, Check, EyeOff, DollarSign, Wallet, Search } from "lucide-react";
import { useGame } from "@/context/GameContext";
import {
  PRIMARY_FIAT_CURRENCIES,
  EXTENDED_FIAT_CURRENCIES,
  ALL_FIAT_CURRENCIES,
  CRYPTO_CURRENCIES,
  FiatCurrency,
} from "@/data/currencies";
import CryptoIcon from "@/components/CryptoIcon";
import FiatCoinIcon from "@/components/FiatCoinIcon";

interface WalletSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WalletSettingsModal({ isOpen, onClose }: WalletSettingsModalProps) {
  const {
    hideZeroBalances,
    setHideZeroBalances,
    displayCryptoInFiat,
    setDisplayCryptoInFiat,
    selectedFiat,
    setSelectedFiat,
    cryptoBalances,
    balance,
  } = useGame();

  const [activeTab, setActiveTab] = useState<"overview" | "settings">("settings");
  const [fiatSearch, setFiatSearch] = useState("");
  const [showExtended, setShowExtended] = useState(false);

  if (!isOpen) return null;

  // Filter fiat list if search is typed
  const filteredPrimary = PRIMARY_FIAT_CURRENCIES.filter(
    (f) =>
      f.code.toLowerCase().includes(fiatSearch.toLowerCase().trim()) ||
      f.name.toLowerCase().includes(fiatSearch.toLowerCase().trim())
  );

  const filteredExtended = EXTENDED_FIAT_CURRENCIES.filter(
    (f) =>
      f.code.toLowerCase().includes(fiatSearch.toLowerCase().trim()) ||
      f.name.toLowerCase().includes(fiatSearch.toLowerCase().trim())
  );

  const currentFiatObj = ALL_FIAT_CURRENCIES.find((f) => f.code === selectedFiat);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Modal Card */}
      <div className="relative w-full max-w-lg rounded-2xl border border-[#213743] bg-[#1a2c38] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden select-none">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#213743] px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#213743] text-white">
              <Wallet className="h-4 w-4 text-[#00e701]" />
            </div>
            <h2 className="text-base font-bold text-white tracking-wide">
              Wallet Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#b1bad3] hover:bg-[#213743] hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Navigation: Overview & Settings (default active) */}
        <div className="flex border-b border-[#213743] px-5 bg-[#0f212e]/50">
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === "settings"
                ? "border-[#00e701] text-white"
                : "border-transparent text-[#b1bad3] hover:text-white"
            }`}
          >
            Settings
          </button>
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === "overview"
                ? "border-[#00e701] text-white"
                : "border-transparent text-[#b1bad3] hover:text-white"
            }`}
          >
            Overview
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin scrollbar-thumb-[#213743]">
          {activeTab === "settings" ? (
            <>
              {/* Toggle 1: Hide Zero Balances */}
              <div className="flex items-center justify-between rounded-xl border border-[#213743] bg-[#0f212e]/70 p-4">
                <div className="space-y-0.5 pr-4">
                  <div className="flex items-center gap-2">
                    <EyeOff className="w-4 h-4 text-[#b1bad3]" />
                    <h3 className="text-xs sm:text-sm font-bold text-white">
                      Hide Zero Balances
                    </h3>
                  </div>
                  <p className="text-[11px] text-[#b1bad3] leading-relaxed">
                    Your zero balances won&apos;t appear in your wallet
                  </p>
                </div>
                {/* Toggle Switch */}
                <button
                  type="button"
                  onClick={() => setHideZeroBalances(!hideZeroBalances)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    hideZeroBalances ? "bg-[#00e701]" : "bg-[#213743]"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      hideZeroBalances ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Toggle 2: Display Crypto in Fiat */}
              <div className="flex items-center justify-between rounded-xl border border-[#213743] bg-[#0f212e]/70 p-4">
                <div className="space-y-0.5 pr-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-[#00e701]" />
                    <h3 className="text-xs sm:text-sm font-bold text-white">
                      Display Crypto in Fiat
                    </h3>
                  </div>
                  <p className="text-[11px] text-[#b1bad3] leading-relaxed">
                    All bets & transactions will be settled in the crypto equivalent
                  </p>
                </div>
                {/* Toggle Switch */}
                <button
                  type="button"
                  onClick={() => setDisplayCryptoInFiat(!displayCryptoInFiat)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    displayCryptoInFiat ? "bg-[#00e701]" : "bg-[#213743]"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      displayCryptoInFiat ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Fiat Currency Selector (3-Column Radio Grid) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Fiat Display Currency
                  </h4>
                  <span className="text-[11px] text-[#00e701] font-semibold">
                    Current: {currentFiatObj?.flag} {selectedFiat}
                  </span>
                </div>

                {/* Filter Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#7a889b]" />
                  <input
                    type="text"
                    value={fiatSearch}
                    onChange={(e) => setFiatSearch(e.target.value)}
                    placeholder="Search fiat currency..."
                    className="w-full bg-[#0f212e] border border-[#213743] hover:border-[#2f4553] focus:border-[#1475e1] text-white text-xs rounded-lg pl-8.5 pr-3 py-2 outline-none transition-colors placeholder-[#7a889b]"
                  />
                </div>

                {/* Primary Tier (3-Column Radio Grid) */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-[#7a889b] uppercase tracking-wider">
                    Popular Currencies
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {filteredPrimary.map((fiat) => {
                      const isSelected = selectedFiat === fiat.code;
                      return (
                        <button
                          key={fiat.code}
                          onClick={() => {
                            setSelectedFiat(fiat.code);
                            setDisplayCryptoInFiat(true);
                          }}
                          className={`flex items-center justify-between p-2.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                            isSelected
                              ? "bg-[#00e701]/10 border-[#00e701] text-white shadow-sm"
                              : "bg-[#0f212e] border-[#213743] text-[#b1bad3] hover:bg-[#213743] hover:text-white"
                          }`}
                        >
                          <span className="flex items-center gap-2 truncate">
                            <FiatCoinIcon currency={fiat.code} size={18} className="w-4.5 h-4.5 shrink-0" />
                            <span className="font-bold">{fiat.code}</span>
                          </span>
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-[#00e701] shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Extended Tier Accordion */}
                <div className="pt-2">
                  <button
                    onClick={() => setShowExtended(!showExtended)}
                    className="w-full py-2 text-xs font-bold text-[#1475e1] hover:text-[#38bdf8] transition-colors flex items-center justify-center gap-1 border border-[#213743] rounded-lg bg-[#0f212e]"
                  >
                    <span>{showExtended ? "Hide More Currencies" : `View 43 More Currencies (+)`}</span>
                  </button>

                  {showExtended && (
                    <div className="mt-2 space-y-1.5">
                      <span className="text-[10px] font-bold text-[#7a889b] uppercase tracking-wider">
                        All Global Currencies
                      </span>
                      <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-[#213743]">
                        {filteredExtended.map((fiat) => {
                          const isSelected = selectedFiat === fiat.code;
                          return (
                            <button
                              key={fiat.code}
                              onClick={() => {
                                setSelectedFiat(fiat.code);
                                setDisplayCryptoInFiat(true);
                              }}
                              className={`flex items-center justify-between p-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                                isSelected
                                  ? "bg-[#00e701]/10 border-[#00e701] text-white"
                                  : "bg-[#0f212e] border-[#213743] text-[#b1bad3] hover:bg-[#213743] hover:text-white"
                              }`}
                            >
                              <span className="flex items-center gap-2 truncate">
                                <FiatCoinIcon currency={fiat.code} size={18} className="w-4.5 h-4.5 shrink-0" />
                                <span className="font-bold">{fiat.code}</span>
                              </span>
                              {isSelected && (
                                <Check className="w-3.5 h-3.5 text-[#00e701] shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* Overview Tab: Total Balance Breakdown across Cryptos */
            <div className="space-y-4">
              <div className="rounded-xl border border-[#213743] bg-[#0f212e] p-4 text-center space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#7a889b]">
                  Estimated Total Balance
                </span>
                <div className="text-2xl font-black text-white font-mono">
                  {currentFiatObj?.symbol || "$"}
                  {(balance * (currentFiatObj?.ratePerUsd || 1.0)).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  <span className="text-xs text-[#00e701]">{selectedFiat}</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-bold text-[#7a889b] uppercase tracking-wider">
                  Assets Breakdown
                </span>
                <div className="space-y-1.5">
                  {CRYPTO_CURRENCIES.map((c) => {
                    const cryptoBal = cryptoBalances[c.id] || 0;
                    const fiatVal = cryptoBal * c.rateUsd * (currentFiatObj?.ratePerUsd || 1.0);

                    return (
                      <div
                        key={c.id}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-[#0f212e] border border-[#213743]"
                      >
                        <div className="flex items-center gap-2.5">
                          <CryptoIcon symbol={c.id} size={22} className="w-5.5 h-5.5" />
                          <div>
                            <div className="text-xs font-bold text-white">{c.name}</div>
                            <div className="text-[10px] text-[#7a889b] font-mono">
                              {cryptoBal.toFixed(4)} {c.id}
                            </div>
                          </div>
                        </div>
                        <div className="text-right font-mono text-xs font-bold text-white">
                          {currentFiatObj?.symbol || "$"}
                          {fiatVal.toFixed(2)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-[#213743] p-4 bg-[#0f212e]/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-[#00e701] hover:bg-[#00c901] text-[#0f212e] font-black text-xs transition-all cursor-pointer shadow-md"
          >
            Save &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { Search, X, SlidersHorizontal, Check } from "lucide-react";
import { useGame } from "@/context/GameContext";
import { CRYPTO_CURRENCIES, PRIMARY_FIAT_CURRENCIES } from "@/data/currencies";
import CryptoIcon from "@/components/CryptoIcon";
import FiatCoinIcon from "@/components/FiatCoinIcon";

interface CurrencyDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CurrencyDropdown({ isOpen, onClose }: CurrencyDropdownProps) {
  const {
    currency,
    setCurrency,
    cryptoBalances,
    hideZeroBalances,
    openWalletSettings,
    displayCryptoInFiat,
    setDisplayCryptoInFiat,
    selectedFiat,
    setSelectedFiat,
    realBalance,
  } = useGame();

  const [activeTab, setActiveTab] = useState<"crypto" | "fiat">(
    displayCryptoInFiat ? "fiat" : "crypto"
  );
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  const filteredCryptos = CRYPTO_CURRENCIES.filter((c) => {
    const matchesSearch =
      c.id.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase().trim());

    if (!matchesSearch) return false;

    if (hideZeroBalances) {
      const bal = cryptoBalances[c.id] || 0;
      return bal > 0;
    }

    return true;
  });

  const filteredFiats = PRIMARY_FIAT_CURRENCIES.filter((f) => {
    return (
      f.code.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      f.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );
  });

  return (
    <>
      {/* Backdrop overlay to dismiss when clicking outside */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Centered Modal anchored dead-center on the screen matching Screenshot 3 */}
      <div className="fixed top-[62px] left-1/2 -translate-x-1/2 w-[92vw] max-w-[340px] z-50 bg-[#1a2c38] border border-[#2f4553] rounded-xl shadow-2xl overflow-hidden p-3 space-y-3 animate-in fade-in zoom-in-95 duration-150 select-none">
        {/* Segmented Tab Switcher: [ Crypto | Fiat ] */}
        <div className="flex rounded-lg bg-[#0f212e] p-1 border border-[#213743]">
          <button
            type="button"
            onClick={() => {
              setActiveTab("crypto");
              setSearchQuery("");
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
              activeTab === "crypto"
                ? "bg-[#213743] text-white shadow-sm"
                : "text-[#b1bad3] hover:text-white"
            }`}
          >
            Crypto
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("fiat");
              setSearchQuery("");
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
              activeTab === "fiat"
                ? "bg-[#213743] text-[#00e701] shadow-sm"
                : "text-[#b1bad3] hover:text-white"
            }`}
          >
            Fiat Currency
          </button>
        </div>

        {/* Search input: "Search Currencies" with magnifying glass */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a889b]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeTab === "crypto" ? "Search Crypto" : "Search Fiat (INR, USD...)"}
            className="w-full bg-[#0f212e] border border-[#213743] hover:border-[#2f4553] focus:border-[#1475e1] text-white text-xs rounded-lg pl-9 pr-7 py-2.5 outline-none transition-colors placeholder-[#7a889b]"
            autoFocus
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#7a889b] hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* List layout */}
        <div className="max-h-64 overflow-y-auto space-y-1 pr-1 scrollbar-thin scrollbar-thumb-[#213743]">
          {activeTab === "crypto" ? (
            filteredCryptos.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#7a889b]">
                No crypto currencies found
              </div>
            ) : (
              filteredCryptos.map((crypto) => {
                const isSelected = !displayCryptoInFiat && currency === crypto.id;
                const rawBalance = cryptoBalances[crypto.id] || 0;
                const formattedBal = rawBalance.toLocaleString("en-US", {
                  minimumFractionDigits: crypto.decimals > 2 ? 8 : 2,
                  maximumFractionDigits: crypto.decimals,
                });

                return (
                  <button
                    key={crypto.id}
                    onClick={() => {
                      setCurrency(crypto.id);
                      setDisplayCryptoInFiat(false);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#213743] text-white border border-[#2f4553]"
                        : "text-[#b1bad3] hover:bg-[#213743]/60 hover:text-white border border-transparent"
                    }`}
                  >
                    {/* Left: Crypto Amount */}
                    <span className="font-mono text-xs font-bold text-white tabular-nums">
                      {formattedBal}
                    </span>

                    {/* Right: Currency Code + Icon */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        {crypto.id}
                      </span>
                      <CryptoIcon symbol={crypto.id} size={22} className="w-5.5 h-5.5 shrink-0" />
                    </div>
                  </button>
                );
              })
            )
          ) : (
            filteredFiats.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#7a889b]">
                No fiat currencies found
              </div>
            ) : (
              filteredFiats.map((fiat) => {
                const isSelected = displayCryptoInFiat && selectedFiat === fiat.code;
                const fiatBalance = (realBalance * fiat.ratePerUsd).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                });

                return (
                  <button
                    key={fiat.code}
                    onClick={() => {
                      setSelectedFiat(fiat.code);
                      setDisplayCryptoInFiat(true);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#00e701]/10 text-white border border-[#00e701]/50 shadow-sm"
                        : "text-[#b1bad3] hover:bg-[#213743]/60 hover:text-white border border-transparent"
                    }`}
                  >
                    {/* Left: Fiat Amount */}
                    <span className="font-mono text-xs font-bold text-white tabular-nums flex items-center gap-1">
                      <span>{fiat.symbol}</span>
                      <span>{fiatBalance}</span>
                    </span>

                    {/* Right: Currency Code + Flag/Coin */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        {fiat.code}
                      </span>
                      <FiatCoinIcon currency={fiat.code} size={20} className="w-5 h-5 shrink-0" />
                    </div>
                  </button>
                );
              })
            )
          )}
        </div>

        {/* Bottom bar: "Wallet Settings" button with gear/sliders icon pinned at the base */}
        <div className="pt-2 border-t border-[#213743]">
          <button
            onClick={() => {
              onClose();
              openWalletSettings();
            }}
            className="w-full flex items-center justify-center gap-2 bg-[#213743] hover:bg-[#2a4555] text-white font-bold text-xs py-2.5 rounded-lg border border-[#2f4553] transition-all cursor-pointer shadow-sm active:scale-98"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#b1bad3]" />
            <span>Wallet Settings</span>
          </button>
        </div>
      </div>
    </>
  );
}

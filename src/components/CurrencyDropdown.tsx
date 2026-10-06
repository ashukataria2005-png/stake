"use client";

import React, { useState } from "react";
import { Search, Check, Settings, X } from "lucide-react";
import { useGame } from "@/context/GameContext";
import { CRYPTO_CURRENCIES } from "@/data/currencies";
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
    selectedFiat,
  } = useGame();

  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  const filteredCryptos = CRYPTO_CURRENCIES.filter((c) => {
    // Search match
    const matchesSearch =
      c.id.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase().trim());

    if (!matchesSearch) return false;

    // Zero balance filter
    if (hideZeroBalances) {
      const bal = cryptoBalances[c.id] || 0;
      return bal > 0;
    }

    return true;
  });

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] transition-opacity"
        onClick={onClose}
      />

      {/* Floating Dropdown Card - Centered on mobile viewports */}
      <div className="absolute left-1/2 -translate-x-1/2 sm:left-auto sm:right-0 sm:translate-x-0 top-full mt-2.5 z-50 w-[340px] max-w-[92vw] sm:w-80 rounded-xl border border-[#213743] bg-[#1a2c38] p-3 shadow-2xl animate-in fade-in zoom-in-95 duration-150 select-none space-y-3">
        {/* Search Input Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a889b]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Currencies"
            className="w-full bg-[#0f212e] border border-[#213743] hover:border-[#2f4553] focus:border-[#1475e1] text-white text-xs rounded-lg pl-9 pr-7 py-2 outline-none transition-colors placeholder-[#7a889b]"
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

        {/* Currency List */}
        <div className="max-h-64 overflow-y-auto space-y-1 pr-1 scrollbar-thin scrollbar-thumb-[#213743]">
          {filteredCryptos.length === 0 ? (
            <div className="py-6 text-center text-xs text-[#7a889b]">
              No currencies found
            </div>
          ) : (
            filteredCryptos.map((crypto) => {
              const isSelected = currency === crypto.id;
              const rawBalance = cryptoBalances[crypto.id] || 0;
              const formattedBal = rawBalance.toLocaleString("en-US", {
                minimumFractionDigits: crypto.decimals > 2 ? 6 : 2,
                maximumFractionDigits: crypto.decimals,
              });

              return (
                <button
                  key={crypto.id}
                  onClick={() => {
                    setCurrency(crypto.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#213743] text-white border border-[#2f4553]"
                      : "text-[#b1bad3] hover:bg-[#213743]/60 hover:text-white border border-transparent"
                  }`}
                >
                  {/* Left: Icon & Symbol / Name */}
                  <div className="flex items-center gap-2.5">
                    <CryptoIcon symbol={crypto.id} size={22} className="w-5.5 h-5.5" />
                    <div className="flex flex-col text-left">
                      <span className="text-white font-bold tracking-wide">
                        {crypto.id}
                      </span>
                      <span className="text-[10px] text-[#7a889b] font-medium leading-none">
                        {crypto.name}
                      </span>
                    </div>
                  </div>

                  {/* Right: Balance & Active Checkmark */}
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col text-right font-mono">
                      <span className="text-white font-bold text-[11px] tabular-nums">
                        {formattedBal}
                      </span>
                      {displayCryptoInFiat && (
                        <span className="text-[9px] text-[#00e701] flex items-center justify-end gap-1">
                          <FiatCoinIcon currency={selectedFiat} size={11} className="w-2.5 h-2.5 inline" />
                          <span>≈ {selectedFiat}</span>
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-[#00e701] shrink-0" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Bottom Action: Wallet Settings Button */}
        <div className="pt-2 border-t border-[#213743]">
          <button
            onClick={() => {
              onClose();
              openWalletSettings();
            }}
            className="w-full flex items-center justify-center gap-2 bg-[#213743] hover:bg-[#2a4555] text-white font-bold text-xs py-2.5 rounded-lg border border-[#2f4553] transition-all cursor-pointer shadow-sm active:scale-98"
          >
            <Settings className="w-3.5 h-3.5 text-[#b1bad3]" />
            <span>Wallet Settings</span>
          </button>
        </div>
      </div>
    </>
  );
}

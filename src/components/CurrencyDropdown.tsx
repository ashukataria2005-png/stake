"use client";

import React, { useState } from "react";
import { Search, Settings, X, SlidersHorizontal } from "lucide-react";
import { useGame } from "@/context/GameContext";
import { CRYPTO_CURRENCIES } from "@/data/currencies";
import CryptoIcon from "@/components/CryptoIcon";

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
  } = useGame();

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

  return (
    <>
      {/* Backdrop overlay to dismiss when clicking outside */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Centered Modal anchored dead-center on the screen matching Screenshot 3 */}
      <div className="fixed top-[62px] left-1/2 -translate-x-1/2 w-[92vw] max-w-[340px] z-50 bg-[#1a2c38] border border-[#2f4553] rounded-xl shadow-2xl overflow-hidden p-3 space-y-3 animate-in fade-in zoom-in-95 duration-150 select-none">
        {/* Search input: "Search Currencies" with magnifying glass */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a889b]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Currencies"
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

        {/* List layout: Crypto amount on left, Icon + Currency code on right */}
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
                minimumFractionDigits: crypto.decimals > 2 ? 8 : 2,
                maximumFractionDigits: crypto.decimals,
              });

              return (
                <button
                  key={crypto.id}
                  onClick={() => {
                    setCurrency(crypto.id);
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

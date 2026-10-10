"use client";

import React, { useState } from "react";
import {
  Volume2,
  VolumeX,
  Zap,
  Sparkles,
  MousePointer,
  Flame,
  Info,
  Keyboard,
  X,
  Check,
} from "lucide-react";
import { sounds } from "@/utils/audio";

interface MinesSettingsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  volume: number;
  setVolume: (val: number) => void;
  instantBet: boolean;
  setInstantBet: (val: boolean) => void;
  animations: boolean;
  setAnimations: (val: boolean) => void;
  quickSelection: boolean;
  setQuickSelection: (val: boolean) => void;
  onMaxBet: () => void;
}

export default function MinesSettingsPopover({
  isOpen,
  onClose,
  volume,
  setVolume,
  instantBet,
  setInstantBet,
  animations,
  setAnimations,
  quickSelection,
  setQuickSelection,
  onMaxBet,
}: MinesSettingsPopoverProps) {
  const [showGameInfo, setShowGameInfo] = useState(false);
  const [showHotkeys, setShowHotkeys] = useState(false);

  if (!isOpen) return null;

  return (
    <>
      {/* Floating Popover Container Matching Stake Screenshot 29 */}
      <div className="absolute bottom-12 left-0 z-40 w-72 sm:w-80 rounded-2xl border border-[#2f4553] bg-[#1a2c38] shadow-2xl p-4 text-white space-y-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-[#213743] pb-2.5">
          <span className="text-xs font-black uppercase tracking-wider text-[#b1bad3] flex items-center gap-1.5">
            <span>⚙️</span> Game Settings
          </span>
          <button
            onClick={onClose}
            className="text-[#b1bad3] hover:text-white p-1 rounded-lg hover:bg-[#213743] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. Volume Slider */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-[#b1bad3]">
            <span className="flex items-center gap-1.5">
              {volume === 0 ? (
                <VolumeX className="w-3.5 h-3.5 text-red-400" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-[#00e701]" />
              )}
              Volume
            </span>
            <span className="font-mono text-[11px] text-white">{volume}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => {
              const val = Number(e.target.value);
              setVolume(val);
              sounds.enabled = val > 0;
            }}
            className="w-full accent-[#00e701] h-1.5 bg-[#0f212e] rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* 2. Toggles Group */}
        <div className="space-y-2 border-t border-[#213743] pt-3 text-xs">
          {/* Instant Bet */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-white font-semibold">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Instant Bet
            </span>
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setInstantBet(!instantBet);
              }}
              className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                instantBet ? "bg-[#00e701]" : "bg-[#213743]"
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                  instantBet ? "left-5.5" : "left-0.5"
                }`}
              />
            </button>
          </div>

          {/* Animations */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-white font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Animations
            </span>
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setAnimations(!animations);
              }}
              className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                animations ? "bg-[#00e701]" : "bg-[#213743]"
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                  animations ? "left-5.5" : "left-0.5"
                }`}
              />
            </button>
          </div>

          {/* Quick Selection */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-white font-semibold">
              <MousePointer className="w-3.5 h-3.5 text-emerald-400" />
              Quick Selection
            </span>
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setQuickSelection(!quickSelection);
              }}
              className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                quickSelection ? "bg-[#00e701]" : "bg-[#213743]"
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                  quickSelection ? "left-5.5" : "left-0.5"
                }`}
              />
            </button>
          </div>
        </div>

        {/* 3. Action Buttons: Max Bet, Game Info, Hotkeys */}
        <div className="border-t border-[#213743] pt-3 grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onMaxBet();
              onClose();
            }}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#213743] hover:bg-[#2f4553] text-white font-bold text-[10px] transition-colors cursor-pointer"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400 mb-1" />
            Max Bet
          </button>
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setShowGameInfo(true);
            }}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#213743] hover:bg-[#2f4553] text-[#b1bad3] hover:text-white font-bold text-[10px] transition-colors cursor-pointer"
          >
            <Info className="w-3.5 h-3.5 text-cyan-400 mb-1" />
            Game Info
          </button>
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setShowHotkeys(true);
            }}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#213743] hover:bg-[#2f4553] text-[#b1bad3] hover:text-white font-bold text-[10px] transition-colors cursor-pointer"
          >
            <Keyboard className="w-3.5 h-3.5 text-purple-400 mb-1" />
            Hotkeys
          </button>
        </div>
      </div>

      {/* Game Info Modal */}
      {showGameInfo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-[#1a2c38] border border-[#2f4553] p-5 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-[#213743] pb-3">
              <h4 className="text-base font-extrabold flex items-center gap-2">
                <span>💣</span> Stake Mines Info
              </h4>
              <button
                onClick={() => setShowGameInfo(false)}
                className="text-[#b1bad3] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2.5 text-xs text-[#b1bad3] leading-relaxed">
              <p>
                <strong className="text-white">House Edge:</strong> 2.50% (RTP: 97.50%)
              </p>
              <p>
                <strong className="text-white">Grid:</strong> 25 tiles (5x5). Choose between 1 and 24 mines.
              </p>
              <p>
                <strong className="text-white">Max Multiplier:</strong> Up to 2,277.00× or higher depending on the number of mines selected.
              </p>
              <p>
                <strong className="text-white">Provably Fair:</strong> Every mine position is determined via SHA-256 HMAC cryptographic hashing combining server and client seeds.
              </p>
            </div>
            <button
              onClick={() => setShowGameInfo(false)}
              className="w-full py-2.5 rounded-xl bg-[#1475e1] hover:bg-[#1164c2] text-white font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Hotkeys Dialog */}
      {showHotkeys && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-[#1a2c38] border border-[#2f4553] p-5 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-[#213743] pb-3">
              <h4 className="text-base font-extrabold flex items-center gap-2">
                <span>⌨️</span> Keyboard Hotkeys
              </h4>
              <button
                onClick={() => setShowHotkeys(false)}
                className="text-[#b1bad3] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-[#213743]">
                <span className="text-[#b1bad3]">Place Bet / Start Game</span>
                <kbd className="px-2 py-1 rounded bg-[#0f212e] text-[#00e701] font-mono font-bold">Space</kbd>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#213743]">
                <span className="text-[#b1bad3]">Cashout</span>
                <kbd className="px-2 py-1 rounded bg-[#0f212e] text-[#00e701] font-mono font-bold">C</kbd>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#213743]">
                <span className="text-[#b1bad3]">Random Tile Pick</span>
                <kbd className="px-2 py-1 rounded bg-[#0f212e] text-white font-mono font-bold">R</kbd>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#213743]">
                <span className="text-[#b1bad3]">Half Bet (½)</span>
                <kbd className="px-2 py-1 rounded bg-[#0f212e] text-white font-mono font-bold">A</kbd>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#213743]">
                <span className="text-[#b1bad3]">Double Bet (2×)</span>
                <kbd className="px-2 py-1 rounded bg-[#0f212e] text-white font-mono font-bold">S</kbd>
              </div>
            </div>
            <button
              onClick={() => setShowHotkeys(false)}
              className="w-full py-2.5 rounded-xl bg-[#1475e1] hover:bg-[#1164c2] text-white font-bold text-xs"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
}

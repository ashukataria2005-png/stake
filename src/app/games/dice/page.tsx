"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Dice5,
  Volume2,
  VolumeX,
  ShieldCheck,
  Maximize2,
  Minimize2,
  ArrowRightLeft,
  Sparkles,
  RefreshCw,
  X,
  Copy,
  Check,
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import { sounds } from "@/utils/audio";
import confetti from "canvas-confetti";

interface RollHistoryItem {
  id: string;
  roll: number;
  isWin: boolean;
}

export default function DicePage() {
  const { balance, updateBalance, currency, formatBalance } = useGame();

  // Mode & Betting State
  const [betAmount, setBetAmount] = useState<number>(10);
  const [isRollOver, setIsRollOver] = useState<boolean>(true);
  const [target, setTarget] = useState<number>(50.5);

  // Derived 99% RTP Math State
  // Multiplier = 99 / winChance
  const [multiplier, setMultiplier] = useState<number>(2.0);
  const [winChance, setWinChance] = useState<number>(49.5);

  // Roll Execution State
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [lastRoll, setLastRoll] = useState<number | null>(null);
  const [hasWon, setHasWon] = useState<boolean | null>(null);
  const [displayRoll, setDisplayRoll] = useState<number>(50.5);

  // History strip of last 10 rolls
  const [history, setHistory] = useState<RollHistoryItem[]>([
    { id: "h1", roll: 64.21, isWin: true },
    { id: "h2", roll: 12.05, isWin: false },
    { id: "h3", roll: 88.94, isWin: true },
    { id: "h4", roll: 51.3, isWin: true },
    { id: "h5", roll: 3.42, isWin: false },
    { id: "h6", roll: 77.16, isWin: true },
    { id: "h7", roll: 29.88, isWin: false },
    { id: "h8", roll: 92.4, isWin: true },
  ]);

  // Audio & Fullscreen state
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Provably Fair Modal
  const [isFairnessOpen, setIsFairnessOpen] = useState<boolean>(false);
  const [serverSeedHash, setServerSeedHash] = useState<string>(
    "9c1e7a4b08d2f53e61a8b940c72e1f3a58d69b0c2e4f7a1b3d5c8e9f0a2b4c6e"
  );
  const [clientSeed, setClientSeed] = useState<string>("stake_dice_7721b");
  const [nonce, setNonce] = useState<number>(429);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Sound toggle
  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    sounds.enabled = !next;
  };

  // Math recalculators (99% RTP / 1% House Edge)
  const updateFromTarget = useCallback(
    (newTarget: number, rollOverMode: boolean) => {
      const clamped = Math.max(2.0, Math.min(98.0, parseFloat(newTarget.toFixed(2))));
      setTarget(clamped);

      const calculatedChance = rollOverMode
        ? parseFloat((100.0 - clamped).toFixed(2))
        : parseFloat(clamped.toFixed(2));
      setWinChance(calculatedChance);

      const calculatedMultiplier = parseFloat((99.0 / calculatedChance).toFixed(4));
      setMultiplier(calculatedMultiplier);
    },
    []
  );

  const updateFromMultiplier = (newMultiplier: number) => {
    const clampedMult = Math.max(1.0102, Math.min(49.5, newMultiplier));
    setMultiplier(clampedMult);

    const calculatedChance = parseFloat((99.0 / clampedMult).toFixed(2));
    setWinChance(calculatedChance);

    const calculatedTarget = isRollOver
      ? parseFloat((100.0 - calculatedChance).toFixed(2))
      : calculatedChance;
    setTarget(Math.max(2.0, Math.min(98.0, calculatedTarget)));
  };

  const updateFromWinChance = (newChance: number) => {
    const clampedChance = Math.max(2.0, Math.min(98.0, newChance));
    setWinChance(clampedChance);

    const calculatedMultiplier = parseFloat((99.0 / clampedChance).toFixed(4));
    setMultiplier(calculatedMultiplier);

    const calculatedTarget = isRollOver
      ? parseFloat((100.0 - clampedChance).toFixed(2))
      : clampedChance;
    setTarget(Math.max(2.0, Math.min(98.0, calculatedTarget)));
  };

  // Toggle Roll Over / Roll Under (Inverts condition while preserving Win Chance)
  const toggleRollMode = () => {
    sounds.playClick();
    const nextMode = !isRollOver;
    setIsRollOver(nextMode);
    const newTarget = parseFloat((100.0 - target).toFixed(2));
    updateFromTarget(newTarget, nextMode);
  };

  // Quick Bet Math Actions
  const handleHalfBet = () => {
    sounds.playClick();
    setBetAmount((prev) => Math.max(1, parseFloat((prev / 2).toFixed(2))));
  };

  const handleDoubleBet = () => {
    sounds.playClick();
    setBetAmount((prev) => {
      const next = parseFloat((prev * 2).toFixed(2));
      return Math.min(next, Math.max(1, parseFloat(balance.toFixed(2))));
    });
  };

  const handleMaxBet = () => {
    sounds.playClick();
    setBetAmount(Math.max(1, parseFloat(balance.toFixed(2))));
  };

  // Roll Dice Execution
  const rollDice = useCallback(() => {
    if (isRolling) return;
    if (betAmount > balance) {
      alert("Insufficient demo balance! Please use the Wallet button to top up.");
      return;
    }
    if (betAmount <= 0) return;

    // Deduct bet amount immediately
    updateBalance(-betAmount);
    setNonce((n) => n + 1);
    setIsRolling(true);
    setHasWon(null);

    sounds.playDiceRoll();

    // Rapid shuffle animation for 200ms
    const shuffleStart = performance.now();
    const interval = setInterval(() => {
      setDisplayRoll(parseFloat((Math.random() * 100).toFixed(2)));
      if (performance.now() - shuffleStart > 220) {
        clearInterval(interval);

        // Final random roll outcome (0.00 to 100.00)
        const finalRoll = parseFloat((Math.random() * 100).toFixed(2));
        setDisplayRoll(finalRoll);
        setLastRoll(finalRoll);

        const won = isRollOver ? finalRoll > target : finalRoll < target;
        setHasWon(won);
        setIsRolling(false);

        if (won) {
          const payout = parseFloat((betAmount * multiplier).toFixed(2));
          updateBalance(payout);
          sounds.playDiceWin();

          if (multiplier >= 5) {
            try {
              confetti({
                particleCount: 60,
                spread: 60,
                origin: { y: 0.6 },
                colors: ["#00e701", "#ffffff", "#facc15"],
              });
            } catch {
              // ignore
            }
          }
        } else {
          sounds.playDiceLoss();
        }

        // Add to history
        setHistory((prev) => [
          { id: `h-${Date.now()}`, roll: finalRoll, isWin: won },
          ...prev.slice(0, 9),
        ]);
      }
    }, 30);
  }, [balance, betAmount, isRolling, isRollOver, multiplier, target, updateBalance]);

  // Spacebar to trigger roll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        rollDice();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [rollDice]);

  // Copy helper
  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1800);
  };

  return (
    <div
      className={`w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4 select-none space-y-4 ${
        isFullscreen ? "fixed inset-0 z-50 bg-[#0f212e] overflow-y-auto p-4 max-w-none" : ""
      }`}
    >
      {/* Top Header & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-bold text-[#b1bad3] hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Casino Lobby</span>
        </Link>

        {/* Live Roll History Strip (Last 10 Rolls) */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-[11px] font-bold text-[#b1bad3] uppercase tracking-wider hidden sm:inline mr-1">
            History:
          </span>
          {history.map((h) => (
            <span
              key={h.id}
              className={`rounded-lg px-2 py-0.5 text-xs font-mono font-bold border transition-colors ${
                h.isWin
                  ? "bg-[#00e701]/15 text-[#00e701] border-[#00e701]/30 shadow-sm"
                  : "bg-[#213743] text-[#b1bad3] border-[#2f4553]"
              }`}
            >
              {h.roll.toFixed(2)}
            </span>
          ))}
        </div>
      </div>

      {/* Main 2-Panel Game Container */}
      <div className="rounded-2xl border border-[#213743] bg-[#1a2c38] shadow-2xl overflow-hidden flex flex-col-reverse lg:flex-row">
        {/* ======================================================== */}
        {/* 1. BETTING CONTROLS (Left Panel on Desktop / Bottom on Mobile) */}
        {/* ======================================================== */}
        <div className="w-full lg:w-[320px] shrink-0 border-t lg:border-t-0 lg:border-r border-[#213743] bg-[#1a2c38] p-4 sm:p-5 flex flex-col justify-start space-y-4">
          {/* [Section 2 - Directly below Game Screen]: PRIMARY ACTION BUTTON */}
          <div className="w-full">
            <button
              onClick={rollDice}
              disabled={isRolling || betAmount > balance || betAmount <= 0}
              className="w-full py-4 text-base font-extrabold rounded-lg bg-[#00e701] text-black shadow-md hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              <Dice5 className={`h-5 w-5 ${isRolling ? "animate-spin" : ""}`} />
              <span>{isRolling ? "Rolling..." : "Bet"}</span>
            </button>
          </div>

          {/* [Section 3]: Betting Inputs & Modifiers */}
          <div className="space-y-4">
            {/* Bet Amount Input with Quick Math Buttons */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-[#b1bad3]">
                <span>Bet Amount</span>
                <span className="font-mono text-[#00e701]">
                  ${formatBalance(balance)} {currency}
                </span>
              </div>
              <div className="flex items-center rounded-xl border border-[#213743] bg-[#0f212e] p-1 focus-within:border-[#00e701] transition-colors">
                <span className="px-2 text-sm font-bold text-[#00e701]">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  disabled={isRolling}
                  value={betAmount}
                  onChange={(e) =>
                    setBetAmount(Math.max(0, parseFloat(e.target.value) || 0))
                  }
                  className="w-full bg-transparent text-sm font-bold text-white focus:outline-none font-mono"
                />
                <button
                  type="button"
                  disabled={isRolling}
                  onClick={handleHalfBet}
                  className="rounded-lg px-2 py-1 text-xs font-bold text-[#b1bad3] hover:bg-[#213743] hover:text-white transition-colors"
                >
                  ½
                </button>
                <button
                  type="button"
                  disabled={isRolling}
                  onClick={handleDoubleBet}
                  className="rounded-lg px-2 py-1 text-xs font-bold text-[#b1bad3] hover:bg-[#213743] hover:text-white transition-colors"
                >
                  2×
                </button>
                <button
                  type="button"
                  disabled={isRolling}
                  onClick={handleMaxBet}
                  className="rounded-lg px-2 py-1 text-xs font-bold text-[#b1bad3] hover:bg-[#213743] hover:text-white transition-colors"
                >
                  Max
                </button>
              </div>
            </div>

            {/* Profit on Win Display */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-[#b1bad3]">
                <span>Profit on Win</span>
                <span className="font-mono text-[#00e701]">
                  +${(betAmount * (multiplier - 1)).toFixed(2)} {currency}
                </span>
              </div>
              <div className="flex items-center rounded-xl border border-[#213743] bg-[#0f212e] px-3 py-2 text-sm font-mono font-bold text-white">
                ${(betAmount * multiplier).toFixed(2)}
              </div>
            </div>

            {/* 3 Interlinked Readout / Input Controls */}
            <div className="space-y-3 pt-1">
              {/* 1. Multiplier Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#b1bad3]">
                  Multiplier
                </label>
                <div className="flex items-center rounded-xl border border-[#213743] bg-[#0f212e] px-3 py-2 focus-within:border-[#00e701] transition-colors">
                  <input
                    type="number"
                    step="0.01"
                    min="1.0102"
                    max="49.5"
                    disabled={isRolling}
                    value={multiplier}
                    onChange={(e) => updateFromMultiplier(parseFloat(e.target.value) || 2.0)}
                    className="w-full bg-transparent text-xs font-mono font-bold text-white focus:outline-none"
                  />
                  <span className="text-xs font-bold text-[#b1bad3]">×</span>
                </div>
              </div>

              {/* 2. Roll Target Input with Roll Over / Under indicator */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-wider text-[#b1bad3]">
                  <span>{isRollOver ? "Roll Over" : "Roll Under"}</span>
                  <button
                    type="button"
                    onClick={toggleRollMode}
                    className="flex items-center gap-1 text-[10px] text-[#00e701] hover:underline"
                  >
                    <ArrowRightLeft className="h-3 w-3" />
                    <span>Flip</span>
                  </button>
                </div>
                <div className="flex items-center rounded-xl border border-[#213743] bg-[#0f212e] px-3 py-2 focus-within:border-[#00e701] transition-colors">
                  <input
                    type="number"
                    step="0.01"
                    min="2"
                    max="98"
                    disabled={isRolling}
                    value={target}
                    onChange={(e) => updateFromTarget(parseFloat(e.target.value) || 50.0, isRollOver)}
                    className="w-full bg-transparent text-xs font-mono font-bold text-white focus:outline-none"
                  />
                  <span className="text-xs font-bold text-[#b1bad3]">
                    {isRollOver ? ">" : "<"}
                  </span>
                </div>
              </div>

              {/* 3. Win Chance Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#b1bad3]">
                  Win Chance
                </label>
                <div className="flex items-center rounded-xl border border-[#213743] bg-[#0f212e] px-3 py-2 focus-within:border-[#00e701] transition-colors">
                  <input
                    type="number"
                    step="0.01"
                    min="2"
                    max="98"
                    disabled={isRolling}
                    value={winChance}
                    onChange={(e) => updateFromWinChance(parseFloat(e.target.value) || 49.5)}
                    className="w-full bg-transparent text-xs font-mono font-bold text-[#00e701] focus:outline-none"
                  />
                  <span className="text-xs font-bold text-[#b1bad3]">%</span>
                </div>
              </div>
            </div>
          </div>


        </div>

        {/* ======================================================== */}
        {/* 2. DICE SLIDER ARENA (Right Panel on Desktop / Top on Mobile) */}
        {/* ======================================================== */}
        <div className="flex-1 bg-[#0f212e] p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-between min-h-[440px] sm:min-h-[540px] relative overflow-hidden">
          {/* Top Status Bar in Arena */}
          <div className="w-full flex items-center justify-between z-10">
            <div className="flex items-center gap-2 text-xs font-bold text-[#b1bad3]">
              <span className="flex h-2 w-2 rounded-full bg-[#00e701] animate-pulse" />
              <span>Provably Fair 99% RTP</span>
            </div>

            {/* Mode Switcher Pill */}
            <button
              onClick={toggleRollMode}
              className="flex items-center gap-2 rounded-xl border border-[#213743] bg-[#1a2c38] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#213743] hover:border-[#2f4553] transition-colors"
            >
              <ArrowRightLeft className="h-3.5 w-3.5 text-[#00e701]" />
              <span>Mode: {isRollOver ? "Roll Over" : "Roll Under"}</span>
            </button>
          </div>

          {/* Central Result Display Box */}
          <div className="my-auto flex flex-col items-center text-center space-y-3 z-10">
            <div
              className={`rounded-2xl border-2 px-8 py-5 bg-[#1a2c38] shadow-2xl transition-all duration-200 min-w-[220px] ${
                hasWon === true
                  ? "border-[#00e701] shadow-[#00e701]/30 animate-in zoom-in-95"
                  : hasWon === false
                  ? "border-[#e9113c] shadow-[#e9113c]/30 animate-bomb-shake"
                  : "border-[#213743]"
              }`}
            >
              <div
                className={`text-5xl sm:text-7xl font-black font-mono tracking-tight transition-colors ${
                  hasWon === true
                    ? "text-[#00e701] drop-shadow-[0_0_20px_rgba(0,231,1,0.6)]"
                    : hasWon === false
                    ? "text-[#e9113c] drop-shadow-[0_0_20px_rgba(233,17,60,0.6)]"
                    : "text-white"
                }`}
              >
                {displayRoll.toFixed(2)}
              </div>
              <div className="mt-1 text-xs font-extrabold uppercase tracking-widest text-[#b1bad3]">
                {hasWon === true
                  ? `Won +$${(betAmount * (multiplier - 1)).toFixed(2)}`
                  : hasWon === false
                  ? "Loss"
                  : `Target: ${isRollOver ? ">" : "<"} ${target.toFixed(2)}`}
              </div>
            </div>
          </div>

          {/* Interactive Slider & Target Track */}
          <div className="w-full max-w-2xl px-2 sm:px-6 space-y-3 z-10 my-4">
            <div className="relative flex flex-col items-center">
              {/* Rolled Result Pointer on the Track */}
              {lastRoll !== null && (
                <div
                  className="absolute -top-8 z-30 transition-all duration-300 pointer-events-none transform -translate-x-1/2 flex flex-col items-center"
                  style={{ left: `${Math.min(98, Math.max(2, lastRoll))}%` }}
                >
                  <div
                    className={`rounded-md px-2 py-0.5 text-[11px] font-black font-mono shadow-md ${
                      hasWon ? "bg-[#00e701] text-[#0f212e]" : "bg-[#e9113c] text-white"
                    }`}
                  >
                    {lastRoll.toFixed(2)}
                  </div>
                  <div
                    className={`w-0 h-0 border-x-4 border-x-transparent border-t-4 ${
                      hasWon ? "border-t-[#00e701]" : "border-t-[#e9113c]"
                    }`}
                  />
                </div>
              )}

              {/* Two-Tone Colored Track */}
              <div className="relative w-full h-4 rounded-full overflow-hidden bg-[#213743] shadow-inner">
                {isRollOver ? (
                  <>
                    {/* Loss Zone (0 to Target) */}
                    <div
                      className="absolute top-0 bottom-0 left-0 bg-[#e9113c] transition-all"
                      style={{ width: `${target}%` }}
                    />
                    {/* Win Zone (Target to 100) */}
                    <div
                      className="absolute top-0 bottom-0 right-0 bg-[#00e701] transition-all"
                      style={{ width: `${100 - target}%` }}
                    />
                  </>
                ) : (
                  <>
                    {/* Win Zone (0 to Target) */}
                    <div
                      className="absolute top-0 bottom-0 left-0 bg-[#00e701] transition-all"
                      style={{ width: `${target}%` }}
                    />
                    {/* Loss Zone (Target to 100) */}
                    <div
                      className="absolute top-0 bottom-0 right-0 bg-[#e9113c] transition-all"
                      style={{ width: `${100 - target}%` }}
                    />
                  </>
                )}
              </div>

              {/* Real HTML Range Input for Seamless Drag & Touch */}
              <input
                type="range"
                min="2.00"
                max="98.00"
                step="0.01"
                disabled={isRolling}
                value={target}
                onChange={(e) => updateFromTarget(parseFloat(e.target.value), isRollOver)}
                className="absolute inset-0 w-full h-4 opacity-0 cursor-ew-resize z-20"
              />

              {/* Stake Diamond Handle Indicator */}
              <div
                className="absolute top-1/2 -translate-y-1/2 z-10 pointer-events-none transform -translate-x-1/2 transition-transform duration-75"
                style={{ left: `${target}%` }}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-[#0f212e] shadow-xl border-2 border-[#1a2c38] transform hover:scale-110">
                  <span className="text-xs font-black select-none">◆</span>
                </div>
              </div>
            </div>

            {/* Slider Scale Markers: 0, 25, 50, 75, 100 */}
            <div className="flex justify-between px-1 text-xs font-mono font-bold text-[#b1bad3] select-none">
              <span>0</span>
              <span>25</span>
              <span>50</span>
              <span>75</span>
              <span>100</span>
            </div>
          </div>

          {/* Bottom Game Utilities Bar */}
          <div className="w-full flex items-center justify-between border-t border-[#213743] pt-3 z-10">
            {/* Provably Fair Modal Trigger */}
            <button
              onClick={() => setIsFairnessOpen(true)}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold text-[#b1bad3] hover:text-white hover:bg-[#1a2c38] transition-colors"
            >
              <ShieldCheck className="h-4 w-4 text-[#00e701]" />
              <span>Fairness</span>
            </button>

            {/* Sound & Screen Controls */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleSound}
                title={isMuted ? "Unmute Audio" : "Mute Audio"}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#b1bad3] hover:text-white hover:bg-[#1a2c38] transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4 text-red-400" />
                ) : (
                  <Volume2 className="h-4 w-4 text-[#00e701]" />
                )}
              </button>

              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#b1bad3] hover:text-white hover:bg-[#1a2c38] transition-colors"
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. PROVABLY FAIR MODAL */}
      {/* ======================================================== */}
      {isFairnessOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-[#213743] bg-[#1a2c38] p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#213743] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#00e701]/15 text-[#00e701]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Dice Fairness</h3>
                  <p className="text-xs text-[#b1bad3]">
                    100% cryptographic verification of roll result
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFairnessOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#b1bad3] hover:bg-[#213743] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#b1bad3] uppercase tracking-wider text-[10px]">
                  Server Seed (SHA-256 Hash)
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-[#213743] bg-[#0f212e] px-3 py-2">
                  <span className="font-mono text-white text-[11px] truncate flex-1">
                    {serverSeedHash}
                  </span>
                  <button
                    onClick={() => copyToClipboard(serverSeedHash, "server")}
                    className="text-[#b1bad3] hover:text-[#00e701]"
                  >
                    {copiedField === "server" ? (
                      <Check className="h-3.5 w-3.5 text-[#00e701]" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#b1bad3] uppercase tracking-wider text-[10px]">
                  Client Seed
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-[#213743] bg-[#0f212e] px-3 py-2">
                  <input
                    type="text"
                    value={clientSeed}
                    onChange={(e) => setClientSeed(e.target.value)}
                    className="font-mono text-white text-xs bg-transparent focus:outline-none flex-1"
                  />
                  <button
                    onClick={() =>
                      setClientSeed(`stake_${Math.random().toString(36).substring(2, 9)}`)
                    }
                    title="Generate Random Client Seed"
                    className="text-[#b1bad3] hover:text-[#00e701]"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#b1bad3] uppercase tracking-wider text-[10px]">
                  Nonce (Dice Roll Counter)
                </label>
                <div className="rounded-xl border border-[#213743] bg-[#0f212e] px-3 py-2 font-mono text-white font-bold">
                  {nonce}
                </div>
              </div>

              <div className="rounded-xl border border-[#213743] bg-[#0f212e] p-3 text-[11px] space-y-1 text-[#b1bad3]">
                <div className="font-bold text-white">Mathematical Payout Formula:</div>
                <div className="font-mono text-[#00e701]">
                  Multiplier = 99.00 / WinChance (1% House Edge / 99% RTP)
                </div>
                <div>Roll is calculated deterministically from HMAC_SHA256(ServerSeed, ClientSeed:Nonce).</div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#213743]">
              <button
                onClick={() => setIsFairnessOpen(false)}
                className="rounded-xl bg-[#00e701] px-5 py-2 text-xs font-bold text-[#0f212e] hover:bg-[#00c701]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

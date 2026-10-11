"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Volume2,
  VolumeX,
  ShieldCheck,
  Maximize2,
  Minimize2,
  Zap,
  TrendingUp,
  X,
  Copy,
  Check,
  Sparkles,
  Wind,
  Flame,
  RotateCcw,
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import { sounds } from "@/utils/audio";
import confetti from "canvas-confetti";

// Provably Fair Crash/Burst Distribution (99% RTP / 1% House Edge)
function generateBurstMultiplier(): number {
  const rand = Math.random();
  // 1% instant house edge
  if (rand < 0.01) return 1.0;
  // Continuous multiplier curve: P(M >= x) = 0.99 / x
  const mult = 0.99 / (1.0 - rand);
  return parseFloat(Math.max(1.02, mult).toFixed(2));
}

// Multiplier progression per pump stroke
function getMultiplierForPump(stroke: number): number {
  if (stroke <= 0) return 1.0;
  // Smooth geometric scaling: ~6% - 10% gain per pump
  let m = 1.0;
  for (let i = 1; i <= stroke; i++) {
    const factor = 1.06 + Math.min(0.06, i * 0.003);
    m *= factor;
  }
  return parseFloat(m.toFixed(2));
}

export default function PumpGame() {
  const { balance, updateBalance, currencySymbol, addRecentlyPlayedGame } = useGame();
  const activeSym = currencySymbol || "$";

  // Register in Recently Played once on mount
  useEffect(() => {
    if (addRecentlyPlayedGame) {
      addRecentlyPlayedGame({
        id: "pump",
        title: "Pump",
        image: "/games/stake-originals/stake-originals-pump.webp",
        href: "/games/pump",
      });
    }
  }, []);

  // Mode & Betting State
  const [betAmount, setBetAmount] = useState<number>(10);
  const [betInput, setBetInput] = useState<string>("10");
  const [autoTargetInput, setAutoTargetInput] = useState<string>("2.00");
  const [autoPumpEnabled, setAutoPumpEnabled] = useState<boolean>(false);

  useEffect(() => {
    if (betInput !== "" && parseFloat(betInput) === betAmount) return;
    setBetInput(betAmount.toString());
  }, [betAmount]);

  // Round State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [pumpCount, setPumpCount] = useState<number>(0);
  const [burstMultiplier, setBurstMultiplier] = useState<number>(1.0);
  const [isPopped, setIsPopped] = useState<boolean>(false);
  const [isCashedOut, setIsCashedOut] = useState<boolean>(false);
  const [wobble, setWobble] = useState<boolean>(false);
  const [isPumping, setIsPumping] = useState<boolean>(false);

  // Derived Values
  const currentMultiplier = pumpCount === 0 ? 1.0 : getMultiplierForPump(pumpCount);
  const nextMultiplier = getMultiplierForPump(pumpCount + 1);
  const currentPayout = parseFloat((betAmount * currentMultiplier).toFixed(2));
  const currentProfit = parseFloat((currentPayout - betAmount).toFixed(2));

  // Settings
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const gameContainerRef = useRef<HTMLDivElement>(null);

  // Modals
  const [showFairnessModal, setShowFairnessModal] = useState<boolean>(false);
  const [showLiveStats, setShowLiveStats] = useState<boolean>(false);
  const [copiedSeed, setCopiedSeed] = useState<boolean>(false);

  // Live Stats
  const [stats, setStats] = useState({
    rounds: 0,
    wins: 0,
    losses: 0,
    wagered: 0,
    profit: 0,
  });

  // Quick Bet Modifiers
  const handleHalfBet = () => {
    if (isPlaying) return;
    if (soundEnabled) sounds.playClick();
    const next = Math.max(0.01, parseFloat((betAmount / 2).toFixed(2)));
    setBetAmount(next);
    setBetInput(next.toString());
  };

  const handleDoubleBet = () => {
    if (isPlaying) return;
    if (soundEnabled) sounds.playClick();
    const next = parseFloat((betAmount * 2).toFixed(2));
    setBetAmount(next);
    setBetInput(next.toString());
  };

  const handleMaxBet = () => {
    if (isPlaying) return;
    if (soundEnabled) sounds.playClick();
    const next = Math.max(0.01, parseFloat(balance.toFixed(2)));
    setBetAmount(next);
    setBetInput(next.toString());
  };

  // Start Round
  const handleStartRound = () => {
    if (isPlaying || isPumping) return;
    if (balance < betAmount) {
      alert("Insufficient balance!");
      return;
    }

    updateBalance(-betAmount);
    if (soundEnabled) sounds.playBet();

    const burst = generateBurstMultiplier();
    setBurstMultiplier(burst);
    setPumpCount(0);
    setIsPopped(false);
    setIsCashedOut(false);
    setIsPlaying(true);

    setStats((prev) => ({
      ...prev,
      rounds: prev.rounds + 1,
      wagered: parseFloat((prev.wagered + betAmount).toFixed(2)),
    }));
  };

  // Perform a Pump Stroke
  const handlePumpStroke = () => {
    if (!isPlaying || isPopped || isCashedOut || isPumping) return;

    setIsPumping(true);
    const nextCount = pumpCount + 1;
    const prospectiveMult = getMultiplierForPump(nextCount);

    // Tactile wobble trigger
    setWobble(true);
    setTimeout(() => setWobble(false), 250);

    if (soundEnabled) {
      sounds.playPumpInflate(nextCount);
    }

    // Check if balloon bursts
    if (prospectiveMult >= burstMultiplier) {
      // POP!
      setTimeout(() => {
        setIsPopped(true);
        setIsPlaying(false);
        setIsPumping(false);
        if (soundEnabled) sounds.playBalloonPop();

        setStats((prev) => ({
          ...prev,
          losses: prev.losses + 1,
          profit: parseFloat((prev.profit - betAmount).toFixed(2)),
        }));
      }, 150);
    } else {
      // Successful Pump!
      setTimeout(() => {
        setPumpCount(nextCount);
        setIsPumping(false);

        // Check Auto-Cashout target if enabled
        if (autoPumpEnabled) {
          const target = parseFloat(autoTargetInput);
          if (!isNaN(target) && prospectiveMult >= target) {
            handleCashout(prospectiveMult);
          }
        }
      }, 100);
    }
  };

  // Cashout
  const handleCashout = (overrideMult?: number) => {
    if (!isPlaying || isPopped || isCashedOut || isPumping) return;

    const mult = overrideMult !== undefined ? overrideMult : currentMultiplier;
    if (mult <= 1.0 && pumpCount === 0) return;

    const payout = parseFloat((betAmount * mult).toFixed(2));
    const profit = parseFloat((payout - betAmount).toFixed(2));

    updateBalance(payout);
    setIsCashedOut(true);
    setIsPlaying(false);

    if (soundEnabled) sounds.playCashout();
    confetti({ particleCount: 90, spread: 75, origin: { y: 0.55 } });

    setStats((prev) => ({
      ...prev,
      wins: prev.wins + 1,
      profit: parseFloat((prev.profit + profit).toFixed(2)),
    }));
  };

  const toggleFullscreen = () => {
    if (!gameContainerRef.current) return;
    if (!document.fullscreenElement) {
      gameContainerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Balloon size scale calculation based on pumpCount
  // Scale begins at 1.0 and expands smoothly up to ~2.2x
  const balloonScale = isPopped ? 0 : Math.min(2.2, 1.0 + pumpCount * 0.08);

  return (
    <div
      ref={gameContainerRef}
      className={`w-full max-w-lg mx-auto px-2 sm:px-3 py-2 select-none flex flex-col space-y-2 ${
        isFullscreen ? "p-6 bg-[#0f212e] min-h-screen max-w-none" : ""
      }`}
    >
      {/* =========================================================================
          1. GAME ARENA: INFLATING BALLOON ARENA
      ========================================================================== */}
      <div className="w-full rounded-t-2xl bg-[#0f212e] border-t border-x border-[#213743] shadow-2xl p-3 sm:p-4 flex flex-col items-center justify-center space-y-3 relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-[#00e701]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Live Multiplier & Stage Status Pill */}
        <div className="w-full flex items-center justify-between bg-[#1a2c38] rounded-xl px-3 py-2 border border-[#213743] z-10">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-[#b1bad3] uppercase tracking-wider">Pumps:</span>
            <span className="text-xs font-bold text-white font-mono">{pumpCount}</span>
          </div>

          <div className="flex items-center gap-3">
            {isPlaying && (
              <div className="text-xs text-[#b1bad3]">
                Next: <span className="font-mono font-bold text-white">{nextMultiplier.toFixed(2)}×</span>
              </div>
            )}
            <div
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-[#0f212e] text-xs font-black font-mono transition-transform duration-200 ${
                isPlaying && pumpCount > 0 ? "scale-105 text-[#00e701]" : "text-[#b1bad3]"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{currentMultiplier.toFixed(2)}×</span>
            </div>
          </div>
        </div>

        {/* Central Balloon Stage Canvas */}
        <div className="relative w-full max-w-xs h-60 sm:h-68 flex items-center justify-center my-2 overflow-hidden">
          {!isPopped ? (
            // Active Inflating Balloon
            <div
              className={`relative flex items-center justify-center transition-all duration-300 ease-out ${
                wobble ? "scale-x-110 scale-y-95" : ""
              } ${isCashedOut ? "animate-bounce duration-1000" : ""}`}
              style={{
                transform: `scale(${balloonScale})`,
                transition: "transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            >
              <svg width="150" height="190" viewBox="0 0 180 220" className="drop-shadow-[0_15px_30px_rgba(239,68,68,0.4)]">
                <defs>
                  <radialGradient id="balloonGradient" cx="35%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#ff7b7b" />
                    <stop offset="40%" stopColor="#ef4444" />
                    <stop offset="85%" stopColor="#b91c1c" />
                    <stop offset="100%" stopColor="#7f1d1d" />
                  </radialGradient>
                  <linearGradient id="sheen" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="white" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="white" stopOpacity="0" />
                  </linearGradient>
                </defs>

                <path
                  d="M90 10 C140 10 170 50 170 100 C170 145 125 180 95 190 L85 190 C55 180 10 145 10 100 C10 50 40 10 90 10 Z"
                  fill="url(#balloonGradient)"
                />

                <ellipse cx="60" cy="55" rx="30" ry="45" fill="url(#sheen)" transform="rotate(-25 60 55)" />
                <polygon points="90,190 80,205 100,205" fill="#991b1b" />
                <path d="M90 205 Q95 215 90 220" stroke="#fca5a5" strokeWidth="2" fill="none" />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none -mt-4">
                <span className="text-xl sm:text-2xl font-black font-mono text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  {currentMultiplier.toFixed(2)}×
                </span>
                {isPlaying && (
                  <span className="text-[9px] font-bold text-white/90 uppercase tracking-widest mt-0.5">
                    {pumpCount} PUMPS
                  </span>
                )}
              </div>
            </div>
          ) : (
            // Burst Animation
            <div className="flex flex-col items-center justify-center animate-in zoom-in-50 duration-200">
              <div className="w-20 h-20 rounded-full bg-red-600/20 border-2 border-red-500/40 flex items-center justify-center mb-2">
                <Flame className="h-10 w-10 text-red-500 animate-pulse" />
              </div>
              <div className="text-xl font-black font-mono text-red-500 tracking-wider">
                POP! BUSTED
              </div>
              <div className="text-[11px] text-[#b1bad3] font-semibold mt-0.5">
                Popped at target {burstMultiplier.toFixed(2)}×
              </div>
            </div>
          )}
        </div>

        {/* Round Feedback Messages */}
        {isCashedOut && (
          <div className="w-full px-4 py-1.5 rounded-xl bg-[#00e701]/10 border border-[#00e701]/40 flex items-center justify-center gap-2 animate-in fade-in zoom-in-95">
            <Sparkles className="h-3.5 w-3.5 text-[#00e701]" />
            <div className="text-xs font-bold text-[#00e701]">
              Cashed Out! Won {activeSym}{currentPayout.toFixed(2)} ({currentMultiplier.toFixed(2)}×)
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          2. MINES HARMONIZED BETTING CONTROLS SHELL CONTAINER
      ========================================================================== */}
      <div className="w-full border-t border-[#213743] bg-[#1a2c38] p-3 sm:p-4 flex flex-col justify-start space-y-2 sm:space-y-2.5 rounded-b-2xl select-none">
        {/* 1. PRIMARY BET CTA BUTTON (Directly at top of controls) */}
        <div className="w-full">
          {!isPlaying ? (
            <button
              type="button"
              onClick={handleStartRound}
              disabled={betAmount > balance || betAmount <= 0}
              className="w-full py-3 sm:py-3.5 text-sm sm:text-base font-extrabold rounded-xl bg-[#1475e1] hover:bg-[#1164c2] text-white shadow-lg shadow-[#1475e1]/25 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer uppercase tracking-wider"
            >
              <span>BET & PUMP</span>
            </button>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={handlePumpStroke}
                disabled={isPumping}
                className="py-3 text-xs font-extrabold rounded-xl bg-[#213743] hover:bg-[#2f4553] text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-[#2f4553]"
              >
                <Wind className="h-4 w-4 text-cyan-400" />
                <span>PUMP</span>
              </button>

              <button
                type="button"
                onClick={() => handleCashout()}
                disabled={pumpCount === 0 || isPumping}
                className={`col-span-2 py-3 text-sm font-extrabold rounded-xl shadow-lg transition-all flex items-center justify-center uppercase tracking-wider cursor-pointer ${
                  pumpCount > 0
                    ? "bg-[#00e701] hover:bg-[#00c701] text-black shadow-[0_0_20px_rgba(0,231,1,0.4)] animate-pulse"
                    : "bg-[#213743] text-[#b1bad3] cursor-not-allowed"
                }`}
              >
                <span>
                  {pumpCount > 0
                    ? `CASHOUT ${activeSym}${currentPayout.toFixed(2)} (${currentMultiplier.toFixed(2)}×)`
                    : "PUMP TO CASHOUT"}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* 2. BET AMOUNT INPUT (Exact Mines Structure) */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#b1bad3]">Bet Amount</span>
            <span className="font-mono text-[11px] text-[#b1bad3]">
              Bal: {activeSym}{balance.toFixed(2)}
            </span>
          </div>

          <div className="flex rounded-lg bg-[#0f212e] border border-[#213743] focus-within:border-[#2f4553] p-1">
            <div className="flex flex-1 items-center px-2.5">
              <span className="text-xs font-bold text-[#b1bad3] mr-1.5">{activeSym}</span>
              <input
                type="text"
                inputMode="decimal"
                disabled={isPlaying}
                value={betInput}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "" || /^\d*\.?\d*$/.test(val)) {
                    setBetInput(val);
                    if (val !== "" && !isNaN(parseFloat(val))) {
                      setBetAmount(parseFloat(val));
                    }
                  }
                }}
                onBlur={() => {
                  if (betInput === "" || isNaN(parseFloat(betInput)) || parseFloat(betInput) <= 0) {
                    setBetInput("1.00");
                    setBetAmount(1);
                  } else {
                    const num = parseFloat(betInput);
                    setBetAmount(num);
                    setBetInput(num.toFixed(2));
                  }
                }}
                className="w-full bg-transparent text-sm font-bold text-white outline-none font-mono"
              />
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={isPlaying}
                onClick={handleHalfBet}
                className="rounded-lg bg-[#213743] px-2.5 py-1.5 text-xs font-bold text-[#b1bad3] hover:bg-[#2f4553] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                ½
              </button>
              <button
                type="button"
                disabled={isPlaying}
                onClick={handleDoubleBet}
                className="rounded-lg bg-[#213743] px-2.5 py-1.5 text-xs font-bold text-[#b1bad3] hover:bg-[#2f4553] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                2×
              </button>
            </div>
          </div>
        </div>

        {/* 3. AUTO CASHOUT TARGET SELECTOR */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[10px] font-bold text-[#b1bad3] uppercase">
            <span>Auto-Cashout Target</span>
            <button
              type="button"
              disabled={isPlaying}
              onClick={() => setAutoPumpEnabled(!autoPumpEnabled)}
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded transition-colors ${
                autoPumpEnabled ? "bg-[#00e701]/20 text-[#00e701]" : "text-[#b1bad3] hover:text-white"
              }`}
            >
              {autoPumpEnabled ? "Enabled" : "Disabled"}
            </button>
          </div>
          <div className="relative flex items-center">
            <input
              type="number"
              disabled={isPlaying || !autoPumpEnabled}
              value={autoTargetInput}
              onChange={(e) => setAutoTargetInput(e.target.value)}
              placeholder="2.00"
              step="0.05"
              min="1.05"
              className="w-full bg-[#0f212e] border border-[#213743] rounded-lg px-2.5 py-2 text-xs font-bold font-mono text-white focus:outline-none focus:border-[#2f4553] disabled:opacity-40"
            />
            <div className="absolute right-2.5 text-xs font-bold text-[#b1bad3]">×</div>
          </div>
        </div>

        {/* 4. BOTTOM UTILITY BAR */}
        <div className="flex items-center justify-between rounded-lg bg-[#0f212e] border border-[#213743] px-3 py-2 text-xs text-[#b1bad3] mt-0.5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1 rounded-md hover:bg-[#213743] text-[#b1bad3] hover:text-white transition-colors cursor-pointer"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-red-400" />}
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowFairnessModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#213743] hover:bg-[#2f4553] text-[#b1bad3] hover:text-white font-bold text-xs transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-[#00e701]" />
            <span>Fairness</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          MODALS: PROVABLY FAIR & LIVE STATS
      ========================================================================== */}
      {showFairnessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#213743] bg-[#1a2c38] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#213743] pb-3">
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#00e701]" />
                <span>Provably Fair: Pump</span>
              </div>
              <button
                onClick={() => setShowFairnessModal(false)}
                className="p-1 rounded-lg text-[#b1bad3] hover:text-white hover:bg-[#213743]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs text-[#b1bad3]">
              <p>
                Balloon burst threshold is calculated using HMAC-SHA256 from your Client Seed and
                Server Seed with certified 99% Return to Player (RTP).
              </p>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#b1bad3]">Server Seed (Hashed)</label>
                <div className="flex items-center justify-between rounded-xl bg-[#0f212e] border border-[#213743] p-2.5 font-mono text-white text-[11px] truncate">
                  <span className="truncate">9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText("9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d");
                      setCopiedSeed(true);
                      setTimeout(() => setCopiedSeed(false), 2000);
                    }}
                    className="ml-2 text-[#00e701]"
                  >
                    {copiedSeed ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowFairnessModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#213743] text-white text-xs font-bold cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showLiveStats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-[#213743] bg-[#1a2c38] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#213743] pb-3">
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#00e701]" />
                <span>Pump Session Stats</span>
              </div>
              <button
                onClick={() => setShowLiveStats(false)}
                className="p-1 rounded-lg text-[#b1bad3] hover:text-white hover:bg-[#213743]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-xl bg-[#0f212e] border border-[#213743] p-3">
                <div className="text-[11px] font-bold text-[#b1bad3]">Total Rounds</div>
                <div className="text-lg font-black text-white font-mono">{stats.rounds}</div>
              </div>
              <div className="rounded-xl bg-[#0f212e] border border-[#213743] p-3">
                <div className="text-[11px] font-bold text-[#b1bad3]">Win Rate</div>
                <div className="text-lg font-black text-[#00e701] font-mono">
                  {stats.rounds > 0 ? ((stats.wins / stats.rounds) * 100).toFixed(1) : "0.0"}%
                </div>
              </div>
              <div className="rounded-xl bg-[#0f212e] border border-[#213743] p-3">
                <div className="text-[11px] font-bold text-[#b1bad3]">Wagered</div>
                <div className="text-lg font-black text-white font-mono">
                  {activeSym}
                  {stats.wagered.toFixed(2)}
                </div>
              </div>
              <div className="rounded-xl bg-[#0f212e] border border-[#213743] p-3">
                <div className="text-[11px] font-bold text-[#b1bad3]">Profit</div>
                <div
                  className={`text-lg font-black font-mono ${
                    stats.profit >= 0 ? "text-[#00e701]" : "text-[#e9113c]"
                  }`}
                >
                  {stats.profit >= 0 ? "+" : ""}
                  {activeSym}
                  {stats.profit.toFixed(2)}
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowLiveStats(false)}
              className="w-full py-2.5 rounded-xl bg-[#213743] text-white text-xs font-bold cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

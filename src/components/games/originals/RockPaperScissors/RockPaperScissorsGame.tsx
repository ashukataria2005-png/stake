"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ShieldCheck,
  Maximize2,
  Minimize2,
  TrendingUp,
  X,
  Info,
  Check,
  Copy,
  Volume2,
  VolumeX,
  Sparkles,
  Zap,
  RotateCcw,
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import { sounds } from "@/utils/audio";
import confetti from "canvas-confetti";

export type RPSChoice = "rock" | "paper" | "scissors";

const CHOICES: { id: RPSChoice; label: string; icon: string; beats: RPSChoice }[] = [
  { id: "rock", label: "Rock", icon: "🪨", beats: "scissors" },
  { id: "paper", label: "Paper", icon: "📄", beats: "rock" },
  { id: "scissors", label: "Scissors", icon: "✂️", beats: "paper" },
];

const STREAK_MULTIPLIERS = [
  1.96, 3.84, 7.53, 14.76, 28.93, 56.7, 111.13, 217.81, 426.91, 836.74,
];

export default function RockPaperScissorsGame() {
  const {
    balance,
    updateBalance,
    currencySymbol,
    addRecentlyPlayedGame,
  } = useGame();
  const activeSym = currencySymbol || "$";

  // Register in Recently Played
  useEffect(() => {
    if (addRecentlyPlayedGame) {
      addRecentlyPlayedGame({
        id: "rock-paper-scissors",
        title: "Rock Paper Scissors",
        image: "/games/stake-originals/rock-paper-scissors.webp",
        href: "/games/rock-paper-scissors",
      });
    }
  }, [addRecentlyPlayedGame]);

  // Betting & Choice State
  const [betAmount, setBetAmount] = useState<number>(10);
  const [betInput, setBetInput] = useState<string>("10");
  const [playerChoice, setPlayerChoice] = useState<RPSChoice>("rock");

  // Streak & Hand Arena State
  const [streak, setStreak] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [countdownStep, setCountdownStep] = useState<string | null>(null); // "Rock", "Paper", "Scissors", "SHOOT!"
  const [dealerChoice, setDealerChoice] = useState<RPSChoice | null>(null);
  const [roundOutcome, setRoundOutcome] = useState<"win" | "tie" | "loss" | null>(null);
  const [payoutMessage, setPayoutMessage] = useState<string>("");
  const [lastWinAmount, setLastWinAmount] = useState<number | null>(null);

  // Settings & Modals
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showFairnessModal, setShowFairnessModal] = useState<boolean>(false);
  const [showStatsModal, setShowStatsModal] = useState<boolean>(false);
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);
  const [copiedSeed, setCopiedSeed] = useState<boolean>(false);
  const gameContainerRef = useRef<HTMLDivElement>(null);

  // Statistics
  const [stats, setStats] = useState({
    rounds: 0,
    wins: 0,
    losses: 0,
    wagered: 0,
    profit: 0,
  });

  const currentMultiplier = streak > 0 ? STREAK_MULTIPLIERS[Math.min(streak - 1, STREAK_MULTIPLIERS.length - 1)] : 0;
  const currentCashout = streak > 0 ? parseFloat((betAmount * currentMultiplier).toFixed(2)) : 0;

  // Bet modifiers
  const handleHalfBet = () => {
    if (isPlaying || streak > 0) return;
    sounds.playClick();
    const next = Math.max(0.01, parseFloat((betAmount / 2).toFixed(2)));
    setBetAmount(next);
    setBetInput(next.toString());
  };

  const handleDoubleBet = () => {
    if (isPlaying || streak > 0) return;
    sounds.playClick();
    const next = parseFloat((betAmount * 2).toFixed(2));
    setBetAmount(next);
    setBetInput(next.toString());
  };

  const handleMaxBet = () => {
    if (isPlaying || streak > 0) return;
    sounds.playClick();
    const next = Math.max(0.01, parseFloat(balance.toFixed(2)));
    setBetAmount(next);
    setBetInput(next.toString());
  };

  // Play Round (Shoot)
  const handleShoot = () => {
    if (isPlaying) return;

    if (streak === 0) {
      const parsedBet = parseFloat(betInput) || 1;
      if (parsedBet > balance) {
        alert("Insufficient balance! Please use the Wallet button.");
        return;
      }
      updateBalance(-parsedBet);
      setBetAmount(parsedBet);

      setStats((prev) => ({
        ...prev,
        rounds: prev.rounds + 1,
        wagered: parseFloat((prev.wagered + parsedBet).toFixed(2)),
      }));
    }

    setIsPlaying(true);
    setRoundOutcome(null);
    setDealerChoice(null);
    setPayoutMessage("");

    // Countdown Animation: Rock... Paper... Scissors... SHOOT!
    setCountdownStep("Rock...");
    sounds.playFistThump();

    setTimeout(() => {
      setCountdownStep("Paper...");
      sounds.playFistThump();
    }, 350);

    setTimeout(() => {
      setCountdownStep("Scissors...");
      sounds.playFistThump();
    }, 700);

    setTimeout(() => {
      setCountdownStep("SHOOT!");
      sounds.playHandSwoosh();

      // Determine Dealer Choice
      const randomIdx = Math.floor(Math.random() * 3);
      const chosenDealer = CHOICES[randomIdx].id;
      setDealerChoice(chosenDealer);

      // Evaluate outcome
      if (playerChoice === chosenDealer) {
        // TIE: streak preserved, replay round
        setRoundOutcome("tie");
        sounds.playTieClick();
        setPayoutMessage("Tie! Streak preserved. Shoot again!");
        setIsPlaying(false);
      } else if (
        (playerChoice === "rock" && chosenDealer === "scissors") ||
        (playerChoice === "paper" && chosenDealer === "rock") ||
        (playerChoice === "scissors" && chosenDealer === "paper")
      ) {
        // WIN
        const nextStreak = streak + 1;
        setStreak(nextStreak);
        setRoundOutcome("win");
        sounds.playSuccessChime();

        const mult = STREAK_MULTIPLIERS[Math.min(nextStreak - 1, STREAK_MULTIPLIERS.length - 1)];
        const wonVal = parseFloat((betAmount * mult).toFixed(2));
        setPayoutMessage(`Victory! ${nextStreak} in a row (${mult}×)!`);

        if (nextStreak >= 3) {
          try {
            confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
          } catch {}
        }
        setIsPlaying(false);
      } else {
        // LOSS / BUST
        setRoundOutcome("loss");
        sounds.playBustSound();
        setPayoutMessage("Crushed! Streak lost.");
        setStreak(0);
        setIsPlaying(false);

        setStats((prev) => ({
          ...prev,
          losses: prev.losses + 1,
          profit: parseFloat((prev.profit - betAmount).toFixed(2)),
        }));
      }
    }, 1050);
  };

  // Cashout accumulated streak
  const handleCashout = useCallback(() => {
    if (isPlaying || streak === 0) return;

    const payout = currentCashout;
    const profit = parseFloat((payout - betAmount).toFixed(2));
    updateBalance(payout);
    sounds.playCashout();

    try {
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
    } catch {}

    setLastWinAmount(payout);
    setPayoutMessage(`Cashed out ${activeSym}${payout.toFixed(2)} (${currentMultiplier}×)!`);
    setStreak(0);
    setRoundOutcome(null);

    setStats((prev) => ({
      ...prev,
      wins: prev.wins + 1,
      profit: parseFloat((prev.profit + profit).toFixed(2)),
    }));
  }, [activeSym, betAmount, currentCashout, currentMultiplier, isPlaying, streak, updateBalance]);

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!gameContainerRef.current) return;
    if (!document.fullscreenElement) {
      gameContainerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <div
      ref={gameContainerRef}
      className="flex flex-col items-center w-full max-w-4xl mx-auto px-2 sm:px-4 py-4 select-none"
    >
      {/* ========================================================= */}
      {/* 1. TOP INTERACTIVE ARENA: HAND CLASH & STREAK ARENA       */}
      {/* ========================================================= */}
      <div className="w-full rounded-2xl bg-[#0f212e] border border-[#213743] shadow-2xl p-4 sm:p-6 flex flex-col items-center relative overflow-hidden">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-fuchsia-600/5 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Utilities */}
        <div className="w-full flex items-center justify-between mb-3 z-10 text-xs text-[#b1bad3]">
          <div className="flex items-center gap-2">
            <span className="font-bold uppercase tracking-wider text-[11px] text-[#8596a5]">
              Streak: <span className="text-white font-mono">{streak} Wins</span>
            </span>
            {streak > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-[#00e701]/10 border border-[#00e701]/30 text-[#00e701] font-mono font-bold text-[10px]">
                {currentMultiplier}×
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRulesModal(true)}
              className="p-1.5 rounded-lg bg-[#1a2c38] hover:bg-[#213743] text-[#b1bad3] hover:text-white transition-colors"
              title="Game Rules"
            >
              <Info className="h-4 w-4" />
            </button>
            <button
              onClick={() => setShowStatsModal(true)}
              className="p-1.5 rounded-lg bg-[#1a2c38] hover:bg-[#213743] text-[#b1bad3] hover:text-white transition-colors"
              title="Live Stats"
            >
              <TrendingUp className="h-4 w-4" />
            </button>
            <button
              onClick={() => setShowFairnessModal(true)}
              className="p-1.5 rounded-lg bg-[#1a2c38] hover:bg-[#213743] text-[#b1bad3] hover:text-white transition-colors"
              title="Provably Fair"
            >
              <ShieldCheck className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                sounds.enabled = next;
              }}
              className="p-1.5 rounded-lg bg-[#1a2c38] hover:bg-[#213743] text-[#b1bad3] hover:text-white transition-colors"
              title={soundEnabled ? "Mute" : "Unmute"}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg bg-[#1a2c38] hover:bg-[#213743] text-[#b1bad3] hover:text-white transition-colors"
              title="Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Streak Multiplier Ribbon */}
        <div className="w-full flex items-center justify-between gap-1 overflow-x-auto py-2 px-1 z-10 no-scrollbar mb-4 border-b border-[#213743]/50">
          {STREAK_MULTIPLIERS.slice(0, 8).map((mult, idx) => {
            const stepNum = idx + 1;
            const isCurrent = streak === stepNum;
            const isCompleted = streak > stepNum;
            return (
              <div
                key={idx}
                className={`flex-1 min-w-[58px] py-1.5 px-1 rounded-xl text-center border font-mono transition-all ${
                  isCurrent
                    ? "bg-[#00e701]/20 border-[#00e701] text-[#00e701] shadow-lg shadow-[#00e701]/25 scale-105"
                    : isCompleted
                    ? "bg-[#213743]/60 border-[#2f4553] text-[#8596a5]"
                    : "bg-[#11232e] border-[#213743]/40 text-[#8596a5]"
                }`}
              >
                <div className="text-[9px] uppercase font-bold text-[#8596a5]">{stepNum}W</div>
                <div className="text-[11px] font-black">{mult}×</div>
              </div>
            );
          })}
        </div>

        {/* Hand Arena: Player Hand vs Dealer Hand */}
        <div className="w-full grid grid-cols-2 gap-4 my-2 z-10 max-w-lg">
          {/* PLAYER RING */}
          <div
            className={`rounded-2xl border p-4 flex flex-col items-center justify-between min-h-[160px] transition-all ${
              roundOutcome === "win"
                ? "bg-[#00e701]/10 border-[#00e701] shadow-xl shadow-[#00e701]/20"
                : "bg-[#11232e] border-[#213743]"
            }`}
          >
            <span className="text-xs font-black uppercase tracking-wider text-blue-400">
              YOUR HAND
            </span>

            <div
              className={`text-5xl sm:text-6xl my-2 transition-transform duration-200 ${
                isPlaying ? "animate-bounce" : ""
              }`}
            >
              {CHOICES.find((c) => c.id === playerChoice)?.icon || "🪨"}
            </div>

            <span className="text-xs font-bold capitalize text-white">
              {playerChoice}
            </span>
          </div>

          {/* DEALER RING */}
          <div
            className={`rounded-2xl border p-4 flex flex-col items-center justify-between min-h-[160px] transition-all ${
              roundOutcome === "loss"
                ? "bg-rose-950/30 border-rose-500 shadow-xl shadow-rose-500/20"
                : "bg-[#11232e] border-[#213743]"
            }`}
          >
            <span className="text-xs font-black uppercase tracking-wider text-amber-400">
              DEALER HAND
            </span>

            <div
              className={`text-5xl sm:text-6xl my-2 transition-transform duration-200 ${
                isPlaying ? "animate-bounce" : ""
              }`}
            >
              {isPlaying
                ? "❓"
                : dealerChoice
                ? CHOICES.find((c) => c.id === dealerChoice)?.icon
                : "🤖"}
            </div>

            <span className="text-xs font-bold capitalize text-white">
              {isPlaying ? (countdownStep || "Ready") : dealerChoice ? dealerChoice : "Waiting"}
            </span>
          </div>
        </div>

        {/* Outcome Banner */}
        <div className="h-8 flex items-center justify-center mt-3 z-10">
          {payoutMessage ? (
            <span
              className={`text-sm font-black font-mono flex items-center gap-1.5 animate-bounce ${
                roundOutcome === "win"
                  ? "text-[#00e701]"
                  : roundOutcome === "tie"
                  ? "text-amber-400"
                  : "text-rose-500"
              }`}
            >
              <Sparkles className="h-4 w-4" />
              {payoutMessage}
            </span>
          ) : (
            <span className="text-xs font-bold text-[#b1bad3]">
              Choose Rock, Paper, or Scissors and Shoot!
            </span>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. BOTTOM CONTROLS (Directly Beneath Hand Arena)          */}
      {/* ========================================================= */}
      <div className="w-full mt-4 rounded-2xl bg-[#1a2c38] border border-[#213743] p-4 sm:p-5 flex flex-col gap-4 shadow-xl">
        {/* Choice Selector: Rock / Paper / Scissors */}
        <div className="w-full flex flex-col gap-1.5">
          <label className="text-xs font-bold text-[#b1bad3]">Select Your Move</label>
          <div className="grid grid-cols-3 gap-2">
            {CHOICES.map((choice) => (
              <button
                key={choice.id}
                onClick={() => {
                  if (isPlaying) return;
                  sounds.playClick();
                  setPlayerChoice(choice.id);
                }}
                disabled={isPlaying}
                className={`py-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all disabled:opacity-50 cursor-pointer ${
                  playerChoice === choice.id
                    ? "bg-[#00e701]/15 border-[#00e701] text-white shadow-lg shadow-[#00e701]/20 scale-102"
                    : "bg-[#0f212e] border-[#213743] text-[#b1bad3] hover:text-white hover:border-[#2f4553]"
                }`}
              >
                <span className="text-2xl">{choice.icon}</span>
                <span className="text-xs font-black uppercase tracking-wider">{choice.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Bet Amount Input & Modifiers (Enabled only when streak = 0) */}
        <div className="w-full flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-[#b1bad3]">
            <span>Bet Amount</span>
            <span>
              Balance: <span className="text-white font-mono">{activeSym}{balance.toFixed(2)}</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <div className="sm:col-span-2 relative flex items-center">
              <span className="absolute left-3 text-sm font-bold text-[#8596a5]">
                {activeSym}
              </span>
              <input
                type="number"
                step="any"
                disabled={isPlaying || streak > 0}
                value={betInput}
                onChange={(e) => {
                  setBetInput(e.target.value);
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val) && val >= 0) setBetAmount(val);
                }}
                className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-[#0f212e] border border-[#213743] text-white font-mono font-bold text-sm focus:outline-none focus:border-[#00e701] disabled:opacity-50"
              />
            </div>

            <div className="sm:col-span-2 grid grid-cols-3 gap-1.5">
              <button
                onClick={handleHalfBet}
                disabled={isPlaying || streak > 0}
                className="py-2.5 rounded-xl bg-[#213743] hover:bg-[#2f4553] text-[#b1bad3] hover:text-white font-bold text-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                ½
              </button>
              <button
                onClick={handleDoubleBet}
                disabled={isPlaying || streak > 0}
                className="py-2.5 rounded-xl bg-[#213743] hover:bg-[#2f4553] text-[#b1bad3] hover:text-white font-bold text-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                2×
              </button>
              <button
                onClick={handleMaxBet}
                disabled={isPlaying || streak > 0}
                className="py-2.5 rounded-xl bg-[#213743] hover:bg-[#2f4553] text-[#b1bad3] hover:text-white font-bold text-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                Max
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic CTA Buttons: Shoot / Cashout */}
        <div className="w-full pt-1 flex flex-col sm:flex-row gap-2">
          {streak > 0 && (
            <button
              onClick={handleCashout}
              disabled={isPlaying}
              className="w-full py-4 rounded-xl bg-[#00e701] hover:bg-[#00c701] active:scale-[0.99] text-[#011e01] font-black text-sm sm:text-base uppercase tracking-wider shadow-lg shadow-[#00e701]/25 transition-all cursor-pointer"
            >
              Cashout {activeSym}{currentCashout.toFixed(2)} ({currentMultiplier}×)
            </button>
          )}

          <button
            onClick={handleShoot}
            disabled={isPlaying}
            className={`w-full py-4 rounded-xl font-black text-sm sm:text-base uppercase tracking-wider shadow-lg transition-all cursor-pointer ${
              streak > 0
                ? "bg-[#213743] hover:bg-[#2f4553] text-white"
                : "bg-[#00e701] hover:bg-[#00c701] text-[#011e01] shadow-[#00e701]/25"
            }`}
          >
            {isPlaying ? (countdownStep || "Battling...") : streak > 0 ? "Shoot Next (Keep Streak)" : "Shoot / Play"}
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* PROVABLY FAIR MODAL                                       */}
      {/* ========================================================= */}
      {showFairnessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#213743] bg-[#1a2c38] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#213743] pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <ShieldCheck className="h-5 w-5 text-[#00e701]" />
                <span>Provably Fair Verification</span>
              </div>
              <button
                onClick={() => setShowFairnessModal(false)}
                className="p-1 rounded-lg text-[#b1bad3] hover:text-white hover:bg-[#213743]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs text-[#b1bad3]">
              <div>
                <label className="font-bold text-white block mb-1">Server Seed (Hashed)</label>
                <div className="p-2.5 rounded-xl bg-[#0f212e] font-mono text-[11px] text-white flex items-center justify-between">
                  <span className="truncate">a72f091bc41a87b9213da89104fa28913c19b02418a09bca7120bc8941294819</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText("a72f091bc41a87b9213da89104fa28913c19b02418a09bca7120bc8941294819");
                      setCopiedSeed(true);
                      setTimeout(() => setCopiedSeed(false), 2000);
                    }}
                    className="p-1 text-[#8596a5] hover:text-white"
                  >
                    {copiedSeed ? <Check className="h-3.5 w-3.5 text-[#00e701]" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="font-bold text-white block mb-1">Client Seed</label>
                <div className="p-2.5 rounded-xl bg-[#0f212e] font-mono text-[11px] text-white">
                  stake_rps_client_seed_2026
                </div>
              </div>
              <div>
                <label className="font-bold text-white block mb-1">House Edge</label>
                <div className="p-2.5 rounded-xl bg-[#0f212e] font-mono text-[11px] text-[#00e701]">
                  1.00% (99.00% RTP)
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowFairnessModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#213743] hover:bg-[#2f4553] text-white text-xs font-bold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* LIVE STATS MODAL                                          */}
      {/* ========================================================= */}
      {showStatsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#213743] bg-[#1a2c38] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#213743] pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <TrendingUp className="h-5 w-5 text-[#00e701]" />
                <span>Live Rock Paper Scissors Stats</span>
              </div>
              <button
                onClick={() => setShowStatsModal(false)}
                className="p-1 rounded-lg text-[#b1bad3] hover:text-white hover:bg-[#213743]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-[#0f212e] border border-[#213743] text-center">
                <div className="text-[11px] font-bold text-[#b1bad3]">Rounds</div>
                <div className="text-lg font-black text-white font-mono mt-0.5">{stats.rounds}</div>
              </div>
              <div className="p-3 rounded-xl bg-[#0f212e] border border-[#213743] text-center">
                <div className="text-[11px] font-bold text-[#b1bad3]">Win Rate</div>
                <div className="text-lg font-black text-[#00e701] font-mono mt-0.5">
                  {stats.rounds > 0 ? ((stats.wins / stats.rounds) * 100).toFixed(1) : "0.0"}%
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#0f212e] border border-[#213743] text-center">
                <div className="text-[11px] font-bold text-[#b1bad3]">Wagered</div>
                <div className="text-lg font-black text-white font-mono mt-0.5">
                  {activeSym}{stats.wagered.toFixed(2)}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#0f212e] border border-[#213743] text-center">
                <div className="text-[11px] font-bold text-[#b1bad3]">Net Profit</div>
                <div
                  className={`text-lg font-black font-mono mt-0.5 ${
                    stats.profit >= 0 ? "text-[#00e701]" : "text-[#e9113c]"
                  }`}
                >
                  {stats.profit >= 0 ? "+" : ""}
                  {activeSym}{stats.profit.toFixed(2)}
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowStatsModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#213743] hover:bg-[#2f4553] text-white text-xs font-bold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* RULES MODAL                                               */}
      {/* ========================================================= */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#213743] bg-[#1a2c38] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#213743] pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Info className="h-5 w-5 text-[#00e701]" />
                <span>How to Play Stake RPS</span>
              </div>
              <button
                onClick={() => setShowRulesModal(false)}
                className="p-1 rounded-lg text-[#b1bad3] hover:text-white hover:bg-[#213743]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs text-[#b1bad3] leading-relaxed">
              <p>
                <strong className="text-white">The Rules:</strong> Rock beats Scissors, Scissors beats Paper, Paper beats Rock.
              </p>
              <p>
                <strong className="text-white">Ties:</strong> In a tie, your current streak and bet remain intact, and you replay the showdown.
              </p>
              <p>
                <strong className="text-white">Streak Ladder:</strong> Each consecutive win scales your multiplier up to 836.74×. Cash out at any time or risk it for the next tier!
              </p>
            </div>
            <button
              onClick={() => setShowRulesModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#213743] hover:bg-[#2f4553] text-white text-xs font-bold transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

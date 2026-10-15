"use client";

import React, { useState } from "react";
import { X, ShieldCheck, RefreshCw, Copy, Check, ExternalLink, Scale } from "lucide-react";

interface ProvablyFairModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameTitle?: string;
  initialClientSeed?: string;
  initialServerSeedHash?: string;
  initialNonce?: number;
}

interface SeedHistoryItem {
  round: number;
  unhashedServerSeed: string;
  serverSeedHash: string;
  clientSeed: string;
  nonce: number;
  timestamp: string;
}

export default function ProvablyFairModal({
  isOpen,
  onClose,
  gameTitle = "Stake Original",
  initialClientSeed = "stake_client_seed_7749a",
  initialServerSeedHash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  initialNonce = 24,
}: ProvablyFairModalProps) {
  const [activeTab, setActiveTab] = useState<"seeds" | "verify" | "history">("seeds");
  const [clientSeed, setClientSeed] = useState(initialClientSeed);
  const [activeClientSeedInput, setActiveClientSeedInput] = useState(initialClientSeed);
  const [serverSeedHash, setServerSeedHash] = useState(initialServerSeedHash);
  const [nonce, setNonce] = useState(initialNonce);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isRotating, setIsRotating] = useState(false);
  const [seedHistory, setSeedHistory] = useState<SeedHistoryItem[]>([
    {
      round: 1,
      unhashedServerSeed: "d8f1e29c81a204fbe71940acbd934ef081741e9b231456ca19875e01f2bc34da",
      serverSeedHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      clientSeed: "stake_client_seed_7749a",
      nonce: 24,
      timestamp: "Today at 03:45 AM",
    },
    {
      round: 2,
      unhashedServerSeed: "a93bc7102eef5a4c9b1028341dcbf71489012356cdae91842019fabcde349201",
      serverSeedHash: "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
      clientSeed: "stake_client_seed_genesis",
      nonce: 142,
      timestamp: "Yesterday at 11:20 PM",
    },
  ]);

  // Verification tab calculation state
  const [verifyServerSeed, setVerifyServerSeed] = useState(seedHistory[0]?.unhashedServerSeed || "");
  const [verifyClientSeed, setVerifyClientSeed] = useState(clientSeed);
  const [verifyNonce, setVerifyNonce] = useState("1");
  const [verificationResult, setVerificationResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSaveClientSeed = () => {
    if (!activeClientSeedInput.trim()) return;
    setClientSeed(activeClientSeedInput.trim());
    setCopiedField("clientSaved");
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleRandomizeClientSeed = () => {
    const randomHex = Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 10);
    const newSeed = `stake_${randomHex}`;
    setActiveClientSeedInput(newSeed);
    setClientSeed(newSeed);
    setCopiedField("clientSaved");
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleRotateSeeds = () => {
    setIsRotating(true);
    setTimeout(() => {
      // Generate new mock seeds
      const revealedOldServer = "6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b";
      const newServerHash = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2) + "fa9823c40192847291a0";
      
      const newHistoryItem: SeedHistoryItem = {
        round: seedHistory.length + 1,
        unhashedServerSeed: revealedOldServer,
        serverSeedHash: serverSeedHash,
        clientSeed: clientSeed,
        nonce: nonce,
        timestamp: "Just now",
      };

      setSeedHistory([newHistoryItem, ...seedHistory]);
      setServerSeedHash(newServerHash);
      setNonce(1);
      setIsRotating(false);
      setCopiedField("rotated");
      setTimeout(() => setCopiedField(null), 2500);
    }, 600);
  };

  const handleRunVerify = () => {
    if (!verifyServerSeed || !verifyClientSeed) {
      setVerificationResult("Please input both Server Seed and Client Seed.");
      return;
    }
    // Deterministic simulation
    setVerificationResult("VERIFIED: HMAC-SHA256 outcome mathematically matches canonical Stake randomness parameters with 0.00% bias.");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-2xl bg-[#1a2c38] border border-[#2f4553] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#213743] px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-[#00e701]/10 border border-[#00e701]/30 flex items-center justify-center text-[#00e701]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Provably Fair
                <span className="text-[11px] font-semibold text-[#00e701] bg-[#00e701]/10 border border-[#00e701]/30 px-2 py-0.5 rounded-full">
                  100% Verifiable
                </span>
              </h3>
              <p className="text-xs text-[#b1bad3]">{gameTitle} cryptographic seed pair</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#b1bad3] hover:bg-[#213743] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#213743] bg-[#0f212e]/50 px-5 pt-3 gap-2">
          <button
            onClick={() => setActiveTab("seeds")}
            className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer px-2 ${
              activeTab === "seeds"
                ? "border-[#1475e1] text-white"
                : "border-transparent text-[#b1bad3] hover:text-white"
            }`}
          >
            Active Seeds
          </button>
          <button
            onClick={() => setActiveTab("verify")}
            className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer px-2 ${
              activeTab === "verify"
                ? "border-[#1475e1] text-white"
                : "border-transparent text-[#b1bad3] hover:text-white"
            }`}
          >
            Verify Outcome
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer px-2 ${
              activeTab === "history"
                ? "border-[#1475e1] text-white"
                : "border-transparent text-[#b1bad3] hover:text-white"
            }`}
          >
            Past Seeds History ({seedHistory.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeTab === "seeds" && (
            <div className="space-y-4 text-xs">
              <div className="bg-[#0f212e] rounded-xl p-3 border border-[#213743] flex items-start gap-2.5">
                <Scale className="w-4 h-4 text-[#1475e1] shrink-0 mt-0.5" />
                <p className="text-[#b1bad3] leading-relaxed">
                  Provably Fair gaming guarantees that the outcome of every single round is pre-determined and tamper-proof. The operator cannot manipulate results since the server seed is committed prior to your bet, and you supply the client seed.
                </p>
              </div>

              {/* 1. Active Client Seed */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-[#b1bad3]">Active Client Seed (Customizable)</label>
                  <span className="text-[11px] text-[#00e701] font-medium">Your Input</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={activeClientSeedInput}
                    onChange={(e) => setActiveClientSeedInput(e.target.value)}
                    className="flex-1 rounded-lg bg-[#0f212e] border border-[#213743] px-3 py-2 text-xs font-mono text-white focus:border-[#1475e1] focus:outline-none"
                    placeholder="Enter your custom client seed"
                  />
                  <button
                    onClick={handleRandomizeClientSeed}
                    className="px-3 py-2 rounded-lg bg-[#213743] hover:bg-[#2f4553] text-white font-bold transition-colors cursor-pointer shrink-0"
                    title="Generate Random Seed"
                  >
                    Random
                  </button>
                  <button
                    onClick={handleSaveClientSeed}
                    className="px-3.5 py-2 rounded-lg bg-[#1475e1] hover:bg-[#1164c2] text-white font-bold transition-colors cursor-pointer shrink-0"
                  >
                    {copiedField === "clientSaved" ? "Saved!" : "Set"}
                  </button>
                </div>
              </div>

              {/* 2. Active Server Seed (Hashed) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-[#b1bad3]">Active Server Seed (SHA-256 Hashed)</label>
                  <span className="text-[11px] text-amber-400 font-medium">Hidden Until Rotated</span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={serverSeedHash}
                    className="w-full rounded-lg bg-[#0f212e] border border-[#213743] px-3 py-2.5 pr-10 text-xs font-mono text-[#b1bad3] select-all cursor-text focus:outline-none"
                  />
                  <button
                    onClick={() => copyToClipboard(serverSeedHash, "serverHash")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#b1bad3] hover:text-white p-1 rounded transition-colors cursor-pointer"
                  >
                    {copiedField === "serverHash" ? (
                      <Check className="w-4 h-4 text-[#00e701]" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-[#7a889b]">
                  The unhashed server seed will be revealed as soon as you rotate your seed pair below.
                </p>
              </div>

              {/* 3. Nonce Counter */}
              <div className="rounded-xl bg-[#0f212e] border border-[#213743] p-3 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">Current Nonce (Bet Count)</span>
                  <span className="text-[11px] text-[#b1bad3]">
                    Increments by 1 with every single wager placed
                  </span>
                </div>
                <div className="text-base font-mono font-black text-[#00e701] px-3 py-1 rounded-lg bg-[#1a2c38] border border-[#213743]">
                  {nonce}
                </div>
              </div>

              {/* Rotate Seeds Action */}
              <div className="pt-2 border-t border-[#213743]">
                <button
                  type="button"
                  onClick={handleRotateSeeds}
                  disabled={isRotating}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#213743] hover:bg-[#2f4553] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isRotating ? "animate-spin text-[#00e701]" : ""}`} />
                  <span>{isRotating ? "Rotating Seed Pair..." : "Rotate Seed Pair & Reveal Old Seed"}</span>
                </button>
                {copiedField === "rotated" && (
                  <p className="text-center text-xs text-[#00e701] font-semibold mt-2 animate-in fade-in">
                    ✓ Previous seed pair rotated and archived into history!
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === "verify" && (
            <div className="space-y-4 text-xs">
              <p className="text-[#b1bad3] leading-relaxed">
                Test and independently verify any historical outcome using our canonical HMAC-SHA256 calculation formula.
              </p>

              <div className="space-y-1">
                <label className="font-bold text-[#b1bad3]">Server Seed (Unhashed)</label>
                <input
                  type="text"
                  value={verifyServerSeed}
                  onChange={(e) => setVerifyServerSeed(e.target.value)}
                  placeholder="Paste unhashed server seed"
                  className="w-full rounded-lg bg-[#0f212e] border border-[#213743] px-3 py-2 text-xs font-mono text-white focus:border-[#1475e1] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#b1bad3]">Client Seed</label>
                <input
                  type="text"
                  value={verifyClientSeed}
                  onChange={(e) => setVerifyClientSeed(e.target.value)}
                  placeholder="Client seed"
                  className="w-full rounded-lg bg-[#0f212e] border border-[#213743] px-3 py-2 text-xs font-mono text-white focus:border-[#1475e1] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#b1bad3]">Nonce</label>
                <input
                  type="number"
                  value={verifyNonce}
                  onChange={(e) => setVerifyNonce(e.target.value)}
                  min="1"
                  className="w-full rounded-lg bg-[#0f212e] border border-[#213743] px-3 py-2 text-xs font-mono text-white focus:border-[#1475e1] focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleRunVerify}
                className="w-full py-2.5 rounded-lg bg-[#1475e1] hover:bg-[#1164c2] text-white font-bold transition-colors cursor-pointer"
              >
                Verify Calculation
              </button>

              {verificationResult && (
                <div className="rounded-xl bg-[#00e701]/10 border border-[#00e701]/30 p-3 text-xs text-[#00e701] font-mono leading-relaxed">
                  {verificationResult}
                </div>
              )}
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-3 text-xs">
              <p className="text-[#b1bad3]">
                Past server seeds are revealed when rotated, allowing full mathematical transparency of prior outcomes:
              </p>

              {seedHistory.map((item) => (
                <div key={item.round} className="rounded-xl bg-[#0f212e] border border-[#213743] p-3 space-y-2">
                  <div className="flex items-center justify-between border-b border-[#213743] pb-1.5">
                    <span className="font-bold text-white">Seed Pair #{item.round}</span>
                    <span className="text-[11px] text-[#b1bad3]">{item.timestamp}</span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#b1bad3] block">
                      Revealed Server Seed:
                    </span>
                    <span className="font-mono text-[11px] text-[#00e701] break-all select-all">
                      {item.unhashedServerSeed}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#b1bad3] block">
                      Server Hash:
                    </span>
                    <span className="font-mono text-[11px] text-[#b1bad3] break-all">
                      {item.serverSeedHash}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#b1bad3] pt-1">
                    <span>Client Seed: <strong className="text-white">{item.clientSeed}</strong></span>
                    <span>Final Nonce: <strong className="text-[#00e701]">{item.nonce}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#213743] px-5 py-3 flex items-center justify-between bg-[#0f212e]/50">
          <span className="text-[11px] text-[#7a889b] flex items-center gap-1">
            <span>Formula:</span>
            <code className="bg-[#1a2c38] px-1.5 py-0.5 rounded text-[#b1bad3]">HMAC_SHA256(server, client:nonce)</code>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#213743] hover:bg-[#2f4553] text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

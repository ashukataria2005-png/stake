"use client";

import React, { useState } from "react";
import {
  X,
  Wallet,
  Copy,
  Check,
  QrCode,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  CreditCard,
  History,
  ShieldCheck,
  Plus,
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import { sounds } from "@/utils/audio";
import confetti from "canvas-confetti";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TransactionRecord {
  id: string;
  type: "Deposit" | "Withdraw";
  amount: number;
  asset: string;
  date: string;
  hash: string;
  status: "Confirmed" | "Processing";
}

export default function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { balance, updateBalance, currency, formatBalance } = useGame();

  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw" | "buy" | "transactions">("deposit");
  const [selectedAsset, setSelectedAsset] = useState<string>("USDT");
  const [selectedNetwork, setSelectedNetwork] = useState<string>("TRC-20");
  const [copied, setCopied] = useState<boolean>(false);

  // Withdraw state
  const [withdrawAddress, setWithdrawAddress] = useState<string>("");
  const [withdrawAmount, setWithdrawAmount] = useState<number>(50);
  const [withdrawSuccessMsg, setWithdrawSuccessMsg] = useState<string>("");

  // Transactions ledger state
  const [transactions, setTransactions] = useState<TransactionRecord[]>([
    {
      id: "tx-1",
      type: "Deposit",
      amount: 1000.0,
      asset: "USDT",
      date: "Oct 05, 2026 22:15",
      hash: "0x7a8f...39b1",
      status: "Confirmed",
    },
    {
      id: "tx-2",
      type: "Deposit",
      amount: 500.0,
      asset: "USDT",
      date: "Oct 05, 2026 20:30",
      hash: "0x3e12...88aa",
      status: "Confirmed",
    },
  ]);

  const depositAddress = "TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE";

  const handleCopy = () => {
    navigator.clipboard.writeText(depositAddress);
    setCopied(true);
    sounds.playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleQuickRefill = (amt: number) => {
    updateBalance(amt);
    sounds.playDiceWin();
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#00e701", "#ffffff", "#1475e1"],
      });
    } catch {}

    const newTx: TransactionRecord = {
      id: `tx-${Date.now()}`,
      type: "Deposit",
      amount: amt,
      asset: selectedAsset,
      date: "Just now",
      hash: `0x${Math.random().toString(16).substring(2, 6)}...${Math.random().toString(16).substring(2, 6)}`,
      status: "Confirmed",
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAddress.trim()) {
      alert("Please enter a valid destination address.");
      return;
    }
    const totalDeduction = withdrawAmount + 1.0; // $1 network fee
    if (totalDeduction > balance) {
      alert("Insufficient balance for withdrawal including network fee!");
      return;
    }

    updateBalance(-totalDeduction);
    sounds.playCashout();

    const newTx: TransactionRecord = {
      id: `tx-${Date.now()}`,
      type: "Withdraw",
      amount: withdrawAmount,
      asset: selectedAsset,
      date: "Just now",
      hash: `0x${Math.random().toString(16).substring(2, 6)}...${Math.random().toString(16).substring(2, 6)}`,
      status: "Confirmed",
    };
    setTransactions((prev) => [newTx, ...prev]);

    setWithdrawSuccessMsg(
      `Withdrawal of $${withdrawAmount.toFixed(2)} ${selectedAsset} confirmed! Fee: $1.00.`
    );
    setTimeout(() => setWithdrawSuccessMsg(""), 4000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-xl rounded-2xl border border-[#213743] bg-[#1a2c38] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#213743] p-4 bg-[#14232f]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00e701]/15 text-[#00e701]">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Crypto Wallet</h3>
              <p className="text-xs text-[#b1bad3]">
                Balance:{" "}
                <span className="font-mono text-[#00e701] font-bold">
                  ${formatBalance(balance)} {currency}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#b1bad3] hover:bg-[#213743] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#213743] bg-[#1a2c38] p-1.5 gap-1">
          {[
            { id: "deposit", label: "Deposit", icon: ArrowDownLeft },
            { id: "withdraw", label: "Withdraw", icon: ArrowUpRight },
            { id: "buy", label: "Buy Crypto", icon: CreditCard },
            { id: "transactions", label: "History", icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  sounds.playClick();
                  setActiveTab(tab.id as any);
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-[#213743] text-[#00e701] shadow-sm border border-[#00e701]/30"
                    : "text-[#b1bad3] hover:text-white hover:bg-[#213743]/50"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Content Area */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* TAB 1: DEPOSIT */}
          {activeTab === "deposit" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Asset & Network Selectors */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#b1bad3]">
                    Deposit Currency
                  </label>
                  <select
                    value={selectedAsset}
                    onChange={(e) => setSelectedAsset(e.target.value)}
                    className="w-full rounded-xl border border-[#213743] bg-[#0f212e] px-3 py-2 text-xs font-bold text-white focus:border-[#00e701] focus:outline-none"
                  >
                    {["USDT", "BTC", "ETH", "SOL", "LTC", "DOGE", "TRX", "INR"].map((a) => (
                      <option key={a} value={a} className="bg-[#1a2c38]">
                        {a}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#b1bad3]">
                    Network
                  </label>
                  <select
                    value={selectedNetwork}
                    onChange={(e) => setSelectedNetwork(e.target.value)}
                    className="w-full rounded-xl border border-[#213743] bg-[#0f212e] px-3 py-2 text-xs font-bold text-white focus:border-[#00e701] focus:outline-none"
                  >
                    {["TRC-20", "ERC-20", "BEP-20", "Polygon", "Solana"].map((n) => (
                      <option key={n} value={n} className="bg-[#1a2c38]">
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* QR Code & Address Box */}
              <div className="rounded-2xl border border-[#213743] bg-[#0f212e] p-4 flex flex-col items-center space-y-3">
                {/* Styled SVG QR Code */}
                <div className="w-36 h-36 bg-white rounded-xl p-2 flex items-center justify-center shadow-lg relative">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    {/* Corner squares */}
                    <rect x="5" y="5" width="25" height="25" fill="#0f212e" />
                    <rect x="10" y="10" width="15" height="15" fill="#ffffff" />
                    <rect x="13" y="13" width="9" height="9" fill="#0f212e" />

                    <rect x="70" y="5" width="25" height="25" fill="#0f212e" />
                    <rect x="75" y="10" width="15" height="15" fill="#ffffff" />
                    <rect x="78" y="13" width="9" height="9" fill="#0f212e" />

                    <rect x="5" y="70" width="25" height="25" fill="#0f212e" />
                    <rect x="10" y="75" width="15" height="15" fill="#ffffff" />
                    <rect x="13" y="78" width="9" height="9" fill="#0f212e" />

                    {/* Random pattern matrix */}
                    <rect x="35" y="10" width="6" height="6" fill="#0f212e" />
                    <rect x="45" y="15" width="6" height="6" fill="#0f212e" />
                    <rect x="55" y="10" width="6" height="6" fill="#0f212e" />
                    <rect x="35" y="25" width="6" height="6" fill="#0f212e" />
                    <rect x="50" y="30" width="6" height="6" fill="#0f212e" />
                    <rect x="60" y="25" width="6" height="6" fill="#0f212e" />
                    <rect x="15" y="45" width="6" height="6" fill="#0f212e" />
                    <rect x="25" y="55" width="6" height="6" fill="#0f212e" />
                    <rect x="45" y="45" width="10" height="10" fill="#00e701" />
                    <rect x="70" y="40" width="6" height="6" fill="#0f212e" />
                    <rect x="80" y="50" width="6" height="6" fill="#0f212e" />
                    <rect x="35" y="75" width="6" height="6" fill="#0f212e" />
                    <rect x="55" y="70" width="6" height="6" fill="#0f212e" />
                    <rect x="45" y="85" width="6" height="6" fill="#0f212e" />
                    <rect x="75" y="75" width="6" height="6" fill="#0f212e" />
                  </svg>
                </div>

                <div className="w-full space-y-1 text-center">
                  <div className="text-[10px] uppercase font-bold text-[#b1bad3]">
                    Your {selectedAsset} Deposit Address ({selectedNetwork})
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-[#213743] bg-[#1a2c38] px-3 py-2">
                    <span className="font-mono text-xs text-white truncate flex-1 text-left">
                      {depositAddress}
                    </span>
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1 rounded-lg bg-[#213743] px-2.5 py-1 text-xs font-bold text-white hover:bg-[#2f4553] transition-colors"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-[#00e701]" />
                          <span className="text-[#00e701]">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Instant Demo Quick Refill Buttons */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#b1bad3]">
                  Instant Demo Quick Refill
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[100, 500, 1000, 10000].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => handleQuickRefill(amt)}
                      className="rounded-xl border border-[#213743] bg-[#0f212e] py-2.5 text-xs font-black text-white hover:border-[#00e701] hover:bg-[#213743] transition-all flex flex-col items-center"
                    >
                      <span className="text-[#00e701]">+{amt >= 1000 ? `${amt / 1000}k` : amt}</span>
                      <span className="text-[10px] text-[#b1bad3] font-mono">${amt}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WITHDRAW */}
          {activeTab === "withdraw" && (
            <form onSubmit={handleWithdrawSubmit} className="space-y-4 animate-in fade-in duration-150">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#b1bad3]">
                  Destination {selectedAsset} Address
                </label>
                <input
                  type="text"
                  required
                  placeholder={`Enter your ${selectedAsset} address...`}
                  value={withdrawAddress}
                  onChange={(e) => setWithdrawAddress(e.target.value)}
                  className="w-full rounded-xl border border-[#213743] bg-[#0f212e] px-3 py-2.5 text-xs text-white placeholder-[#b1bad3]/50 focus:border-[#00e701] focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider text-[#b1bad3]">
                  <span>Withdraw Amount</span>
                  <span className="text-[#00e701] font-mono">Max: ${formatBalance(balance)}</span>
                </div>
                <div className="flex items-center rounded-xl border border-[#213743] bg-[#0f212e] p-1.5 focus-within:border-[#00e701]">
                  <span className="px-2 text-xs font-bold text-[#00e701]">$</span>
                  <input
                    type="number"
                    step="1"
                    min="10"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(Math.max(10, parseFloat(e.target.value) || 0))}
                    className="w-full bg-transparent text-sm font-bold text-white focus:outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setWithdrawAmount(Math.max(10, Math.floor(balance - 1.0)))}
                    className="rounded-lg px-2.5 py-1 text-xs font-bold text-[#b1bad3] hover:bg-[#213743] hover:text-white"
                  >
                    Max
                  </button>
                </div>
              </div>

              {/* Fee Breakdown */}
              <div className="rounded-xl border border-[#213743] bg-[#0f212e] p-3 text-xs space-y-1 text-[#b1bad3]">
                <div className="flex justify-between">
                  <span>Network Transaction Fee:</span>
                  <span className="font-mono text-white">$1.00 {selectedAsset}</span>
                </div>
                <div className="flex justify-between font-bold text-white pt-1 border-t border-[#213743]">
                  <span>You Will Receive:</span>
                  <span className="font-mono text-[#00e701]">
                    ${Math.max(0, withdrawAmount - 1.0).toFixed(2)} {selectedAsset}
                  </span>
                </div>
              </div>

              {withdrawSuccessMsg && (
                <div className="rounded-xl border border-[#00e701]/40 bg-[#00e701]/10 p-3 text-xs font-bold text-[#00e701] text-center">
                  {withdrawSuccessMsg}
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-xl bg-[#00e701] py-3.5 text-sm font-extrabold text-[#0f212e] shadow-lg shadow-[#00e701]/25 hover:bg-[#00c701] active:scale-95 transition-all"
              >
                Confirm Withdrawal
              </button>
            </form>
          )}

          {/* TAB 3: BUY CRYPTO */}
          {activeTab === "buy" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="rounded-2xl border border-[#213743] bg-[#0f212e] p-5 text-center space-y-3">
                <CreditCard className="h-10 w-10 text-[#00e701] mx-auto" />
                <h4 className="text-base font-black text-white">Buy Crypto with Fiat / Card</h4>
                <p className="text-xs text-[#b1bad3] max-w-sm mx-auto">
                  Stake partners with trusted payment providers (MoonPay, Banxa, Remik) to buy crypto instantly via Apple Pay, Google Pay, Visa & Mastercard.
                </p>
                <div className="pt-2 flex justify-center gap-3">
                  <button
                    onClick={() => handleQuickRefill(250)}
                    className="rounded-xl bg-[#00e701] px-5 py-2.5 text-xs font-black text-[#0f212e] hover:bg-[#00c701] transition-all"
                  >
                    Quick Demo Refill $250
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TRANSACTIONS HISTORY */}
          {activeTab === "transactions" && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#b1bad3]">
                Recent Ledger History
              </div>
              <div className="rounded-xl border border-[#213743] overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0f212e] border-b border-[#213743] text-[10px] font-bold uppercase text-[#b1bad3]">
                    <tr>
                      <th className="p-2.5">Type</th>
                      <th className="p-2.5">Amount</th>
                      <th className="p-2.5 hidden sm:table-cell">TxHash</th>
                      <th className="p-2.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#213743]/50">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-[#213743]/30">
                        <td className="p-2.5 font-bold text-white flex items-center gap-1.5">
                          {tx.type === "Deposit" ? (
                            <ArrowDownLeft className="h-3.5 w-3.5 text-[#00e701]" />
                          ) : (
                            <ArrowUpRight className="h-3.5 w-3.5 text-amber-400" />
                          )}
                          <span>{tx.type}</span>
                        </td>
                        <td className="p-2.5 font-mono font-bold text-white">
                          {tx.type === "Deposit" ? "+" : "-"}${tx.amount.toFixed(2)} {tx.asset}
                        </td>
                        <td className="p-2.5 font-mono text-[#b1bad3] hidden sm:table-cell">
                          {tx.hash}
                        </td>
                        <td className="p-2.5 text-right">
                          <span className="rounded-md bg-[#00e701]/15 px-2 py-0.5 text-[10px] font-bold text-[#00e701] border border-[#00e701]/30">
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

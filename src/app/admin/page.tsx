"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  ArrowRight,
  RefreshCw,
  Sliders,
  ShieldAlert,
  Check,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Receipt,
} from "lucide-react";
import { sounds } from "@/utils/audio";

interface MetricsData {
  totalUsers: number;
  pendingDepositsCount: number;
  pendingWithdrawalsCount: number;
  totalDepositsVolume: number;
  totalWalletsBalance: number;
}

interface RecentTx {
  id: string;
  username: string;
  type: "DEPOSIT" | "WITHDRAWAL";
  amount: number;
  currency: string;
  utrNumber?: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  method: string;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<RecentTx[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMetrics = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/metrics");
      const data = await res.json();
      if (data?.success) {
        setMetrics(data.metrics);
        setRecentTransactions(data.recentTransactions || []);
      }
    } catch (err) {
      console.error("[AdminDashboard] Error fetching metrics:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return (
    <div className="space-y-6">
      {/* Top Welcome & Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">Admin Overview</h1>
            <span className="px-2 py-0.5 rounded-full bg-[#00e701]/10 text-[#00e701] border border-[#00e701]/30 text-[10px] font-black uppercase">
              Production Terminal
            </span>
          </div>
          <p className="text-xs text-[#b1bad3] mt-0.5">
            Real-time ledger counts, player volume, and pending transaction queues from Neon PostgreSQL
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            fetchMetrics();
          }}
          disabled={isLoading}
          className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1a2c38] border border-[#213743] hover:border-[#2f4553] text-xs font-bold text-white transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[#00e701]" : ""}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Primary Metrics Grid (4 Real PostgreSQL Counts) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Registered Users */}
        <div className="p-5 rounded-2xl bg-[#1a2c38] border border-[#213743] shadow-lg space-y-3 relative overflow-hidden group hover:border-[#2f4553] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#b1bad3] uppercase tracking-wider">
              Total Users
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#1475e1]/15 text-[#1475e1] border border-[#1475e1]/30 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-white">
              {isLoading ? "..." : (metrics?.totalUsers ?? 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-[#557086] mt-0.5 font-medium flex items-center gap-1">
              <span>Verified Neon DB records</span>
            </div>
          </div>
          <Link
            href="/admin/users"
            className="text-[11px] font-bold text-[#1475e1] hover:underline flex items-center gap-1 pt-1"
          >
            <span>Manage accounts</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Metric 2: Pending Deposits Count */}
        <div className="p-5 rounded-2xl bg-[#1a2c38] border border-[#213743] shadow-lg space-y-3 relative overflow-hidden group hover:border-[#2f4553] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#b1bad3] uppercase tracking-wider">
              Pending Deposits
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Clock className="w-4 h-4 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-amber-400">
              {isLoading ? "..." : (metrics?.pendingDepositsCount ?? 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-[#557086] mt-0.5 font-medium">
              Requires UTR verification
            </div>
          </div>
          <Link
            href="/admin/transactions"
            className="text-[11px] font-bold text-amber-400 hover:underline flex items-center gap-1 pt-1"
          >
            <span>Process queue</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Metric 3: Total Approved Deposits Volume */}
        <div className="p-5 rounded-2xl bg-[#1a2c38] border border-[#213743] shadow-lg space-y-3 relative overflow-hidden group hover:border-[#2f4553] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#b1bad3] uppercase tracking-wider">
              Deposits Volume
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#00e701]/15 text-[#00e701] border border-[#00e701]/30 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-[#00e701]">
              ₹{isLoading ? "..." : (metrics?.totalDepositsVolume ?? 0).toLocaleString("en-IN")}
            </div>
            <div className="text-[11px] text-[#557086] mt-0.5 font-medium">
              Approved player inflow
            </div>
          </div>
          <span className="text-[11px] text-[#557086] block pt-1">Lifetime total</span>
        </div>

        {/* Metric 4: Total Wallets Balance Volume */}
        <div className="p-5 rounded-2xl bg-[#1a2c38] border border-[#213743] shadow-lg space-y-3 relative overflow-hidden group hover:border-[#2f4553] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#b1bad3] uppercase tracking-wider">
              Wallets Balance
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-purple-400">
              ₹{isLoading ? "..." : (metrics?.totalWalletsBalance ?? 0).toLocaleString("en-IN")}
            </div>
            <div className="text-[11px] text-[#557086] mt-0.5 font-medium">
              Active combined liquidity
            </div>
          </div>
          <span className="text-[11px] text-[#557086] block pt-1">All currencies synced</span>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Shortcut 1: Deposits & Withdrawals */}
        <Link
          href="/admin/transactions"
          className="p-5 rounded-2xl bg-[#1a2c38] border border-[#213743] hover:border-[#00e701]/50 shadow-xl flex items-center justify-between transition-all group cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#00e701]/10 text-[#00e701] border border-[#00e701]/30 flex items-center justify-center shrink-0">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-white group-hover:text-[#00e701] transition-colors">
                Deposits & Withdrawals
              </h3>
              <p className="text-xs text-[#b1bad3] mt-0.5">
                Verify UTRs, approve instant deposits, and process player payouts
              </p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#213743] flex items-center justify-center text-[#b1bad3] group-hover:text-[#00e701] group-hover:translate-x-1 transition-all">
            <ChevronRight className="w-4 h-4" />
          </div>
        </Link>

        {/* Shortcut 2: Users & Luck Controller */}
        <Link
          href="/admin/users"
          className="p-5 rounded-2xl bg-[#1a2c38] border border-[#213743] hover:border-[#1475e1]/50 shadow-xl flex items-center justify-between transition-all group cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#1475e1]/10 text-[#1475e1] border border-[#1475e1]/30 flex items-center justify-center shrink-0">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-white group-hover:text-[#1475e1] transition-colors">
                Users & Luck Controller
              </h3>
              <p className="text-xs text-[#b1bad3] mt-0.5">
                Inspect user accounts, override RTP win rates, and adjust player balances
              </p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#213743] flex items-center justify-center text-[#b1bad3] group-hover:text-[#1475e1] group-hover:translate-x-1 transition-all">
            <ChevronRight className="w-4 h-4" />
          </div>
        </Link>
      </div>

      {/* Recent Activity Table */}
      <div className="rounded-2xl bg-[#1a2c38] border border-[#213743] shadow-xl overflow-hidden space-y-4">
        <div className="px-5 py-4 border-b border-[#213743] bg-[#14232e] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black text-white">Recent Transactions Log</h3>
            <span className="text-xs text-[#557086]">• Live 5 newest entries</span>
          </div>
          <Link
            href="/admin/transactions"
            className="text-xs font-bold text-[#1475e1] hover:underline flex items-center gap-1"
          >
            <span>View all transactions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="p-4 sm:p-5 pt-0">
          {recentTransactions.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#557086]">
              No transactions recorded in database yet.
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentTransactions.map((tx) => {
                const isDeposit = tx.type === "DEPOSIT";
                const formattedDate = new Date(tx.createdAt).toLocaleString("en-IN", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={tx.id}
                    className="p-3.5 rounded-xl bg-[#0f212e] border border-[#213743] flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isDeposit
                            ? "bg-[#00e701]/10 text-[#00e701] border border-[#00e701]/20"
                            : "bg-[#1475e1]/10 text-[#1475e1] border border-[#1475e1]/20"
                        }`}
                      >
                        {isDeposit ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{tx.username}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#1a2c38] text-[#b1bad3] border border-[#213743]">
                            {tx.method}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#557086] mt-0.5">
                          {formattedDate} {tx.utrNumber ? `• UTR: ${tx.utrNumber}` : ""}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span
                        className={`font-mono font-bold ${
                          isDeposit ? "text-[#00e701]" : "text-white"
                        }`}
                      >
                        {isDeposit ? "+" : "-"} ₹{tx.amount.toLocaleString("en-IN")}
                      </span>
                      {tx.status === "APPROVED" ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-[#00e701] border border-[#00e701]/30">
                          Approved
                        </span>
                      ) : tx.status === "REJECTED" ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/30">
                          Rejected
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface GameContextType {
  balance: number;
  currency: string;
  isSidebarOpen: boolean;
  isChatOpen: boolean;
  isMounted: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleChat: () => void;
  setChatOpen: (open: boolean) => void;
  setCurrency: (currency: string) => void;
  updateBalance: (amount: number) => boolean;
  resetBalance: () => void;
  formatBalance: (val?: number) => string;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const BALANCE_STORAGE_KEY = "stake_clone_balance";
const CURRENCY_STORAGE_KEY = "stake_clone_currency";
const DEFAULT_BALANCE = 1000.00;

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [balance, setBalance] = useState<number>(DEFAULT_BALANCE);
  const [currency, setCurrencyState] = useState<string>("USDT");
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Hydrate state from localStorage safely on client
  useEffect(() => {
    setIsMounted(true);
    try {
      const savedBalance = localStorage.getItem(BALANCE_STORAGE_KEY);
      if (savedBalance !== null) {
        const parsed = parseFloat(savedBalance);
        if (!isNaN(parsed) && parsed >= 0) {
          setBalance(parsed);
        }
      }
      const savedCurrency = localStorage.getItem(CURRENCY_STORAGE_KEY);
      if (savedCurrency) {
        setCurrencyState(savedCurrency);
      }
    } catch {
      // localStorage may fail in private mode or non-browser environments
    }
  }, []);

  const setCurrency = (curr: string) => {
    setCurrencyState(curr);
    try {
      localStorage.setItem(CURRENCY_STORAGE_KEY, curr);
    } catch {
      // ignore
    }
  };

  const updateBalance = (amount: number): boolean => {
    let success = false;
    setBalance((prev) => {
      const next = Math.max(0, parseFloat((prev + amount).toFixed(2)));
      try {
        localStorage.setItem(BALANCE_STORAGE_KEY, next.toString());
      } catch {
        // ignore
      }
      success = true;
      return next;
    });
    return success;
  };

  const resetBalance = () => {
    setBalance(DEFAULT_BALANCE);
    try {
      localStorage.setItem(BALANCE_STORAGE_KEY, DEFAULT_BALANCE.toString());
    } catch {
      // ignore
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const setSidebarOpen = (open: boolean) => {
    setIsSidebarOpen(open);
  };

  const toggleChat = () => {
    setIsChatOpen((prev) => !prev);
  };

  const setChatOpen = (open: boolean) => {
    setIsChatOpen(open);
  };

  const formatBalance = (val?: number): string => {
    const target = val !== undefined ? val : balance;
    return target.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <GameContext.Provider
      value={{
        balance,
        currency,
        isSidebarOpen,
        isChatOpen,
        isMounted,
        toggleSidebar,
        setSidebarOpen,
        toggleChat,
        setChatOpen,
        setCurrency,
        updateBalance,
        resetBalance,
        formatBalance,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame(): GameContextType {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}

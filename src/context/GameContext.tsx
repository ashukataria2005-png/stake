"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface UserProfile {
  name: string;
  email: string;
  avatarColor: string;
}

interface GameContextType {
  balance: number;
  currency: string;
  isSidebarOpen: boolean;
  isChatOpen: boolean;
  isMounted: boolean;
  isAuthenticated: boolean;
  user: UserProfile | null;
  isOneTapOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleChat: () => void;
  setChatOpen: (open: boolean) => void;
  setCurrency: (currency: string) => void;
  updateBalance: (amount: number) => boolean;
  resetBalance: () => void;
  formatBalance: (val?: number) => string;
  login: (userData?: Partial<UserProfile>) => void;
  logout: () => void;
  openOneTap: () => void;
  closeOneTap: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const BALANCE_STORAGE_KEY = "stake_clone_balance";
const CURRENCY_STORAGE_KEY = "stake_clone_currency";
const AUTH_STORAGE_KEY = "stake_clone_auth";
const DEFAULT_BALANCE = 1000.00;

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [balance, setBalance] = useState<number>(DEFAULT_BALANCE);
  const [currency, setCurrencyState] = useState<string>("USDT");
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isOneTapOpen, setIsOneTapOpen] = useState<boolean>(false);

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
      const savedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
      if (savedAuth) {
        const authData = JSON.parse(savedAuth);
        if (authData?.isAuthenticated) {
          setIsAuthenticated(true);
          setUser(authData.user || { name: "Anuj", email: "ashukataria2005@gmail.com", avatarColor: "#9333ea" });
        }
      }
    } catch {
      // localStorage may fail in private mode or non-browser environments
    }
  }, []);

  const login = (userData?: Partial<UserProfile>) => {
    const profile: UserProfile = {
      name: userData?.name || "Anuj",
      email: userData?.email || "ashukataria2005@gmail.com",
      avatarColor: userData?.avatarColor || "#9333ea",
    };
    setIsAuthenticated(true);
    setUser(profile);
    setBalance(DEFAULT_BALANCE);
    setIsOneTapOpen(false);

    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ isAuthenticated: true, user: profile }));
      localStorage.setItem(BALANCE_STORAGE_KEY, DEFAULT_BALANCE.toString());
    } catch {
      // ignore
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const openOneTap = () => setIsOneTapOpen(true);
  const closeOneTap = () => setIsOneTapOpen(false);

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
        isAuthenticated,
        user,
        isOneTapOpen,
        toggleSidebar,
        setSidebarOpen,
        toggleChat,
        setChatOpen,
        setCurrency,
        updateBalance,
        resetBalance,
        formatBalance,
        login,
        logout,
        openOneTap,
        closeOneTap,
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

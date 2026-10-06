"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { CRYPTO_CURRENCIES, ALL_FIAT_CURRENCIES } from "@/data/currencies";

export interface UserProfile {
  name: string;
  email: string;
  avatarColor: string;
}

export interface DisplayBalanceInfo {
  amount: string;
  symbol: string;
  code: string;
  isFiat: boolean;
}

interface GameContextType {
  balance: number; // Stored in USD / USDT equivalent
  currency: string; // Active cryptocurrency (USDT, BTC, ETH, LTC, SOL, DOGE, BCH, XRP, TRX)
  cryptoBalances: Record<string, number>;
  hideZeroBalances: boolean;
  displayCryptoInFiat: boolean;
  selectedFiat: string;
  isSidebarOpen: boolean;
  isChatOpen: boolean;
  isMounted: boolean;
  isAuthenticated: boolean;
  user: UserProfile | null;
  isOneTapOpen: boolean;
  isWalletModalOpen: boolean;
  isWalletSettingsOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleChat: () => void;
  setChatOpen: (open: boolean) => void;
  setCurrency: (currency: string) => void;
  setHideZeroBalances: (hide: boolean) => void;
  setDisplayCryptoInFiat: (display: boolean) => void;
  setSelectedFiat: (fiat: string) => void;
  updateBalance: (amountUsd: number) => boolean;
  resetBalance: () => void;
  formatBalance: (val?: number) => string;
  formatDisplayBalance: (valUsd?: number) => DisplayBalanceInfo;
  login: (userData?: Partial<UserProfile>) => void;
  logout: () => void;
  openOneTap: () => void;
  closeOneTap: () => void;
  openWalletModal: () => void;
  closeWalletModal: () => void;
  openWalletSettings: () => void;
  closeWalletSettings: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const BALANCE_STORAGE_KEY = "stake_clone_balance";
const CURRENCY_STORAGE_KEY = "stake_clone_currency";
const CRYPTO_BALANCES_STORAGE_KEY = "stake_clone_crypto_balances";
const HIDE_ZERO_STORAGE_KEY = "stake_clone_hide_zero";
const DISPLAY_FIAT_STORAGE_KEY = "stake_clone_display_fiat";
const SELECTED_FIAT_STORAGE_KEY = "stake_clone_selected_fiat";
const AUTH_STORAGE_KEY = "stake_clone_auth";

const DEFAULT_USD_BALANCE = 1000.00;

const DEFAULT_CRYPTO_BALANCES: Record<string, number> = {
  USDT: 1000.0,
  BTC: 0.01459854,
  ETH: 0.28409091,
  LTC: 11.83431953,
  SOL: 5.40540541,
  DOGE: 6060.60606061,
  BCH: 2.38095238,
  XRP: 1612.90322581,
  TRX: 6896.55172414,
};

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [balance, setBalance] = useState<number>(DEFAULT_USD_BALANCE);
  const [currency, setCurrencyState] = useState<string>("USDT");
  const [cryptoBalances, setCryptoBalances] = useState<Record<string, number>>(DEFAULT_CRYPTO_BALANCES);
  const [hideZeroBalances, setHideZeroBalancesState] = useState<boolean>(false);
  const [displayCryptoInFiat, setDisplayCryptoInFiatState] = useState<boolean>(false);
  const [selectedFiat, setSelectedFiatState] = useState<string>("USD");

  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<UserProfile | null>(null);

  const [isOneTapOpen, setIsOneTapOpen] = useState<boolean>(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState<boolean>(false);
  const [isWalletSettingsOpen, setIsWalletSettingsOpen] = useState<boolean>(false);

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
      const savedCryptoBalances = localStorage.getItem(CRYPTO_BALANCES_STORAGE_KEY);
      if (savedCryptoBalances) {
        setCryptoBalances(JSON.parse(savedCryptoBalances));
      }
      const savedHideZero = localStorage.getItem(HIDE_ZERO_STORAGE_KEY);
      if (savedHideZero !== null) {
        setHideZeroBalancesState(savedHideZero === "true");
      }
      const savedDisplayFiat = localStorage.getItem(DISPLAY_FIAT_STORAGE_KEY);
      if (savedDisplayFiat !== null) {
        setDisplayCryptoInFiatState(savedDisplayFiat === "true");
      }
      const savedSelectedFiat = localStorage.getItem(SELECTED_FIAT_STORAGE_KEY);
      if (savedSelectedFiat) {
        setSelectedFiatState(savedSelectedFiat);
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
      // localStorage may fail in private mode
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
    setBalance(DEFAULT_USD_BALANCE);
    setCryptoBalances(DEFAULT_CRYPTO_BALANCES);
    setIsOneTapOpen(false);

    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ isAuthenticated: true, user: profile }));
      localStorage.setItem(BALANCE_STORAGE_KEY, DEFAULT_USD_BALANCE.toString());
      localStorage.setItem(CRYPTO_BALANCES_STORAGE_KEY, JSON.stringify(DEFAULT_CRYPTO_BALANCES));
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

  const openWalletModal = () => setIsWalletModalOpen(true);
  const closeWalletModal = () => setIsWalletModalOpen(false);

  const openWalletSettings = () => setIsWalletSettingsOpen(true);
  const closeWalletSettings = () => setIsWalletSettingsOpen(false);

  const setCurrency = (curr: string) => {
    setCurrencyState(curr);
    try {
      localStorage.setItem(CURRENCY_STORAGE_KEY, curr);
    } catch {
      // ignore
    }
  };

  const setHideZeroBalances = (hide: boolean) => {
    setHideZeroBalancesState(hide);
    try {
      localStorage.setItem(HIDE_ZERO_STORAGE_KEY, hide ? "true" : "false");
    } catch {
      // ignore
    }
  };

  const setDisplayCryptoInFiat = (display: boolean) => {
    setDisplayCryptoInFiatState(display);
    try {
      localStorage.setItem(DISPLAY_FIAT_STORAGE_KEY, display ? "true" : "false");
    } catch {
      // ignore
    }
  };

  const setSelectedFiat = (fiat: string) => {
    setSelectedFiatState(fiat);
    try {
      localStorage.setItem(SELECTED_FIAT_STORAGE_KEY, fiat);
    } catch {
      // ignore
    }
  };

  const updateBalance = (amountUsd: number): boolean => {
    let success = false;
    setBalance((prev) => {
      const next = Math.max(0, parseFloat((prev + amountUsd).toFixed(2)));
      try {
        localStorage.setItem(BALANCE_STORAGE_KEY, next.toString());
      } catch {
        // ignore
      }
      success = true;
      return next;
    });

    // Also update crypto balances
    setCryptoBalances((prev) => {
      const activeCrypto = CRYPTO_CURRENCIES.find((c) => c.id === currency);
      const rate = activeCrypto?.rateUsd || 1.0;
      const cryptoDiff = amountUsd / rate;
      const currentCrypto = prev[currency] || 0;
      const updated = {
        ...prev,
        [currency]: Math.max(0, currentCrypto + cryptoDiff),
      };
      try {
        localStorage.setItem(CRYPTO_BALANCES_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    return success;
  };

  const resetBalance = () => {
    setBalance(DEFAULT_USD_BALANCE);
    setCryptoBalances(DEFAULT_CRYPTO_BALANCES);
    try {
      localStorage.setItem(BALANCE_STORAGE_KEY, DEFAULT_USD_BALANCE.toString());
      localStorage.setItem(CRYPTO_BALANCES_STORAGE_KEY, JSON.stringify(DEFAULT_CRYPTO_BALANCES));
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

  // Formats display balance based on user fiat settings or crypto
  const formatDisplayBalance = (valUsd?: number): DisplayBalanceInfo => {
    const usdAmount = valUsd !== undefined ? valUsd : balance;

    if (displayCryptoInFiat) {
      const fiatObj = ALL_FIAT_CURRENCIES.find((f) => f.code === selectedFiat);
      const rate = fiatObj?.ratePerUsd || 1.0;
      const fiatValue = usdAmount * rate;
      const symbol = fiatObj?.symbol || "$";
      const decimals = fiatValue > 1000 ? 2 : 2;

      return {
        amount: fiatValue.toLocaleString("en-US", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }),
        symbol,
        code: selectedFiat,
        isFiat: true,
      };
    }

    // Format in Crypto Units
    const cryptoObj = CRYPTO_CURRENCIES.find((c) => c.id === currency);
    const rate = cryptoObj?.rateUsd || 1.0;
    const cryptoAmount = cryptoBalances[currency] !== undefined
      ? cryptoBalances[currency]
      : usdAmount / rate;

    return {
      amount: cryptoAmount.toLocaleString("en-US", {
        minimumFractionDigits: cryptoObj?.decimals || 8,
        maximumFractionDigits: cryptoObj?.decimals || 8,
      }),
      symbol: cryptoObj?.symbol || "$",
      code: currency,
      isFiat: false,
    };
  };

  return (
    <GameContext.Provider
      value={{
        balance,
        currency,
        cryptoBalances,
        hideZeroBalances,
        displayCryptoInFiat,
        selectedFiat,
        isSidebarOpen,
        isChatOpen,
        isMounted,
        isAuthenticated,
        user,
        isOneTapOpen,
        isWalletModalOpen,
        isWalletSettingsOpen,
        toggleSidebar,
        setSidebarOpen,
        toggleChat,
        setChatOpen,
        setCurrency,
        setHideZeroBalances,
        setDisplayCryptoInFiat,
        setSelectedFiat,
        updateBalance,
        resetBalance,
        formatBalance,
        formatDisplayBalance,
        login,
        logout,
        openOneTap,
        closeOneTap,
        openWalletModal,
        closeWalletModal,
        openWalletSettings,
        closeWalletSettings,
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

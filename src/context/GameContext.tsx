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

export interface RecentlyPlayedGame {
  id: string;
  slug?: string;
  title: string;
  image?: string;
  href?: string;
  playersCount?: number;
}

export type PlayMode = "real" | "fun";

interface GameContextType {
  balance: number; // Active balance depending on playMode
  realBalance: number; // Authentic wallet balance in USD
  funBalance: number; // Isolated session demo balance (credits)
  playMode: PlayMode; // "real" | "fun"
  setPlayMode: (mode: PlayMode) => void;
  resetFunBalance: () => void;
  hasVerifiedDeposit: boolean;
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
  isAuthModalOpen: boolean;
  authModalMode: "signin" | "register";
  isWalletModalOpen: boolean;
  isWalletSettingsOpen: boolean;
  recentlyPlayedGames: RecentlyPlayedGame[];
  addRecentlyPlayedGame: (game: RecentlyPlayedGame) => void;
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
  openAuthModal: (mode?: "signin" | "register") => void;
  closeAuthModal: () => void;
  openSignIn: () => void;
  openRegister: () => void;
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

// Initial user balance is strictly 0.00 until an authentic deposit is verified
const DEFAULT_USD_BALANCE = 0.00;
const DEFAULT_FUN_BALANCE = 1000.00;

const DEFAULT_CRYPTO_BALANCES: Record<string, number> = {
  USDT: 0.0,
  BTC: 0.0,
  ETH: 0.0,
  LTC: 0.0,
  SOL: 0.0,
  DOGE: 0.0,
  BCH: 0.0,
  XRP: 0.0,
  TRX: 0.0,
};

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [realBalance, setRealBalance] = useState<number>(DEFAULT_USD_BALANCE);
  const [funBalance, setFunBalance] = useState<number>(DEFAULT_FUN_BALANCE);
  const [playMode, setPlayMode] = useState<PlayMode>("real");
  const [hasVerifiedDeposit, setHasVerifiedDeposit] = useState<boolean>(false);
  const [currency, setCurrencyState] = useState<string>("USDT");
  const [cryptoBalances, setCryptoBalances] = useState<Record<string, number>>(DEFAULT_CRYPTO_BALANCES);
  const [hideZeroBalances, setHideZeroBalancesState] = useState<boolean>(false);
  const [displayCryptoInFiat, setDisplayCryptoInFiatState] = useState<boolean>(false);
  const [selectedFiat, setSelectedFiatState] = useState<string>("INR");

  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<UserProfile | null>(null);

  const [isOneTapOpen, setIsOneTapOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<"signin" | "register">("signin");
  const [isWalletModalOpen, setIsWalletModalOpen] = useState<boolean>(false);
  const [isWalletSettingsOpen, setIsWalletSettingsOpen] = useState<boolean>(false);
  const [recentlyPlayedGames, setRecentlyPlayedGames] = useState<RecentlyPlayedGame[]>([]);

  // Helper to check verified deposit history in stake_deposit_orders
  const checkDepositHistory = (): boolean => {
    try {
      const saved = localStorage.getItem("stake_deposit_orders");
      if (!saved) return false;
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.some((o: any) => o.status === "Success" || o.status === "Completed");
    } catch {
      return false;
    }
  };

  // Hydrate state from localStorage safely on client
  useEffect(() => {
    setIsMounted(true);
    try {
      const verified = checkDepositHistory();
      setHasVerifiedDeposit(verified);

      const savedBalance = localStorage.getItem(BALANCE_STORAGE_KEY);
      if (savedBalance !== null) {
        const parsed = parseFloat(savedBalance);
        // If user never deposited and has old demo 1000 balance, reset strictly to 0
        if (!verified && (parsed === 1000 || parsed === 1000.0)) {
          setRealBalance(0.00);
          localStorage.setItem(BALANCE_STORAGE_KEY, "0");
        } else if (!isNaN(parsed) && parsed >= 0) {
          setRealBalance(parsed);
        }
      } else {
        setRealBalance(0.00);
      }

      // Default playMode: if realBalance > 0 default to real, otherwise fun play
      if (savedBalance !== null && parseFloat(savedBalance) > 0) {
        setPlayMode("real");
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
      const savedRecent = localStorage.getItem("stake_clone_recently_played");
      if (savedRecent) {
        const parsed = JSON.parse(savedRecent);
        if (Array.isArray(parsed)) {
          setRecentlyPlayedGames(parsed);
        }
      }
      // On mobile devices, ensure the hamburger drawer starts closed
      if (typeof window !== "undefined" && window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      }

      const handleDepositOrdersUpdate = () => {
        const hasVerified = checkDepositHistory();
        setHasVerifiedDeposit(hasVerified);
      };
      window.addEventListener("stake_deposit_orders_updated", handleDepositOrdersUpdate);
      return () => {
        window.removeEventListener("stake_deposit_orders_updated", handleDepositOrdersUpdate);
      };
    } catch {
      // localStorage may fail in private mode
    }
  }, []);

  const addRecentlyPlayedGame = (game: RecentlyPlayedGame) => {
    setRecentlyPlayedGames((prev) => {
      const filtered = prev.filter((g) => g.id !== game.id && (g.slug ? g.slug !== game.slug : true));
      const updated = [game, ...filtered].slice(0, 5);
      try {
        localStorage.setItem("stake_clone_recently_played", JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const login = (userData?: Partial<UserProfile>) => {
    const profile: UserProfile = {
      name: userData?.name || "Anuj",
      email: userData?.email || "ashukataria2005@gmail.com",
      avatarColor: userData?.avatarColor || "#9333ea",
    };
    setIsAuthenticated(true);
    setUser(profile);
    setRealBalance(DEFAULT_USD_BALANCE);
    setCryptoBalances(DEFAULT_CRYPTO_BALANCES);
    setIsOneTapOpen(false);
    setIsAuthModalOpen(false);

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

  const openAuthModal = (mode: "signin" | "register" = "signin") => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };
  const closeAuthModal = () => setIsAuthModalOpen(false);
  const openSignIn = () => openAuthModal("signin");
  const openRegister = () => openAuthModal("register");

  const openOneTap = () => openAuthModal("signin");
  const closeOneTap = () => closeAuthModal();

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

  const resetFunBalance = () => {
    setFunBalance(DEFAULT_FUN_BALANCE);
  };

  const updateBalance = (amountUsd: number): boolean => {
    // Strictly mutate authentic unified real wallet balance & persist to localStorage
    let success = false;
    setRealBalance((prev) => {
      const next = Math.max(0, parseFloat((prev + amountUsd).toFixed(2)));
      try {
        localStorage.setItem(BALANCE_STORAGE_KEY, next.toString());
      } catch {
        // ignore
      }
      success = true;
      return next;
    });

    // Also update crypto balances in Real Play mode
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
    setRealBalance(DEFAULT_USD_BALANCE);
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

  // Active balance is strictly authentic unified realBalance
  const activeBalance = realBalance;

  const formatBalance = (val?: number): string => {
    const target = val !== undefined ? val : activeBalance;
    return target.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Formats display balance based on user fiat settings or crypto
  const formatDisplayBalance = (valUsd?: number): DisplayBalanceInfo => {
    const usdAmount = valUsd !== undefined ? valUsd : activeBalance;

    if (displayCryptoInFiat) {
      const fiatObj = ALL_FIAT_CURRENCIES.find((f) => f.code === selectedFiat);
      const rate = fiatObj?.ratePerUsd || 1.0;
      const fiatValue = usdAmount * rate;
      const symbol = fiatObj?.symbol || "$";
      const decimals = 2;

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
        balance: activeBalance,
        realBalance,
        funBalance,
        playMode,
        setPlayMode,
        resetFunBalance,
        hasVerifiedDeposit,
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
        isAuthModalOpen,
        authModalMode,
        isWalletModalOpen,
        isWalletSettingsOpen,
        recentlyPlayedGames,
        addRecentlyPlayedGame,
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
        openAuthModal,
        closeAuthModal,
        openSignIn,
        openRegister,
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

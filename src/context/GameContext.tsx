"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { CRYPTO_CURRENCIES, ALL_FIAT_CURRENCIES } from "@/data/currencies";

export interface UserProfile {
  id?: string;
  name: string;
  username?: string;
  email: string;
  phone?: string;
  role?: string;
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
  isTransactionsModalOpen: boolean;
  isSettingsModalOpen: boolean;
  recentlyPlayedGames: RecentlyPlayedGame[];
  addRecentlyPlayedGame: (game: RecentlyPlayedGame) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  toggleChat: () => void;
  setChatOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  setCurrency: (currency: string) => void;
  setHideZeroBalances: (hide: boolean) => void;
  setDisplayCryptoInFiat: (display: boolean) => void;
  setSelectedFiat: (fiat: string) => void;
  activeCurrencyCode: string;
  activeCurrencySymbol: string;
  currencySymbol: string;
  activeCurrencyRate: number;
  isFiatMode: boolean;
  updateBalance: (amount: number, inUsd?: boolean) => boolean;
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
  openTransactionsModal: () => void;
  closeTransactionsModal: () => void;
  openSettingsModal: () => void;
  closeSettingsModal: () => void;
  previewGame: any | null;
  openGamePreview: (game: any) => void;
  closeGamePreview: () => void;
  userLuckMode: "HIGH_WIN" | "MEDIUM_WIN" | "LOW_WIN" | "NO_CONTROL";
  refreshLuckMode: () => Promise<void>;
  syncWalletBalance: () => Promise<void>;
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

  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<UserProfile | null>(null);

  const [isOneTapOpen, setIsOneTapOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<"signin" | "register">("signin");
  const [isWalletModalOpen, setIsWalletModalOpen] = useState<boolean>(false);
  const [isWalletSettingsOpen, setIsWalletSettingsOpen] = useState<boolean>(false);
  const [isTransactionsModalOpen, setIsTransactionsModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [recentlyPlayedGames, setRecentlyPlayedGames] = useState<RecentlyPlayedGame[]>([]);
  const [previewGame, setPreviewGame] = useState<any | null>(null);
  const [userLuckMode, setUserLuckMode] = useState<"HIGH_WIN" | "MEDIUM_WIN" | "LOW_WIN" | "NO_CONTROL">("NO_CONTROL");

  const pathname = usePathname();

  const refreshLuckMode = useCallback(async () => {
    try {
      const activeUser = user || (typeof window !== "undefined" ? (() => {
        try {
          const authRaw = localStorage.getItem(AUTH_STORAGE_KEY);
          if (authRaw) {
            const parsed = JSON.parse(authRaw);
            if (parsed?.user) return parsed.user;
          }
        } catch {}
        return null;
      })() : null);

      const activeId = activeUser?.id || activeUser?.username || activeUser?.name || "demo_player";
      const res = await fetch(`/api/games/luck-settings?userId=${encodeURIComponent(activeId)}`);
      const data = await res.json();
      if (data?.success && data?.effectiveMode) {
        setUserLuckMode(data.effectiveMode);
      }
    } catch {
      // ignore
    }
  }, [user]);

  // Route Changes / Game Navigation: sync luck settings on route navigation
  useEffect(() => {
    refreshLuckMode();
  }, [pathname, refreshLuckMode]);

  // Real-time sync for luck rules (every 5 seconds)
  useEffect(() => {
    refreshLuckMode();
    const luckInterval = setInterval(() => {
      refreshLuckMode();
    }, 5000);

    return () => {
      clearInterval(luckInterval);
    };
  }, [refreshLuckMode]);

  // Timestamp to protect optimistic gameplay deductions/wins from being rolled back by background balance sync
  const lastGameActionRef = useRef<number>(0);

  const syncWalletBalance = useCallback(async (force: boolean = false) => {
    try {
      // If user performed a game action within last 15 seconds and not explicitly forced, keep optimistic balance intact
      if (!force && Date.now() - lastGameActionRef.current < 15000) {
        return;
      }

      const activeUser = user || (typeof window !== "undefined" ? (() => {
        try {
          const authRaw = localStorage.getItem(AUTH_STORAGE_KEY);
          if (authRaw) {
            const parsed = JSON.parse(authRaw);
            if (parsed?.user) return parsed.user;
          }
        } catch {}
        return null;
      })() : null);

      const searchKey = activeUser?.id || activeUser?.username || activeUser?.email || "guest_player";
      const res = await fetch(`/api/wallet/balance?userId=${encodeURIComponent(searchKey)}`);
      const data = await res.json();

      if (data?.success && data?.wallet) {
        const dbInrBalance = Number(data.wallet.balance || 0);
        // Underlying rate 86.5 INR per USD
        const inUsd = parseFloat((dbInrBalance / 86.5).toFixed(4));
        setRealBalance(inUsd);
        try {
          localStorage.setItem(BALANCE_STORAGE_KEY, inUsd.toString());
        } catch {}

        if (Array.isArray(data.transactions) && data.transactions.some((t: any) => t.type === "DEPOSIT" && t.status === "APPROVED")) {
          setHasVerifiedDeposit(true);
        }
      }
    } catch (err) {
      console.error("[GameContext] Failed to sync wallet balance:", err);
    }
  }, [user]);

  // Initial mount & event-driven live balance sync (deposits, approval events, window focus)
  useEffect(() => {
    syncWalletBalance();

    const handleRefresh = () => {
      syncWalletBalance(true);
      refreshLuckMode();
    };
    window.addEventListener("stake_wallet_refresh", handleRefresh);
    window.addEventListener("stake_deposit_orders_updated", handleRefresh);
    window.addEventListener("focus", handleRefresh);

    return () => {
      window.removeEventListener("stake_wallet_refresh", handleRefresh);
      window.removeEventListener("stake_deposit_orders_updated", handleRefresh);
      window.removeEventListener("focus", handleRefresh);
    };
  }, [syncWalletBalance, refreshLuckMode]);

  const openGamePreview = useCallback((game: any) => {
    setPreviewGame(game);
  }, []);

  const closeGamePreview = useCallback(() => {
    setPreviewGame(null);
  }, []);

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

  const addRecentlyPlayedGame = useCallback((game: RecentlyPlayedGame) => {
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
  }, []);

  const login = (userData?: Partial<UserProfile>) => {
    const profile: UserProfile = {
      id: userData?.id || `usr_${Date.now()}`,
      name: userData?.name || userData?.username || "Player",
      username: userData?.username || userData?.name || "Player",
      email: userData?.email || "user@stake.com",
      phone: userData?.phone,
      role: userData?.role || "USER",
      avatarColor: userData?.avatarColor || "#00e701",
    };
    setIsAuthenticated(true);
    setUser(profile);
    setRealBalance(DEFAULT_USD_BALANCE);
    setCryptoBalances(DEFAULT_CRYPTO_BALANCES);
    setIsOneTapOpen(false);
    setIsAuthModalOpen(false);

    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ isAuthenticated: true, user: profile }));
      localStorage.setItem("stake_active_user", JSON.stringify(profile));
      localStorage.setItem("stake_user_id", profile.id || profile.username || "");
      localStorage.setItem(BALANCE_STORAGE_KEY, DEFAULT_USD_BALANCE.toString());
      localStorage.setItem(CRYPTO_BALANCES_STORAGE_KEY, JSON.stringify(DEFAULT_CRYPTO_BALANCES));
    } catch {
      // ignore
    }

    setTimeout(() => {
      syncWalletBalance();
    }, 100);
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

  const openTransactionsModal = () => setIsTransactionsModalOpen(true);
  const closeTransactionsModal = () => setIsTransactionsModalOpen(false);

  const openSettingsModal = () => setIsSettingsModalOpen(true);
  const closeSettingsModal = () => setIsSettingsModalOpen(false);

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

  // Active currency resolution
  const isFiatMode = displayCryptoInFiat;
  const activeCurrencyCode = displayCryptoInFiat ? selectedFiat : currency;
  const currentFiatObj = ALL_FIAT_CURRENCIES.find((f) => f.code === selectedFiat);
  const currentCryptoObj = CRYPTO_CURRENCIES.find((c) => c.id === currency);

  const activeCurrencySymbol = displayCryptoInFiat
    ? (currentFiatObj?.symbol || "₹")
    : (currentCryptoObj?.symbol || "$");

  const activeCurrencyRate = displayCryptoInFiat
    ? (currentFiatObj?.ratePerUsd || 86.5)
    : (currentCryptoObj?.rateUsd || 1.0);

  // Active user balance in units of the currently active currency
  const activeBalance = displayCryptoInFiat
    ? parseFloat((realBalance * activeCurrencyRate).toFixed(2))
    : (currency === "USDT"
        ? parseFloat(realBalance.toFixed(2))
        : (cryptoBalances[currency] !== undefined
            ? cryptoBalances[currency]
            : parseFloat((realBalance / activeCurrencyRate).toFixed(6))));

  const updateBalance = (amount: number, inUsd: boolean = false): boolean => {
    lastGameActionRef.current = Date.now();
    let success = false;
    let amountUsd = amount;

    if (!inUsd) {
      if (displayCryptoInFiat) {
        // Amount is in active fiat units (e.g. INR ₹10). Convert to USD for underlying wallet storage.
        amountUsd = amount / activeCurrencyRate;
      } else {
        // Amount is in crypto units
        amountUsd = currency === "USDT" ? amount : (amount * activeCurrencyRate);
      }
    }

    let nextRealBalance = 0;
    setRealBalance((prev) => {
      const next = Math.max(0, parseFloat((prev + amountUsd).toFixed(4)));
      nextRealBalance = next;
      try {
        localStorage.setItem(BALANCE_STORAGE_KEY, next.toString());
      } catch {
        // ignore
      }
      success = true;
      return next;
    });

    // Background sync to Neon PostgreSQL wallet immediately so fast refresh preserves exact balance
    try {
      const activeUser = user || (typeof window !== "undefined" ? (() => {
        try {
          const authRaw = localStorage.getItem(AUTH_STORAGE_KEY);
          if (authRaw) {
            const parsed = JSON.parse(authRaw);
            if (parsed?.user) return parsed.user;
          }
        } catch {}
        return null;
      })() : null);

      const targetUserId = activeUser?.id || activeUser?.username || activeUser?.email || "guest_player";
      const newInrBalance = parseFloat((nextRealBalance * 86.5).toFixed(2));

      fetch("/api/wallet/balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: targetUserId,
          balance: newInrBalance,
        }),
      }).catch((err) => {
        console.warn("[GameContext] Failed to persist gameplay balance:", err);
      });
    } catch {
      // ignore
    }

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

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const setSidebarOpen = useCallback((open: boolean | ((prev: boolean) => boolean)) => {
    setIsSidebarOpen(open);
  }, []);

  const toggleChat = useCallback(() => {
    setIsChatOpen((prev) => !prev);
  }, []);

  const setChatOpen = useCallback((open: boolean | ((prev: boolean) => boolean)) => {
    setIsChatOpen(open);
  }, []);

  const formatBalance = (val?: number): string => {
    const target = val !== undefined ? val : activeBalance;
    return target.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: displayCryptoInFiat ? 2 : (currentCryptoObj?.decimals || 2),
    });
  };

  // Formats display balance based on user fiat settings or crypto
  const formatDisplayBalance = (valUsd?: number): DisplayBalanceInfo => {
    const usdAmount = valUsd !== undefined ? valUsd : realBalance;

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
        activeCurrencyCode,
        activeCurrencySymbol,
        currencySymbol: activeCurrencySymbol,
        activeCurrencyRate,
        isFiatMode,
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
        isTransactionsModalOpen,
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
        openTransactionsModal,
        closeTransactionsModal,
        isSettingsModalOpen,
        openSettingsModal,
        closeSettingsModal,
        previewGame,
        openGamePreview,
        closeGamePreview,
        userLuckMode,
        refreshLuckMode,
        syncWalletBalance,
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

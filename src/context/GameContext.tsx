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

export type GameStats = {
  wagered: number;
  profit: number;
  wins: number;
  losses: number;
};

interface GameContextType {
  balance: number; // Active balance depending on playMode
  realBalance: number; // Authentic wallet balance in USD
  setRealBalance: React.Dispatch<React.SetStateAction<number>>;
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
  openWalletModal: (initialTab?: any, preselectedBonus?: string) => void;
  closeWalletModal: () => void;
  walletInitialTab: "deposit" | "withdraw";
  preselectedBonusOffer: string;
  depositCount: number;
  approvedDepositCount: number;
  unlockedBonusTier: number;
  totalWagered: number;
  incrementTotalWagered: (amountUsd: number) => void;
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
  syncWalletBalance: (force?: boolean) => Promise<void>;
  gameStats: Record<string, GameStats>;
  getGameStats: (gameId?: string) => GameStats;
  sessionWagered: number;
  sessionProfit: number;
  sessionWins: number;
  sessionLosses: number;
  resetSessionStats: (gameId?: string) => void;
  recordSessionBet: (wager: number, payout: number, explicitIsWin?: boolean, gameId?: string, gameData?: any) => void;
  isLiveStatsOpen: boolean;
  setIsLiveStatsOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  toggleLiveStats: (gameId?: string) => void;
  activeLiveStatsGame: string;
  setActiveLiveStatsGame: (gameId: string) => void;
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
  const [walletInitialTab, setWalletInitialTab] = useState<"deposit" | "withdraw">("deposit");
  const [preselectedBonusOffer, setPreselectedBonusOffer] = useState<string>("none");
  const [depositCount, setDepositCount] = useState<number>(0);
  const [unlockedBonusTier, setUnlockedBonusTier] = useState<number>(1);
  const [totalWagered, setTotalWagered] = useState<number>(0);
  const [isWalletSettingsOpen, setIsWalletSettingsOpen] = useState<boolean>(false);
  const [isTransactionsModalOpen, setIsTransactionsModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [recentlyPlayedGames, setRecentlyPlayedGames] = useState<RecentlyPlayedGame[]>([]);
  const [previewGame, setPreviewGame] = useState<any | null>(null);
  const [userLuckMode, setUserLuckMode] = useState<"HIGH_WIN" | "MEDIUM_WIN" | "LOW_WIN" | "NO_CONTROL">("NO_CONTROL");
  const [activeLiveStatsGame, setActiveLiveStatsGame] = useState<string>("general");
  const [gameStats, setGameStats] = useState<Record<string, GameStats>>({});
  const [isLiveStatsOpen, setIsLiveStatsOpen] = useState<boolean>(false);

  const pathname = usePathname();

  // Automatically update active game tracking when navigating to an original game
  useEffect(() => {
    if (pathname) {
      const match = pathname.match(/\/(?:games|casino\/games)\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        setActiveLiveStatsGame(match[1].toLowerCase());
      }
    }
  }, [pathname]);

  // Load per-game session stats from storage
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("stake_live_stats_per_game");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          setGameStats(parsed);
        }
      }
    } catch {}
  }, []);

  const getGameStats = useCallback(
    (gameId?: string): GameStats => {
      const key = (gameId || activeLiveStatsGame || "general").toLowerCase();
      return gameStats[key] || { wagered: 0, profit: 0, wins: 0, losses: 0 };
    },
    [gameStats, activeLiveStatsGame]
  );

  const resetSessionStats = useCallback(
    (gameId?: string) => {
      setGameStats((prev) => {
        let next: Record<string, GameStats>;
        if (gameId === "all") {
          next = {};
        } else {
          const target = (gameId || activeLiveStatsGame || "general").toLowerCase();
          next = {
            ...prev,
            [target]: { wagered: 0, profit: 0, wins: 0, losses: 0 },
          };
        }
        try {
          sessionStorage.setItem("stake_live_stats_per_game", JSON.stringify(next));
        } catch {}
        return next;
      });
    },
    [activeLiveStatsGame]
  );

  const recordSessionBet = useCallback(
    (wager: number, payout: number, explicitIsWin?: boolean, gameId?: string, gameData?: any) => {
      const w = Math.max(0, Number(wager) || 0);
      const p = Math.max(0, Number(payout) || 0);
      const profitDelta = p - w;
      const isWin = explicitIsWin !== undefined ? explicitIsWin : p > w;

      let targetKey = gameId?.toLowerCase();
      if (!targetKey && pathname) {
        const match = pathname.match(/\/(?:games|casino\/games)\/([a-zA-Z0-9_-]+)/);
        if (match && match[1]) {
          targetKey = match[1].toLowerCase();
        }
      }
      if (!targetKey) {
        targetKey = (activeLiveStatsGame || "general").toLowerCase();
      }

      setGameStats((prev) => {
        const current = prev[targetKey] || { wagered: 0, profit: 0, wins: 0, losses: 0 };
        const nextStats: GameStats = {
          wagered: parseFloat((current.wagered + w).toFixed(4)),
          profit: parseFloat((current.profit + profitDelta).toFixed(4)),
          wins: isWin ? current.wins + 1 : current.wins,
          losses: !isWin ? current.losses + 1 : current.losses,
        };

        const updated = {
          ...prev,
          [targetKey]: nextStats,
        };

        try {
          sessionStorage.setItem("stake_live_stats_per_game", JSON.stringify(updated));
        } catch {}

        return updated;
      });

      // Asynchronously record every completed game bet permanently to database
      if (w > 0) {
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

          const targetUserId = activeUser?.id || activeUser?.username || "guest_player";
          const numericWager = parseFloat(w.toFixed(4));
          const numericPayout = parseFloat(p.toFixed(4));
          const multiplier = numericWager > 0 ? parseFloat((numericPayout / numericWager).toFixed(2)) : 0;

          fetch("/api/bets/record", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: targetUserId,
              username: activeUser?.username,
              email: activeUser?.email,
              gameId: targetKey,
              gameName: targetKey,
              wager: numericWager,
              betAmount: numericWager,
              payout: numericPayout,
              payoutAmount: numericPayout,
              multiplier,
              payoutMultiplier: multiplier,
              isWin,
              outcome: isWin ? "WIN" : "LOSS",
              gameData: gameData || {},
              updateWallet: false, // Balance already updated by updateBalance
            }),
          }).catch((err) => {
            console.warn("[GameContext] Background bet recording error:", err);
          });
        } catch {}
      }
    },
    [activeLiveStatsGame, pathname, user]
  );

  const toggleLiveStats = useCallback((gameId?: string) => {
    if (gameId) {
      setActiveLiveStatsGame(gameId.toLowerCase());
    }
    setIsLiveStatsOpen((prev) => !prev);
  }, []);

  const activeStats = getGameStats(activeLiveStatsGame);
  const sessionWagered = activeStats.wagered;
  const sessionProfit = activeStats.profit;
  const sessionWins = activeStats.wins;
  const sessionLosses = activeStats.losses;

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
      const usernameParam = activeUser?.username ? `&username=${encodeURIComponent(activeUser.username)}` : "";
      const emailParam = activeUser?.email ? `&email=${encodeURIComponent(activeUser.email)}` : "";
      const res = await fetch(`/api/wallet/balance?userId=${encodeURIComponent(searchKey)}${usernameParam}${emailParam}`);
      const data = await res.json();

      if (data?.success) {
        const rawBal = Number(data.balance !== undefined ? data.balance : (data.wallet?.balance ?? 0));
        const isUsd = data.currency === "USD" || data.wallet?.currency === "USD";
        const inUsd = isUsd ? rawBal : Math.max(0, parseFloat((rawBal / 86.5).toFixed(4)));
        setRealBalance(inUsd);
        try {
          localStorage.setItem(BALANCE_STORAGE_KEY, inUsd.toString());
        } catch {}

        if (Array.isArray(data.transactions) && data.transactions.some((t: any) => t.type === "DEPOSIT" && t.status === "APPROVED")) {
          setHasVerifiedDeposit(true);
        }

        if (typeof data.totalWagered === "number" || typeof data.wallet?.totalWagered === "number") {
          const dbWagered = Math.max(0, Number(data.totalWagered ?? data.wallet?.totalWagered ?? 0));
          setTotalWagered(dbWagered);
          try {
            localStorage.setItem("stake_total_wagered", dbWagered.toString());
          } catch {}
        }
        const approvedCount = Math.max(0, Number(data.wallet?.approvedDepositCount ?? data.wallet?.depositCount ?? data.approvedDepositCount ?? 0));
        setDepositCount(approvedCount);
        const tier = Math.max(1, Math.min(4, Number(data.wallet?.unlockedBonusTier ?? data.unlockedBonusTier ?? (approvedCount + 1))));
        setUnlockedBonusTier(tier);
      }
    } catch (err) {
      console.error("[GameContext] Failed to sync wallet balance:", err);
    }
  }, [user]);

  // Initial mount & event-driven live balance sync (deposits, approval events, window focus)
  useEffect(() => {
    syncWalletBalance(true);

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
        if (!isNaN(parsed) && parsed >= 0) {
          setRealBalance(parsed);
        }
      } else {
        setRealBalance(0.00);
      }

      const savedWagered = localStorage.getItem("stake_total_wagered");
      if (savedWagered !== null) {
        const parsedWagered = parseFloat(savedWagered);
        if (!isNaN(parsedWagered) && parsedWagered >= 0) {
          setTotalWagered(parsedWagered);
        }
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
        try {
          const authData = JSON.parse(savedAuth);
          if (authData?.isAuthenticated && authData?.user?.id) {
            setIsAuthenticated(true);
            setUser(authData.user);
          } else {
            setIsAuthenticated(false);
            setUser(null);
          }
        } catch {
          setIsAuthenticated(false);
          setUser(null);
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
      if (typeof document !== "undefined") {
        document.cookie = `stake_user_id=${encodeURIComponent(profile.id || profile.username || "")}; path=/; max-age=2592000; SameSite=Lax`;
      }
    } catch {
      // ignore
    }

    setTimeout(() => {
      syncWalletBalance(true);
    }, 100);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setRealBalance(0);
    setDepositCount(0);
    setUnlockedBonusTier(1);
    setTotalWagered(0);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem("stake_active_user");
      localStorage.removeItem("stake_user_id");
      localStorage.setItem(BALANCE_STORAGE_KEY, "0");
      localStorage.setItem(CRYPTO_BALANCES_STORAGE_KEY, JSON.stringify(DEFAULT_CRYPTO_BALANCES));
      if (typeof document !== "undefined") {
        document.cookie = "stake_user_id=; path=/; max-age=0; SameSite=Lax";
      }
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

  const openWalletModal = (initialTab?: any, preselectedBonus?: string) => {
    const validTab = initialTab === "withdraw" ? "withdraw" : "deposit";
    setWalletInitialTab(validTab);
    if (typeof preselectedBonus === "string") {
      setPreselectedBonusOffer(preselectedBonus);
    }
    setIsWalletModalOpen(true);
    syncWalletBalance(true);
  };
  const closeWalletModal = () => setIsWalletModalOpen(false);

  const openWalletSettings = () => {
    setIsWalletSettingsOpen(true);
    syncWalletBalance(true);
  };
  const closeWalletSettings = () => setIsWalletSettingsOpen(false);

  const openTransactionsModal = () => {
    setIsTransactionsModalOpen(true);
    syncWalletBalance(true);
  };
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
  const activeBalance = Math.max(0, displayCryptoInFiat
    ? parseFloat((realBalance * activeCurrencyRate).toFixed(2))
    : (currency === "USDT"
        ? parseFloat(realBalance.toFixed(2))
        : (cryptoBalances[currency] !== undefined
            ? cryptoBalances[currency]
            : parseFloat((realBalance / activeCurrencyRate).toFixed(6)))));

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

    const isWager = amount < 0;
    const wagerUsd = isWager ? Math.abs(amountUsd) : 0;

    if (isWager && wagerUsd > 0) {
      setTotalWagered((prev) => {
        const next = parseFloat((prev + wagerUsd).toFixed(4));
        try {
          localStorage.setItem("stake_total_wagered", next.toString());
        } catch {}
        return next;
      });
    }

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
          ...(wagerUsd > 0 ? { wagerAmount: parseFloat((wagerUsd * 86.5).toFixed(2)) } : {}),
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

  const incrementTotalWagered = useCallback((amountUsd: number) => {
    if (amountUsd <= 0) return;
    setTotalWagered((prev) => {
      const next = parseFloat((prev + amountUsd).toFixed(4));
      try {
        localStorage.setItem("stake_total_wagered", next.toString());
      } catch {}
      return next;
    });
  }, []);

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
    const target = Math.max(0, val !== undefined ? val : activeBalance);
    return target.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: displayCryptoInFiat ? 2 : (currentCryptoObj?.decimals || 2),
    });
  };

  // Formats display balance based on user fiat settings or crypto
  const formatDisplayBalance = (valUsd?: number): DisplayBalanceInfo => {
    const usdAmount = Math.max(0, valUsd !== undefined ? valUsd : realBalance);

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
        setRealBalance,
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
        walletInitialTab,
        preselectedBonusOffer,
        depositCount,
        approvedDepositCount: depositCount,
        unlockedBonusTier,
        totalWagered,
        incrementTotalWagered,
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
        gameStats,
        getGameStats,
        sessionWagered,
        sessionProfit,
        sessionWins,
        sessionLosses,
        resetSessionStats,
        recordSessionBet,
        isLiveStatsOpen,
        setIsLiveStatsOpen,
        toggleLiveStats,
        activeLiveStatsGame,
        setActiveLiveStatsGame,
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

export function useLiveStats(gameId?: string) {
  const {
    gameStats,
    getGameStats,
    resetSessionStats,
    recordSessionBet,
    isLiveStatsOpen,
    setIsLiveStatsOpen,
    toggleLiveStats,
    activeLiveStatsGame,
    setActiveLiveStatsGame,
  } = useGame();

  const currentStats = getGameStats(gameId);

  return {
    gameStats,
    stats: currentStats,
    sessionWagered: currentStats.wagered,
    sessionProfit: currentStats.profit,
    sessionWins: currentStats.wins,
    sessionLosses: currentStats.losses,
    resetSessionStats: () => resetSessionStats(gameId),
    recordSessionBet: (wager: number, payout: number, explicitIsWin?: boolean) =>
      recordSessionBet(wager, payout, explicitIsWin, gameId),
    isLiveStatsOpen,
    setIsLiveStatsOpen,
    toggleLiveStats: () => toggleLiveStats(gameId),
    activeLiveStatsGame,
    setActiveLiveStatsGame,
  };
}

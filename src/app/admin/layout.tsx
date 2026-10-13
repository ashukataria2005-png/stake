"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { StakeLogo } from "@/components/common/StakeLogo";
import {
  LayoutDashboard,
  CreditCard,
  Users,
  Sliders,
  Gift,
  Landmark,
  ShieldCheck,
  Settings,
  Menu,
  X,
  LogOut,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Bell,
  Crown,
} from "lucide-react";

interface AdminUser {
  id: string;
  username: string;
  role: string;
}

const NAV_ITEMS = [
  {
    name: "Dashboard",
    sub: "Mission Control Overview",
    href: "/admin",
    icon: LayoutDashboard,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    activeColor: "bg-amber-500/15 border-amber-500/40 text-amber-300",
  },
  {
    name: "Payments & Verify",
    sub: "Deposit & Withdrawal Desk",
    href: "/admin/transactions",
    icon: CreditCard,
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/30",
    activeColor: "bg-violet-500/15 border-violet-500/40 text-violet-300",
  },
  {
    name: "User Directory",
    sub: "Profiles & Balances",
    href: "/admin/users",
    icon: Users,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/30",
    activeColor: "bg-cyan-500/15 border-cyan-500/40 text-cyan-300",
  },
  {
    name: "Games & RTP Luck Control",
    sub: "House Edge & Multipliers",
    href: "/admin/luck-control",
    icon: Sliders,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    activeColor: "bg-emerald-500/15 border-emerald-500/40 text-emerald-300",
  },
  {
    name: "Promos & Rewards",
    sub: "Coupons & Campaign Drops",
    href: "/admin/promotions",
    icon: Gift,
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/30",
    activeColor: "bg-rose-500/15 border-rose-500/40 text-rose-300",
  },
  {
    name: "Finance & Ledger",
    sub: "Cashflow & Reserves",
    href: "/admin/finance",
    icon: Landmark,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    activeColor: "bg-amber-500/15 border-amber-500/40 text-amber-300",
  },
  {
    name: "Admin Team & Security",
    sub: "Access Keys & Roles",
    href: "/admin/security",
    icon: ShieldCheck,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/30",
    activeColor: "bg-cyan-500/15 border-cyan-500/40 text-cyan-300",
  },
  {
    name: "Platform Settings",
    sub: "Neon Database & Gateways",
    href: "/admin/settings",
    icon: Settings,
    color: "text-slate-400",
    bg: "bg-slate-500/10",
    border: "border-slate-500/30",
    activeColor: "bg-slate-500/15 border-slate-500/40 text-slate-200",
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const isLoginPage = pathname === "/admin/login";

  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(!isLoginPage);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [pendingDepositsCount, setPendingDepositsCount] = useState<number>(0);

  // Authenticate admin on mount & route change
  useEffect(() => {
    if (isLoginPage) {
      setIsLoadingAuth(false);
      return;
    }

    let isMounted = true;

    async function verifyAuth() {
      try {
        const res = await fetch("/api/admin/auth/me");
        const data = await res.json();
        if (!data?.authenticated) {
          if (isMounted) router.replace("/admin/login");
          return;
        }
        if (isMounted) {
          setAdminUser(data.admin);
          setIsLoadingAuth(false);
        }
      } catch (err) {
        if (isMounted) router.replace("/admin/login");
      }
    }

    verifyAuth();

    return () => {
      isMounted = false;
    };
  }, [pathname, isLoginPage, router]);

  // Poll pending deposits for Bell notification
  useEffect(() => {
    if (isLoginPage) return;

    let isMounted = true;

    async function fetchPendingCount() {
      try {
        const res = await fetch("/api/admin/metrics");
        const data = await res.json();
        if (isMounted && data?.success && data?.metrics) {
          setPendingDepositsCount(data.metrics.pendingDepositsCount ?? 0);
        }
      } catch {}
    }

    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isLoginPage]);

  // Close drawer whenever route changes
  useEffect(() => {
    setIsDrawerOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } catch {}
    router.replace("/admin/login");
  };

  // If on /admin/login, render standalone without shell
  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-[#090a0f] text-slate-100 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-amber-400" />
          <p className="text-xs font-mono text-slate-400">Loading Mission Control...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* CSS Bell shake animation */}
      <style jsx global>{`
        @keyframes bellWiggle {
          0%, 100% { transform: rotate(0deg); }
          15% { transform: rotate(14deg); }
          30% { transform: rotate(-14deg); }
          45% { transform: rotate(10deg); }
          60% { transform: rotate(-10deg); }
          75% { transform: rotate(4deg); }
          90% { transform: rotate(-4deg); }
        }
        .bell-vibrate {
          animation: bellWiggle 0.8s ease-in-out infinite;
          transform-origin: top center;
        }
      `}</style>

      {/* ========================================================
          1. TOP MISSION-CONTROL HEADER
          ======================================================== */}
      <header className="sticky top-0 z-40 bg-[#0e1017]/95 backdrop-blur-md border-b border-[#1e2433] px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between relative">
          {/* Left: Pill-styled [☰ Menu] Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDrawerOpen(true)}
              aria-label="Open Navigation Menu"
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#131722] hover:bg-[#1c2233] text-slate-200 border border-[#1e2433] text-xs font-semibold transition-all active:scale-95 shadow-sm"
            >
              <Menu className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Menu</span>
            </button>
          </div>

          {/* Center: EXACT Stake "S" Logo ONLY */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
            <Link
              href="/admin"
              aria-label="Stake Admin Dashboard"
              className="hover:opacity-85 transition-opacity flex items-center justify-center"
            >
              <StakeLogo collapsed={true} className="h-7 sm:h-8 w-auto text-white" />
            </Link>
          </div>

          {/* Right: Pending Bell with ₹ Symbol + Clean Sign Out Icon Only */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* PENDING REQUESTS BELL ICON WITH "₹" SYMBOL */}
            <Link
              href="/admin/transactions"
              title="Pending Recharge Requests Desk"
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border transition-all active:scale-95 ${
                pendingDepositsCount > 0
                  ? "bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-sm shadow-amber-500/10"
                  : "bg-[#131722] hover:bg-[#1c2233] border-[#1e2433] text-slate-400"
              }`}
            >
              <Bell
                className={`w-4 h-4 text-amber-400 ${
                  pendingDepositsCount > 0 ? "bell-vibrate" : ""
                }`}
              />
              <span className="font-black text-xs font-mono text-amber-300">₹</span>
              {pendingDepositsCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-500 text-white font-mono animate-pulse">
                  {pendingDepositsCount}
                </span>
              )}
            </Link>

            {/* Clean Logout / Signout Icon Button Only (No text) */}
            <button
              onClick={handleLogout}
              aria-label="Sign Out"
              title="Sign Out"
              className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/30 transition-all active:scale-95 shadow-sm"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================
          2. SLIDE-OUT MENU DRAWER
          ======================================================== */}
      {isDrawerOpen && (
        <div
          onClick={() => setIsDrawerOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 transition-opacity"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-[#0e1017] border-r border-[#1e2433] flex flex-col z-50 shadow-2xl transition-transform duration-300 ease-in-out ${
          isDrawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-[#1e2433] flex items-center justify-between bg-[#131722]/50">
          <div className="flex items-center gap-2.5">
            <StakeLogo collapsed={true} className="h-7 w-auto text-white" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm tracking-wider text-white">
                  Stake <span className="text-amber-400">Admin</span>
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono">Mission-Control Hub</p>
            </div>
          </div>

          <button
            onClick={() => setIsDrawerOpen(false)}
            aria-label="Close Navigation Menu"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1e2433] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Nav Items */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-1.5 custom-scrollbar">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
            Navigation Modules
          </div>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium transition-all group ${
                  isActive
                    ? item.activeColor
                    : "border-transparent hover:border-[#1e2433] hover:bg-[#131722] text-slate-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center border ${item.bg} ${item.border} ${item.color}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className={`font-semibold ${isActive ? "text-white" : "text-slate-200"}`}>
                      {item.name}
                    </p>
                    <p className="text-[10px] text-slate-500 group-hover:text-slate-400 font-mono">
                      {item.sub}
                    </p>
                  </div>
                </div>
                <ChevronRight
                  className={`w-4 h-4 text-slate-600 transition-transform group-hover:translate-x-0.5 ${
                    isActive ? "text-amber-400" : ""
                  }`}
                />
              </Link>
            );
          })}
        </div>

        {/* Pinned Drawer Footer: Super Admin Profile Card */}
        <div className="p-4 border-t border-[#1e2433] bg-[#131722]/80">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500/20 to-amber-400/30 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-sm">
                  <Crown className="w-5 h-5 text-amber-400" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0e1017]" />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-white capitalize">
                    {adminUser?.username || "Super Admin"}
                  </p>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    SUPER
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-mono">
                  {adminUser?.role || "SUPER_ADMIN"}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-all active:scale-98"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>

      {/* ========================================================
          3. MAIN CONTENT CONTAINER
          ======================================================== */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>

      {/* ========================================================
          4. SUBTLE FOOTER
          ======================================================== */}
      <footer className="border-t border-[#1e2433] py-4 px-6 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Stake Mission Control Live Engine</span>
          </div>
          <span>Neon PostgreSQL • TLS 1.3 Guarded</span>
        </div>
      </footer>
    </div>
  );
}

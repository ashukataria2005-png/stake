"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  ArrowDownCircle,
  ArrowUpCircle,
  Users,
  Sliders,
  Settings,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  Database,
  RefreshCw,
  Bell,
  Clock,
} from "lucide-react";
import { sounds } from "@/utils/audio";

interface AdminUser {
  id: string;
  username: string;
  role: string;
}

const NAV_ITEMS = [
  {
    name: "Dashboard",
    description: "System overview & stats",
    href: "/admin",
    icon: LayoutDashboard,
    badge: "Home",
  },
  {
    name: "Deposit Requests",
    description: "UTR & slip verification",
    href: "/admin/transactions",
    icon: ArrowDownCircle,
    badge: "Deposits",
  },
  {
    name: "Withdrawal Requests",
    description: "Payout approval desk",
    href: "/admin/withdrawals",
    icon: ArrowUpCircle,
    badge: "Payouts",
  },
  {
    name: "User Management",
    description: "Balances & user directory",
    href: "/admin/users",
    icon: Users,
    badge: "Users",
  },
  {
    name: "Luck & Outcome Control",
    description: "Per-user RTP & Win Rate",
    href: "/admin/luck-control",
    icon: Sliders,
    badge: "RTP",
  },
  {
    name: "System Settings",
    description: "Security & configurations",
    href: "/admin/settings",
    icon: Settings,
    badge: null,
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const isLoginPage = pathname === "/admin/login";

  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(!isLoginPage);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pendingBadge, setPendingBadge] = useState<number>(0);

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

        // Fetch quick pending count
        const mRes = await fetch("/api/admin/metrics");
        const mData = await mRes.json();
        if (mData?.success && mData?.metrics?.pendingTotalCount !== undefined) {
          setPendingBadge(mData.metrics.pendingTotalCount);
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

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    sounds.playClick();
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } catch {}
    router.replace("/admin/login");
  };

  // If on /admin/login, render without sidebar shell
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Loading authorization state
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-[#0d131a] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-[#00e701]" />
          <p className="text-xs font-mono text-slate-400">Verifying administrator credentials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d131a] text-slate-100 flex flex-col font-sans selection:bg-[#00e701] selection:text-black">
      {/* TOP HEADER NAVBAR (Replicating reference navbar) */}
      <header className="h-16 bg-[#131b24] border-b border-[#212f3d] flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40 shadow-lg">
        {/* Left: Brand & Collapse Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-[#1a2530] text-slate-300 hover:text-white"
            title="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="hidden md:flex p-2 rounded-lg bg-[#1a2530] hover:bg-[#233140] text-slate-300 hover:text-white transition-colors border border-[#263747]"
            title="Toggle Sidebar"
          >
            <Menu className="w-4 h-4" />
          </button>

          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#00e701] flex items-center justify-center font-black text-black text-base shadow-[0_0_15px_rgba(0,231,1,0.35)]">
              S
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-white text-sm tracking-wide flex items-center gap-1.5">
                STAKE ADMIN <span className="text-[10px] bg-[#00e701]/20 text-[#00e701] px-1.5 py-0.2 rounded font-mono">PORTAL</span>
              </span>
              <span className="text-[10px] text-slate-400 hidden sm:inline">Management Console & Ledger</span>
            </div>
          </Link>
        </div>

        {/* Right: DB Status, Clock, Live View & Logout */}
        <div className="flex items-center gap-3">
          {/* Neon DB Status */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#17222d] border border-[#253646] text-xs">
            <Database className="w-3.5 h-3.5 text-[#00e701]" />
            <span className="text-slate-300 font-medium text-[11px]">Neon DB:</span>
            <span className="inline-block w-2 h-2 rounded-full bg-[#00e701] animate-pulse" />
            <span className="text-[11px] font-bold text-[#00e701]">Connected</span>
          </div>

          {/* Pending Alerts Badge */}
          {pendingBadge > 0 && (
            <Link
              href="/admin/transactions"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold hover:bg-amber-500/25 transition-colors"
            >
              <Bell className="w-3.5 h-3.5 animate-bounce" />
              <span>{pendingBadge} Pending</span>
            </Link>
          )}

          {/* Public Platform Link */}
          <Link
            href="/casino/home"
            target="_blank"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a2530] hover:bg-[#233140] text-slate-300 hover:text-white text-xs font-semibold border border-[#263747] transition-colors"
          >
            <span>Live Casino</span>
            <ExternalLink className="w-3 h-3" />
          </Link>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 hover:text-rose-300 border border-rose-500/30 text-xs font-bold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* PORTAL BODY CONTAINER */}
      <div className="flex-1 flex overflow-hidden">
        {/* DESKTOP SIDEBAR */}
        <aside
          className={`hidden md:flex flex-col bg-[#131b24] border-r border-[#212f3d] transition-all duration-200 z-30 ${
            isSidebarCollapsed ? "w-18" : "w-64"
          }`}
        >
          {/* User Profile Card (Replicating MRCoder / DEVELOPER 0 card) */}
          <div className="p-4 border-b border-[#212f3d] bg-[#0f171f]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-black text-sm shadow-md shrink-0">
                {adminUser?.username?.[0]?.toUpperCase() || "A"}
              </div>
              {!isSidebarCollapsed && (
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white text-sm truncate">
                      {adminUser?.username || "DEVELOPER 0"}
                    </span>
                    <ShieldCheck className="w-3.5 h-3.5 text-[#00e701] shrink-0" />
                  </div>
                  <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                    {adminUser?.role || "Super Admin"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    isActive
                      ? "bg-[#00e701] text-black font-extrabold shadow-[0_2px_12px_rgba(0,231,1,0.25)]"
                      : "text-slate-300 hover:bg-[#1a2530] hover:text-white"
                  }`}
                  title={isSidebarCollapsed ? item.name : undefined}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-black" : "text-slate-400 group-hover:text-white"}`} />
                  {!isSidebarCollapsed && (
                    <div className="flex-1 flex items-center justify-between min-w-0">
                      <span className="truncate">{item.name}</span>
                      {item.badge && (
                        <span
                          className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded ${
                            isActive
                              ? "bg-black/20 text-black"
                              : "bg-[#1f2b38] text-slate-400"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer Info */}
          {!isSidebarCollapsed && (
            <div className="p-3 border-t border-[#212f3d] bg-[#0f171f] text-[10px] text-slate-500 text-center">
              Powered by Next.js & Neon PostgreSQL
            </div>
          )}
        </aside>

        {/* MOBILE DRAWER OVERLAY */}
        {isMobileMenuOpen && (
          <div
            className="md:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div
              className="w-72 bg-[#131b24] h-full p-4 flex flex-col border-r border-[#212f3d]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-4 border-b border-[#212f3d]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#00e701] flex items-center justify-center font-bold text-black text-sm">
                    S
                  </div>
                  <span className="font-bold text-white text-sm">STAKE ADMIN</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 py-4 space-y-1.5 overflow-y-auto">
                {NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                        isActive
                          ? "bg-[#00e701] text-black font-extrabold"
                          : "text-slate-300 hover:bg-[#1a2530] hover:text-white"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              <button
                onClick={handleLogout}
                className="w-full py-2.5 bg-rose-500/20 text-rose-400 font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-rose-500/30"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}

        {/* MAIN CONTENT WORKSPACE */}
        <main className="flex-1 overflow-y-auto bg-[#0a0f14] p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}

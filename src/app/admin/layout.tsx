"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Users,
  Gamepad2,
  Tag,
  Settings,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  ExternalLink,
  Activity,
  RefreshCw,
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
    href: "/admin",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    name: "Deposits & Withdrawals",
    href: "/admin/transactions",
    icon: ArrowLeftRight,
    badge: "Live",
  },
  {
    name: "Users & Luck Controller",
    href: "/admin/users",
    icon: Users,
    badge: "RTP",
  },
  {
    name: "Games & Providers",
    href: "/admin/games-management",
    icon: Gamepad2,
    badge: null,
  },
  {
    name: "Promotions & Codes",
    href: "/admin/promotions",
    icon: Tag,
    badge: null,
  },
  {
    name: "Settings & Export",
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      <div className="min-h-screen bg-[#0f212e] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-[#00e701]" />
          <p className="text-xs font-mono text-[#b1bad3]">Verifying administrator credentials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f212e] text-white flex flex-col font-sans selection:bg-[#00e701] selection:text-black">
      {/* Top Admin Header */}
      <header className="h-16 bg-[#1a2c38] border-b border-[#213743] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 shrink-0">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-[#b1bad3] hover:text-white hover:bg-[#213743] transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Desktop Sidebar Toggle */}
          <button
            type="button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="hidden lg:flex p-2 rounded-xl text-[#b1bad3] hover:text-white hover:bg-[#213743] transition-colors cursor-pointer"
            aria-label="Toggle sidebar collapse"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Brand & Badge */}
          <div className="flex items-center gap-2.5">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#00e701]/10 border border-[#00e701]/30 text-[#00e701] flex items-center justify-center font-black">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="font-black text-base text-white tracking-tight">Stake</span>
            </Link>
            <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-[#00e701]/10 text-[#00e701] border border-[#00e701]/30 text-[10px] font-black uppercase tracking-wider">
              Super Admin
            </span>
          </div>
        </div>

        {/* Right Header Section: System Status & User & Logout */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Live System Indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0f212e] border border-[#213743] text-xs">
            <div className="w-2 h-2 rounded-full bg-[#00e701] animate-pulse" />
            <span className="text-[#b1bad3] font-mono text-[11px]">Neon DB: Online</span>
          </div>

          {/* View Public Casino Lobby Link */}
          <Link
            href="/"
            target="_blank"
            className="hidden md:flex items-center gap-1.5 text-xs text-[#b1bad3] hover:text-white transition-colors"
            title="Open Casino Home"
          >
            <span>Live Casino</span>
            <ExternalLink className="w-3 h-3 text-[#557086]" />
          </Link>

          {/* Admin User Info */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-[#213743]/60 border border-[#213743]">
            <div className="w-6 h-6 rounded-full bg-[#1475e1] text-white flex items-center justify-center font-bold text-xs uppercase">
              {adminUser?.username?.[0] || "A"}
            </div>
            <span className="text-xs font-bold text-white max-w-[100px] truncate">
              {adminUser?.username || "Admin"}
            </span>
          </div>

          {/* Logout Action Button */}
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold transition-all cursor-pointer"
            title="Sign out of Admin Terminal"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        {/* Desktop Sidebar */}
        <aside
          className={`hidden lg:flex flex-col bg-[#14232e] border-r border-[#213743] transition-all duration-300 shrink-0 select-none ${
            isSidebarOpen ? "w-64" : "w-20"
          }`}
        >
          <div className="p-3 space-y-1.5 flex-1">
            <div className="px-3 py-2 text-[10px] font-black uppercase tracking-wider text-[#557086]">
              {isSidebarOpen ? "Management Terminal" : "•••"}
            </div>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-[#00e701] text-[#0f212e] shadow-md font-black"
                      : "text-[#b1bad3] hover:text-white hover:bg-[#1a2c38]"
                  }`}
                  title={item.name}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-[#0f212e]" : "text-[#557086]"}`} />
                  {isSidebarOpen && (
                    <div className="flex items-center justify-between flex-1">
                      <span className="truncate">{item.name}</span>
                      {item.badge && (
                        <span
                          className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                            isActive
                              ? "bg-[#0f212e] text-[#00e701]"
                              : "bg-[#213743] text-[#00e701] border border-[#00e701]/20"
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
          </div>

          {/* Sidebar Footer info */}
          {isSidebarOpen && (
            <div className="p-4 border-t border-[#213743] text-[11px] text-[#557086] space-y-0.5 font-mono">
              <p className="text-white font-bold">Admin Console</p>
              <p>Stake Engine v2.5.0</p>
            </div>
          )}
        </aside>

        {/* Mobile Slide-over Drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/75 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Drawer Content */}
            <div className="relative w-72 max-w-[80vw] bg-[#14232e] border-r border-[#213743] p-4 flex flex-col h-full z-10 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#213743]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#00e701]/10 text-[#00e701] flex items-center justify-center font-bold">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="font-black text-sm text-white">Admin Terminal</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-[#b1bad3] hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1.5 flex-1 overflow-y-auto">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? "bg-[#00e701] text-[#0f212e] font-black"
                          : "text-[#b1bad3] hover:text-white hover:bg-[#1a2c38]"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="flex-1">{item.name}</span>
                      {item.badge && (
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-[#213743] text-[#00e701]">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/30 font-bold text-xs"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        )}

        {/* Main Admin Content Container */}
        <main className="flex-1 min-w-0 bg-[#0f212e] overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

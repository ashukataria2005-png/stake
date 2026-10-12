"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  ArrowUpRight,
  Sliders,
  Gift,
  QrCode,
  DollarSign,
  Key,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  LogOut,
  Bell,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

interface AdminUser {
  id: string;
  username: string;
  role: string;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const isLoginPage = pathname === "/admin/login";

  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(!isLoginPage);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [openSubmenus, setOpenSubmenus] = useState<{ [key: string]: boolean }>({
    users: pathname.startsWith("/admin/users"),
    deposits: pathname.startsWith("/admin/transactions"),
    withdrawals: pathname.startsWith("/admin/withdrawals"),
    games: pathname.startsWith("/admin/luck-control"),
  });
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

  const toggleSubmenu = (menuKey: string) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [menuKey]: !prev[menuKey],
    }));
  };

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
      <div className="min-h-screen bg-[#131414] text-white flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-[#007bff]" />
          <p className="text-xs font-mono text-slate-400">Loading Admin Console...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7fa] dark:bg-[#0a0a0a] text-slate-100 flex flex-col font-sans">
      {/* ========================================================
          1. TOP NAVBAR (Replicated from referrenceadmin navbar)
          ======================================================== */}
      <nav className="h-[60px] bg-[#131414] border-b border-[#23272b] flex items-center justify-between px-4 sticky top-0 z-50 shadow-md">
        {/* Left: Brand Logo + Sidebar Toggle */}
        <div className="flex items-center gap-4">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#007bff] flex items-center justify-center font-black text-white text-base shadow">
              A
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-white text-sm tracking-wider uppercase">
                ADMIN CONSOLE
              </span>
              <span className="text-[9px] text-[#007bff] font-mono tracking-widest font-bold">
                MANAGEMENT PORTAL
              </span>
            </div>
          </Link>

          {/* Toggle Minimize Button */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="hidden lg:flex p-1.5 rounded bg-[#1f2124] hover:bg-[#2b2e32] text-slate-300 hover:text-white transition-colors border border-[#333]"
            title="Minimize Sidebar"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-1.5 rounded bg-[#1f2124] text-slate-300 hover:text-white"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {/* Right Menu Controls */}
        <div className="flex items-center gap-3">
          {/* External Site Button */}
          <Link
            href="/casino/home"
            target="_blank"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1f2124] hover:bg-[#282b30] text-slate-300 hover:text-white text-xs font-semibold border border-[#333] transition-colors"
          >
            <span>Go To Website</span>
            <ExternalLink className="w-3 h-3 text-[#007bff]" />
          </Link>

          {/* Settings / Logout Menu */}
          <div className="flex items-center gap-2 border-l border-[#2e3238] pl-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-white leading-tight">
                {adminUser?.username || "DEVELOPER 0"}
              </div>
              <div className="text-[10px] text-[#007bff] font-semibold">Super Admin</div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white text-xs font-bold transition-all border border-rose-500/30"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ========================================================
          2. PORTAL BODY (Sidebar + Main Panel)
          ======================================================== */}
      <div className="flex-1 flex overflow-hidden">
        {/* DESKTOP SIDEBAR (Replicated from referrenceadmin compass.php) */}
        <aside
          className={`hidden lg:flex flex-col bg-[#131414] border-r border-[#23272b] transition-all duration-200 z-30 select-none ${
            isSidebarOpen ? "w-[245px]" : "w-[68px]"
          }`}
        >
          {/* User Profile Card (MRCoder.png style) */}
          <div className="py-6 px-3 border-b border-[#23272b] flex flex-col items-center text-center">
            <div className="relative mb-2">
              <img
                src="/admin/MRCoder.png"
                alt="Admin avatar"
                className="w-18 h-18 rounded-full border-2 border-white/80 object-cover shadow-lg"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
              <div className="w-4 h-4 rounded-full bg-[#00e701] border-2 border-[#131414] absolute bottom-0 right-0" />
            </div>

            {isSidebarOpen && (
              <>
                <div className="font-bold text-white text-sm tracking-wide mt-1">
                  {adminUser?.username || "DEVELOPER 0"}
                </div>
                <div className="text-[11px] text-[#007bff] font-semibold uppercase tracking-wider">
                  Admin
                </div>
              </>
            )}
          </div>

          {/* Navigation Links (Matching compass.php) */}
          <nav className="flex-1 p-2 space-y-1 overflow-y-auto text-xs">
            {/* 1. Dashboard */}
            <Link
              href="/admin"
              className={`flex items-center gap-3 px-3 py-2.5 rounded transition-colors ${
                pathname === "/admin"
                  ? "bg-[#007bff] text-white font-bold"
                  : "text-slate-300 hover:bg-[#1f2124] hover:text-white"
              }`}
              title="Dashboard"
            >
              <LayoutDashboard className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-white" />
              {isSidebarOpen && <span className="font-medium truncate">Dashboard</span>}
            </Link>

            {/* 2. User Management (Collapsible) */}
            <div>
              <button
                onClick={() => toggleSubmenu("users")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded transition-colors ${
                  pathname.startsWith("/admin/users")
                    ? "bg-[#1f2124] text-white font-bold"
                    : "text-slate-300 hover:bg-[#1f2124] hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 shrink-0 text-slate-400" />
                  {isSidebarOpen && <span className="font-medium">User Management</span>}
                </div>
                {isSidebarOpen && (
                  openSubmenus.users ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>

              {isSidebarOpen && openSubmenus.users && (
                <div className="pl-9 pr-2 py-1 space-y-1 bg-[#0d0e0e] rounded my-1 text-[11px]">
                  <Link
                    href="/admin/users"
                    className={`block py-1.5 px-2 rounded hover:text-white transition-colors ${
                      pathname === "/admin/users" ? "text-[#007bff] font-bold" : "text-slate-400"
                    }`}
                  >
                    • All Users (manage_user)
                  </Link>
                  <Link
                    href="/admin/users?filter=banned"
                    className="block py-1.5 px-2 rounded text-slate-400 hover:text-white transition-colors"
                  >
                    • Banned Users
                  </Link>
                  <Link
                    href="/admin/users?action=new"
                    className="block py-1.5 px-2 rounded text-slate-400 hover:text-white transition-colors"
                  >
                    • Add User (addadmin)
                  </Link>
                </div>
              )}
            </div>

            {/* 3. Deposit / Recharge Requests (Collapsible) */}
            <div>
              <button
                onClick={() => toggleSubmenu("deposits")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded transition-colors ${
                  pathname.startsWith("/admin/transactions")
                    ? "bg-[#1f2124] text-white font-bold"
                    : "text-slate-300 hover:bg-[#1f2124] hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-4 h-4 shrink-0 text-slate-400" />
                  {isSidebarOpen && <span className="font-medium">Deposit Requests</span>}
                </div>
                {isSidebarOpen && (
                  openSubmenus.deposits ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>

              {isSidebarOpen && openSubmenus.deposits && (
                <div className="pl-9 pr-2 py-1 space-y-1 bg-[#0d0e0e] rounded my-1 text-[11px]">
                  <Link
                    href="/admin/transactions"
                    className={`block py-1.5 px-2 rounded hover:text-white transition-colors ${
                      pathname === "/admin/transactions" ? "text-[#007bff] font-bold" : "text-slate-400"
                    }`}
                  >
                    • Deposit Update (deposite.php)
                  </Link>
                  <Link
                    href="/admin/transactions?tab=PENDING"
                    className="block py-1.5 px-2 rounded text-slate-400 hover:text-white transition-colors"
                  >
                    • Pending Approvals
                  </Link>
                </div>
              )}
            </div>

            {/* 4. Withdrawal Requests (Collapsible) */}
            <div>
              <button
                onClick={() => toggleSubmenu("withdrawals")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded transition-colors ${
                  pathname.startsWith("/admin/withdrawals")
                    ? "bg-[#1f2124] text-white font-bold"
                    : "text-slate-300 hover:bg-[#1f2124] hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <ArrowUpRight className="w-4 h-4 shrink-0 text-slate-400" />
                  {isSidebarOpen && <span className="font-medium">Withdrawal Desk</span>}
                </div>
                {isSidebarOpen && (
                  openSubmenus.withdrawals ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>

              {isSidebarOpen && openSubmenus.withdrawals && (
                <div className="pl-9 pr-2 py-1 space-y-1 bg-[#0d0e0e] rounded my-1 text-[11px]">
                  <Link
                    href="/admin/withdrawals"
                    className={`block py-1.5 px-2 rounded hover:text-white transition-colors ${
                      pathname === "/admin/withdrawals" ? "text-[#007bff] font-bold" : "text-slate-400"
                    }`}
                  >
                    • Withdraw Apply
                  </Link>
                  <Link
                    href="/admin/withdrawals?status=APPROVED"
                    className="block py-1.5 px-2 rounded text-slate-400 hover:text-white transition-colors"
                  >
                    • Withdraw Sent
                  </Link>
                  <Link
                    href="/admin/withdrawals?status=REJECTED"
                    className="block py-1.5 px-2 rounded text-slate-400 hover:text-white transition-colors"
                  >
                    • Withdraw Reject
                  </Link>
                </div>
              )}
            </div>

            {/* 5. Game Result & Win/Loss Control */}
            <div>
              <button
                onClick={() => toggleSubmenu("games")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded transition-colors ${
                  pathname.startsWith("/admin/luck-control")
                    ? "bg-[#1f2124] text-white font-bold"
                    : "text-slate-300 hover:bg-[#1f2124] hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Sliders className="w-4 h-4 shrink-0 text-slate-400" />
                  {isSidebarOpen && <span className="font-medium">Win/Loss Control</span>}
                </div>
                {isSidebarOpen && (
                  openSubmenus.games ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>

              {isSidebarOpen && openSubmenus.games && (
                <div className="pl-9 pr-2 py-1 space-y-1 bg-[#0d0e0e] rounded my-1 text-[11px]">
                  <Link
                    href="/admin/luck-control"
                    className={`block py-1.5 px-2 rounded hover:text-white transition-colors ${
                      pathname === "/admin/luck-control" ? "text-[#007bff] font-bold" : "text-slate-400"
                    }`}
                  >
                    • Game RTP Engine
                  </Link>
                  <Link
                    href="/admin/users"
                    className="block py-1.5 px-2 rounded text-slate-400 hover:text-white transition-colors"
                  >
                    • Per-User Luck Desk
                  </Link>
                </div>
              )}
            </div>

            {/* 6. Gift Cards & Bonus */}
            <Link
              href="/admin/promotions"
              className={`flex items-center gap-3 px-3 py-2.5 rounded transition-colors ${
                pathname === "/admin/promotions"
                  ? "bg-[#007bff] text-white font-bold"
                  : "text-slate-300 hover:bg-[#1f2124] hover:text-white"
              }`}
            >
              <Gift className="w-4 h-4 shrink-0 text-slate-400" />
              {isSidebarOpen && <span className="font-medium">Gift Code & Bonus</span>}
            </Link>

            {/* 7. Payment Channels (UPI / QR / USDT) */}
            <Link
              href="/admin/settings"
              className={`flex items-center gap-3 px-3 py-2.5 rounded transition-colors ${
                pathname === "/admin/settings"
                  ? "bg-[#007bff] text-white font-bold"
                  : "text-slate-300 hover:bg-[#1f2124] hover:text-white"
              }`}
            >
              <QrCode className="w-4 h-4 shrink-0 text-slate-400" />
              {isSidebarOpen && <span className="font-medium">Payment Channels</span>}
            </Link>

            {/* 8. Salary & Agent Commission */}
            <Link
              href="/admin/salary"
              className={`flex items-center gap-3 px-3 py-2.5 rounded transition-colors ${
                pathname === "/admin/salary"
                  ? "bg-[#007bff] text-white font-bold"
                  : "text-slate-300 hover:bg-[#1f2124] hover:text-white"
              }`}
            >
              <DollarSign className="w-4 h-4 shrink-0 text-slate-400" />
              {isSidebarOpen && <span className="font-medium">Daily Salary</span>}
            </Link>

            {/* 9. Admin Credentials & Settings */}
            <Link
              href="/admin/settings"
              className="flex items-center gap-3 px-3 py-2.5 rounded text-slate-300 hover:bg-[#1f2124] hover:text-white transition-colors"
            >
              <Key className="w-4 h-4 shrink-0 text-slate-400" />
              {isSidebarOpen && <span className="font-medium">Admin Password</span>}
            </Link>
          </nav>
        </aside>

        {/* MOBILE DRAWER */}
        {isMobileMenuOpen && (
          <div
            className="lg:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div
              className="w-68 bg-[#131414] h-full p-4 flex flex-col border-r border-[#23272b]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-4 border-b border-[#23272b]">
                <span className="font-bold text-white text-sm">ADMIN CONSOLE</span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 rounded text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-4 text-center border-b border-[#23272b]">
                <img
                  src="/admin/MRCoder.png"
                  alt="Admin"
                  className="w-14 h-14 rounded-full mx-auto mb-2 border-2 border-white object-cover"
                />
                <div className="font-bold text-white text-xs">{adminUser?.username || "DEVELOPER 0"}</div>
                <div className="text-[10px] text-[#007bff]">Super Admin</div>
              </div>

              <nav className="flex-1 py-3 space-y-1 text-xs overflow-y-auto">
                <Link
                  href="/admin"
                  className="block px-3 py-2 rounded text-slate-300 hover:bg-[#1f2124] hover:text-white"
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/users"
                  className="block px-3 py-2 rounded text-slate-300 hover:bg-[#1f2124] hover:text-white"
                >
                  User Management
                </Link>
                <Link
                  href="/admin/transactions"
                  className="block px-3 py-2 rounded text-slate-300 hover:bg-[#1f2124] hover:text-white"
                >
                  Deposit Requests
                </Link>
                <Link
                  href="/admin/withdrawals"
                  className="block px-3 py-2 rounded text-slate-300 hover:bg-[#1f2124] hover:text-white"
                >
                  Withdrawal Requests
                </Link>
                <Link
                  href="/admin/luck-control"
                  className="block px-3 py-2 rounded text-slate-300 hover:bg-[#1f2124] hover:text-white"
                >
                  Win/Loss Control
                </Link>
                <Link
                  href="/admin/promotions"
                  className="block px-3 py-2 rounded text-slate-300 hover:bg-[#1f2124] hover:text-white"
                >
                  Gift Code & Bonus
                </Link>
                <Link
                  href="/admin/settings"
                  className="block px-3 py-2 rounded text-slate-300 hover:bg-[#1f2124] hover:text-white"
                >
                  Payment Channels
                </Link>
                <Link
                  href="/admin/salary"
                  className="block px-3 py-2 rounded text-slate-300 hover:bg-[#1f2124] hover:text-white"
                >
                  Daily Salary
                </Link>
                <Link
                  href="/casino/home"
                  target="_blank"
                  className="block px-3 py-2 rounded text-[#007bff] font-bold"
                >
                  Go To Website →
                </Link>
              </nav>

              <button
                onClick={handleLogout}
                className="w-full py-2 bg-rose-600 text-white font-bold text-xs rounded"
              >
                Logout
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            3. MAIN CONTENT WORKSPACE
            ======================================================== */}
        <main className="flex-1 overflow-y-auto bg-[#0a0a0a] p-4 sm:p-6 lg:p-8">
          <div className="max-w-[1400px] mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}

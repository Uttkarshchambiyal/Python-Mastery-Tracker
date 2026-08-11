"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Zap,
  LayoutDashboard,
  BookOpen,
  Trophy,
  BarChart2,
  Settings,
  Flame,
  Search,
  Moon,
  Sun,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { CommandPalette } from "@/components/ui/command-palette";
import { AuthModal } from "@/components/auth-modal";
import { getUserSettings, saveUserSettings } from "@/lib/storage";
import { useAuth } from "@/components/auth-provider";
import { useTheme } from "next-themes";

function GoogleIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export function AppHeader({ streak = 0 }: { streak?: number }) {
  const pathname = usePathname();
  const { setTheme: setNextTheme, resolvedTheme } = useTheme();
  const { user, signOut, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const s = await getUserSettings();
      if (s.theme) {
        setNextTheme(s.theme);
      }
    };
    loadSettings();
  }, [setNextTheme]);

  const toggleTheme = async () => {
    const nextTheme = resolvedTheme === "dark" ? "light" : "dark";
    setNextTheme(nextTheme);
    await saveUserSettings({ theme: nextTheme });
  };

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
    { name: "Curriculum", href: "/curriculum", icon: <BookOpen className="h-4 w-4" /> },
    { name: "Projects", href: "/projects", icon: <Trophy className="h-4 w-4" /> },
    { name: "Insights", href: "/insights", icon: <BarChart2 className="h-4 w-4" /> },
    { name: "Journal", href: "/journal", icon: <BookOpen className="h-4 w-4" /> },
    { name: "Settings", href: "/settings", icon: <Settings className="h-4 w-4" /> },
  ];

  const userAvatar = user?.user_metadata?.avatar_url;
  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#0038FF]/85 dark:bg-[#0A0E1A]/85 backdrop-blur-xl border-b border-white/20 dark:border-[#6A5AE0]/30 px-4 md:px-8 py-3.5 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
          {/* Brand Logo matching Landing Hero */}
          <Link href="/" className="flex items-center gap-1 group shrink-0 transition-transform hover:scale-105">
            <div className="bg-white text-black font-black tracking-tight text-xs md:text-sm px-3 py-1.5 rounded-2xl rounded-bl-sm relative shadow-sm">
              BASE
              <div className="absolute -bottom-1.5 left-0 w-3 h-3 bg-white" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}></div>
            </div>
            <div className="bg-[#CCFF00] text-black font-black text-xs md:text-sm px-3 py-1.5 rounded-full border-[1.5px] border-white shadow-sm">
              CLUB
            </div>
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-white/15 dark:bg-slate-900/60 p-1.5 rounded-full border border-white/30 dark:border-[#6A5AE0]/30 backdrop-blur-xl">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${isActive
                    ? "bg-[#CCFF00] text-black font-bold dark:bg-gradient-to-r dark:from-[#6A5AE0] dark:to-[#916BBF] dark:text-white shadow-lg"
                    : "text-white/90 dark:text-slate-300 dark:hover:text-white hover:bg-white/20 dark:hover:bg-indigo-600/20"
                    }`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Utility Bar: Cmd+K Search, Theme Toggle, Streak, Supabase Auth */}
          <div className="flex items-center gap-2 md:gap-2.5 shrink-0">
            {/* Cmd+K Search Trigger Button */}
            <button
              onClick={() => {
                const event = new KeyboardEvent("keydown", { key: "k", metaKey: true });
                window.dispatchEvent(event);
              }}
              className="flex items-center gap-1.5 md:gap-2 bg-white/15 dark:bg-slate-900/60 border border-white/30 dark:border-[#6A5AE0]/30 backdrop-blur-xl px-3 py-1.5 rounded-full text-xs text-white/90 dark:text-slate-300 hover:bg-white/25 transition-all focus:ring-2 focus:ring-[#CCFF00] dark:focus:ring-[#6A5AE0] focus:outline-none"
            >
              <Search className="h-3.5 w-3.5 text-[#CCFF00] dark:text-[#00D4FF]" />
              <span className="hidden md:inline">Search</span>
              <kbd className="bg-white/25 dark:bg-[#0C101D] text-[10px] px-1.5 py-0.5 rounded font-mono text-white">
                ⌘K
              </kbd>
            </button>

            {/* Dark/Light Mode Theme Toggle */}
            <button
              onClick={toggleTheme}
              title="Toggle Theme"
              className="p-1.5 rounded-full bg-white/15 dark:bg-[#121829] border border-white/30 dark:border-white/10 text-white backdrop-blur-xl hover:bg-white/25 dark:hover:border-[#00D4FF]/40 dark:hover:bg-[#0C101D] transition-all focus:ring-2 focus:ring-[#CCFF00] dark:focus:ring-[#00D4FF] focus:outline-none"
            >
              {resolvedTheme === "dark" ? (
                <Sun className="h-4 w-4 text-[#00D4FF]" />
              ) : (
                <Moon className="h-4 w-4 text-white" />
              )}
            </button>

            {/* Streak Indicator Pill */}
            <div className="hidden xl:flex items-center gap-1.5 bg-[#CCFF00]/10 border border-[#CCFF00]/30 dark:bg-[#00D4FF]/10 dark:border-[#00D4FF]/30 px-3 py-1.5 rounded-full text-xs font-bold text-[#CCFF00] dark:text-[#00D4FF] shadow-xs">
              <Flame className="h-4 w-4 text-[#CCFF00] dark:text-[#00D4FF]" />
              <span>{streak} Day Streak</span>
            </div>

            {/* Supabase Authentication Section */}
            {user ? (
              <div className="relative shrink-0">
                <button
                  onClick={() => setMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2 bg-[#0C101D] dark:bg-[#121829] border border-white/20 dark:border-white/15 p-1 pr-3 rounded-full hover:bg-white/20 transition-all"
                >
                  {userAvatar && !imgError ? (
                    <img
                      src={userAvatar}
                      alt={userName}
                      referrerPolicy="no-referrer"
                      onError={() => setImgError(true)}
                      className="h-7 w-7 rounded-full object-cover border border-[#00D4FF]"
                    />
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-[#CCFF00] text-black font-bold flex items-center justify-center text-xs shadow-sm">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs font-semibold text-white max-w-[100px] truncate hidden md:inline">
                    {userName}
                  </span>
                </button>

                {/* Profile Dropdown Menu */}
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#001A99] dark:bg-[#050714] border border-white/20 rounded-2xl shadow-2xl p-2 z-50 text-white space-y-1">
                    <div className="px-3 py-2 border-b border-white/10 flex items-center gap-2.5">
                      {userAvatar && !imgError ? (
                        <img
                          src={userAvatar}
                          alt={userName}
                          referrerPolicy="no-referrer"
                          className="h-8 w-8 rounded-full object-cover border border-[#00D4FF]"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-[#CCFF00] text-black font-bold flex items-center justify-center text-xs shrink-0">
                          {userName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-white truncate">{userName}</p>
                        <p className="text-[10px] text-white/60 truncate">{user.email}</p>
                      </div>
                    </div>

                    <Link
                      href="/settings"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-white/80 hover:bg-[#0C101D] hover:text-white"
                    >
                      <Settings className="h-3.5 w-3.5 text-[#CCFF00]" />
                      Account Settings
                    </Link>

                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        signOut();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/20"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                disabled={loading}
                className="shrink-0 flex items-center gap-2 bg-white text-black hover:bg-white/90 font-bold text-xs px-3.5 py-1.5 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95"
              >
                <GoogleIcon className="h-3.5 w-3.5" />
                <span>{loading ? "Loading..." : "Sign In"}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Command Palette Component */}
      <CommandPalette />

      {/* Auth Modal Component */}
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </>
  );
}

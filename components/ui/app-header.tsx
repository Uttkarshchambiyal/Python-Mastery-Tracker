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
} from "lucide-react";
import { CommandPalette } from "@/components/ui/command-palette";
import { getUserSettings, saveUserSettings } from "@/lib/storage";

export function AppHeader({ streak = 0 }: { streak?: number }) {
  const pathname = usePathname();
  const [theme, setTheme] = useState<"light" | "dark" | "system">("dark");

  useEffect(() => {
    const s = getUserSettings();
    setTheme(s.theme || "dark");
    if (s.theme === "dark" || (s.theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    saveUserSettings({ theme: nextTheme });
  };

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
    { name: "Curriculum", href: "/curriculum", icon: <BookOpen className="h-4 w-4" /> },
    { name: "Projects", href: "/projects", icon: <Trophy className="h-4 w-4" /> },
    { name: "Insights", href: "/insights", icon: <BarChart2 className="h-4 w-4" /> },
    { name: "Journal", href: "/journal", icon: <BookOpen className="h-4 w-4" /> },
    { name: "Settings", href: "/settings", icon: <Settings className="h-4 w-4" /> },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#0038FF]/90 dark:bg-[#02040A]/80 backdrop-blur-md border-b border-white/15 dark:border-white/10 px-4 md:px-8 py-3.5 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#CCFF00] dark:bg-[#00D4FF] transition-transform group-hover:scale-105 shadow-md">
              <Zap className="h-5 w-5 text-[#001A99] dark:text-black" strokeWidth={3} />
            </div>
            <span
              className="font-black text-lg text-white tracking-tight dark:[text-shadow:0_2px_10px_rgba(0,56,255,0.4)]"
              style={{ fontFamily: '"Arial Black", Impact, sans-serif' }}
            >
              PYTHON CLUB
            </span>
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-white/10 dark:bg-white/[0.03] p-1.5 rounded-full border border-white/20 dark:border-white/10">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-[#CCFF00] text-black font-bold dark:bg-[#00D4FF] dark:text-black shadow-[0_0_20px_rgba(0,212,255,0.4)]"
                      : "text-white/80 dark:text-white/60 dark:hover:text-white hover:bg-white/15 dark:hover:bg-white/10"
                  }`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Utility Bar: Cmd+K Search, Theme Toggle, Streak */}
          <div className="flex items-center gap-4 shrink-0">
            {/* Cmd+K Search Trigger Button */}
            <button
              onClick={() => {
                const event = new KeyboardEvent("keydown", { key: "k", metaKey: true });
                window.dispatchEvent(event);
              }}
              className="flex items-center gap-2 bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 px-3.5 py-1.5 rounded-full text-xs text-white/80 dark:text-white/80 hover:text-white dark:hover:border-[#00D4FF]/40 dark:hover:bg-white/10 transition-all focus:ring-2 focus:ring-[#00D4FF] focus:outline-none"
            >
              <Search className="h-3.5 w-3.5 text-[#CCFF00] dark:text-[#00D4FF]" />
              <span className="hidden md:inline">Search</span>
              <kbd className="bg-white/20 dark:bg-white/10 text-[10px] px-1.5 py-0.5 rounded font-mono text-white">
                ⌘K
              </kbd>
            </button>

            {/* Dark/Light Mode Theme Toggle */}
            <button
              onClick={toggleTheme}
              title="Toggle Theme"
              className="p-2 rounded-full bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 text-white hover:bg-white/20 dark:hover:border-[#00D4FF]/40 dark:hover:bg-white/10 transition-all focus:ring-2 focus:ring-[#00D4FF] focus:outline-none"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 text-[#00D4FF]" />
              ) : (
                <Moon className="h-4 w-4 text-white" />
              )}
            </button>

            {/* Streak Indicator Pill */}
            <div className="flex items-center gap-1.5 bg-[#CCFF00]/10 border border-[#CCFF00]/30 dark:bg-[#00D4FF]/10 dark:border-[#00D4FF]/30 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#CCFF00] dark:text-[#00D4FF] shadow-[0_0_15px_rgba(0,212,255,0.15)]">
              <Flame className="h-4 w-4 text-[#CCFF00] dark:text-[#00D4FF]" />
              <span>{streak} Day Streak</span>
            </div>
          </div>
        </div>
      </header>

      {/* Command Palette Component */}
      <CommandPalette />
    </>
  );
}

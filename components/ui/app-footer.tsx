"use client";

import React from "react";

export function AppFooter() {
  return (
    <footer className="w-full border-t border-white/15 dark:border-white/10 bg-[#001A99] dark:bg-[#070A14] py-8 px-6 text-center text-white relative z-20 transition-colors">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="bg-white text-black text-xs font-black px-2 py-0.5 rounded-l-md tracking-wider">BASE</div>
          <div className="bg-[#CCFF00] text-black text-xs font-black px-2 py-0.5 rounded-r-md tracking-wider">CLUB</div>
          <span className="text-xs text-white/60 ml-2">© {new Date().getFullYear()} Python Mastery Tracker</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold text-white/90">
          <span>Created by</span>
          <span className="text-[#CCFF00] dark:text-indigo-400 font-extrabold tracking-wide">
            Uttkarsh Chambiyal
          </span>
        </div>
      </div>
    </footer>
  );
}

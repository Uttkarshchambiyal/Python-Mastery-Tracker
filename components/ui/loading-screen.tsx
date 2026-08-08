"use client";

import React from "react";
import { motion } from "motion/react";
import { Zap } from "lucide-react";
import { useTheme } from "next-themes";

export function LoadingScreen({ message = "Syncing with Python API..." }: { message?: string }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div className="min-h-screen bg-[#0038FF] dark:bg-[#02040A] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-300">
      {/* Background Radial Glow Blobs matching active theme */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_45%,rgba(204,255,0,0.15)_0%,transparent_60%)] dark:bg-[radial-gradient(circle_at_50%_45%,rgba(0,212,255,0.18)_0%,transparent_60%)]" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_60%,rgba(0,56,255,0.3)_0%,transparent_50%)]" />

      <div className="relative z-10 flex flex-col items-center space-y-6 text-center max-w-sm">
        {/* Pulsing Brand Logo Icon */}
        <motion.div
          animate={{
            scale: [1, 1.08, 1],
            boxShadow: isDark
              ? [
                "0 0 25px rgba(0,212,255,0.3)",
                "0 0 60px rgba(0,212,255,0.8)",
                "0 0 25px rgba(0,212,255,0.3)",
              ]
              : [
                "0 0 25px rgba(204,255,0,0.4)",
                "0 0 60px rgba(204,255,0,0.9)",
                "0 0 25px rgba(204,255,0,0.4)",
              ],
          }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="h-16 w-16 rounded-2xl bg-[#CCFF00] dark:bg-[#00D4FF] flex items-center justify-center text-black border-2 border-black/20 shadow-2xl"
        >
          <Zap className="h-9 w-9 text-[#001A99] dark:text-black" strokeWidth={3} />
        </motion.div>

        {/* Branding & Message */}
        <div className="space-y-2">
          <h2
            className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white dark:[text-shadow:0_2px_15px_rgba(0,56,255,0.6)]"
            style={{ fontFamily: '"Arial Black", Impact, sans-serif' }}
          >
            PYTHON MASTERY
          </h2>
          <p className="text-xs font-mono font-semibold uppercase tracking-widest text-[#CCFF00] dark:text-[#00D4FF]">
            {message}
          </p>
        </div>

        {/* Smooth Loader Bar matching active theme */}
        <div className="w-56 bg-white/20 dark:bg-white/10 h-1.5 rounded-full overflow-hidden border border-white/30 dark:border-white/15">
          <motion.div
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
            className="w-1/2 h-full bg-[#CCFF00] dark:bg-[#00D4FF] rounded-full shadow-[0_0_12px_#CCFF00] dark:shadow-[0_0_12px_#00D4FF]"
          />
        </div>
      </div>
    </div>
  );
}

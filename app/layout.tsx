import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";

import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth-provider";
import { SmokeRingBackground } from "@/components/ui/smoke-ring-background";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "ANTIGRAVITY — Python Mastery Tracker",
  description:
    "Track your Python journey from zero to mastery. 68 topics, 8 phases, 6 real projects. Built for builders who don't do half measures.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        inter.variable,
        spaceGrotesk.variable,
        jetbrainsMono.variable,
        "font-sans"
      )}
    >
      <body className="bg-[#0038FF] dark:bg-[#05070F] text-white transition-colors duration-300 min-h-screen relative overflow-x-hidden">
        {/* WebGL Smoke Ring Shader Background for Dark Mode */}
        <div className="hidden dark:block">
          <SmokeRingBackground />
        </div>

        {/* Ambient Overlay Grid */}
        <div className="fixed inset-0 pointer-events-none z-0 hidden dark:block bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem]" />

        <div className="relative z-10">
          <AuthProvider>
            <ThemeProvider>{children}</ThemeProvider>
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}

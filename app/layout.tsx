import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";

import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth-provider";
import { cn } from "@/lib/utils";

import { AppFooter } from "@/components/ui/app-footer";

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
  metadataBase: new URL("https://python-mastery-tracker.vercel.app"),
  title: "Python Mastery Tracker — Created by Uttkarsh Chambiyal",
  description:
    "Master Python from scratch with a 10-phase gamified curriculum, daily streak tracker, and study analytics. Created by Uttkarsh Chambiyal.",
  authors: [{ name: "Uttkarsh Chambiyal" }],
  creator: "Uttkarsh Chambiyal",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon.png", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "Python Mastery Tracker — Created by Uttkarsh Chambiyal",
    description:
      "Master Python from scratch with a 10-phase gamified curriculum, daily streak tracker, and study analytics.",
    images: ["/icon.png"],
  },
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
      <body className="bg-[#0038FF] dark:bg-[#05070F] text-white transition-colors duration-300 min-h-screen relative overflow-x-hidden flex flex-col justify-between">
        {/* Hardware-Accelerated High-Performance Ambient Background for Dark Mode */}
        <div className="fixed inset-0 pointer-events-none z-0 hidden dark:block bg-[#05070F] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(106,90,224,0.15),rgba(255,255,255,0))]" />

        {/* Ambient Overlay Grid */}
        <div className="fixed inset-0 pointer-events-none z-0 hidden dark:block bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem]" />

        <div className="relative z-10 flex-1 flex flex-col justify-between min-h-screen">
          <AuthProvider>
            <ThemeProvider>
              <div className="flex-1">{children}</div>
              <AppFooter />
            </ThemeProvider>
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}

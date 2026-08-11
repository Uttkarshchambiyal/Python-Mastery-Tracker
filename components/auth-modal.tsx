"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAuth } from "@/components/auth-provider";
import { Mail, Key, Sparkles, Check, AlertCircle, ArrowRight } from "lucide-react";

function GoogleIcon({ className = "h-5 w-5" }: { className?: string }) {
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

export function AuthModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { signInWithGoogle, signInWithMagicLink } = useAuth();
  const [email, setEmail] = useState("");
  const [sentMagicLink, setSentMagicLink] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setErrorMsg(err?.message || "Google provider is not enabled in your Supabase Dashboard yet.");
    }
  };

  const handleMagicLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    const { error } = await signInWithMagicLink(email.trim());
    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSentMagicLink(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#001A99] dark:bg-[#111a2e] border-white/25 text-white sm:max-w-md p-6 rounded-3xl shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-5 w-5 text-[#CCFF00] dark:text-indigo-400" />
            <DialogTitle className="text-xl font-bold uppercase text-[#CCFF00] dark:text-indigo-400">
              Authentication
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-white/70">
            Sign in to sync your Python learning progress with Supabase.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-2">
          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 bg-white text-black font-bold text-xs py-3.5 px-4 rounded-2xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <GoogleIcon />
            <span>Continue with Google</span>
          </button>

          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-white/20 w-full" />
            <span className="bg-[#001A99] dark:bg-[#111a2e] px-3 text-[10px] font-bold text-white/40 uppercase tracking-widest absolute">
              OR EMAIL
            </span>
          </div>

          {/* Email Magic Link Form */}
          {sentMagicLink ? (
            <div className="bg-emerald-500/20 border border-emerald-500/40 p-4 rounded-2xl text-center space-y-2">
              <Check className="h-6 w-6 text-emerald-400 mx-auto" />
              <h4 className="text-sm font-bold text-emerald-300">Check Your Email!</h4>
              <p className="text-xs text-white/80">
                We sent a login link to <span className="font-semibold text-white">{email}</span>. Click the link in your inbox to sign in instantly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleMagicLinkSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-white/75 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-white/10 dark:bg-white/5 border border-white/20 rounded-2xl py-3 pl-10 pr-4 text-xs text-white outline-none focus:ring-2 focus:ring-[#CCFF00] placeholder:text-white/40"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#CCFF00] dark:bg-indigo-500 text-black font-bold text-xs py-3 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span>{loading ? "Sending link..." : "Send Magic Login Link"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}

          {errorMsg && (
            <div className="bg-red-500/20 border border-red-500/40 p-3 rounded-xl flex items-start gap-2 text-xs text-red-200">
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Supabase Config Warning Box */}
        <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-[11px] text-amber-200 space-y-1">
          <p className="font-bold text-amber-300">💡 Supabase Setup Note:</p>
          <p className="leading-relaxed text-white/80">
            For Google login to work, enable **Google** in your Supabase Dashboard under **Authentication -&gt; Providers** and enter your Google OAuth Client ID &amp; Secret.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

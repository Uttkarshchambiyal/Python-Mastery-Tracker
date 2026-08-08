"use client";

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '@/components/auth-provider';
import { AuthModal } from '@/components/auth-modal';
import { Sparkles, ArrowRight, ShieldCheck, Flame, User, LogIn } from 'lucide-react';

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

// --- Custom SVG Components for Hand-Drawn Accents ---

const ArrowGreenLeft = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full text-[#CCFF00] stroke-current overflow-visible" fill="none" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10,90 C 10,40 40,20 60,50 C 70,65 80,75 95,70" />
    <path d="M80,55 L95,70 L85,85" />
  </svg>
);

const ArrowGreenRight = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full text-[#CCFF00] stroke-current overflow-visible" fill="none" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M90,10 C 80,60 60,80 40,60 C 20,40 40,20 60,30 C 80,40 70,70 50,80" />
    <path d="M65,75 L50,80 L55,65" />
  </svg>
);

const ArrowBlack1 = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full text-black stroke-current overflow-visible" fill="none" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20,80 Q 40,20 80,40" />
    <path d="M60,20 L80,40 L50,60" />
  </svg>
);

const ArrowBlack2 = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full text-black stroke-current overflow-visible" fill="none" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20,80 Q 40,20 80,40" />
    <path d="M60,20 L80,40 L50,60" />
  </svg>
);

const CircularBadge = () => (
  <div className="relative w-28 h-28 md:w-36 md:h-36 bg-[#CCFF00] rounded-full flex items-center justify-center shadow-xl rotate-12 hover:scale-105 transition-transform cursor-pointer border-[3px] border-black/5">
    <div className="absolute inset-1 animate-[spin_10s_linear_infinite]">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <path id="circlePath" d="M 50, 50 m -36, 0 a 36,36 0 1,1 72,0 a 36,36 0 1,1 -72,0" fill="none" />
        <text className="text-[11px] font-black tracking-[0.18em] uppercase" fill="black">
          <textPath href="#circlePath" startOffset="0%">
            GET STARTED FOR FREE • GET STARTED FOR FREE •
          </textPath>
        </text>
      </svg>
    </div>
    <div className="absolute inset-0 flex items-center justify-center">
      <svg viewBox="0 0 100 100" className="w-10 h-10 text-black stroke-current overflow-visible" fill="none" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20,80 Q 40,50 30,30 T 80,20" />
        <path d="M60,10 L80,20 L70,40" />
      </svg>
    </div>
  </div>
);

export const Component = () => {
  const { user, signInWithGoogle, loading } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Python Builder';
  const userAvatar = user?.user_metadata?.avatar_url;

  return (
    <div className="min-h-screen bg-transparent dark:bg-transparent flex flex-col font-sans selection:bg-[#CCFF00] selection:text-black relative overflow-hidden w-full transition-colors duration-300">

      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff15_1px,transparent_1px),linear-gradient(to_bottom,#ffffff15_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none z-0"></div>

      {/* Navigation Bar */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-6 md:px-10 md:py-8 max-w-[1440px] mx-auto w-full">
        <div className="flex items-center gap-1">
          <div className="bg-white text-black font-black tracking-tight text-xs md:text-sm px-3 py-1.5 rounded-2xl rounded-bl-sm relative shadow-sm">
            BASE
            <div className="absolute -bottom-1.5 left-0 w-3 h-3 bg-white" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}></div>
          </div>
          <div className="bg-[#CCFF00] text-black font-black text-xs md:text-sm px-3 py-1.5 rounded-full border-[1.5px] border-white shadow-sm">
            CLUB
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-2">
          {[
            { name: 'Dashboard', href: '/dashboard' },
            { name: 'Curriculum', href: '/curriculum' },
            { name: 'Projects', href: '/projects' },
            { name: 'Settings', href: '/settings' },
          ].map((item) => (
            <a key={item.name} href={item.href} className="px-4 py-1.5 rounded-full border border-white/30 text-white text-xs font-semibold hover:bg-[#0C101D] transition-colors">
              {item.name}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <a
              href="/dashboard"
              className="flex items-center gap-2 px-5 py-2 rounded-full bg-white text-black font-bold text-xs md:text-sm hover:bg-[#CCFF00] transition-colors shadow-lg"
            >
              {userAvatar && !imgError ? (
                <img
                  src={userAvatar}
                  alt={userName}
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="w-5 h-5 rounded-full object-cover"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-transparent text-white flex items-center justify-center text-[10px] font-bold">
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}
              <span>Go to Tracker →</span>
            </a>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={signInWithGoogle}
                disabled={loading}
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black font-bold text-xs shadow-md hover:bg-white/90 transition-transform hover:scale-105 active:scale-95"
              >
                <GoogleIcon className="h-4 w-4" />
                <span>Google Sign In</span>
              </button>

              <button
                onClick={() => setAuthModalOpen(true)}
                className="px-5 py-2 rounded-full border border-white text-white text-xs md:text-sm font-semibold hover:bg-white hover:text-[#0038FF] transition-colors flex items-center gap-1.5"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Sign In / Register</span>
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Main Hero Container */}
      <main className="flex-1 relative z-10 pt-4 pb-32 md:pt-8 md:pb-48 px-4 flex flex-col items-center justify-center w-full max-w-[1440px] mx-auto">

        <div className="relative w-full max-w-5xl mx-auto flex flex-col items-center justify-center text-center z-10 mt-2 mb-12">

          {/* Large Hero Text */}
          <div className="w-full flex flex-col items-center relative z-10 space-y-2 md:space-y-4">

            <div className="w-full flex justify-start pl-[10%] md:pl-[25%] relative z-30">
              <h1
                className="text-[clamp(4.5rem,12vw,160px)] font-black leading-[0.85] tracking-tighter text-[#CCFF00] m-0 p-0 uppercase"
                style={{
                  fontFamily: '"Arial Black", Impact, sans-serif',
                  textShadow: '1px 1px 0 #001A99, 2px 2px 0 #001A99, 3px 3px 0 #001A99, 4px 4px 0 #001A99, 5px 5px 0 #001A99, 6px 6px 0 #001A99, 7px 7px 0 #001A99, 8px 8px 0 #001A99, 9px 9px 0 #001A99, 10px 10px 0 #001A99, 11px 11px 0 #001A99, 12px 12px 0 #001A99, 13px 13px 0 #001A99, 14px 14px 0 #001A99'
                }}
              >
                #PYTHON
              </h1>
            </div>

            <div className="w-full flex justify-center relative z-20">
              <h1
                className="text-[clamp(5rem,15vw,220px)] font-black leading-[0.85] tracking-tighter text-white m-0 p-0 uppercase"
                style={{
                  fontFamily: '"Arial Black", Impact, sans-serif',
                  textShadow: '1px 1px 0 #001A99, 2px 2px 0 #001A99, 3px 3px 0 #001A99, 4px 4px 0 #001A99, 5px 5px 0 #001A99, 6px 6px 0 #001A99, 7px 7px 0 #001A99, 8px 8px 0 #001A99, 9px 9px 0 #001A99, 10px 10px 0 #001A99, 11px 11px 0 #001A99, 12px 12px 0 #001A99, 13px 13px 0 #001A99, 14px 14px 0 #001A99'
                }}
              >
                MASTERY
              </h1>
            </div>

            <div className="w-full flex justify-start pl-[15%] md:pl-[30%] relative z-10">
              <h1
                className="text-[clamp(4.5rem,12vw,160px)] font-black leading-[0.85] tracking-tighter text-white m-0 p-0 uppercase"
                style={{
                  fontFamily: '"Arial Black", Impact, sans-serif',
                  textShadow: '1px 1px 0 #001A99, 2px 2px 0 #001A99, 3px 3px 0 #001A99, 4px 4px 0 #001A99, 5px 5px 0 #001A99, 6px 6px 0 #001A99, 7px 7px 0 #001A99, 8px 8px 0 #001A99, 9px 9px 0 #001A99, 10px 10px 0 #001A99, 11px 11px 0 #001A99, 12px 12px 0 #001A99, 13px 13px 0 #001A99, 14px 14px 0 #001A99'
                }}
              >
                TRACKER
              </h1>
            </div>

          </div>

          {/* High-Impact Auth Onboarding Banner directly under title */}
          <div className="mt-8 z-30 w-full max-w-xl mx-auto px-4">
            {user ? (
              <div className="bg-white/15 backdrop-blur-xl border border-white/30 rounded-3xl p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-10 h-10 rounded-full border-2 border-[#CCFF00] overflow-hidden bg-black flex items-center justify-center">
                    {userAvatar && !imgError ? (
                      <img src={userAvatar} alt="" referrerPolicy="no-referrer" onError={() => setImgError(true)} className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-bold text-white text-sm">{userName.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-[#CCFF00] uppercase tracking-wider">Welcome Back 👋</p>
                    <h3 className="text-base font-bold text-white truncate max-w-[240px]">{userName}</h3>
                  </div>
                </div>

                <a
                  href="/dashboard"
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#CCFF00] text-black font-black text-xs md:text-sm py-3.5 px-6 rounded-2xl hover:scale-105 transition-all shadow-[0_0_25px_rgba(204,255,0,0.4)]"
                >
                  <span>Continue to Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            ) : (
              <div className="bg-white/15 backdrop-blur-xl border border-white/30 rounded-3xl p-6 shadow-2xl space-y-4 relative overflow-hidden">
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#CCFF00]/20 text-[#CCFF00] border border-[#CCFF00]/40 text-[10px] font-bold uppercase tracking-widest">
                    <Sparkles className="h-3 w-3" /> Get Started Free
                  </span>
                  <h3 className="text-lg md:text-xl font-black uppercase text-white mt-1">
                    Track Your Python Journey
                  </h3>
                  <p className="text-xs text-white/80 max-w-md mx-auto">
                    Sign in to save your topic progress, daily study logs, streaks, and portfolio projects directly in Supabase.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    onClick={signInWithGoogle}
                    disabled={loading}
                    className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white text-black font-extrabold text-xs py-3.5 px-6 rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all"
                  >
                    <GoogleIcon className="h-4 w-4" />
                    <span>{loading ? "Connecting..." : "Sign in with Google"}</span>
                  </button>

                  <button
                    onClick={() => setAuthModalOpen(true)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#0C101D] hover:bg-white/20 border border-white/30 text-white font-bold text-xs py-3.5 px-5 rounded-2xl transition-all"
                  >
                    <LogIn className="h-4 w-4 text-[#CCFF00]" />
                    <span>Other Login Options</span>
                  </button>
                </div>

                <div className="pt-2 flex items-center justify-center gap-4 text-[10px] text-white/70 font-semibold border-t border-white/10 mt-3">
                  <span>⚡ 68 Topics</span>
                  <span>•</span>
                  <span>🏆 6 Projects</span>
                  <span>•</span>
                  <span>🔥 Free Forever</span>
                </div>
              </div>
            )}
          </div>

          <div className="absolute inset-0 w-full h-full pointer-events-none">

            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[40%] md:top-[38%] left-[1%] sm:left-[3%] md:left-[4%] lg:left-[6%] xl:left-[8%] z-20 pointer-events-auto"
            >
              <div className="w-36 md:w-48 aspect-[3/3.5] bg-white/20 backdrop-blur-md border border-white/40 rounded-[2rem] p-4 flex flex-col items-center justify-center rotate-[-10deg] shadow-2xl hover:rotate-0 transition-transform duration-500">
                <div className="w-14 h-14 md:w-20 md:h-20 bg-gradient-to-br from-[#00D4FF] to-[#0038FF] rounded-full flex items-center justify-center mb-3 shadow-inner border-[3px] border-white/50 overflow-hidden">
                  <img src="/avatar-vector.png" alt="Python Developer Vector Avatar" className="w-full h-full object-cover" />
                </div>
                <div className="text-center mt-1">
                  <p className="font-bold text-xs md:text-base text-white">vercetti</p>
                  <p className="text-[10px] text-white/80 mt-0.5">12 Day Streak 🔥</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute top-[8%] sm:top-[10%] right-[1%] sm:right-[3%] md:right-[4%] lg:right-[6%] xl:right-[8%] z-20 pointer-events-auto"
            >
              <div className="w-36 md:w-48 aspect-[3/3.5] bg-white/20 backdrop-blur-md border border-white/40 rounded-[2rem] p-4 flex flex-col items-center justify-center rotate-[10deg] shadow-2xl hover:rotate-0 transition-transform duration-500">
                <div className="w-14 h-14 md:w-20 md:h-20 bg-gradient-to-br from-[#0038FF] to-[#02040A] rounded-full flex items-center justify-center mb-3 shadow-inner border-[3px] border-white/50 overflow-hidden">
                  {userAvatar && !imgError ? (
                    <img src={userAvatar} alt="" referrerPolicy="no-referrer" onError={() => setImgError(true)} className="w-full h-full object-cover" />
                  ) : (
                    <img src="/avatar-pixel.jpg" alt="Python Developer Pixel Art Avatar" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="text-center mt-1">
                  <p className="font-bold text-xs md:text-sm text-white truncate max-w-[120px]">{userName}</p>
                  <p className="text-[10px] text-white/80 mt-0.5">52 Topics Done ⚡</p>
                </div>
              </div>
            </motion.div>

            <div className="absolute bottom-[0%] left-[0%] md:left-[10%] w-24 h-24 md:w-32 md:h-32 z-20">
              <ArrowGreenLeft />
            </div>

            <div className="absolute top-[5%] right-[0%] md:right-[10%] w-24 h-24 md:w-32 md:h-32 z-20">
              <ArrowGreenRight />
            </div>

            <div className="absolute bottom-[-10%] right-[0%] md:right-[15%] z-40 pointer-events-auto">
              <a href="/dashboard">
                <CircularBadge />
              </a>
            </div>

          </div>
        </div>
      </main>

      <section className="bg-white text-black rounded-t-[2.5rem] md:rounded-t-[3.5rem] px-6 py-12 md:px-10 md:py-16 relative z-20 shadow-[0_-20px_50px_rgba(0,0,0,0.2)] mt-auto w-full">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">

          <div className="bg-[#F8F9FA] rounded-[2rem] p-8 flex flex-col items-center text-center relative h-64 border border-gray-100">
            <h3 className="text-xl md:text-2xl uppercase leading-tight mb-2 font-black">
              1. FOLLOW THE<br />ROADMAP
            </h3>
            <p className="text-[10px] md:text-xs text-black/60 font-bold mb-auto">
              Structured from zero to advanced Python mastery
            </p>

            <div className="relative w-full flex justify-center mt-6">
              <div className="flex items-center bg-transparent rounded-2xl p-2 pr-16 text-white shadow-lg relative z-10">
                <div className="w-8 h-8 bg-white/20 rounded-full mr-3 border border-white/30 overflow-hidden flex-shrink-0">
                  <img src="/avatar-vector.png" alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-bold leading-none">Curriculum</p>
                  <p className="text-[8px] text-white/70 leading-none mt-1">52 Granular Topics</p>
                </div>
              </div>
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#CCFF00] text-black font-black text-[10px] px-3 py-2 rounded-xl z-20 shadow-md">
                10 PHASES
              </div>
            </div>

            <div className="hidden md:block absolute -right-12 bottom-8 w-16 h-16 z-30">
              <ArrowBlack1 />
            </div>
          </div>

          <div className="bg-[#F8F9FA] rounded-[2rem] p-8 flex flex-col items-center text-center relative h-64 border border-gray-100">
            <h3 className="text-xl md:text-2xl uppercase leading-tight mb-2 font-black">
              2. STUDY DAILY &<br />BUILD STREAKS
            </h3>
            <p className="text-[10px] md:text-xs text-black/60 font-bold mb-auto">
              Tick off topics daily and keep your flame burning
            </p>

            <div className="relative w-full flex justify-center mt-6">
              <div className="flex items-center bg-transparent rounded-full p-1.5 text-white shadow-lg">
                <div className="bg-white/20 text-white font-bold text-sm px-4 py-2 rounded-full mr-2">
                  DAILY STREAK
                </div>
                <div className="font-bold text-xs px-4">
                  🔥 ACTIVE
                </div>
              </div>

              <div className="absolute -bottom-6 right-1/3 bg-[#CCFF00] rounded-full p-2.5 shadow-lg transform rotate-12 z-20">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-black stroke-current" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </div>
            </div>

            <div className="hidden md:block absolute -right-12 bottom-8 w-16 h-16 z-30">
              <ArrowBlack2 />
            </div>
          </div>

          <div className="bg-[#F8F9FA] rounded-[2rem] p-8 flex flex-col items-center text-center relative h-64 border border-gray-100">
            <h3 className="text-xl md:text-2xl uppercase leading-tight mb-2 font-black">
              3. SHIP PROJECTS &<br />SHARE ON LINKEDIN
            </h3>
            <p className="text-[10px] md:text-xs text-black/60 font-bold mb-auto">
              Build 5 portfolio projects & generate shareable posts
            </p>

            <div className="flex flex-col items-center bg-[#CCFF00] rounded-[2rem] px-6 py-4 text-black shadow-lg mt-6 relative w-full max-w-[200px]">
              <p className="text-[9px] font-bold uppercase tracking-wider mb-1">AUTO-GENERATOR</p>
              <p className="text-xl font-black">LINKEDIN</p>
              <div className="absolute -bottom-2 left-8 w-5 h-5 bg-[#CCFF00] transform rotate-45"></div>
            </div>
          </div>

        </div>
      </section>

      {/* Auth Modal Component */}
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </div>
  );
};

export default Component;

import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Droplets, Bell, Menu, ChevronDown, Globe, Wifi, WifiOff,
  Sun, Moon, User as UserIcon, ShieldCheck, LogOut, CheckCircle2, AlertCircle
} from 'lucide-react';
import { useLanguage, LANGUAGES } from '../../context/LanguageContext';
import { useSocket } from '../../hooks/useSocket';
import { useTheme } from '../../context/ThemeContext';
import { getCurrentUser, logoutUser } from '../../services/authService';

export default function Navbar({ onMenuToggle, userRole = 'Resident', onRoleChange, unreadAlertsCount = 0 }) {
  const navigate = useNavigate();
  const { lang, setLang, t } = useLanguage();
  const { isConnected } = useSocket();
  const { theme, toggleTheme, isDark } = useTheme();
  const [langOpen, setLangOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const langRef = useRef(null);
  const profileRef = useRef(null);
  const currentUser = getCurrentUser();

  const currentLang = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    setProfileOpen(false);
    logoutUser();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full dark:bg-[#0F172A] bg-white border-b dark:border-white/[0.06] border-slate-200 shadow-md dark:shadow-black/20 shadow-slate-100 transition-colors duration-200">
      <div className="px-1.5 sm:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-1 sm:gap-2">

          {/* ── Left: Hamburger + Brand ── */}
          <div className="flex items-center gap-2 sm:gap-3.5 flex-shrink-0">
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition"
              aria-label="Toggle navigation"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <Link to="/" className="flex items-center gap-2 sm:gap-3 group select-none">
              <div className="h-9 w-9 sm:h-12 sm:w-12 rounded-xl bg-white p-1 shadow-md shadow-black/20 border border-slate-200 dark:border-white/20 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform overflow-hidden">
                <img src="/logo.png" alt="SUOWMRS Logo" className="w-full h-full object-contain" />
              </div>
              <div className="hidden sm:flex flex-col leading-none">
                <span className="font-black text-base sm:text-2xl tracking-tight text-slate-900 dark:text-white font-display">
                  SUOW<span className="text-[#0EA5E9]">MRS</span>
                </span>
                <span className="text-[10px] sm:text-xs tracking-widest uppercase font-bold text-slate-500 dark:text-slate-400 hidden sm:block mt-0.5">
                  {t('appSubtitle')}
                </span>
              </div>
            </Link>
          </div>

          {/* ── Center: Live Status Pill ── */}
          <div className="hidden lg:flex items-center gap-2.5 dark:bg-white/5 bg-slate-100 dark:border-white/10 border-slate-200 border px-4 py-1.5 rounded-full shadow-inner">
            {isConnected
              ? <><Wifi className="w-4 h-4 text-emerald-500 dark:text-emerald-400" /><span className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400">{t('sensorsActive')}</span></>
              : <><WifiOff className="w-4 h-4 text-red-500 dark:text-red-400" /><span className="text-xs sm:text-sm font-bold text-red-500 dark:text-red-400">{t('offline')}</span></>
            }
            <span className="text-slate-300 dark:text-white/20 text-xs">|</span>
            <span className="text-xs sm:text-sm font-extrabold text-sky-600 dark:text-sky-400 font-mono">SYS-042</span>
          </div>

          {/* ── Right: Role Switcher + Language + Theme + Alerts + Avatar ── */}
          <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">

            {/* Role Switcher — Visible for Admin on both mobile & desktop */}
            {(userRole === 'Admin' || currentUser?.role === 'Admin') && (
              <div className="flex items-center dark:bg-white/5 bg-slate-100 dark:border-white/10 border-slate-200 border rounded-xl p-0.5 sm:p-1 text-[11px] sm:text-xs">
                {['Resident', 'Technician', 'Admin'].map((role) => (
                  <button
                    key={role}
                    onClick={() => onRoleChange?.(role)}
                    className={`px-1.5 sm:px-2.5 py-1 rounded-lg font-bold transition ${
                      userRole === role
                        ? 'bg-[#0F4C5C] text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span className="hidden sm:inline">{role}</span>
                    <span className="sm:hidden">{role === 'Resident' ? 'Res' : role === 'Technician' ? 'Tech' : 'Admin'}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Language Switcher */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => setLangOpen(p => !p)}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl dark:bg-white/5 bg-slate-100 dark:border-white/10 border-slate-200 border text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition text-xs font-bold shadow-sm"
                aria-label="Change language"
              >
                <Globe className="w-4 h-4 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                <span className="hidden sm:inline">{currentLang.native}</span>
                <span className="sm:hidden uppercase">{currentLang.code}</span>
                <ChevronDown className={`w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
              </button>

              {langOpen && (
                <div className="absolute right-0 top-full mt-2 w-44 sm:w-48 dark:bg-[#1e293b] bg-white border dark:border-white/10 border-slate-200 rounded-2xl shadow-2xl shadow-black/20 overflow-hidden z-50">
                  <div className="p-1.5">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2.5 py-1.5">{t('language')}</p>
                    {LANGUAGES.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => { setLang(l.code); setLangOpen(false); }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition ${
                          lang === l.code
                            ? 'bg-[#0F4C5C] text-white font-bold'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <span>{l.native}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">{l.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Theme Switcher: Sun / Moon */}
            <button
              onClick={toggleTheme}
              className="p-2 sm:p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-white/10 transition group border dark:border-white/10 border-slate-200 shadow-sm"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 transition-transform duration-300 group-hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700 transition-transform duration-300 group-hover:-rotate-12" />
              )}
            </button>

            {/* Notifications Bell */}
            <button
              onClick={() => navigate('/alerts')}
              className="relative p-2 sm:p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition border dark:border-white/10 border-slate-200 shadow-sm"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              {unreadAlertsCount > 0 && (
                <span className="absolute top-1 sm:top-1.5 right-1 sm:right-1.5 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-[#0F172A] animate-pulse" />
              )}
            </button>

            {/* Profile Dropdown or Sign In Button */}
            {currentUser ? (
              <div className="relative pl-1.5 sm:pl-3 border-l border-slate-200 dark:border-white/10" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(prev => !prev)}
                  className="flex items-center gap-1.5 sm:gap-2.5 group p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition"
                  aria-label="User profile menu"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#0F4C5C] to-[#0EA5E9] flex items-center justify-center text-white font-black text-xs sm:text-sm shadow-md group-hover:scale-105 transition-transform">
                    {(currentUser?.fullName || userRole).charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden xl:flex flex-col leading-none text-left">
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate max-w-[130px]">
                      {currentUser?.fullName || t('demoUser')}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 capitalize font-medium mt-0.5">{currentUser?.role || userRole}</span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-full mt-3 w-64 sm:w-72 dark:bg-[#1E293B] bg-white border dark:border-white/10 border-slate-200 rounded-2xl shadow-2xl shadow-black/25 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="p-4 border-b dark:border-white/10 border-slate-100 bg-slate-50/50 dark:bg-white/[0.02]">
                      <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                        {currentUser?.fullName || 'Active User'}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {currentUser?.email || 'user@suowmrs.org'}
                      </p>
                      <div className="flex items-center gap-2 mt-2.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#0F4C5C]/20 text-[#0EA5E9] dark:text-[#38BDF8] border border-[#0EA5E9]/30">
                          {currentUser?.role || userRole}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                          (currentUser?.verificationStatus || 'Verified') === 'Verified'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                        }`}>
                          {(currentUser?.verificationStatus || 'Verified') === 'Verified' ? (
                            <CheckCircle2 className="w-2.5 h-2.5" />
                          ) : (
                            <AlertCircle className="w-2.5 h-2.5" />
                          )}
                          {currentUser?.verificationStatus || 'Verified'}
                        </span>
                      </div>
                    </div>

                    <div className="p-1.5 space-y-1">
                      <Link
                        to="/profile"
                        onClick={() => setProfileOpen(false)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition"
                      >
                        <UserIcon className="w-4 h-4 text-[#0EA5E9]" />
                        <span>My Profile & Password</span>
                      </Link>

                      {(userRole === 'Admin' || currentUser?.role === 'Admin') && (
                        <Link
                          to="/admin/approvals"
                          onClick={() => setProfileOpen(false)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition"
                        >
                          <ShieldCheck className="w-4 h-4 text-emerald-500" />
                          <span>User & Technician Approvals</span>
                        </Link>
                      )}
                    </div>

                    <div className="p-1.5 border-t dark:border-white/10 border-slate-100">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="pl-1 sm:pl-2">
                <button className="px-3.5 py-2 text-xs font-bold rounded-xl text-white bg-[#0F4C5C] hover:bg-[#0A333E] shadow-sm transition">
                  {t('signIn')}
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

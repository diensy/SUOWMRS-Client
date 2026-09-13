import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Waves,
  Cpu,
  BellRing,
  Database,
  Recycle,
  Building2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Activity,
  CheckCircle2,
  Droplets,
  Sun,
  Moon,
  Globe,
  ChevronDown,
  HelpCircle,
  TrendingUp,
  Zap,
  Menu,
  X,
  Map,
  CloudRain,
  Wrench,
  AlertTriangle,
  Layers,
  LogIn,
} from 'lucide-react';
import Badge from '../components/common/Badge';
import StatusIndicator from '../components/common/StatusIndicator';
import Footer from '../components/layout/Footer';
import { useTheme } from '../context/ThemeContext';
import { useLanguage, LANGUAGES } from '../context/LanguageContext';
import { getCurrentUser, isAuthenticated, logoutUser } from '../services/authService';

export default function LandingPage() {
  const { isDark, toggleTheme } = useTheme();
  const { language, changeLanguage, t } = useLanguage();
  const loggedIn = isAuthenticated();
  const currentUser = getCurrentUser();
  const [openFaq, setOpenFaq] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const featuresList = [
    {
      id: 'telemetry',
      title: t('feat1Title'),
      desc: t('feat1Desc'),
      icon: Droplets,
      color: 'text-sky-500 bg-sky-500/10 border-sky-500/20',
      link: '/water-monitoring',
      badge: 'Phase 1',
    },
    {
      id: 'storage',
      title: t('feat2Title'),
      desc: t('feat2Desc'),
      icon: Database,
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
      link: '/storage',
      badge: 'Phase 4',
    },
    {
      id: 'reuse',
      title: t('feat3Title'),
      desc: t('feat3Desc'),
      icon: Recycle,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      link: '/water-reuse',
      badge: 'Phase 5',
    },
    {
      id: 'ai',
      title: t('feat4Title'),
      desc: t('feat4Desc'),
      icon: Sparkles,
      color: 'text-violet-500 bg-violet-500/10 border-violet-500/20',
      link: '/ai-prediction',
      badge: 'Phase 7',
    },
    {
      id: 'gis',
      title: t('feat5Title'),
      desc: t('feat5Desc'),
      icon: Map,
      color: 'text-teal-500 bg-teal-500/10 border-teal-500/20',
      link: '/admin/map',
      badge: 'Phase 6',
    },
    {
      id: 'sos',
      title: t('feat6Title'),
      desc: t('feat6Desc'),
      icon: AlertTriangle,
      color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
      link: '/sos',
      badge: 'Emergency',
    },
    {
      id: 'maintenance',
      title: t('feat7Title'),
      desc: t('feat7Desc'),
      icon: Wrench,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
      link: '/system-health',
      badge: 'Technician',
    },
    {
      id: 'weather',
      title: t('feat8Title'),
      desc: t('feat8Desc'),
      icon: CloudRain,
      color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
      link: '/weather',
      badge: 'Forecast',
    },
  ];

  const roadmapSteps = [
    { num: '01', title: t('phase1Title'), desc: t('phase1Desc'), icon: Cpu, badge: 'Phase 1' },
    { num: '02', title: t('phase2Title'), desc: t('phase2Desc'), icon: Waves, badge: 'Phase 2' },
    { num: '03', title: t('phase3Title'), desc: t('phase3Desc'), icon: BellRing, badge: 'Phase 3' },
    { num: '04', title: t('phase4Title'), desc: t('phase4Desc'), icon: Database, badge: 'Phase 4' },
    { num: '05', title: t('phase5Title'), desc: t('phase5Desc'), icon: Recycle, badge: 'Phase 5' },
    { num: '06', title: t('phase6Title'), desc: t('phase6Desc'), icon: Building2, badge: 'Phase 6' },
    { num: '07', title: t('phase7Title'), desc: t('phase7Desc'), icon: Sparkles, badge: 'Phase 7' },
  ];

  const faqs = [
    { q: t('faq1Q'), a: t('faq1A') },
    { q: t('faq2Q'), a: t('faq2A') },
    { q: t('faq3Q'), a: t('faq3A') },
    { q: t('faq4Q'), a: t('faq4A') },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#090E17] text-slate-800 dark:text-slate-100 flex flex-col selection:bg-[#0EA5E9] selection:text-white transition-colors duration-200">
      {/* Top Header */}
      <header className="sticky top-0 z-50 w-full bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#0F4C5C] text-white flex items-center justify-center shadow-md">
              <Droplets className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white font-display">
              SUOW<span className="text-[#0EA5E9]">MRS</span>
            </span>
          </Link>

          {/* Desktop Right Nav Controls */}
          <div className="hidden md:flex items-center gap-3">
            <div className="relative flex items-center">
              <Globe className="w-4 h-4 text-slate-400 absolute left-2.5 pointer-events-none" />
              <select
                value={language}
                onChange={(e) => changeLanguage(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] cursor-pointer"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code} className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white">
                    {lang.native} ({lang.label})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={toggleTheme}
              type="button"
              className="p-2 rounded-xl dark:bg-white/5 bg-slate-100 dark:border-white/10 border-slate-200 border text-slate-600 dark:text-slate-300 hover:text-amber-500 transition"
              title="Toggle Theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {loggedIn && currentUser ? (
              <Link to={currentUser.role === 'Admin' ? '/admin/dashboard' : currentUser.role === 'Technician' ? '/system-health' : '/dashboard'}>
                <button className="px-4 py-2 text-xs font-bold rounded-xl text-white bg-[#0F4C5C] hover:bg-[#0A333E] shadow-md flex items-center gap-2 transition">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-black">
                    {currentUser.fullName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span>{currentUser.fullName}</span>
                </button>
              </Link>
            ) : (
              <Link to="/login">
                <button className="px-5 py-2 text-xs font-bold rounded-xl text-white bg-[#0F4C5C] hover:bg-[#0A333E] shadow-md flex items-center gap-1.5 transition">
                  <LogIn className="w-3.5 h-3.5" /> {t('signIn')}
                </button>
              </Link>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              type="button"
              className="p-2 rounded-xl dark:bg-white/5 bg-slate-100 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#0F172A] px-4 pt-3 pb-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{t('language')}</span>
              <select
                value={language}
                onChange={(e) => changeLanguage(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs font-bold text-slate-800 dark:text-slate-100"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code} className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white">
                    {lang.native} ({lang.label})
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2">
              {loggedIn && currentUser ? (
                <Link to={currentUser.role === 'Admin' ? '/admin/dashboard' : currentUser.role === 'Technician' ? '/system-health' : '/dashboard'} onClick={() => setMobileMenuOpen(false)}>
                  <button className="w-full py-2.5 text-xs font-bold rounded-xl text-white bg-[#0F4C5C] text-center shadow-md flex items-center justify-center gap-2">
                    <span>My Account ({currentUser.fullName})</span>
                  </button>
                </Link>
              ) : (
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <button className="w-full py-2.5 text-xs font-bold rounded-xl text-white bg-[#0F4C5C] text-center shadow-md flex items-center justify-center gap-1.5">
                    <LogIn className="w-4 h-4" /> {t('signIn')}
                  </button>
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-10 sm:pt-14 pb-14 sm:pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[600px] h-[250px] sm:h-[350px] bg-gradient-to-tr from-sky-200/40 via-teal-100/30 to-blue-200/20 dark:from-sky-900/20 dark:to-teal-900/10 blur-3xl rounded-full -z-10" />

        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/20 text-[#0F4C5C] dark:text-teal-300 text-xs font-bold mb-6">
            <span className="w-2 h-2 rounded-full bg-[#0EA5E9] animate-pulse" />
            {t('heroBadge')}
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15] font-display">
            {t('heroTitle1')} <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0F4C5C] via-[#0EA5E9] to-teal-400">
              {t('heroTitle2')}
            </span>
          </h1>

          <p className="mt-5 sm:mt-6 text-sm sm:text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            {t('heroDesc')}
          </p>

          <div className="mt-7 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link to="/dashboard" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-6 py-3 text-sm font-bold rounded-2xl text-white bg-[#0F4C5C] hover:bg-[#0A333E] shadow-lg flex items-center justify-center gap-2.5 transition">
                <Waves className="w-4 h-4" /> {t('residentOps')}
              </button>
            </Link>
            <Link to="/admin/dashboard" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-6 py-3 text-sm font-bold rounded-2xl text-[#0F4C5C] dark:text-sky-300 bg-white dark:bg-white/10 border-2 border-[#0F4C5C] dark:border-sky-400 hover:bg-teal-50 dark:hover:bg-white/20 shadow-md flex items-center justify-center gap-2.5 transition">
                <Building2 className="w-4 h-4" /> {t('adminDashboard')}
              </button>
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-10 sm:mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 shadow-md text-left">
              <div className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('sensorsMonitored')}</div>
              <div className="text-xl sm:text-2xl font-black text-[#0F4C5C] dark:text-sky-400 mt-1 font-display">128 Nodes</div>
              <div className="mt-1 flex items-center gap-1 text-[11px] sm:text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> 98.4% Active
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 shadow-md text-left">
              <div className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('liveWaterLevel')}</div>
              <div className="text-xl sm:text-2xl font-black text-sky-600 dark:text-sky-400 mt-1 font-display">42%</div>
              <div className="mt-1">
                <StatusIndicator status="normal" label={t('status_normal')} size="sm" />
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 shadow-md text-left">
              <div className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('storedWater')}</div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 font-display">8,500 L</div>
              <div className="mt-1 text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 font-semibold">72% Capacity</div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 shadow-md text-left">
              <div className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('autoValveStatus')}</div>
              <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-display">READY</div>
              <div className="mt-1 text-[11px] sm:text-xs text-[#0F4C5C] dark:text-sky-300 font-bold">ESP32 Sim Active</div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Numbers Banner */}
      <section className="py-8 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-white/80 dark:bg-[#0F172A]/80 border border-slate-200 dark:border-white/10 shadow-sm backdrop-blur-md flex flex-col justify-between hover:shadow-md transition">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-[#0EA5E9] flex items-center justify-center mb-2 sm:mb-3">
              <Droplets className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black font-display text-[#0F4C5C] dark:text-sky-400">48,500 L</p>
              <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 mt-1 font-bold">{t('totalFloodPrevented')}</p>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white/80 dark:bg-[#0F172A]/80 border border-slate-200 dark:border-white/10 shadow-sm backdrop-blur-md flex flex-col justify-between hover:shadow-md transition">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-2 sm:mb-3">
              <Cpu className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black font-display text-emerald-600 dark:text-emerald-400">128</p>
              <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 mt-1 font-bold">{t('activeIoTNodes')}</p>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white/80 dark:bg-[#0F172A]/80 border border-slate-200 dark:border-white/10 shadow-sm backdrop-blur-md flex flex-col justify-between hover:shadow-md transition">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-2 sm:mb-3">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black font-display text-amber-600 dark:text-amber-400">99.9%</p>
              <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 mt-1 font-bold">{t('systemUptime')}</p>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white/80 dark:bg-[#0F172A]/80 border border-slate-200 dark:border-white/10 shadow-sm backdrop-blur-md flex flex-col justify-between hover:shadow-md transition">
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center mb-2 sm:mb-3">
              <Recycle className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black font-display text-violet-600 dark:text-violet-400">6,200 L</p>
              <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 mt-1 font-bold">{t('treatedWaterReused')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Capabilities & Features Showcase Section */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20 text-[#0EA5E9] text-xs font-bold mb-3 uppercase tracking-widest">
            <Layers className="w-3.5 h-3.5" /> {t('featuresBadge')}
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white font-display">
            {t('featuresTitle')}
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {t('featuresSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featuresList.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.id}
                className="p-6 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 hover:border-[#0EA5E9] shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-11 h-11 rounded-xl border flex items-center justify-center ${feat.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <Badge variant="brand" size="sm">
                      {feat.badge}
                    </Badge>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-[#0EA5E9] transition">
                    {feat.title}
                  </h3>
                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-white/5">
                  <Link
                    to={feat.link}
                    className="inline-flex items-center text-xs font-bold text-[#0F4C5C] dark:text-sky-400 group-hover:text-[#0EA5E9] transition"
                  >
                    Explore Module <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4-Step Process Workflow */}
      <section className="py-14 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-slate-200 dark:border-white/10">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <h2 className="text-xs font-bold text-[#0EA5E9] uppercase tracking-widest">
            {t('automatedLifecycle')}
          </h2>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-display">
            {t('howItWorksTitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 font-bold flex items-center justify-center mb-4">01</div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">{t('step1Title')}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {t('step1Desc')}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 font-bold flex items-center justify-center mb-4">02</div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">{t('step2Title')}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {t('step2Desc')}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 font-bold flex items-center justify-center mb-4">03</div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">{t('step3Title')}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {t('step3Desc')}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-500 font-bold flex items-center justify-center mb-4">04</div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">{t('step4Title')}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {t('step4Desc')}
            </p>
          </div>
        </div>
      </section>

      {/* 7-Phase Architecture Pipeline */}
      <section className="py-14 sm:py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#0F172A]/50 border-y border-slate-200 dark:border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
            <h2 className="text-xs font-bold text-[#0EA5E9] uppercase tracking-widest">
              {t('architecturalBlueprint')}
            </h2>
            <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display">
              {t('ecosystemBlueprint')}
            </p>
            <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              Sensor → Water Monitoring → Warning → Automatic Storage → Water Reuse → Municipality Dashboard → AI Prediction
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {roadmapSteps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  className="relative p-6 rounded-2xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 hover:border-[#0EA5E9] transition-all duration-300 group flex flex-col justify-between shadow-sm hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-black text-slate-400 font-display">
                        {step.num}
                      </span>
                      <Badge variant="brand" size="sm">
                        {step.badge}
                      </Badge>
                    </div>

                    <div className="w-12 h-12 rounded-xl bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 shadow-sm flex items-center justify-center mb-4 text-[#0F4C5C] dark:text-sky-400 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-[#0EA5E9] transition">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/10 flex items-center text-xs font-semibold text-[#0F4C5C] dark:text-sky-400 group-hover:text-[#0EA5E9] transition">
                    <span>{t('explorePhase')}</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Role Profiles Section */}
      <section className="py-14 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-xs font-bold text-[#0F4C5C] dark:text-sky-400 uppercase tracking-wider">
            Tailored Experience
          </h2>
          <p className="mt-1 text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-display">
            {t('tailoredExperience')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 shadow-md flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 flex items-center justify-center font-bold mb-4">
                01
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('role1Title')}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                {t('role1Desc')}
              </p>
            </div>
            <div className="mt-6">
              <Link to="/dashboard">
                <button className="w-full py-2.5 text-xs font-bold rounded-xl border border-slate-300 dark:border-white/20 text-slate-800 dark:text-white bg-slate-50 dark:bg-white/5 hover:bg-slate-100 transition">
                  {t('openResidentView')}
                </button>
              </Link>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 shadow-md flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold mb-4">
                02
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('role2Title')}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                {t('role2Desc')}
              </p>
            </div>
            <div className="mt-6">
              <Link to="/maintenance">
                <button className="w-full py-2.5 text-xs font-bold rounded-xl border border-slate-300 dark:border-white/20 text-slate-800 dark:text-white bg-slate-50 dark:bg-white/5 hover:bg-slate-100 transition">
                  {t('technicianHub')}
                </button>
              </Link>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 shadow-md flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-500/20 text-[#0F4C5C] dark:text-teal-300 flex items-center justify-center font-bold mb-4">
                03
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('role3Title')}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                {t('role3Desc')}
              </p>
            </div>
            <div className="mt-6">
              <Link to="/admin/dashboard">
                <button className="w-full py-2.5 text-xs font-bold rounded-xl text-white bg-[#0F4C5C] hover:bg-[#0A333E] transition shadow-md">
                  {t('adminDashboard')}
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="py-14 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-xs font-bold text-[#0EA5E9] uppercase tracking-widest flex items-center justify-center gap-1.5">
            <HelpCircle className="w-4 h-4" /> {t('faqTitle')}
          </h2>
          <p className="mt-1 text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-display">
            {t('faqSubtitle')}
          </p>
        </div>

        <div className="space-y-3.5 sm:space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm transition"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full px-5 sm:px-6 py-4 text-left font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center justify-between gap-4"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === idx ? 'rotate-180 text-[#0EA5E9]' : ''}`} />
              </button>
              {openFaq === idx && (
                <div className="px-5 sm:px-6 pb-5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-white/5 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

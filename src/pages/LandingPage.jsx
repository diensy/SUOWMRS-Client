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
  Users,
  GraduationCap,
  Award,
  Scale,
  BookOpen,
} from 'lucide-react';
import Badge from '../components/common/Badge';
import StatusIndicator from '../components/common/StatusIndicator';
import Footer from '../components/layout/Footer';
import { useTheme } from '../context/ThemeContext';
import { useLanguage, LANGUAGES } from '../context/LanguageContext';
import { getCurrentUser, isAuthenticated, logoutUser } from '../services/authService';
import Logo from '../components/common/Logo';
import VoiceSpeakerButton from '../components/common/VoiceSpeakerButton';

export default function LandingPage() {
  const { isDark, toggleTheme } = useTheme();
  const { language, changeLanguage, t } = useLanguage();
  const loggedIn = isAuthenticated();
  const currentUser = getCurrentUser();
  const [openFaq, setOpenFaq] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedTeamMember, setSelectedTeamMember] = useState(null);

  const teamMembers = [
    {
      id: 'ananya-routray',
      name: 'Ananya Routray',
      order: 1,
      role: 'Faculty Mentor & Project Guide of SUOWMRS',
      designation: 'Faculty Mentor & Project Guide',
      institution: 'Madhusudan Law University',
      department: 'Faculty of Law & Interdisciplinary Research',
      badge: 'Faculty Mentor & Project Guide',
      category: 'Academic & Project Guidance',
      image: '/team/ananya-routray.jpg',
      bio: 'Visionary Faculty Mentor directing the research architecture, environmental compliance, and statutory alignment of SUOWMRS with municipal guidelines and ecological jurisprudence.',
      vision: 'Harnessing the convergence of environmental jurisprudence and cutting-edge IoT automation to empower civic institutions with accountable, sustainable water management.',
      expertise: ['Environmental Law', 'Project Guidance', 'Regulatory Policy', 'Ecological Governance'],
      isMentor: true,
      accentGlow: 'from-amber-500/20 via-emerald-500/10 to-transparent',
      borderColor: 'group-hover:border-amber-500/60 dark:group-hover:border-amber-400/60',
      badgeColor: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30',
      quote: 'True urban sustainability is realized when statutory environmental mandates meet smart real-time technological execution.',
    },
    {
      id: 'soubhaginee-nayak',
      name: 'Soubhaginee Nayak',
      order: 2,
      role: 'Founding Partner of SUOWMRS',
      qualification: '3-Year LL.B Student',
      designation: 'Founding Partner',
      institution: 'Madhusudan Law University',
      badge: 'Founding Partner',
      category: 'Founding Team',
      image: '/team/soubhaginee-nayak.jpg',
      bio: 'Co-innovator spearheading system conception, urban water rights policies, and IoT-driven drainage accountability to combat civic water logging and infrastructure challenges.',
      vision: 'Transforming how urban municipalities treat drainage and water runoff by establishing smart legal and technological defenses against climate-induced flooding.',
      expertise: ['Urban Water Policy', 'System Architecture', 'Civic Rights', 'Legal Frameworks'],
      isMentor: false,
      accentGlow: 'from-sky-500/20 via-teal-500/10 to-transparent',
      borderColor: 'group-hover:border-sky-500/60 dark:group-hover:border-sky-400/60',
      badgeColor: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30',
      quote: 'Equitable civic water access and flood protection are fundamental rights that technology and law must jointly secure.',
    },
    {
      id: 'priyanka-bihari',
      name: 'Priyanka Bihari',
      order: 3,
      role: 'Founding Partner of SUOWMRS',
      qualification: '3-Year LL.B Student',
      designation: 'Founding Partner',
      institution: 'Madhusudan Law University',
      badge: 'Founding Partner',
      category: 'Founding Team',
      image: '/team/priyanka-bihari.jpg',
      bio: 'Co-innovator driving closed-loop water treatment integration, community equity standards, and policy frameworks for treated greywater reuse channels.',
      vision: 'Ensuring that every drop of harvested and recycled water contributes to community sustainability and civic prosperity through innovative law and technology.',
      expertise: ['Water Reuse Protocols', 'Community Governance', 'Environmental Advocacy', 'Sustainable IoT'],
      isMentor: false,
      accentGlow: 'from-emerald-500/20 via-teal-500/10 to-transparent',
      borderColor: 'group-hover:border-emerald-500/60 dark:group-hover:border-emerald-400/60',
      badgeColor: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
      quote: 'Reclaiming urban greywater into productive community life is the definitive key to climate-resilient cities of tomorrow.',
    },
  ];

  const featuresList = [
    {
      id: 'telemetry',
      title: t('feat1Title'),
      desc: t('feat1Desc'),
      icon: Droplets,
      color: 'text-sky-500 bg-sky-500/10 border-sky-500/20',
      link: '/water-monitoring',
      badge: `${t('lp_phase')} 1`,
    },
    {
      id: 'storage',
      title: t('feat2Title'),
      desc: t('feat2Desc'),
      icon: Database,
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
      link: '/storage',
      badge: `${t('lp_phase')} 4`,
    },
    {
      id: 'reuse',
      title: t('feat3Title'),
      desc: t('feat3Desc'),
      icon: Recycle,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      link: '/water-reuse',
      badge: `${t('lp_phase')} 5`,
    },
    {
      id: 'ai',
      title: t('feat4Title'),
      desc: t('feat4Desc'),
      icon: Sparkles,
      color: 'text-violet-500 bg-violet-500/10 border-violet-500/20',
      link: '/ai-prediction',
      badge: `${t('lp_phase')} 7`,
    },
    {
      id: 'gis',
      title: t('feat5Title'),
      desc: t('feat5Desc'),
      icon: Map,
      color: 'text-teal-500 bg-teal-500/10 border-teal-500/20',
      link: '/admin/map',
      badge: `${t('lp_phase')} 6`,
    },
    {
      id: 'sos',
      title: t('feat6Title'),
      desc: t('feat6Desc'),
      icon: AlertTriangle,
      color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
      link: '/sos',
      badge: t('sos_emergency'),
    },
    {
      id: 'maintenance',
      title: t('feat7Title'),
      desc: t('feat7Desc'),
      icon: Wrench,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
      link: '/system-health',
      badge: t('role_technician'),
    },
    {
      id: 'weather',
      title: t('feat8Title'),
      desc: t('feat8Desc'),
      icon: CloudRain,
      color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
      link: '/weather',
      badge: t('lp_forecast'),
    },
  ];

  const roadmapSteps = [
    { num: '01', title: t('phase1Title'), desc: t('phase1Desc'), icon: Cpu, badge: `${t('lp_phase')} 1` },
    { num: '02', title: t('phase2Title'), desc: t('phase2Desc'), icon: Waves, badge: `${t('lp_phase')} 2` },
    { num: '03', title: t('phase3Title'), desc: t('phase3Desc'), icon: BellRing, badge: `${t('lp_phase')} 3` },
    { num: '04', title: t('phase4Title'), desc: t('phase4Desc'), icon: Database, badge: `${t('lp_phase')} 4` },
    { num: '05', title: t('phase5Title'), desc: t('phase5Desc'), icon: Recycle, badge: `${t('lp_phase')} 5` },
    { num: '06', title: t('phase6Title'), desc: t('phase6Desc'), icon: Building2, badge: `${t('lp_phase')} 6` },
    { num: '07', title: t('phase7Title'), desc: t('phase7Desc'), icon: Sparkles, badge: `${t('lp_phase')} 7` },
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
            <Logo size="sm" />
            <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white font-display">
              SUOW<span className="text-amber-500">MRS</span>
            </span>
          </Link>

          {/* Desktop Navigation Bar */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-bold text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition">
              {t('featuresBadge', 'Features')}
            </a>
            <a href="#blueprint" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition">
              {t('architecturalBlueprint', 'Architecture')}
            </a>
            <a href="#team" className="hover:text-emerald-700 dark:hover:text-emerald-400 text-emerald-800 dark:text-emerald-400 font-extrabold transition flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300/60 dark:border-emerald-700/50">
              <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{t('meetOurTeam', 'Meet Our Team')}</span>
            </a>
            <a href="#faq" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition">
              {t('faqTitle', 'FAQ')}
            </a>
          </nav>

          {/* Desktop Right Nav Controls */}
          <div className="hidden md:flex items-center gap-3">
            <div className="relative flex items-center">
              <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400 absolute left-2.5 pointer-events-none" />
              <select
                value={language}
                onChange={(e) => changeLanguage(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
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
              title={isDark ? t('lightMode') : t('darkMode')}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {loggedIn && currentUser ? (
              <Link to={currentUser.role === 'Admin' ? '/admin/dashboard' : currentUser.role === 'Technician' ? '/system-health' : '/dashboard'}>
                <button className="px-4 py-2 text-xs font-bold rounded-xl text-white bg-emerald-800 hover:bg-emerald-900 shadow-md flex items-center gap-2 transition ring-1 ring-amber-400/30">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-black">
                    {currentUser.fullName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span>{currentUser.fullName}</span>
                </button>
              </Link>
            ) : (
              <Link to="/login">
                <button className="px-5 py-2 text-xs font-bold rounded-xl text-white bg-emerald-800 hover:bg-emerald-900 shadow-md flex items-center gap-1.5 transition">
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

            {/* Mobile Nav Links */}
            <div className="py-2 border-t border-b border-slate-100 dark:border-white/5 flex flex-col gap-1 text-xs font-bold text-slate-700 dark:text-slate-200">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-3 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition"
              >
                {t('featuresBadge', 'Features')}
              </a>
              <a
                href="#blueprint"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-3 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition"
              >
                {t('architecturalBlueprint', 'Architecture')}
              </a>
              <a
                href="#team"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 rounded-xl transition flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{t('meetOurTeam', 'Meet Our Team')}</span>
                </div>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-400 text-slate-900">New</span>
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-3 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition"
              >
                {t('faqTitle', 'FAQ')}
              </a>
            </div>

            <div className="pt-2">
              {loggedIn && currentUser ? (
                <Link to={currentUser.role === 'Admin' ? '/admin/dashboard' : currentUser.role === 'Technician' ? '/system-health' : '/dashboard'} onClick={() => setMobileMenuOpen(false)}>
                  <button className="w-full py-2.5 text-xs font-bold rounded-xl text-white bg-emerald-800 text-center shadow-md flex items-center justify-center gap-2">
                    <span>{t('lp_myAccount')} ({currentUser.fullName})</span>
                  </button>
                </Link>
              ) : (
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <button className="w-full py-2.5 text-xs font-bold rounded-xl text-white bg-emerald-800 text-center shadow-md flex items-center justify-center gap-1.5">
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
        {/* Sustainability Glow Backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[600px] h-[250px] sm:h-[350px] bg-gradient-to-tr from-emerald-300/30 via-amber-200/20 to-sky-200/20 dark:from-emerald-950/40 dark:via-amber-950/15 dark:to-slate-950 blur-3xl rounded-full -z-10" />

        <div className="max-w-5xl mx-auto text-center">
          {/* Sustainability Badge + Voice Readout */}
          <div className="inline-flex items-center gap-2 p-1 pl-3 pr-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/50 text-emerald-800 dark:text-emerald-300 text-xs font-bold mb-6 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="hidden sm:inline">{t('heroBadge')}</span>
            <span className="sm:hidden">{t('lp_platform')}</span>
            <VoiceSpeakerButton
              text={`${t('heroTitle1')} ${t('heroTitle2')}. ${t('heroDesc')}`}
              label={t('tts_listenOverview')}
              size="xs"
              variant="pill"
              id="landing-hero-speech"
            />
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15] font-display">
            {t('heroTitle1')} <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 via-teal-600 to-amber-500 dark:from-emerald-400 dark:via-teal-300 dark:to-amber-400">
              {t('heroTitle2')}
            </span>
          </h1>

          <p className="mt-5 sm:mt-6 text-sm sm:text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            {t('heroDesc')}
          </p>

          {/* Positioning Cues: Water Management • Sustainability • Smart Infrastructure */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs font-bold">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/40">
              <Droplets className="w-3.5 h-3.5 text-sky-500" /> {t('lp_cueWater')}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
              <Recycle className="w-3.5 h-3.5 text-emerald-600" /> {t('lp_cueSustainability')}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40">
              <Cpu className="w-3.5 h-3.5 text-amber-500" /> {t('lp_cueInfrastructure')}
            </span>
          </div>

          <div className="mt-7 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link to="/dashboard" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-6 py-3 text-sm font-bold rounded-2xl text-white bg-emerald-800 hover:bg-emerald-900 shadow-lg shadow-emerald-950/25 flex items-center justify-center gap-2.5 transition active:scale-95">
                <Waves className="w-4 h-4 text-amber-300" /> {t('residentOps')}
              </button>
            </Link>
            <Link to="/admin/dashboard" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-6 py-3 text-sm font-bold rounded-2xl text-emerald-900 dark:text-emerald-300 bg-white dark:bg-white/10 border-2 border-emerald-700 dark:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-white/20 shadow-md flex items-center justify-center gap-2.5 transition active:scale-95">
                <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> {t('adminDashboard')}
              </button>
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-10 sm:mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 shadow-md text-left">
              <div className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('sensorsMonitored')}</div>
              <div className="text-xl sm:text-2xl font-black text-emerald-800 dark:text-emerald-400 mt-1 font-display">128 {t('lp_nodes')}</div>
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
              <div className="mt-1 text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 font-semibold">72% {t('capacity')}</div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 shadow-md text-left">
              <div className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('autoValveStatus')}</div>
              <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-display">{t('lp_ready')}</div>
              <div className="mt-1 text-[11px] sm:text-xs text-emerald-700 dark:text-emerald-400 font-bold">{t('lp_espSimActive')}</div>
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
              <p className="text-2xl sm:text-3xl font-black font-display text-sky-600 dark:text-sky-400">48,500 L</p>
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
      <section id="features" className="scroll-mt-20 py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
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
                    {t('lp_exploreModule')} <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
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
      <section id="blueprint" className="scroll-mt-20 py-14 sm:py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#0F172A]/50 border-y border-slate-200 dark:border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
            <h2 className="text-xs font-bold text-[#0EA5E9] uppercase tracking-widest">
              {t('architecturalBlueprint')}
            </h2>
            <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display">
              {t('ecosystemBlueprint')}
            </p>
            <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              {t('lp_flowChain')}
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

                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/10 flex items-center text-xs font-semibold text-emerald-800 dark:text-emerald-400 group-hover:text-amber-500 transition">
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
          <h2 className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
            {t('lp_tailoredExperience')}
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
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold mb-4">
                03
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('role3Title')}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                {t('role3Desc')}
              </p>
            </div>
            <div className="mt-6">
              <Link to="/admin/dashboard">
                <button className="w-full py-2.5 text-xs font-bold rounded-xl text-white bg-emerald-800 hover:bg-emerald-900 transition shadow-md">
                  {t('adminDashboard')}
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Meet Our Team Section */}
      <section
        id="team"
        className="scroll-mt-20 relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-t border-slate-200 dark:border-white/10 bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-[#090E17] dark:via-[#0F172A]/50 dark:to-[#090E17] overflow-hidden"
      >
        {/* Ambient Decorative Glows */}
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/50 text-emerald-800 dark:text-emerald-300 text-xs font-bold mb-4 shadow-sm">
              <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{t('teamEyebrow', 'Leadership & Academic Innovation')}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Madhusudan Law University</span>
            </div>

            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight font-display leading-[1.15]">
              Meet Our{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-500 dark:from-emerald-400 dark:via-teal-300 dark:to-amber-400">
                Founders & Mentors
              </span>
            </h2>

            <p className="mt-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              {t('teamDescription')}
            </p>

            {/* Voice Audio Readout */}
            <div className="mt-4 flex justify-center">
              <VoiceSpeakerButton
                text={`Meet Our Team: First, Ananya Routray, Faculty Mentor and Project Guide of SUOWMRS from Madhusudan Law University; Second, Soubhaginee Nayak, Founding Partner and LL.B Student; and Third, Priyanka Bihari, Founding Partner and LL.B Student.`}
                label={t('tts_listenTeam', 'Listen to Team Introduction')}
                size="xs"
                variant="pill"
                id="landing-team-speech"
              />
            </div>
          </div>

          {/* 3 Team Cards Grid: 1st Ananya Routray, 2nd Soubhaginee Nayak, 3rd Priyanka Bihari */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className={`group relative rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 ${member.borderColor} shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 flex flex-col justify-between overflow-hidden`}
              >
                {/* Image Showcase Frame with Top Overlays */}
                <div className="relative h-80 sm:h-96 w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover object-[center_20%] group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />

                  {/* Gradient Vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-transparent pointer-events-none" />

                  {/* Top Badges */}
                  <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
                    {member.isMentor ? (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-amber-400/60 text-amber-300 text-xs font-black shadow-lg">
                        <Award className="w-3.5 h-3.5 text-amber-400" />
                        <span>Faculty Mentor & Guide</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-emerald-400/60 text-emerald-300 text-xs font-black shadow-lg">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Founding Partner</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-950/75 backdrop-blur-md border border-white/20 text-slate-200 text-[11px] font-bold shadow-md">
                      <Scale className="w-3 h-3 text-amber-400" />
                      <span>MLU</span>
                    </div>
                  </div>

                  {/* Bottom Image Overlay Details */}
                  <div className="absolute bottom-4 left-4 right-4 text-left pointer-events-none">
                    <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider text-amber-300 drop-shadow">
                      {member.category}
                    </span>
                    <h3 className="text-2xl font-black font-display text-white tracking-tight drop-shadow-md">
                      {member.name}
                    </h3>
                    <p className="text-xs font-semibold text-emerald-300 drop-shadow line-clamp-1 mt-0.5">
                      {member.role}
                    </p>
                  </div>
                </div>

                {/* Card Body Details */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    {/* Qualification & University Affiliation */}
                    <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/5">
                      <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <p className="font-bold text-slate-900 dark:text-white">
                          {member.qualification || member.department}
                        </p>
                        <p className="text-slate-500 dark:text-slate-400 text-[11px] font-medium">
                          {member.institution}
                        </p>
                      </div>
                    </div>

                    {/* Bio Summary */}
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                      {member.bio}
                    </p>

                    {/* Expertise Skill Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {member.expertise.map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Action Row */}
                  <div className="mt-5 pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span>{member.isMentor ? 'Faculty Guide' : 'Core Innovator'}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedTeamMember(member)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-800 dark:text-white bg-slate-100 dark:bg-white/10 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-700 dark:hover:text-emerald-300 transition"
                    >
                      <span>View Vision</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Academic & Research Aegis Showcase Banner */}
          <div className="mt-12 sm:mt-16 max-w-4xl mx-auto p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950 via-[#0F172A] to-slate-900 border border-emerald-500/30 shadow-2xl text-white relative overflow-hidden">
            <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-emerald-500 p-0.5 shadow-lg shrink-0">
                <div className="w-full h-full rounded-2xl bg-slate-950 flex items-center justify-center">
                  <Scale className="w-7 h-7 text-amber-400" />
                </div>
              </div>

              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-amber-300 text-[11px] font-bold mb-2">
                  <Award className="w-3.5 h-3.5" />
                  <span>{t('teamAegis', 'Under the Academic & Research Aegis')}</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white font-display">
                  Madhusudan Law University, Cuttack
                </h3>
                <p className="mt-1.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {t('teamAegisDesc')}
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-semibold text-emerald-300">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Environmental Jurisprudence
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> Automated Flood Defense
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" /> SDG 6 Clean Water & Sanitation
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Member Vision & Profile Modal */}
        {selectedTeamMember && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => setSelectedTeamMember(null)}
          >
            <div
              className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header Cover with Profile */}
              <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-slate-900">
                <img
                  src={selectedTeamMember.image}
                  alt={selectedTeamMember.name}
                  className="w-full h-full object-cover object-[center_20%]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setSelectedTeamMember(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-white/20 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Badges */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/20 text-xs font-bold text-amber-300">
                    {selectedTeamMember.badge}
                  </span>
                </div>

                {/* Name & Title */}
                <div className="absolute bottom-4 left-5 right-5 text-white">
                  <h3 className="text-2xl sm:text-3xl font-black font-display">{selectedTeamMember.name}</h3>
                  <p className="text-xs sm:text-sm font-semibold text-emerald-300 mt-1">
                    {selectedTeamMember.role}
                  </p>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4 max-h-[50vh] overflow-y-auto">
                <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/5">
                  <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div className="text-xs">
                    <p className="font-bold text-slate-900 dark:text-white">
                      {selectedTeamMember.qualification || selectedTeamMember.department}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                      {selectedTeamMember.institution}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Leadership Vision & Role
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {selectedTeamMember.bio}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40">
                  <p className="text-xs italic text-emerald-900 dark:text-emerald-200 leading-relaxed">
                    "{selectedTeamMember.quote}"
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Core Specializations
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTeamMember.expertise.map((exp, eIdx) => (
                      <span
                        key={eIdx}
                        className="text-xs font-semibold px-3 py-1 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10"
                      >
                        {exp}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-[#090E17]/50 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  SUOWMRS Core Initiative
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedTeamMember(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq" className="scroll-mt-20 py-14 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
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

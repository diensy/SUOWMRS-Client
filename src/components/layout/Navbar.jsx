import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Bell, Menu, ChevronDown, Globe, Wifi, WifiOff, Sun, Moon, Check,
  User as UserIcon, ShieldCheck, LogOut, CheckCircle2, AlertCircle, Mail,
  LayoutDashboard, Waves, Brain, BellRing, Database, Recycle, CloudRain,
  MessageSquareWarning, CreditCard, AlertOctagon, Activity, Cpu, Radio, Zap,
  Wrench, Shield, UserCheck, Tag, Layers, MapPin, Sparkles, Home,
} from 'lucide-react';
import { useLanguage, LANGUAGES } from '../../context/LanguageContext';
import { useSocket } from '../../hooks/useSocket';
import { useTheme } from '../../context/ThemeContext';
import { getCurrentUser, logoutUser } from '../../services/authService';
import { getUnreadCount } from '../../services/alertService';
import Logo from '../common/Logo';
import VoiceSpeakerButton from '../common/VoiceSpeakerButton';

// Route → { titleKey, sectionKey, icon } so the header can show where the user is
const ROUTE_META = [
  ['/dashboard', 'dashboard', 'residentOps', LayoutDashboard],
  ['/water-monitoring', 'waterMonitoring', 'residentOps', Waves],
  ['/ai-prediction/history', 'ph_title', 'residentOps', Brain],
  ['/ai-prediction', 'aiPrediction', 'residentOps', Brain],
  ['/alerts', 'alerts', 'residentOps', BellRing],
  ['/storage', 'storage', 'residentOps', Database],
  ['/water-reuse', 'waterReuse', 'residentOps', Recycle],
  ['/weather', 'weather', 'residentOps', CloudRain],
  ['/citizen-portal', 'complaints', 'residentOps', MessageSquareWarning],
  ['/payments/subscription', 'sub_title', 'residentOps', CreditCard],
  ['/payments/invoices', 'inv_title', 'residentOps', CreditCard],
  ['/payments/checkout', 'co_orderSummary', 'residentOps', CreditCard],
  ['/payments', 'paymentsAmc', 'residentOps', CreditCard],
  ['/sos', 'sos', 'residentOps', AlertOctagon],
  ['/profile', 'myProfile', null, UserIcon],
  ['/system-health', 'systemHealth', 'technicianSuite', Activity],
  ['/maintenance/esp32', 'esp32Diagnostics', 'technicianSuite', Cpu],
  ['/maintenance/sensors', 'sensorDiagnostics', 'technicianSuite', Radio],
  ['/maintenance/components', 'componentsHealth', 'technicianSuite', Zap],
  ['/maintenance/work-orders', 'workOrders', 'technicianSuite', Wrench],
  ['/work-orders', 'workOrders', 'technicianSuite', Wrench],
  ['/admin/dashboard', 'adminDashboard', 'municipalityAdmin', Shield],
  ['/municipality/dashboard', 'adminDashboard', 'municipalityAdmin', Shield],
  ['/admin/approvals', 'userApprovals', 'municipalityAdmin', UserCheck],
  ['/admin/pricing', 'pricingManagement', 'municipalityAdmin', Tag],
  ['/municipality/systems', 'adminSystems', 'municipalityAdmin', Layers],
  ['/admin/systems', 'adminSystems', 'municipalityAdmin', Layers],
  ['/municipality/map', 'adminMap', 'municipalityAdmin', MapPin],
  ['/admin/map', 'adminMap', 'municipalityAdmin', MapPin],
  ['/municipality/complaints', 'adminComplaints', 'municipalityAdmin', MessageSquareWarning],
  ['/municipality/emergency', 'emergencyMonitoring', 'municipalityAdmin', AlertOctagon],
];

const ROLE_STYLES = {
  Admin: 'from-rose-500 to-orange-500',
  Technician: 'from-amber-500 to-yellow-400',
  Resident: 'from-emerald-500 to-teal-400',
};

export default function Navbar({ onMenuToggle, userRole = 'Resident', onRoleChange, unreadAlertsCount = 0 }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang, setLang, t } = useLanguage();
  const { isConnected } = useSocket();
  const { toggleTheme, isDark } = useTheme();
  const [langOpen, setLangOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [unread, setUnread] = useState(unreadAlertsCount);
  const langRef = useRef(null);
  const profileRef = useRef(null);
  const currentUser = getCurrentUser();
  const isAdmin = userRole === 'Admin' || currentUser?.role === 'Admin';

  const currentLang = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];
  const roleKey = String(currentUser?.role || userRole).toLowerCase();
  const initials = (currentUser?.fullName || userRole)
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');

  const pageMeta = useMemo(() => {
    const hit = ROUTE_META.find(([p]) => location.pathname.startsWith(p));
    return hit ? { titleKey: hit[1], sectionKey: hit[2], Icon: hit[3] } : { titleKey: 'dashboard', sectionKey: null, Icon: Home };
  }, [location.pathname]);

  // Close dropdowns on outside click / Escape
  useEffect(() => {
    const onClick = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') { setLangOpen(false); setProfileOpen(false); }
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onClick); document.removeEventListener('keydown', onKey); };
  }, []);

  // Unread alert count — refreshed every 30 s and when the route changes
  useEffect(() => {
    let alive = true;
    const load = () => getUnreadCount().then((d) => alive && setUnread(d?.count ?? 0)).catch(() => {});
    load();
    const timer = setInterval(load, 30000);
    return () => { alive = false; clearInterval(timer); };
  }, [location.pathname]);

  const handleLogout = () => {
    setProfileOpen(false);
    logoutUser();
    navigate('/login');
  };

  const PageIcon = pageMeta.Icon;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-[#0B1220]/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/[0.06] shadow-[0_1px_0_0_rgba(255,255,255,0.6)_inset] dark:shadow-none transition-colors duration-200">
      {/* Brand accent line */}
      <div className="h-[3px] w-full bg-gradient-to-r from-emerald-600 via-teal-400 to-amber-400" />

      <div className="px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[60px] sm:h-[68px] gap-2 sm:gap-4">

          {/* ── Left: menu + brand + page context ── */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 -ml-1 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition"
              aria-label={t('toggleNavigation')}
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link to="/" className="flex items-center gap-2.5 group select-none flex-shrink-0">
              <Logo size="md" />
              <div className="hidden sm:flex flex-col leading-none">
                <span className="font-black text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white font-display">
                  SUOW<span className="text-amber-500">MRS</span>
                </span>
                <span className="text-[9px] tracking-[0.18em] uppercase font-bold text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">
                  {t('appSubtitle')}
                </span>
              </div>
            </Link>

            {/* Page context — desktop only */}
            <div className="hidden lg:flex items-center gap-3 pl-4 ml-1 border-l border-slate-200 dark:border-white/10 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/15 to-teal-500/10 dark:from-emerald-400/15 dark:to-teal-400/10 border border-emerald-500/20 flex items-center justify-center text-emerald-700 dark:text-emerald-300 flex-shrink-0">
                <PageIcon className="w-4 h-4" />
              </div>
              <div className="flex flex-col leading-tight min-w-0">
                {pageMeta.sectionKey && (
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500 whitespace-nowrap">
                    {t(pageMeta.sectionKey)}
                  </span>
                )}
                <span className="text-sm font-extrabold text-slate-900 dark:text-white whitespace-nowrap truncate max-w-[200px] xl:max-w-[320px]">
                  {t(pageMeta.titleKey)}
                </span>
              </div>
            </div>
          </div>

          {/* ── Center: live telemetry status ── */}
          <div className="hidden 2xl:flex items-center gap-2.5 px-3.5 py-1.5 rounded-full whitespace-nowrap bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10">
            <span className="relative flex h-2.5 w-2.5">
              {isConnected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isConnected ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            </span>
            {isConnected
              ? <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400"><Wifi className="w-3.5 h-3.5" />{t('sensorsActive')}</span>
              : <span className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400"><WifiOff className="w-3.5 h-3.5" />{t('offline')}</span>
            }
            <span className="w-px h-4 bg-slate-200 dark:bg-white/10" />
            <span className="text-[11px] font-bold font-mono text-slate-500 dark:text-slate-400">
              {t('dash_node')} <span className="text-amber-600 dark:text-amber-400">SYS-042</span>
            </span>
          </div>

          {/* ── Right: role switch · action cluster · alerts · account ── */}
          <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">

            {/* Role simulator — Admin only */}
            {isAdmin && (
              <div className="hidden lg:flex items-center p-1 rounded-full bg-slate-100 dark:bg-white/[0.05] border border-slate-200/80 dark:border-white/10 text-[11px]">
                {['Resident', 'Technician', 'Admin'].map((role) => {
                  const active = userRole === role;
                  return (
                    <button
                      key={role}
                      onClick={() => onRoleChange?.(role)}
                      className={`px-3 py-1 rounded-full font-bold transition-all ${
                        active
                          ? 'bg-white dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 shadow-sm ring-1 ring-emerald-500/30'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {t(`role_${role.toLowerCase()}`)}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Action cluster: voice · language · theme */}
            <div className="flex items-center rounded-full bg-slate-100/80 dark:bg-white/[0.05] border border-slate-200/80 dark:border-white/10 p-1 gap-0.5">
              <VoiceSpeakerButton
                text={() => t('tts_navbarStatus', { node: 'SYS-042' })}
                label={t('tts_listen')}
                showLabel={false}
                size="sm"
                variant="ghost"
                id="navbar-global-tts"
                className="!rounded-full !p-2 !px-2"
              />
              <span className="w-px h-5 bg-slate-200 dark:bg-white/10" />

              <div className="relative" ref={langRef}>
                <button
                  onClick={() => setLangOpen((p) => !p)}
                  className={`flex items-center gap-1.5 pl-2 pr-1.5 py-1.5 rounded-full text-xs font-bold transition ${
                    langOpen
                      ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  aria-label={t('changeLanguage')}
                  aria-haspopup="listbox"
                  aria-expanded={langOpen}
                >
                  <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="hidden sm:inline">{currentLang.native}</span>
                  <span className="sm:hidden uppercase">{currentLang.code}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
                </button>

                {langOpen && (
                  <div className="absolute right-0 top-full mt-3 w-52 rounded-2xl bg-white dark:bg-[#111a2b] border border-slate-200 dark:border-white/10 shadow-2xl shadow-black/20 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="px-3.5 pt-3 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
                      {t('language')}
                    </div>
                    <div className="p-1.5 pt-0" role="listbox">
                      {LANGUAGES.map((l) => {
                        const active = lang === l.code;
                        return (
                          <button
                            key={l.code}
                            role="option"
                            aria-selected={active}
                            onClick={() => { setLang(l.code); setLangOpen(false); }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition ${
                              active
                                ? 'bg-emerald-600 text-white font-bold shadow-sm'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
                            }`}
                          >
                            <span className="font-semibold">{l.native}</span>
                            <span className={`flex items-center gap-1.5 text-[10px] ${active ? 'text-emerald-100' : 'text-slate-400'}`}>
                              {l.label}
                              {active && <Check className="w-3 h-3" />}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <span className="w-px h-5 bg-slate-200 dark:bg-white/10" />
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-white/10 hover:text-amber-500 dark:hover:text-amber-300 transition group"
                title={isDark ? t('lightMode') : t('darkMode')}
                aria-label={isDark ? t('lightMode') : t('darkMode')}
              >
                {isDark
                  ? <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 group-hover:rotate-45" />
                  : <Moon className="w-4 h-4 transition-transform duration-300 group-hover:-rotate-12" />}
              </button>
            </div>

            {/* Alerts */}
            <button
              onClick={() => navigate('/alerts')}
              className="relative p-2.5 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100/80 dark:bg-white/[0.05] border border-slate-200/80 dark:border-white/10 hover:bg-white dark:hover:bg-white/10 transition"
              aria-label={t('notifications')}
              title={unread > 0 ? t('nav_newAlerts', { n: unread }) : t('nav_noNewAlerts')}
            >
              <Bell className="w-[18px] h-[18px]" />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white dark:ring-[#0B1220]">
                  {unread > 99 ? '99+' : unread}
                </span>
              )}
            </button>

            {/* Account */}
            {currentUser ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen((p) => !p)}
                  className={`flex items-center gap-2.5 pl-1 pr-1.5 sm:pr-2.5 py-1 rounded-full border transition ${
                    profileOpen
                      ? 'bg-white dark:bg-white/10 border-emerald-500/40 shadow-md'
                      : 'bg-slate-100/80 dark:bg-white/[0.05] border-slate-200/80 dark:border-white/10 hover:bg-white dark:hover:bg-white/10'
                  }`}
                  aria-label={t('nav_account')}
                  aria-expanded={profileOpen}
                >
                  <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full p-[2px] bg-gradient-to-br ${ROLE_STYLES[currentUser.role] || ROLE_STYLES.Resident}`}>
                    <div className="w-full h-full rounded-full bg-slate-900 dark:bg-[#0B1220] flex items-center justify-center text-white font-black text-xs">
                      {initials || 'U'}
                    </div>
                  </div>
                  <div className="hidden xl:flex flex-col leading-tight text-left">
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[140px]">
                      {currentUser.fullName || t('demoUser')}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                      {t(`role_${roleKey}`)}
                    </span>
                  </div>
                  <ChevronDown className={`hidden sm:block w-3.5 h-3.5 text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-full mt-3 w-72 sm:w-80 rounded-2xl bg-white dark:bg-[#111a2b] border border-slate-200 dark:border-white/10 shadow-2xl shadow-black/25 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    {/* Identity band */}
                    <div className="relative p-4 bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-500 text-white overflow-hidden">
                      <div className="absolute -right-8 -top-10 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
                      <div className="absolute right-6 bottom-2 w-16 h-16 rounded-full bg-amber-300/20 blur-xl" />
                      <div className="relative flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur border border-white/30 flex items-center justify-center font-black text-base">
                          {initials || 'U'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-black truncate">{currentUser.fullName || t('activeUser')}</p>
                          <p className="text-[11px] text-emerald-50/90 truncate flex items-center gap-1"><Mail className="w-3 h-3" />{currentUser.email || 'user@suowmrs.org'}</p>
                        </div>
                      </div>
                      <div className="relative flex items-center gap-2 mt-3">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/15 border border-white/25">{t(`role_${roleKey}`)}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 border ${
                          (currentUser.verificationStatus || 'Verified') === 'Verified'
                            ? 'bg-emerald-400/20 border-emerald-200/40'
                            : 'bg-amber-400/25 border-amber-200/40'
                        }`}>
                          {(currentUser.verificationStatus || 'Verified') === 'Verified' ? <CheckCircle2 className="w-2.5 h-2.5" /> : <AlertCircle className="w-2.5 h-2.5" />}
                          {t(`status_${String(currentUser.verificationStatus || 'Verified').toLowerCase()}`)}
                        </span>
                      </div>
                    </div>

                    <div className="p-1.5">
                      <Link to="/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition">
                        <span className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center"><UserIcon className="w-4 h-4" /></span>
                        <span className="flex-1">{t('myProfile')}</span>
                      </Link>
                      <Link to="/alerts" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition">
                        <span className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center"><BellRing className="w-4 h-4" /></span>
                        <span className="flex-1">{t('alerts')}</span>
                        {unread > 0 && <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400">{unread}</span>}
                      </Link>
                      {isAdmin && (
                        <Link to="/admin/approvals" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition">
                          <span className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center"><ShieldCheck className="w-4 h-4" /></span>
                          <span className="flex-1">{t('userTechApprovals')}</span>
                        </Link>
                      )}
                      {/* Role simulator for small screens */}
                      {isAdmin && (
                        <div className="lg:hidden px-3 pt-2 pb-1">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">{t('role')}</p>
                          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-white/[0.05] text-[11px]">
                            {['Resident', 'Technician', 'Admin'].map((role) => (
                              <button key={role} onClick={() => onRoleChange?.(role)} className={`flex-1 py-1 rounded-lg font-bold ${userRole === role ? 'bg-white dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 shadow-sm' : 'text-slate-500'}`}>
                                {t(`role_${role.toLowerCase()}_short`)}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-1.5 border-t border-slate-100 dark:border-white/10">
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition text-left">
                        <span className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center"><LogOut className="w-4 h-4" /></span>
                        {t('signOut')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login">
                <button className="px-4 py-2 text-xs font-bold rounded-full text-white bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 shadow-md shadow-emerald-900/20 transition flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
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

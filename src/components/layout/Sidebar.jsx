import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Waves, BellRing, Database, Recycle,
  CloudRain, MessageSquareWarning, AlertOctagon, Wrench,
  Activity, Radio, MapPin, BarChart3, Shield, Layers, X, Droplets,
  Cpu, Zap, UserCheck, Brain, Globe, ShieldCheck, LogOut
} from 'lucide-react';
import { useLanguage, LANGUAGES } from '../../context/LanguageContext';
import { getCurrentUser, logoutUser } from '../../services/authService';

export default function Sidebar({ isOpen, onClose, userRole = 'Resident', onRoleChange }) {
  const { lang, setLang, t } = useLanguage();
  const currentUser = getCurrentUser();
  const isAdmin = userRole === 'Admin' || currentUser?.role === 'Admin';

  const userLinks = [
    { to: '/dashboard', labelKey: 'dashboard', icon: LayoutDashboard },
    { to: '/water-monitoring', labelKey: 'waterMonitoring', icon: Waves, badge: 'Live' },
    { to: '/ai-prediction', labelKey: 'aiPrediction', icon: Brain, badge: 'AI' },
    { to: '/alerts', labelKey: 'alerts', icon: BellRing },
    { to: '/storage', labelKey: 'storage', icon: Database },
    { to: '/water-reuse', labelKey: 'waterReuse', icon: Recycle },
    { to: '/weather', labelKey: 'weather', icon: CloudRain },
    { to: '/citizen-portal', labelKey: 'complaints', icon: MessageSquareWarning },
    { to: '/sos', labelKey: 'sos', icon: AlertOctagon, danger: true },
  ];

  const technicianLinks = [
    { to: '/system-health', labelKey: 'systemHealth', icon: Activity },
    { to: '/ai-prediction', labelKey: 'aiPrediction', icon: Brain, badge: 'AI' },
    { to: '/maintenance/esp32', labelKey: 'esp32Diagnostics', icon: Cpu },
    { to: '/maintenance/sensors', labelKey: 'sensorDiagnostics', icon: Radio },
    { to: '/maintenance/components', labelKey: 'componentsHealth', icon: Zap },
    { to: '/maintenance/work-orders', labelKey: 'workOrders', icon: Wrench },
  ];

  const adminLinks = [
    { to: '/municipality/dashboard', labelKey: 'adminDashboard', icon: Shield },
    { to: '/ai-prediction', labelKey: 'aiPrediction', icon: Brain, badge: 'AI' },
    { to: '/admin/approvals', labelKey: 'userApprovals', icon: UserCheck, badge: 'Live' },
    { to: '/municipality/systems', labelKey: 'adminSystems', icon: Layers },
    { to: '/municipality/map', labelKey: 'adminMap', icon: MapPin },
    { to: '/municipality/complaints', labelKey: 'adminComplaints', icon: MessageSquareWarning },
    { to: '/municipality/emergency', labelKey: 'emergencyMonitoring', icon: AlertOctagon, danger: true },
  ];

  const navItem = (link) => {
    const Icon = link.icon;
    return (
      <NavLink
        key={link.to}
        to={link.to}
        onClick={onClose}
        end={link.to === '/dashboard'}
        className={({ isActive }) =>
          `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
            link.danger
              ? isActive
                ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                : 'text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/10'
              : isActive
              ? 'bg-[#0F4C5C] text-white shadow-lg shadow-teal-900/30 border border-teal-600/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10'
          }`
        }
      >
        <div className="flex items-center gap-3">
          <Icon className="w-4 h-4 flex-shrink-0" />
          <span>{t(link.labelKey)}</span>
        </div>
        {link.badge && (
          <span className="text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-sky-500/20 text-sky-500 dark:text-sky-400 border border-sky-500/30">
            {t('live').toUpperCase()}
          </span>
        )}
      </NavLink>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 dark:bg-[#0F172A] bg-white border-r dark:border-white/[0.06] border-slate-200 flex flex-col transition-colors duration-200 lg:translate-x-0 lg:static lg:h-full lg:flex-shrink-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile brand + close */}
        <div className="flex items-center justify-between px-4 py-3 border-b dark:border-white/[0.06] border-slate-200 lg:hidden">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-white p-0.5 shadow-sm border border-slate-200 dark:border-white/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
              <img src="/logo.png" alt="SUOWMRS Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-black text-slate-900 dark:text-white text-sm font-display">SUOW<span className="text-[#0EA5E9]">MRS</span></span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10">
            <X className="w-4 h-4" />
          </button>
        </div>


        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto custom-scrollbar px-3 py-3 space-y-4">
          {/* Resident Operations — Visible to Resident & Admin only */}
          {(userRole === 'Resident' || userRole === 'Admin') && (
            <div>
              <p className="text-[10px] font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase px-3 mb-2">{t('residentOps')}</p>
              <div className="space-y-0.5">{userLinks.map(navItem)}</div>
            </div>
          )}

          {/* Technician Suite — Visible to Technician & Admin only */}
          {(userRole === 'Technician' || userRole === 'Admin') && (
            <div className={userRole === 'Admin' ? "pt-3 border-t dark:border-white/[0.06] border-slate-200" : ""}>
              <p className="text-[10px] font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase px-3 mb-2">{t('technicianSuite')}</p>
              <div className="space-y-0.5">{technicianLinks.map(navItem)}</div>
            </div>
          )}

          {/* Admin Section — Visible to Admin only */}
          {userRole === 'Admin' && (
            <div className="pt-3 border-t dark:border-white/[0.06] border-slate-200">
              <p className="text-[10px] font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase px-3 mb-2">{t('municipalityAdmin')}</p>
              <div className="space-y-0.5">{adminLinks.map(navItem)}</div>
            </div>
          )}
        </nav>

        {/* Mobile User Profile & Sign Out button */}
        {currentUser && (
          <div className="p-3 border-t dark:border-white/[0.06] border-slate-200 lg:hidden">
            <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0F4C5C] to-[#0EA5E9] flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-sm">
                  {(currentUser.fullName || userRole).charAt(0).toUpperCase()}
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{currentUser.fullName || t('demoUser')}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">{currentUser.role || userRole}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose?.();
                  logoutUser();
                  window.location.href = '/login';
                }}
                className="p-2 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition flex-shrink-0 flex items-center gap-1 text-[11px] font-bold"
                title={t('signOut')}
              >
                <LogOut className="w-4 h-4" />
                <span className="text-[10px]">{t('signOut')}</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer with Logo */}
        <div className="px-3 py-3 border-t dark:border-white/[0.06] border-slate-200 flex flex-col gap-2">
          <div className="flex items-center gap-2.5 p-2 rounded-xl dark:bg-white/[0.04] bg-slate-50 border dark:border-white/[0.08] border-slate-200">
            <div className="w-8 h-8 rounded-lg bg-white p-0.5 flex items-center justify-center flex-shrink-0 shadow-sm border border-slate-200 dark:border-transparent">
              <img src="/logo.png" alt="SUOWMRS" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">SUOWMRS</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">{t('footerFoundation')}</p>
            </div>
          </div>
          <div className="flex items-center justify-between px-2 text-[10px] text-slate-400 dark:text-slate-500 font-mono">
            <span>v1.0.0</span>
            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {t('sensorsActive')}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}

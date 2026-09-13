import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Waves, BellRing, Database, AlertOctagon } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function BottomNav() {
  const { t } = useLanguage();

  const navItems = [
    { to: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { to: '/water-monitoring', label: t('waterMonitoring'), icon: Waves },
    { to: '/sos', label: t('emergencySos'), icon: AlertOctagon, highlight: true },
    { to: '/alerts', label: t('alerts'), icon: BellRing },
    { to: '/storage', label: t('storage'), icon: Database },
  ];

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md border-t border-slate-200/80 dark:border-white/10 px-2 py-1.5 shadow-lg transition-colors duration-200">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-2 sm:px-3 rounded-xl transition ${
                  item.highlight
                    ? isActive
                      ? 'text-status-critical dark:text-rose-400 font-bold'
                      : 'text-rose-600 dark:text-rose-400'
                    : isActive
                    ? 'text-[#0F4C5C] dark:text-[#0EA5E9] font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                }`
              }
            >
              <div
                className={`p-1 rounded-lg ${
                  item.highlight
                    ? 'bg-rose-100 dark:bg-rose-500/20 text-status-critical dark:text-rose-400 animate-pulse'
                    : ''
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 max-w-[65px] truncate text-center">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

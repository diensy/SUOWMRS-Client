import React from 'react';
import { Droplets } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-white dark:bg-[#0F172A] border-t border-slate-200/80 dark:border-white/10 py-8 px-4 sm:px-6 lg:px-8 mt-auto transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#0F4C5C] text-white flex items-center justify-center">
            <Droplets className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-sm text-slate-900 dark:text-white font-display">SUOWMRS</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">| {t('footerFoundation')}</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600 dark:text-slate-300 font-medium">
          <Link to="/" className="hover:text-[#0EA5E9] transition">{t('home')}</Link>
          <Link to="/dashboard" className="hover:text-[#0EA5E9] transition">{t('residentPortal')}</Link>
          <Link to="/admin/dashboard" className="hover:text-[#0EA5E9] transition">{t('adminDashboard')}</Link>
          <Link to="/login" className="hover:text-[#0EA5E9] transition">{t('signIn')}</Link>
        </div>

        <div className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1.5 font-mono">
          <span>© 2026 SUOWMRS</span>
          <span>•</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{t('allRightsReserved')}</span>
        </div>
      </div>
    </footer>
  );
}

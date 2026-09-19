import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import Badge from '../../components/common/Badge';

// Generic placeholder page for pages not yet built
export default function ComingSoonPage({ titleKey, icon: Icon, description }) {
  const { t } = useLanguage();

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div className="pb-4 border-b border-slate-200 dark:border-white/10">
        <h1 className="text-xl font-black text-slate-900 dark:text-white font-display flex items-center gap-2">
          {Icon && <Icon className="w-5 h-5 text-sky-600 dark:text-sky-400" />}
          {t(titleKey)}
        </h1>
      </div>

      <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-2xl p-12 flex flex-col items-center text-center gap-4 shadow-sm dark:shadow-inner">
        {Icon && (
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0F4C5C] to-[#0EA5E9] flex items-center justify-center shadow-xl shadow-sky-900/30">
            <Icon className="w-8 h-8 text-white" />
          </div>
        )}
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">{t(titleKey)}</h2>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 max-w-md leading-relaxed">
          {description || t('featureUnderDevelopment')}
        </p>
        <Badge variant="brand" size="md">{t('comingSoon')}</Badge>
      </div>
    </motion.div>
  );
}

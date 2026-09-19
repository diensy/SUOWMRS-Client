import React from 'react';
import { X, Layers, MapPin, Activity, Clock, CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { useLanguage } from '../../context/LanguageContext';

export default function SystemMapPopup({ system, onClose, onViewSystem, onDivert }) {
  const { t, locale } = useLanguage();
  if (!system) return null;

  const isCritical = system.status === 'Critical' || (parseFloat(system.waterLevel) >= 75);
  const canDivert = isCritical && (parseFloat(system.storageLevel) < 95);

  return (
    <div className="dark:bg-[#1E293B] bg-white border dark:border-white/10 border-slate-200 rounded-2xl shadow-2xl p-4 w-72 sm:w-80 text-slate-800 dark:text-slate-100 z-50">
      <div className="flex items-center justify-between pb-3 border-b dark:border-white/10 border-slate-100">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#0EA5E9]" />
          <span className="font-mono font-black text-sm text-[#0EA5E9]">{system.systemId}</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 space-y-2.5 text-xs">
        <div>
          <p className="font-bold text-slate-900 dark:text-white text-sm">{system.location}</p>
          <p className="text-slate-500 dark:text-slate-400 text-[11px]">{system.ward}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-white/[0.03] p-2.5 rounded-xl border dark:border-white/5 border-slate-200/60">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">{t('waterLevel')}</span>
            <p className="font-mono font-black text-sm text-slate-900 dark:text-white">{parseFloat(system.waterLevel).toFixed(1)}%</p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">{t('gis_storage')}</span>
            <p className="font-mono font-black text-sm text-slate-900 dark:text-white">{parseFloat(system.storageLevel).toFixed(1)}%</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">{t('systemHealth')}</span>
          {system.status === 'Normal' && <Badge variant="success" size="sm">🟢 {t('status_normal')}</Badge>}
          {system.status === 'Warning' && <Badge variant="warning" size="sm">🟡 {t('status_warning')}</Badge>}
          {system.status === 'Critical' && <Badge variant="danger" size="sm">🔴 {t('status_critical')}</Badge>}
          {system.status === 'Offline' && <Badge variant="secondary" size="sm">⚪ {t('offline')}</Badge>}
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {t('st_updated')}</span>
          <span className="font-mono">{new Date(system.lastUpdated).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      {/* ── Emergency Flood Diversion Control ── */}
      {isCritical && (
        <div className="mt-3 pt-2.5 border-t border-rose-200/50 dark:border-rose-900/30">
          <Button
            variant="danger"
            size="sm"
            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-black shadow-md shadow-rose-600/30"
            disabled={!canDivert}
            onClick={() => onDivert?.(system)}
          >
            {canDivert ? `⚡ ${t('gis_divertWaterNow')}` : `⚠️ ${t('gis_cisternFull')} (≥95%)`}
          </Button>
          <p className="text-[10px] text-rose-500 font-medium text-center mt-1">
            {canDivert
              ? t('gis_imminentRisk')
              : t('gis_reservoirUnavailable')}
          </p>
        </div>
      )}

      <div className="mt-2.5 pt-2 border-t dark:border-white/10 border-slate-100 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs"
          onClick={() => onViewSystem?.(system)}
        >
          {t('gis_viewInTableShort')}
        </Button>
      </div>
    </div>
  );
}

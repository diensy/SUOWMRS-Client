import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Database, Droplets, Gauge, Activity, RefreshCw, Zap,
  ArrowDown, TrendingUp, AlertTriangle, CheckCircle2
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useSocket } from '../../hooks/useSocket';
import { getStorageCurrent, toggleValve } from '../../services/storageService';
import { confirmValveToggle } from '../../utils/swal';

function CircularGauge({ percentage, size = 160, label, sublabel, color = '#0EA5E9' }) {
  const r = (size / 2) - 12;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percentage / 100) * circ;
  const pct = Math.min(100, Math.max(0, percentage));

  const strokeColor = pct > 80 ? '#EF4444' : pct > 60 ? '#F59E0B' : color;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor"
          strokeWidth="8" className="text-slate-200 dark:text-white/[0.06]" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={strokeColor} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.2s ease, stroke 0.5s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-black text-slate-900 dark:text-white">{pct.toFixed(0)}%</span>
        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</span>
        {sublabel && <span className="text-[10px] text-slate-400 dark:text-slate-500">{sublabel}</span>}
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, unit, color = 'text-sky-500', bg = 'bg-sky-500/10' }) {
  return (
    <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-xl p-4 flex items-center gap-3 shadow-sm">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg} flex-shrink-0`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div>
        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-xl font-black text-slate-900 dark:text-white">
          {value}<span className="text-sm font-medium text-slate-500 dark:text-slate-400 ml-1">{unit}</span>
        </p>
      </div>
    </div>
  );
}

function ValveControl({ valveStatus, onToggle, loading }) {
  const { t } = useLanguage();
  const isOpen = valveStatus === 'OPEN';
  return (
    <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            {t('st_valveControl')}
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{t('st_valveControlDesc')}</p>
        </div>
        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${
          isOpen
            ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30'
            : 'bg-slate-100 dark:bg-white/[0.06] text-slate-500 border-slate-200 dark:border-white/10'
        }`}>
          {isOpen ? t('st_openDraining') : t('st_standbyClosed')}
        </span>
      </div>

      {/* Visual valve */}
      <div className="flex items-center justify-center py-4">
        <div className={`relative w-24 h-24 rounded-full border-4 flex items-center justify-center transition-all duration-700 shadow-xl
          ${isOpen
            ? 'border-sky-500 bg-sky-500/10 shadow-sky-500/30'
            : 'border-slate-300 dark:border-white/10 bg-slate-100 dark:bg-white/[0.04]'
          }`}>
          <div className={`w-10 h-10 rounded-full transition-all duration-500 flex items-center justify-center
            ${isOpen ? 'bg-sky-500 shadow-lg shadow-sky-500/50' : 'bg-slate-300 dark:bg-white/20'}`}>
            <Droplets className={`w-5 h-5 ${isOpen ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
          </div>
          {isOpen && (
            <div className="absolute inset-0 rounded-full border-2 border-sky-400/40 animate-ping" />
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onToggle('OPEN')}
          disabled={isOpen || loading}
          className="flex-1 py-2.5 rounded-xl text-xs font-black bg-sky-600 hover:bg-sky-500 text-white transition-all shadow-md shadow-sky-900/30 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {t('openValve').toUpperCase()}
        </button>
        <button
          onClick={() => onToggle('STANDBY')}
          disabled={!isOpen || loading}
          className="flex-1 py-2.5 rounded-xl text-xs font-black bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-700 dark:text-slate-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {t('closeValve').toUpperCase()}
        </button>
      </div>
    </div>
  );
}

function TankVisual({ fillPct }) {
  const { t } = useLanguage();
  const clamp = Math.min(100, Math.max(0, fillPct));
  const color = clamp > 80 ? '#EF4444' : clamp > 60 ? '#F59E0B' : '#0EA5E9';
  const label = clamp > 80 ? t('status_critical') : clamp > 60 ? t('status_high') : clamp > 30 ? t('status_normal') : t('status_low');

  return (
    <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm flex flex-col items-center gap-4">
      <div className="flex items-center gap-2 self-start w-full">
        <Database className="w-4 h-4 text-sky-500" />
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('st_tankTitle')}</h3>
      </div>
      {/* Tank SVG */}
      <div className="relative w-40 h-52 select-none">
        <svg viewBox="0 0 160 210" className="w-full h-full">
          {/* Tank body */}
          <rect x="20" y="10" width="120" height="180" rx="12" ry="12"
            fill="none" stroke="currentColor" strokeWidth="3"
            className="text-slate-200 dark:text-white/10" />
          {/* Water fill */}
          <clipPath id="tank-clip">
            <rect x="20" y="10" width="120" height="180" rx="12" ry="12" />
          </clipPath>
          <rect
            x="20" y={10 + 180 * (1 - clamp / 100)} width="120"
            height={180 * (clamp / 100)} clipPath="url(#tank-clip)"
            fill={color} fillOpacity="0.2"
            style={{ transition: 'all 1s ease' }}
          />
          {/* Wave effect */}
          <g clipPath="url(#tank-clip)">
            <rect
              x="20" y={10 + 180 * (1 - clamp / 100) - 8} width="120" height="8"
              fill={color} fillOpacity="0.35"
              style={{ transition: 'y 1s ease' }}
            />
          </g>
          {/* Fill line */}
          <line
            x1="20" y1={10 + 180 * (1 - clamp / 100)} x2="140" y2={10 + 180 * (1 - clamp / 100)}
            stroke={color} strokeWidth="2" strokeDasharray="4 4"
            style={{ transition: 'all 1s ease' }}
          />
          {/* Level markers */}
          {[25, 50, 75].map(m => (
            <g key={m}>
              <line x1="20" y1={10 + 180 * (1 - m / 100)} x2="32" y2={10 + 180 * (1 - m / 100)}
                stroke="currentColor" strokeWidth="1" className="text-slate-300 dark:text-white/20" />
              <text x="34" y={10 + 180 * (1 - m / 100) + 4} fontSize="9" className="fill-slate-400 dark:fill-slate-500"
                fontFamily="monospace">{m}%</text>
            </g>
          ))}
          {/* Drain pipe at bottom */}
          <rect x="68" y="190" width="24" height="14" rx="4" fill="currentColor" className="text-slate-300 dark:text-white/10" />
        </svg>
        {/* Status badge */}
        <div className="absolute top-3 right-3">
          <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md" style={{ background: color + '22', color }}>
            {label}
          </span>
        </div>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
        {t('st_tankNote')}
      </p>
    </div>
  );
}

export default function StoragePage() {
  const { t, locale } = useLanguage();
  const { storageData: socketStorage } = useSocket();
  const [storage, setStorage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [valveLoading, setValveLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchStorage = useCallback(async () => {
    try {
      const data = await getStorageCurrent();
      setStorage(data);
      setLastUpdated(new Date());
    } catch (e) {
      console.error('Failed to fetch storage', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStorage();
    const interval = setInterval(fetchStorage, 10000);
    return () => clearInterval(interval);
  }, [fetchStorage]);

  // Live real-time WebSocket updates
  useEffect(() => {
    if (socketStorage) {
      setStorage(socketStorage);
      setLastUpdated(new Date());
    }
  }, [socketStorage]);

  const handleValveToggle = async (action) => {
    // Show confirmation modal before toggling
    const res = await confirmValveToggle(action === 'OPEN' ? 'STANDBY' : 'OPEN');
    if (!res.isConfirmed) return;

    setValveLoading(true);
    try {
      const result = await toggleValve(action);
      if (result && result.storage) {
        setStorage(result.storage);
        setLastUpdated(new Date());
      }
    } catch (e) {
      console.error('Valve toggle failed', e);
    } finally {
      setValveLoading(false);
    }
  };

  const s = storage || {};
  const fillPct = s.fillPercentage ?? 72;
  const capacity = s.totalCapacity ?? 10000;
  const current = s.currentVolume ?? 7200;
  const available = capacity - current;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-white/10 flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white font-display flex items-center gap-2">
            <Database className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            {t('storage')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t('st_subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
              {t('st_updated')} {lastUpdated.toLocaleTimeString(locale)}
            </span>
          )}
          <button
            onClick={fetchStorage}
            className="p-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metrics row */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-slate-100 dark:bg-white/[0.04] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MetricCard icon={Database} label={t('st_totalCapacity')} value={(capacity / 1000).toFixed(1)} unit="kL" color="text-sky-500" bg="bg-sky-500/10" />
          <MetricCard icon={Droplets} label={t('st_currentVolume')} value={(current / 1000).toFixed(1)} unit="kL" color="text-emerald-500" bg="bg-emerald-500/10" />
          <MetricCard icon={ArrowDown} label={t('available')} value={(available / 1000).toFixed(1)} unit="kL" color="text-amber-500" bg="bg-amber-500/10" />
          <MetricCard icon={Activity} label={t('inflowRate')} value={s.inFlowRate ?? 0} unit="L/min" color="text-fuchsia-500" bg="bg-fuchsia-500/10" />
        </div>
      )}

      {/* Main content: Tank + Gauge + Valve */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tank visual */}
        <TankVisual fillPct={fillPct} />

        {/* Circular gauge */}
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm flex flex-col items-center justify-center gap-3">
          <div className="flex items-center gap-2 self-start w-full">
            <Gauge className="w-4 h-4 text-sky-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('st_fillLevel')}</h3>
          </div>
          <CircularGauge
            percentage={fillPct}
            label={t('st_fillLevel')}
            sublabel={`${(current / 1000).toFixed(1)}kL / ${(capacity / 1000).toFixed(0)}kL`}
          />
          <div className="w-full space-y-2 text-xs">
            {[
              { label: t('st_safeZone'), range: '0–60%', color: '#0EA5E9' },
              { label: t('status_warning'), range: '60–80%', color: '#F59E0B' },
              { label: t('status_critical'), range: '80–100%', color: '#EF4444' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                  <span className="text-slate-600 dark:text-slate-400 font-medium">{item.label}</span>
                </div>
                <span className="text-slate-500 dark:text-slate-500 font-mono">{item.range}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Valve control */}
        <ValveControl
          valveStatus={s.valveStatus || 'STANDBY'}
          onToggle={handleValveToggle}
          loading={valveLoading}
        />
      </div>

      {/* Status banner */}
      <div className={`flex items-center gap-3 p-4 rounded-xl border text-sm font-medium
        ${fillPct > 80
          ? 'bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-400'
          : fillPct > 60
          ? 'bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400'
          : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
        }`}>
        {fillPct > 80 ? <AlertTriangle className="w-4 h-4 flex-shrink-0" /> : <CheckCircle2 className="w-4 h-4 flex-shrink-0" />}
        {fillPct > 80
          ? t('st_bannerCritical', { pct: fillPct.toFixed(0) })
          : fillPct > 60
          ? t('st_bannerWarning', { pct: fillPct.toFixed(0) })
          : t('st_bannerNormal', { pct: fillPct.toFixed(0) })
        }
        {s.isManualOverride && (
          <span className="ml-auto text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            {t('st_manualOverride')}
          </span>
        )}
      </div>
    </motion.div>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Recycle, Droplets, FlaskConical, CheckCircle2, Leaf,
  Building2, Wrench, Factory, RefreshCw, TrendingUp, Sparkles
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { getTreatmentCurrent } from '../../services/treatmentService';

const ALLOCATION_CONFIG = {
  gardening:    { icon: Leaf,      color: '#10B981', label: 'Gardening & Parks' },
  cleaning:     { icon: Sparkles,  color: '#0EA5E9', label: 'Street Cleaning' },
  irrigation:   { icon: Droplets,  color: '#6366F1', label: 'Crop Irrigation' },
  construction: { icon: Building2, color: '#F59E0B', label: 'Construction Sites' },
  industrial:   { icon: Factory,   color: '#8B5CF6', label: 'Industrial Use' },
};

function QualityBadge({ status }) {
  const cfg = {
    good:      { label: 'Good',      bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/30' },
    excellent: { label: 'Excellent', bg: 'bg-sky-500/10',     text: 'text-sky-600 dark:text-sky-400',         border: 'border-sky-500/30'     },
    moderate:  { label: 'Moderate',  bg: 'bg-amber-500/10',   text: 'text-amber-600 dark:text-amber-400',     border: 'border-amber-500/30'   },
    poor:      { label: 'Poor',      bg: 'bg-rose-500/10',    text: 'text-rose-600 dark:text-rose-400',       border: 'border-rose-500/30'    },
  };
  const c = cfg[status] || cfg.good;
  return (
    <span className={`text-[11px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${c.bg} ${c.text} ${c.border}`}>
      {c.label}
    </span>
  );
}

function PipelineStep({ step, value, label, active, color }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg border-2 transition-all duration-700 ${
        active
          ? 'border-transparent shadow-md'
          : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03]'
      }`} style={active ? { background: color + '20', borderColor: color + '40', boxShadow: `0 4px 24px ${color}30` } : {}}>
        <span className={`text-xs font-black ${active ? '' : 'text-slate-400 dark:text-slate-500'}`} style={{ color: active ? color : undefined }}>
          {step}
        </span>
      </div>
      <div className="text-center">
        <p className="text-sm font-black text-slate-900 dark:text-white">{(value / 1000).toFixed(1)}kL</p>
        <p className="text-[10px] text-slate-500 dark:text-slate-400">{label}</p>
      </div>
    </div>
  );
}

function AllocationBar({ value, total, cfg }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  const Icon = cfg.icon;
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: cfg.color + '20' }}>
        <Icon className="w-4 h-4" style={{ color: cfg.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{cfg.label}</span>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">{value.toLocaleString()}L</span>
        </div>
        <div className="h-2 rounded-full bg-slate-100 dark:bg-white/[0.06] overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ background: cfg.color }}
          />
        </div>
        <span className="text-[10px] text-slate-400 dark:text-slate-500">{pct.toFixed(1)}% of allocated</span>
      </div>
    </div>
  );
}

export default function WaterReusePage() {
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const d = await getTreatmentCurrent();
      setData(d);
    } catch (e) {
      console.error('Failed to fetch treatment data', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const d = data || {};
  const storedWater     = d.storedWater    ?? 8500;
  const treatedWater    = d.treatedWater   ?? 6200;
  const availableReuse  = d.availableForReuse ?? 5900;
  const efficiency      = d.treatmentEfficiency ?? 73;
  const qualityStatus   = d.qualityStatus  ?? 'good';
  const allocations     = d.allocations    ?? { gardening: 1800, cleaning: 1200, irrigation: 1500, construction: 900, industrial: 500 };
  const totalAllocated  = Object.values(allocations).reduce((s, v) => s + v, 0);

  const pipelineSteps = [
    { step: '01', value: storedWater,    label: 'Collected',  color: '#0EA5E9', active: storedWater > 0 },
    { step: '02', value: treatedWater,   label: 'Treated',    color: '#6366F1', active: treatedWater > 0 },
    { step: '03', value: availableReuse, label: 'Reusable',   color: '#10B981', active: availableReuse > 0 },
    { step: '04', value: totalAllocated, label: 'Distributed',color: '#F59E0B', active: totalAllocated > 0 },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-white/10 flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white font-display flex items-center gap-2">
            <Recycle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            {t('waterReuse')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Water treatment pipeline · quality monitoring · reuse channel allocation
          </p>
        </div>
        <button
          onClick={fetchData}
          className="p-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 rounded-2xl bg-slate-100 dark:bg-white/[0.04] animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Collected',        value: (storedWater / 1000).toFixed(1),   unit: 'kL', icon: Droplets,     color: 'text-sky-500',     bg: 'bg-sky-500/10'     },
              { label: 'Treated',          value: (treatedWater / 1000).toFixed(1),  unit: 'kL', icon: FlaskConical, color: 'text-violet-500',  bg: 'bg-violet-500/10'  },
              { label: 'Available Reuse',  value: (availableReuse / 1000).toFixed(1),unit: 'kL', icon: Recycle,      color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
              { label: 'Efficiency',       value: efficiency,                        unit: '%',  icon: TrendingUp,   color: 'text-amber-500',   bg: 'bg-amber-500/10'   },
            ].map(m => (
              <div key={m.label} className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${m.bg}`}>
                    <m.icon className={`w-3.5 h-3.5 ${m.color}`} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{m.label}</span>
                </div>
                <p className="text-xl font-black text-slate-900 dark:text-white">
                  {m.value}<span className="text-sm font-medium text-slate-500 ml-1">{m.unit}</span>
                </p>
              </div>
            ))}
          </div>

          {/* Treatment Pipeline */}
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-violet-500" />
                Treatment Pipeline
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400">Water Quality:</span>
                <QualityBadge status={qualityStatus} />
              </div>
            </div>

            {/* Pipeline steps */}
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
              {pipelineSteps.map((step, idx) => (
                <React.Fragment key={step.step}>
                  <PipelineStep {...step} />
                  {idx < pipelineSteps.length - 1 && (
                    <div className="flex-1 h-0.5 min-w-8 bg-gradient-to-r from-slate-200 dark:from-white/10 to-slate-300 dark:to-white/10 rounded-full" />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Efficiency bar */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-white/[0.06]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Treatment Efficiency</span>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{efficiency}%</span>
              </div>
              <div className="h-3 rounded-full bg-slate-100 dark:bg-white/[0.06] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${efficiency}%` }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                />
              </div>
            </div>
          </div>

          {/* Reuse Allocation */}
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Approved Reuse Channels
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {(totalAllocated / 1000).toFixed(1)}kL distributed
              </span>
            </div>
            <div className="space-y-4">
              {Object.entries(allocations).map(([key, value]) => {
                const cfg = ALLOCATION_CONFIG[key] || { icon: Droplets, color: '#0EA5E9', label: key };
                return (
                  <AllocationBar key={key} value={value} total={totalAllocated} cfg={cfg} />
                );
              })}
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}

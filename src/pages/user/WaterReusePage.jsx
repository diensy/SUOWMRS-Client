import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Recycle, Droplets, FlaskConical, CheckCircle2, Leaf,
  Building2, Wrench, Factory, RefreshCw, TrendingUp, Sparkles,
  Lock, ShieldCheck, AlertTriangle, Play, Square, Timer, Sprout,
  Activity, ArrowDownRight, Check
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useSocket } from '../../hooks/useSocket';
import {
  getTreatmentCurrent,
  toggleFiltration,
  controlGardeningWatering
} from '../../services/treatmentService';
import {
  playConfirmBeep,
  playCriticalBeep,
  playValveBeep,
  playActionBeep
} from '../../utils/sound';
import { confirmAction, customSwal } from '../../utils/swal';
import Button from '../../components/common/Button';

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
  const { userRole = 'Resident' } = useOutletContext() || {};
  const { socket } = useSocket();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gardeningLoading, setGardeningLoading] = useState(false);
  const [filtrationLoading, setFiltrationLoading] = useState(false);
  const [selectedVolume, setSelectedVolume] = useState(250);

  const isTechnicianOrAdmin = userRole === 'Technician' || userRole === 'Admin';

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

  // Listen for socket events
  useEffect(() => {
    if (!socket) return;
    const handleUpdate = (updated) => {
      setData((prev) => ({ ...prev, ...updated }));
    };
    socket.on('treatment:update', handleUpdate);
    return () => socket.off('treatment:update', handleUpdate);
  }, [socket]);

  const d = data || {};
  const storedWater        = d.storedWater        ?? 8500;
  const treatedWater       = d.treatedWater       ?? 6200;
  const availableReuse     = d.availableForReuse  ?? 5900;
  const efficiency         = d.treatmentEfficiency ?? 73;
  const qualityStatus      = d.qualityStatus      ?? 'good';
  const filtrationStatus   = d.filtrationStatus   ?? 'ACTIVE';
  const gardeningSession   = d.gardeningSession   ?? { active: false, flowRate: 0, volumeDispensed: 1800, soilMoisture: 52 };
  const allocations        = d.allocations        ?? { gardening: 1800, cleaning: 1200, irrigation: 1500, construction: 900, industrial: 500 };
  const totalAllocated     = Object.values(allocations).reduce((s, v) => s + v, 0);

  const isFiltrationActive = filtrationStatus === 'ACTIVE';

  // ── Manual Filtration Toggle (Role Protected) ──
  const handleToggleFiltration = async () => {
    if (!isTechnicianOrAdmin) {
      playCriticalBeep();
      return customSwal.fire({
        icon: 'error',
        title: 'Access Restricted',
        text: 'Residents are strictly prohibited from switching off water filtration. Technician or Admin credentials required.',
      });
    }

    const nextStatus = isFiltrationActive ? 'MAINTENANCE_PAUSED' : 'ACTIVE';
    const isPausing = nextStatus === 'MAINTENANCE_PAUSED';

    const confirmRes = await confirmAction({
      title: isPausing ? 'Pause Water Filtration for Maintenance?' : 'Resume Water Filtration?',
      text: isPausing
        ? 'Purification pumps and UV sterilization will be suspended during this maintenance cycle.'
        : 'All 4 stages of purification will reactivate and resume normal municipal recycling.',
      confirmText: isPausing ? 'Enter Maintenance Mode' : 'Resume Filtration',
      isDanger: isPausing,
    });

    if (!confirmRes.isConfirmed) return;

    setFiltrationLoading(true);
    try {
      const res = await toggleFiltration(nextStatus, userRole);
      if (res && res.treatment) {
        setData(res.treatment);
      }
      customSwal.fire({
        icon: 'success',
        title: isPausing ? 'MAINTENANCE MODE Activated' : 'FILTRATION ACTIVE',
        text: res?.message || 'Filtration status updated.',
        timer: 3000,
      });
    } catch (err) {
      console.error('Failed to toggle filtration:', err);
      customSwal.fire({
        icon: 'error',
        title: 'Filtration Control Failed',
        text: err.response?.data?.error || 'Failed to update filtration state.',
      });
    } finally {
      setFiltrationLoading(false);
    }
  };

  // ── Manual Gardening Watering Control ──
  const handleGardeningToggle = async () => {
    const isStopping = gardeningSession.active;

    if (!isStopping) {
      // Starting watering
      playConfirmBeep();
      setGardeningLoading(true);
      try {
        const res = await controlGardeningWatering('START', selectedVolume);
        if (res && res.treatment) {
          setData(res.treatment);
        }
        customSwal.fire({
          icon: 'success',
          title: 'Garden Watering Started',
          text: `Dispensing ${selectedVolume}L of treated water at 45 L/min for urban greenery & park beds.`,
          timer: 3000,
        });
      } catch (err) {
        console.error('Failed to start gardening watering:', err);
      } finally {
        setGardeningLoading(false);
      }
    } else {
      // Stopping watering
      playValveBeep('close');
      setGardeningLoading(true);
      try {
        const res = await controlGardeningWatering('STOP');
        if (res && res.treatment) {
          setData(res.treatment);
        }
        customSwal.fire({
          icon: 'info',
          title: 'Garden Watering Stopped',
          text: 'Irrigation valve closed. Water allocation updated.',
          timer: 2500,
        });
      } catch (err) {
        console.error('Failed to stop gardening watering:', err);
      } finally {
        setGardeningLoading(false);
      }
    }
  };

  const pipelineSteps = [
    { step: '01', value: storedWater,    label: 'Collected',  color: '#0EA5E9', active: storedWater > 0 },
    { step: '02', value: treatedWater,   label: 'Treated',    color: '#6366F1', active: treatedWater > 0 && isFiltrationActive },
    { step: '03', value: availableReuse, label: 'Reusable',   color: '#10B981', active: availableReuse > 0 },
    { step: '04', value: totalAllocated, label: 'Distributed',color: '#F59E0B', active: totalAllocated > 0 },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      
      {/* ── Page Header ── */}
      <div className="pb-4 border-b border-slate-200 dark:border-white/10 flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white font-display flex items-center gap-2">
            <Recycle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            {t('waterReuse')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Purification pipeline · Quality monitoring · Gardening & greywater reuse management
          </p>
        </div>
        <button
          onClick={fetchData}
          className="p-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* ── Prominent Water Filtration Status Banner ── */}
      <div className={`p-4 sm:p-5 rounded-2xl border transition-all duration-300 shadow-md ${
        isFiltrationActive
          ? 'bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/5 border-emerald-500/30'
          : 'bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/5 border-amber-500/30'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md ${
              isFiltrationActive
                ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                : 'bg-amber-500 text-white shadow-amber-500/30'
            }`}>
              {isFiltrationActive ? (
                <ShieldCheck className="w-6 h-6 animate-pulse" />
              ) : (
                <Wrench className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-sm sm:text-base font-black tracking-tight font-display ${
                  isFiltrationActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                }`}>
                  {isFiltrationActive ? 'FILTRATION ACTIVE — System Healthy' : 'MAINTENANCE MODE — Filtration Paused'}
                </span>
                <span className={`w-2 h-2 rounded-full ${isFiltrationActive ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`} />
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                {isFiltrationActive
                  ? 'Continuous 4-stage treatment online: Rapid Sand Filter ➔ Carbon Bed ➔ UV Sterilisation ➔ Chlorination.'
                  : 'Filtration pumps suspended for membrane backwash & maintenance. Storage remains secure.'}
              </p>
            </div>
          </div>

          {/* Role-Restricted Action */}
          <div className="flex items-center gap-2.5 self-start md:self-center">
            {!isTechnicianOrAdmin ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 text-xs font-semibold">
                <Lock className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                <span>Resident Mode (Filtration Protected)</span>
              </div>
            ) : (
              <Button
                variant={isFiltrationActive ? 'warning' : 'success'}
                size="sm"
                isLoading={filtrationLoading}
                onClick={handleToggleFiltration}
                className={isFiltrationActive ? 'bg-amber-600 hover:bg-amber-700 text-white font-bold' : 'bg-emerald-600 hover:bg-emerald-700 text-white font-bold'}
                icon={isFiltrationActive ? <Wrench className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              >
                {isFiltrationActive ? 'Pause for Maintenance' : 'Resume Filtration'}
              </Button>
            )}
          </div>
        </div>
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
              { label: 'Efficiency',       value: isFiltrationActive ? efficiency : 0, unit: '%',  icon: TrendingUp,   color: 'text-amber-500',   bg: 'bg-amber-500/10'   },
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

          {/* ── WATER REUSE: GARDENING INTERACTIVE DISPENSER ── */}
          <div className="bg-gradient-to-br from-white via-emerald-50/20 to-white dark:from-slate-900/80 dark:via-emerald-950/10 dark:to-slate-900/80 border border-emerald-500/20 dark:border-emerald-500/20 rounded-2xl p-5 sm:p-6 shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-emerald-500/15">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
                  <Leaf className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Water Reuse — Gardening & Urban Parks
                    </h3>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      Channel 1 (35% Alloc.)
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Dispense purified recycled floodwater for community gardens, roadside plantations, and botanical parks.
                  </p>
                </div>
              </div>

              {/* Live Status Tag */}
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${
                  gardeningSession.active
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30 shadow-sm'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-500 border-slate-200 dark:border-white/10'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${gardeningSession.active ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`} />
                  {gardeningSession.active ? 'WATERING IN PROGRESS' : 'STANDBY · READY'}
                </span>
              </div>
            </div>

            {/* Grid: Metrics & Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
              {/* Metric 1: Soil Moisture */}
              <div className="bg-white/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-white/5 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ward Soil Moisture</span>
                  <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                    {gardeningSession.soilMoisture}%
                  </div>
                  <p className="text-[10px] text-emerald-500 font-semibold mt-1 flex items-center gap-1">
                    <Check className="w-3 h-3" /> {gardeningSession.soilMoisture > 60 ? 'Thoroughly Hydrated' : 'Optimal Root Zone'}
                  </p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <Sprout className="w-5 h-5" />
                </div>
              </div>

              {/* Metric 2: Today's Dispensed Volume */}
              <div className="bg-white/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-white/5 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Dispensed Today</span>
                  <div className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-1">
                    {gardeningSession.volumeDispensed.toLocaleString()} <span className="text-xs font-normal text-slate-400">Liters</span>
                  </div>
                  <p className="text-[10px] text-sky-500 font-semibold mt-1">
                    Saved approx. ₹1,260 commercial water fees
                  </p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center">
                  <Droplets className="w-5 h-5" />
                </div>
              </div>

              {/* Metric 3: Flow & Pump */}
              <div className="bg-white/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-white/5 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Dispense Flow Rate</span>
                  <div className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-1">
                    {gardeningSession.flowRate} <span className="text-xs font-normal text-slate-400">L/min</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-semibold mt-1">
                    Line 2 · 1.5 Bar Drip Irrigation
                  </p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Interactive Dispensing Control Panel */}
            <div className="mt-5 p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Timer className="w-3.5 h-3.5 text-emerald-500" />
                  Select Watering Target Volume:
                </span>
                <div className="flex items-center gap-2 pt-1">
                  {[100, 250, 500].map((vol) => (
                    <button
                      key={vol}
                      disabled={gardeningSession.active}
                      onClick={() => { playActionBeep(); setSelectedVolume(vol); }}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                        selectedVolume === vol
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-white dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 border border-slate-200 dark:border-white/10'
                      } disabled:opacity-50`}
                    >
                      {vol} L
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant={gardeningSession.active ? 'danger' : 'primary'}
                  size="md"
                  isLoading={gardeningLoading}
                  onClick={handleGardeningToggle}
                  className={gardeningSession.active ? 'bg-rose-600 hover:bg-rose-700 text-white font-black' : 'bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-md shadow-emerald-600/30'}
                  icon={gardeningSession.active ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                >
                  {gardeningSession.active ? 'Stop Garden Watering' : `Start Garden Watering (${selectedVolume}L)`}
                </Button>
              </div>
            </div>
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
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Purification Efficiency</span>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                  {isFiltrationActive ? `${efficiency}%` : 'PAUSED (0%)'}
                </span>
              </div>
              <div className="h-3 rounded-full bg-slate-100 dark:bg-white/[0.06] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${isFiltrationActive ? efficiency : 0}%` }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  className={`h-full rounded-full ${
                    isFiltrationActive
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      : 'bg-slate-300 dark:bg-white/20'
                  }`}
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

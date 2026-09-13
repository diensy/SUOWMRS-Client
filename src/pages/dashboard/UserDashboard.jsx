import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useOutletContext } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import {
  Droplets, Database, Radio, AlertOctagon, MessageSquareWarning,
  History, Flower2, Car, Wheat, Building, Factory,
  TrendingUp, Wifi, WifiOff, CheckCircle2, AlertTriangle,
  Settings2, ArrowRightLeft, Gauge, FlaskConical, Recycle,
} from 'lucide-react';

import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import StatusIndicator from '../../components/common/StatusIndicator';
import Modal from '../../components/common/Modal';
import { useSnackbar } from '../../context/SnackbarContext';
import { confirmSosDispatch, confirmValveToggle, customSwal } from '../../utils/swal';
import { useSocket } from '../../hooks/useSocket';
import { getLatestWaterLevel, getWaterLevelHistory, getWaterLevelStats } from '../../services/waterLevelService';
import { getAlerts } from '../../services/alertService';
import { getStorageCurrent, toggleValve } from '../../services/storageService';
import { getTreatmentCurrent } from '../../services/treatmentService';

// ───────── Threshold Helper ─────────
const getThreshold = (level) => {
  if (level < 50) return {
    status: 'normal',
    label: 'NORMAL',
    statusKey: 'status_normal',
    barColor: '#22C55E',
    gradFrom: '#86efac',
    gradTo: '#16a34a',
    textColor: 'text-emerald-700 dark:text-emerald-400',
    bg: 'bg-emerald-50/90 dark:bg-emerald-500/10',
    border: 'border-emerald-200 dark:border-emerald-500/25',
  };
  if (level < 75) return {
    status: 'warning',
    label: 'WARNING',
    statusKey: 'status_warning',
    barColor: '#F59E0B',
    gradFrom: '#fde68a',
    gradTo: '#d97706',
    textColor: 'text-amber-800 dark:text-amber-400',
    bg: 'bg-amber-50/90 dark:bg-amber-500/10',
    border: 'border-amber-200 dark:border-amber-500/25',
  };
  if (level < 90) return {
    status: 'danger',
    label: 'HIGH RISK',
    statusKey: 'status_danger',
    barColor: '#F97316',
    gradFrom: '#fed7aa',
    gradTo: '#ea580c',
    textColor: 'text-orange-800 dark:text-orange-400',
    bg: 'bg-orange-50/90 dark:bg-orange-500/10',
    border: 'border-orange-200 dark:border-orange-500/25',
  };
  return {
    status: 'critical',
    label: 'CRITICAL FLOOD',
    statusKey: 'status_critical',
    barColor: '#EF4444',
    gradFrom: '#fecaca',
    gradTo: '#dc2626',
    textColor: 'text-rose-700 dark:text-rose-400',
    bg: 'bg-rose-50/90 dark:bg-rose-500/10',
    border: 'border-rose-200 dark:border-rose-500/25',
  };
};

// ───────── Custom Recharts Tooltip ─────────
const CustomTooltip = ({ active, payload, label, t }) => {
  if (active && payload?.length) {
    const thresh = getThreshold(payload[0].value);
    return (
      <div className="dark:bg-[#0F172A] bg-white border dark:border-white/20 border-slate-200 rounded-xl shadow-2xl px-3 py-2 text-slate-800 dark:text-white">
        <p className="text-[11px] font-bold text-slate-400">{label}</p>
        <p className={`text-sm font-extrabold ${thresh.textColor}`}>{payload[0].value.toFixed(1)}%</p>
        <p className="text-[10px] uppercase font-semibold text-slate-400">{t ? t(thresh.statusKey) : thresh.label}</p>
      </div>
    );
  }
  return null;
};

export default function UserDashboard() {
  const { userRole } = useOutletContext() || { userRole: 'Resident' };
  const { showSnackbar } = useSnackbar();
  const { isConnected, waterLevel: socketLevel, storageData: socketStorage, setAlertCallback } = useSocket();

  // ── State ──
  const [level, setLevel] = useState(42);
  const [prevLevel, setPrevLevel] = useState(42);
  const [depthMeters, setDepthMeters] = useState(1.68);
  const [lastPing, setLastPing] = useState('—');
  const [storage, setStorage] = useState({ fillPercentage: 72, currentVolume: 7200, totalCapacity: 10000, valveStatus: 'STANDBY', inFlowRate: 0 });
  const [treatment, setTreatment] = useState(null);
  const [alertFeed, setAlertFeed] = useState([]);
  const [stats, setStats] = useState({ min: 0, max: 0, avg: 0 });
  const [chartData, setChartData] = useState([]);
  const [isComplaintOpen, setIsComplaintOpen] = useState(false);
  const [valveLoading, setValveLoading] = useState(false);
  const prevStatusRef = useRef('normal');

  const { t, formatAlert } = useLanguage();
  const { isDark } = useTheme();
  const getNumericLevel = (val) => {
    if (typeof val === 'number' && !isNaN(val)) return val;
    if (typeof val === 'object' && val !== null) {
      return parseFloat(val.level ?? val.waterLevel ?? val.value ?? 42) || 42;
    }
    const parsed = parseFloat(val);
    return isNaN(parsed) ? 42 : parsed;
  };

  const safeLevel = getNumericLevel(level);
  const threshold = getThreshold(safeLevel);

  // ── Fetch initial data from backend APIs ──
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [latest, history, statsData, storageData, treatData, alertData] = await Promise.allSettled([
          getLatestWaterLevel(),
          getWaterLevelHistory(6),
          getWaterLevelStats(),
          getStorageCurrent(),
          getTreatmentCurrent(),
          getAlerts(1, 5),
        ]);

        if (latest.status === 'fulfilled') {
          const lVal = getNumericLevel(latest.value);
          setLevel(lVal);
          setDepthMeters(latest.value.depthMeters ?? (lVal * 0.04));
          setLastPing(new Date(latest.value.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
          prevStatusRef.current = latest.value.status ?? 'normal';
        }
        if (history.status === 'fulfilled' && history.value.length > 0) {
          setChartData(history.value.map(r => ({
            time: new Date(r.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            level: getNumericLevel(r.level ?? r.waterLevel ?? r),
          })));
        }
        if (statsData.status === 'fulfilled') setStats(statsData.value);
        if (storageData.status === 'fulfilled') setStorage(storageData.value);
        if (treatData.status === 'fulfilled') setTreatment(treatData.value);
        if (alertData.status === 'fulfilled') setAlertFeed(alertData.value.alerts ?? []);
      } catch (_) { /* Graceful fallback — socket data will populate the UI */ }
    };
    fetchAll();
  }, []);

  // ── Update from live Socket.io telemetry ──
  useEffect(() => {
    if (!socketLevel) return;
    const newL = getNumericLevel(socketLevel);
    setPrevLevel(safeLevel);
    setLevel(newL);
    setDepthMeters(socketLevel.depthMeters ?? (newL * 0.04));
    setLastPing(new Date(socketLevel.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    setChartData(prev => {
      const next = [...prev, { time: new Date(socketLevel.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), level: newL }];
      return next.slice(-20); // Keep last 20 points
    });
  }, [socketLevel]);

  useEffect(() => {
    if (socketStorage) setStorage(socketStorage);
  }, [socketStorage]);

  // ── Alert callback: Snackbar from socket event ──
  const handleIncomingAlert = useCallback(async (alert) => {
    setAlertFeed(prev => [alert, ...prev.slice(0, 4)]);

    if (alert.type === 'critical') {
      showSnackbar(`🚨 CRITICAL FLOOD ALERT: Water level at ${alert.level?.toFixed(1)}%! Emergency protocol active.`, 'error', 6000);
    } else if (alert.type === 'danger') {
      showSnackbar(`High Risk: Water at ${alert.level?.toFixed(1)}% — Valve auto-opened!`, 'warning', 4000);
    } else if (alert.type === 'warning') {
      showSnackbar(`Caution: Rising water level at ${alert.level?.toFixed(1)}%`, 'warning', 3000);
    } else {
      showSnackbar(`Water level stable at ${alert.level?.toFixed(1)}% (Normal)`, 'success', 2500);
    }
  }, [showSnackbar]);

  useEffect(() => {
    setAlertCallback(handleIncomingAlert);
  }, [setAlertCallback, handleIncomingAlert]);

  // ── Connection status Snackbar ──
  const prevConnectedRef = useRef(null);
  useEffect(() => {
    if (prevConnectedRef.current === null) { prevConnectedRef.current = isConnected; return; }
    if (isConnected && !prevConnectedRef.current) showSnackbar('Live telemetry stream connected!', 'success', 2500);
    if (!isConnected && prevConnectedRef.current) showSnackbar('Telemetry stream disconnected. Reconnecting...', 'error', 3000);
    prevConnectedRef.current = isConnected;
  }, [isConnected]);

  // ── SOS Handler ──
  const handleSos = async () => {
    const result = await confirmSosDispatch({ location: 'Zone 4 — Ward 12 Riverbed', waterLevel: level, status: threshold.label });
    if (result.isConfirmed) {
      await customSwal.fire({ icon: 'success', iconColor: '#22C55E', title: 'SOS Dispatched!', text: 'Municipal emergency team alerted. Stay safe and evacuate if needed.', confirmButtonText: 'Acknowledged', confirmButtonClass: 'bg-brand-deep text-white px-5 py-2.5 rounded-xl text-sm font-bold' });
      showSnackbar('Emergency SOS transmitted to Municipality Control!', 'error', 5000);
    }
  };

  // ── Valve Override Handler ──
  const handleValveToggle = async () => {
    const result = await confirmValveToggle(storage.valveStatus);
    if (!result.isConfirmed) return;
    setValveLoading(true);
    try {
      const action = storage.valveStatus === 'OPEN' ? 'STANDBY' : 'OPEN';
      const res = await toggleValve(action);
      setStorage(prev => ({ ...prev, valveStatus: res.storage.valveStatus, inFlowRate: res.storage.inFlowRate }));
      showSnackbar(`Solenoid valve set to ${action} (Manual Override)`, action === 'OPEN' ? 'success' : 'info', 3000);
    } catch {
      showSnackbar('Failed to update valve status. Check API connection.', 'error');
    } finally { setValveLoading(false); }
  };

  // ── Complaint Submit ──
  const handleComplaintSubmit = (e) => {
    e.preventDefault();
    setIsComplaintOpen(false);
    showSnackbar('Report #SR-8921 submitted to Ward Engineers!', 'success');
  };

  // ── Reuse allocations ──
  const reuseChannels = treatment ? [
    { label: t('gardening'), icon: Flower2, amount: treatment.allocations?.gardening ?? 0, color: 'from-emerald-400 to-green-500' },
    { label: t('cleaning'), icon: Car, amount: treatment.allocations?.cleaning ?? 0, color: 'from-sky-400 to-blue-500' },
    { label: t('irrigation'), icon: Wheat, amount: treatment.allocations?.irrigation ?? 0, color: 'from-amber-400 to-yellow-500' },
    { label: t('construction'), icon: Building, amount: treatment.allocations?.construction ?? 0, color: 'from-orange-400 to-red-400' },
    { label: t('industrial'), icon: Factory, amount: treatment.allocations?.industrial ?? 0, color: 'from-violet-400 to-indigo-500' },
  ] : [];

  // ── Framer motion variants ──
  const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.35, ease: 'easeOut' } }),
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-6 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* ─────────── HEADER ─────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b dark:border-white/[0.08] border-slate-200">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-display tracking-tight">
              {t('waterMonitoringTitle')}
            </h1>
            <div className="flex items-center gap-1.5 text-xs dark:bg-white/10 bg-slate-100 dark:border-white/10 border-slate-200 border px-2.5 py-1 rounded-full">
              {isConnected
                ? <><Wifi className="w-3 h-3 text-emerald-500 dark:text-emerald-400" /><span className="text-emerald-600 dark:text-emerald-400 font-semibold">{t('live')}</span></>
                : <><WifiOff className="w-3 h-3 text-red-500 dark:text-red-400" /><span className="text-red-500 dark:text-red-400 font-semibold">{t('offline')}</span></>
              }
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
            <span className="font-mono font-semibold text-sky-600 dark:text-sky-400">Zone 4 — Ward 12 Riverbed</span>
            <span className="text-slate-300 dark:text-slate-500">•</span>
            <span>Node <span className="font-mono text-sky-600 dark:text-sky-400 font-bold">SYS-042</span></span>
            <span className="text-slate-300 dark:text-slate-500">•</span>
            <span>Last ping: <strong>{lastPing}</strong></span>
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <Button variant="outline" size="sm" icon={AlertOctagon} onClick={handleSos} className="border-rose-300 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 hover:border-rose-400 dark:hover:border-rose-500/50">
            {t('emergencySos')}
          </Button>
          <Button variant="primary" size="sm" icon={MessageSquareWarning} onClick={() => setIsComplaintOpen(true)}>
            {t('reportIssue')}
          </Button>
        </div>
      </div>

      {/* ─────────── CRITICAL FLOOD BANNER ─────────── */}
      <AnimatePresence>
        {level >= 75 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`rounded-2xl border-l-4 p-4 flex items-center justify-between gap-3 shadow-sm ${
              level >= 90
                ? 'bg-rose-50 dark:bg-rose-500/15 border-rose-500 dark:border-rose-500/40'
                : 'bg-amber-50 dark:bg-amber-500/15 border-amber-500 dark:border-amber-500/40'
            }`}
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className={`w-5 h-5 flex-shrink-0 animate-bounce ${level >= 90 ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}`} />
              <div>
                <p className={`text-sm font-extrabold ${level >= 90 ? 'text-rose-900 dark:text-rose-100' : 'text-amber-900 dark:text-amber-100'}`}>
                  {level >= 90 ? '🚨 Critical Flood Threshold Exceeded!' : '⚠️ Elevated Water Level Detected'}
                </p>
                <p className={`text-xs mt-0.5 ${level >= 90 ? 'text-rose-700 dark:text-rose-300' : 'text-amber-800 dark:text-amber-300'}`}>
                  Drainage level at <strong>{level.toFixed(1)}%</strong>. Underground diverter valve is{' '}
                  <strong className="underline decoration-current">{storage.valveStatus}</strong>. Excess inflow: {storage.inFlowRate > 0 ? `+${storage.inFlowRate} L/min` : 'Standby'}.
                </p>
              </div>
            </div>
            <Badge variant={threshold.status} size="sm" dot>{t(threshold.statusKey)}</Badge>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─────────── PRIMARY METRICS GRID ─────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Card 1: Water Level Gauge */}
        <motion.div
          custom={0} initial="hidden" animate="visible" variants={cardVariants}
          className="dark:bg-white/5 bg-white backdrop-blur dark:border-white/10 border-slate-200/90 border rounded-2xl p-5 hover:border-slate-300 dark:hover:border-white/20 hover:shadow-md dark:hover:bg-white/[0.08] shadow-sm dark:shadow-none transition-all duration-200 flex flex-col gap-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-500 dark:text-sky-400 flex items-center justify-center">
                <Gauge className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('waterLevel')}</span>
            </div>
            <StatusIndicator status={threshold.status} size="sm" />
          </div>

          {/* Circular gauge */}
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 flex-shrink-0">
              <CircularProgressbar
                value={safeLevel}
                text={`${safeLevel.toFixed(0)}%`}
                styles={buildStyles({
                  pathColor: threshold.barColor,
                  textColor: threshold.barColor,
                  trailColor: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0',
                  textSize: '20px',
                  pathTransitionDuration: 0.6,
                })}
              />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
                <span className="text-slate-400">Depth</span>
                <span className="font-bold font-mono text-slate-900 dark:text-white">{depthMeters}m / 4.0m</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
                <span className="text-slate-400">Status</span>
                <Badge variant={threshold.status} size="sm">{t(threshold.statusKey)}</Badge>
              </div>
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
                <span className="text-slate-400">Today Peak</span>
                <span className="font-bold font-mono text-orange-500 dark:text-orange-400">{stats.max}%</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
                <span className="text-slate-400">Today Avg</span>
                <span className="font-bold font-mono text-sky-600 dark:text-sky-400">{stats.avg}%</span>
              </div>
            </div>
          </div>

          {/* Threshold bar */}
          <div>
            <div className="flex justify-between text-[10px] text-slate-400 font-bold mb-1">
              <span>0% {t('status_normal')}</span><span>50% {t('status_warning')}</span><span>75% {t('status_danger')}</span><span>90%+</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 via-orange-400 to-rose-500 relative">
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 shadow-md"
                style={{ borderColor: threshold.barColor }}
                animate={{ left: `${Math.min(level, 99)}%` }}
                transition={{ type: 'spring', stiffness: 100, damping: 20 }}
              />
            </div>
          </div>
        </motion.div>

        {/* Card 2: Underground Storage */}
        <motion.div
          custom={1} initial="hidden" animate="visible" variants={cardVariants}
          className="dark:bg-white/5 bg-white backdrop-blur dark:border-white/10 border-slate-200/90 border rounded-2xl p-5 hover:border-slate-300 dark:hover:border-white/20 hover:shadow-md dark:hover:bg-white/[0.08] shadow-sm dark:shadow-none transition-all duration-200 flex flex-col gap-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <Database className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('undergroundStorage')}</span>
            </div>
            <Badge variant="info" size="sm" dot>{t('activeTank')}</Badge>
          </div>

          {/* Tank visualization */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-24 flex-shrink-0 relative rounded-xl dark:border-white/10 border-slate-200 border overflow-hidden dark:bg-white/5 bg-slate-50">
              <motion.div
                className="absolute bottom-0 left-0 right-0 rounded-b-lg bg-gradient-to-t from-teal-600 to-sky-500 opacity-80"
                animate={{ height: `${storage.fillPercentage}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <span className="text-xs font-black text-white drop-shadow">{storage.fillPercentage}%</span>
              </div>
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
                <span className="text-slate-400">{t('current')}</span>
                <span className="font-bold font-mono text-slate-900 dark:text-white">
                  <CountUp end={storage.currentVolume} duration={1} separator="," suffix=" L" />
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
                <span className="text-slate-400">{t('capacity')}</span>
                <span className="font-bold font-mono text-slate-900 dark:text-white">{storage.totalCapacity?.toLocaleString()} L</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
                <span className="text-slate-400">{t('available')}</span>
                <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  {((storage.totalCapacity - storage.currentVolume) || 0).toLocaleString()} L
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
                <span className="text-slate-400">{t('inflowRate')}</span>
                <span className={`font-bold font-mono ${storage.inFlowRate > 0 ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400 dark:text-slate-500'}`}>
                  {storage.inFlowRate > 0 ? `+${storage.inFlowRate} L/min` : t('valve_standby')}
                </span>
              </div>
            </div>
          </div>

          {/* Storage fill bar */}
          <div>
            <div className="flex justify-between text-[10px] text-slate-400 font-semibold mb-1">
              <span>{t('empty')}</span><span>50%</span><span>{t('full')}</span>
            </div>
            <div className="h-2.5 rounded-full dark:bg-white/10 bg-slate-200 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-sky-400 to-teal-500"
                animate={{ width: `${storage.fillPercentage}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
            {storage.fillPercentage >= 90 && (
              <p className="text-[10px] text-rose-500 dark:text-rose-400 font-semibold mt-1">⚠ Storage nearly full!</p>
            )}
          </div>
        </motion.div>

        {/* Card 3: Solenoid Valve */}
        <motion.div
          custom={2} initial="hidden" animate="visible" variants={cardVariants}
          className="dark:bg-white/5 bg-white backdrop-blur dark:border-white/10 border-slate-200/90 border rounded-2xl p-5 hover:border-slate-300 dark:hover:border-white/20 hover:shadow-md dark:hover:bg-white/[0.08] shadow-sm dark:shadow-none transition-all duration-200 flex flex-col gap-4 sm:col-span-2 lg:col-span-1"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                <Settings2 className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('solenoidValve')}</span>
            </div>
            <Badge variant={storage.valveStatus === 'OPEN' ? 'normal' : 'neutral'} size="sm" dot>
              {storage.valveStatus === 'OPEN' ? t('valve_diverting') : t('valve_standby')}
            </Badge>
          </div>

          {/* Animated valve LED */}
          <div className="flex items-center gap-6">
            <div className="relative flex-shrink-0">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${storage.valveStatus === 'OPEN' ? 'bg-emerald-500/20 border border-emerald-500/30' : (isDark ? 'bg-white/5 border border-white/10' : 'bg-slate-100 border border-slate-200')}`}>
                <ArrowRightLeft className={`w-7 h-7 transition-all duration-300 ${storage.valveStatus === 'OPEN' ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`} />
              </div>
              {storage.valveStatus === 'OPEN' && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-emerald-900 animate-ping" />
              )}
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
                <span className="text-slate-400">State</span>
                <span className={`font-black text-sm ${storage.valveStatus === 'OPEN' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-400'}`}>
                  {storage.valveStatus}
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
                <span className="text-slate-400">Trigger Level</span>
                <span className="font-bold font-mono text-amber-500 dark:text-amber-400">≥ 75%</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
                <span className="text-slate-400">Mode</span>
                <span className="font-semibold text-sky-600 dark:text-sky-400">{t('valve_auto')}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
                <span className="text-slate-400">Relay</span>
                <span className="font-mono text-slate-500 dark:text-slate-400">ESP32 #R01</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Auto-actuates at 75% threshold to divert drainage inflow to the underground reservoir.
          </p>

          <Button
            variant={storage.valveStatus === 'OPEN' ? 'outline' : 'success'}
            size="sm"
            onClick={handleValveToggle}
            isLoading={valveLoading}
            icon={Settings2}
            className="w-full"
          >
            Manual Override: {storage.valveStatus === 'OPEN' ? t('closeValve') : t('openValve')}
          </Button>
        </motion.div>
      </div>

      {/* ─────────── ANALYTICS ROW ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Area Chart — Drainage Trend */}
        <motion.div
          custom={3} initial="hidden" animate="visible" variants={cardVariants}
          className="lg:col-span-2 dark:bg-white/5 bg-white backdrop-blur dark:border-white/10 border-slate-200/90 border rounded-2xl p-5 hover:border-slate-300 dark:hover:border-white/20 hover:shadow-md dark:hover:bg-white/[0.08] shadow-sm dark:shadow-none transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">{t('liveDrainageTrend')}</h2>
              <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                {t('live')}
              </span>
            </div>
            <span className="text-xs text-slate-400">Last {chartData.length} readings</span>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="levelGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={threshold.barColor} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={threshold.barColor} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#E2E8F0'} />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: isDark ? '#94a3b8' : '#64748b' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: isDark ? '#94a3b8' : '#64748b' }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip t={t} />} />
                <Area type="monotone" dataKey="level" stroke={threshold.barColor} strokeWidth={2.5} fill="url(#levelGrad)" dot={false} activeDot={{ r: 4, fill: threshold.barColor }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-44 flex items-center justify-center text-xs text-slate-400">
              <span>Awaiting telemetry data from socket stream...</span>
            </div>
          )}

          {/* Daily stats footer */}
          <div className="mt-3 pt-3 border-t dark:border-white/10 border-slate-200 grid grid-cols-3 gap-3 text-center">
            {[
              { label: t('minToday'), value: `${stats.min}%`, color: 'text-emerald-500 dark:text-emerald-400' },
              { label: t('avgToday'), value: `${stats.avg}%`, color: 'text-sky-600 dark:text-sky-400' },
              { label: t('peakToday'), value: `${stats.max}%`, color: 'text-orange-500 dark:text-orange-400' },
            ].map(s => (
              <div key={s.label}>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">{s.label}</p>
                <p className={`text-base font-black ${s.color} font-display`}>{s.value}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Alert Event Feed */}
        <motion.div
          custom={4} initial="hidden" animate="visible" variants={cardVariants}
          className="dark:bg-white/5 bg-white backdrop-blur dark:border-white/10 border-slate-200/90 border rounded-2xl p-5 hover:border-slate-300 dark:hover:border-white/20 hover:shadow-md dark:hover:bg-white/[0.08] shadow-sm dark:shadow-none transition-all flex flex-col"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">{t('alertFeed')}</h2>
            </div>
            {alertFeed.some(a => !a.isRead) && (
              <span className="text-[10px] font-bold bg-rose-500/20 text-rose-600 dark:text-rose-300 px-2 py-0.5 rounded-full border border-rose-500/30 animate-pulse">
                {alertFeed.filter(a => !a.isRead).length} {t('unread')}
              </span>
            )}
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar max-h-48">
            <AnimatePresence mode="popLayout">
              {alertFeed.length > 0 ? alertFeed.slice(0, 6).map((evt, i) => {
                const tThresh = getThreshold(evt.level || 42);
                return (
                  <motion.div
                    key={evt._id || evt.createdAt || i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className={`p-2.5 rounded-xl border text-xs ${tThresh.bg} ${tThresh.border} hover:shadow-sm transition-all`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-medium">
                        {new Date(evt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <Badge variant={evt.type} size="sm">{t(tThresh.statusKey)}</Badge>
                    </div>
                    <p className={`font-semibold ${tThresh.textColor} leading-snug`}>{formatAlert(evt)}</p>
                  </motion.div>
                );
              }) : (
                <div className="flex flex-col items-center justify-center h-full py-8 text-slate-400">
                  <CheckCircle2 className="w-8 h-8 mb-2 text-emerald-500 dark:text-emerald-400" />
                  <p className="text-xs font-medium">{t('noAlertsHealthy')}</p>
                </div>
              )}
            </AnimatePresence>
          </div>

          <p className="text-[10px] text-slate-400 mt-3 pt-2 border-t dark:border-white/[0.08] border-slate-200 text-center">
            {t('autoUpdatesStream')}
          </p>
        </motion.div>
      </div>

      {/* ─────────── WATER TREATMENT & REUSE ─────────── */}
      {treatment && (
        <motion.div custom={5} initial="hidden" animate="visible" variants={cardVariants}>
          <div className="flex items-center justify-between mb-4 pb-3 border-b dark:border-white/[0.08] border-slate-200">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white font-display flex items-center gap-2">
                <Recycle className="w-5 h-5 text-sky-600 dark:text-sky-400" /> {t('treatmentTitle')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t('treatmentPhase')}
              </p>
            </div>
            <Badge variant={treatment.qualityStatus === 'excellent' ? 'normal' : treatment.qualityStatus === 'good' ? 'info' : 'warning'} size="sm">
              {t('quality')}: {t('quality_' + (treatment.qualityStatus || 'good'))}
            </Badge>
          </div>

          {/* Treatment flow pipeline */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            {[
              { label: t('totalStored'), value: treatment.storedWater, unit: 'L', icon: Database, color: 'text-sky-600 dark:text-sky-400', badge: t('collected') },
              { label: t('treatedWater'), value: treatment.treatedWater, unit: 'L', icon: FlaskConical, color: 'text-teal-600 dark:text-teal-400', badge: `${treatment.treatmentEfficiency}% ${t('efficiency')}` },
              { label: t('availableReuse'), value: treatment.availableForReuse, unit: 'L', icon: Recycle, color: 'text-emerald-600 dark:text-emerald-400', badge: t('distributed') },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="relative">
                  <div className="dark:bg-white/5 bg-white backdrop-blur rounded-2xl p-4 dark:border-white/10 border-slate-200/90 border shadow-sm dark:shadow-lg dark:hover:bg-white/[0.08] hover:border-slate-300 dark:hover:border-white/20 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{item.label}</span>
                      <Icon className={`w-4 h-4 ${item.color}`} />
                    </div>
                    <div className="text-2xl sm:text-3xl font-black font-display text-slate-900 dark:text-white">
                      <CountUp end={item.value} duration={1.5} separator="," /> L
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-1 block">{item.badge}</span>
                  </div>
                  {i < 2 && (
                    <div className="hidden sm:flex absolute top-1/2 -right-2 transform -translate-y-1/2 z-10 w-4 h-4 items-center justify-center text-slate-400 dark:text-slate-500">
                      ▶
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Reuse Channel Cards */}
          <div>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{t('approvedReuseChannels')}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {reuseChannels.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="dark:bg-white/5 bg-white backdrop-blur rounded-2xl p-4 dark:border-white/10 border-slate-200/90 border shadow-sm dark:shadow-lg dark:hover:bg-white/10 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col items-center text-center"
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-2.5 shadow-sm`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{item.label}</span>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                      <CountUp end={item.amount} duration={1.5} separator="," suffix=" L" />
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}


      {/* ─────────── COMPLAINT MODAL ─────────── */}
      <Modal isOpen={isComplaintOpen} onClose={() => setIsComplaintOpen(false)} title="Submit Citizen Report" subtitle="Direct channel to Municipal Engineering Division">
        <form onSubmit={handleComplaintSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Issue Category</label>
            <select required className="w-full rounded-xl border border-slate-200 dark:border-white/10 dark:bg-[#0F172A] p-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-deep">
              <option className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white">Drain blockage / debris clogged</option>
              <option className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white">Water level sensor offline</option>
              <option className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white">Solenoid valve leakage</option>
              <option className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white">Foul odour near drain sump</option>
              <option className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white">Water reuse quality concern</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Description & Location</label>
            <textarea rows={3} required placeholder="Describe the issue and exact location near the drain node..." className="w-full rounded-xl border border-slate-200 dark:border-white/10 dark:bg-[#0F172A] p-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-deep resize-none" />
          </div>
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-white/10">
            <Button variant="ghost" size="sm" onClick={() => setIsComplaintOpen(false)} type="button">Cancel</Button>
            <Button type="submit" variant="primary" size="sm">Submit Report</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

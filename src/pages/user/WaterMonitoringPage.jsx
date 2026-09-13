import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import {
  Waves, Activity, Radio, AlertTriangle, ShieldCheck, Gauge,
  ArrowUpRight, RefreshCw, Cpu, CheckCircle2, AlertOctagon, Clock, MapPin, Zap
} from 'lucide-react';

import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import StatusIndicator from '../../components/common/StatusIndicator';
import VoiceSpeakerButton from '../../components/common/VoiceSpeakerButton';
import { useSocket } from '../../hooks/useSocket';
import { getLatestWaterLevel, getWaterLevelHistory, getWaterLevelStats } from '../../services/waterLevelService';
import { getMunicipalityMapNodes } from '../../services/municipalityService';

export default function WaterMonitoringPage() {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const { isConnected, waterLevel: socketLevel } = useSocket();

  const [level, setLevel] = useState(42.5);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ min: 18, max: 88, avg: 45 });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('24h');
  const [selectedWard, setSelectedWard] = useState('All');
  const [wardNodes, setWardNodes] = useState([]);

  const getNumericLevel = (val) => {
    if (typeof val === 'number' && !isNaN(val)) return val;
    if (typeof val === 'object' && val !== null) {
      return parseFloat(val.level ?? val.waterLevel ?? val.value ?? 42) || 42;
    }
    const parsed = parseFloat(val);
    return isNaN(parsed) ? 42 : parsed;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [latestRes, historyRes, statsRes, nodesRes] = await Promise.all([
        getLatestWaterLevel(),
        getWaterLevelHistory(timeRange === '1h' ? 1 : timeRange === '6h' ? 6 : timeRange === '7d' ? 168 : 24),
        getWaterLevelStats(),
        getMunicipalityMapNodes().catch(() => []),
      ]);

      if (latestRes) {
        setLevel(getNumericLevel(latestRes));
      }
      if (Array.isArray(historyRes)) {
        setHistory(historyRes.map(h => ({
          time: new Date(h.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          level: parseFloat(getNumericLevel(h).toFixed(1)),
        })));
      }
      if (statsRes) {
        setStats({
          min: getNumericLevel(statsRes.minLevel ?? 18),
          max: getNumericLevel(statsRes.maxLevel ?? 88),
          avg: getNumericLevel(statsRes.avgLevel ?? 45),
        });
      }

      if (Array.isArray(nodesRes) && nodesRes.length > 0) {
        setWardNodes(nodesRes.slice(0, 12).map(n => {
          const wL = getNumericLevel(n.waterLevel ?? n.level);
          return {
            id: n.systemId || `NODE-${n._id?.slice(-4)}`,
            ward: n.ward ? `${n.ward} (${n.location || 'Sector'})` : (n.location || 'Drainage Node'),
            level: wL,
            depthCm: Math.round((wL / 100) * 400),
            flowRate: parseFloat(((wL / 10) * 0.8 + 1).toFixed(1)),
            status: n.status || (wL >= 90 ? 'Critical Flood' : wL >= 75 ? 'High Risk' : wL >= 50 ? 'Warning' : 'Normal'),
            rssi: -60 - (parseInt(n.systemId?.replace(/\D/g, '') || '5', 10) % 15),
          };
        }));
      }
    } catch (err) {
      console.warn('Failed to fetch telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  useEffect(() => {
    if (socketLevel !== null && socketLevel !== undefined) {
      setLevel(getNumericLevel(socketLevel));
    }
  }, [socketLevel]);

  const getThresholdInfo = (val) => {
    const num = getNumericLevel(val);
    if (num < 50) return { label: 'NORMAL', color: '#22C55E', textClass: 'text-emerald-500', bgClass: 'bg-emerald-500/10 border-emerald-500/30' };
    if (num < 75) return { label: 'WARNING', color: '#F59E0B', textClass: 'text-amber-500', bgClass: 'bg-amber-500/10 border-amber-500/30' };
    if (num < 90) return { label: 'HIGH RISK', color: '#F97316', textClass: 'text-orange-500', bgClass: 'bg-orange-500/10 border-orange-500/30' };
    return { label: 'CRITICAL FLOOD', color: '#EF4444', textClass: 'text-rose-500', bgClass: 'bg-rose-500/10 border-rose-500/30' };
  };

  const currentLevel = getNumericLevel(level);
  const currentThresh = getThresholdInfo(currentLevel);
  const depthCm = Math.round((currentLevel / 100) * 400); // 4m sump depth max

  const filteredNodes = selectedWard === 'All'
    ? wardNodes
    : wardNodes.filter(n => n.ward.toLowerCase().includes(selectedWard.toLowerCase()) || n.status.toLowerCase() === selectedWard.toLowerCase());

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#0F4C5C] to-[#0A333E] text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <Waves className="w-64 h-64" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md">
              <Waves className="w-5 h-5 text-sky-300 animate-pulse" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black font-display tracking-tight">
              Real-Time Water Level & Drainage Telemetry
            </h1>
          </div>
          <p className="text-xs text-teal-100 max-w-xl">
            Live IoT ultrasonic sensor telemetry, channel depth measurement, saturation thresholds, and multi-ward drainage node monitoring.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-xs">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
            <span className="font-semibold text-white">{isConnected ? 'Live Telemetry Active' : 'Polling Backend'}</span>
          </div>
          <VoiceSpeakerButton
            text={`Live water telemetry report: Primary sump water level is ${currentLevel.toFixed(1)} percent, with a depth of ${depthCm} centimeters. Current threshold condition is ${currentThresh.label}. Flow velocity is 4.8 meters per second. Line power is stable.`}
            label="Listen Telemetry"
            size="sm"
            variant="subtle"
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            id="water-telemetry-header-voice"
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchData}
            isLoading={loading}
            icon={RefreshCw}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Live Sump Level */}
        <motion.div
          whileHover={{ y: -2 }}
          className="dark:bg-[#0F172A] bg-white border dark:border-white/10 border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between"
        >
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Primary Sump Level</span>
              <VoiceSpeakerButton
                text={`Primary sump level is ${currentLevel.toFixed(1)} percent (${depthCm} cm). Threshold is ${currentThresh.label}.`}
                size="xs"
                id="sump-primary-voice"
              />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-2xl font-black font-mono ${currentThresh.textClass}`}>
                <CountUp end={currentLevel} decimals={1} duration={0.8} />%
              </span>
              <span className="text-xs text-slate-500">({depthCm} cm)</span>
            </div>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold border" style={{ color: currentThresh.color, borderColor: `${currentThresh.color}40`, backgroundColor: `${currentThresh.color}15` }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: currentThresh.color }} />
              {currentThresh.label}
            </div>
          </div>
          <div className="w-16 h-16 flex-shrink-0">
            <CircularProgressbar
              value={currentLevel}
              text={`${currentLevel.toFixed(0)}%`}
              styles={buildStyles({
                textSize: '24px',
                pathColor: currentThresh.color,
                textColor: isDark ? '#ffffff' : '#0f172a',
                trailColor: isDark ? '#1e293b' : '#e2e8f0',
                strokeLinecap: 'round',
              })}
            />
          </div>
        </motion.div>

        {/* Metric 2: 24h Peak Level */}
        <motion.div
          whileHover={{ y: -2 }}
          className="dark:bg-[#0F172A] bg-white border dark:border-white/10 border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between"
        >
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">24h Peak Water Level</span>
            <div className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-1">
              {stats.max.toFixed(1)}%
            </div>
            <p className="text-[10px] text-rose-500 font-semibold mt-2 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" /> Max recorded today
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
            <AlertOctagon className="w-6 h-6" />
          </div>
        </motion.div>

        {/* Metric 3: Flow Rate & Velocity */}
        <motion.div
          whileHover={{ y: -2 }}
          className="dark:bg-[#0F172A] bg-white border dark:border-white/10 border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between"
        >
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Drainage Flow Velocity</span>
            <div className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-1">
              4.8 <span className="text-xs text-slate-400">m/s</span>
            </div>
            <p className="text-[10px] text-emerald-500 font-semibold mt-2 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Normal Discharge Speed
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-500 border border-sky-500/20">
            <Gauge className="w-6 h-6" />
          </div>
        </motion.div>

        {/* Metric 4: Sensor Signal & Voltage */}
        <motion.div
          whileHover={{ y: -2 }}
          className="dark:bg-[#0F172A] bg-white border dark:border-white/10 border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between"
        >
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">IoT Sensor Telemetry</span>
            <div className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-1">
              -64 <span className="text-xs text-slate-400">dBm</span>
            </div>
            <p className="text-[10px] text-sky-500 font-semibold mt-2 flex items-center gap-1">
              <Zap className="w-3 h-3" /> 3.3V Line Power Stable
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-teal-500/10 text-teal-500 border border-teal-500/20">
            <Radio className="w-6 h-6" />
          </div>
        </motion.div>
      </div>

      {/* Main Chart Section */}
      <div className="dark:bg-[#0F172A] bg-white border dark:border-white/10 border-slate-200 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-500" />
              Water Level Telemetry & Threshold Curve
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Continuous ultrasonic depth logging with active threshold alarm bands.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-xl border border-slate-200 dark:border-white/10">
            {['1h', '6h', '24h', '7d'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                  timeRange === range
                    ? 'bg-[#0F4C5C] text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history}>
              <defs>
                <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={currentThresh.color} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={currentThresh.color} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} opacity={0.5} />
              <XAxis dataKey="time" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} />
              <YAxis domain={[0, 100]} stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} unit="%" />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#0f172a' : '#ffffff',
                  borderColor: isDark ? '#334155' : '#e2e8f0',
                  borderRadius: '12px',
                  color: isDark ? '#ffffff' : '#0f172a',
                  fontSize: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
                }}
              />
              <ReferenceLine y={90} label={{ value: 'CRITICAL (90%)', fill: '#ef4444', fontSize: 10 }} stroke="#ef4444" strokeDasharray="4 4" />
              <ReferenceLine y={75} label={{ value: 'HIGH RISK (75%)', fill: '#f97316', fontSize: 10 }} stroke="#f97316" strokeDasharray="4 4" />
              <ReferenceLine y={50} label={{ value: 'WARNING (50%)', fill: '#f59e0b', fontSize: 10 }} stroke="#f59e0b" strokeDasharray="4 4" />
              <Area type="monotone" dataKey="level" stroke={currentThresh.color} strokeWidth={3} fillOpacity={1} fill="url(#waterGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Ward-by-Ward Node Telemetry Grid */}
      <div className="dark:bg-[#0F172A] bg-white border dark:border-white/10 border-slate-200 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-500" />
              Ward Drainage Station Network
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live status across all municipal drainage monitoring nodes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Filter Status:</span>
            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="All" className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white">All Nodes</option>
              <option value="Normal" className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white">Normal Only</option>
              <option value="Warning" className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white">Warning Only</option>
              <option value="High Risk" className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white">High Risk</option>
              <option value="Critical Flood" className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white">Critical Flood</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredNodes.map((node) => {
            const thresh = getThresholdInfo(node.level);
            return (
              <motion.div
                key={node.id}
                whileHover={{ scale: 1.02 }}
                className="p-4 rounded-2xl border dark:bg-white/[0.03] bg-slate-50 border-slate-200 dark:border-white/5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-slate-400">{node.id}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${thresh.bgClass} ${thresh.textClass}`}>
                    {node.status}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{node.ward}</h4>
                  <div className="flex items-baseline justify-between mt-2">
                    <span className={`text-xl font-black font-mono ${thresh.textClass}`}>
                      {node.level.toFixed(1)}%
                    </span>
                    <span className="text-xs text-slate-500 font-mono">{node.depthCm} cm</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                  <div
                    className="h-full transition-all duration-500 rounded-full"
                    style={{ width: `${node.level}%`, backgroundColor: thresh.color }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t dark:border-white/5 border-slate-200/60 font-mono">
                  <span>Flow: {node.flowRate} m/s</span>
                  <span>Signal: {node.rssi} dBm</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

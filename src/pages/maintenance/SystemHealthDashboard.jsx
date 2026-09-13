import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Cpu, Radio, Activity, CheckCircle2, AlertTriangle, AlertOctagon,
  Wifi, Zap, Gauge, Wrench, ArrowRight, RefreshCw, Layers, Shield,
  Clock, Thermometer, Database
} from 'lucide-react';
import { motion } from 'framer-motion';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { getDiagnosticsOverview } from '../../services/diagnosticsService';
import { useSocket } from '../../hooks/useSocket';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

export default function SystemHealthDashboard() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const { socket } = useSocket();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    overallHealthPercent: 92,
    healthyCount: 6,
    warningCount: 1,
    criticalCount: 0,
    offlineCount: 0,
    totalComponents: 8,
    lastDiagnosticTime: new Date(),
    device: null,
    components: [],
  });

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const res = await getDiagnosticsOverview();
      setData(res);
    } catch (err) {
      console.error('Failed to load diagnostics overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  // Listen to live socket diagnostics updates
  useEffect(() => {
    if (!socket) return;
    const handleUpdate = (payload) => {
      setData((prev) => ({
        ...prev,
        overallHealthPercent: payload.overallHealthPercent,
        healthyCount: payload.healthyCount,
        warningCount: payload.warningCount,
        criticalCount: payload.criticalCount,
        totalComponents: payload.totalComponents,
        lastDiagnosticTime: payload.timestamp,
        components: payload.components || prev.components,
      }));
    };

    socket.on('diagnostics:update', handleUpdate);
    return () => socket.off('diagnostics:update', handleUpdate);
  }, [socket]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'healthy':
        return <Badge variant="normal" size="sm" dot>Healthy</Badge>;
      case 'warning':
        return <Badge variant="warning" size="sm" dot>Inspection Needed</Badge>;
      case 'critical':
        return <Badge variant="critical" size="sm" dot>Critical Issue</Badge>;
      case 'offline':
        return <Badge variant="neutral" size="sm" dot>Offline</Badge>;
      default:
        return <Badge variant="info" size="sm">Active</Badge>;
    }
  };

  const getComponentIcon = (key) => {
    switch (key) {
      case 'esp32_controller': return Cpu;
      case 'ultrasonic_sensor': return Radio;
      case 'water_level_sensor': return Gauge;
      case 'submersible_pump': return Activity;
      case 'solenoid_valve': return Database;
      case 'relay_module': return Zap;
      case 'network_gateway': return Wifi;
      case 'power_supply': return Zap;
      default: return Layers;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b dark:border-white/10 border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-[#0F4C5C] dark:text-teal-400 flex items-center justify-center font-black">
              <Activity className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-display">
              System Health & Hardware Diagnostics
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time telemetry diagnostics for Node <span className="font-mono text-[#0EA5E9] font-bold">SYS-042</span> (ESP32, Sensors, Actuators, Power)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchOverview}
            icon={RefreshCw}
            className={loading ? 'animate-spin' : ''}
          >
            Refresh Diagnostics
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/maintenance/work-orders')}
            icon={Wrench}
            className="bg-[#0F4C5C] hover:bg-[#0A333E] text-white"
          >
            Manage Work Orders
          </Button>
        </div>
      </div>

      {/* ── Top Metric Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Overall Health Card */}
        <div className="md:col-span-2 dark:bg-white/5 bg-white border dark:border-white/10 border-slate-200/90 rounded-xl p-5 shadow-sm flex items-center gap-6">
          <div className="w-24 h-24 flex-shrink-0">
            <CircularProgressbar
              value={data.overallHealthPercent}
              text={`${data.overallHealthPercent}%`}
              styles={buildStyles({
                pathColor: data.overallHealthPercent >= 90 ? '#22C55E' : data.overallHealthPercent >= 75 ? '#F59E0B' : '#EF4444',
                textColor: data.overallHealthPercent >= 90 ? '#22C55E' : data.overallHealthPercent >= 75 ? '#F59E0B' : '#EF4444',
                trailColor: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0',
                textSize: '22px',
              })}
            />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Overall Hardware Status
            </span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white font-display mt-0.5">
              {data.overallHealthPercent}% Healthy
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              7 out of 8 hardware components operating within standard parameters.
            </p>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-400 font-mono">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Last diagnostic: {new Date(data.lastDiagnosticTime).toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        {/* Status Breakdown Counts */}
        <div className="dark:bg-white/5 bg-white border dark:border-white/10 border-slate-200/90 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Component Health Counts</span>
          <div className="space-y-2 mt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Healthy
              </span>
              <span className="font-bold font-mono text-slate-900 dark:text-white">{data.healthyCount}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
                <AlertTriangle className="w-3.5 h-3.5" /> Warning
              </span>
              <span className="font-bold font-mono text-slate-900 dark:text-white">{data.warningCount}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-medium">
                <AlertOctagon className="w-3.5 h-3.5" /> Critical
              </span>
              <span className="font-bold font-mono text-slate-900 dark:text-white">{data.criticalCount}</span>
            </div>
          </div>
        </div>

        {/* Quick Diagnostics Navigation Links */}
        <div className="dark:bg-white/5 bg-white border dark:border-white/10 border-slate-200/90 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Diagnostics Sub-Modules</span>
          <div className="space-y-1.5 mt-2">
            <Link to="/maintenance/esp32" className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 hover:text-[#0EA5E9] font-medium p-1 rounded hover:bg-slate-100 dark:hover:bg-white/5 transition">
              <span>ESP32 Controller</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link to="/maintenance/sensors" className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 hover:text-[#0EA5E9] font-medium p-1 rounded hover:bg-slate-100 dark:hover:bg-white/5 transition">
              <span>Sensor Probes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link to="/maintenance/components" className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 hover:text-[#0EA5E9] font-medium p-1 rounded hover:bg-slate-100 dark:hover:bg-white/5 transition">
              <span>Pump, Valve & Relay</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Component Matrix Grid ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white font-display flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#0EA5E9]" /> Hardware Component Health Matrix ({data.components?.length || 8})
          </h2>
          <span className="text-xs text-slate-400">Continuous telemetry loop: 5s</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.components && data.components.length > 0 ? (
            data.components.map((c) => {
              const Icon = getComponentIcon(c.componentKey);
              return (
                <div
                  key={c._id || c.componentKey}
                  className="dark:bg-white/5 bg-white border dark:border-white/10 border-slate-200/90 rounded-xl p-4 shadow-sm hover:border-slate-300 dark:hover:border-white/20 hover:shadow-md transition-all flex flex-col justify-between gap-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-xl bg-teal-500/15 text-[#0F4C5C] dark:text-teal-400 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    {getStatusBadge(c.status)}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{c.name}</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 capitalize">
                      Category: {c.category}
                    </p>
                  </div>

                  <div className="pt-2 border-t dark:border-white/10 border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Health Rating</span>
                    <span className={`font-mono font-bold ${c.healthPercentage >= 90 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                      {c.healthPercentage}%
                    </span>
                  </div>

                  {c.currentReading && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Live Reading</span>
                      <span className="font-mono font-bold text-[#0EA5E9]">{c.currentReading}</span>
                    </div>
                  )}

                  {c.operatingTemperatureC && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Core Temp</span>
                      <span className="font-mono text-slate-600 dark:text-slate-300">{c.operatingTemperatureC}°C</span>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="col-span-4 py-8 text-center text-xs text-slate-400">
              Loading hardware component matrix...
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

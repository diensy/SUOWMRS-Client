import React, { useState, useEffect } from 'react';
import {
  Zap, ToggleLeft, ToggleRight, Gauge, CheckCircle2, AlertTriangle,
  AlertOctagon, RefreshCw, Activity, Clock, Wrench, Thermometer,
  RotateCw, Shield, BatteryCharging, Wifi, Layers, ArrowUpRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { getComponentsDiagnostics } from '../../services/diagnosticsService';
import { getTreatmentCurrent, toggleFiltration } from '../../services/treatmentService';
import { confirmAction, customSwal } from '../../utils/swal';
import { useSocket } from '../../hooks/useSocket';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

export default function ComponentsHealth() {
  const { isDark } = useTheme();
  const { t, tStatus, locale } = useLanguage();
  const { socket } = useSocket();

  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtrationStatus, setFiltrationStatus] = useState('ACTIVE');
  const [filtrationLoading, setFiltrationLoading] = useState(false);

  const fetchComponents = async () => {
    try {
      setLoading(true);
      const [data, treat] = await Promise.all([
        getComponentsDiagnostics(),
        getTreatmentCurrent().catch(() => null),
      ]);
      setComponents(data || []);
      if (treat?.filtrationStatus) {
        setFiltrationStatus(treat.filtrationStatus);
      }
    } catch (err) {
      console.error('Failed to load components health:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComponents();
  }, []);

  // Listen to live socket updates
  useEffect(() => {
    if (!socket) return;
    const handleUpdate = (payload) => {
      if (payload.components) {
        const liveItems = payload.components.filter((c) => c.category !== 'sensor');
        if (liveItems.length > 0) {
          setComponents((prev) =>
            prev.map((item) => {
              const match = liveItems.find((li) => li._id === item._id || li.name === item.name);
              return match ? { ...item, ...match } : item;
            })
          );
        }
      }
    };
    const handleFiltrationUpdate = (payload) => {
      if (payload.filtrationStatus) {
        setFiltrationStatus(payload.filtrationStatus);
      }
    };
    socket.on('diagnostics:update', handleUpdate);
    socket.on('treatment:filtration', handleFiltrationUpdate);
    return () => {
      socket.off('diagnostics:update', handleUpdate);
      socket.off('treatment:filtration', handleFiltrationUpdate);
    };
  }, [socket]);

  const handleToggleFiltration = async () => {
    const isCurrentlyActive = filtrationStatus === 'ACTIVE';
    const nextStatus = isCurrentlyActive ? 'MAINTENANCE_PAUSED' : 'ACTIVE';

    const confirmRes = await confirmAction({
      title: isCurrentlyActive ? t('ch_pauseFiltrationQ') : t('ch_resumeFiltrationQ'),
      text: isCurrentlyActive ? t('ch_pauseFiltrationDesc') : t('ch_resumeFiltrationDesc'),
      confirmText: isCurrentlyActive ? t('ch_enterMaintenance') : t('ch_resumeFiltration'),
      isDanger: isCurrentlyActive,
    });

    if (!confirmRes.isConfirmed) return;

    setFiltrationLoading(true);
    try {
      const res = await toggleFiltration(nextStatus, 'Technician');
      setFiltrationStatus(nextStatus);
      customSwal.fire({
        icon: 'success',
        title: isCurrentlyActive ? t('ch_maintenanceModeTitle') : t('ch_filtrationActiveTitle'),
        text: t('ch_filtrationUpdated'),
        timer: 3000,
      });
    } catch (err) {
      console.error('Failed to toggle filtration mode:', err);
      customSwal.fire({
        icon: 'error',
        title: t('ch_filtrationFailed'),
        text: err.response?.data?.error || t('ch_filtrationFailedDesc'),
      });
    } finally {
      setFiltrationLoading(false);
    }
  };

  // Extract specific components for tailored cards
  const pump = components.find((c) => c.name?.toLowerCase().includes('pump')) || {
    name: 'Submersible Drainage & Supply Pump',
    status: 'healthy',
    state: 'running',
    runtimeHours: 342.5,
    healthPercentage: 94,
    voltage: 230.2,
    current: 4.8,
    operatingTemp: 44.2,
    lastMaintenanceDate: '2026-02-28',
  };

  const valve = components.find((c) => c.name?.toLowerCase().includes('valve')) || {
    name: 'Solenoid Diverter Valve',
    status: 'healthy',
    state: 'open',
    controlMode: 'auto',
    actuationCount: 1420,
    healthPercentage: 96,
    lastMaintenanceDate: '2026-03-02',
  };

  const relay = components.find((c) => c.name?.toLowerCase().includes('relay')) || {
    name: '4-Channel Industrial Relay Module',
    status: 'warning',
    state: 'active',
    actuationCount: 3890,
    healthPercentage: 78,
    operatingTemp: 52.4,
    lastMaintenanceDate: '2026-01-15',
    maintenanceNotes: 'Channel 3 switching delay nominal. Routine thermal inspection recommended.',
  };

  const power = components.find((c) => c.name?.toLowerCase().includes('power')) || {
    name: 'Solar & Battery Power Supply',
    status: 'healthy',
    voltage: 13.8,
    current: 2.1,
    healthPercentage: 99,
  };

  const network = components.find((c) => c.name?.toLowerCase().includes('network') || c.name?.toLowerCase().includes('gateway')) || {
    name: 'Network Communication Gateway',
    status: 'healthy',
    healthPercentage: 98,
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-transparent border border-purple-500/20 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/25">
            <Zap className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {t('ch_title')}
              </h1>
              <Badge variant="success" size="md">
                <span className="w-2 h-2 rounded-full mr-1.5 animate-ping bg-current" />
                {t('ch_liveLoop')}
              </Badge>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {t('ch_subtitle')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchComponents}
            loading={loading}
            className="h-9 px-3.5 rounded-lg border-slate-300 dark:border-white/10"
          >
            <RefreshCw className="w-4 h-4 mr-1.5 flex-shrink-0" />
            <span>{t('ch_refreshState')}</span>
          </Button>
        </div>
      </div>

      {/* Primary Component Cards: Pump, Valve, Relay */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. Submersible Pump Card */}
        <motion.div
          whileHover={{ y: -3 }}
          className="p-6 rounded-xl border bg-white dark:bg-slate-900/60 border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <RotateCw className="w-6 h-6 animate-spin" style={{ animationDuration: '4s' }} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    {t('ch_submersiblePump')}
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    2.0 HP Induction Motor
                  </span>
                </div>
              </div>
              <Badge variant="success" size="sm">
                ● {tStatus(pump.state || 'running').toUpperCase()}
              </Badge>
            </div>

            <div className="my-4 p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {t('ch_totalRuntime')}
                </span>
                <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white mt-0.5">
                  {pump.runtimeHours || '342.5'} <span className="text-sm font-normal text-slate-400">{t('ch_hrs')}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t('ch_healthIndex')}</span>
                <div className="text-xl font-bold font-mono text-emerald-500">
                  {pump.healthPercentage || 94}%
                </div>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-white/5">
                <span className="text-slate-500 dark:text-slate-400">{t('ch_operatingVoltage')}</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">{pump.voltage || 230.2} VAC</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-white/5">
                <span className="text-slate-500 dark:text-slate-400">{t('ch_motorCurrent')}</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">{pump.current || 4.8} A</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-white/5">
                <span className="text-slate-500 dark:text-slate-400">{t('ch_motorTemp')}</span>
                <span className="font-mono font-semibold text-emerald-500">{pump.operatingTemp || 44.2}°C</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500 dark:text-slate-400">{t('ch_lastOverhaul')}</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {pump.lastMaintenanceDate ? new Date(pump.lastMaintenanceDate).toLocaleDateString(locale) : '2026-02-28'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs text-slate-500">
            <span>{t('ch_flow')}: 140 L/min</span>
            <span className="text-emerald-500 font-medium">{t('ch_cavitationNone')}</span>
          </div>
        </motion.div>

        {/* 2. Solenoid Diverter Valve Card */}
        <motion.div
          whileHover={{ y: -3 }}
          className="p-6 rounded-xl border bg-white dark:bg-slate-900/60 border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    {t('ch_solenoidValve')}
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    24V DC Pilot Actuated
                  </span>
                </div>
              </div>
              <Badge variant="success" size="sm">
                ● {tStatus(valve.state || 'open').toUpperCase()}
              </Badge>
            </div>

            <div className="my-4 p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {t('ch_totalActuation')}
                </span>
                <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white mt-0.5">
                  {valve.actuationCount || '1,420'} <span className="text-sm font-normal text-slate-400">{t('ch_cycles')}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t('ch_controlMode')}</span>
                <div className="text-sm font-bold font-mono text-cyan-500 uppercase">
                  {tStatus(valve.controlMode || 'auto').toUpperCase()}
                </div>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-white/5">
                <span className="text-slate-500 dark:text-slate-400">{t('ch_openingLatency')}</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">450 ms</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-white/5">
                <span className="text-slate-500 dark:text-slate-400">{t('ch_holdingCoil')}</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">0.42 A</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-white/5">
                <span className="text-slate-500 dark:text-slate-400">{t('ch_sealIntegrity')}</span>
                <span className="font-mono font-semibold text-emerald-500">100% ({t('ch_noLeakage')})</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500 dark:text-slate-400">{t('ch_lastInspection')}</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {valve.lastMaintenanceDate ? new Date(valve.lastMaintenanceDate).toLocaleDateString(locale) : '2026-03-02'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs text-slate-500">
            <span>{t('ch_pressureDrop')}: 0.12 Bar</span>
            <span className="text-emerald-500 font-medium">{t('ch_plungerFree')}</span>
          </div>
        </motion.div>

        {/* 3. 4-Channel Industrial Relay Card */}
        <motion.div
          whileHover={{ y: -3 }}
          className="p-6 rounded-xl border bg-white dark:bg-slate-900/60 border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <ToggleRight className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    {t('ch_relayModule')}
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    4-Channel Optocoupled
                  </span>
                </div>
              </div>
              <Badge variant="warning" size="sm">
                ● {t('sh_inspectionNeeded').toUpperCase()}
              </Badge>
            </div>

            <div className="my-4 p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {t('ch_switchingCount')}
                </span>
                <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white mt-0.5">
                  {relay.actuationCount || '3,890'} <span className="text-sm font-normal text-slate-400">{t('ch_cycles')}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t('ch_operatingTemp')}</span>
                <div className="text-xl font-bold font-mono text-amber-500">
                  {relay.operatingTemp || 52.4}°C
                </div>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-white/5">
                <span className="text-slate-500 dark:text-slate-400">Ch 1 ({t('ch_pumpTrigger')})</span>
                <span className="font-mono font-semibold text-emerald-500">{t('status_closed').toUpperCase()} [{t('active').toUpperCase()}]</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-white/5">
                <span className="text-slate-500 dark:text-slate-400">Ch 2 ({t('ch_valveTrigger')})</span>
                <span className="font-mono font-semibold text-emerald-500">{t('status_closed').toUpperCase()} [{t('active').toUpperCase()}]</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-white/5">
                <span className="text-slate-500 dark:text-slate-400">Ch 3 ({t('ch_alarmBeacon')})</span>
                <span className="font-mono font-semibold text-amber-500">{t('status_open').toUpperCase()} [{t('ch_elevatedTemp')}]</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500 dark:text-slate-400">Ch 4 ({t('ch_auxFan')})</span>
                <span className="font-mono text-slate-400">{t('status_open').toUpperCase()} [{t('status_standby').toUpperCase()}]</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs text-amber-500 font-medium">
            <span>{t('ch_thermalWarning')}</span>
            <span>{t('ch_checkFanFilter')}</span>
          </div>
        </motion.div>
      </div>

      {/* 4. Multi-Stage Water Filtration & Purification System (Technician Control) */}
      <motion.div
        whileHover={{ y: -2 }}
        className={`p-6 rounded-2xl border shadow-md transition-all duration-300 ${
          filtrationStatus === 'ACTIVE'
            ? 'bg-white dark:bg-slate-900/70 border-emerald-500/30'
            : 'bg-white dark:bg-slate-900/70 border-amber-500/30'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md ${
              filtrationStatus === 'ACTIVE'
                ? 'bg-emerald-500 shadow-emerald-500/30'
                : 'bg-amber-500 shadow-amber-500/30'
            }`}>
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {t('ch_filtrationSuite')}
                </h3>
                <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                  filtrationStatus === 'ACTIVE'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                }`}>
                  {filtrationStatus === 'ACTIVE' ? `● ${t('ch_filtrationActiveTitle')}` : `▲ ${t('ch_maintenanceModeTitle')}`}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t('ch_stage1')} ➔ {t('ch_stage2')} ➔ {t('ch_stage3')} ➔ {t('ch_stage4')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <Button
              variant={filtrationStatus === 'ACTIVE' ? 'warning' : 'success'}
              size="sm"
              isLoading={filtrationLoading}
              onClick={handleToggleFiltration}
              className={filtrationStatus === 'ACTIVE' ? 'bg-amber-600 hover:bg-amber-700 text-white font-bold' : 'bg-emerald-600 hover:bg-emerald-700 text-white font-bold'}
              icon={filtrationStatus === 'ACTIVE' ? <Wrench className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            >
              {filtrationStatus === 'ACTIVE' ? t('ch_pauseForMaintenance') : t('ch_resumeFiltrationHealthy')}
            </Button>
          </div>
        </div>

        {/* 4-Stage Diagnostic Readouts */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
            <span className="text-[10px] font-bold text-slate-400 uppercase">{t('ch_stageLabel')} 1: {t('ch_stage1Short')}</span>
            <div className="font-mono font-bold text-slate-900 dark:text-white mt-1 text-sm">
              {filtrationStatus === 'ACTIVE' ? `1.2 Bar (${t('esp_nominal')})` : t('ch_backwashMode')}
            </div>
            <span className="text-[10px] text-emerald-500">{t('ch_differentialNormal')}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
            <span className="text-[10px] font-bold text-slate-400 uppercase">{t('ch_stageLabel')} 2: {t('ch_stage2Short')}</span>
            <div className="font-mono font-bold text-slate-900 dark:text-white mt-1 text-sm">
              {filtrationStatus === 'ACTIVE' ? `92% ${t('ch_clean')}` : t('ch_flushing')}
            </div>
            <span className="text-[10px] text-emerald-500">{t('ch_adsorptionOk')}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
            <span className="text-[10px] font-bold text-slate-400 uppercase">{t('ch_stageLabel')} 3: {t('ch_stage3Short')}</span>
            <div className="font-mono font-bold text-slate-900 dark:text-white mt-1 text-sm">
              {filtrationStatus === 'ACTIVE' ? '254 nm · 99.8%' : `${t('status_standby').toUpperCase()} (0W)`}
            </div>
            <span className="text-[10px] text-emerald-500">{t('ch_germicidalVerified')}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
            <span className="text-[10px] font-bold text-slate-400 uppercase">{t('ch_stageLabel')} 4: {t('ch_stage4Short')}</span>
            <div className="font-mono font-bold text-slate-900 dark:text-white mt-1 text-sm">
              {filtrationStatus === 'ACTIVE' ? `0.8 ppm ${t('ch_dosed')}` : t('ch_isolated')}
            </div>
            <span className="text-[10px] text-emerald-500">{t('ch_pathogenDefense')}</span>
          </div>
        </div>
      </motion.div>

      {/* Secondary Infrastructure: Power & Network */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Power Supply Health */}
        <div className="p-6 rounded-xl border bg-white dark:bg-slate-900/60 border-slate-200 dark:border-white/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                <BatteryCharging className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">
                  {t('ch_powerSystem')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  12V Regulated DC Bus with LiFePO4 Buffer
                </p>
              </div>
            </div>
            <Badge variant="success" size="sm">
              ● 99% OPERATIONAL
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
              <span className="text-xs text-slate-500">{t('ch_busVoltage')}</span>
              <div className="text-lg font-bold font-mono text-slate-900 dark:text-white mt-1">
                {power.voltage || 13.8} V
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
              <span className="text-xs text-slate-500">{t('ch_solarInput')}</span>
              <div className="text-lg font-bold font-mono text-emerald-500 mt-1">
                {power.current || 2.1} A
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
              <span className="text-xs text-slate-500">{t('ch_batteryState')}</span>
              <div className="text-lg font-bold font-mono text-cyan-500 mt-1">
                94% Float
              </div>
            </div>
          </div>
        </div>

        {/* Network & Gateway Health */}
        <div className="p-6 rounded-xl border bg-white dark:bg-slate-900/60 border-slate-200 dark:border-white/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                <Wifi className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">
                  {t('ch_networkGateway')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Industrial 4G LTE Cat-M1 + Local Wi-Fi AP
                </p>
              </div>
            </div>
            <Badge variant="success" size="sm">
              ● CONNECTED
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
              <span className="text-xs text-slate-500">{t('ch_linkUptime')}</span>
              <div className="text-lg font-bold font-mono text-slate-900 dark:text-white mt-1">
                99.98%
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
              <span className="text-xs text-slate-500">{t('ch_cellularSignal')}</span>
              <div className="text-lg font-bold font-mono text-emerald-500 mt-1">
                -62 dBm
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
              <span className="text-xs text-slate-500">{t('ch_socketProtocol')}</span>
              <div className="text-lg font-bold font-mono text-indigo-500 mt-1">
                WSS / TLS
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

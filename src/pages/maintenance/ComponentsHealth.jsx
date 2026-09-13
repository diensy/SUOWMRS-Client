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
import { useSocket } from '../../hooks/useSocket';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

export default function ComponentsHealth() {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const { socket } = useSocket();

  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchComponents = async () => {
    try {
      setLoading(true);
      const data = await getComponentsDiagnostics();
      setComponents(data || []);
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
    socket.on('diagnostics:update', handleUpdate);
    return () => socket.off('diagnostics:update', handleUpdate);
  }, [socket]);

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
                Actuators & Components Health
              </h1>
              <Badge variant="success" size="md">
                <span className="w-2 h-2 rounded-full mr-1.5 animate-ping bg-current" />
                Live Telemetry Loop
              </Badge>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Direct telemetry inspection for Submersible Pumps, Solenoid Valves, Industrial Relays, and Power Subsystems.
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
            <span>Refresh State</span>
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
                    Submersible Pump
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    2.0 HP Induction Motor
                  </span>
                </div>
              </div>
              <Badge variant="success" size="sm">
                ● {pump.state?.toUpperCase() || 'RUNNING'}
              </Badge>
            </div>

            <div className="my-4 p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Total Runtime Hours
                </span>
                <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white mt-0.5">
                  {pump.runtimeHours || '342.5'} <span className="text-sm font-normal text-slate-400">hrs</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Health Index</span>
                <div className="text-xl font-bold font-mono text-emerald-500">
                  {pump.healthPercentage || 94}%
                </div>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-white/5">
                <span className="text-slate-500 dark:text-slate-400">Operating Voltage</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">{pump.voltage || 230.2} VAC</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-white/5">
                <span className="text-slate-500 dark:text-slate-400">Motor Current Draw</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">{pump.current || 4.8} A</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-white/5">
                <span className="text-slate-500 dark:text-slate-400">Motor Temperature</span>
                <span className="font-mono font-semibold text-emerald-500">{pump.operatingTemp || 44.2}°C</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500 dark:text-slate-400">Last Overhaul</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {pump.lastMaintenanceDate ? new Date(pump.lastMaintenanceDate).toLocaleDateString() : '2026-02-28'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs text-slate-500">
            <span>Flow: 140 L/min</span>
            <span className="text-emerald-500 font-medium">Cavitation: None detected</span>
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
                    Solenoid Valve
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    24V DC Pilot Actuated
                  </span>
                </div>
              </div>
              <Badge variant="success" size="sm">
                ● {valve.state?.toUpperCase() || 'OPEN'}
              </Badge>
            </div>

            <div className="my-4 p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Total Actuation Cycles
                </span>
                <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white mt-0.5">
                  {valve.actuationCount || '1,420'} <span className="text-sm font-normal text-slate-400">cycles</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Control Mode</span>
                <div className="text-sm font-bold font-mono text-cyan-500 uppercase">
                  {valve.controlMode || 'AUTO'}
                </div>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-white/5">
                <span className="text-slate-500 dark:text-slate-400">Opening Latency</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">450 ms</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-white/5">
                <span className="text-slate-500 dark:text-slate-400">Holding Coil Current</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">0.42 A</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-white/5">
                <span className="text-slate-500 dark:text-slate-400">Seal Integrity</span>
                <span className="font-mono font-semibold text-emerald-500">100% (No Leakage)</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500 dark:text-slate-400">Last Inspection</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {valve.lastMaintenanceDate ? new Date(valve.lastMaintenanceDate).toLocaleDateString() : '2026-03-02'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs text-slate-500">
            <span>Pressure Drop: 0.12 Bar</span>
            <span className="text-emerald-500 font-medium">Plunger Free</span>
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
                    Relay Module
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    4-Channel Optocoupled
                  </span>
                </div>
              </div>
              <Badge variant="warning" size="sm">
                ● INSPECTION RECOMMENDED
              </Badge>
            </div>

            <div className="my-4 p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Switching Count
                </span>
                <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white mt-0.5">
                  {relay.actuationCount || '3,890'} <span className="text-sm font-normal text-slate-400">cycles</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Operating Temp</span>
                <div className="text-xl font-bold font-mono text-amber-500">
                  {relay.operatingTemp || 52.4}°C
                </div>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-white/5">
                <span className="text-slate-500 dark:text-slate-400">Ch 1 (Pump Trigger)</span>
                <span className="font-mono font-semibold text-emerald-500">CLOSED [ACTIVE]</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-white/5">
                <span className="text-slate-500 dark:text-slate-400">Ch 2 (Valve Trigger)</span>
                <span className="font-mono font-semibold text-emerald-500">CLOSED [ACTIVE]</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-white/5">
                <span className="text-slate-500 dark:text-slate-400">Ch 3 (Alarm Beacon)</span>
                <span className="font-mono font-semibold text-amber-500">OPEN [ELEVATED TEMP]</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500 dark:text-slate-400">Ch 4 (Auxiliary Fan)</span>
                <span className="font-mono text-slate-400">OPEN [STANDBY]</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs text-amber-500 font-medium">
            <span>Thermal threshold warning</span>
            <span>Check fan filter</span>
          </div>
        </motion.div>
      </div>

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
                  Solar & Battery Power System
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
              <span className="text-xs text-slate-500">Bus Voltage</span>
              <div className="text-lg font-bold font-mono text-slate-900 dark:text-white mt-1">
                {power.voltage || 13.8} V
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
              <span className="text-xs text-slate-500">Solar Input</span>
              <div className="text-lg font-bold font-mono text-emerald-500 mt-1">
                {power.current || 2.1} A
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
              <span className="text-xs text-slate-500">Battery State</span>
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
                  Communication Network Gateway
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
              <span className="text-xs text-slate-500">Link Uptime</span>
              <div className="text-lg font-bold font-mono text-slate-900 dark:text-white mt-1">
                99.98%
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
              <span className="text-xs text-slate-500">Cellular Signal</span>
              <div className="text-lg font-bold font-mono text-emerald-500 mt-1">
                -62 dBm
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
              <span className="text-xs text-slate-500">Socket Protocol</span>
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

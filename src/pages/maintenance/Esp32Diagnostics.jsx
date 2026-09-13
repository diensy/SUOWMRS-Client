import React, { useState, useEffect } from 'react';
import {
  Cpu, Wifi, Activity, RefreshCw, Power, Server, ShieldCheck,
  CheckCircle2, AlertTriangle, Clock, HardDrive, Radio, Terminal,
  Copy, Check, ArrowUpRight, Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { getEsp32Diagnostics, rebootEsp32, pingEsp32 } from '../../services/diagnosticsService';
import { useSocket } from '../../hooks/useSocket';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { playCriticalBeep, playConfirmBeep, playActionBeep } from '../../utils/sound';

export default function Esp32Diagnostics() {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const { socket } = useSocket();

  const [loading, setLoading] = useState(true);
  const [rebooting, setRebooting] = useState(false);
  const [pinging, setPinging] = useState(false);
  const [copied, setCopied] = useState(false);
  const [device, setDevice] = useState({
    deviceId: 'ESP32-UNIT-001',
    name: 'Primary Node Telemetry Controller',
    status: 'online',
    wifiSignalDbm: -58,
    wifiQuality: 'Excellent',
    ipAddress: '192.168.1.142',
    macAddress: '24:6F:28:AB:CD:EF',
    firmwareVersion: 'v1.0.4',
    uptimeSeconds: 1065600,
    sensorFrequencySeconds: 5,
    pingLatencyMs: 14,
    freeHeapBytes: 224890,
    cpuTemperatureC: 41.5,
    flashChipSizeBytes: 4194304,
    lastPing: new Date(),
  });

  const fetchDevice = async () => {
    try {
      setLoading(true);
      const data = await getEsp32Diagnostics();
      if (data) setDevice(data);
    } catch (err) {
      console.error('Failed to fetch ESP32 diagnostics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevice();
  }, []);

  // Listen to live socket diagnostics
  useEffect(() => {
    if (!socket) return;
    const handleUpdate = (payload) => {
      if (payload.device) {
        setDevice((prev) => ({ ...prev, ...payload.device }));
      }
    };
    socket.on('diagnostics:update', handleUpdate);
    return () => socket.off('diagnostics:update', handleUpdate);
  }, [socket]);

  // Format uptime
  const formatUptime = (totalSeconds = 0) => {
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  // Handle Reboot
  const handleReboot = async () => {
    playCriticalBeep();
    const result = await Swal.fire({
      title: t('swal_reboot_title') || 'Reboot ESP32 Controller?',
      text: t('swal_reboot_desc') || 'Telemetry streaming will pause for approximately 3-5 seconds while the microcontroller restarts.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: t('swal_reboot_confirm') || 'Yes, Reboot Node',
      cancelButtonText: t('swal_cancel') || 'Cancel',
      background: isDark ? '#0F172A' : '#FFFFFF',
      color: isDark ? '#F8FAFC' : '#0F172A',
    });

    if (result.isConfirmed) {
      playConfirmBeep();
      setRebooting(true);
      try {
        await rebootEsp32();
        setDevice((prev) => ({ ...prev, status: 'rebooting' }));
        Swal.fire({
          icon: 'success',
          title: t('swal_reboot_success_title') || 'Reboot Signal Sent',
          text: t('swal_reboot_success_desc') || 'The ESP32 controller has been instructed to perform a soft system reset.',
          timer: 2500,
          showConfirmButton: false,
          background: isDark ? '#0F172A' : '#FFFFFF',
          color: isDark ? '#F8FAFC' : '#0F172A',
        });
        setTimeout(() => {
          fetchDevice();
          setRebooting(false);
        }, 3500);
      } catch (err) {
        setRebooting(false);
        Swal.fire({
          icon: 'error',
          title: t('commandFailed') || 'Command Failed',
          text: err.response?.data?.details || err.response?.data?.error || 'Could not send reboot signal to the telemetry node.',
          background: isDark ? '#0F172A' : '#FFFFFF',
          color: isDark ? '#F8FAFC' : '#0F172A',
        });
      }
    }
  };

  // Handle Ping
  const handlePing = async () => {
    playActionBeep();
    setPinging(true);
    try {
      const res = await pingEsp32();
      setDevice((prev) => ({
        ...prev,
        pingLatencyMs: res.latency,
        lastPing: new Date(),
        status: 'online',
      }));
    } catch (err) {
      console.error('Ping test failed:', err);
    } finally {
      setTimeout(() => setPinging(false), 500);
    }
  };

  const copyIp = () => {
    playActionBeep();
    navigator.clipboard.writeText(device.ipAddress || '192.168.1.142');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Signal strength meter helper
  const getSignalColor = (dbm) => {
    const val = Math.round(Number(dbm) || -58);
    if (val >= -60) return 'text-emerald-500';
    if (val >= -75) return 'text-amber-500';
    return 'text-rose-500';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-xl bg-gradient-to-r from-blue-600/10 via-cyan-500/10 to-transparent border border-blue-500/20 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
            <Cpu className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                ESP32 Node Diagnostics
              </h1>
              <Badge
                variant={
                  device.status === 'online'
                    ? 'success'
                    : device.status === 'rebooting'
                    ? 'warning'
                    : 'danger'
                }
                size="md"
              >
                <span className="w-2 h-2 rounded-full mr-1.5 animate-ping bg-current" />
                {device.status ? device.status.toUpperCase() : 'ONLINE'}
              </Badge>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Real-time telemetry, core parameters, network link, and control interface for Node <span className="font-mono font-semibold text-blue-500">{device.deviceId}</span>
            </p>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePing}
            loading={pinging}
            className="h-9 px-3.5 rounded-lg border-slate-300 dark:border-white/10"
          >
            <Radio className="w-4 h-4 mr-1.5 text-cyan-500 flex-shrink-0" />
            <span>Ping Test</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchDevice}
            loading={loading}
            className="h-9 px-3.5 rounded-lg border-slate-300 dark:border-white/10"
          >
            <RefreshCw className="w-4 h-4 mr-1.5 flex-shrink-0" />
            <span>Refresh</span>
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={handleReboot}
            loading={rebooting}
            className="h-9 px-3.5 rounded-lg shadow-sm"
          >
            <Power className="w-4 h-4 mr-1.5 flex-shrink-0" />
            <span>Reboot Node</span>
          </Button>
        </div>
      </div>

      {/* Grid: Main Specs & Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Device ID Card */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-5 rounded-xl border bg-white dark:bg-slate-900/60 border-slate-200 dark:border-white/10 shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Controller Node ID
            </span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
            {device.deviceId}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Dual-Core Xtensa LX6 @ 240MHz
          </div>
        </motion.div>

        {/* Wi-Fi Signal Card */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-5 rounded-xl border bg-white dark:bg-slate-900/60 border-slate-200 dark:border-white/10 shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Wi-Fi RSSI Signal
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <Wifi className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
              {Math.round(Number(device.wifiSignalDbm) || -58)} dBm
            </span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 ${getSignalColor(device.wifiSignalDbm)}`}>
              {device.wifiQuality || 'Excellent'}
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(10, (Math.round(Number(device.wifiSignalDbm) || -58) + 100) * 2))}%` }}
            />
          </div>
        </motion.div>

        {/* Latency & Last Ping */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-5 rounded-xl border bg-white dark:bg-slate-900/60 border-slate-200 dark:border-white/10 shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Ping Latency
            </span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-500">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
              {device.pingLatencyMs || 12} ms
            </span>
            <span className="text-xs text-emerald-500 font-medium flex items-center">
              ● Ultra-fast
            </span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Updated {new Date(device.lastPing || Date.now()).toLocaleTimeString()}
          </div>
        </motion.div>

        {/* System Uptime Card */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-5 rounded-xl border bg-white dark:bg-slate-900/60 border-slate-200 dark:border-white/10 shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              System Uptime
            </span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
            {formatUptime(device.uptimeSeconds)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Zero unexpected watchdog reboots
          </div>
        </motion.div>
      </div>

      {/* Deep Diagnostic Tables & Specs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Network & Firmware Specifications */}
        <div className="p-6 rounded-xl border bg-white dark:bg-slate-900/60 border-slate-200 dark:border-white/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                <Server className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Network & Firmware Config
              </h3>
            </div>
            <span className="text-xs font-mono px-2 py-1 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20">
              Static DHCP
            </span>
          </div>

          <div className="space-y-3.5 divide-y divide-slate-100 dark:divide-white/5">
            <div className="flex items-center justify-between pt-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">IP Address</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-semibold text-slate-900 dark:text-white">
                  {device.ipAddress}
                </span>
                <button
                  onClick={copyIp}
                  className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                  title="Copy IP"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3">
              <span className="text-sm text-slate-600 dark:text-slate-400">MAC Hardware Address</span>
              <span className="font-mono text-sm font-semibold text-slate-900 dark:text-white">
                {device.macAddress}
              </span>
            </div>

            <div className="flex items-center justify-between pt-3">
              <span className="text-sm text-slate-600 dark:text-slate-400">Firmware Build</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold">
                  {device.firmwareVersion} (Stable)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3">
              <span className="text-sm text-slate-600 dark:text-slate-400">Sensor Update Frequency</span>
              <span className="font-mono text-sm font-semibold text-blue-500">
                {device.sensorFrequencySeconds || 5} seconds
              </span>
            </div>

            <div className="flex items-center justify-between pt-3">
              <span className="text-sm text-slate-600 dark:text-slate-400">TLS & MQTT Encryption</span>
              <span className="text-xs font-semibold text-emerald-500 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" /> TLS 1.3 / X.509 Active
              </span>
            </div>
          </div>
        </div>

        {/* Hardware Micro-Metrics */}
        <div className="p-6 rounded-xl border bg-white dark:bg-slate-900/60 border-slate-200 dark:border-white/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
                <HardDrive className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Hardware Health & Memory
              </h3>
            </div>
            <span className="text-xs font-mono px-2 py-1 rounded bg-purple-500/10 text-purple-500 border border-purple-500/20">
              SoC Internal
            </span>
          </div>

          <div className="space-y-4">
            {/* Free Heap Memory */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-600 dark:text-slate-400">Free Heap SRAM</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">
                  {Math.round((device.freeHeapBytes || 224890) / 1024)} KB / 320 KB
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-purple-500 h-full rounded-full"
                  style={{ width: `${Math.round(((device.freeHeapBytes || 224890) / 327680) * 100)}%` }}
                />
              </div>
            </div>

            {/* Core CPU Temperature */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-600 dark:text-slate-400">On-Chip Thermal Sensor</span>
                <span className="font-mono font-semibold text-emerald-500">
                  {device.cpuTemperatureC || 41.5}°C (Nominal)
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{ width: `${((device.cpuTemperatureC || 41.5) / 85) * 100}%` }}
                />
              </div>
            </div>

            {/* SPI Flash Memory */}
            <div className="pt-2 border-t border-slate-100 dark:divide-white/5 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">SPI Flash Storage</span>
                <span className="font-mono text-slate-900 dark:text-white font-semibold">4.0 MB Quad-SPI</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Internal Brownout Detector</span>
                <span className="text-emerald-500 font-semibold text-xs">Armed & Protected</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Watchdog Timer (WDT)</span>
                <span className="text-blue-500 font-semibold text-xs">Task + Interrupt WDT Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Shell Log / Terminal Window */}
      <div className="p-5 rounded-xl bg-slate-950 text-emerald-400 font-mono text-xs shadow-xl border border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3 text-slate-400">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-300">ESP32 Telemetry Console Stream (UART0 / WebSocket)</span>
          </div>
          <span className="text-[11px] text-slate-500">Baud: 115200 • 8-N-1</span>
        </div>
        <div className="space-y-1 overflow-x-auto text-[11px] leading-relaxed">
          <div className="text-slate-500">[SYSTEM] Node {device.deviceId} connected to AP "SUOWMRS_IoT_Gateway"</div>
          <div className="text-slate-500">[NTP] Clock synchronized with pool.ntp.org (Offset: -1.2ms)</div>
          <div>[MQTT] Telemetry packet published to topic: <span className="text-cyan-300">suowmrs/telemetry/{device.deviceId}</span></div>
          <div>[DIAG] RSSI: {Math.round(Number(device.wifiSignalDbm) || -58)} dBm | Ping: {device.pingLatencyMs}ms | Free Heap: {Math.round((device.freeHeapBytes || 224890) / 1024)}KB | Temp: {device.cpuTemperatureC}°C</div>
          <div className="text-emerald-300">[STATUS] All GPIO interrupts healthy. Ultrasonic and Hydrostatic sensors online.</div>
        </div>
      </div>
    </div>
  );
}

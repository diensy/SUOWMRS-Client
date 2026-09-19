import React, { useState, useEffect } from 'react';
import {
  Radio, Activity, CheckCircle2, AlertTriangle, AlertOctagon,
  RefreshCw, Wrench, Calendar, Award, ShieldAlert, Sparkles,
  ArrowUpRight, Gauge, Waves, Sliders
} from 'lucide-react';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { getSensorsDiagnostics, calibrateSensor } from '../../services/diagnosticsService';
import { useSocket } from '../../hooks/useSocket';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

export default function SensorDiagnostics() {
  const { isDark } = useTheme();
  const { t, tStatus, locale } = useLanguage();
  const { socket } = useSocket();

  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calibratingId, setCalibratingId] = useState(null);

  const fetchSensors = async () => {
    try {
      setLoading(true);
      const data = await getSensorsDiagnostics();
      setSensors(data || []);
    } catch (err) {
      console.error('Failed to load sensors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSensors();
  }, []);

  // Listen to live socket updates
  useEffect(() => {
    if (!socket) return;
    const handleUpdate = (payload) => {
      if (payload.components) {
        const liveSensors = payload.components.filter((c) => c.category === 'sensor');
        if (liveSensors.length > 0) {
          setSensors((prev) =>
            prev.map((s) => {
              const match = liveSensors.find((ls) => ls._id === s._id || ls.name === s.name);
              return match ? { ...s, ...match } : s;
            })
          );
        }
      }
    };
    socket.on('diagnostics:update', handleUpdate);
    return () => socket.off('diagnostics:update', handleUpdate);
  }, [socket]);

  // Handle Calibrate
  const handleCalibrate = async (sensor) => {
    const result = await Swal.fire({
      title: t('sd_calibrateQ', { name: sensor.name }),
      text: t('sd_calibrateDesc'),
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3B82F6',
      cancelButtonColor: '#6B7280',
      confirmButtonText: t('sd_startCalibration'),
      cancelButtonText: t('cancel'),
      background: isDark ? '#1E293B' : '#FFFFFF',
      color: isDark ? '#F8FAFC' : '#0F172A',
    });

    if (result.isConfirmed) {
      setCalibratingId(sensor._id);
      try {
        const res = await calibrateSensor(sensor._id);
        Swal.fire({
          icon: 'success',
          title: t('sd_calibrationSuccess'),
          text: t('sd_calibrationSuccessDesc'),
          timer: 2500,
          showConfirmButton: false,
          background: isDark ? '#1E293B' : '#FFFFFF',
          color: isDark ? '#F8FAFC' : '#0F172A',
        });
        fetchSensors();
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: t('sd_calibrationError'),
          text: t('sd_calibrationErrorDesc'),
          background: isDark ? '#1E293B' : '#FFFFFF',
          color: isDark ? '#F8FAFC' : '#0F172A',
        });
      } finally {
        setCalibratingId(null);
      }
    }
  };

  // Helper for days until next calibration
  const getDaysUntil = (dateStr) => {
    if (!dateStr) return t('sd_daysLeft', { days: 30 });
    const diff = new Date(dateStr) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return t('sd_daysOverdue', { days: Math.abs(days) });
    return t('sd_daysLeft', { days });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border border-emerald-500/20 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25">
            <Radio className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {t('sd_title')}
              </h1>
              <Badge variant="success" size="md">
                <span className="w-2 h-2 rounded-full mr-1.5 animate-ping bg-current" />
                {t('sd_activeTelemetry')}
              </Badge>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {t('sd_subtitle')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSensors}
            loading={loading}
            className="h-9 px-3.5 rounded-lg border-slate-300 dark:border-white/10"
          >
            <RefreshCw className="w-4 h-4 mr-1.5 flex-shrink-0" />
            <span>{t('sd_refreshTelemetry')}</span>
          </Button>
        </div>
      </div>

      {/* Sensor Cards List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sensors.map((sensor) => {
          const isCalibrating = calibratingId === sensor._id;
          const isHealthy = sensor.status === 'healthy';

          return (
            <motion.div
              key={sensor._id || sensor.name}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className="p-6 rounded-xl border bg-white dark:bg-slate-900/60 border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-between"
            >
              <div>
                {/* Card Header */}
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                      <Waves className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                        {sensor.name}
                      </h3>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                        {t('sd_model')}: {sensor.hardwareModel || 'JSN-SR04T'} • {t('sd_pin')}: {sensor.gpioPin || 'GPIO18'}
                      </span>
                    </div>
                  </div>

                  <Badge
                    variant={isHealthy ? 'success' : sensor.status === 'warning' ? 'warning' : 'danger'}
                    size="md"
                  >
                    ● {tStatus(sensor.status || 'healthy').toUpperCase()}
                  </Badge>
                </div>

                {/* Primary Reading Display */}
                <div className="my-5 p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {t('sd_liveReading')}
                    </span>
                    <div className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white mt-1 flex items-baseline gap-2">
                      {sensor.readingValue || '2.4'}
                      <span className="text-lg font-medium text-emerald-500">
                        {sensor.readingUnit || 'm'}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">
                      {t('sd_convertedDistance')}
                    </span>
                  </div>

                  {/* Health Gauge Meter */}
                  <div className="text-right">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                      {t('sd_signalHealth')}
                    </span>
                    <span className="text-xl font-bold font-mono text-emerald-500">
                      {sensor.healthPercentage || 98}%
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">SNR: 42.1 dB</span>
                  </div>
                </div>

                {/* Calibration & Diagnostic Details */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-500" />
                      {t('sd_lastCalibrated')}
                    </span>
                    <span className="font-mono font-medium text-slate-900 dark:text-white text-xs mt-1 block">
                      {sensor.lastCalibrationDate
                        ? new Date(sensor.lastCalibrationDate).toLocaleDateString(locale)
                        : '2026-03-01'}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      {t('sd_nextDue')}
                    </span>
                    <span className="font-mono font-medium text-slate-900 dark:text-white text-xs mt-1 block">
                      {sensor.nextCalibrationDueDate
                        ? new Date(sensor.nextCalibrationDueDate).toLocaleDateString(locale)
                        : '2026-04-01'}{' '}
                      <span className="text-[10px] text-emerald-500 font-normal">
                        ({getDaysUntil(sensor.nextCalibrationDueDate)})
                      </span>
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                      {t('sd_errorCount')}
                    </span>
                    <span className="font-mono font-bold text-xs mt-1 block text-slate-900 dark:text-white">
                      {sensor.errorCount || 0} {t('sd_anomalyEvents')}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-purple-500" />
                      {t('sd_zeroOffset')}
                    </span>
                    <span className="font-mono font-medium text-slate-900 dark:text-white text-xs mt-1 block">
                      +0.012 m ({t('sd_withinSpec')})
                    </span>
                  </div>
                </div>

                {sensor.maintenanceNotes && (
                  <div className="mt-3 p-2.5 rounded-lg bg-blue-500/5 border border-blue-500/10 text-xs text-blue-600 dark:text-blue-400">
                    💡 {sensor.maintenanceNotes}
                  </div>
                )}
              </div>

              {/* Action Trigger */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {t('sd_actionEvery30')}
                </span>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleCalibrate(sensor)}
                  loading={isCalibrating}
                  className="h-9 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 shadow-sm"
                >
                  <Wrench className="w-4 h-4 mr-1.5 flex-shrink-0" />
                  <span>{t('sd_calibrateSensor')}</span>
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Sensor Calibration Protocol Guide */}
      <div className="p-6 rounded-xl border bg-white dark:bg-slate-900/60 border-slate-200 dark:border-white/10 shadow-sm">
        <h4 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-500" />
          {t('sd_protocolTitle')}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 dark:text-slate-400">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5">
            <span className="font-semibold text-slate-900 dark:text-white block mb-1">
              1. {t('sd_proto1')}
            </span>
            {t('sd_proto1Desc')}
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5">
            <span className="font-semibold text-slate-900 dark:text-white block mb-1">
              2. {t('sd_proto2')}
            </span>
            {t('sd_proto2Desc')}
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5">
            <span className="font-semibold text-slate-900 dark:text-white block mb-1">
              3. {t('sd_proto3')}
            </span>
            {t('sd_proto3Desc')}
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  AlertOctagon, PhoneCall, RefreshCw, Shield, AlertTriangle,
  Flame, CheckCircle2, MapPin, Radio, Wrench
} from 'lucide-react';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { getEmergencyData } from '../../services/municipalityService';
import { useLanguage } from '../../context/LanguageContext';

export default function EmergencyMonitoringPage() {
  const { t, tStatus } = useLanguage();
  const [data, setData] = useState({
    criticalNodes: [],
    criticalComplaints: [],
    recentAlerts: [],
    storageStatus: null,
  });
  const [loading, setLoading] = useState(true);

  const fetchEmergencyData = async () => {
    try {
      setLoading(true);
      const res = await getEmergencyData();
      if (res) setData(res);
    } catch (err) {
      console.error('Failed to load emergency data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmergencyData();
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b dark:border-white/10 border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-red-700 flex items-center justify-center text-white shadow-md animate-pulse">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white font-display">
                {t('em_title')}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t('em_subtitle')}
              </p>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchEmergencyData}
          isLoading={loading}
          icon={<RefreshCw className="w-4 h-4" />}
        >
          {t('em_refreshFeed')}
        </Button>
      </div>

      {/* Priority Matrix Top Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-rose-500/10 border border-rose-500/30 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
            <span className="text-xs font-bold uppercase tracking-wider">{t('md_criticalSystems')}</span>
            <AlertOctagon className="w-5 h-5 animate-bounce" />
          </div>
          <p className="text-3xl font-black text-rose-600 dark:text-rose-400 font-display mt-2">
            {data.criticalNodes?.filter(n => n.status === 'Critical').length || 2}
          </p>
          <p className="text-[11px] text-rose-600 dark:text-rose-300 font-semibold mt-1">
            Drainage level &ge; 90%
          </p>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/30 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
            <span className="text-xs font-bold uppercase tracking-wider">{t('em_highRiskWarnings')}</span>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <p className="text-3xl font-black text-amber-600 dark:text-amber-400 font-display mt-2">
            {data.criticalNodes?.filter(n => n.status === 'Warning').length || 5}
          </p>
          <p className="text-[11px] text-amber-600 dark:text-amber-300 font-semibold mt-1">
            {t('em_approachingThreshold')}
          </p>
        </div>

        <div className="bg-sky-500/10 border border-sky-500/30 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-sky-600 dark:text-sky-400">
            <span className="text-xs font-bold uppercase tracking-wider">{t('em_urgentComplaints')}</span>
            <Flame className="w-5 h-5" />
          </div>
          <p className="text-3xl font-black text-sky-600 dark:text-sky-400 font-display mt-2">
            {data.criticalComplaints?.length || 1}
          </p>
          <p className="text-[11px] text-sky-600 dark:text-sky-300 font-semibold mt-1">
            {t('em_sosReports')}
          </p>
        </div>

        <div className="bg-emerald-500/10 border border-emerald-500/30 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <span className="text-xs font-bold uppercase tracking-wider">{t('em_storageCapacity')}</span>
            <Shield className="w-5 h-5" />
          </div>
          <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-display mt-2">
            {data.storageStatus?.fillPercentage || 90.3}%
          </p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-300 font-semibold mt-1">
            {t('em_autoDiverterOpen')}
          </p>
        </div>

      </div>

      {/* ── PRIORITY SORTED CRITICAL NODE FEED ── */}
      <div className="space-y-4">
        <p className="text-xs font-black tracking-widest uppercase text-slate-400 dark:text-slate-500">
          {t('em_activeHazards')}
        </p>

        {data.criticalNodes?.map((node) => (
          <div
            key={node.systemId}
            className={`dark:bg-[#0F172A] bg-white border rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 ${
              node.status === 'Critical'
                ? 'border-rose-500/50 bg-rose-500/5'
                : 'border-amber-500/40 bg-amber-500/5'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0 ${
                node.status === 'Critical' ? 'bg-rose-500' : 'bg-amber-500'
              }`}>
                {node.status === 'Critical' ? <AlertOctagon className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-sm text-slate-900 dark:text-white">{node.systemId}</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">— {node.location}</span>
                  <Badge variant={node.status === 'Critical' ? 'danger' : 'warning'} size="sm">
                    {tStatus(node.status).toUpperCase()}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {t('em_waterDepthLevel')}: <strong className="font-mono text-slate-900 dark:text-white">{node.waterLevel}%</strong> | {t('em_solenoidDiverter')}: <strong className="text-emerald-500">{t('status_open').toUpperCase()}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a href="tel:112" className="flex-1 md:flex-none">
                <Button variant="danger" size="sm" icon={<PhoneCall className="w-4 h-4" />}>
                  {t('em_call112')}
                </Button>
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Emergency Contact Information */}
      <div className="dark:bg-[#0F172A] bg-white border dark:border-white/10 border-slate-200 shadow-md rounded-2xl p-6 space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <PhoneCall className="w-4 h-4 text-rose-500" /> {t('em_helplineContacts')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border dark:border-white/5 border-slate-200/60">
            <p className="text-slate-400 uppercase text-[10px]">{t('em_nationalHelpline')}</p>
            <p className="font-mono font-black text-slate-900 dark:text-white text-base mt-0.5">112 / 1070</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border dark:border-white/5 border-slate-200/60">
            <p className="text-slate-400 uppercase text-[10px]">{t('sos_contact_control_room')}</p>
            <p className="font-mono font-black text-slate-900 dark:text-white text-base mt-0.5">+91 674 243 0011</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border dark:border-white/5 border-slate-200/60">
            <p className="text-slate-400 uppercase text-[10px]">{t('em_iotDispatch')}</p>
            <p className="font-mono font-black text-slate-900 dark:text-white text-base mt-0.5">+91 98765 99887</p>
          </div>
        </div>
      </div>

    </motion.div>
  );
}

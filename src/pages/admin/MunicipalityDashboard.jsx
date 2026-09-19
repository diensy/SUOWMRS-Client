import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield, CheckCircle2, AlertTriangle, AlertOctagon, WifiOff,
  Droplets, Recycle, Wrench, MessageSquareWarning, ArrowUpRight,
  MapPin, Layers, RefreshCw, Activity, UserCheck, Building2
} from 'lucide-react';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { getMunicipalityOverview } from '../../services/municipalityService';
import { useLanguage } from '../../context/LanguageContext';

export default function MunicipalityDashboard() {
  const { t } = useLanguage();
  const [stats, setStats] = useState({
    totalSystems: 128,
    systemsOnline: 121,
    warningSystems: 5,
    criticalSystems: 2,
    offlineSystems: 0,
    totalWaterCollectedLiters: 4250000,
    totalWaterReusedLiters: 3820000,
    activeWorkOrders: 2,
    activeCitizenComplaints: 4,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await getMunicipalityOverview();
      if (data) setStats(data);
    } catch (err) {
      console.error('Failed to load municipality stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b dark:border-white/10 border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0F4C5C] to-[#0EA5E9] flex items-center justify-center text-white shadow-md">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white font-display">
                {t('md_title')}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t('md_subtitle')}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchStats}
            isLoading={loading}
            icon={<RefreshCw className="w-4 h-4" />}
          >
            {t('md_refreshGrid')}
          </Button>
          <Link to="/admin/approvals">
            <Button
              variant="outline"
              size="sm"
              className="border-purple-300 dark:border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/10"
              icon={<Building2 className="w-4 h-4" />}
            >
              {t('md_manageAdmin')}
            </Button>
          </Link>
          <Link to="/admin/emergency">
            <Button variant="danger" size="sm" icon={<AlertOctagon className="w-4 h-4" />}>
              {t('emergencyMonitoring')}
            </Button>
          </Link>
        </div>
      </div>

      {/* ── TOP METRICS ROW (Target Prompt Specs) ── */}
      <div>
        <p className="text-xs font-black tracking-widest uppercase text-slate-400 dark:text-slate-500 mb-3">
          {t('md_networkOverview')}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Total Systems */}
          <div className="dark:bg-[#0F172A] bg-white border dark:border-white/10 border-slate-200/90 shadow-md rounded-2xl p-5 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{t('md_totalSystems')}</span>
              <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-500">
                <Layers className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-slate-900 dark:text-white font-display">
                {stats.totalSystems}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-2">{t('md_gridNodes')}</span>
            </div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-2 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 100% Instrumented Coverage
            </p>
          </div>

          {/* Systems Online */}
          <div className="dark:bg-[#0F172A] bg-white border dark:border-white/10 border-slate-200/90 shadow-md rounded-2xl p-5 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{t('md_systemsOnline')}</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-display">
                {stats.systemsOnline}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-2">{t('md_operational')}</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-2">
              94.5% Active Connectivity
            </p>
          </div>

          {/* Warning Systems */}
          <div className="dark:bg-[#0F172A] bg-white border dark:border-white/10 border-slate-200/90 shadow-md rounded-2xl p-5 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{t('md_warningSystems')}</span>
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-amber-500 font-display">
                {stats.warningSystems}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-2">{t('md_elevatedLevel')}</span>
            </div>
            <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-2">
              {t('md_requiresMonitoring')}
            </p>
          </div>

          {/* Critical Systems */}
          <div className="dark:bg-[#0F172A] bg-white border dark:border-white/10 border-slate-200/90 shadow-md rounded-2xl p-5 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{t('md_criticalSystems')}</span>
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
                <AlertOctagon className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-rose-600 dark:text-rose-400 font-display">
                {stats.criticalSystems}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-2">{t('md_actionNeeded')}</span>
            </div>
            <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold mt-2">
              {t('md_autoDiverterActive')}
            </p>
          </div>

        </div>
      </div>

      {/* ── ADDITIONAL METRICS ROW ── */}
      <div>
        <p className="text-xs font-black tracking-widest uppercase text-slate-400 dark:text-slate-500 mb-3">
          {t('md_conservationDispatch')}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="dark:bg-white/5 bg-white border dark:border-white/10 border-slate-200 shadow-sm rounded-2xl p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-500 flex-shrink-0">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">{t('md_totalCollected')}</p>
              <p className="text-lg font-black text-slate-900 dark:text-white font-display mt-0.5">
                {(stats.totalWaterCollectedLiters / 1000000).toFixed(2)}M {t('md_litres')}
              </p>
            </div>
          </div>

          <div className="dark:bg-white/5 bg-white border dark:border-white/10 border-slate-200 shadow-sm rounded-2xl p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 flex-shrink-0">
              <Recycle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">{t('md_totalReused')}</p>
              <p className="text-lg font-black text-slate-900 dark:text-white font-display mt-0.5">
                {(stats.totalWaterReusedLiters / 1000000).toFixed(2)}M {t('md_litres')}
              </p>
            </div>
          </div>

          <div className="dark:bg-white/5 bg-white border dark:border-white/10 border-slate-200 shadow-sm rounded-2xl p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-500 flex-shrink-0">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">{t('md_activeWorkOrders')}</p>
              <p className="text-lg font-black text-slate-900 dark:text-white font-display mt-0.5">
                {stats.activeWorkOrders} Tickets Active
              </p>
            </div>
          </div>

          <div className="dark:bg-white/5 bg-white border dark:border-white/10 border-slate-200 shadow-sm rounded-2xl p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 flex-shrink-0">
              <MessageSquareWarning className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">{t('md_activeComplaints')}</p>
              <p className="text-lg font-black text-slate-900 dark:text-white font-display mt-0.5">
                {stats.activeCitizenComplaints} Citizen Reports
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* ── QUICK NAVIGATION GRID ── */}
      <div>
        <p className="text-xs font-black tracking-widest uppercase text-slate-400 dark:text-slate-500 mb-3">
          {t('md_quickNav')}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          <Link to="/admin/systems" className="group">
            <div className="dark:bg-[#0F172A] bg-white border dark:border-white/10 border-slate-200 shadow-sm rounded-2xl p-5 hover:border-[#0EA5E9] transition-all duration-200">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-[#0EA5E9] transition-colors" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('md_nav1')}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {t('md_nav1Desc')}
              </p>
            </div>
          </Link>

          <Link to="/admin/map" className="group">
            <div className="dark:bg-[#0F172A] bg-white border dark:border-white/10 border-slate-200 shadow-sm rounded-2xl p-5 hover:border-emerald-500 transition-all duration-200">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('md_nav2')}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {t('md_nav2Desc')}
              </p>
            </div>
          </Link>

          <Link to="/admin/complaints" className="group">
            <div className="dark:bg-[#0F172A] bg-white border dark:border-white/10 border-slate-200 shadow-sm rounded-2xl p-5 hover:border-amber-500 transition-all duration-200">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <MessageSquareWarning className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-amber-500 transition-colors" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('md_nav3')}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {t('md_nav3Desc')}
              </p>
            </div>
          </Link>

          <Link to="/admin/approvals" className="group">
            <div className="dark:bg-[#0F172A] bg-white border dark:border-white/10 border-slate-200 shadow-sm rounded-2xl p-5 hover:border-indigo-500 transition-all duration-200">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('userTechApprovals')}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {t('md_nav4Desc')}
              </p>
            </div>
          </Link>

          <Link to="/system-health" className="group">
            <div className="dark:bg-[#0F172A] bg-white border dark:border-white/10 border-slate-200 shadow-sm rounded-2xl p-5 hover:border-teal-500 transition-all duration-200">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-500 flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-teal-500 transition-colors" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('md_nav5')}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {t('md_nav5Desc')}
              </p>
            </div>
          </Link>

          <Link to="/admin/emergency" className="group">
            <div className="dark:bg-[#0F172A] bg-white border dark:border-white/10 border-slate-200 shadow-sm rounded-2xl p-5 hover:border-rose-500 transition-all duration-200">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                  <AlertOctagon className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-rose-500 transition-colors" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('md_nav6')}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {t('md_nav6Desc')}
              </p>
            </div>
          </Link>

        </div>
      </div>

    </motion.div>
  );
}

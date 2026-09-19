import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Brain, ArrowLeft, CheckCircle2, AlertTriangle, AlertOctagon,
  ShieldCheck, Activity, Filter, RefreshCw, Layers, Clock, HelpCircle
} from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { useLanguage } from '../../context/LanguageContext';
import { getAccuracyMetrics, getPredictionHistory } from '../../services/predictionService';

export default function PredictionHistoryPage() {
  const { t, tStatus, localizeNumber, locale } = useLanguage();
  const [metrics, setMetrics] = useState(null);
  const [historyData, setHistoryData] = useState({ records: [], total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [riskFilter, setRiskFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [accRes, histRes] = await Promise.all([
        getAccuracyMetrics(),
        getPredictionHistory({ page, limit: 10, riskLevel: riskFilter, status: statusFilter }),
      ]);

      if (accRes) setMetrics(accRes);
      if (histRes) setHistoryData(histRes);
    } catch (err) {
      console.error('Failed to load prediction history & accuracy data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, riskFilter, statusFilter]);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Link to="/ai-prediction" className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              {t('ph_backToAi')}
            </Link>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-md">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white font-display">
                {t('ph_title')}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t('ph_subtitle')}
              </p>
            </div>
          </div>
        </div>

        <Button variant="outline" size="sm" onClick={fetchData} icon={<RefreshCw className="w-3.5 h-3.5" />}>
          {t('ph_refreshAudit')}
        </Button>
      </div>

      {/* Accuracy & Machine Learning Metrics (Empirically Calculated) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        
        <Card className="p-4 border-slate-200 dark:border-white/10">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('ph_modelAccuracy')}</span>
          <div className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {metrics?.metrics?.accuracyPct || 0}%
          </div>
          <p className="text-[10px] text-slate-400 mt-1">(TP + TN) / Total</p>
        </Card>

        <Card className="p-4 border-slate-200 dark:border-white/10">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('ph_precision')}</span>
          <div className="mt-2 text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">
            {metrics?.metrics?.precisionPct || 0}%
          </div>
          <p className="text-[10px] text-slate-400 mt-1">TP / (TP + FP)</p>
        </Card>

        <Card className="p-4 border-slate-200 dark:border-white/10">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('ph_recall')}</span>
          <div className="mt-2 text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
            {metrics?.metrics?.recallPct || 0}%
          </div>
          <p className="text-[10px] text-slate-400 mt-1">TP / (TP + FN)</p>
        </Card>

        <Card className="p-4 border-slate-200 dark:border-white/10">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('ph_fpr')}</span>
          <div className="mt-2 text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
            {metrics?.metrics?.falsePositiveRatePct || 0}%
          </div>
          <p className="text-[10px] text-slate-400 mt-1">FP / (FP + TN)</p>
        </Card>

        <Card className="p-4 border-slate-200 dark:border-white/10">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('ph_fnr')}</span>
          <div className="mt-2 text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
            {metrics?.metrics?.falseNegativeRatePct || 0}%
          </div>
          <p className="text-[10px] text-slate-400 mt-1">FN / (FN + TP)</p>
        </Card>

        <Card className="p-4 border-slate-200 dark:border-white/10">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('ph_f1')}</span>
          <div className="mt-2 text-2xl font-black text-purple-600 dark:text-purple-400 font-mono">
            {metrics?.metrics?.f1ScorePct || 0}%
          </div>
          <p className="text-[10px] text-slate-400 mt-1">{t('ph_harmonicMean')}</p>
        </Card>

      </div>

      {/* Confusion Matrix Visualizer */}
      <Card className="p-5 border-slate-200 dark:border-white/10">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-500" />
          {t('ph_confusionMatrix')} ({localizeNumber(metrics?.totalEvaluations || 0)} {t('ph_verifiedEvents')})
        </h2>

        <div className="grid grid-cols-2 gap-3 max-w-xl">
          <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold block">
              {t('ph_tp')} (TP)
            </span>
            <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300 font-mono">
              {metrics?.confusionMatrix?.truePositives || 0}
            </span>
            <p className="text-[11px] text-slate-500 mt-1">{t('ph_tpDesc')}</p>
          </div>

          <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5">
            <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold block">
              {t('ph_fp')} (FP)
            </span>
            <span className="text-2xl font-black text-amber-700 dark:text-amber-300 font-mono">
              {metrics?.confusionMatrix?.falsePositives || 0}
            </span>
            <p className="text-[11px] text-slate-500 mt-1">{t('ph_fpDesc')}</p>
          </div>

          <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/5">
            <span className="text-xs text-rose-600 dark:text-rose-400 font-semibold block">
              {t('ph_fn')} (FN)
            </span>
            <span className="text-2xl font-black text-rose-700 dark:text-rose-300 font-mono">
              {metrics?.confusionMatrix?.falseNegatives || 0}
            </span>
            <p className="text-[11px] text-slate-500 mt-1">{t('ph_fnDesc')}</p>
          </div>

          <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/5">
            <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold block">
              {t('ph_tn')} (TN)
            </span>
            <span className="text-2xl font-black text-blue-700 dark:text-blue-300 font-mono">
              {metrics?.confusionMatrix?.trueNegatives || 0}
            </span>
            <p className="text-[11px] text-slate-500 mt-1">{t('ph_tnDesc')}</p>
          </div>
        </div>
      </Card>

      {/* Historical Predictions Audit Log Table */}
      <Card className="p-5 border-slate-200 dark:border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              {t('ph_records')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t('ph_recordsDesc')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
            >
              <option value="All" className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white">{t('ph_allClassifications')}</option>
              <option value="True Positive" className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white">{t('status_true_positive')}</option>
              <option value="True Negative" className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white">{t('status_true_negative')}</option>
              <option value="False Positive" className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white">{t('status_false_positive')}</option>
              <option value="False Negative" className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white">{t('status_false_negative')}</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10 text-slate-400 font-medium uppercase tracking-wider">
                <th className="py-2.5 px-3">{t('ph_predictionId')}</th>
                <th className="py-2.5 px-3">{t('ph_timestamp')}</th>
                <th className="py-2.5 px-3">{t('ph_wardLocation')}</th>
                <th className="py-2.5 px-3">{t('ph_predictedRisk')}</th>
                <th className="py-2.5 px-3">DSI</th>
                <th className="py-2.5 px-3">{t('ph_actualOutcome')}</th>
                <th className="py-2.5 px-3">{t('ph_classification')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {historyData.records.map((r) => (
                <tr key={r.predictionId} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                  <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">
                    {r.predictionId}
                  </td>
                  <td className="py-3 px-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {new Date(r.timestamp).toLocaleString(locale, { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td className="py-3 px-3 text-slate-800 dark:text-slate-200 font-medium">
                    {r.ward}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono ${
                      r.floodProbability >= 80 ? 'text-rose-500 bg-rose-500/10' :
                      r.floodProbability >= 60 ? 'text-orange-500 bg-orange-500/10' :
                      r.floodProbability >= 40 ? 'text-amber-500 bg-amber-500/10' : 'text-emerald-500 bg-emerald-500/10'
                    }`}>
                      {r.floodProbability}% ({tStatus(r.riskLevel)})
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-purple-600 dark:text-purple-400">
                    {r.drainageSaturationIndex}%
                  </td>
                  <td className="py-3 px-3 text-slate-800 dark:text-slate-200">
                    {r.actualOutcome}
                  </td>
                  <td className="py-3 px-3">
                    <Badge variant={
                      r.classification === 'True Positive' ? 'success' :
                      r.classification === 'True Negative' ? 'blue' :
                      r.classification === 'False Positive' ? 'amber' : 'danger'
                    } className="text-[10px]">
                      {tStatus(r.classification)}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {t('page')} {localizeNumber(historyData.page)} {t('of')} {localizeNumber(historyData.totalPages || 1)} ({localizeNumber(historyData.total)} {t('ph_totalAudits')})
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              {t('previous')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= historyData.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              {t('next')}
            </Button>
          </div>
        </div>

      </Card>

    </motion.div>
  );
}

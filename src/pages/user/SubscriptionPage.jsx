import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheck, RefreshCw, CheckCircle2, ArrowLeft,
  AlertCircle, Sparkles, Check, X, Shield, Lock
} from 'lucide-react';
import { fetchActiveSubscription, cancelSubscription } from '../../services/paymentService';
import { API_BASE_URL } from '../../config/apiConfig';
import { useLanguage } from '../../context/LanguageContext';

const API_URL = API_BASE_URL;
const fmtDate = (d, locale = 'en-IN') => d ? new Date(d).toLocaleDateString(locale, { day: '2-digit', month: 'long', year: 'numeric' }) : '—';
const daysLeft = (d) => { if (!d) return null; return Math.max(0, Math.ceil((new Date(d) - new Date()) / 86400000)); };

export default function SubscriptionPage() {
  const navigate = useNavigate();
  const { t, tStatus, locale } = useLanguage();
  const [plans, setPlans] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('suowmrs-token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const [plansRes, sub] = await Promise.allSettled([
        fetch(`${API_URL}/admin/plans`, { headers }).then(r => r.json()),
        fetchActiveSubscription().catch(() => null),
      ]);
      const allPlans = plansRes.status === 'fulfilled' ? (plansRes.value.plans || []) : [];
      setPlans(allPlans.filter(p => p.isRecurring));
      setSubscription(sub.status === 'fulfilled' ? sub.value : null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await cancelSubscription();
      setConfirmCancel(false);
      await load();
    } catch (e) {
      alert(e.message);
    } finally {
      setCancelling(false);
    }
  };

  const isActive = (key) => subscription?.plan === key && ['active', 'trialing'].includes(subscription?.status);
  const days = daysLeft(subscription?.currentPeriodEnd);
  const amcActive = subscription?.status === 'active';

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b dark:border-white/10 border-slate-200">
        <div>
          <button
            onClick={() => navigate('/payments')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('sub_backToPayments')}</span>
          </button>
          <h1 className="text-xl sm:text-2xl font-black font-display tracking-tight text-slate-900 dark:text-white">
            {t('sub_title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {t('sub_subtitle')}
          </p>
        </div>
      </div>

      {/* Active Subscription Banner */}
      {subscription && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl border p-5 sm:p-6 transition-all shadow-sm ${
            amcActive
              ? 'dark:border-emerald-500/30 border-emerald-200 dark:bg-emerald-950/20 bg-emerald-50/70'
              : 'dark:border-amber-500/30 border-amber-200 dark:bg-amber-950/20 bg-amber-50/70'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  amcActive
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${amcActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                  {amcActive ? t('sub_activeSubscription') : tStatus(subscription.status).toUpperCase()}
                </span>
                {subscription.autoPayEnabled && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/60 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                    {t('sub_autoPayEnabled')}
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {subscription.planLabel}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('sub_coverageThrough')} <strong className="text-slate-700 dark:text-slate-300">{fmtDate(subscription.currentPeriodEnd, locale)}</strong>
                {days !== null && (
                  <span className={days < 30 ? ' text-rose-500 font-semibold' : ' text-emerald-600 dark:text-emerald-400 font-semibold'}>
                    {' '}· {t('sub_daysLeft', { days })}
                  </span>
                )}
              </p>
            </div>

            <div className="flex-shrink-0">
              {!confirmCancel ? (
                <button
                  onClick={() => setConfirmCancel(true)}
                  className="px-3.5 py-2 text-xs font-bold rounded-xl border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition"
                >
                  {t('sub_cancelPlan')}
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    disabled={cancelling}
                    onClick={handleCancel}
                    className="px-3.5 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition disabled:opacity-60"
                  >
                    {cancelling ? t('sub_cancelling') : t('sub_confirmCancellation')}
                  </button>
                  <button
                    onClick={() => setConfirmCancel(false)}
                    className="px-3.5 py-2 text-xs font-bold rounded-xl border dark:border-white/10 border-slate-200 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition"
                  >
                    {t('sub_keep')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Plans Grid */}
      {loading ? (
        <div className="grid md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-80 rounded-2xl dark:bg-white/[0.04] bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-5">
          {plans.map((plan) => {
            const active = isActive(plan.key);
            const isStandard = plan.key === 'StandardAMC';

            return (
              <motion.div
                key={plan.key}
                whileHover={{ y: -2 }}
                className={`relative flex flex-col rounded-2xl border transition-all shadow-sm ${
                  active
                    ? 'dark:border-emerald-500/50 border-emerald-400 dark:bg-emerald-950/20 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                    : isStandard
                    ? 'dark:border-emerald-500/30 border-slate-300 dark:bg-[#0F172A] bg-white'
                    : 'dark:border-white/10 border-slate-200 dark:bg-[#0F172A] bg-white'
                }`}
              >
                {/* Popular badge */}
                {isStandard && !active && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                    {t('sub_mostPopular')}
                  </div>
                )}

                {/* Card Header */}
                <div className="p-5 border-b dark:border-white/10 border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/50 dark:border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    {active && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" />
                        {t('sub_currentPlan')}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {plan.label}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                      {plan.description}
                    </p>
                  </div>

                  <div className="pt-2">
                    <span className="text-2xl sm:text-3xl font-black font-display text-slate-900 dark:text-white">
                      {plan.amountDisplay}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold ml-1">
                      /{tStatus(plan.interval)}
                    </span>
                  </div>
                </div>

                {/* Features list */}
                <div className="p-5 flex-1 space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    {t('sub_includedBenefits')}
                  </p>
                  {plan.features?.map((f, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                      <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>

                {/* Card CTA */}
                <div className="p-5 pt-0">
                  {active ? (
                    <div className="w-full py-2.5 text-center text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                      {t('sub_renews')} {fmtDate(subscription?.currentPeriodEnd, locale)}
                    </div>
                  ) : (
                    <button
                      onClick={() => navigate('/payments/checkout', { state: { planKey: plan.key } })}
                      className={`w-full py-2.5 rounded-xl text-xs sm:text-sm font-bold transition shadow-sm ${
                        isStandard
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100'
                      }`}
                    >
                      {subscription ? t('sub_switchPlan') : t('sub_subscribeNow')}
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Auto-Pay & Peace of Mind Info */}
      <div className="p-5 rounded-2xl border dark:border-white/10 border-slate-200 dark:bg-[#0F172A] bg-white shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
          <RefreshCw className="w-4 h-4 text-emerald-500" />
          <span>{t('sub_policyTitle')}</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          {t('sub_policyDesc')}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {[
            t('sub_perk1'),
            t('sub_perk2'),
            t('sub_perk3'),
            t('sub_perk4'),
          ].map((item) => (
            <div
              key={item}
              className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-white/[0.03] border dark:border-white/5 border-slate-200/60 text-[11px] text-slate-600 dark:text-slate-300"
            >
              <Check className="w-3 h-3 text-emerald-500 flex-shrink-0" />
              <span className="truncate">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

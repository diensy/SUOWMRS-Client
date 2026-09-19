import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheck, CreditCard, FileText, Wrench, Siren, Droplets,
  Activity, ArrowRight, CheckCircle2, Clock, AlertCircle,
  RefreshCw, ChevronRight, Check,
  BellRing, Cpu
} from 'lucide-react';
import { fetchPaymentHistory, fetchCustomerSummary, toggleAutoPay } from '../../services/paymentService';
import { getCurrentUser } from '../../services/authService';
import { API_BASE_URL } from '../../config/apiConfig';
import { useLanguage } from '../../context/LanguageContext';

const API_URL = API_BASE_URL;

const formatAmount = (paise) =>
  `₹${(paise / 100).toLocaleString('en-IN')}`;

const formatDate = (d, locale = 'en-IN') =>
  d ? new Date(d).toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const daysLeft = (endDate) => {
  if (!endDate) return null;
  const diff = new Date(endDate) - new Date();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

// Map plan icon / key to modern Lucide icon
const getPlanIcon = (key = '', category = '') => {
  const k = key.toLowerCase();
  if (k.includes('emergency')) return Siren;
  if (k.includes('filter') || k.includes('water')) return Droplets;
  if (k.includes('smart') || k.includes('monitor')) return Activity;
  if (k.includes('amc') || category === 'amc') return ShieldCheck;
  if (k.includes('sensor')) return Cpu;
  return Wrench;
};

export default function PaymentDashboardPage() {
  const navigate = useNavigate();
  const { t, tStatus, locale } = useLanguage();
  const fmtD = (d) => formatDate(d, locale);
  // Use a ref so the object reference never changes between renders (prevents infinite loop)
  const currentUserRef = useRef(getCurrentUser());
  const currentUser = currentUserRef.current;

  const [plans, setPlans] = useState([]);
  const [summary, setSummary] = useState(null);
  const [recentPayments, setRecentPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingAutoPay, setTogglingAutoPay] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('suowmrs-token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [plansRes, summaryRes, paymentsRes] = await Promise.allSettled([
        fetch(`${API_URL}/admin/plans`, { headers }).then(r => r.json()),
        fetchCustomerSummary().catch(() => null),
        fetchPaymentHistory().catch(() => []),
      ]);

      if (plansRes.status === 'fulfilled') setPlans(plansRes.value.plans || []);
      if (summaryRes.status === 'fulfilled' && summaryRes.value) {
        setSummary(summaryRes.value);
      } else {
        // Fallback default structure matching user prompt specs
        const hex = currentUser?.id?.slice(-4).toUpperCase() || '1025';
        setSummary({
          customerId: `SUO${hex}`,
          houseId: currentUser?.wardArea || 'H-025',
          customerName: currentUser?.fullName || 'Registered User',
          systemStatus: 'Active',
          plan: 'Standard AMC',
          planKey: 'StandardAMC',
          amount: 2499,
          amountDisplay: '₹2,499',
          paymentStatus: 'Paid',
          paymentDate: '2026-09-14',
          nextDueDate: '2027-09-14',
          transactionId: 'TXN_GATEWAY_8921',
          amcStatus: 'Active',
          lastMaintenance: '2026-08-10',
          autoPayEnabled: true,
          paymentMethods: ['Card'],
        });
      }
      if (paymentsRes.status === 'fulfilled') setRecentPayments((paymentsRes.value || []).slice(0, 4));
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // stable ref — no deps needed; prevents infinite re-fetch loop

  useEffect(() => { load(); }, [load]);

  const handleToggleAutoPay = async () => {
    setTogglingAutoPay(true);
    try {
      const res = await toggleAutoPay();
      setSummary(prev => prev ? { ...prev, autoPayEnabled: res.autoPayEnabled } : prev);
    } catch (err) {
      alert(err.message);
    } finally {
      setTogglingAutoPay(false);
    }
  };

  const filtered = activeTab === 'all' ? plans
    : activeTab === 'recurring' ? plans.filter(p => p.isRecurring)
    : plans.filter(p => !p.isRecurring);

  const amcActive = summary?.amcStatus === 'Active' || summary?.subscription?.status === 'active';
  const remainingDays = daysLeft(summary?.nextDueDate);

  return (
    <div className="w-full space-y-6">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b dark:border-white/10 border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CreditCard className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black font-display tracking-tight text-slate-900 dark:text-white">
              {t('pd_title')}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {t('pd_subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => navigate('/payments/invoices')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border dark:border-white/10 border-slate-200 dark:bg-white/[0.03] bg-white text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-white/[0.06] transition shadow-sm"
          >
            <FileText className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>{t('pd_downloadInvoice')}</span>
          </button>
        </div>
      </div>

      {/* ── Maintenance Due Notification Banner (Requirement 2) ── */}
      {remainingDays !== null && remainingDays <= 45 && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
        >
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex-shrink-0">
              <BellRing className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                {t('pd_maintenanceDue')}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                {t('pd_maintenanceDueDesc', { date: fmtD(summary?.nextDueDate), days: remainingDays })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => navigate('/payments/checkout', { state: { planKey: summary?.planKey || 'StandardAMC' } })}
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-sm"
            >
              {t('pd_renewProtection')}
            </button>
            <button
              onClick={() => navigate('/work-orders')}
              className="px-3 py-1.5 rounded-xl border border-amber-500/30 text-xs font-semibold hover:bg-amber-500/10 transition"
            >
              {t('pd_bookVisit')}
            </button>
          </div>
        </motion.div>
      )}

      {/* ── SECTION 5: MY SUOWMRS Dashboard Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border dark:border-emerald-500/30 border-emerald-200/80 dark:bg-gradient-to-br dark:from-[#0b1720] dark:via-[#0c1e28] dark:to-[#0a141c] bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/50 p-6 sm:p-7 shadow-lg relative overflow-hidden"
      >
        {/* Glow ambient circle */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-6 relative z-10">
          {/* Header row: MY SUOWMRS & System Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b dark:border-white/10 border-slate-200/80">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/25">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                  {t('pd_registeredHousehold')}
                </span>
                <h2 className="text-xl sm:text-2xl font-black font-display text-slate-900 dark:text-white tracking-tight">
                  {t('pd_mySuowmrs')}
                </h2>
              </div>
            </div>

            {/* System Status 🟢 Active */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{t('pd_systemStatus')}: 🟢 {tStatus(summary?.systemStatus || 'Active')}</span>
              </div>
            </div>
          </div>

          {/* Core Info Grid: Customer, AMC Status, Next Payment */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Customer & Identifiers */}
            <div className="p-4 rounded-2xl dark:bg-white/[0.03] bg-white/80 border dark:border-white/10 border-slate-200/80 backdrop-blur-sm space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {t('pd_registeredProfile')}
              </span>
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {summary?.customerName || t('pd_registeredUser')}
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-slate-200 font-bold">
                  {summary?.customerId || 'SUO1025'}
                </span>
                <span>·</span>
                <span className="font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-slate-200 font-bold">
                  {summary?.houseId || 'H-025'}
                </span>
              </div>
            </div>

            {/* AMC Status */}
            <div className="p-4 rounded-2xl dark:bg-white/[0.03] bg-white/80 border dark:border-white/10 border-slate-200/80 backdrop-blur-sm space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {t('pd_amcStatus')}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" />
                  {summary?.plan || 'Standard AMC'}
                </span>
              </div>
              <p className="text-sm font-black text-slate-900 dark:text-white">
                {t('pd_activeUntil')}: {fmtD(summary?.nextDueDate)}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <span>{t('pd_lastMaintenance')}: {fmtD(summary?.lastMaintenance)}</span>
              </p>
            </div>

            {/* Next Payment */}
            <div className="p-4 rounded-2xl dark:bg-white/[0.03] bg-white/80 border dark:border-white/10 border-slate-200/80 backdrop-blur-sm space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {t('pd_nextPayment')}
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  {t('pd_due')}: {fmtD(summary?.nextDueDate)}
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black font-display text-emerald-600 dark:text-emerald-400">
                  {summary?.amountDisplay || '₹2,499'}
                </span>
                <span className="text-xs text-slate-400">/{t('pd_year')}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                <span>{t('pd_paymentMethods')}:</span>
                <strong className="text-slate-700 dark:text-slate-300 font-semibold">
                  {t('co_tabCards')} · Visa · MasterCard · RuPay
                </strong>
              </div>
            </div>
          </div>

          {/* Action Buttons Row (Requirement 5): [PAY NOW] [ENABLE AUTO-PAY] [VIEW INVOICES] [BOOK MAINTENANCE] */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/payments/checkout', { state: { planKey: summary?.planKey || 'StandardAMC' } })}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-xs sm:text-sm font-bold transition shadow-md shadow-emerald-600/20"
            >
              <CreditCard className="w-4 h-4" />
              <span>{t('pd_payNow')}</span>
            </button>

            <button
              onClick={handleToggleAutoPay}
              disabled={togglingAutoPay}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-bold transition shadow-sm ${
                summary?.autoPayEnabled
                  ? 'border-emerald-500/40 dark:bg-emerald-950/30 bg-emerald-50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
                  : 'border-slate-300 dark:border-white/15 dark:bg-white/[0.04] bg-white text-slate-700 dark:text-slate-200 hover:border-emerald-500/40'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${togglingAutoPay ? 'animate-spin' : ''}`} />
              <span>{summary?.autoPayEnabled ? t('pd_autoPayActive') : t('pd_enableAutoPay')}</span>
            </button>

            <button
              onClick={() => navigate('/payments/invoices')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border dark:border-white/10 border-slate-200 dark:bg-white/[0.04] bg-white hover:bg-slate-50 dark:hover:bg-white/[0.08] text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 transition shadow-sm"
            >
              <FileText className="w-4 h-4 text-slate-400" />
              <span>{t('pd_viewInvoices')}</span>
            </button>

            <button
              onClick={() => navigate('/work-orders')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border dark:border-white/10 border-slate-200 dark:bg-white/[0.04] bg-white hover:bg-slate-50 dark:hover:bg-white/[0.08] text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 transition shadow-sm"
            >
              <Wrench className="w-4 h-4 text-slate-400" />
              <span>{t('pd_bookMaintenance')}</span>
            </button>
          </div>
        </div>
      </motion.div>



      {/* ── SECTION 4: Household Maintenance Plan Model Overview ── */}
      <div className="p-4 sm:p-5 rounded-2xl border dark:border-white/10 border-slate-200 dark:bg-[#0F172A] bg-white space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {t('pd_modelTitle')}
          </span>
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
            {t('pd_projectArchitecture')}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center">
          {[
            { step: `1. ${t('pd_step1')}`, desc: t('pd_step1Desc'), fee: '₹5,000' },
            { step: `2. ${t('pd_step2')}`, desc: t('pd_step2Desc'), fee: '₹1,499 – ₹3,999' },
            { step: `3. ${t('pd_step3')}`, desc: t('pd_step3Desc'), fee: '₹99/mo' },
            { step: `4. ${t('pd_step4')}`, desc: t('pd_step4Desc'), fee: '₹500 – ₹2,000' },
            { step: `5. ${t('pd_step5')}`, desc: t('pd_step5Desc'), fee: '₹300 – ₹1,000' },
          ].map((item) => (
            <div key={item.step} className="p-3 rounded-xl border dark:border-white/5 border-slate-100 dark:bg-white/[0.02] bg-slate-50/70 space-y-1">
              <p className="text-xs font-bold text-slate-900 dark:text-white">{item.step}</p>
              <p className="text-[10px] text-slate-400 leading-tight line-clamp-2">{item.desc}</p>
              <p className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 font-mono mt-1">{item.fee}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── SECTION 1: Quick Payment Options Grid ── */}
      <div className="space-y-3">
        <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
          {t('pd_servicesTitle')}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: `🔧 ${t('pd_q1')}`,
              desc: t('pd_q1Desc'),
              icon: ShieldCheck,
              to: '/payments/subscription',
            },
            {
              label: `📱 ${t('pd_q2')}`,
              desc: t('pd_q2Desc'),
              icon: Activity,
              to: '/payments/checkout',
              state: { planKey: 'SmartMonitoring' },
            },
            {
              label: `💧 ${t('pd_q3')}`,
              desc: t('pd_q3Desc'),
              icon: Droplets,
              to: '/payments/checkout',
              state: { planKey: 'FilterReplacement' },
            },
            {
              label: `⚙️ ${t('pd_q4')}`,
              desc: t('pd_q4Desc'),
              icon: Wrench,
              to: '/payments/checkout',
              state: { planKey: 'PumpRepair' },
            },
            {
              label: `🛠️ ${t('pd_q5')}`,
              desc: t('pd_q5Desc'),
              icon: Siren,
              to: '/payments/checkout',
              state: { planKey: 'EmergencyService' },
            },
            {
              label: `📄 ${t('pd_downloadInvoice')}`,
              desc: t('pd_q6Desc'),
              icon: FileText,
              to: '/payments/invoices',
            },
            {
              label: `💳 ${t('inv_makePayment')}`,
              desc: t('pd_q7Desc'),
              icon: CreditCard,
              to: '/payments/checkout',
              state: { planKey: 'StandardAMC' },
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.to, item.state ? { state: item.state } : undefined)}
                className="group flex flex-col items-start p-4 rounded-2xl border dark:border-white/10 border-slate-200 dark:bg-[#0F172A] bg-white hover:border-emerald-500/40 hover:shadow-md transition-all text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/50 dark:border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3 group-hover:scale-105 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                  {item.label}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                  {item.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── SECTION 2 & 3: Detailed Plans & Services with Category Filter ── */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
              {t('pd_catalogTitle')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('pd_catalogSubtitle')}
            </p>
          </div>

          <div className="inline-flex p-1 rounded-xl dark:bg-white/[0.05] bg-slate-100 border dark:border-white/10 border-slate-200 text-xs font-semibold self-start sm:self-auto">
            {[
              { id: 'all', label: t('pd_allPlans') },
              { id: 'recurring', label: t('pd_recurringAmc') },
              { id: 'onetime', label: t('pd_oneTimeServices') },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-2.5">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 rounded-2xl dark:bg-white/[0.04] bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map(plan => {
              const Icon = getPlanIcon(plan.key, plan.category);
              return (
                <motion.div
                  key={plan.key}
                  whileHover={{ y: -1 }}
                  className="group flex flex-col justify-between p-4 rounded-2xl border dark:border-white/10 border-slate-200 dark:bg-[#0F172A] bg-white hover:border-emerald-500/40 hover:shadow-sm transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center flex-shrink-0 text-slate-700 dark:text-slate-300 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/40 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">
                            {plan.label}
                          </p>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            plan.isRecurring
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                              : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10'
                          }`}>
                            {plan.isRecurring ? `🔄 ${t('pd_recurringMandate')}` : `💳 ${t('pd_oneTimePayment')}`}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-base font-black font-display text-emerald-600 dark:text-emerald-400">
                          {plan.amountDisplay}
                        </p>
                        {plan.interval !== 'one-time' && (
                          <span className="text-[11px] text-slate-400">/{tStatus(plan.interval)}</span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {plan.description}
                    </p>

                    {plan.features?.length > 0 && (
                      <div className="pt-2 border-t dark:border-white/5 border-slate-100 space-y-1">
                        {plan.features.slice(0, 3).map((f, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                            <Check className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                            <span className="truncate">{f}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 mt-3 border-t dark:border-white/10 border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      {t('co_tabCards')} · Visa · MasterCard · RuPay
                    </span>
                    <button
                      onClick={() => navigate('/payments/checkout', { state: { planKey: plan.key } })}
                      className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm"
                    >
                      <span>{t('pd_paySelect')}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Recent Transactions ── */}
      {recentPayments.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
              {t('pd_recentTransactions')}
            </h2>
            <button
              onClick={() => navigate('/payments/invoices')}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>{t('pd_viewAllInvoices')}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="rounded-2xl border dark:border-white/10 border-slate-200 dark:bg-[#0F172A] bg-white overflow-hidden shadow-sm divide-y dark:divide-white/[0.06] divide-slate-100">
            {recentPayments.map((p) => {
              const isPaid = p.status === 'paid';
              const isFailed = p.status === 'failed';
              return (
                <div key={p._id} className="flex items-center justify-between gap-3 p-3.5 sm:px-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isPaid
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : isFailed
                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    }`}>
                      {isPaid ? <CheckCircle2 className="w-4 h-4" /> : isFailed ? <AlertCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {p.planLabel}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {fmtD(p.createdAt)} · {p.invoiceNumber || 'INV-SUO-001'} · {t('pd_method')}: {p.paymentMethod?.toUpperCase() || 'GATEWAY'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      {formatAmount(p.amount)}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      isPaid
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                        : isFailed
                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                    }`}>
                      {tStatus(p.status).toUpperCase()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

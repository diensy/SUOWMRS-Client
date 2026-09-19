import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText, ArrowLeft, Search, CheckCircle2, Clock,
  AlertCircle, Download, ExternalLink, RefreshCw,
  CreditCard, ShieldCheck, Siren, Droplets, Activity, Wrench
} from 'lucide-react';
import { fetchPaymentHistory, retryPayment } from '../../services/paymentService';
import { useLanguage } from '../../context/LanguageContext';

const fmt = (paise) => `₹${(paise / 100).toLocaleString('en-IN')}`;
const fmtDate = (d, locale = 'en-IN') => d ? new Date(d).toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const STATUS = {
  paid: {
    key: 'status_paid',
    badgeCls: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    dotCls: 'bg-emerald-500',
  },
  pending: {
    key: 'status_pending',
    badgeCls: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
    dotCls: 'bg-amber-500',
  },
  failed: {
    key: 'status_failed',
    badgeCls: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
    dotCls: 'bg-rose-500',
  },
  refunded: {
    key: 'status_refunded',
    badgeCls: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30',
    dotCls: 'bg-sky-500',
  },
  cancelled: {
    key: 'status_cancelled',
    badgeCls: 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10',
    dotCls: 'bg-slate-400',
  },
};

const getPlanIcon = (key = '') => {
  const k = key.toLowerCase();
  if (k.includes('emergency')) return Siren;
  if (k.includes('filter') || k.includes('water')) return Droplets;
  if (k.includes('smart') || k.includes('monitor')) return Activity;
  if (k.includes('amc')) return ShieldCheck;
  return Wrench;
};

export default function InvoicesPage() {
  const navigate = useNavigate();
  const { t, locale } = useLanguage();
  const [payments, setPayments] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [retrying, setRetrying] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPaymentHistory();
      setPayments(data || []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    let r = payments;
    if (filter !== 'all') r = r.filter(p => p.status === filter);
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(p =>
        p.planLabel?.toLowerCase().includes(q) ||
        p.invoiceNumber?.toLowerCase().includes(q)
      );
    }
    setFiltered(r);
  }, [payments, filter, search]);

  const handleRetry = async (p) => {
    setRetrying(r => ({ ...r, [p._id]: true }));
    try {
      const data = await retryPayment(p._id);
      navigate('/payments/checkout', {
        state: { planKey: p.planType, retrySecret: data.clientSecret }
      });
    } catch (err) {
      alert(err.message);
    } finally {
      setRetrying(r => ({ ...r, [p._id]: false }));
    }
  };

  const totalPaid = payments.filter(p => p.status === 'paid').reduce((a, p) => a + p.amount, 0);

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
            {t('inv_title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {t('inv_subtitle')}
          </p>
        </div>

        <button
          onClick={() => navigate('/payments')}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold transition shadow-sm"
        >
          + {t('inv_makePayment')}
        </button>
      </div>

      {/* KPI Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: t('inv_totalInvoices'),
            value: payments.length,
            icon: FileText,
            color: 'text-slate-900 dark:text-white',
          },
          {
            label: t('inv_totalPaid'),
            value: fmt(totalPaid),
            icon: CreditCard,
            color: 'text-emerald-600 dark:text-emerald-400',
          },
          {
            label: t('inv_successful'),
            value: payments.filter(p => p.status === 'paid').length,
            icon: CheckCircle2,
            color: 'text-emerald-600 dark:text-emerald-400',
          },
          {
            label: t('inv_failedPending'),
            value: payments.filter(p => p.status === 'failed' || p.status === 'pending').length,
            icon: AlertCircle,
            color: 'text-rose-500',
          },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="p-4 rounded-2xl border dark:border-white/10 border-slate-200 dark:bg-[#0F172A] bg-white shadow-sm"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-400">
                  {s.label}
                </span>
                <Icon className="w-4 h-4 text-slate-400" />
              </div>
              <p className={`text-xl sm:text-2xl font-black font-display ${s.color}`}>
                {s.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('inv_searchPh')}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border dark:border-white/10 border-slate-200 dark:bg-[#0F172A] bg-white text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition shadow-sm"
          />
        </div>

        <div className="inline-flex p-1 rounded-xl dark:bg-white/[0.05] bg-slate-100 border dark:border-white/10 border-slate-200 text-xs font-semibold self-start sm:self-auto">
          {['all', 'paid', 'pending', 'failed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                filter === f
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {f === 'all' ? t('all') : t(`status_${f}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices List / Table */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-7 h-7 text-emerald-500 animate-spin" />
          <p className="text-xs sm:text-sm text-slate-400">{t('inv_loading')}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 px-4 text-center rounded-2xl border border-dashed dark:border-white/10 border-slate-200 dark:bg-[#0F172A] bg-white space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/10 flex items-center justify-center mx-auto text-slate-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {payments.length === 0 ? t('inv_noPayments') : t('inv_noMatch')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-0.5">
              {payments.length === 0
                ? t('inv_noPaymentsDesc')
                : t('inv_noMatchDesc')}
            </p>
          </div>
          {payments.length === 0 && (
            <button
              onClick={() => navigate('/payments')}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition"
            >
              {t('inv_exploreServices')}
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border dark:border-white/10 border-slate-200 dark:bg-[#0F172A] bg-white overflow-hidden shadow-sm divide-y dark:divide-white/[0.06] divide-slate-100">
          {filtered.map((p) => {
            const sc = STATUS[p.status] || STATUS.pending;
            const Icon = getPlanIcon(p.planType);
            return (
              <motion.div
                key={p._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center flex-shrink-0 text-slate-700 dark:text-slate-300">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        {p.planLabel}
                      </p>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${sc.badgeCls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dotCls}`} />
                        {t(sc.key)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      <span className="font-mono">{p.invoiceNumber}</span> · {fmtDate(p.createdAt, locale)}
                    </p>
                    {p.failureReason && p.status === 'failed' && (
                      <p className="text-[11px] text-rose-500 mt-1 font-medium">
                        {t('error')}: {p.failureReason}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 dark:border-white/10 border-slate-100">
                  <span className="text-sm sm:text-base font-black font-display text-slate-900 dark:text-white">
                    {fmt(p.amount)}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {p.invoiceUrl && (
                      <a
                        href={p.invoiceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border dark:border-white/10 border-slate-200 dark:text-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-white/10 transition shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{t('inv_invoice')}</span>
                      </a>
                    )}
                    {p.receiptUrl && (
                      <a
                        href={p.receiptUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border dark:border-white/10 border-slate-200 dark:text-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-white/10 transition shadow-sm"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>{t('inv_receipt')}</span>
                      </a>
                    )}
                    {p.status === 'failed' && (
                      <button
                        disabled={retrying[p._id]}
                        onClick={() => handleRetry(p)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-xs font-bold transition disabled:opacity-60"
                      >
                        {retrying[p._id] ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : t('retry')}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BellRing, CheckCheck, RefreshCw, ChevronLeft, ChevronRight,
  AlertTriangle, AlertOctagon, Info, Zap, Circle, Filter, Search
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { getAlerts, markAllAlertsRead, markAlertRead, getUnreadCount } from '../../services/alertService';
import VoiceSpeakerButton from '../../components/common/VoiceSpeakerButton';

const SEVERITY_CONFIG = {
  normal:   { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', dot: 'bg-emerald-500', icon: Info,          label: 'Normal'   },
  warning:  { color: 'text-amber-600 dark:text-amber-400',    bg: 'bg-amber-500/10 border-amber-500/20',   dot: 'bg-amber-500',  icon: AlertTriangle,   label: 'Warning'  },
  danger:   { color: 'text-rose-600 dark:text-rose-400',      bg: 'bg-rose-500/10 border-rose-500/20',     dot: 'bg-rose-500',   icon: AlertOctagon,    label: 'High Risk' },
  critical: { color: 'text-fuchsia-600 dark:text-fuchsia-400',bg: 'bg-fuchsia-500/10 border-fuchsia-500/20',dot: 'bg-fuchsia-500',icon: Zap,             label: 'Critical' },
};

function AlertCard({ alert, onRead }) {
  const { t, formatAlert } = useLanguage();
  const cfg = SEVERITY_CONFIG[alert.type] || SEVERITY_CONFIG.normal;
  const statusLabel = t(`status_${alert.type}`) || cfg.label;
  const Icon = cfg.icon;
  const isUnread = !alert.isRead;
  const timeAgo = (() => {
    const diff = Date.now() - new Date(alert.createdAt).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return t('justNow');
    if (m < 60) return t('minutesAgo').replace('{m}', m);
    const h = Math.floor(m / 60);
    if (h < 24) return t('hoursAgo').replace('{h}', h);
    const d = Math.floor(h / 24);
    return t('daysAgo').replace('{d}', d);
  })();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12 }}
      className={`relative flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 cursor-pointer group
        ${isUnread
          ? `${cfg.bg} shadow-sm`
          : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.06]'
        }`}
      onClick={() => isUnread && onRead(alert._id)}
    >
      {/* Unread dot */}
      {isUnread && (
        <span className={`absolute top-4 right-4 w-2 h-2 rounded-full ${cfg.dot} shadow-lg`} />
      )}
      {/* Icon */}
      <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center
        ${isUnread ? 'bg-white/60 dark:bg-black/30' : 'bg-slate-100 dark:bg-white/[0.04]'} shadow-sm`}>
        <Icon className={`w-4 h-4 ${isUnread ? cfg.color : 'text-slate-400 dark:text-slate-500'}`} />
      </div>
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <span className={`text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full border
            ${isUnread ? cfg.bg + ' ' + cfg.color : 'bg-slate-100 dark:bg-white/[0.06] border-slate-200 dark:border-white/10 text-slate-500'}`}>
            {statusLabel}
          </span>
          <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">{alert.sensorId}</span>
          <div className="ml-auto flex items-center gap-2">
            <VoiceSpeakerButton
              text={formatAlert(alert)}
              size="xs"
              label={t('tts_listen')}
              variant={alert.type === 'critical' || alert.type === 'danger' ? 'emergency' : 'subtle'}
              id={`alert-${alert._id}`}
            />
            <span className="text-[10px] text-slate-400 dark:text-slate-500">{timeAgo}</span>
          </div>
        </div>
        <p className={`text-sm font-medium leading-snug mt-1 ${isUnread ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
          {formatAlert(alert)}
        </p>
        {alert.location && (
          <p className="text-[11px] text-slate-500 dark:text-slate-500 mt-1 flex items-center gap-1">
            <Circle className="w-1.5 h-1.5 fill-current" />
            {alert.location}
          </p>
        )}
      </div>
    </motion.div>
  );
}

export default function AlertsPage() {
  const { t, localizeNumber } = useLanguage();
  const [alerts, setAlerts] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | unread | normal | warning | danger | critical
  const [search, setSearch] = useState('');
  const [marking, setMarking] = useState(false);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAlerts(page, 12);
      setAlerts(data.alerts || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch (e) {
      console.error('Failed to fetch alerts', e);
    } finally {
      setLoading(false);
    }
  }, [page]);

  const fetchUnread = useCallback(async () => {
    try {
      const data = await getUnreadCount();
      setUnreadCount(data.count || 0);
    } catch (e) { /* silent */ }
  }, []);

  useEffect(() => {
    fetchAlerts();
    fetchUnread();
  }, [fetchAlerts, fetchUnread]);

  // Auto-refresh every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAlerts();
      fetchUnread();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchAlerts, fetchUnread]);

  const handleMarkRead = async (id) => {
    try {
      await markAlertRead(id);
      setAlerts(prev => prev.map(a => a._id === id ? { ...a, isRead: true } : a));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) { /* silent */ }
  };

  const handleMarkAllRead = async () => {
    setMarking(true);
    try {
      await markAllAlertsRead();
      setAlerts(prev => prev.map(a => ({ ...a, isRead: true })));
      setUnreadCount(0);
    } catch (e) { /* silent */ }
    setMarking(false);
  };

  // Client-side filter
  const filtered = alerts.filter(a => {
    if (filter === 'unread' && a.isRead) return false;
    if (['normal', 'warning', 'danger', 'critical'].includes(filter) && a.type !== filter) return false;
    if (search && !a.message.toLowerCase().includes(search.toLowerCase()) && !a.location?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const FILTERS = [
    { key: 'all', label: t('all') },
    { key: 'unread', label: `${t('unread')}${unreadCount > 0 ? ` (${unreadCount})` : ''}` },
    { key: 'critical', label: t('status_critical') },
    { key: 'danger', label: t('status_danger') },
    { key: 'warning', label: t('status_warning') },
    { key: 'normal', label: t('status_normal') },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-white/10 flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white font-display flex items-center gap-2">
            <BellRing className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            {t('alerts')}
            {unreadCount > 0 && (
              <span className="text-[11px] font-black bg-rose-500 text-white px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t('alertStreamSubtitle')?.replace('{total}', total) || `Real-time alert stream · ${total} total records · Auto-refreshes every 30s`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchAlerts}
            className="p-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={marking}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-md shadow-sky-900/30 disabled:opacity-60"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              {t('markAllRead')}
            </button>
          )}
        </div>
      </div>

      {/* Search + Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder={t('searchAlertsPlaceholder')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/40 transition-all"
          />
        </div>
        {/* Filter pills */}
        <div className="flex items-center gap-1 flex-wrap">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border
                ${filter === f.key
                  ? 'bg-[#0F4C5C] text-white border-teal-600/40 shadow-sm'
                  : 'bg-white dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/10'
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Alert List */}
      <div className="space-y-2">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-slate-100 dark:bg-white/[0.04] animate-pulse" />
          ))
        ) : filtered.length === 0 ? (
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-2xl p-12 flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
              <CheckCheck className="w-6 h-6 text-emerald-500" />
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{t('allClear')}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t('noAlertsFilter')}</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filtered.map(alert => (
              <AlertCard key={alert._id} alert={alert} onRead={handleMarkRead} />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('pageOf')
              ?.replace('{page}', localizeNumber(page))
              ?.replace('{pages}', localizeNumber(pages))
              ?.replace('{total}', localizeNumber(total))
              || `Page ${page} of ${pages} · ${total} alerts`}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-40 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(pages, 5) }, (_, i) => {
              const n = page <= 3 ? i + 1 : page + i - 2;
              if (n < 1 || n > pages) return null;
              return (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold border transition-all
                    ${n === page
                      ? 'bg-[#0F4C5C] text-white border-teal-600/40'
                      : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'
                    }`}
                >
                  {localizeNumber(n)}
                </button>
              );
            })}
            <button
              onClick={() => setPage(p => Math.min(pages, p + 1))}
              disabled={page === pages}
              className="p-2 rounded-lg border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-40 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

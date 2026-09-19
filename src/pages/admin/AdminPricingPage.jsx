import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tag, Plus, Edit3, Trash2, CheckCircle2, AlertCircle,
  Eye, EyeOff, ShieldCheck, RefreshCw, X, ArrowLeft,
  Check, HelpCircle, Layers, DollarSign
} from 'lucide-react';
import Swal from 'sweetalert2';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { API_BASE_URL } from '../../config/apiConfig';

const API_URL = API_BASE_URL;
const fmt = (paise) => `₹${(paise / 100).toLocaleString('en-IN')}`;

const CATEGORIES = ['amc', 'monitoring', 'service', 'emergency'];
const INTERVALS = ['one-time', 'month', 'year'];
const ICONS = ['🔧', '⭐', '💎', '📱', '💧', '⚙️', '🔌', '🚨', '🏠', '🛡️', '📦'];

const DEFAULT_FORM = {
  key: '',
  label: '',
  icon: '🔧',
  description: '',
  amount: '',
  isRecurring: false,
  interval: 'one-time',
  category: 'service',
  features: ['', '', ''],
  sortOrder: 99,
  isActive: true,
};

export default function AdminPricingPage() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { t, tStatus } = useLanguage();
  const token = localStorage.getItem('suowmrs-token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/plans/all`, { headers });
      const data = await res.json();
      setPlans(data.plans || []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    setEditingId(null);
    setForm(DEFAULT_FORM);
    setError('');
    setShowForm(true);
  };

  const openEdit = (plan) => {
    setEditingId(plan._id);
    setForm({
      key: plan.key,
      label: plan.label,
      icon: plan.icon || '🔧',
      description: plan.description || '',
      amount: (plan.amount / 100).toString(),
      isRecurring: plan.isRecurring,
      interval: plan.interval || 'one-time',
      category: plan.category || 'service',
      features: [...(plan.features || []), '', '', ''].slice(0, Math.max(3, (plan.features || []).length + 1)),
      sortOrder: plan.sortOrder || 99,
      isActive: plan.isActive !== false,
    });
    setError('');
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setError('');
  };

  const handleFeatureChange = (i, val) => {
    const f = [...form.features];
    f[i] = val;
    setForm(p => ({ ...p, features: f }));
  };

  const addFeatureRow = () => setForm(p => ({ ...p, features: [...p.features, ''] }));
  const removeFeatureRow = (i) => setForm(p => ({ ...p, features: p.features.filter((_, idx) => idx !== i) }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const amountInPaise = Math.round(parseFloat(form.amount) * 100);
      if (isNaN(amountInPaise) || amountInPaise <= 0) {
        throw new Error('Please enter a valid price amount in ₹.');
      }
      const body = {
        ...form,
        amount: amountInPaise,
        features: form.features.filter(f => f.trim()),
        isRecurring: Boolean(form.isRecurring),
        sortOrder: parseInt(form.sortOrder, 10) || 99,
      };
      const url = editingId ? `${API_URL}/admin/plans/${editingId}` : `${API_URL}/admin/plans`;
      const method = editingId ? 'PATCH' : 'POST';
      const res = await fetch(url, { method, headers, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t('ap_saveFailed'));

      setSuccess(editingId ? t('ap_planUpdated') : t('ap_planCreated'));
      closeForm();
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (plan) => {
    const result = await Swal.fire({
      title: t('ap_deleteQ', { label: plan.label }),
      text: t('ap_deleteDesc'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: t('ap_yesDelete'),
      cancelButtonText: t('cancel'),
      background: isDark ? '#1E293B' : '#FFFFFF',
      color: isDark ? '#F8FAFC' : '#0F172A',
    });

    if (!result.isConfirmed) return;

    setDeleting(d => ({ ...d, [plan._id]: true }));
    try {
      const res = await fetch(`${API_URL}/admin/plans/${plan._id}`, { method: 'DELETE', headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(t('ap_planDeleted', { label: plan.label }));
      setDeleteConfirm(null);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(d => ({ ...d, [plan._id]: false }));
    }
  };

  const toggleActive = async (plan) => {
    try {
      const res = await fetch(`${API_URL}/admin/plans/${plan._id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ isActive: !plan.isActive }),
      });
      if (res.ok) await load();
    } catch {}
  };

  return (
    <div className="w-full space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b dark:border-white/10 border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Tag className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black font-display tracking-tight text-slate-900 dark:text-white">
              {t('ap_title')}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {t('ap_subtitle')}
          </p>
        </div>

        <button
          onClick={openAdd}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-xs sm:text-sm font-bold transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>{t('ap_addPlan')}</span>
        </button>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: t('ap_totalPlans'), value: plans.length, icon: Layers, color: 'text-slate-900 dark:text-white' },
          { label: t('ap_visibleToResidents'), value: plans.filter(p => p.isActive !== false).length, icon: Eye, color: 'text-emerald-600 dark:text-emerald-400' },
          { label: t('pd_recurringAmc'), value: plans.filter(p => p.isRecurring).length, icon: RefreshCw, color: 'text-emerald-600 dark:text-emerald-400' },
          { label: t('pd_oneTimeServices'), value: plans.filter(p => !p.isRecurring).length, icon: DollarSign, color: 'text-slate-700 dark:text-slate-300' },
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

      {/* Toast Alerts */}
      {success && (
        <div className="flex items-center justify-between p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/20 text-xs sm:text-sm text-emerald-800 dark:text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess('')} className="p-1 text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && !showForm && (
        <div className="flex items-center justify-between p-3.5 rounded-xl border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-950/20 text-xs sm:text-sm text-rose-800 dark:text-rose-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="p-1 text-rose-600 hover:text-rose-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Add / Edit Form Modal or Card */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="rounded-2xl border dark:border-white/10 border-slate-200 dark:bg-[#0F172A] bg-white overflow-hidden shadow-lg"
          >
            <div className="p-5 border-b dark:border-white/10 border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {editingId ? t('ap_editPlan') : t('ap_createPlan')}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('ap_formSubtitle')}
                </p>
              </div>
              <button
                onClick={closeForm}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Icon Selection */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    {t('ap_selectIcon')}
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {ICONS.map(ic => (
                      <button
                        type="button"
                        key={ic}
                        onClick={() => setForm(p => ({ ...p, icon: ic }))}
                        className={`w-10 h-10 rounded-xl border text-xl flex items-center justify-center transition-all ${
                          form.icon === ic
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 shadow-sm scale-105'
                            : 'dark:border-white/10 border-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.04]'
                        }`}
                      >
                        {ic}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Plan Key */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    {t('ap_planKey')} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    value={form.key}
                    onChange={e => setForm(p => ({ ...p, key: e.target.value.trim() }))}
                    disabled={!!editingId}
                    placeholder="e.g. BasicAMC"
                    className="w-full px-3.5 py-2.5 rounded-xl border dark:border-white/10 border-slate-200 dark:bg-slate-900/60 bg-white text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:opacity-50 transition shadow-sm"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">{t('ap_planKeyHint')}</p>
                </div>

                {/* Display Label */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    {t('ap_displayLabel')} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    value={form.label}
                    onChange={e => setForm(p => ({ ...p, label: e.target.value }))}
                    placeholder={t('ap_displayLabelPh')}
                    className="w-full px-3.5 py-2.5 rounded-xl border dark:border-white/10 border-slate-200 dark:bg-slate-900/60 bg-white text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition shadow-sm"
                  />
                </div>

                {/* Amount in ₹ */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    {t('ap_amountInr')} <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">₹</span>
                    <input
                      required
                      type="number"
                      min="1"
                      step="1"
                      value={form.amount}
                      onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                      placeholder="1499"
                      className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border dark:border-white/10 border-slate-200 dark:bg-slate-900/60 bg-white text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition shadow-sm"
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    {t('category')}
                  </label>
                  <select
                    value={form.category}
                    onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border dark:border-white/10 border-slate-200 dark:bg-slate-900/60 bg-white text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition shadow-sm"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c} className="capitalize">
                        {t(`ap_cat_${c}`)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Billing Type & Interval */}
                <div className="sm:col-span-2 p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border dark:border-white/5 border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isRecurring}
                      onChange={e => setForm(p => ({
                        ...p,
                        isRecurring: e.target.checked,
                        interval: e.target.checked ? 'year' : 'one-time',
                      }))}
                      className="w-4 h-4 rounded text-emerald-600 accent-emerald-600"
                    />
                    <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                      {t('ap_recurringSubscription')}
                    </span>
                  </label>

                  {form.isRecurring && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">{t('ap_billingCycle')}:</span>
                      <select
                        value={form.interval}
                        onChange={e => setForm(p => ({ ...p, interval: e.target.value }))}
                        className="px-3 py-1.5 rounded-lg border dark:border-white/10 border-slate-200 dark:bg-slate-900 bg-white text-xs font-semibold text-slate-800 dark:text-slate-200"
                      >
                        <option value="month">{t('ap_monthly')}</option>
                        <option value="year">{t('ap_yearly')}</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    {t('description')}
                  </label>
                  <input
                    value={form.description}
                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    placeholder={t('ap_descriptionPh')}
                    className="w-full px-3.5 py-2.5 rounded-xl border dark:border-white/10 border-slate-200 dark:bg-slate-900/60 bg-white text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition shadow-sm"
                  />
                </div>

                {/* Features list */}
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      {t('ap_features')}
                    </label>
                    <button
                      type="button"
                      onClick={addFeatureRow}
                      className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>{t('ap_addFeature')}</span>
                    </button>
                  </div>
                  <div className="space-y-2">
                    {form.features.map((f, i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          value={f}
                          onChange={e => handleFeatureChange(i, e.target.value)}
                          placeholder={t('ap_featurePh', { n: i + 1 })}
                          className="flex-1 px-3.5 py-2 rounded-xl border dark:border-white/10 border-slate-200 dark:bg-slate-900/60 bg-white text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition shadow-sm"
                        />
                        {form.features.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeFeatureRow(i)}
                            className="p-2 text-slate-400 hover:text-rose-500 transition"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Visibility */}
                <div className="sm:col-span-2 flex items-center gap-3 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))}
                      className="w-4 h-4 rounded text-emerald-600 accent-emerald-600"
                    />
                    <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {t('ap_publishToPortal')}
                    </span>
                  </label>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-950/20 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex justify-end gap-2.5 pt-3 border-t dark:border-white/10 border-slate-100">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 text-xs sm:text-sm font-bold rounded-xl border dark:border-white/10 border-slate-200 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition disabled:opacity-60 shadow-sm"
                >
                  {saving && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <span>{saving ? t('saving') : editingId ? t('saveChanges') : t('ap_publishPlan')}</span>
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Plans Table / Cards */}
      {loading ? (
        <div className="space-y-2.5">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-16 rounded-2xl dark:bg-white/[0.04] bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border dark:border-white/10 border-slate-200 dark:bg-[#0F172A] bg-white overflow-hidden shadow-sm">
          <div className="p-4 sm:px-5 border-b dark:border-white/10 border-slate-100 flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
              {t('ap_configuredPlans')} ({plans.length})
            </h2>
          </div>

          {plans.length === 0 ? (
            <div className="p-12 text-center text-slate-400 dark:text-slate-500 text-sm">
              No service plans configured. Click &quot;Add New Plan&quot; to create the first one.
            </div>
          ) : (
            <div className="divide-y dark:divide-white/[0.06] divide-slate-100">
              {plans.map((plan) => (
                <div
                  key={plan._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:px-5 hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    <span className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center text-xl flex-shrink-0">
                      {plan.icon || '🔧'}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                          {plan.label}
                        </p>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border dark:border-white/10 border-slate-200 text-slate-500 dark:text-slate-400 capitalize">
                          {plan.category || 'service'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          plan.isRecurring
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                            : 'bg-slate-100 dark:bg-white/10 text-slate-500 border-slate-200 dark:border-white/10'
                        }`}>
                          {plan.isRecurring ? `${t('pd_recurringMandate')} (${tStatus(plan.interval)})` : t('status_one_time')}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-md mt-0.5">
                        <code className="text-slate-400 font-mono">{plan.key}</code> · {plan.description || 'No description'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 dark:border-white/10 border-slate-100">
                    <div className="text-left sm:text-right">
                      <span className="text-sm sm:text-base font-black font-display text-slate-900 dark:text-white">
                        {fmt(plan.amount)}
                      </span>
                      {plan.interval !== 'one-time' && (
                        <span className="text-xs text-slate-400 ml-1">/{plan.interval}</span>
                      )}
                    </div>

                    {/* Visibility status */}
                    <button
                      onClick={() => toggleActive(plan)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border transition ${
                        plan.isActive !== false
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                          : 'bg-slate-100 dark:bg-white/5 text-slate-400 border-slate-200 dark:border-white/10'
                      }`}
                    >
                      {plan.isActive !== false ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      <span>{plan.isActive !== false ? t('active') : t('ap_hidden')}</span>
                    </button>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(plan)}
                        className="p-1.5 rounded-lg border dark:border-white/10 border-slate-200 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition"
                        title={t('ap_editPlanShort')}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        disabled={deleting[plan._id]}
                        onClick={() => handleDelete(plan)}
                        className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition disabled:opacity-50"
                        title={t('ap_deletePlan')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

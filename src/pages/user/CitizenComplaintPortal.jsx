import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquareWarning, Send, Plus, CheckCircle2, Clock,
  AlertCircle, Shield, MapPin, User, FileText, Sparkles
} from 'lucide-react';
import Swal from 'sweetalert2';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { submitComplaint, getComplaints } from '../../services/complaintService';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

export default function CitizenComplaintPortal() {
  const { isDark } = useTheme();
  const { t, tStatus, locale } = useLanguage();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    issueType: 'Water Overflow',
    title: '',
    description: '',
    location: '',
    ward: 'Ward 12',
    priority: 'Medium',
    photoUrl: '',
  });

  const fetchMyComplaints = async () => {
    try {
      setLoading(true);
      const data = await getComplaints();
      setComplaints(data || []);
    } catch (err) {
      console.error('Failed to load complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyComplaints();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.location) {
      Swal.fire({
        icon: 'error',
        title: t('cp_missingFields'),
        text: t('cp_missingFieldsDesc'),
        background: isDark ? '#1E293B' : '#FFFFFF',
        color: isDark ? '#F8FAFC' : '#0F172A',
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitComplaint(form);
      Swal.fire({
        icon: 'success',
        title: t('cp_submitted'),
        text: t('cp_submittedDesc'),
        background: isDark ? '#1E293B' : '#FFFFFF',
        color: isDark ? '#F8FAFC' : '#0F172A',
      });
      setForm({
        issueType: 'Water Overflow',
        title: '',
        description: '',
        location: '',
        ward: 'Ward 12',
        priority: 'Medium',
        photoUrl: '',
      });
      setShowForm(false);
      fetchMyComplaints();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: t('cp_submitFailed'),
        text: err.response?.data?.error || t('cp_submitFailedDesc'),
        background: isDark ? '#1E293B' : '#FFFFFF',
        color: isDark ? '#F8FAFC' : '#0F172A',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Submitted':
        return <Badge variant="secondary" size="sm">{t('status_submitted')}</Badge>;
      case 'Under Review':
        return <Badge variant="warning" size="sm">{t('status_under_review')}</Badge>;
      case 'Assigned':
        return <Badge variant="info" size="sm">{t('status_assigned')}</Badge>;
      case 'In Progress':
        return <Badge variant="brand" size="sm">{t('status_in_progress')}</Badge>;
      case 'Resolved':
        return <Badge variant="success" size="sm">{t('status_resolved')}</Badge>;
      default:
        return <Badge variant="secondary" size="sm">{tStatus(status || 'Closed')}</Badge>;
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b dark:border-white/10 border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md">
              <MessageSquareWarning className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white font-display">
                {t('cp_title')}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t('cp_subtitle')}
              </p>
            </div>
          </div>
        </div>

        <Button
          variant={showForm ? "secondary" : "primary"}
          size="sm"
          onClick={() => setShowForm(!showForm)}
          icon={<Plus className="w-4 h-4" />}
        >
          {showForm ? t('cp_cancelReport') : t('cp_fileNew')}
        </Button>
      </div>

      {/* ── COMPLAINT FORM ── */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="dark:bg-[#0F172A] bg-white border dark:border-white/10 border-slate-200 rounded-3xl p-6 shadow-xl space-y-4"
        >
          <div className="flex items-center gap-2 pb-3 border-b dark:border-white/10 border-slate-100">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">{t('cp_submitNew')}</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('cp_issueType')}</label>
                <select
                  value={form.issueType}
                  onChange={(e) => setForm({ ...form, issueType: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border dark:border-white/10 border-slate-200 dark:bg-white/5 bg-slate-50 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Water Overflow" className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white">{t('issue_water_overflow')}</option>
                  <option value="Drainage Blockage" className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white">{t('issue_drainage_blockage')}</option>
                  <option value="Flooding" className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white">{t('issue_flooding')}</option>
                  <option value="System Damage" className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white">{t('issue_system_damage')}</option>
                  <option value="Water Leakage" className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white">{t('issue_water_leakage')}</option>
                  <option value="Other" className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white">{t('issue_other')}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('cp_priorityLevel')}</label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border dark:border-white/10 border-slate-200 dark:bg-white/5 bg-slate-50 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Low" className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white">{t('priority_low')}</option>
                  <option value="Medium" className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white">{t('priority_medium')}</option>
                  <option value="High" className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white">{t('priority_high')}</option>
                  <option value="Urgent" className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white">{t('priority_urgent')}</option>
                </select>
              </div>
            </div>

            <div>
              <Input
                label={t('cp_reportTitle')}
                placeholder={t('cp_reportTitlePh')}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={t('cp_locationLandmarks')}
                placeholder={t('cp_locationPh')}
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                required
              />
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('wardArea')}</label>
                <select
                  value={form.ward}
                  onChange={(e) => setForm({ ...form, ward: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border dark:border-white/10 border-slate-200 dark:bg-white/5 bg-slate-50 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {Array.from({ length: 25 }, (_, i) => (
                    <option key={i} value={`Ward ${i + 1}`} className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white">{t('ward')} {i + 1}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('cp_issueDescription')}</label>
              <textarea
                rows="3"
                placeholder={t('cp_describePh')}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full p-3 rounded-xl border dark:border-white/10 border-slate-200 dark:bg-white/5 bg-slate-50 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => setShowForm(false)}>
                {t('cancel')}
              </Button>
              <Button type="submit" variant="warning" size="sm" isLoading={submitting} icon={<Send className="w-4 h-4" />}>
                {t('cp_submitComplaint')}
              </Button>
            </div>
          </form>
        </motion.div>
      )}

      {/* ── FILED COMPLAINTS TRACKER LIST ── */}
      <div className="space-y-3">
        <p className="text-xs font-black tracking-widest uppercase text-slate-400 dark:text-slate-500">
          {t('cp_tracked')} ({complaints.length})
        </p>

        {loading ? (
          <div className="py-12 text-center text-slate-400">{t('cp_loading')}</div>
        ) : complaints.length === 0 ? (
          <div className="dark:bg-[#0F172A] bg-white border dark:border-white/10 border-slate-200 rounded-2xl p-8 text-center text-slate-400">
            {t('cp_noneYet')}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {complaints.map((c) => (
              <div
                key={c._id}
                className="dark:bg-[#0F172A] bg-white border dark:border-white/10 border-slate-200 shadow-sm rounded-2xl p-5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-xs text-amber-500">{c.complaintId}</span>
                  {getStatusBadge(c.status)}
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">{c.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{c.description}</p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t dark:border-white/5 border-slate-100 text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-amber-500" /> {c.location} ({c.ward})</span>
                  <span className="font-mono">{new Date(c.createdAt).toLocaleDateString(locale)}</span>
                </div>

                {c.assignedTechnician && c.assignedTechnician !== 'Unassigned' && (
                  <div className="bg-sky-500/10 border border-sky-500/20 p-2 rounded-xl text-[11px] text-sky-600 dark:text-sky-400 font-semibold flex items-center justify-between">
                    <span>{t('cp_assignedTechnician')}: <strong>{c.assignedTechnician}</strong></span>
                    {c.linkedWorkOrderId && <span className="font-mono">WO: {c.linkedWorkOrderId}</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </motion.div>
  );
}

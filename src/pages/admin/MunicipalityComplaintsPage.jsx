import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquareWarning, Search, Filter, RefreshCw, CheckCircle2,
  AlertTriangle, Wrench, UserCheck, MapPin, Send, ExternalLink
} from 'lucide-react';
import Swal from 'sweetalert2';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { getComplaints, updateComplaint } from '../../services/complaintService';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

export default function MunicipalityComplaintsPage() {
  const { isDark } = useTheme();
  const { t, tStatus, locale } = useLanguage();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchComplaintsList = async () => {
    try {
      setLoading(true);
      const data = await getComplaints(statusFilter, priorityFilter, searchTerm);
      setComplaints(data || []);
    } catch (err) {
      console.error('Failed to load complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaintsList();
  }, [statusFilter, priorityFilter]);

  const handleUpdateStatus = async (complaint, newStatus) => {
    setUpdatingId(complaint._id);
    try {
      await updateComplaint(complaint._id, { status: newStatus });
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: t('mc_markedAs', { id: complaint.complaintId, status: tStatus(newStatus) }),
        showConfirmButton: false,
        timer: 2000,
        background: isDark ? '#1E293B' : '#FFFFFF',
        color: isDark ? '#F8FAFC' : '#0F172A',
      });
      fetchComplaintsList();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: t('prof_updateFailed'),
        text: t('mc_updateFailedDesc'),
        background: isDark ? '#1E293B' : '#FFFFFF',
        color: isDark ? '#F8FAFC' : '#0F172A',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  // Integration Flow: Assign Technician & Generate Work Order
  const handleAssignAndDispatch = async (complaint) => {
    const { value: techName } = await Swal.fire({
      title: t('mc_assignTitle'),
      text: t('mc_assignText', { id: complaint.complaintId, title: complaint.title }),
      input: 'select',
      inputOptions: {
        'Rajesh Kumar (TECH-8842)': 'Rajesh Kumar (TECH-8842) - Electrical & Hardware',
        'Ramesh Sahoo (TECH-9021)': 'Ramesh Sahoo (TECH-9021) - Drainage & Valves',
        'Sunita Pattnaik (TECH-7712)': 'Sunita Pattnaik (TECH-7712) - Sensors & IoT',
      },
      inputPlaceholder: t('mc_selectTechnician'),
      showCancelButton: true,
      confirmButtonText: t('mc_dispatchTicket'),
      cancelButtonText: t('cancel'),
      confirmButtonColor: '#0EA5E9',
      background: isDark ? '#1E293B' : '#FFFFFF',
      color: isDark ? '#F8FAFC' : '#0F172A',
    });

    if (techName) {
      setUpdatingId(complaint._id);
      try {
        const res = await updateComplaint(complaint._id, {
          assignedTechnician: techName,
          status: 'Assigned',
          createWorkOrder: true,
        });

        Swal.fire({
          icon: 'success',
          title: t('mc_dispatched'),
          text: t('mc_dispatchedDesc', { wo: res.complaint.linkedWorkOrderId, tech: techName }),
          background: isDark ? '#1E293B' : '#FFFFFF',
          color: isDark ? '#F8FAFC' : '#0F172A',
        });
        fetchComplaintsList();
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: t('mc_dispatchFailed'),
          text: t('mc_dispatchFailedDesc'),
          background: isDark ? '#1E293B' : '#FFFFFF',
          color: isDark ? '#F8FAFC' : '#0F172A',
        });
      } finally {
        setUpdatingId(null);
      }
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
                {t('mc_title')}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t('mc_subtitle')}
              </p>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchComplaintsList}
          isLoading={loading}
          icon={<RefreshCw className="w-4 h-4" />}
        >
          {t('mc_refreshList')}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 dark:bg-[#0F172A] bg-white p-3 rounded-2xl border dark:border-white/10 border-slate-200 shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 md:pb-0">
          {['All', 'Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-[#0F4C5C] text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10'
              }`}
            >
              {st === 'All' ? t('all') : tStatus(st)}
            </button>
          ))}
        </div>

        <div className="w-full md:w-72">
          <Input
            type="text"
            placeholder={t('mc_searchPh')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            size="sm"
          />
        </div>
      </div>

      {/* Complaints List Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-slate-400">{t('cp_loading')}</div>
        ) : complaints.length === 0 ? (
          <div className="dark:bg-[#0F172A] bg-white border dark:border-white/10 border-slate-200 rounded-2xl p-8 text-center text-slate-400">
            {t('mc_noneFound')}
          </div>
        ) : (
          complaints.map((c) => (
            <div
              key={c._id}
              className="dark:bg-[#0F172A] bg-white border dark:border-white/10 border-slate-200 shadow-lg rounded-2xl p-6 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b dark:border-white/10 border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-black text-sm text-amber-500">{c.complaintId}</span>
                  <Badge variant={c.priority === 'Urgent' ? 'danger' : 'warning'} size="sm">
                    {tStatus(c.priority)} {t('priority')}
                  </Badge>
                  {getStatusBadge(c.status)}
                </div>

                <span className="text-xs text-slate-400 font-mono">
                  {t('mc_filed')}: {new Date(c.createdAt).toLocaleString(locale)}
                </span>
              </div>

              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">{c.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{c.description}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 dark:bg-white/[0.02] p-3 rounded-xl border dark:border-white/5 border-slate-200/60 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{t('mc_citizenName')}</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{c.citizenName}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{t('mc_locationWard')}</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{c.location} ({c.ward})</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{t('cp_assignedTechnician')}</span>
                  <p className="font-bold text-sky-600 dark:text-sky-400 mt-0.5">{!c.assignedTechnician || c.assignedTechnician === 'Unassigned' ? t('wo_unassigned') : c.assignedTechnician}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  {c.status === 'Submitted' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleUpdateStatus(c, 'Under Review')}
                      isLoading={updatingId === c._id}
                    >
                      {t('mc_markUnderReview')}
                    </Button>
                  )}

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleAssignAndDispatch(c)}
                    isLoading={updatingId === c._id}
                    icon={<Wrench className="w-4 h-4" />}
                  >
                    {c.linkedWorkOrderId ? t('mc_reassign') : t('mc_dispatchTechWo')}
                  </Button>
                </div>

                {c.status !== 'Resolved' && c.status !== 'Closed' && (
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleUpdateStatus(c, 'Resolved')}
                    isLoading={updatingId === c._id}
                    icon={<CheckCircle2 className="w-4 h-4" />}
                  >
                    {t('mc_markResolved')}
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

    </motion.div>
  );
}

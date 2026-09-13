import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, UserCheck, UserX, Clock, Search, Filter,
  CheckCircle2, XCircle, AlertCircle, RefreshCw, Mail, Phone,
  MapPin, Briefcase, ChevronRight, User
} from 'lucide-react';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { getUsers, updateUserStatus } from '../../services/authService';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

export default function UserApprovalsPage() {
  const { isDark } = useTheme();
  const { t } = useLanguage();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Pending'); // 'Pending', 'Verified', 'Rejected', 'All'
  const [roleFilter, setRoleFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchUsersList = async () => {
    try {
      setLoading(true);
      const data = await getUsers(activeTab === 'All' ? '' : activeTab, roleFilter === 'All' ? '' : roleFilter);
      setUsers(data || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersList();
  }, [activeTab, roleFilter]);

  // Handle Approve / Reject
  const handleStatusUpdate = async (user, newStatus) => {
    const isApprove = newStatus === 'Verified';
    const result = await Swal.fire({
      title: `${isApprove ? 'Approve' : 'Reject'} ${user.fullName}?`,
      text: isApprove
        ? `This will verify the account as a ${user.role} and grant immediate system access.`
        : `This will reject the registration for this ${user.role}.`,
      icon: isApprove ? 'question' : 'warning',
      showCancelButton: true,
      confirmButtonColor: isApprove ? '#10B981' : '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: isApprove ? 'Yes, Approve User' : 'Yes, Reject Registration',
      background: isDark ? '#1E293B' : '#FFFFFF',
      color: isDark ? '#F8FAFC' : '#0F172A',
    });

    if (result.isConfirmed) {
      setActionLoadingId(user._id);
      try {
        await updateUserStatus(user._id, newStatus);
        Swal.fire({
          icon: 'success',
          title: `Account ${newStatus}`,
          text: `User ${user.fullName} has been marked as ${newStatus}.`,
          timer: 2000,
          showConfirmButton: false,
          background: isDark ? '#1E293B' : '#FFFFFF',
          color: isDark ? '#F8FAFC' : '#0F172A',
        });
        fetchUsersList();
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Action Failed',
          text: 'Unable to update account status.',
        });
      } finally {
        setActionLoadingId(null);
      }
    }
  };

  // Filter users by search
  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    return (
      u.fullName?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.mobileNumber?.toLowerCase().includes(term) ||
      u.role?.toLowerCase().includes(term) ||
      u.city?.toLowerCase().includes(term) ||
      u.organization?.toLowerCase().includes(term)
    );
  });

  const tabs = ['Pending', 'Verified', 'Rejected', 'All'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-xl bg-gradient-to-r from-blue-600/10 via-indigo-500/10 to-transparent border border-blue-500/20 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/25">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {t('userVerificationTitle')}
              </h1>
              <Badge variant="info" size="md">
                {t('municipalityAdmin')}
              </Badge>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {t('userVerificationDesc')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchUsersList}
            loading={loading}
            className="h-9 px-3.5 rounded-lg border-slate-300 dark:border-white/10"
          >
            <RefreshCw className="w-4 h-4 mr-1.5 flex-shrink-0" />
            <span>{t('refresh')}</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl border bg-white dark:bg-slate-900/60 border-slate-200 dark:border-white/10 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            const tabLabel = tab === 'Pending' ? t('pending') : tab === 'Verified' ? t('verified') : tab === 'Rejected' ? t('rejected') : t('all');
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                {tabLabel}
              </button>
            );
          })}
        </div>

        {/* Role & Search Filter */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-9 px-3 rounded-lg text-xs font-semibold border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All" className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white">{t('all')}</option>
            <option value="Resident" className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white">Residents</option>
            <option value="Technician" className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white">Technicians</option>
          </select>

          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t('searchUser')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-lg text-xs border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Users List */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-500">
          <RefreshCw className="w-6 h-6 animate-spin mr-3 text-blue-500" />
          Loading user records...
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="p-12 text-center rounded-xl border bg-white dark:bg-slate-900/60 border-slate-200 dark:border-white/10">
          <UserCheck className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No Registrations Found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {activeTab === 'Pending'
              ? 'All incoming accounts have been reviewed. No pending approvals at this time.'
              : 'No user accounts match the selected filters.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredUsers.map((user) => {
            const isPending = user.verificationStatus === 'Pending';
            const isVerified = user.verificationStatus === 'Verified';
            const isActionLoading = actionLoadingId === user._id;

            return (
              <motion.div
                key={user._id}
                layout
                className="p-5 rounded-xl border bg-white dark:bg-slate-900/60 border-slate-200 dark:border-white/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* User Info */}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {user.fullName}
                    </h3>
                    <Badge
                      variant={user.role === 'Technician' ? 'warning' : 'info'}
                      size="sm"
                    >
                      {user.role}
                    </Badge>
                    <Badge
                      variant={isVerified ? 'success' : isPending ? 'warning' : 'danger'}
                      size="sm"
                    >
                      ● {user.verificationStatus || 'Pending'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-sky-500 flex-shrink-0" />
                      {user.email}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      {user.mobileNumber || 'No phone'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      Registered {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Role Specific Metadata */}
                  <div className="text-xs text-slate-500 dark:text-slate-400 pt-1">
                    {user.role === 'Resident' && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        Region: <span className="font-medium text-slate-800 dark:text-slate-200">{user.city} — {user.wardArea}</span>
                      </span>
                    )}
                    {user.role === 'Technician' && (
                      <span className="flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-amber-500" />
                        Organization: <span className="font-medium text-slate-800 dark:text-slate-200">{user.organization} ({user.department}) • ID: {user.employeeId}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2.5 self-end md:self-center">
                  {isPending ? (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        loading={isActionLoading}
                        onClick={() => handleStatusUpdate(user, 'Verified')}
                        className="h-9 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                      >
                        <UserCheck className="w-4 h-4 mr-1.5 flex-shrink-0" />
                        <span>Approve Account</span>
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        loading={isActionLoading}
                        onClick={() => handleStatusUpdate(user, 'Rejected')}
                        className="h-9 px-3 rounded-lg border-rose-300 dark:border-rose-500/30 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                      >
                        <UserX className="w-4 h-4 mr-1 flex-shrink-0" />
                        <span>Reject</span>
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusUpdate(user, isVerified ? 'Rejected' : 'Verified')}
                      className="h-9 px-3 rounded-lg text-xs"
                    >
                      {isVerified ? 'Revoke Access' : 'Re-Approve'}
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, UserCheck, UserX, Clock, Search, Filter,
  CheckCircle2, XCircle, AlertCircle, RefreshCw, Mail, Phone,
  MapPin, Briefcase, ChevronRight, User, Building2, Edit3, X, Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { getUsers, updateUserStatus, updateUserRole } from '../../services/authService';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

export default function UserApprovalsPage() {
  const { isDark } = useTheme();
  const { t, tStatus } = useLanguage();
  const roleLabel = (r) => t(`role_${String(r || 'resident').toLowerCase()}`);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Pending'); // 'Pending', 'Verified', 'Rejected', 'All'
  const [roleFilter, setRoleFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Role / Municipality Admin Editing Modal State
  const [editingRoleUser, setEditingRoleUser] = useState(null);
  const [roleSaving, setRoleSaving] = useState(false);
  const [roleFormData, setRoleFormData] = useState({
    role: 'Admin',
    municipalityName: '',
    designation: '',
    officialEmployeeId: '',
    department: '',
    organization: '',
    city: '',
    wardArea: '',
  });

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
      title: isApprove ? t('ua_approveQ', { name: user.fullName }) : t('ua_rejectQ', { name: user.fullName }),
      text: isApprove
        ? t('ua_approveDesc', { role: roleLabel(user.role) })
        : t('ua_rejectDesc', { role: roleLabel(user.role) }),
      icon: isApprove ? 'question' : 'warning',
      showCancelButton: true,
      confirmButtonColor: isApprove ? '#10B981' : '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: isApprove ? t('ua_yesApprove') : t('ua_yesReject'),
      cancelButtonText: t('cancel'),
      background: isDark ? '#1E293B' : '#FFFFFF',
      color: isDark ? '#F8FAFC' : '#0F172A',
    });

    if (result.isConfirmed) {
      setActionLoadingId(user._id);
      try {
        await updateUserStatus(user._id, newStatus);
        Swal.fire({
          icon: 'success',
          title: t('ua_accountStatus', { status: tStatus(newStatus) }),
          text: t('ua_accountStatusDesc', { name: user.fullName, status: tStatus(newStatus) }),
          timer: 2000,
          showConfirmButton: false,
          background: isDark ? '#1E293B' : '#FFFFFF',
          color: isDark ? '#F8FAFC' : '#0F172A',
        });
        fetchUsersList();
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: t('ua_actionFailed'),
          text: t('ua_actionFailedDesc'),
          background: isDark ? '#1E293B' : '#FFFFFF',
          color: isDark ? '#F8FAFC' : '#0F172A',
        });
      } finally {
        setActionLoadingId(null);
      }
    }
  };

  // Open Modal to change role or municipality admin details
  const handleOpenRoleModal = (user) => {
    setEditingRoleUser(user);
    setRoleFormData({
      role: user.role || 'Resident',
      municipalityName: user.municipalityName || 'Bhubaneswar Municipal Corporation (BMC)',
      designation: user.designation || (user.role === 'Admin' ? 'Municipal Administrator' : ''),
      officialEmployeeId: user.officialEmployeeId || user.employeeId || '',
      department: user.department || '',
      organization: user.organization || '',
      city: user.city || '',
      wardArea: user.wardArea || '',
    });
  };

  // Save Role / Municipality changes
  const handleSaveRole = async (e) => {
    e.preventDefault();
    if (!editingRoleUser) return;
    try {
      setRoleSaving(true);
      await updateUserRole(editingRoleUser._id, roleFormData);
      Swal.fire({
        icon: 'success',
        title: t('ua_roleUpdated'),
        text: t('ua_roleUpdatedDesc', { name: editingRoleUser.fullName, role: roleLabel(roleFormData.role) + (roleFormData.role === 'Admin' ? ` (${roleFormData.municipalityName})` : '') }),
        timer: 2500,
        showConfirmButton: false,
        background: isDark ? '#1E293B' : '#FFFFFF',
        color: isDark ? '#F8FAFC' : '#0F172A',
      });
      setEditingRoleUser(null);
      fetchUsersList();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: t('prof_updateFailed'),
        text: err.response?.data?.error || t('ua_roleUpdateFailedDesc'),
        background: isDark ? '#1E293B' : '#FFFFFF',
        color: isDark ? '#F8FAFC' : '#0F172A',
      });
    } finally {
      setRoleSaving(false);
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
      u.municipalityName?.toLowerCase().includes(term) ||
      u.designation?.toLowerCase().includes(term) ||
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
              {t('ua_subtitle')}
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
            <option value="All" className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white">{t('ua_allRoles')}</option>
            <option value="Admin" className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white">🏛️ {t('ua_municipalityAdmins')}</option>
            <option value="Technician" className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white">🛠️ {t('ua_technicians')}</option>
            <option value="Resident" className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white">👥 {t('ua_residents')}</option>
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
          {t('ua_loading')}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="p-12 text-center rounded-xl border bg-white dark:bg-slate-900/60 border-slate-200 dark:border-white/10">
          <UserCheck className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {t('ua_noRecords')}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {activeTab === 'Pending'
              ? t('ua_noPendingDesc')
              : t('ua_noMatchDesc')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredUsers.map((user) => {
            const isPending = user.verificationStatus === 'Pending';
            const isVerified = user.verificationStatus === 'Verified';
            const isAdmin = user.role === 'Admin';
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
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                        isAdmin
                          ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30'
                          : user.role === 'Technician'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                          : 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30'
                      }`}
                    >
                      {isAdmin && <Building2 className="w-3 h-3" />}
                      {roleLabel(user.role)}
                    </span>
                    <Badge
                      variant={isVerified ? 'success' : isPending ? 'warning' : 'danger'}
                      size="sm"
                    >
                      ● {tStatus(user.verificationStatus || 'Pending')}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-sky-500 flex-shrink-0" />
                      {user.email}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      {user.mobileNumber || t('ua_noPhone')}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      Registered {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Role Specific Metadata */}
                  <div className="text-xs text-slate-500 dark:text-slate-400 pt-1">
                    {isAdmin && (
                      <span className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-medium">
                        <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>
                          {user.municipalityName || t('ua_centralMunicipality')}
                          {user.designation ? ` • ${user.designation}` : ` • ${t('ua_administrator')}`}
                          {user.officialEmployeeId ? ` (ID: ${user.officialEmployeeId})` : ''}
                        </span>
                      </span>
                    )}
                    {user.role === 'Resident' && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                        Region: <span className="font-medium text-slate-800 dark:text-slate-200">{user.city || 'N/A'} — {user.wardArea || 'General Ward'}</span>
                      </span>
                    )}
                    {user.role === 'Technician' && (
                      <span className="flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                        Organization: <span className="font-medium text-slate-800 dark:text-slate-200">{user.organization || 'Field Services'} ({user.department || 'Maintenance'}) • ID: {user.employeeId || 'N/A'}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2.5 flex-wrap self-end md:self-center">
                  {/* Change Role / Municipality Admin Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenRoleModal(user)}
                    className="h-9 px-3 rounded-lg text-xs border-indigo-300 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isAdmin ? t('ua_editAdmin') : t('ua_assignAdmin')}</span>
                  </Button>

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
                        <span>{t('ua_approve')}</span>
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        loading={isActionLoading}
                        onClick={() => handleStatusUpdate(user, 'Rejected')}
                        className="h-9 px-3 rounded-lg border-rose-300 dark:border-rose-500/30 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                      >
                        <UserX className="w-4 h-4 mr-1 flex-shrink-0" />
                        <span>{t('ua_reject')}</span>
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusUpdate(user, isVerified ? 'Rejected' : 'Verified')}
                      className="h-9 px-3 rounded-lg text-xs"
                    >
                      {isVerified ? t('ua_revokeAccess') : t('ua_reApprove')}
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── MODAL: CHANGE ROLE & MUNICIPALITY ADMIN ── */}
      <AnimatePresence>
        {editingRoleUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/30">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {t('ua_configureRole')}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {t('ua_modifyingFor')}: <strong className="text-slate-800 dark:text-slate-200">{editingRoleUser.fullName}</strong>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingRoleUser(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleSaveRole} className="p-6 space-y-4">
                {/* Role Selector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    {t('ua_authorityRole')}
                  </label>
                  <select
                    value={roleFormData.role}
                    onChange={(e) => setRoleFormData({ ...roleFormData, role: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Admin">🏛️ {t('ua_roleOptAdmin')}</option>
                    <option value="Technician">🛠️ {t('ua_roleOptTechnician')}</option>
                    <option value="Resident">👥 {t('ua_roleOptResident')}</option>
                  </select>
                </div>

                {/* Conditional Fields for Municipality Admin */}
                {roleFormData.role === 'Admin' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3.5 pt-2">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                        {t('ua_municipalityName')}
                      </label>
                      <input
                        type="text"
                        required
                        value={roleFormData.municipalityName}
                        onChange={(e) => setRoleFormData({ ...roleFormData, municipalityName: e.target.value })}
                        placeholder={t('ua_municipalityPh')}
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                          {t('ua_officialDesignation')}
                        </label>
                        <input
                          type="text"
                          required
                          value={roleFormData.designation}
                          onChange={(e) => setRoleFormData({ ...roleFormData, designation: e.target.value })}
                          placeholder={t('ua_designationPh')}
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                          {t('ua_officerId')}
                        </label>
                        <input
                          type="text"
                          value={roleFormData.officialEmployeeId}
                          onChange={(e) => setRoleFormData({ ...roleFormData, officialEmployeeId: e.target.value })}
                          placeholder="e.g. BMC-ADM-2026"
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 text-xs text-purple-700 dark:text-purple-300">
                      ℹ️ {t('ua_promoteNote')}
                    </div>
                  </motion.div>
                )}

                {/* Conditional Fields for Technician */}
                {roleFormData.role === 'Technician' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3.5 pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                          {t('prof_organization')}
                        </label>
                        <input
                          type="text"
                          value={roleFormData.organization}
                          onChange={(e) => setRoleFormData({ ...roleFormData, organization: e.target.value })}
                          placeholder="e.g. Odisha Water Services"
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                          {t('department')}
                        </label>
                        <input
                          type="text"
                          value={roleFormData.department}
                          onChange={(e) => setRoleFormData({ ...roleFormData, department: e.target.value })}
                          placeholder="e.g. Drainage & Sensors"
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Modal Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingRoleUser(null)}
                    disabled={roleSaving}
                  >
                    {t('cancel')}
                  </Button>

                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    loading={roleSaving}
                    className="bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/20"
                    icon={Save}
                  >
                    {t('ua_saveNotify')}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

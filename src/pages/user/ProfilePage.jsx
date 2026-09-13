import React, { useState, useEffect } from 'react';
import {
  User, Shield, Key, Phone, Mail, MapPin, Building, Briefcase,
  CheckCircle2, AlertCircle, Save, Lock, RefreshCw, Check
} from 'lucide-react';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { getCurrentUser, getMe, updateProfile, changePassword } from '../../services/authService';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

export default function ProfilePage() {
  const { isDark } = useTheme();
  const { t } = useLanguage();

  const [currentUser, setCurrentUser] = useState(getCurrentUser() || {
    fullName: 'Aarav Sharma',
    email: 'resident@suowmrs.org',
    mobileNumber: '+91 98765 43210',
    role: 'Resident',
    city: 'Bhubaneswar',
    wardArea: 'Ward 12, Riverbed Sector',
    verificationStatus: 'Verified',
  });

  const [profileForm, setProfileForm] = useState({
    fullName: '',
    mobileNumber: '',
    city: '',
    wardArea: '',
    organization: '',
    department: '',
    designation: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const remoteUser = await getMe();
        if (remoteUser) {
          setCurrentUser(remoteUser);
          setProfileForm({
            fullName: remoteUser.fullName || '',
            mobileNumber: remoteUser.mobileNumber || '',
            city: remoteUser.city || '',
            wardArea: remoteUser.wardArea || '',
            organization: remoteUser.organization || '',
            department: remoteUser.department || '',
            designation: remoteUser.designation || '',
          });
        }
      } catch (err) {
        // Fallback to local storage
        const local = getCurrentUser();
        if (local) {
          setCurrentUser(local);
          setProfileForm({
            fullName: local.fullName || '',
            mobileNumber: local.mobileNumber || '',
            city: local.city || '',
            wardArea: local.wardArea || '',
            organization: local.organization || '',
            department: local.department || '',
            designation: local.designation || '',
          });
        }
      }
    };
    loadUserData();
  }, []);

  // Update Profile
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await updateProfile(profileForm);
      setCurrentUser(res.user);
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Profile updated successfully!',
        showConfirmButton: false,
        timer: 2000,
        background: isDark ? '#1E293B' : '#FFFFFF',
        color: isDark ? '#F8FAFC' : '#0F172A',
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: err.response?.data?.error || 'Could not update profile details.',
        background: isDark ? '#1E293B' : '#FFFFFF',
        color: isDark ? '#F8FAFC' : '#0F172A',
      });
    } finally {
      setSavingProfile(false);
    }
  };

  // Change Password
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword.length < 6) {
      Swal.fire({
        icon: 'error',
        title: 'Password Too Short',
        text: 'New password must be at least 6 characters long.',
        background: isDark ? '#1E293B' : '#FFFFFF',
        color: isDark ? '#F8FAFC' : '#0F172A',
      });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Passwords Mismatch',
        text: 'New password and confirmation password do not match.',
        background: isDark ? '#1E293B' : '#FFFFFF',
        color: isDark ? '#F8FAFC' : '#0F172A',
      });
      return;
    }

    setSavingPassword(true);
    try {
      await changePassword(passwordForm);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      Swal.fire({
        icon: 'success',
        title: 'Password Changed',
        text: 'Your credentials have been securely updated.',
        timer: 2000,
        showConfirmButton: false,
        background: isDark ? '#1E293B' : '#FFFFFF',
        color: isDark ? '#F8FAFC' : '#0F172A',
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Failed to Change Password',
        text: err.response?.data?.error || 'Current password incorrect.',
        background: isDark ? '#1E293B' : '#FFFFFF',
        color: isDark ? '#F8FAFC' : '#0F172A',
      });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-xl bg-gradient-to-r from-[#0F4C5C]/15 via-sky-500/10 to-transparent border border-sky-500/20 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#0F4C5C] to-[#0EA5E9] flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-sky-900/30">
            {currentUser?.fullName?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {currentUser?.fullName || 'User Profile'}
              </h1>
              <Badge
                variant={
                  currentUser?.role === 'Admin'
                    ? 'danger'
                    : currentUser?.role === 'Technician'
                    ? 'warning'
                    : 'info'
                }
                size="md"
              >
                {currentUser?.role || 'Resident'}
              </Badge>
              <Badge
                variant={currentUser?.verificationStatus === 'Verified' ? 'success' : 'warning'}
                size="sm"
              >
                ● {currentUser?.verificationStatus || 'Verified'}
              </Badge>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-2">
              <Mail className="w-4 h-4 text-sky-500" />
              <span>{currentUser?.email}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Grid: 2 Columns (Profile Details & Password Change) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Personal Details */}
        <div className="p-6 rounded-xl border bg-white dark:bg-slate-900/60 border-slate-200 dark:border-white/10 shadow-sm space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-white/5">
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-500">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Personal Information
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Update your contact numbers and regional dispatch address.
              </p>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={profileForm.fullName}
                onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-xs border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address (Read-Only)
              </label>
              <input
                type="email"
                disabled
                value={currentUser?.email || ''}
                className="w-full px-3 py-2 rounded-lg text-xs border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-800/50 text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Mobile Number
              </label>
              <input
                type="tel"
                required
                value={profileForm.mobileNumber}
                onChange={(e) => setProfileForm({ ...profileForm, mobileNumber: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-xs border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* Resident Role Fields */}
            {currentUser?.role === 'Resident' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={profileForm.city}
                    onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg text-xs border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Ward / Sector Area
                  </label>
                  <input
                    type="text"
                    value={profileForm.wardArea}
                    onChange={(e) => setProfileForm({ ...profileForm, wardArea: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg text-xs border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
            )}

            {/* Technician Role Fields */}
            {currentUser?.role === 'Technician' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Organization
                  </label>
                  <input
                    type="text"
                    value={profileForm.organization}
                    onChange={(e) => setProfileForm({ ...profileForm, organization: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg text-xs border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={profileForm.department}
                    onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg text-xs border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
            )}

            {/* Admin Role Fields */}
            {currentUser?.role === 'Admin' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Designation / Role Title
                </label>
                <input
                  type="text"
                  value={profileForm.designation}
                  onChange={(e) => setProfileForm({ ...profileForm, designation: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-xs border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={savingProfile}
                className="h-9 px-4 rounded-lg bg-[#0F4C5C] hover:bg-[#0A333E] text-white shadow-sm"
              >
                <Save className="w-4 h-4 mr-1.5 flex-shrink-0" />
                <span>Save Profile Changes</span>
              </Button>
            </div>
          </form>
        </div>

        {/* Card 2: Security & Password */}
        <div className="p-6 rounded-xl border bg-white dark:bg-slate-900/60 border-slate-200 dark:border-white/10 shadow-sm space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-white/5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Password & Security
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ensure your account is secured with a strong, complex passphrase.
              </p>
            </div>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Current Password *
              </label>
              <input
                type="password"
                required
                placeholder="Enter existing password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-xs border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                New Password *
              </label>
              <input
                type="password"
                required
                placeholder="At least 6 characters"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-xs border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Confirm New Password *
              </label>
              <input
                type="password"
                required
                placeholder="Re-enter new password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-xs border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
              <div>● Passwords are encrypted using bcrypt hashing.</div>
              <div>● Never share credentials or API tokens with unauthorized individuals.</div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={savingPassword}
                className="h-9 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
              >
                <Key className="w-4 h-4 mr-1.5 flex-shrink-0" />
                <span>Update Password</span>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

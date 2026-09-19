import React, { useState, useEffect, useMemo } from 'react';
import {
  User, Key, Phone, Mail, MapPin, Building, Briefcase, Lock, Save, Eye, EyeOff,
  ShieldCheck, BadgeCheck, CalendarDays, Cpu, Sparkles, Fingerprint, Radio, LayoutDashboard,
  Wrench, Shield, Check, AlertCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import Button from '../../components/common/Button';
import { getCurrentUser, getMe, updateProfile, changePassword } from '../../services/authService';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

const ROLE_THEME = {
  Resident: { ring: 'from-emerald-500 to-teal-400', chip: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30', icon: LayoutDashboard },
  Technician: { ring: 'from-amber-500 to-yellow-400', chip: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30', icon: Wrench },
  Admin: { ring: 'from-rose-500 to-orange-400', chip: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30', icon: Shield },
};

const PERMISSIONS = {
  Resident: ['prof_perm_monitor', 'prof_perm_alerts', 'prof_perm_complaints', 'prof_perm_payments'],
  Technician: ['prof_perm_diagnostics', 'prof_perm_calibration', 'prof_perm_workorders', 'prof_perm_valves'],
  Admin: ['prof_perm_grid', 'prof_perm_approvals', 'prof_perm_dispatch', 'prof_perm_pricing'],
};

/** 0-4 password strength score (length, case mix, digits, symbols) */
function scorePassword(pw = '') {
  let s = 0;
  if (pw.length >= 6) s++;
  if (pw.length >= 10) s++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(4, s);
}

function Field({ label, icon: Icon, children }) {
  return (
    <div>
      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">{label}</label>
      <div className="relative">
        {Icon && (
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Icon className="w-4 h-4" />
          </span>
        )}
        {children}
      </div>
    </div>
  );
}

const inputCls = (extra = '') =>
  `w-full rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:bg-white dark:focus:bg-white/[0.06] focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition ${extra}`;

export default function ProfilePage() {
  const { isDark } = useTheme();
  const { t, tStatus, locale } = useLanguage();

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
    fullName: '', mobileNumber: '', city: '', wardArea: '', organization: '', department: '', designation: '',
  });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [show, setShow] = useState({ current: false, next: false, confirm: false });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const swalBase = { background: isDark ? '#1E293B' : '#FFFFFF', color: isDark ? '#F8FAFC' : '#0F172A' };

  useEffect(() => {
    const hydrate = (u) =>
      setProfileForm({
        fullName: u.fullName || '',
        mobileNumber: u.mobileNumber || '',
        city: u.city || '',
        wardArea: u.wardArea || '',
        organization: u.organization || '',
        department: u.department || '',
        designation: u.designation || '',
      });
    const loadUserData = async () => {
      try {
        const remoteUser = await getMe();
        if (remoteUser) { setCurrentUser(remoteUser); hydrate(remoteUser); }
      } catch {
        const local = getCurrentUser();
        if (local) { setCurrentUser(local); hydrate(local); }
      }
    };
    loadUserData();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await updateProfile(profileForm);
      setCurrentUser(res.user);
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: t('prof_updated'), showConfirmButton: false, timer: 2000, ...swalBase });
    } catch (err) {
      Swal.fire({ icon: 'error', title: t('prof_updateFailed'), text: err.response?.data?.error || t('prof_updateFailedDesc'), ...swalBase });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword.length < 6) {
      Swal.fire({ icon: 'error', title: t('prof_pwdShort'), text: t('fp_errPasswordLength'), ...swalBase });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      Swal.fire({ icon: 'error', title: t('prof_pwdMismatch'), text: t('prof_pwdMismatchDesc'), ...swalBase });
      return;
    }
    setSavingPassword(true);
    try {
      await changePassword(passwordForm);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      Swal.fire({ icon: 'success', title: t('prof_pwdChanged'), text: t('prof_pwdChangedDesc'), timer: 2000, showConfirmButton: false, ...swalBase });
    } catch (err) {
      Swal.fire({ icon: 'error', title: t('prof_pwdChangeFailed'), text: err.response?.data?.error || t('prof_pwdIncorrect'), ...swalBase });
    } finally {
      setSavingPassword(false);
    }
  };

  const role = currentUser?.role || 'Resident';
  const theme = ROLE_THEME[role] || ROLE_THEME.Resident;
  const RoleIcon = theme.icon;
  const isVerified = (currentUser?.verificationStatus || 'Verified') === 'Verified';
  const initials = (currentUser?.fullName || 'U').split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('');
  const memberSince = currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString(locale, { month: 'short', year: 'numeric' }) : '—';
  const location = [currentUser?.wardArea, currentUser?.city].filter(Boolean).join(', ');
  const orgLine = currentUser?.municipalityName || currentUser?.organization || currentUser?.department || null;

  const strength = useMemo(() => scorePassword(passwordForm.newPassword), [passwordForm.newPassword]);
  const strengthMeta = [
    { key: 'prof_strength_weak', bar: 'bg-rose-500', text: 'text-rose-500' },
    { key: 'prof_strength_weak', bar: 'bg-rose-500', text: 'text-rose-500' },
    { key: 'prof_strength_fair', bar: 'bg-amber-500', text: 'text-amber-500' },
    { key: 'prof_strength_good', bar: 'bg-emerald-500', text: 'text-emerald-500' },
    { key: 'prof_strength_strong', bar: 'bg-emerald-600', text: 'text-emerald-600' },
  ][strength];
  const pwMatch = passwordForm.confirmPassword.length > 0 && passwordForm.newPassword === passwordForm.confirmPassword;

  const toggleShow = (k) => setShow((s) => ({ ...s, [k]: !s[k] }));
  const EyeBtn = ({ k }) => (
    <button type="button" onClick={() => toggleShow(k)} className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200" aria-label={show[k] ? t('prof_hidePassword') : t('prof_showPassword')}>
      {show[k] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto space-y-6">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden rounded-3xl border border-emerald-900/10 dark:border-white/10 shadow-lg shadow-emerald-950/5">
        <div className="h-36 sm:h-44 bg-gradient-to-br from-emerald-800 via-emerald-600 to-teal-500 relative">
          <div className="absolute inset-0 opacity-[0.18]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '22px 22px' }} />
          <div className="absolute -right-10 -top-16 w-72 h-72 rounded-full bg-amber-300/25 blur-3xl" />
          <div className="absolute left-1/3 -bottom-20 w-64 h-64 rounded-full bg-sky-300/20 blur-3xl" />
          <div className="absolute top-4 right-4 sm:top-5 sm:right-6 flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/15 text-white border border-white/25 backdrop-blur">
              <Cpu className="w-3 h-3" /> {t('prof_node')}: <span className="font-mono">SYS-042</span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/15 text-white border border-white/25 backdrop-blur">
              <Radio className="w-3 h-3" /> {t('live')}
            </span>
          </div>
        </div>

        <div className="relative z-10 bg-white dark:bg-[#0F172A] px-5 sm:px-8 pb-6">
          <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-6">
            <div className={`-mt-12 sm:-mt-14 w-24 h-24 sm:w-28 sm:h-28 rounded-3xl p-[3px] bg-gradient-to-br ${theme.ring} shadow-xl shadow-emerald-950/20 flex-shrink-0`}>
              <div className="w-full h-full rounded-[21px] bg-white dark:bg-[#0F172A] flex items-center justify-center">
                <span className="text-3xl sm:text-4xl font-black bg-gradient-to-br from-emerald-700 to-teal-500 dark:from-emerald-300 dark:to-teal-200 bg-clip-text text-transparent">{initials}</span>
              </div>
            </div>

            <div className="flex-1 min-w-0 pt-3 md:pt-4">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-display tracking-tight truncate">
                  {currentUser?.fullName || t('prof_userProfile')}
                </h1>
                <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${theme.chip}`}>
                  <RoleIcon className="w-3 h-3" /> {t(`role_${role.toLowerCase()}`)}
                </span>
                <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                  isVerified ? 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30' : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30'
                }`}>
                  {isVerified ? <BadgeCheck className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                  {tStatus(currentUser?.verificationStatus || 'Verified')}
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t('prof_heroTagline')}</p>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-3 text-xs text-slate-600 dark:text-slate-300">
                <span className="inline-flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />{currentUser?.email}</span>
                {currentUser?.mobileNumber && <span className="inline-flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />{currentUser.mobileNumber}</span>}
                {location && <span className="inline-flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />{location}</span>}
                {orgLine && <span className="inline-flex items-center gap-1.5"><Building className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />{orgLine}</span>}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 md:gap-3 pt-3 md:pt-4">
              {[
                { icon: CalendarDays, label: t('prof_memberSince'), value: memberSince },
                { icon: Fingerprint, label: t('prof_accessLevel'), value: t(`role_${role.toLowerCase()}`) },
                { icon: ShieldCheck, label: t('status'), value: tStatus(currentUser?.verificationStatus || 'Verified') },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="px-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 min-w-[96px]">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400"><Icon className="w-3 h-3" />{label}</div>
                  <div className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5 truncate">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Body ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Account overview */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0F172A] p-5 shadow-sm">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/15 to-teal-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-700 dark:text-emerald-300"><Sparkles className="w-4 h-4" /></span>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">{t('prof_accountOverview')}</h3>
            </div>
            <dl className="space-y-3 text-xs">
              {[
                [t('emailAddress'), currentUser?.email, Mail],
                [t('mobileNumber'), currentUser?.mobileNumber || '—', Phone],
                [t('city'), currentUser?.city || '—', MapPin],
                [role === 'Resident' ? t('wardArea') : role === 'Technician' ? t('department') : t('designation'),
                  role === 'Resident' ? currentUser?.wardArea || '—' : role === 'Technician' ? currentUser?.department || '—' : currentUser?.designation || '—', Briefcase],
              ].map(([k, v, Icon]) => (
                <div key={k} className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5">
                  <Icon className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{k}</dt>
                    <dd className="text-slate-800 dark:text-slate-100 font-semibold truncate">{v}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>

          <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0F172A] p-5 shadow-sm">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500/15 to-indigo-500/10 border border-sky-500/20 flex items-center justify-center text-sky-700 dark:text-sky-300"><ShieldCheck className="w-4 h-4" /></span>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">{t('prof_permissions')}</h3>
            </div>
            <ul className="space-y-2">
              {(PERMISSIONS[role] || PERMISSIONS.Resident).map((k) => (
                <li key={k} className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0"><Check className="w-3 h-3" /></span>
                  {t(k)}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Forms */}
        <div className="lg:col-span-8 space-y-6">
          {/* Personal info */}
          <form onSubmit={handleProfileSubmit} className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0F172A] shadow-sm overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-white/5 bg-gradient-to-r from-slate-50 to-transparent dark:from-white/[0.03]">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center"><User className="w-5 h-5" /></span>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{t('prof_personalInfo')}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t('prof_personalInfoDesc')}</p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Field label={t('fullName')} icon={User}>
                  <input type="text" required value={profileForm.fullName} onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })} className={inputCls()} />
                </Field>
              </div>
              <Field label={t('prof_emailReadOnly')} icon={Mail}>
                <input type="email" disabled value={currentUser?.email || ''} className={inputCls('opacity-70 cursor-not-allowed')} />
              </Field>
              <Field label={t('mobileNumber')} icon={Phone}>
                <input type="tel" required value={profileForm.mobileNumber} onChange={(e) => setProfileForm({ ...profileForm, mobileNumber: e.target.value })} className={inputCls()} />
              </Field>

              {role === 'Resident' && (
                <>
                  <Field label={t('city')} icon={MapPin}>
                    <input type="text" value={profileForm.city} onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })} className={inputCls()} />
                  </Field>
                  <Field label={t('prof_wardSector')} icon={Building}>
                    <input type="text" value={profileForm.wardArea} onChange={(e) => setProfileForm({ ...profileForm, wardArea: e.target.value })} className={inputCls()} />
                  </Field>
                </>
              )}
              {role === 'Technician' && (
                <>
                  <Field label={t('prof_organization')} icon={Building}>
                    <input type="text" value={profileForm.organization} onChange={(e) => setProfileForm({ ...profileForm, organization: e.target.value })} className={inputCls()} />
                  </Field>
                  <Field label={t('department')} icon={Briefcase}>
                    <input type="text" value={profileForm.department} onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })} className={inputCls()} />
                  </Field>
                </>
              )}
              {role === 'Admin' && (
                <div className="sm:col-span-2">
                  <Field label={t('prof_designationTitle')} icon={Briefcase}>
                    <input type="text" value={profileForm.designation} onChange={(e) => setProfileForm({ ...profileForm, designation: e.target.value })} className={inputCls()} />
                  </Field>
                </div>
              )}
            </div>

            <div className="px-5 sm:px-6 py-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-end gap-3 bg-slate-50/60 dark:bg-white/[0.02]">
              <Button type="submit" variant="primary" size="sm" isLoading={savingProfile} className="h-10 px-5 rounded-xl bg-[#0F4C5C] hover:bg-[#0A333E] text-white shadow-md shadow-teal-900/20">
                <Save className="w-4 h-4 mr-1.5" />
                <span>{t('prof_saveChanges')}</span>
              </Button>
            </div>
          </form>

          {/* Security */}
          <form onSubmit={handlePasswordSubmit} className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0F172A] shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-white/5 bg-gradient-to-r from-slate-50 to-transparent dark:from-white/[0.03]">
              <span className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center"><Lock className="w-5 h-5" /></span>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{t('prof_passwordSecurity')}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t('prof_passwordSecurityDesc')}</p>
              </div>
            </div>

            <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Field label={`${t('prof_currentPassword')} *`} icon={Key}>
                  <input type={show.current ? 'text' : 'password'} required autoComplete="current-password" placeholder={t('prof_enterExisting')} value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} className={inputCls('pr-11')} />
                  <EyeBtn k="current" />
                </Field>
              </div>
              <Field label={`${t('fp_newPassword')} *`} icon={Lock}>
                <input type={show.next ? 'text' : 'password'} required autoComplete="new-password" placeholder={t('fp_min6')} value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} className={inputCls('pr-11')} />
                <EyeBtn k="next" />
              </Field>
              <Field label={`${t('fp_confirmNewPassword')} *`} icon={Lock}>
                <input type={show.confirm ? 'text' : 'password'} required autoComplete="new-password" placeholder={t('fp_reenter')} value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} className={inputCls(`pr-11 ${passwordForm.confirmPassword ? (pwMatch ? '!border-emerald-500' : '!border-rose-400') : ''}`)} />
                <EyeBtn k="confirm" />
              </Field>

              {/* Strength meter */}
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between text-[11px] mb-1.5">
                  <span className="font-bold uppercase tracking-wider text-slate-400">{t('prof_strength')}</span>
                  <span className={`font-bold ${passwordForm.newPassword ? strengthMeta.text : 'text-slate-400'}`}>{passwordForm.newPassword ? t(strengthMeta.key) : '—'}</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className={`h-1.5 rounded-full transition-colors ${passwordForm.newPassword && i < strength ? strengthMeta.bar : 'bg-slate-200 dark:bg-white/10'}`} />
                  ))}
                </div>
              </div>

              <div className="sm:col-span-2 p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-500/[0.06] border border-emerald-200/70 dark:border-emerald-500/20 text-[11px] text-emerald-900/80 dark:text-emerald-200/80 space-y-1">
                <div className="flex items-start gap-2"><ShieldCheck className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />{t('prof_note1')}</div>
                <div className="flex items-start gap-2"><ShieldCheck className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />{t('prof_note2')}</div>
              </div>
            </div>

            <div className="px-5 sm:px-6 py-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-end bg-slate-50/60 dark:bg-white/[0.02]">
              <Button type="submit" variant="primary" size="sm" isLoading={savingPassword} className="h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-900/20">
                <Key className="w-4 h-4 mr-1.5" />
                <span>{t('prof_updatePassword')}</span>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
}

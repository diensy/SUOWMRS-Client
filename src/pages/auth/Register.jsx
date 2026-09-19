import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User, Mail, Lock, Phone, MapPin, Building2,
  Briefcase, BadgeCheck, Eye, EyeOff, Shield,
  CheckCircle2, ArrowRight, Sun, Moon, AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { registerUser } from '../../services/authService';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import LanguageSwitcher from '../../components/common/LanguageSwitcher';
import { customSwal } from '../../utils/swal';

export default function Register() {
  const navigate = useNavigate();
  const { theme, toggleTheme, isDark } = useTheme();
  const { t } = useLanguage();
  const roleLabel = (r) => (r === 'Admin' ? t('login_municipality') : t(`role_${r.toLowerCase()}`));

  // Role: 'Resident' | 'Technician' | 'Admin' (Municipality)
  const [activeRole, setActiveRole] = useState('Resident');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // ── Unified Form State ──
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    officialEmail: '',
    mobileNumber: '',
    password: '',
    confirmPassword: '',

    // Resident fields
    city: '',
    wardArea: '',

    // Technician fields
    employeeId: '',
    organization: '',
    department: '',

    // Municipality fields
    municipalityName: '',
    designation: '',
    officialEmployeeId: '',
    state: '',
    isAuthorizedRepresentative: false,

    // Common agreement
    agreedToTerms: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Validation checks
    if (formData.password.length < 6) {
      setErrorMessage(t('reg_errPasswordLength'));
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage(t('reg_errPasswordMismatch'));
      return;
    }
    if (!formData.agreedToTerms) {
      setErrorMessage(t('reg_errTerms'));
      return;
    }
    if (activeRole === 'Admin' && !formData.isAuthorizedRepresentative) {
      setErrorMessage(t('reg_errAuthorized'));
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        role: activeRole,
        email: activeRole === 'Admin' ? formData.officialEmail : formData.email,
      };

      const result = await registerUser(payload);

      await customSwal.fire({
        icon: 'success',
        title: t('reg_successTitle'),
        text: t('reg_successText', { role: roleLabel(activeRole) }),
        timer: 1800,
        showConfirmButton: false,
      });

      navigate('/login', {
        state: {
          signupSuccess: true,
          registeredEmail: payload.email,
          registeredRole: activeRole,
          message: t('reg_signupCompleted', { role: roleLabel(activeRole) }),
        },
      });
    } catch (err) {
      const msg = err.response?.data?.error || t('reg_failed');
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen dark:bg-[#090E17] bg-[#F8FAFC] text-slate-800 dark:text-slate-100 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-10 selection:bg-brand-accent selection:text-white transition-colors duration-200">
      
      {/* Top Navbar / Theme Switcher */}
      <div className="w-full max-w-xl flex items-center justify-between mb-4">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-white p-0.5 shadow-sm border border-slate-200 dark:border-white/10 flex items-center justify-center overflow-hidden">
            <img src="/logo.png" alt="SUOWMRS" className="w-full h-full object-contain" />
          </div>
          <span className="font-black text-xl tracking-tight text-slate-900 dark:text-white font-display">
            SUOW<span className="text-brand-accent">MRS</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <button
            onClick={toggleTheme}
            type="button"
            className="p-2 rounded-xl dark:bg-white/5 bg-slate-200/70 dark:border-white/10 border-slate-300 border text-slate-600 dark:text-slate-300 hover:text-amber-500 transition"
            title={isDark ? t('lightMode') : t('darkMode')}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>
        </div>
      </div>

      <div className="w-full max-w-xl">
        {/* Header Titles */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-900 dark:text-white">
            {activeRole === 'Resident' && t('reg_titleResident')}
            {activeRole === 'Technician' && t('reg_titleTechnician')}
            {activeRole === 'Admin' && t('reg_titleAdmin')}
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {activeRole === 'Resident' && t('reg_subResident')}
            {activeRole === 'Technician' && t('reg_subTechnician')}
            {activeRole === 'Admin' && t('reg_subAdmin')}
          </p>
        </div>

        {/* ── 3-Tab Role Selector ── */}
        <div className="flex bg-slate-200/80 dark:bg-white/5 p-1 rounded-2xl mb-6 border border-slate-200 dark:border-white/10">
          {[
            { id: 'Resident', label: t('reg_tabResident') },
            { id: 'Technician', label: t('role_technician') },
            { id: 'Admin', label: t('login_municipality') },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveRole(tab.id);
                setErrorMessage('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
                activeRole === tab.id
                  ? 'bg-white dark:bg-[#0F4C5C] text-[#0F4C5C] dark:text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form Container */}
        <div className="dark:bg-[#0F172A] bg-white border dark:border-white/10 border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl">
          
          {/* Error Alert */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600 dark:text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* ══════════════ 1. RESIDENT / CITIZEN FIELDS ══════════════ */}
            {activeRole === 'Resident' && (
              <div className="space-y-4">
                <Input
                  label={t('fullName')}
                  name="fullName"
                  type="text"
                  icon={User}
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Aarav Sharma"
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label={t('emailAddress')}
                    name="email"
                    type="email"
                    icon={Mail}
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="aarav@example.com"
                    required
                  />
                  <Input
                    label={t('mobileNumber')}
                    name="mobileNumber"
                    type="tel"
                    icon={Phone}
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <Input
                      label={t('password')}
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      icon={Lock}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(p => !p)}
                      className="absolute right-3 top-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="relative">
                    <Input
                      label={t('confirmPassword')}
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      icon={Lock}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(p => !p)}
                      className="absolute right-3 top-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label={t('city')}
                    name="city"
                    type="text"
                    icon={MapPin}
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Bhubaneswar"
                    required
                  />
                  <Input
                    label={t('wardArea')}
                    name="wardArea"
                    type="text"
                    icon={Building2}
                    value={formData.wardArea}
                    onChange={handleChange}
                    placeholder="Ward 12, Riverbed Sector"
                    required
                  />
                </div>
              </div>
            )}

            {/* ══════════════ 2. TECHNICIAN FIELDS ══════════════ */}
            {activeRole === 'Technician' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label={t('fullName')}
                    name="fullName"
                    type="text"
                    icon={User}
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Rajesh Kumar"
                    required
                  />
                  <Input
                    label={t('employeeId')}
                    name="employeeId"
                    type="text"
                    icon={BadgeCheck}
                    value={formData.employeeId}
                    onChange={handleChange}
                    placeholder="TECH-8842"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label={t('emailAddress')}
                    name="email"
                    type="email"
                    icon={Mail}
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="rajesh.tech@bmc.gov.in"
                    required
                  />
                  <Input
                    label={t('mobileNumber')}
                    name="mobileNumber"
                    type="tel"
                    icon={Phone}
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    placeholder="+91 98765 11223"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label={t('organizationMunicipality')}
                    name="organization"
                    type="text"
                    icon={Building2}
                    value={formData.organization}
                    onChange={handleChange}
                    placeholder="Bhubaneswar Municipal Corp"
                    required
                  />
                  <Input
                    label={t('department')}
                    name="department"
                    type="text"
                    icon={Briefcase}
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="Drainage & IoT Telemetry"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <Input
                      label={t('password')}
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      icon={Lock}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(p => !p)}
                      className="absolute right-3 top-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="relative">
                    <Input
                      label={t('confirmPassword')}
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      icon={Lock}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(p => !p)}
                      className="absolute right-3 top-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════ 3. MUNICIPALITY / AUTHORITY FIELDS ══════════════ */}
            {activeRole === 'Admin' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label={t('fullName')}
                    name="fullName"
                    type="text"
                    icon={User}
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Dr. Sunita Pattnaik"
                    required
                  />
                  <Input
                    label={t('officialEmail')}
                    name="officialEmail"
                    type="email"
                    icon={Mail}
                    value={formData.officialEmail}
                    onChange={handleChange}
                    placeholder="dir.drainage@bmc.gov.in"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label={t('mobileNumber')}
                    name="mobileNumber"
                    type="tel"
                    icon={Phone}
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    placeholder="+91 98765 99887"
                    required
                  />
                  <Input
                    label={t('municipalityOrgName')}
                    name="municipalityName"
                    type="text"
                    icon={Building2}
                    value={formData.municipalityName}
                    onChange={handleChange}
                    placeholder="Bhubaneswar Municipal Corp"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label={t('designation')}
                    name="designation"
                    type="text"
                    icon={Briefcase}
                    value={formData.designation}
                    onChange={handleChange}
                    placeholder="Chief Environmental Officer"
                    required
                  />
                  <Input
                    label={t('officialEmployeeId')}
                    name="officialEmployeeId"
                    type="text"
                    icon={BadgeCheck}
                    value={formData.officialEmployeeId}
                    onChange={handleChange}
                    placeholder="BMC-DIR-01"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label={t('city')}
                    name="city"
                    type="text"
                    icon={MapPin}
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Bhubaneswar"
                    required
                  />
                  <Input
                    label={t('stateLabel')}
                    name="state"
                    type="text"
                    icon={MapPin}
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="Odisha"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <Input
                      label={t('password')}
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      icon={Lock}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(p => !p)}
                      className="absolute right-3 top-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="relative">
                    <Input
                      label={t('confirmPassword')}
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      icon={Lock}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(p => !p)}
                      className="absolute right-3 top-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <label className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    name="isAuthorizedRepresentative"
                    checked={formData.isAuthorizedRepresentative}
                    onChange={handleChange}
                    className="mt-0.5 rounded border-slate-300 dark:border-white/20 text-[#0F4C5C] focus:ring-[#0F4C5C]"
                    required
                  />
                  <span>{t('reg_authorizedConfirm')}</span>
                </label>
              </div>
            )}

            {/* ── Terms & Conditions Checkbox (Common to all) ── */}
            <label className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300 cursor-pointer pt-2">
              <input
                type="checkbox"
                name="agreedToTerms"
                checked={formData.agreedToTerms}
                onChange={handleChange}
                className="mt-0.5 rounded border-slate-300 dark:border-white/20 text-[#0F4C5C] focus:ring-[#0F4C5C]"
                required
              />
              <span>{t('reg_agreeTerms')}</span>
            </label>

            {/* ── Action Button with exact labels ── */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-4 bg-[#0F4C5C] hover:bg-[#0A333E] text-white shadow-lg"
              isLoading={loading}
              icon={ArrowRight}
              iconPosition="right"
            >
              {activeRole === 'Resident' && t('reg_createResident')}
              {activeRole === 'Technician' && t('reg_createTechnician')}
              {activeRole === 'Admin' && t('reg_submitVerification')}
            </Button>
          </form>

          {/* Footer Link to Login */}
          <div className="mt-6 pt-5 border-t dark:border-white/10 border-slate-100 text-center text-xs text-slate-500 dark:text-slate-400">
            {t('alreadyHaveAccount')}{' '}
            <Link to="/login" className="font-bold text-[#0EA5E9] hover:underline">
              {t('signInHere')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

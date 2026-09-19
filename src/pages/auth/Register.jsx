import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User, Mail, Lock, Phone, MapPin, Building2,
  Briefcase, BadgeCheck, Eye, EyeOff, Shield,
  CheckCircle2, ArrowRight, Sun, Moon, AlertCircle,
  ShieldCheck, RefreshCw, ArrowLeft,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { registerUser, sendOtp, verifyOtp } from '../../services/authService';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import LanguageSwitcher from '../../components/common/LanguageSwitcher';
import { customSwal } from '../../utils/swal';

export default function Register() {
  const navigate = useNavigate();
  const { theme, toggleTheme, isDark } = useTheme();
  const { t } = useLanguage();
  const roleLabel = (r) => (r === 'Admin' ? t('role_admin') : t(`role_${r.toLowerCase()}`));

  // Role: 'Resident' | 'Technician' | 'Admin'
  const [activeRole, setActiveRole] = useState('Resident');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // ── Email OTP verification (Resident / Technician only) ──
  // step: 'form' | 'otp'
  const [step, setStep] = useState('form');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpInfo, setOtpInfo] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpInputsRef = useRef([]);

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => setResendCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

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

  const buildPayload = () => ({
    ...formData,
    role: activeRole,
    email: activeRole === 'Admin' ? formData.officialEmail : formData.email,
  });

  const validateForm = () => {
    if (formData.password.length < 6) {
      setErrorMessage(t('reg_errPasswordLength'));
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage(t('reg_errPasswordMismatch'));
      return false;
    }
    if (!formData.agreedToTerms) {
      setErrorMessage(t('reg_errTerms'));
      return false;
    }
    if (activeRole === 'Admin' && !formData.isAuthorizedRepresentative) {
      setErrorMessage(t('reg_errAuthorized'));
      return false;
    }
    return true;
  };

  // Final step: POST /register (with otpToken for Resident/Technician)
  const completeRegistration = async (otpToken) => {
    const payload = { ...buildPayload(), otpToken };

    await registerUser(payload);

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
  };

  const requestOtp = async () => {
    const res = await sendOtp(formData.email.trim(), formData.fullName.trim());
    setOtpInfo(res?.message || t('reg_otpSent'));
    setResendCooldown(60);
  };

  // Step 1: validate form → Admin registers directly, others get an OTP first
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (activeRole === 'Admin') {
        await completeRegistration();
      } else {
        await requestOtp();
        setOtpDigits(['', '', '', '', '', '']);
        setStep('otp');
        setTimeout(() => otpInputsRef.current[0]?.focus(), 50);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.error || t('reg_failed'));
    } finally {
      setLoading(false);
    }
  };

  // Step 2: verify OTP → get otpToken → register
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const otp = otpDigits.join('');
    if (otp.length < 6) {
      setErrorMessage(t('reg_otpIncomplete'));
      return;
    }

    setLoading(true);
    try {
      const { otpToken } = await verifyOtp(formData.email.trim(), otp);
      await completeRegistration(otpToken);
    } catch (err) {
      setErrorMessage(err.response?.data?.error || t('reg_failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || loading) return;
    setErrorMessage('');
    setLoading(true);
    try {
      await requestOtp();
      setOtpDigits(['', '', '', '', '', '']);
      otpInputsRef.current[0]?.focus();
    } catch (err) {
      setErrorMessage(err.response?.data?.error || t('reg_failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleDigitChange = (index, value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length > 1) {
      // Pasted multi-digit code
      const pasted = cleaned.slice(0, 6).split('');
      const next = [...otpDigits];
      pasted.forEach((d, i) => { if (i < 6) next[i] = d; });
      setOtpDigits(next);
      otpInputsRef.current[Math.min(pasted.length, 5)]?.focus();
      return;
    }
    const next = [...otpDigits];
    next[index] = cleaned;
    setOtpDigits(next);
    setErrorMessage('');
    if (cleaned && index < 5) otpInputsRef.current[index + 1]?.focus();
  };

  const handleDigitKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
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
            { id: 'Admin', label: t('role_admin') },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveRole(tab.id);
                setErrorMessage('');
                setStep('form');
                setOtpInfo('');
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

          {/* ══════════════ OTP VERIFICATION STEP ══════════════ */}
          {step === 'otp' && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto shadow-sm">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-black font-display text-slate-900 dark:text-white">
                  {t('reg_verifyEmailTitle')}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('reg_otpSentTo')}{' '}
                  <strong className="text-sky-500 font-semibold">{formData.email}</strong>
                </p>
              </div>

              {otpInfo && (
                <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-500/15 border border-sky-200 dark:border-sky-500/30 text-sky-700 dark:text-sky-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-sky-500" />
                  <span>{otpInfo}</span>
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 text-center">
                    {t('reg_enterOtp')}
                  </label>
                  <div className="flex justify-center gap-2 sm:gap-2.5">
                    {otpDigits.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (otpInputsRef.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleDigitChange(index, e.target.value)}
                        onKeyDown={(e) => handleDigitKeyDown(index, e)}
                        className="w-11 h-12 text-center text-xl font-bold font-mono rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all shadow-inner"
                      />
                    ))}
                  </div>

                  <div className="text-center mt-2">
                    {resendCooldown > 0 ? (
                      <span className="text-[11px] text-slate-400">
                        {t('fp_resendIn')} <strong className="text-slate-600 dark:text-slate-300">{resendCooldown}s</strong>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={loading}
                        className="text-[11px] text-sky-500 hover:underline font-semibold inline-flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" /> {t('fp_resendCode')}
                      </button>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full mt-2 bg-[#0F4C5C] hover:bg-[#0A333E] text-white shadow-lg"
                  isLoading={loading}
                  icon={CheckCircle2}
                  iconPosition="right"
                >
                  {t('reg_verifyAndCreate')}
                </Button>
              </form>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => { setStep('form'); setErrorMessage(''); setOtpInfo(''); }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-sky-500 transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> {t('reg_backToForm')}
                </button>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className={`space-y-4 ${step === 'otp' ? 'hidden' : ''}`}>
            
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

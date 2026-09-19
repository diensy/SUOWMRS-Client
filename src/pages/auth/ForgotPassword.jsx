import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail, Lock, Eye, EyeOff, ShieldCheck, CheckCircle2,
  ArrowRight, ArrowLeft, Sun, Moon, AlertCircle, RefreshCw, KeyRound
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import LanguageSwitcher from '../../components/common/LanguageSwitcher';
import { forgotPassword, verifyResetOtp, resetPassword } from '../../services/authService';

export default function ForgotPassword() {
  const { isDark, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Steps: 1 = Email, 2 = OTP + New Password, 3 = Success
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successInfo, setSuccessInfo] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const otpInputsRef = useRef([]);

  // Countdown timer for resend
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => setResendCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Handle OTP digit changes
  const handleDigitChange = (index, value) => {
    // Only accept numeric digit
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length > 1) {
      // Pasted multi-digit
      const pastedDigits = cleaned.slice(0, 6).split('');
      const newDigits = [...otpDigits];
      pastedDigits.forEach((d, i) => {
        if (i < 6) newDigits[i] = d;
      });
      setOtpDigits(newDigits);
      const nextFocus = Math.min(pastedDigits.length, 5);
      otpInputsRef.current[nextFocus]?.focus();
      return;
    }

    const newDigits = [...otpDigits];
    newDigits[index] = cleaned;
    setOtpDigits(newDigits);
    setErrorMsg('');

    // Advance to next input
    if (cleaned && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  // STEP 1: Submit email to request OTP
  const handleRequestOtp = async (e) => {
    if (e) e.preventDefault();
    if (!email.trim()) {
      setErrorMsg(t('fp_errEnterEmail'));
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      const res = await forgotPassword(email.trim());
      setSuccessInfo(res.message || t('fp_codeSent'));
      setStep(2);
      setResendCooldown(60);
      setTimeout(() => otpInputsRef.current[0]?.focus(), 200);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || t('fp_errNoAccount'));
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      setLoading(true);
      setErrorMsg('');
      await forgotPassword(email.trim());
      setSuccessInfo(t('fp_freshCodeSent'));
      setResendCooldown(60);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || t('fp_errResend'));
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify OTP and save new password
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    const otp = otpDigits.join('');
    if (otp.length < 6) {
      setErrorMsg(t('fp_errFullCode'));
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setErrorMsg(t('fp_errPasswordLength'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg(t('reg_errPasswordMismatch'));
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      await resetPassword({
        email: email.trim(),
        otp,
        newPassword,
        confirmPassword,
      });
      setStep(3);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || t('fp_errReset'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen dark:bg-[#090E17] bg-[#F8FAFC] text-slate-800 dark:text-slate-100 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12 selection:bg-brand-accent selection:text-white transition-colors duration-200">
      
      {/* Top Navbar */}
      <div className="w-full max-w-md flex items-center justify-between mb-4">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-white p-0.5 shadow-sm border border-slate-200 dark:border-white/10 flex items-center justify-center overflow-hidden">
            <img src="/logo.png" alt="SUOWMRS" className="w-full h-full object-contain" />
          </div>
          <span className="font-black text-xl tracking-tight text-slate-900 dark:text-white font-display">
            SUOW<span className="text-sky-500">MRS</span>
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

      <div className="w-full max-w-md">
        {/* Step Progress Indicators */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step === s
                  ? 'w-10 bg-sky-500 shadow-sm shadow-sky-500/50'
                  : step > s
                  ? 'w-5 bg-emerald-500'
                  : 'w-5 bg-slate-300 dark:bg-white/10'
              }`}
            />
          ))}
        </div>

        {/* Card Container */}
        <div className="dark:bg-[#0F172A] bg-white border dark:border-white/10 border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          
          <AnimatePresence mode="wait">
            {/* ── STEP 1: ENTER EMAIL ── */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-500 flex items-center justify-center mx-auto shadow-sm">
                    <KeyRound className="w-6 h-6" />
                  </div>
                  <h1 className="text-2xl font-black font-display text-slate-900 dark:text-white">
                    {t('fp_title')}
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
                    {t('fp_subtitle')}
                  </p>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600 dark:text-rose-400" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleRequestOtp} className="space-y-4">
                  <Input
                    label={t('fp_registeredEmail')}
                    type="email"
                    icon={Mail}
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrorMsg(''); }}
                    placeholder="name@organization.gov / user@mail.com"
                    required
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full bg-[#0F4C5C] hover:bg-[#0A333E] text-white shadow-lg font-bold"
                    isLoading={loading}
                    icon={ArrowRight}
                    iconPosition="right"
                  >
                    {t('fp_sendCode')}
                  </Button>
                </form>

                <div className="text-center pt-2">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-sky-500 transition"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> {t('fp_backToSignIn')}
                  </Link>
                </div>
              </motion.div>
            )}

            {/* ── STEP 2: ENTER OTP & NEW PASSWORD ── */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <div className="text-center space-y-1">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto shadow-sm">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h1 className="text-2xl font-black font-display text-slate-900 dark:text-white">
                    {t('fp_resetTitle')}
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t('fp_codeSentTo')} <strong className="text-sky-500 font-semibold">{email}</strong>
                  </p>
                </div>

                {successInfo && (
                  <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-500/15 border border-sky-200 dark:border-sky-500/30 text-sky-700 dark:text-sky-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-sky-500" />
                    <span>{successInfo}</span>
                  </div>
                )}

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleResetSubmit} className="space-y-4">
                  {/* 6 Digit OTP Input Grid */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 text-center">
                      {t('fp_enterCode')}
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
                          onKeyDown={(e) => handleKeyDown(index, e)}
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
                          onClick={handleResend}
                          disabled={loading}
                          className="text-[11px] text-sky-500 hover:underline font-semibold inline-flex items-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" /> {t('fp_resendCode')}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="relative">
                    <Input
                      label={t('fp_newPassword')}
                      type={showPassword ? 'text' : 'password'}
                      icon={Lock}
                      value={newPassword}
                      onChange={(e) => { setNewPassword(e.target.value); setErrorMsg(''); }}
                      placeholder={t('fp_min6')}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-3 top-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Confirm Password */}
                  <div className="relative">
                    <Input
                      label={t('fp_confirmNewPassword')}
                      type={showConfirmPassword ? 'text' : 'password'}
                      icon={Lock}
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setErrorMsg(''); }}
                      placeholder={t('fp_reenter')}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((p) => !p)}
                      className="absolute right-3 top-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full bg-[#0F4C5C] hover:bg-[#0A333E] text-white shadow-lg font-bold mt-2"
                    isLoading={loading}
                    icon={CheckCircle2}
                    iconPosition="right"
                  >
                    {t('fp_confirmUpdate')}
                  </Button>
                </form>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => { setStep(1); setErrorMsg(''); }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-sky-500 transition"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> {t('fp_changeEmail')}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 3: SUCCESS CONFIRMATION ── */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="text-center space-y-5 py-4"
              >
                <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 className="w-9 h-9" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-black font-display text-slate-900 dark:text-white">
                    {t('fp_completeTitle')}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                    {t('fp_completeDesc')} <strong className="text-emerald-500">{email}</strong>.
                  </p>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/login', { state: { successMsg: t('fp_loginWithNew') } })}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg font-bold"
                  icon={ArrowRight}
                  iconPosition="right"
                >
                  {t('fp_returnSignIn')}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </div>
    </div>
  );
}

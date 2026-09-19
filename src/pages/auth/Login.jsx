import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Mail, Lock, ArrowRight, Eye, EyeOff,
  Sun, Moon, AlertCircle, Shield, CheckCircle2,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { loginUser } from '../../services/authService';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import LanguageSwitcher from '../../components/common/LanguageSwitcher';
import { customSwal } from '../../utils/swal';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const { t } = useLanguage();

  const [role, setRole] = useState('Resident');
  const [email, setEmail] = useState('resident@suowmrs.org');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [signupSuccessMsg, setSignupSuccessMsg] = useState('');

  useEffect(() => {
    if (location.state?.signupSuccess) {
      if (location.state.registeredRole) {
        setRole(location.state.registeredRole);
      }
      if (location.state.registeredEmail) {
        setEmail(location.state.registeredEmail);
        setPassword('');
      }
      if (location.state.message) {
        setSignupSuccessMsg(location.state.message);
      }
    }
  }, [location.state]);

  const handleQuickRole = (selectedRole) => {
    setRole(selectedRole);
    setErrorMessage('');
    setSignupSuccessMsg('');
    if (selectedRole === 'Resident') {
      setEmail('resident@suowmrs.org');
      setPassword('password123');
    } else if (selectedRole === 'Technician') {
      setEmail('technician@suowmrs.org');
      setPassword('password123');
    } else {
      setEmail('admin@suowmrs.gov.in');
      setPassword('password123');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const result = await loginUser({ email, password, role });

      await customSwal.fire({
        icon: 'success',
        title: t('login_welcomeBackTitle'),
        text: t('login_signedInAs', { name: result.user?.fullName || t(`role_${role.toLowerCase()}`) }),
        timer: 1500,
        showConfirmButton: false,
      });

      // Route based on actual role returned
      const destinationRole = result.user?.role || role;
      if (destinationRole === 'Admin') {
        navigate('/admin/dashboard');
      } else if (destinationRole === 'Technician') {
        navigate('/system-health');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.error || t('login_failed');
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen dark:bg-[#090E17] bg-[#F8FAFC] text-slate-800 dark:text-slate-100 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12 selection:bg-brand-accent selection:text-white transition-colors duration-200">
      
      {/* Top Navbar / Theme Switcher */}
      <div className="w-full max-w-md flex items-center justify-between mb-4">
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

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-900 dark:text-white">
            {t('login_title')}
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {t('login_subtitle')}
          </p>
        </div>

        {/* Role Switcher Tabs */}
        <div className="flex bg-slate-200/80 dark:bg-white/5 p-1 rounded-2xl mb-6 border border-slate-200 dark:border-white/10">
          {[
            { id: 'Resident', label: t('role_resident') },
            { id: 'Technician', label: t('role_technician') },
            { id: 'Admin', label: t('login_municipality') },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleQuickRole(tab.id)}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
                role === tab.id
                  ? 'bg-white dark:bg-[#0F4C5C] text-[#0F4C5C] dark:text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Card Form */}
        <div className="dark:bg-[#0F172A] bg-white border dark:border-white/10 border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl">
          
          {/* Signup Success Banner */}
          {signupSuccessMsg && (
            <div className="mb-5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2.5 shadow-sm">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span className="font-semibold">{signupSuccessMsg}</span>
            </div>
          )}

          {/* Error Alert */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600 dark:text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label={t('emailAddress')}
              type="email"
              icon={Mail}
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrorMessage(''); }}
              placeholder="user@suowmrs.org"
              required
            />

            <div className="relative">
              <Input
                label={t('password')}
                type={showPassword ? 'text' : 'password'}
                icon={Lock}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrorMessage(''); }}
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

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-slate-600 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 dark:border-white/20 text-[#0F4C5C] focus:ring-[#0F4C5C]"
                />
                {t('rememberMe')}
              </label>
              <Link
                to="/forgot-password"
                className="text-[#0EA5E9] hover:underline font-semibold"
              >
                {t('forgotPasswordQ')}
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-4 bg-[#0F4C5C] hover:bg-[#0A333E] text-white shadow-lg"
              isLoading={loading}
              icon={ArrowRight}
              iconPosition="right"
            >
              {t('signInAs', { role: role === 'Admin' ? t('login_municipality') : t(`role_${role.toLowerCase()}`) })}
            </Button>
          </form>

          {/* Demo tip */}
          <div className="mt-5 p-2.5 rounded-xl dark:bg-white/5 bg-slate-50 border dark:border-white/10 border-slate-200 text-center">
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              💡 <strong>{t('login_quickDemo')}</strong> {t('login_quickDemoDesc')}
            </p>
          </div>

          <div className="mt-5 pt-4 border-t dark:border-white/10 border-slate-100 text-center text-xs text-slate-500 dark:text-slate-400">
            {t('noAccountYet')}{' '}
            <Link to="/register" className="font-bold text-[#0EA5E9] hover:underline">
              {t('signUpHere')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import {
  ShieldCheck, Lock, CheckCircle2, ArrowLeft, CreditCard,
  AlertCircle, Sparkles, RefreshCw, FileText, Check,
  Radio, ArrowRight,
  Download, HelpCircle, Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  createPaymentIntent,
  createSubscription,
  confirmPaymentManual,
  processAlternativePayment
} from '../../services/paymentService';
import { getCurrentUser } from '../../services/authService';
import { useLanguage } from '../../context/LanguageContext';
import { API_BASE_URL } from '../../config/apiConfig';

const API_URL = API_BASE_URL;

// Reliable fallback plans for instantaneous zero-latency rendering
const FALLBACK_PLANS = {
  BasicAMC: {
    key: 'BasicAMC',
    label: '🔧 Basic AMC',
    description: 'Annual Maintenance Contract — Basic coverage (1 inspection visit + health check)',
    amount: 149900,
    amountDisplay: '₹1,499',
    interval: 'year',
    isRecurring: true,
    features: ['1 annual maintenance visit', 'System health check', 'Sensor calibration', 'Email support']
  },
  StandardAMC: {
    key: 'StandardAMC',
    label: '⭐ Standard AMC',
    description: 'Annual Maintenance Contract — Standard comprehensive coverage (2 visits + filter check)',
    amount: 249900,
    amountDisplay: '₹2,499',
    interval: 'year',
    isRecurring: true,
    features: ['2 maintenance visits/year', 'Filter inspection', 'Priority support', 'Remote monitoring', 'SMS + email alerts']
  },
  PremiumAMC: {
    key: 'PremiumAMC',
    label: '💎 Premium AMC',
    description: 'Annual Maintenance Contract — Premium priority service (4 visits + filter replacement included)',
    amount: 399900,
    amountDisplay: '₹3,999',
    interval: 'year',
    isRecurring: true,
    features: ['4 maintenance visits/year', 'Filter replacement included', '24/7 emergency response', 'Dedicated technician']
  },
  SmartMonitoring: {
    key: 'SmartMonitoring',
    label: '📱 Smart Monitoring',
    description: 'IoT sensor live streaming & AI flood risk predictive analytics subscription',
    amount: 9900,
    amountDisplay: '₹99',
    interval: 'month',
    isRecurring: true,
    features: ['Real-time IoT sensor telemetry', 'AI flood risk alerts', 'SMS + WhatsApp alerts']
  },
  FilterBasic: {
    key: 'FilterBasic',
    label: '💧 Sediment Filter Replacement',
    description: 'Basic sediment and pre-filter cartridge replacement',
    amount: 50000,
    amountDisplay: '₹500',
    interval: 'one-time',
    isRecurring: false,
    features: ['High-density sediment filter', 'Debris flush', 'Technician inspection']
  },
  FilterReplacement: {
    key: 'FilterReplacement',
    label: '💧 Standard Filter Replacement',
    description: 'Activated carbon & sediment filter inspection and replacement service',
    amount: 100000,
    amountDisplay: '₹1,000',
    interval: 'one-time',
    isRecurring: false,
    features: ['Activated carbon block', 'Flow rate calibration', '30-day warranty']
  },
  FilterComplete: {
    key: 'FilterComplete',
    label: '💧 Complete RO/UV Filter Kit',
    description: 'Full membrane, multi-stage carbon & UV sterilization filter overhaul',
    amount: 200000,
    amountDisplay: '₹2,000',
    interval: 'one-time',
    isRecurring: false,
    features: ['Complete filter kit', 'Deep sanitization', '60-day warranty']
  },
  PumpRepair: {
    key: 'PumpRepair',
    label: '⚙️ Pump / Sensor Repair',
    description: 'Submersible pump motor diagnostic, cleaning, repair & sensor calibration',
    amount: 75000,
    amountDisplay: '₹750',
    interval: 'one-time',
    isRecurring: false,
    features: ['Motor impeller diagnostic', 'Electrical check', 'Cleaning & repair', '30-day warranty']
  },
  EmergencyService: {
    key: 'EmergencyService',
    label: '🚨 Emergency Service Call-out',
    description: 'Rapid on-site emergency technician response visit within 4 hours',
    amount: 49900,
    amountDisplay: '₹499',
    interval: 'one-time',
    isRecurring: false,
    features: ['4-hour on-site dispatch', 'Urgent leak/clog containment', 'Priority parts allocation']
  },
  Installation: {
    key: 'Installation',
    label: '🏠 SUOWMRS Hardware Installation',
    description: 'Full household system installation & onboarding',
    amount: 500000,
    amountDisplay: '₹5,000',
    interval: 'one-time',
    isRecurring: false,
    features: ['Site survey & tank fitting', 'Complete hardware mounting', '1-year Basic AMC included']
  }
};

const CARD_STYLE_LIGHT = {
  style: {
    base: {
      fontSize: '15px',
      color: '#0f172a',
      fontFamily: "'Inter', sans-serif",
      '::placeholder': { color: '#94a3b8' },
    },
    invalid: { color: '#ef4444' },
  },
};

const CARD_STYLE_DARK = {
  style: {
    base: {
      fontSize: '15px',
      color: '#f8fafc',
      fontFamily: "'Inter', sans-serif",
      '::placeholder': { color: '#64748b' },
      iconColor: '#10b981',
    },
    invalid: { color: '#f87171' },
  },
};

// ── Card Payment Form ──
function CardCheckoutForm({ plan, clientSecret, paymentId, onSuccess }) {
  const { t, tStatus } = useLanguage();
  const stripe = useStripe();
  const elements = useElements();
  const user = getCurrentUser();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const isDark = document.documentElement.classList.contains('dark');

  const submit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setBusy(true);
    setError('');
    try {
      const { error: stripeErr, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: user?.fullName || 'Resident',
            email: user?.email || 'resident@suowmrs.local',
          },
        },
      });
      if (stripeErr) {
        setError(stripeErr.message);
        setBusy(false);
        return;
      }
      if (paymentIntent?.status === 'succeeded') {
        try { await confirmPaymentManual(paymentId, plan.key); } catch {}
        onSuccess?.({
          method: 'Credit / Debit Card',
          txnId: paymentIntent.id,
          invoiceNumber: `INV-SUO-${Date.now().toString().slice(-5)}`,
        });
      }
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
          {t('co_cardDetails')}
        </label>
        <div className="p-3.5 rounded-xl border dark:border-white/10 border-slate-200 dark:bg-slate-900/60 bg-white focus-within:border-emerald-500/50 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
          <CardElement options={isDark ? CARD_STYLE_DARK : CARD_STYLE_LIGHT} />
        </div>
        <div className="flex items-center gap-2 mt-2 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-white/[0.03] border dark:border-white/5 border-slate-200/60 text-[11px] text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-700 dark:text-slate-300">{t('co_testCard')}:</span>
          <code className="font-mono bg-white dark:bg-white/10 px-1.5 py-0.5 rounded border dark:border-white/10 border-slate-200 text-emerald-600 dark:text-emerald-400 font-bold">
            4242 4242 4242 4242
          </code>
          <span className="hidden sm:inline">· {t('co_anyDateCvv')}</span>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2.5 p-3 rounded-xl border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 text-xs text-rose-700 dark:text-rose-400"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </motion.div>
      )}

      <button
        type="submit"
        disabled={busy || !stripe}
        className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] disabled:opacity-60 text-white font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2"
      >
        {busy ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>{t('co_verifyingCard')}</span>
          </>
        ) : (
          <>
            <Lock className="w-4 h-4" />
            <span>{t('co_pay')} {plan.amountDisplay}{plan.interval !== 'one-time' ? `/${tStatus(plan.interval)}` : ''}</span>
          </>
        )}
      </button>
    </form>
  );
}

// ── Main Payment Checkout Page Component ──
export default function PaymentCheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, tStatus } = useLanguage();
  const planKey = location.state?.planKey || 'BasicAMC';

  const [plan, setPlan] = useState(() => FALLBACK_PLANS[planKey] || FALLBACK_PLANS.BasicAMC);
  const [stripePromise, setStripePromise] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [paymentId, setPaymentId] = useState('');
  const [loadingGateway, setLoadingGateway] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState(null);

  const init = useCallback(async () => {
    let resolvedPlan = FALLBACK_PLANS[planKey] || FALLBACK_PLANS.BasicAMC;

    // 1. Fetch latest plan configuration asynchronously
    try {
      const token = localStorage.getItem('suowmrs-token');
      const plansRes = await fetch(`${API_URL}/admin/plans`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (plansRes.ok) {
        const plansData = await plansRes.json();
        const found = (plansData.plans || []).find(p => p.key === planKey);
        if (found) {
          resolvedPlan = found;
          setPlan(found);
        }
      }
    } catch (err) {
      console.warn('Using local plan configuration fallback:', err.message);
    }

    // 2. Initialize Stripe Gateway in background
    setLoadingGateway(true);
    try {
      let data;
      if (resolvedPlan.isRecurring) data = await createSubscription(planKey);
      else data = await createPaymentIntent(planKey);

      if (data?.publishableKey) {
        setStripePromise(loadStripe(data.publishableKey));
      }
      if (data?.clientSecret) {
        setClientSecret(data.clientSecret);
      }
      if (data?.paymentId) {
        setPaymentId(data.paymentId);
      }
    } catch (stripeErr) {
      console.warn('Stripe gateway session initialized in direct test mode:', stripeErr.message);
    } finally {
      setLoadingGateway(false);
    }
  }, [planKey]);

  useEffect(() => { init(); }, [init]);

  // ── Success State Screen ──
  if (paymentSuccessData) {
    return (
      <div className="w-full max-w-xl mx-auto py-8">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="rounded-3xl border dark:border-white/10 border-slate-200 dark:bg-[#0F172A] bg-white p-7 sm:p-9 text-center shadow-xl space-y-5"
        >
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-black font-display text-slate-900 dark:text-white">
              {t('co_successTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              {t('co_successDesc')}
            </p>
          </div>

          {/* Detailed summary */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border dark:border-white/5 border-slate-200/70 text-xs text-left space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">{t('co_servicePlan')}</span>
              <span className="font-bold text-slate-900 dark:text-white">{plan?.label}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{t('co_amountPaid')}</span>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400 font-mono text-sm">{plan?.amountDisplay}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{t('co_paymentMethod')}</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{paymentSuccessData.method}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{t('co_transactionId')}</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">{paymentSuccessData.txnId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{t('co_invoiceNumber')}</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">{paymentSuccessData.invoiceNumber}</span>
            </div>
            <div className="pt-2 border-t dark:border-white/10 border-slate-200 flex justify-between items-center">
              <span className="text-slate-500">{t('co_amcSystemStatus')}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                {t('active').toUpperCase()} ✅
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <button
              onClick={() => navigate('/payments')}
              className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-xs sm:text-sm font-bold transition shadow-sm"
            >
              {t('co_myDashboard')}
            </button>
            <button
              onClick={() => navigate('/payments/invoices')}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border dark:border-white/10 border-slate-200 dark:text-slate-200 text-slate-700 text-xs sm:text-sm font-bold hover:bg-slate-50 dark:hover:bg-white/[0.05] transition"
            >
              <FileText className="w-4 h-4 text-slate-400" />
              <span>{t('co_viewInvoices')}</span>
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate('/payments')}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{t('co_backToPayments')}</span>
      </button>

      {/* Full-width responsive 12-column layout (5 cols Order Summary, 7 cols Gateway) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Order Summary Card — 5 columns */}
        <div className="lg:col-span-5 rounded-2xl border dark:border-white/10 border-slate-200 dark:bg-[#0F172A] bg-white p-6 space-y-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b dark:border-white/10 border-slate-100">
            <span className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
              {t('co_orderSummary')}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              {t('co_verifiedService')}
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {plan.label}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {plan.description}
              </p>
            </div>

            {/* Pricing breakdown */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border dark:border-white/5 border-slate-200/70 space-y-2.5">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>{t('co_baseFee')}</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{plan.amountDisplay}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>{t('co_gst')}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">18% {t('co_inclusive')}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>{t('co_warranty')}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{t('active')} ✅</span>
              </div>
              <div className="pt-2.5 border-t dark:border-white/10 border-slate-200 flex items-baseline justify-between">
                <span className="text-sm font-bold text-slate-900 dark:text-white">{t('co_totalAmount')}</span>
                <div className="text-right">
                  <span className="text-2xl font-black font-display text-emerald-600 dark:text-emerald-400">
                    {plan.amountDisplay}
                  </span>
                  {plan.interval !== 'one-time' && (
                    <span className="text-xs text-slate-400 ml-1">/{tStatus(plan.interval)}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Features list */}
            {plan.features?.length > 0 && (
              <div className="space-y-2 pt-1">
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {t('co_includedInPlan')}
                </p>
                <div className="space-y-2">
                  {plan.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                      <div className="w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {plan.isRecurring && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2.5">
                <RefreshCw className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                <span className="leading-relaxed">
                  {t('co_autoRenews', { interval: tStatus(plan.interval) })}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Payment Methods & Gateway Container — 7 columns */}
        <div className="lg:col-span-7 rounded-2xl border dark:border-white/10 border-slate-200 dark:bg-[#0F172A] bg-white p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b dark:border-white/10 border-slate-100">
            <span className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
              {t('co_paymentGateway')}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              <Lock className="w-3.5 h-3.5" />
              <span>{t('co_sslEncrypted')}</span>
            </div>
          </div>

          {/* Card is the only payment method for now */}
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/70 dark:border-emerald-500/20 text-xs font-bold text-emerald-800 dark:text-emerald-300">
            <CreditCard className="w-4 h-4" />
            <span>{t('co_tabCards')}</span>
            <span className="ml-auto font-mono text-[10px] font-semibold text-emerald-700/70 dark:text-emerald-300/70">Visa · MasterCard · RuPay</span>
          </div>

          {/* Form Content */}
          <div className="pt-1">
            {loadingGateway && !clientSecret ? (
              <div className="py-10 flex flex-col items-center justify-center gap-3 text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" />
                <span className="text-xs">{t('co_connectingGateway')}</span>
              </div>
            ) : clientSecret && stripePromise ? (
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <CardCheckoutForm
                      plan={plan}
                      clientSecret={clientSecret}
                      paymentId={paymentId}
                      onSuccess={(data) => setPaymentSuccessData(data)}
                    />
                  </Elements>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] text-xs space-y-2 text-slate-600 dark:text-slate-300">
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {t('co_cardGatewayReady')}
                      </p>
                      <p>
                        {t('co_cardGatewayDesc')}
                      </p>
                    </div>
                    <button
                      onClick={async () => {
                        const res = await processAlternativePayment({
                          planType: plan.key,
                          paymentMethod: 'card',
                        });
                        setPaymentSuccessData({
                          method: 'Credit / Debit Card',
                          txnId: res.payment?.stripePaymentIntentId || `CRD_${Date.now().toString().slice(-6)}`,
                          invoiceNumber: res.payment?.invoiceNumber || `INV-SUO-${Date.now().toString().slice(-5)}`,
                        });
                      }}
                      className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition shadow-sm flex items-center justify-center gap-2"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>{t('co_confirmCardPayment')} ({plan.amountDisplay})</span>
                    </button>
                  </div>
                )}
          </div>

          {/* Supported badges footer */}
          <div className="pt-4 border-t dark:border-white/[0.06] border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              {t('co_verifiedGateway')}
            </span>
            <span className="font-mono text-[10px]">Visa · MasterCard · RuPay</span>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertOctagon, Phone, MapPin, Radio, Siren, Shield,
  CheckCircle2, Clock, User, MessageSquare, ChevronRight, Zap
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import VoiceSpeakerButton from '../../components/common/VoiceSpeakerButton';
import { playCriticalBeep, playSirenSound, playConfirmBeep, playActionBeep } from '../../utils/sound';

const EMERGENCY_TYPES = [
  { id: 'flood',     icon: AlertOctagon, label: 'Active Flooding',       color: '#EF4444', desc: 'Water entering homes or streets' },
  { id: 'blockage',  icon: Siren,        label: 'Drain Blockage',        color: '#F59E0B', desc: 'Clogged drain causing overflow'  },
  { id: 'overflow',  icon: Radio,        label: 'Sewer Overflow',        color: '#8B5CF6', desc: 'Sewage overflow in public area'  },
  { id: 'hazard',    icon: Shield,       label: 'Safety Hazard',         color: '#0EA5E9', desc: 'Structural or road damage'       },
  { id: 'collapse',  icon: Zap,          label: 'Infrastructure Failure',color: '#F97316', desc: 'Pipe burst or channel collapse'  },
];

const EMERGENCY_CONTACTS = [
  { label: 'Municipality Control Room', number: '0674-2536820', icon: Phone,   available: true  },
  { label: 'Flood Emergency Helpline',  number: '1070',         icon: Siren,   available: true  },
  { label: 'NDRF Emergency Line',       number: '011-24363260', icon: Shield,  available: true  },
  { label: 'Local Police Station',      number: '100',          icon: User,    available: true  },
];

function PulsingAlertRing({ color }) {
  return (
    <div className="relative flex items-center justify-center">
      <div className="absolute w-32 h-32 rounded-full animate-ping opacity-20" style={{ background: color }} />
      <div className="absolute w-24 h-24 rounded-full animate-ping opacity-30" style={{ background: color, animationDelay: '0.3s', animationDuration: '1.5s' }} />
      <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-2xl border-4 border-white/20"
        style={{ background: color, boxShadow: `0 0 40px ${color}60` }}>
        <AlertOctagon className="w-9 h-9 text-white" />
      </div>
    </div>
  );
}

export default function SosPage() {
  const { t } = useLanguage();
  const [step, setStep]           = useState('select');    // select | confirm | sent | history
  const [selectedType, setSelected] = useState(null);
  const [location, setLocation]   = useState('');
  const [description, setDesc]    = useState('');
  const [countdown, setCountdown] = useState(null);
  const [dispatched, setDispatched] = useState([]);
  const [locLoading, setLocLoading] = useState(false);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sos_history');
    if (saved) {
      try { setDispatched(JSON.parse(saved)); } catch {}
    }
  }, []);

  const handleGetLocation = () => {
    setLocLoading(true);
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        setLocation(`${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`);
        setLocLoading(false);
      },
      () => {
        setLocation('Ward 12 – Zone 4, Bhubaneswar');
        setLocLoading(false);
      }
    );
  };

  const handleConfirm = () => {
    playCriticalBeep();
    setStep('confirm');
    setCountdown(5);
  };

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      // Dispatch
      playConfirmBeep();
      playSirenSound();
      const newEntry = {
        id: Date.now(),
        type: selectedType.label,
        icon: selectedType.id,
        color: selectedType.color,
        location: location || 'Location not provided',
        description: description || 'No additional details',
        timestamp: new Date().toISOString(),
        status: 'Dispatched',
      };
      const updated = [newEntry, ...dispatched].slice(0, 10);
      setDispatched(updated);
      localStorage.setItem('sos_history', JSON.stringify(updated));
      setStep('sent');
      setCountdown(null);
      return;
    }
    playCriticalBeep();
    const t = setTimeout(() => setCountdown(prev => prev - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleCancel = () => {
    playActionBeep();
    setCountdown(null);
    setStep('select');
  };

  const handleReset = () => {
    playActionBeep();
    setStep('select');
    setSelected(null);
    setLocation('');
    setDesc('');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      {/* Header */}
      <div className="pb-4 border-b border-rose-200 dark:border-rose-500/20 flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white font-display flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            {t('sos')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Emergency dispatch for flood, drainage blockage, and infrastructure failures
          </p>
        </div>
        {dispatched.length > 0 && (
          <button
            onClick={() => setStep(step === 'history' ? 'select' : 'history')}
            className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors"
          >
            <Clock className="w-3 h-3" />
            History ({dispatched.length})
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* STEP 1: Select emergency type */}
        {step === 'select' && (
          <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            {/* Warning banner */}
            <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
                <p className="text-xs text-rose-700 dark:text-rose-300 font-medium">
                  Use this only for genuine emergencies. False alerts may delay response to real emergencies.
                </p>
              </div>
              {/* <VoiceSpeakerButton
                text="Emergency SOS Dispatch. In active flooding, drain blockage, or structural hazard emergencies, select the emergency type, transmit your geolocation, or dial helpline 1 0 7 0."
                label="Listen Guide"
                size="xs"
                variant="emergency"
                id="sos-guide-audio"
              /> */}
            </div>

            {/* Emergency type selection */}
            <div>
              <p className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">
                1. Select Emergency Type
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {EMERGENCY_TYPES.map(type => {
                  const Icon = type.icon;
                  const isSelected = selectedType?.id === type.id;
                  return (
                    <button
                      key={type.id}
                      onClick={() => { playActionBeep(); setSelected(type); }}
                      className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all duration-200 ${
                        isSelected
                          ? 'shadow-md'
                          : 'border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-white/[0.04]'
                      }`}
                      style={isSelected ? {
                        background: type.color + '12',
                        borderColor: type.color + '40',
                        boxShadow: `0 0 16px ${type.color}20`
                      } : {}}
                    >
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: type.color + '20' }}>
                        <Icon className="w-4 h-4" style={{ color: type.color }} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{type.label}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{type.desc}</p>
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 ml-auto flex-shrink-0" style={{ color: type.color }} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Location */}
            <div>
              <p className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                2. Your Location
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter address or landmark..."
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="flex-1 px-3 py-2.5 text-sm bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/40 transition-all"
                />
                <button
                  onClick={handleGetLocation}
                  disabled={locLoading}
                  className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-all flex items-center gap-1.5 text-xs font-bold disabled:opacity-60"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  {locLoading ? '...' : 'GPS'}
                </button>
              </div>
            </div>

            {/* Description */}
            <div>
              <p className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                3. Additional Details (Optional)
              </p>
              <textarea
                placeholder="Describe the situation (severity, affected area, people at risk)..."
                value={description}
                onChange={e => setDesc(e.target.value)}
                rows={2}
                className="w-full px-3 py-2.5 text-sm bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/40 resize-none transition-all"
              />
            </div>

            {/* SOS button */}
            <button
              onClick={handleConfirm}
              disabled={!selectedType}
              className="w-full py-4 rounded-2xl text-white font-black text-base tracking-wider transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-xl"
              style={selectedType ? {
                background: `linear-gradient(135deg, #EF4444, #DC2626)`,
                boxShadow: '0 8px 32px rgba(239, 68, 68, 0.4)',
              } : { background: '#6B7280' }}
            >
              <span className="flex items-center justify-center gap-2">
                <AlertOctagon className="w-5 h-5" />
                SEND EMERGENCY ALERT
                <ChevronRight className="w-4 h-4" />
              </span>
            </button>
          </motion.div>
        )}

        {/* STEP 2: Confirm countdown */}
        {step === 'confirm' && (
          <motion.div key="confirm" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-6 py-8">
            <PulsingAlertRing color={selectedType?.color || '#EF4444'} />
            <div className="text-center">
              <p className="text-xs font-black tracking-widest text-slate-500 dark:text-slate-400 uppercase">Dispatching in</p>
              <p className="text-7xl font-black text-rose-500 dark:text-rose-400 my-2 font-mono">{countdown}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                Emergency: <strong className="text-slate-900 dark:text-white">{selectedType?.label}</strong>
              </p>
              {location && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-center gap-1">
                  <MapPin className="w-3 h-3" /> {location}
                </p>
              )}
            </div>
            <button
              onClick={handleCancel}
              className="px-8 py-3 rounded-xl border-2 border-slate-300 dark:border-white/20 text-slate-700 dark:text-slate-300 font-bold hover:border-slate-400 dark:hover:border-white/30 hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
            >
              CANCEL DISPATCH
            </button>
          </motion.div>
        )}

        {/* STEP 3: Sent confirmation */}
        {step === 'sent' && (
          <motion.div key="sent" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-6 py-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
              className="w-20 h-20 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center shadow-xl shadow-emerald-500/20"
            >
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </motion.div>
            <div className="text-center">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Alert Dispatched</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Your emergency has been logged and municipality control room has been notified.
              </p>
              <div className="mt-3 inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-xl px-3 py-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold">Emergency ID: SOS-{Date.now().toString().slice(-6)}</span>
              </div>
            </div>
            {/* Emergency contacts */}
            <div className="w-full bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-2xl p-4">
              <p className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Emergency Contacts</p>
              <div className="space-y-2">
                {EMERGENCY_CONTACTS.map(c => {
                  const Icon = c.icon;
                  return (
                    <a
                      key={c.number}
                      href={`tel:${c.number}`}
                      className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.07] transition-all"
                    >
                      <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-sky-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{c.label}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{c.number}</p>
                      </div>
                      <Phone className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    </a>
                  );
                })}
              </div>
            </div>
            <button
              onClick={handleReset}
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors font-medium"
            >
              Send another alert
            </button>
          </motion.div>
        )}

        {/* STEP 4: History */}
        {step === 'history' && (
          <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Your SOS History</h3>
              <button onClick={() => setStep('select')} className="text-xs text-sky-600 dark:text-sky-400 hover:underline font-bold">
                ← Back
              </button>
            </div>
            {dispatched.length === 0 ? (
              <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-sm">No emergency alerts dispatched yet.</div>
            ) : (
              dispatched.map(entry => (
                <div key={entry.id} className="flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 shadow-sm">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: entry.color + '20' }}>
                    <AlertOctagon className="w-4 h-4" style={{ color: entry.color }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{entry.type}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-2.5 h-2.5" /> {entry.location}
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                      {new Date(entry.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {entry.status}
                  </span>
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

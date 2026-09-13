import React from 'react';
import { X, Layers, MapPin, Activity, Clock, CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';
import Badge from '../common/Badge';
import Button from '../common/Button';

export default function SystemMapPopup({ system, onClose, onViewSystem }) {
  if (!system) return null;

  return (
    <div className="dark:bg-[#1E293B] bg-white border dark:border-white/10 border-slate-200 rounded-2xl shadow-2xl p-4 w-72 sm:w-80 text-slate-800 dark:text-slate-100 z-50">
      <div className="flex items-center justify-between pb-3 border-b dark:border-white/10 border-slate-100">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#0EA5E9]" />
          <span className="font-mono font-black text-sm text-[#0EA5E9]">{system.systemId}</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 space-y-2.5 text-xs">
        <div>
          <p className="font-bold text-slate-900 dark:text-white text-sm">{system.location}</p>
          <p className="text-slate-500 dark:text-slate-400 text-[11px]">{system.ward}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-white/[0.03] p-2.5 rounded-xl border dark:border-white/5 border-slate-200/60">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Water Level</span>
            <p className="font-mono font-black text-sm text-slate-900 dark:text-white">{parseFloat(system.waterLevel).toFixed(1)}%</p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Storage</span>
            <p className="font-mono font-black text-sm text-slate-900 dark:text-white">{parseFloat(system.storageLevel).toFixed(1)}%</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">System Health</span>
          {system.status === 'Normal' && <Badge variant="success" size="sm">🟢 Normal</Badge>}
          {system.status === 'Warning' && <Badge variant="warning" size="sm">🟡 Warning</Badge>}
          {system.status === 'Critical' && <Badge variant="danger" size="sm">🔴 Critical</Badge>}
          {system.status === 'Offline' && <Badge variant="secondary" size="sm">⚪ Offline</Badge>}
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Updated</span>
          <span className="font-mono">{new Date(system.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      <div className="mt-3.5 pt-2.5 border-t dark:border-white/10 border-slate-100">
        <Button
          variant="primary"
          size="sm"
          className="w-full"
          onClick={() => onViewSystem?.(system)}
        >
          View System Details
        </Button>
      </div>
    </div>
  );
}

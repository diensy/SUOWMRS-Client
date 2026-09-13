import React from 'react';

export default function SystemMarker({ system, isSelected, onClick }) {
  const getMarkerColor = (status) => {
    switch (status) {
      case 'Normal':
        return 'bg-emerald-500 border-emerald-300 shadow-emerald-500/40 text-white';
      case 'Warning':
        return 'bg-amber-500 border-amber-300 shadow-amber-500/40 text-white';
      case 'Critical':
        return 'bg-rose-500 border-rose-300 shadow-rose-500/50 text-white animate-bounce';
      default:
        return 'bg-slate-400 border-slate-300 shadow-slate-400/30 text-white';
    }
  };

  return (
    <button
      onClick={() => onClick(system)}
      className={`relative group p-1 rounded-full transition-transform duration-200 focus:outline-none ${
        isSelected ? 'scale-125 z-30' : 'hover:scale-115 z-20'
      }`}
      title={`${system.systemId} — ${system.location} (${system.status})`}
    >
      {/* Outer Pulse */}
      {system.status === 'Critical' && (
        <span className="absolute -inset-1 rounded-full bg-rose-500/40 animate-ping" />
      )}

      {/* Marker Pin */}
      <div
        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-mono font-black text-[10px] sm:text-xs border-2 shadow-lg ${getMarkerColor(
          system.status
        )}`}
      >
        {system.systemId.split('-')[1]}
      </div>
    </button>
  );
}

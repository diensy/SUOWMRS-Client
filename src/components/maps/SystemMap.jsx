import React, { useState } from 'react';
import SystemMarker from './SystemMarker';
import SystemMapPopup from './SystemMapPopup';

export default function SystemMap({ systems = [], onSelectSystem }) {
  const [selectedSystem, setSelectedSystem] = useState(null);

  const handleMarkerClick = (sys) => {
    setSelectedSystem(sys);
  };

  return (
    <div className="relative w-full h-[540px] rounded-3xl overflow-hidden border dark:border-white/10 border-slate-200 shadow-xl dark:bg-[#090E17] bg-[#E2E8F0] select-none">
      
      {/* ── Vector City GIS Map Grid Overlay ── */}
      <div className="absolute inset-0 opacity-25 dark:opacity-20 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-slate-500 dark:text-sky-400" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          {/* Simulated Riverbed & Drainage Canals */}
          <path d="M 0 140 Q 300 280 600 200 T 1200 380" fill="none" stroke="#0EA5E9" strokeWidth="12" opacity="0.4" />
          <path d="M 200 0 Q 400 350 800 540" fill="none" stroke="#38BDF8" strokeWidth="6" opacity="0.3" />
        </svg>
      </div>

      {/* Map Header / Legend */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border dark:border-white/10 border-slate-200 shadow-lg text-xs font-bold text-slate-800 dark:text-slate-200">
        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold mr-1">Status Legend:</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Normal</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Warning</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" /> Critical</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Offline</span>
      </div>

      {/* ── System Markers Positioning ── */}
      <div className="absolute inset-0 p-8 sm:p-12 flex flex-wrap items-center justify-around overflow-hidden">
        {systems.map((sys, idx) => {
          // Compute pseudo GIS grid position on screen canvas
          const leftPercent = 8 + ((idx * 17 + sys.waterLevel) % 84);
          const topPercent = 12 + ((idx * 23 + sys.storageLevel) % 76);

          return (
            <div
              key={sys.systemId}
              style={{
                position: 'absolute',
                left: `${leftPercent}%`,
                top: `${topPercent}%`,
              }}
            >
              <SystemMarker
                system={sys}
                isSelected={selectedSystem?.systemId === sys.systemId}
                onClick={handleMarkerClick}
              />
            </div>
          );
        })}
      </div>

      {/* ── Popup Card Modal ── */}
      {selectedSystem && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 animate-in zoom-in-95 duration-150">
          <SystemMapPopup
            system={selectedSystem}
            onClose={() => setSelectedSystem(null)}
            onViewSystem={(sys) => {
              setSelectedSystem(null);
              onSelectSystem?.(sys);
            }}
          />
        </div>
      )}
    </div>
  );
}

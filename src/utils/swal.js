import Swal from 'sweetalert2';
import { playConfirmBeep, playCriticalBeep, playValveBeep } from './sound.js';
import { getTranslation } from '../context/LanguageContext';

/**
 * Custom-styled SweetAlert2 instance tailored to the SUOWMRS design system.
 */
export const customSwal = Swal.mixin({
  customClass: {
    popup: 'rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0F172A] shadow-2xl p-6 font-sans',
    title: 'text-lg font-extrabold text-slate-900 dark:text-white font-display',
    htmlContainer: 'text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed',
    confirmButton: 'px-4 py-2.5 rounded-xl font-semibold text-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2 mx-1.5 cursor-pointer',
    cancelButton: 'px-4 py-2.5 rounded-xl font-semibold text-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2 mx-1.5 cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border dark:border-white/10',
  },
  buttonsStyling: false,
});

/**
 * Emergency SOS confirmation dialog.
 */
export const confirmSosDispatch = async ({ location, waterLevel, status }, customT) => {
  const tr = customT || getTranslation;
  return await customSwal.fire({
    icon: 'warning',
    iconColor: '#EF4444',
    title: tr('swal_sos_title'),
    html: `
      <div class="text-left bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/50 rounded-xl p-3.5 my-3 text-rose-950 dark:text-rose-200 text-xs">
        <p class="font-bold mb-1">${tr('swal_sos_heading')}</p>
        <p>${tr('swal_sos_desc')}</p>
        <div class="mt-2.5 pt-2 border-t border-rose-200/80 dark:border-rose-800/60 text-slate-700 dark:text-slate-300 space-y-1">
          <div><strong>${tr('swal_location')}:</strong> ${location || 'Ward 12 - Riverbed Sector'}</div>
          <div><strong>${tr('swal_current_water_level')}:</strong> ${waterLevel}% (${status || 'Normal'})</div>
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: tr('swal_sos_confirm'),
    cancelButtonText: tr('swal_cancel'),
    confirmButtonClass: 'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/30 focus:ring-rose-500',
  });
};

/**
 * Emergency Flood Diversion confirmation dialog.
 */
export const confirmDiversion = async ({ systemId, ward, location, waterLevel, storageLevel }, customT) => {
  const tr = customT || getTranslation;
  playCriticalBeep();
  const descTemplate = tr('swal_diversion_desc') || 'Actuating the underground solenoid diverter valve will instantly channel excess stormwater from {systemId} into the underground cistern buffer.';
  const formattedDesc = descTemplate.replace('{systemId}', `<strong>${systemId}</strong>`);

  const result = await customSwal.fire({
    icon: 'warning',
    iconColor: '#EF4444',
    title: tr('swal_diversion_title'),
    html: `
      <div class="text-left bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl p-3.5 my-3 text-rose-950 dark:text-rose-200 text-xs">
        <p class="font-bold mb-1">${tr('swal_diversion_heading')}</p>
        <p>${formattedDesc}</p>
        <div class="mt-2.5 pt-2 border-t border-rose-200/80 dark:border-rose-800/60 text-slate-700 dark:text-slate-300 space-y-1">
          <div><strong>${tr('swal_location')}:</strong> ${location || 'Municipal Ward'} (${ward || 'Zone'})</div>
          <div><strong>${tr('swal_current_water_level')}:</strong> <span class="font-mono text-rose-600 dark:text-rose-400 font-bold">${parseFloat(waterLevel).toFixed(1)}% (${tr('swal_critical_badge')})</span></div>
          <div><strong>${tr('swal_storage_cistern')}:</strong> <span class="font-mono text-emerald-600 dark:text-emerald-400 font-bold">${parseFloat(storageLevel).toFixed(1)}% (${tr('swal_capacity_available')})</span></div>
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: tr('swal_diversion_confirm'),
    cancelButtonText: tr('swal_cancel'),
    confirmButtonClass: 'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/30 focus:ring-rose-500',
  });

  if (result.isConfirmed) {
    playConfirmBeep();
    playValveBeep('open');
  }
  return result;
};

/**
 * Manual Valve Override confirmation dialog.
 */
export const confirmValveToggle = async (currentStatus, customT) => {
  const tr = customT || getTranslation;
  const isOpening = currentStatus !== 'OPEN';
  playCriticalBeep();
  const result = await customSwal.fire({
    icon: 'question',
    iconColor: '#10B981',
    title: isOpening ? tr('swal_valve_open_title') : tr('swal_valve_close_title'),
    text: isOpening ? tr('swal_valve_open_desc') : tr('swal_valve_close_desc'),
    showCancelButton: true,
    confirmButtonText: isOpening ? tr('swal_confirm_open_valve') : tr('swal_confirm_close_valve'),
    cancelButtonText: tr('swal_cancel'),
    confirmButtonClass: isOpening
      ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-md focus:ring-emerald-600'
      : 'bg-amber-600 hover:bg-amber-700 text-white shadow-md focus:ring-amber-500',
  });

  if (result.isConfirmed) {
    playConfirmBeep();
    playValveBeep(isOpening ? 'open' : 'close');
  }
  return result;
};

/**
 * General dangerous or critical action confirmation.
 */
export const confirmAction = async ({ title, text, confirmText, isDanger = false }, customT) => {
  const tr = customT || getTranslation;
  if (isDanger) playCriticalBeep();
  const result = await customSwal.fire({
    icon: isDanger ? 'warning' : 'info',
    iconColor: isDanger ? '#EF4444' : '#10B981',
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText || tr('swal_confirm'),
    cancelButtonText: tr('swal_cancel'),
    confirmButtonClass: isDanger
      ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-md'
      : 'bg-brand-deep hover:bg-brand-dark text-white shadow-md',
  });

  if (result.isConfirmed) {
    playConfirmBeep();
  }
  return result;
};


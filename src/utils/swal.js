import Swal from 'sweetalert2';

/**
 * Custom-styled SweetAlert2 instance tailored to the SUOWMRS design system.
 */
export const customSwal = Swal.mixin({
  customClass: {
    popup: 'rounded-2xl border border-slate-200 shadow-2xl p-6 font-sans',
    title: 'text-lg font-extrabold text-slate-900 font-display',
    htmlContainer: 'text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed',
    confirmButton: 'px-4 py-2.5 rounded-xl font-semibold text-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2 mx-1.5 cursor-pointer',
    cancelButton: 'px-4 py-2.5 rounded-xl font-semibold text-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2 mx-1.5 cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700',
  },
  buttonsStyling: false,
});

/**
 * Emergency SOS confirmation dialog.
 */
export const confirmSosDispatch = async ({ location, waterLevel, status }) => {
  return await customSwal.fire({
    icon: 'warning',
    iconColor: '#EF4444',
    title: 'Trigger Emergency SOS Dispatch?',
    html: `
      <div class="text-left bg-rose-50 border border-rose-200/80 rounded-xl p-3.5 my-3 text-rose-900 text-xs">
        <p class="font-bold mb-1">Critical Disaster Response Warning</p>
        <p>This will instantly transmit high-priority alert coordinates to the Municipal Flood Control Room and local emergency personnel.</p>
        <div class="mt-2.5 pt-2 border-t border-rose-200 text-slate-700">
          <div><strong>Location:</strong> ${location || 'Ward 12 - Riverbed Sector'}</div>
          <div><strong>Water Level:</strong> ${waterLevel}% (${status || 'Normal'})</div>
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: 'Yes, Dispatch SOS',
    cancelButtonText: 'Cancel',
    confirmButtonClass: 'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/30 focus:ring-rose-500',
  });
};

/**
 * Manual Valve Override confirmation dialog.
 */
export const confirmValveToggle = async (currentStatus) => {
  const isOpening = currentStatus !== 'OPEN';
  return await customSwal.fire({
    icon: 'question',
    iconColor: '#0F4C5C',
    title: `${isOpening ? 'Open' : 'Close'} Solenoid Diverter Valve?`,
    text: isOpening
      ? 'Manually opening the valve will immediately divert drainage water into the underground storage reservoir.'
      : 'Closing the valve will halt underground storage diversion and keep the main storm drainage pathway active.',
    showCancelButton: true,
    confirmButtonText: isOpening ? 'Confirm Open Valve' : 'Confirm Close Valve',
    cancelButtonText: 'Cancel',
    confirmButtonClass: isOpening
      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md focus:ring-emerald-500'
      : 'bg-amber-600 hover:bg-amber-700 text-white shadow-md focus:ring-amber-500',
  });
};

/**
 * General dangerous or critical action confirmation.
 */
export const confirmAction = async ({ title, text, confirmText = 'Confirm', isDanger = false }) => {
  return await customSwal.fire({
    icon: isDanger ? 'warning' : 'info',
    iconColor: isDanger ? '#EF4444' : '#0F4C5C',
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: 'Cancel',
    confirmButtonClass: isDanger
      ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-md'
      : 'bg-brand-deep hover:bg-brand-dark text-white shadow-md',
  });
};

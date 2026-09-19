import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, RefreshCw, Layers, Search, Filter, Shield } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import SystemMap from '../../components/maps/SystemMap';
import { getMunicipalityMapNodes, triggerFloodDiversion } from '../../services/municipalityService';
import { confirmDiversion, customSwal } from '../../utils/swal';
import { useLanguage } from '../../context/LanguageContext';

export default function CityGisMapPage() {
  const navigate = useNavigate();
  const { t, tStatus } = useLanguage();
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedNodeDetails, setSelectedNodeDetails] = useState(null);
  const [divertingId, setDivertingId] = useState(null);

  const fetchMapNodes = async () => {
    try {
      setLoading(true);
      const data = await getMunicipalityMapNodes();
      setNodes(data || []);
    } catch (err) {
      console.error('Failed to load GIS map markers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMapNodes();
  }, []);

  const handleDivert = async (sys) => {
    if (!sys) return;

    // Check if cistern has capacity
    if (parseFloat(sys.storageLevel) >= 95) {
      return customSwal.fire({
        icon: 'error',
        title: t('gis_cisternFullTitle'),
        text: t('gis_cisternFullDesc', { id: sys.systemId, pct: parseFloat(sys.storageLevel).toFixed(0) }),
      });
    }

    // Require explicit operator confirmation before executing
    const confirmRes = await confirmDiversion({
      systemId: sys.systemId,
      ward: sys.ward,
      location: sys.location,
      waterLevel: sys.waterLevel,
      storageLevel: sys.storageLevel,
    });

    if (!confirmRes.isConfirmed) return;

    setDivertingId(sys.systemId);
    try {
      const res = await triggerFloodDiversion(sys.systemId);
      if (res && res.success) {
        // Update local nodes list immediately
        setNodes((prev) =>
          prev.map((n) =>
            n.systemId === sys.systemId
              ? {
                  ...n,
                  waterLevel: res.node?.waterLevel ?? Math.max(30, n.waterLevel - 20),
                  storageLevel: res.node?.storageLevel ?? Math.min(94, n.storageLevel + 16),
                  status: res.node?.status ?? 'Warning',
                }
              : n
          )
        );

        if (selectedNodeDetails?.systemId === sys.systemId) {
          setSelectedNodeDetails((prev) => ({
            ...prev,
            waterLevel: res.node?.waterLevel ?? Math.max(30, prev.waterLevel - 20),
            storageLevel: res.node?.storageLevel ?? Math.min(94, prev.storageLevel + 16),
            status: res.node?.status ?? 'Warning',
          }));
        }

        customSwal.fire({
          icon: 'success',
          title: t('gis_diversionActivated'),
          text: t('gis_diversionActivatedDesc', { id: sys.systemId }),
          timer: 3500,
        });
      }
    } catch (err) {
      console.error('Failed to divert water:', err);
      customSwal.fire({
        icon: 'error',
        title: t('gis_diversionFailed'),
        text: err.response?.data?.error || t('gis_diversionFailedDesc'),
      });
    } finally {
      setDivertingId(null);
    }
  };

  // Filter nodes
  const filteredNodes = nodes.filter((n) => {
    const matchStatus = statusFilter === 'All' || n.status === statusFilter;
    const matchSearch =
      !search ||
      n.systemId.toLowerCase().includes(search.toLowerCase()) ||
      n.location.toLowerCase().includes(search.toLowerCase()) ||
      n.ward.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b dark:border-white/10 border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white font-display">
                {t('gis_title')}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t('gis_subtitle')}
              </p>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchMapNodes}
          isLoading={loading}
          icon={<RefreshCw className="w-4 h-4" />}
        >
          {t('gis_refreshMap')}
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 dark:bg-[#0F172A] bg-white p-3 rounded-2xl border dark:border-white/10 border-slate-200 shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 md:pb-0">
          {['All', 'Normal', 'Warning', 'Critical', 'Offline'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-[#0F4C5C] text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10'
              }`}
            >
              {st} ({st === 'All' ? nodes.length : nodes.filter(n => n.status === st).length})
            </button>
          ))}
        </div>

        <div className="w-full md:w-72">
          <Input
            type="text"
            placeholder={t('gis_filterPh')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            size="sm"
          />
        </div>
      </div>

      {/* ── GIS MAP COMPONENT ── */}
      <SystemMap
        systems={filteredNodes}
        onSelectSystem={(sys) => setSelectedNodeDetails(sys)}
        onDivert={handleDivert}
      />

      {/* Selected Node Details Card */}
      {selectedNodeDetails && (
        <div className="dark:bg-[#0F172A] bg-white border dark:border-white/10 border-slate-200 shadow-xl rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-sky-500 text-base">{selectedNodeDetails.systemId}</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white">— {selectedNodeDetails.location}</span>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                selectedNodeDetails.status === 'Critical'
                  ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                  : selectedNodeDetails.status === 'Warning'
                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                  : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
              }`}>
                {tStatus(selectedNodeDetails.status)}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {t('waterLevel')}: <strong className="text-slate-900 dark:text-white font-mono">{parseFloat(selectedNodeDetails.waterLevel).toFixed(1)}%</strong> | {t('gis_storageLevel')}: <strong className="text-slate-900 dark:text-white font-mono">{parseFloat(selectedNodeDetails.storageLevel).toFixed(1)}%</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Show Divert Water button if Red/Critical and diversion appropriate */}
            {(selectedNodeDetails.status === 'Critical' || parseFloat(selectedNodeDetails.waterLevel) >= 75) && (
              <Button
                variant="danger"
                size="sm"
                className="bg-rose-600 hover:bg-rose-700 text-white font-black shadow-md shadow-rose-600/30"
                disabled={parseFloat(selectedNodeDetails.storageLevel) >= 95 || divertingId === selectedNodeDetails.systemId}
                isLoading={divertingId === selectedNodeDetails.systemId}
                onClick={() => handleDivert(selectedNodeDetails)}
              >
                {parseFloat(selectedNodeDetails.storageLevel) >= 95
                  ? `⚠️ ${t('gis_cisternFull')} (≥95%)`
                  : `⚡ ${t('gis_divertWater')}`}
              </Button>
            )}

            <Button variant="secondary" size="sm" onClick={() => setSelectedNodeDetails(null)}>
              {t('gis_closePanel')}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/admin/systems')}
            >
              {t('gis_viewInTable')}
            </Button>
          </div>
        </div>
      )}

    </motion.div>
  );
}

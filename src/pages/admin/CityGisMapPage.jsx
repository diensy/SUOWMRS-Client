import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, RefreshCw, Layers, Search, Filter, Shield } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import SystemMap from '../../components/maps/SystemMap';
import { getMunicipalityMapNodes } from '../../services/municipalityService';

export default function CityGisMapPage() {
  const navigate = useNavigate();
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedNodeDetails, setSelectedNodeDetails] = useState(null);

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
                City GIS Flood & Drainage Map
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Real-time geospatial mapping across all 128 municipal drainage nodes
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
          Refresh Map
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
            placeholder="Filter map by Ward or System ID..."
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
      />

      {/* Selected Node Details Card */}
      {selectedNodeDetails && (
        <div className="dark:bg-[#0F172A] bg-white border dark:border-white/10 border-slate-200 shadow-xl rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-sky-500 text-base">{selectedNodeDetails.systemId}</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white">— {selectedNodeDetails.location}</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Water Level: <strong className="text-slate-900 dark:text-white font-mono">{parseFloat(selectedNodeDetails.waterLevel).toFixed(1)}%</strong> | Storage Level: <strong className="text-slate-900 dark:text-white font-mono">{parseFloat(selectedNodeDetails.storageLevel).toFixed(1)}%</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => setSelectedNodeDetails(null)}>
              Close Panel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/admin/systems')}
            >
              View in Multi-System Table
            </Button>
          </div>
        </div>
      )}

    </motion.div>
  );
}

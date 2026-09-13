import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Layers, Search, Filter, RefreshCw, ChevronLeft, ChevronRight,
  CheckCircle2, AlertTriangle, AlertOctagon, Wifi, WifiOff, Clock
} from 'lucide-react';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { getMunicipalitySystems } from '../../services/municipalityService';

export default function MultiSystemMonitoringPage() {
  const [systems, setSystems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All'); // 'All', 'Normal', 'Warning', 'Critical', 'Offline'
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(128);

  const fetchSystemsData = async () => {
    try {
      setLoading(true);
      const data = await getMunicipalitySystems(activeTab, searchTerm, page, 10);
      if (data) {
        setSystems(data.systems || []);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.total || 0);
      }
    } catch (err) {
      console.error('Failed to load systems table data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemsData();
  }, [activeTab, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchSystemsData();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Normal':
        return <Badge variant="success" size="sm">Normal</Badge>;
      case 'Warning':
        return <Badge variant="warning" size="sm">Warning</Badge>;
      case 'Critical':
        return <Badge variant="danger" size="sm">Critical</Badge>;
      default:
        return <Badge variant="secondary" size="sm">Offline</Badge>;
    }
  };

  const getDeviceBadge = (deviceStatus) => {
    if (deviceStatus === 'Online') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Online
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-500/10 border border-slate-500/20 px-2 py-0.5 rounded-md">
        <WifiOff className="w-3 h-3" />
        Offline
      </span>
    );
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b dark:border-white/10 border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-md">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white font-display">
                Multi-System Monitoring Table
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                City-wide grid telemetry across all 128 drainage and storage installations
              </p>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchSystemsData}
          isLoading={loading}
          icon={<RefreshCw className="w-4 h-4" />}
        >
          Refresh Data
        </Button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 dark:bg-[#0F172A] bg-white p-3 rounded-2xl border dark:border-white/10 border-slate-200 shadow-sm">
        
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar pb-1 md:pb-0">
          {['All', 'Normal', 'Warning', 'Critical', 'Offline'].map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setPage(1); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-[#0F4C5C] text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10'
              }`}
            >
              {tab} {tab === 'All' ? `(${totalCount})` : ''}
            </button>
          ))}
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-72">
          <Input
            type="text"
            placeholder="Search System ID, Ward, Location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            size="sm"
          />
          <Button type="submit" variant="primary" size="sm">Search</Button>
        </form>
      </div>

      {/* Data Table */}
      <div className="dark:bg-[#0F172A] bg-white border dark:border-white/10 border-slate-200 shadow-lg rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b dark:border-white/10 border-slate-200 bg-slate-50/50 dark:bg-white/[0.02] text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                <th className="py-3.5 px-4">System ID</th>
                <th className="py-3.5 px-4">Location / Ward</th>
                <th className="py-3.5 px-4">Water Level</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Storage Level</th>
                <th className="py-3.5 px-4">Device</th>
                <th className="py-3.5 px-4 text-right">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-white/5 divide-slate-100 text-xs font-semibold">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#0EA5E9]" />
                    Loading system grid data...
                  </td>
                </tr>
              ) : systems.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    No system installations found matching filters.
                  </td>
                </tr>
              ) : (
                systems.map((sys) => (
                  <tr key={sys.systemId} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#0EA5E9]">
                      {sys.systemId}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900 dark:text-white">{sys.location}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">{sys.ward}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-200 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              sys.waterLevel >= 75 ? 'bg-rose-500' : sys.waterLevel >= 50 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${sys.waterLevel}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">{sys.waterLevel.toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(sys.status)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700 dark:text-slate-300">
                      {sys.storageLevel.toFixed(0)}% Capacity
                    </td>
                    <td className="py-3.5 px-4">
                      {getDeviceBadge(sys.deviceStatus)}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-500 dark:text-slate-400 text-[11px] font-mono">
                      {new Date(sys.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t dark:border-white/10 border-slate-200 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Showing Page <strong className="text-slate-900 dark:text-white">{page}</strong> of <strong className="text-slate-900 dark:text-white">{totalPages}</strong> ({totalCount} total systems)</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              icon={<ChevronLeft className="w-4 h-4" />}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              icon={<ChevronRight className="w-4 h-4" />}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

    </motion.div>
  );
}

import React, { useState, useEffect } from 'react';
import {
  Wrench, Plus, Filter, Search, Calendar, User, Clock,
  CheckCircle2, AlertCircle, AlertTriangle, AlertOctagon,
  ChevronRight, RefreshCw, X, FileText, Check, ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { getWorkOrders, createWorkOrder, updateWorkOrder } from '../../services/diagnosticsService';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

export default function WorkOrdersPage() {
  const { isDark } = useTheme();
  const { t } = useLanguage();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStatusTab, setActiveStatusTab] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    component: 'Submersible Pump',
    description: '',
    priority: 'medium',
    assignedTechnician: '',
    scheduledDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    notes: '',
  });

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getWorkOrders(
        activeStatusTab === 'All' ? '' : activeStatusTab.toLowerCase().replace(' ', '-'),
        selectedPriority === 'All' ? '' : selectedPriority.toLowerCase()
      );
      setOrders(data || []);
    } catch (err) {
      console.error('Failed to load work orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [activeStatusTab, selectedPriority]);

  // Handle Form Submit
  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.component) {
      Swal.fire({
        icon: 'error',
        title: 'Required Fields',
        text: 'Please enter a title and select a component.',
      });
      return;
    }

    setCreating(true);
    try {
      await createWorkOrder({
        ...formData,
        issueDescription: formData.description || 'Hardware maintenance ticket',
      });
      setIsModalOpen(false);
      setFormData({
        title: '',
        component: 'Submersible Pump',
        description: '',
        priority: 'Medium',
        assignedTechnician: '',
        scheduledDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        notes: '',
      });
      Swal.fire({
        icon: 'success',
        title: 'Work Order Created',
        text: 'Maintenance dispatch ticket logged successfully.',
        timer: 2000,
        showConfirmButton: false,
        background: isDark ? '#1E293B' : '#FFFFFF',
        color: isDark ? '#F8FAFC' : '#0F172A',
      });
      fetchOrders();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Creation Failed',
        text: 'Unable to register work order ticket.',
      });
    } finally {
      setCreating(false);
    }
  };

  // Quick Status Transition
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateWorkOrder(orderId, { status: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: `Work order marked as ${newStatus}`,
        showConfirmButton: false,
        timer: 2000,
        background: isDark ? '#1E293B' : '#FFFFFF',
        color: isDark ? '#F8FAFC' : '#0F172A',
      });
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Priority color badge helper
  const getPriorityBadge = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical':
        return <Badge variant="danger">CRITICAL</Badge>;
      case 'high':
        return <Badge variant="warning">HIGH</Badge>;
      case 'medium':
        return <Badge variant="info">MEDIUM</Badge>;
      default:
        return <Badge variant="neutral">LOW</Badge>;
    }
  };

  // Filter orders by search
  const filteredOrders = orders.filter((o) => {
    const term = searchTerm.toLowerCase();
    return (
      o.title?.toLowerCase().includes(term) ||
      o.orderNumber?.toLowerCase().includes(term) ||
      o.component?.toLowerCase().includes(term) ||
      o.assignedTechnician?.toLowerCase().includes(term)
    );
  });

  const statusTabs = ['All', 'Pending', 'In Progress', 'Completed', 'Cancelled'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border border-amber-500/20 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/25">
            <Wrench className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Work Orders & Maintenance Tickets
              </h1>
              <Badge variant="warning" size="md">
                Maintenance Hub
              </Badge>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Dispatch technicians, track actuator replacements, and log service history for water automation infrastructure.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchOrders}
            loading={loading}
            className="h-9 px-3.5 rounded-lg border-slate-300 dark:border-white/10"
          >
            <RefreshCw className="w-4 h-4 mr-1.5 flex-shrink-0" />
            <span>Refresh</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="h-9 px-3.5 rounded-lg bg-amber-600 hover:bg-amber-700 shadow-sm"
          >
            <Plus className="w-4 h-4 mr-1.5 flex-shrink-0" />
            <span>Create Work Order</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl border bg-white dark:bg-slate-900/60 border-slate-200 dark:border-white/10 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {statusTabs.map((tab) => {
            const isActive = activeStatusTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveStatusTab(tab)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Priority & Search Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs font-medium border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="All" className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white">All Priorities</option>
            <option value="critical" className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white">Critical</option>
            <option value="high" className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white">High</option>
            <option value="medium" className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white">Medium</option>
            <option value="low" className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white">Low</option>
          </select>

          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tickets, technician..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-500 dark:text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mr-3 text-amber-500" />
          Loading work orders...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-12 text-center rounded-xl border bg-white dark:bg-slate-900/60 border-slate-200 dark:border-white/10">
          <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No Work Orders Found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            There are currently no maintenance tickets matching your filters. Click "Create Work Order" to dispatch a technician.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredOrders.map((order) => {
            const isCompleted = order.status === 'completed';
            const isProgress = order.status === 'in-progress';

            return (
              <motion.div
                key={order._id || order.orderNumber}
                layout
                className="p-5 rounded-xl border bg-white dark:bg-slate-900/60 border-slate-200 dark:border-white/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left Info */}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      {order.orderNumber}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {order.title}
                    </h3>
                    {getPriorityBadge(order.priority)}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                    {order.description || 'No detailed issue description provided.'}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 flex-wrap pt-1">
                    <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                      <Wrench className="w-3.5 h-3.5 text-blue-500" />
                      {order.component}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-indigo-500" />
                      Tech: <span className="font-medium text-slate-700 dark:text-slate-300">{order.assignedTechnician || 'Unassigned'}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-500" />
                      Scheduled: {order.scheduledDate ? new Date(order.scheduledDate).toLocaleDateString() : 'Immediate'}
                    </span>
                  </div>
                </div>

                {/* Right Status & Actions */}
                <div className="flex items-center gap-2.5 self-end md:self-center">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    className={`h-9 px-3 rounded-lg text-xs font-semibold border cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                      order.status?.toLowerCase() === 'completed'
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 focus:ring-emerald-500/30'
                        : order.status?.toLowerCase() === 'in progress' || order.status?.toLowerCase() === 'in-progress'
                        ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-300 dark:border-blue-500/30 text-blue-700 dark:text-blue-400 focus:ring-blue-500/30'
                        : 'bg-amber-50 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/30 text-amber-700 dark:text-amber-400 focus:ring-amber-500/30'
                    }`}
                  >
                    <option value="Pending" className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white">Pending</option>
                    <option value="In Progress" className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white">In Progress</option>
                    <option value="Completed" className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white">Completed</option>
                    <option value="Cancelled" className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white">Cancelled</option>
                  </select>

                  {order.status?.toLowerCase() !== 'completed' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange(order._id, 'Completed')}
                      className="h-9 px-3.5 text-xs font-semibold rounded-lg border border-emerald-300 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20"
                    >
                      <Check className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                      <span>Close Ticket</span>
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal: Create Work Order */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Create New Work Order
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleCreateOrder} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Work Order Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Inspect relay overheating on pump panel"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Component Target *
                    </label>
                    <select
                      value={formData.component}
                      onChange={(e) => setFormData({ ...formData, component: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="Submersible Pump">Submersible Pump</option>
                      <option value="Solenoid Valve">Solenoid Valve</option>
                      <option value="Relay Module">Relay Module</option>
                      <option value="Ultrasonic Sensor">Ultrasonic Sensor</option>
                      <option value="Water Level Sensor">Water Level Sensor</option>
                      <option value="ESP32 Controller">ESP32 Controller</option>
                      <option value="Power Supply">Power Supply</option>
                      <option value="Network Gateway">Network Gateway</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Priority Level
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="low" className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white">Low</option>
                      <option value="medium" className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white">Medium</option>
                      <option value="high" className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white">High</option>
                      <option value="critical" className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white">Critical</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Assigned Technician
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ramesh Sahoo"
                      value={formData.assignedTechnician}
                      onChange={(e) => setFormData({ ...formData, assignedTechnician: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Scheduled Date
                    </label>
                    <input
                      type="date"
                      value={formData.scheduledDate}
                      onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Issue Description & Diagnostic Findings
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe symptoms, telemetry anomalies, or replacement parts needed..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-white/5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    loading={creating}
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    Dispatch Work Order
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

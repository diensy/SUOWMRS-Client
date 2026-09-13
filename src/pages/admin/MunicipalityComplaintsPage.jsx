import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquareWarning, Search, Filter, RefreshCw, CheckCircle2,
  AlertTriangle, Wrench, UserCheck, MapPin, Send, ExternalLink
} from 'lucide-react';
import Swal from 'sweetalert2';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { getComplaints, updateComplaint } from '../../services/complaintService';
import { useTheme } from '../../context/ThemeContext';

export default function MunicipalityComplaintsPage() {
  const { isDark } = useTheme();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchComplaintsList = async () => {
    try {
      setLoading(true);
      const data = await getComplaints(statusFilter, priorityFilter, searchTerm);
      setComplaints(data || []);
    } catch (err) {
      console.error('Failed to load complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaintsList();
  }, [statusFilter, priorityFilter]);

  const handleUpdateStatus = async (complaint, newStatus) => {
    setUpdatingId(complaint._id);
    try {
      await updateComplaint(complaint._id, { status: newStatus });
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: `Complaint ${complaint.complaintId} marked as ${newStatus}`,
        showConfirmButton: false,
        timer: 2000,
        background: isDark ? '#1E293B' : '#FFFFFF',
        color: isDark ? '#F8FAFC' : '#0F172A',
      });
      fetchComplaintsList();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: 'Failed to update complaint status.',
        background: isDark ? '#1E293B' : '#FFFFFF',
        color: isDark ? '#F8FAFC' : '#0F172A',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  // Integration Flow: Assign Technician & Generate Work Order
  const handleAssignAndDispatch = async (complaint) => {
    const { value: techName } = await Swal.fire({
      title: `Assign Technician & Dispatch Ticket`,
      text: `Dispatch repair work order for ${complaint.complaintId}: ${complaint.title}`,
      input: 'select',
      inputOptions: {
        'Rajesh Kumar (TECH-8842)': 'Rajesh Kumar (TECH-8842) - Electrical & Hardware',
        'Ramesh Sahoo (TECH-9021)': 'Ramesh Sahoo (TECH-9021) - Drainage & Valves',
        'Sunita Pattnaik (TECH-7712)': 'Sunita Pattnaik (TECH-7712) - Sensors & IoT',
      },
      inputPlaceholder: 'Select Field Technician',
      showCancelButton: true,
      confirmButtonText: 'Dispatch Repair Ticket',
      confirmButtonColor: '#0EA5E9',
      background: isDark ? '#1E293B' : '#FFFFFF',
      color: isDark ? '#F8FAFC' : '#0F172A',
    });

    if (techName) {
      setUpdatingId(complaint._id);
      try {
        const res = await updateComplaint(complaint._id, {
          assignedTechnician: techName,
          status: 'Assigned',
          createWorkOrder: true,
        });

        Swal.fire({
          icon: 'success',
          title: 'Work Order Dispatched!',
          text: `Linked Work Order created in Technician Suite (${res.complaint.linkedWorkOrderId}) and assigned to ${techName}.`,
          background: isDark ? '#1E293B' : '#FFFFFF',
          color: isDark ? '#F8FAFC' : '#0F172A',
        });
        fetchComplaintsList();
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Dispatch Failed',
          text: 'Failed to dispatch work order.',
        });
      } finally {
        setUpdatingId(null);
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Submitted':
        return <Badge variant="secondary" size="sm">Submitted</Badge>;
      case 'Under Review':
        return <Badge variant="warning" size="sm">Under Review</Badge>;
      case 'Assigned':
        return <Badge variant="info" size="sm">Assigned</Badge>;
      case 'In Progress':
        return <Badge variant="brand" size="sm">In Progress</Badge>;
      case 'Resolved':
        return <Badge variant="success" size="sm">Resolved</Badge>;
      default:
        return <Badge variant="secondary" size="sm">Closed</Badge>;
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b dark:border-white/10 border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md">
              <MessageSquareWarning className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white font-display">
                Municipality Complaint Management
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Review citizen grievances, assign technicians, and link work orders
              </p>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchComplaintsList}
          isLoading={loading}
          icon={<RefreshCw className="w-4 h-4" />}
        >
          Refresh List
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 dark:bg-[#0F172A] bg-white p-3 rounded-2xl border dark:border-white/10 border-slate-200 shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 md:pb-0">
          {['All', 'Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-[#0F4C5C] text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="w-full md:w-72">
          <Input
            type="text"
            placeholder="Search Complaint ID, title, or ward..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            size="sm"
          />
        </div>
      </div>

      {/* Complaints List Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-slate-400">Loading complaints...</div>
        ) : complaints.length === 0 ? (
          <div className="dark:bg-[#0F172A] bg-white border dark:border-white/10 border-slate-200 rounded-2xl p-8 text-center text-slate-400">
            No citizen complaints found matching filters.
          </div>
        ) : (
          complaints.map((c) => (
            <div
              key={c._id}
              className="dark:bg-[#0F172A] bg-white border dark:border-white/10 border-slate-200 shadow-lg rounded-2xl p-6 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b dark:border-white/10 border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-black text-sm text-amber-500">{c.complaintId}</span>
                  <Badge variant={c.priority === 'Urgent' ? 'danger' : 'warning'} size="sm">
                    {c.priority} Priority
                  </Badge>
                  {getStatusBadge(c.status)}
                </div>

                <span className="text-xs text-slate-400 font-mono">
                  Filed: {new Date(c.createdAt).toLocaleString()}
                </span>
              </div>

              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">{c.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{c.description}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 dark:bg-white/[0.02] p-3 rounded-xl border dark:border-white/5 border-slate-200/60 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Citizen Name</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{c.citizenName}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Location / Ward</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{c.location} ({c.ward})</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Assigned Technician</span>
                  <p className="font-bold text-sky-600 dark:text-sky-400 mt-0.5">{c.assignedTechnician}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  {c.status === 'Submitted' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleUpdateStatus(c, 'Under Review')}
                      isLoading={updatingId === c._id}
                    >
                      Mark Under Review
                    </Button>
                  )}

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleAssignAndDispatch(c)}
                    isLoading={updatingId === c._id}
                    icon={<Wrench className="w-4 h-4" />}
                  >
                    {c.linkedWorkOrderId ? 'Re-assign Technician' : 'Dispatch Technician & Work Order'}
                  </Button>
                </div>

                {c.status !== 'Resolved' && c.status !== 'Closed' && (
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleUpdateStatus(c, 'Resolved')}
                    isLoading={updatingId === c._id}
                    icon={<CheckCircle2 className="w-4 h-4" />}
                  >
                    Mark Resolved
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

    </motion.div>
  );
}

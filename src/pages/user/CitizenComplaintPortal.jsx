import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquareWarning, Send, Plus, CheckCircle2, Clock,
  AlertCircle, Shield, MapPin, User, FileText, Sparkles
} from 'lucide-react';
import Swal from 'sweetalert2';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { submitComplaint, getComplaints } from '../../services/complaintService';
import { useTheme } from '../../context/ThemeContext';

export default function CitizenComplaintPortal() {
  const { isDark } = useTheme();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    issueType: 'Water Overflow',
    title: '',
    description: '',
    location: '',
    ward: 'Ward 12',
    priority: 'Medium',
    photoUrl: '',
  });

  const fetchMyComplaints = async () => {
    try {
      setLoading(true);
      const data = await getComplaints();
      setComplaints(data || []);
    } catch (err) {
      console.error('Failed to load complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyComplaints();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.location) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Fields',
        text: 'Please provide a title, description, and location for your report.',
        background: isDark ? '#1E293B' : '#FFFFFF',
        color: isDark ? '#F8FAFC' : '#0F172A',
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitComplaint(form);
      Swal.fire({
        icon: 'success',
        title: 'Complaint Submitted!',
        text: res.message || 'Your report has been sent to Municipality Admins.',
        background: isDark ? '#1E293B' : '#FFFFFF',
        color: isDark ? '#F8FAFC' : '#0F172A',
      });
      setForm({
        issueType: 'Water Overflow',
        title: '',
        description: '',
        location: '',
        ward: 'Ward 12',
        priority: 'Medium',
        photoUrl: '',
      });
      setShowForm(false);
      fetchMyComplaints();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: err.response?.data?.error || 'Failed to submit report. Please try again.',
        background: isDark ? '#1E293B' : '#FFFFFF',
        color: isDark ? '#F8FAFC' : '#0F172A',
      });
    } finally {
      setSubmitting(false);
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
                Citizen Grievance & Issue Portal
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Report drain blockages, water overflow, and local flooding directly to municipal authorities
              </p>
            </div>
          </div>
        </div>

        <Button
          variant={showForm ? "secondary" : "primary"}
          size="sm"
          onClick={() => setShowForm(!showForm)}
          icon={<Plus className="w-4 h-4" />}
        >
          {showForm ? "Cancel Report" : "File New Complaint"}
        </Button>
      </div>

      {/* ── COMPLAINT FORM ── */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="dark:bg-[#0F172A] bg-white border dark:border-white/10 border-slate-200 rounded-3xl p-6 shadow-xl space-y-4"
        >
          <div className="flex items-center gap-2 pb-3 border-b dark:border-white/10 border-slate-100">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Submit New Citizen Report</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Issue Type</label>
                <select
                  value={form.issueType}
                  onChange={(e) => setForm({ ...form, issueType: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border dark:border-white/10 border-slate-200 dark:bg-white/5 bg-slate-50 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Water Overflow" className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white">Water Overflow</option>
                  <option value="Drainage Blockage" className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white">Drainage Blockage</option>
                  <option value="Flooding" className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white">Flooding</option>
                  <option value="System Damage" className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white">System Damage</option>
                  <option value="Water Leakage" className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white">Water Leakage</option>
                  <option value="Other" className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Priority Level</label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border dark:border-white/10 border-slate-200 dark:bg-white/5 bg-slate-50 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Low" className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white">Low Priority</option>
                  <option value="Medium" className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white">Medium Priority</option>
                  <option value="High" className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white">High Priority</option>
                  <option value="Urgent" className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white">Urgent / Emergency</option>
                </select>
              </div>
            </div>

            <div>
              <Input
                label="Report Title"
                placeholder="e.g. Clogged main drainage channel behind market"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Location & Landmarks"
                placeholder="e.g. Zone 4 Riverbed Crossing"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                required
              />
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Ward / Area</label>
                <select
                  value={form.ward}
                  onChange={(e) => setForm({ ...form, ward: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border dark:border-white/10 border-slate-200 dark:bg-white/5 bg-slate-50 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {Array.from({ length: 25 }, (_, i) => (
                    <option key={i} value={`Ward ${i + 1}`} className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white">Ward {i + 1}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Issue Description</label>
              <textarea
                rows="3"
                placeholder="Describe the issue in detail..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full p-3 rounded-xl border dark:border-white/10 border-slate-200 dark:bg-white/5 bg-slate-50 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="warning" size="sm" isLoading={submitting} icon={<Send className="w-4 h-4" />}>
                Submit Complaint
              </Button>
            </div>
          </form>
        </motion.div>
      )}

      {/* ── FILED COMPLAINTS TRACKER LIST ── */}
      <div className="space-y-3">
        <p className="text-xs font-black tracking-widest uppercase text-slate-400 dark:text-slate-500">
          Tracked Citizen Reports ({complaints.length})
        </p>

        {loading ? (
          <div className="py-12 text-center text-slate-400">Loading complaints...</div>
        ) : complaints.length === 0 ? (
          <div className="dark:bg-[#0F172A] bg-white border dark:border-white/10 border-slate-200 rounded-2xl p-8 text-center text-slate-400">
            No complaints filed yet. Click "File New Complaint" above to report a local issue.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {complaints.map((c) => (
              <div
                key={c._id}
                className="dark:bg-[#0F172A] bg-white border dark:border-white/10 border-slate-200 shadow-sm rounded-2xl p-5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-xs text-amber-500">{c.complaintId}</span>
                  {getStatusBadge(c.status)}
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">{c.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{c.description}</p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t dark:border-white/5 border-slate-100 text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-amber-500" /> {c.location} ({c.ward})</span>
                  <span className="font-mono">{new Date(c.createdAt).toLocaleDateString()}</span>
                </div>

                {c.assignedTechnician && c.assignedTechnician !== 'Unassigned' && (
                  <div className="bg-sky-500/10 border border-sky-500/20 p-2 rounded-xl text-[11px] text-sky-600 dark:text-sky-400 font-semibold flex items-center justify-between">
                    <span>Assigned Technician: <strong>{c.assignedTechnician}</strong></span>
                    {c.linkedWorkOrderId && <span className="font-mono">WO: {c.linkedWorkOrderId}</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </motion.div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  PlusCircle, 
  ClipboardList, 
  BarChart3, 
  LogOut, 
  Search, 
  Filter, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  Sparkles, 
  Home, 
  User, 
  Phone, 
  Smartphone, 
  UserCheck, 
  Users, 
  Settings,
  HelpCircle,
  TrendingUp,
  Inbox,
  AlertTriangle,
  FolderSync,
  Wrench,
  Brush,
  DollarSign,
  Volume2,
  Smile,
  ShieldCheck,
  Coffee,
  X,
  Loader2,
  Maximize2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line 
} from 'recharts';

import { Complaint, ComplaintAnalysis, ActivityLog, Profile } from '@/lib/db';

type TabType = 'dashboard' | 'submit' | 'complaints' | 'analytics';

export default function DashboardPage() {
  const { user, avatarUrl, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  // Navigation State
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  
  // Data State
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loadingComplaints, setLoadingComplaints] = useState(true);
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  
  // Detail Panel State
  const [selectedDetails, setSelectedDetails] = useState<{
    complaint: Complaint;
    analysis?: ComplaintAnalysis;
    logs: ActivityLog[];
  } | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Submit Complaint Form State
  const [formText, setFormText] = useState('');
  const [formGuestName, setFormGuestName] = useState('');
  const [formRoomNumber, setFormRoomNumber] = useState('');
  const [formSource, setFormSource] = useState<'front_desk' | 'phone' | 'mobile_app' | 'in_person'>('front_desk');
  const [formDepartment, setFormDepartment] = useState<string>('auto'); // auto or manual
  const [submitting, setSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<any | null>(null);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');

  // Load complaints
  const fetchComplaints = async () => {
    try {
      setLoadingComplaints(true);
      const res = await fetch('/api/complaints');
      if (res.ok) {
        const data = await res.json();
        setComplaints(data.complaints || []);
      }
    } catch (e) {
      console.error('Failed to load complaints:', e);
    } finally {
      setLoadingComplaints(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      fetchComplaints();
    }
  }, [user, authLoading, router]);

  // Handle complaint selection for Slide-out Panel
  const handleSelectComplaint = async (id: string) => {
    setSelectedComplaintId(id);
    setLoadingDetails(true);
    try {
      const res = await fetch(`/api/complaints/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedDetails(data);
      }
    } catch (e) {
      console.error('Failed to load complaint details:', e);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Update Status
  const handleUpdateStatus = async (id: string, newStatus: Complaint['status']) => {
    try {
      const res = await fetch(`/api/complaints/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, performed_by: user?.full_name || 'Staff' })
      });

      if (res.ok) {
        const data = await res.json();
        // Update local list
        setComplaints(prev => prev.map(c => c.id === id ? data.complaint : c));
        // Update details panel if open
        if (selectedDetails && selectedDetails.complaint.id === id) {
          handleSelectComplaint(id);
        }

        // Trigger confetti on resolve!
        if (newStatus === 'resolved') {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#4f46e5', '#06b6d4', '#10b981']
          });
        }
      }
    } catch (e) {
      console.error('Failed to update status:', e);
    }
  };

  // Update Department
  const handleUpdateDepartment = async (id: string, newDept: Complaint['department']) => {
    try {
      const res = await fetch(`/api/complaints/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ department: newDept, performed_by: user?.full_name || 'Staff' })
      });

      if (res.ok) {
        const data = await res.json();
        setComplaints(prev => prev.map(c => c.id === id ? data.complaint : c));
        if (selectedDetails && selectedDetails.complaint.id === id) {
          handleSelectComplaint(id);
        }
      }
    } catch (e) {
      console.error('Failed to update department:', e);
    }
  };

  // Submit new complaint
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formText.trim()) return;

    setSubmitting(true);
    setSubmissionSuccess(null);

    try {
      const payload = {
        raw_text: formText,
        guest_name: formGuestName || undefined,
        room_number: formRoomNumber || undefined,
        source: formSource,
        department: formDepartment === 'auto' ? undefined : formDepartment,
        created_by: user?.id
      };

      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setSubmissionSuccess(data);
        
        // Reset inputs
        setFormText('');
        setFormGuestName('');
        setFormRoomNumber('');
        setFormSource('front_desk');
        setFormDepartment('auto');
        
        // Refresh local data list
        fetchComplaints();
      }
    } catch (e) {
      console.error('Submission failed:', e);
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background bg-gradient-mesh">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto mb-4" />
          <p className="text-zinc-400 font-semibold text-sm">Authenticating StaySage System...</p>
        </div>
      </div>
    );
  }

  // Derived metrics for Dashboard overview cards
  const totalCount = complaints.length;
  const openCount = complaints.filter(c => c.status === 'open').length;
  const inProgressCount = complaints.filter(c => c.status === 'in_progress').length;
  const resolvedCount = complaints.filter(c => c.status === 'resolved').length;
  const highPriorityCount = complaints.filter(c => (c.priority === 'High' || c.priority === 'Critical') && c.status !== 'resolved').length;

  const urgentComplaints = complaints
    .filter(c => (c.priority === 'High' || c.priority === 'Critical') && c.status !== 'resolved')
    .slice(0, 3);

  // Filters logic
  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = 
      c.raw_text.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (c.guest_name && c.guest_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.room_number && c.room_number.includes(searchTerm));
      
    const matchesStatus = filterStatus === 'all' ? true : c.status === filterStatus;
    const matchesPriority = filterPriority === 'all' ? true : c.priority === filterPriority;
    const matchesDept = filterDepartment === 'all' ? true : c.department === filterDepartment;

    return matchesSearch && matchesStatus && matchesPriority && matchesDept;
  });

  // Color mappings for badges
  const priorityColors = {
    Low: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
    Medium: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    High: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    Critical: 'bg-red-500/10 text-red-400 border-red-500/20 glow-text-red animate-pulse'
  };

  const statusColors = {
    open: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    in_progress: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    resolved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    dismissed: 'bg-zinc-600/10 text-zinc-400 border-zinc-700/50'
  };

  const deptIcons = {
    Maintenance: <Wrench className="w-3.5 h-3.5" />,
    Housekeeping: <Brush className="w-3.5 h-3.5" />,
    Billing: <DollarSign className="w-3.5 h-3.5" />,
    Noise: <Volume2 className="w-3.5 h-3.5" />,
    'Staff Behavior': <Smile className="w-3.5 h-3.5" />,
    Amenities: <Coffee className="w-3.5 h-3.5" />,
    'Food Service': <Coffee className="w-3.5 h-3.5" />,
    Safety: <ShieldCheck className="w-3.5 h-3.5" />
  };

  const sourceIcons = {
    front_desk: <Inbox className="w-3.5 h-3.5" />,
    phone: <Phone className="w-3.5 h-3.5" />,
    mobile_app: <Smartphone className="w-3.5 h-3.5" />,
    in_person: <Users className="w-3.5 h-3.5" />
  };

  // CHART DATA PREPARATION
  // 1. Categories
  const categoryCounts = complaints.reduce((acc, c) => {
    acc[c.department] = (acc[c.department] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartCategories = Object.entries(categoryCounts).map(([name, value]) => ({ name, value }));

  // 2. Priorities
  const priorityCounts = { Low: 0, Medium: 0, High: 0, Critical: 0 };
  complaints.forEach(c => {
    priorityCounts[c.priority]++;
  });
  const chartPriorities = Object.entries(priorityCounts).map(([name, value]) => ({ name, value }));

  // 3. Trends (Last 7 Days)
  const trendsData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateString = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const count = complaints.filter(c => {
      const createdDate = new Date(c.created_at).toDateString();
      return createdDate === d.toDateString();
    }).length;
    return { name: dateString, Complaints: count };
  }).reverse();

  const CHART_COLORS = ['#4f46e5', '#06b6d4', '#f59e0b', '#ef4444', '#10b981', '#a855f7', '#ec4899', '#6366f1'];

  return (
    <div className="min-h-screen w-full flex bg-background bg-gradient-mesh text-foreground">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 border-r border-zinc-800 bg-zinc-950/70 backdrop-blur-xl shrink-0 flex flex-col justify-between select-none">
        <div>
          {/* Logo */}
          <div className="p-6 border-b border-zinc-900 flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-500">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M6 19h12" />
                <path d="M18 19v-4a6 6 0 0 0-4-5.65V7a2 2 0 1 0-4 0v2.35A6 6 0 0 0 6 15v4" />
                <path d="M12 3v2" />
              </svg>
            </div>
            <div>
              <h2 className="font-extrabold tracking-tight text-white text-md">StaySage AI</h2>
              <p className="text-[10px] text-zinc-500 font-semibold tracking-wider uppercase">Ops Terminal</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="p-4 space-y-1.5">
            <button
              onClick={() => { setActiveTab('dashboard'); setSelectedComplaintId(null); }}
              className={`w-full px-3.5 py-2 rounded-xl text-sm font-semibold tracking-wide flex items-center gap-3 transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => { setActiveTab('submit'); setSelectedComplaintId(null); setSubmissionSuccess(null); }}
              className={`w-full px-3.5 py-2 rounded-xl text-sm font-semibold tracking-wide flex items-center gap-3 transition-all cursor-pointer ${
                activeTab === 'submit'
                  ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Log Complaint</span>
            </button>

            <button
              onClick={() => { setActiveTab('complaints'); setSelectedComplaintId(null); }}
              className={`w-full px-3.5 py-2 rounded-xl text-sm font-semibold tracking-wide flex items-center gap-3 transition-all cursor-pointer ${
                activeTab === 'complaints'
                  ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>Complaints Desk</span>
              {openCount + inProgressCount > 0 && (
                <span className="ml-auto px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 rounded-md text-[10px] font-bold">
                  {openCount + inProgressCount}
                </span>
              )}
            </button>

            <button
              onClick={() => { setActiveTab('analytics'); setSelectedComplaintId(null); }}
              className={`w-full px-3.5 py-2 rounded-xl text-sm font-semibold tracking-wide flex items-center gap-3 transition-all cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Ops Analytics</span>
            </button>
          </nav>
        </div>

        {/* Staff Profile and Logout */}
        <div className="p-4 border-t border-zinc-900">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-zinc-950/40 border border-zinc-900 mb-3">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Staff avatar" className="w-8 h-8 rounded-full border border-zinc-800" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-semibold">
                {user.full_name.charAt(0)}
              </div>
            )}
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-zinc-200 truncate">{user.full_name}</p>
              <p className="text-[9px] text-zinc-500 truncate font-semibold uppercase tracking-wider">{user.role}</p>
            </div>
          </div>
          
          <button
            onClick={logout}
            className="w-full py-2 px-3 bg-zinc-900 hover:bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 rounded-xl text-xs font-bold border border-zinc-800 flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Secure Log Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT SCREEN */}
      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        <header className="h-16 border-b border-zinc-900 bg-zinc-950/20 backdrop-blur-md px-8 flex items-center justify-between shrink-0">
          <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2.5">
            {activeTab === 'dashboard' && 'Operations Dashboard'}
            {activeTab === 'submit' && 'Log Guest Complaint'}
            {activeTab === 'complaints' && 'Guest Complaints Desk'}
            {activeTab === 'analytics' && 'Operational Analytics'}
          </h1>
          
          <div className="flex items-center gap-4">
            <span className="text-xs px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-semibold flex items-center gap-1.5 select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              StaySage Core AI Online
            </span>
          </div>
        </header>

        <div className="flex-1 p-8 overflow-y-auto">
          
          {/* TAB 1: DASHBOARD VIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-fade-in">
              {/* Stat Cards */}
              <div className="grid grid-cols-4 gap-5">
                <div className="glass-card rounded-2xl p-5 border border-zinc-800 relative overflow-hidden flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Total Filed</p>
                    <h3 className="text-3xl font-extrabold text-white mt-1.5">{totalCount}</h3>
                  </div>
                  <div className="p-3 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-xl">
                    <ClipboardList className="w-5 h-5" />
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-5 border border-zinc-800 relative overflow-hidden flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Active Complaints</p>
                    <h3 className="text-3xl font-extrabold text-amber-500 mt-1.5">{openCount + inProgressCount}</h3>
                  </div>
                  <div className="p-3 bg-amber-500/10 border border-amber-500/25 text-amber-400 rounded-xl">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-5 border border-zinc-800 relative overflow-hidden flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Urgent Alerts</p>
                    <h3 className="text-3xl font-extrabold text-red-500 mt-1.5">{highPriorityCount}</h3>
                  </div>
                  <div className="p-3 bg-red-500/10 border border-red-500/25 text-red-400 rounded-xl">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-5 border border-zinc-800 relative overflow-hidden flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Resolved Tickets</p>
                    <h3 className="text-3xl font-extrabold text-emerald-500 mt-1.5">{resolvedCount}</h3>
                  </div>
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 rounded-xl">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Main Dashboard Layout split */}
              <div className="grid grid-cols-3 gap-6">
                
                {/* Left: Urgent Attention & Recent complaints */}
                <div className="col-span-2 space-y-6">
                  
                  {/* Urgent Attention Block */}
                  {urgentComplaints.length > 0 && (
                    <div className="glass-card rounded-2xl border border-red-500/20 p-5 glow-indigo relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 w-64 h-64 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
                      <h3 className="text-sm font-bold text-red-400 flex items-center gap-2 mb-4 tracking-wide">
                        <AlertCircle className="w-4 h-4 animate-bounce" />
                        CRITICAL ESCALATION ALERTS (URGENT ATTENTION REQUIRED)
                      </h3>
                      
                      <div className="space-y-3">
                        {urgentComplaints.map(c => (
                          <div 
                            key={c.id} 
                            onClick={() => handleSelectComplaint(c.id)}
                            className="p-3.5 bg-zinc-950/60 hover:bg-zinc-900 border border-red-500/20 hover:border-red-500/40 rounded-xl cursor-pointer transition-all flex items-center justify-between group"
                          >
                            <div className="flex items-start gap-3 overflow-hidden">
                              <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-[9px] font-bold text-red-400 border border-red-500/20 shrink-0 mt-0.5">
                                {c.priority}
                              </span>
                              <div className="overflow-hidden">
                                <p className="text-xs text-zinc-200 font-bold group-hover:text-white truncate">
                                  Room {c.room_number ? c.room_number : 'N/A'} - {c.guest_name ? c.guest_name : 'Guest'}
                                </p>
                                <p className="text-[11px] text-zinc-500 truncate mt-0.5">{c.raw_text}</p>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-red-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-4" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent Activity Table */}
                  <div className="glass-card rounded-2xl border border-zinc-800 p-5">
                    <div className="flex justify-between items-center mb-5">
                      <h3 className="text-sm font-bold text-white tracking-wide">RECENT INBOUND COMPLAINTS</h3>
                      <button 
                        onClick={() => setActiveTab('complaints')}
                        className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                      >
                        <span>View Desk</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {loadingComplaints ? (
                      <div className="py-12 flex justify-center items-center">
                        <Loader2 className="w-6 h-6 text-zinc-600 animate-spin" />
                      </div>
                    ) : complaints.length === 0 ? (
                      <div className="py-12 text-center">
                        <Inbox className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                        <p className="text-xs text-zinc-500 font-semibold">No complaints logged yet</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="border-b border-zinc-800 text-[10px] text-zinc-500 font-bold tracking-wider uppercase">
                              <th className="pb-3 w-1/4">GUEST / ROOM</th>
                              <th className="pb-3 w-5/12">COMPLAINT</th>
                              <th className="pb-3 w-1/6">PRIORITY</th>
                              <th className="pb-3 w-1/6">STATUS</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-900/50">
                            {complaints.slice(0, 5).map(c => (
                              <tr 
                                key={c.id}
                                onClick={() => handleSelectComplaint(c.id)}
                                className="group cursor-pointer hover:bg-zinc-900/30 transition-colors"
                              >
                                <td className="py-3 pr-4">
                                  <p className="text-xs font-bold text-zinc-200 group-hover:text-white truncate">
                                    {c.guest_name ? c.guest_name : 'Guest'}
                                  </p>
                                  <p className="text-[10px] text-zinc-500 mt-0.5">
                                    Room {c.room_number ? c.room_number : 'N/A'}
                                  </p>
                                </td>
                                <td className="py-3 pr-4">
                                  <p className="text-xs text-zinc-400 group-hover:text-zinc-300 truncate max-w-xs font-medium">
                                    {c.raw_text}
                                  </p>
                                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-zinc-600 mt-1 uppercase">
                                    {deptIcons[c.department]}
                                    {c.department}
                                  </span>
                                </td>
                                <td className="py-3 pr-4">
                                  <span className={`px-2 py-0.5 text-[9px] font-bold border rounded-md ${priorityColors[c.priority]}`}>
                                    {c.priority}
                                  </span>
                                </td>
                                <td className="py-3">
                                  <span className={`px-2 py-0.5 text-[9px] font-bold border rounded-md ${statusColors[c.status]}`}>
                                    {c.status.replace('_', ' ')}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Panel: AI Dispatch Stats & Quick Action buttons */}
                <div className="space-y-6">
                  
                  {/* AI Assistance Action Card */}
                  <div className="glass-card rounded-2xl p-5 border border-zinc-800 bg-gradient-to-tr from-indigo-950/20 via-zinc-900/60 to-cyan-950/15 relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-3">
                      <Sparkles className="w-4 h-4 glow-text-indigo animate-pulse" />
                      <span>StaySage Automated Dispatch</span>
                    </div>
                    
                    <h4 className="text-sm font-bold text-white mb-2 leading-snug">
                      Analyze guest feedback in real time with AI routing.
                    </h4>
                    
                    <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                      Submit and resolve tickets with automatic department classification, urgency evaluation, and recommended actions.
                    </p>

                    <button
                      onClick={() => setActiveTab('submit')}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-lg hover:shadow-indigo-500/20"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>File AI Ticket</span>
                    </button>
                  </div>

                  {/* Mini Chart / Division Breakdown */}
                  <div className="glass-card rounded-2xl border border-zinc-800 p-5">
                    <h3 className="text-sm font-bold text-white tracking-wide mb-4 uppercase">DEPARTMENT DEPLOYMENTS</h3>
                    {complaints.length === 0 ? (
                      <p className="text-xs text-zinc-500 py-6 text-center">No data available</p>
                    ) : (
                      <div className="space-y-3">
                        {Object.entries(categoryCounts)
                          .sort((a, b) => b[1] - a[1])
                          .slice(0, 4)
                          .map(([dept, count]) => {
                            const pct = Math.round((count / totalCount) * 100);
                            return (
                              <div key={dept} className="space-y-1">
                                <div className="flex justify-between text-xs font-semibold">
                                  <span className="text-zinc-300 flex items-center gap-1.5">
                                    {deptIcons[dept as keyof typeof deptIcons]}
                                    {dept}
                                  </span>
                                  <span className="text-zinc-500">{count} ({pct}%)</span>
                                </div>
                                <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: SUBMIT COMPLAINT VIEW */}
          {activeTab === 'submit' && (
            <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
              <div className="glass-card rounded-2xl border border-zinc-800 p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 to-cyan-500 opacity-60" />
                
                <h3 className="text-md font-bold text-white mb-1.5 uppercase tracking-wide flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  AI Assisted Ticket Logging
                </h3>
                <p className="text-xs text-zinc-500 mb-6 leading-relaxed">
                  Enter the raw guest feedback below. StaySage AI will automatically parse the room number, guest name, priority level, department routing, and suggest resolution actions.
                </p>

                <form onSubmit={handleFormSubmit} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">
                        Guest Name (Optional)
                      </label>
                      <input
                        type="text"
                        value={formGuestName}
                        onChange={(e) => setFormGuestName(e.target.value)}
                        placeholder="e.g. John Doe"
                        className="w-full px-3.5 py-2 bg-zinc-950/40 border border-zinc-800 rounded-xl text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">
                        Room Number (Optional)
                      </label>
                      <input
                        type="text"
                        value={formRoomNumber}
                        onChange={(e) => setFormRoomNumber(e.target.value)}
                        placeholder="e.g. 302"
                        className="w-full px-3.5 py-2 bg-zinc-950/40 border border-zinc-800 rounded-xl text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">
                        Source
                      </label>
                      <select
                        value={formSource}
                        onChange={(e) => setFormSource(e.target.value as any)}
                        className="w-full px-3.5 py-2 bg-zinc-950/40 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                      >
                        <option value="front_desk">Front Desk</option>
                        <option value="phone">Phone Call</option>
                        <option value="in_person">In Person</option>
                        <option value="mobile_app">Mobile Guest App</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">
                        Department Assignment
                      </label>
                      <select
                        value={formDepartment}
                        onChange={(e) => setFormDepartment(e.target.value)}
                        className="w-full px-3.5 py-2 bg-zinc-950/40 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                      >
                        <option value="auto">✨ Let StaySage AI Classify</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Housekeeping">Housekeeping</option>
                        <option value="Billing">Billing</option>
                        <option value="Noise">Noise Control</option>
                        <option value="Staff Behavior">Staff Behavior</option>
                        <option value="Amenities">Amenities Support</option>
                        <option value="Food Service">Food & Beverage</option>
                        <option value="Safety">Safety & Security</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">
                      Complaint description *
                    </label>
                    <textarea
                      value={formText}
                      onChange={(e) => setFormText(e.target.value)}
                      placeholder="Type details (e.g., 'Room 302 AC not blowing cold air. Guest is upset because they checked in 20 minutes ago...')"
                      rows={5}
                      className="w-full px-3.5 py-2 bg-zinc-950/40 border border-zinc-800 rounded-xl text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-indigo-500 transition-colors text-sm resize-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-indigo-500/20 active:scale-[0.99]"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>StaySage AI Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Log Complaint & Dispatch AI</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* SUBMISSION RESULT MODAL/CARD */}
              {submissionSuccess && (
                <div className="glass-card rounded-2xl border border-emerald-500/30 p-6 animate-fade-in relative overflow-hidden bg-gradient-to-tr from-zinc-950/90 to-emerald-950/10">
                  <div className="absolute top-0 right-0 p-8 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      TICKET LOGGED & ROUTED SUCCESSFULLY
                    </h4>
                    <button 
                      onClick={() => setSubmissionSuccess(null)}
                      className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-6">
                    {/* Left details */}
                    <div className="col-span-2 space-y-4">
                      <div>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">AI Summary</p>
                        <p className="text-xs text-zinc-100 font-semibold mt-0.5">{submissionSuccess.analysis.summary}</p>
                      </div>

                      <div>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Suggested Dispatch Action</p>
                        <p className="text-xs text-zinc-200 mt-0.5 bg-zinc-900 border border-zinc-800/80 p-3 rounded-xl leading-relaxed">
                          {submissionSuccess.analysis.suggested_action}
                        </p>
                      </div>
                    </div>

                    {/* Right attributes */}
                    <div className="p-4 bg-zinc-950/40 border border-zinc-900 rounded-xl space-y-3">
                      <div>
                        <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Category</p>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white mt-1 uppercase">
                          {deptIcons[submissionSuccess.analysis.category as keyof typeof deptIcons]}
                          {submissionSuccess.analysis.category}
                        </span>
                      </div>

                      <div>
                        <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Priority</p>
                        <span className={`inline-flex px-1.5 py-0.5 text-[9px] font-extrabold border rounded mt-1 ${priorityColors[submissionSuccess.analysis.priority as keyof typeof priorityColors]}`}>
                          {submissionSuccess.analysis.priority}
                        </span>
                      </div>

                      <div>
                        <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Escalation Status</p>
                        <span className={`inline-flex px-1.5 py-0.5 text-[9px] font-extrabold border rounded mt-1 ${submissionSuccess.analysis.escalation_required ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-zinc-800 text-zinc-400 border-zinc-700/50'}`}>
                          {submissionSuccess.analysis.escalation_required ? 'ESCALATED' : 'STANDARD'}
                        </span>
                      </div>

                      <div>
                        <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Extracted Room</p>
                        <p className="text-xs text-zinc-100 font-bold mt-1">
                          Room {submissionSuccess.complaint.room_number ? submissionSuccess.complaint.room_number : 'Not Found'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2.5 mt-5 border-t border-zinc-900 pt-4">
                    <button
                      onClick={() => handleSelectComplaint(submissionSuccess.complaint.id)}
                      className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-bold rounded-lg text-xs transition-colors border border-zinc-800 cursor-pointer"
                    >
                      Open Details Window
                    </button>
                    <button
                      onClick={() => { setSubmissionSuccess(null); setActiveTab('complaints'); }}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
                    >
                      View complaints Desk
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ALL COMPLAINTS TABLE VIEW */}
          {activeTab === 'complaints' && (
            <div className="space-y-6 animate-fade-in">
              {/* Filters Panel */}
              <div className="glass-card rounded-2xl border border-zinc-800 p-4 flex flex-wrap items-center justify-between gap-4">
                
                {/* Search */}
                <div className="relative w-72">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search room, guest, keyword..."
                    className="w-full pl-9 pr-4 py-1.5 bg-zinc-950/40 border border-zinc-850 rounded-xl text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors text-xs"
                  />
                </div>

                {/* Dropdowns */}
                <div className="flex items-center gap-3">
                  {/* Status Filter */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Status:</span>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-2 py-1 bg-zinc-950/40 border border-zinc-800 rounded-lg text-zinc-300 text-xs focus:outline-none focus:border-indigo-500"
                    >
                      <option value="all">All</option>
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="dismissed">Dismissed</option>
                    </select>
                  </div>

                  {/* Priority Filter */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Priority:</span>
                    <select
                      value={filterPriority}
                      onChange={(e) => setFilterPriority(e.target.value)}
                      className="px-2 py-1 bg-zinc-950/40 border border-zinc-800 rounded-lg text-zinc-300 text-xs focus:outline-none focus:border-indigo-500"
                    >
                      <option value="all">All</option>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>

                  {/* Department Filter */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Division:</span>
                    <select
                      value={filterDepartment}
                      onChange={(e) => setFilterDepartment(e.target.value)}
                      className="px-2 py-1 bg-zinc-950/40 border border-zinc-800 rounded-lg text-zinc-300 text-xs focus:outline-none focus:border-indigo-500"
                    >
                      <option value="all">All</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Housekeeping">Housekeeping</option>
                      <option value="Billing">Billing</option>
                      <option value="Noise">Noise</option>
                      <option value="Staff Behavior">Staff Behavior</option>
                      <option value="Amenities">Amenities</option>
                      <option value="Food Service">Food Service</option>
                      <option value="Safety">Safety</option>
                    </select>
                  </div>

                  {/* Clear button */}
                  {(searchTerm || filterStatus !== 'all' || filterPriority !== 'all' || filterDepartment !== 'all') && (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setFilterStatus('all');
                        setFilterPriority('all');
                        setFilterDepartment('all');
                      }}
                      className="px-2 py-1 hover:bg-zinc-800 border border-transparent hover:border-zinc-700/80 text-zinc-400 hover:text-zinc-200 rounded-lg text-xs cursor-pointer font-semibold"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {/* Complaints Table Card */}
              <div className="glass-card rounded-2xl border border-zinc-800 overflow-hidden">
                {loadingComplaints ? (
                  <div className="py-24 flex justify-center items-center">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                  </div>
                ) : filteredComplaints.length === 0 ? (
                  <div className="py-24 text-center">
                    <Inbox className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                    <p className="text-sm font-semibold text-zinc-500">No complaints matching filter parameters found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-zinc-800 bg-zinc-950/20 text-[10px] text-zinc-500 font-extrabold tracking-wider uppercase">
                          <th className="py-4 px-6 w-1/12">ROOM</th>
                          <th className="py-4 px-6 w-2/12">GUEST</th>
                          <th className="py-4 px-6 w-5/12">COMPLAINT LOG</th>
                          <th className="py-4 px-6 w-1.5/12">PRIORITY</th>
                          <th className="py-4 px-6 w-1.5/12">STATUS</th>
                          <th className="py-4 px-6 w-1/12">CREATED</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-900/50">
                        {filteredComplaints.map(c => (
                          <tr
                            key={c.id}
                            onClick={() => handleSelectComplaint(c.id)}
                            className={`group cursor-pointer hover:bg-zinc-900/30 transition-colors ${
                              selectedComplaintId === c.id ? 'bg-indigo-500/5 border-l-2 border-l-indigo-500' : ''
                            }`}
                          >
                            <td className="py-3.5 px-6">
                              <span className="text-xs font-bold text-white">
                                {c.room_number ? c.room_number : '-'}
                              </span>
                            </td>
                            <td className="py-3.5 px-6">
                              <p className="text-xs font-bold text-zinc-200 group-hover:text-white truncate max-w-[150px]">
                                {c.guest_name ? c.guest_name : 'Guest'}
                              </p>
                              <span className="inline-flex items-center gap-1 text-[8px] font-bold text-zinc-500 uppercase mt-0.5">
                                {sourceIcons[c.source]}
                                {c.source.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="py-3.5 px-6">
                              <p className="text-xs text-zinc-400 group-hover:text-zinc-300 font-medium truncate max-w-sm">
                                {c.raw_text}
                              </p>
                              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-zinc-500 mt-1.5 uppercase">
                                {deptIcons[c.department]}
                                {c.department}
                              </span>
                            </td>
                            <td className="py-3.5 px-6">
                              <span className={`inline-flex px-1.5 py-0.5 text-[9px] font-bold border rounded-md ${priorityColors[c.priority]}`}>
                                {c.priority}
                              </span>
                            </td>
                            <td className="py-3.5 px-6">
                              <span className={`inline-flex px-1.5 py-0.5 text-[9px] font-bold border rounded-md ${statusColors[c.status]}`}>
                                {c.status.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="py-3.5 px-6 whitespace-nowrap">
                              <span className="text-[10px] text-zinc-500 font-semibold uppercase">
                                {new Date(c.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: ANALYTICS VIEW */}
          {activeTab === 'analytics' && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Trends line chart */}
              <div className="glass-card rounded-2xl border border-zinc-800 p-5">
                <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wide flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-400" />
                  INCIDENT FILING TRENDS (LAST 7 DAYS)
                </h3>
                <div className="h-64">
                  {complaints.length === 0 ? (
                    <div className="h-full flex justify-center items-center text-xs text-zinc-500 font-semibold">No trend data available</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendsData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                        <XAxis dataKey="name" stroke="#71717a" fontSize={10} fontWeight="bold" />
                        <YAxis stroke="#71717a" fontSize={10} fontWeight="bold" allowDecimals={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '12px' }}
                          labelStyle={{ color: '#fafafa', fontSize: 11, fontWeight: 'bold' }}
                          itemStyle={{ color: '#818cf8', fontSize: 11 }}
                        />
                        <Line type="monotone" dataKey="Complaints" stroke="#4f46e5" strokeWidth={2.5} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Grid split */}
              <div className="grid grid-cols-2 gap-6">
                {/* Department distribution */}
                <div className="glass-card rounded-2xl border border-zinc-800 p-5">
                  <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wide">COMPLAINTS BY DEPARTMENT DIVISION</h3>
                  <div className="h-64 flex items-center justify-center">
                    {chartCategories.length === 0 ? (
                      <div className="text-xs text-zinc-500 font-semibold">No category data available</div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartCategories}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {chartCategories.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '12px' }}
                            itemStyle={{ fontSize: 11 }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                    {/* Legend */}
                    {chartCategories.length > 0 && (
                      <div className="flex flex-col gap-2 shrink-0 ml-4 max-h-48 overflow-y-auto pr-4">
                        {chartCategories.map((entry, idx) => (
                          <div key={entry.name} className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} />
                            <span className="text-[10px] font-semibold text-zinc-400">{entry.name} ({entry.value})</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Priority distribution */}
                <div className="glass-card rounded-2xl border border-zinc-800 p-5">
                  <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wide">SEVERITY PRIORITY INDEX</h3>
                  <div className="h-64">
                    {complaints.length === 0 ? (
                      <div className="h-full flex justify-center items-center text-xs text-zinc-500 font-semibold">No priority data available</div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartPriorities}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                          <XAxis dataKey="name" stroke="#71717a" fontSize={10} fontWeight="bold" />
                          <YAxis stroke="#71717a" fontSize={10} fontWeight="bold" allowDecimals={false} />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '12px' }}
                            itemStyle={{ fontSize: 11 }}
                          />
                          <Bar dataKey="value" name="Tickets count">
                            {chartPriorities.map((entry, index) => {
                              let barColor = '#4f46e5';
                              if (entry.name === 'Low') barColor = '#71717a';
                              if (entry.name === 'Medium') barColor = '#3b82f6';
                              if (entry.name === 'High') barColor = '#f57c00';
                              if (entry.name === 'Critical') barColor = '#d32f2f';
                              return <Cell key={`cell-${index}`} fill={barColor} />;
                            })}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      </main>

      {/* SLIDE-OUT DETAIL PANEL (Like Linear Drawer) */}
      {selectedComplaintId && (
        <div className="w-96 border-l border-zinc-850 bg-zinc-950/90 backdrop-blur-xl shrink-0 flex flex-col justify-between animate-fade-in relative z-25">
          {loadingDetails ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
          ) : !selectedDetails ? (
            <div className="flex-1 flex items-center justify-center p-6 text-center">
              <p className="text-xs text-zinc-500 font-semibold">Failed to fetch ticket particulars</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="p-4 border-b border-zinc-900 flex justify-between items-center bg-zinc-950/20 shrink-0">
                <div>
                  <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">Incident details</h3>
                  <p className="text-[10px] text-zinc-500 mt-0.5">ID: {selectedDetails.complaint.id.split('-')[1] || selectedDetails.complaint.id.substring(0, 8)}</p>
                </div>
                <button
                  onClick={() => setSelectedComplaintId(null)}
                  className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {/* Guest Profile and Room */}
                <div className="p-3 bg-zinc-900 border border-zinc-850 rounded-xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-zinc-850 border border-zinc-700/60 flex items-center justify-center text-zinc-400 shrink-0">
                    <User className="w-4.5 h-4.5" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-white truncate">{selectedDetails.complaint.guest_name ? selectedDetails.complaint.guest_name : 'Guest'}</p>
                    <p className="text-[10px] text-zinc-500 font-semibold mt-0.5">Room {selectedDetails.complaint.room_number ? selectedDetails.complaint.room_number : 'N/A'}</p>
                  </div>
                </div>

                {/* Raw feedback */}
                <div className="space-y-1.5">
                  <span className="text-[9px] font-extrabold text-zinc-500 tracking-wider uppercase">Raw guest statement</span>
                  <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-950/40 border border-zinc-900 p-3.5 rounded-xl">
                    "{selectedDetails.complaint.raw_text}"
                  </p>
                </div>

                {/* Workflow Controls (Status and Dept dropdown) */}
                <div className="p-4 bg-zinc-900/40 border border-zinc-850 rounded-xl space-y-3.5">
                  <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Workflow Configuration</h4>
                  
                  {/* Status Select */}
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500 font-semibold">Status:</span>
                    <select
                      value={selectedDetails.complaint.status}
                      onChange={(e) => handleUpdateStatus(selectedDetails.complaint.id, e.target.value as any)}
                      className="px-2.5 py-1 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-300 focus:outline-none"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="dismissed">Dismissed</option>
                    </select>
                  </div>

                  {/* Department Select */}
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500 font-semibold">Assigned Division:</span>
                    <select
                      value={selectedDetails.complaint.department}
                      onChange={(e) => handleUpdateDepartment(selectedDetails.complaint.id, e.target.value as any)}
                      className="px-2.5 py-1 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-300 focus:outline-none"
                    >
                      <option value="Maintenance">Maintenance</option>
                      <option value="Housekeeping">Housekeeping</option>
                      <option value="Billing">Billing</option>
                      <option value="Noise">Noise</option>
                      <option value="Staff Behavior">Staff Behavior</option>
                      <option value="Amenities">Amenities</option>
                      <option value="Food Service">Food Service</option>
                      <option value="Safety">Safety</option>
                    </select>
                  </div>
                </div>

                {/* AI Analysis Panel */}
                {selectedDetails.analysis && (
                  <div className="glass-card rounded-xl p-4 border border-indigo-500/10 space-y-3.5 relative overflow-hidden bg-indigo-950/5">
                    <div className="flex items-center gap-1.5 text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 glow-text-indigo animate-pulse" />
                      <span>StaySage AI Insights</span>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">AI Summary</p>
                        <p className="text-zinc-200 mt-0.5 font-medium">{selectedDetails.analysis.summary}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3.5 bg-zinc-950/40 p-2.5 rounded-lg border border-zinc-900">
                        <div>
                          <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider">Sentiment</p>
                          <p className="text-zinc-300 font-semibold text-[10px] mt-0.5">{selectedDetails.analysis.sentiment}</p>
                        </div>
                        <div>
                          <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider">Priority</p>
                          <span className={`inline-block mt-0.5 text-[9px] font-bold ${selectedDetails.complaint.priority === 'Critical' ? 'text-red-400' : selectedDetails.complaint.priority === 'High' ? 'text-orange-400' : 'text-blue-400'}`}>
                            {selectedDetails.complaint.priority}
                          </span>
                        </div>
                      </div>

                      <div>
                        <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Recommended Action</p>
                        <p className="text-zinc-300 leading-relaxed mt-0.5 text-[11px] bg-zinc-950/40 border border-zinc-900 p-2.5 rounded-lg">
                          {selectedDetails.analysis.suggested_action}
                        </p>
                      </div>

                      {selectedDetails.analysis.internal_note && (
                        <div>
                          <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Internal Ops Note</p>
                          <p className="text-zinc-400 italic text-[11px] mt-0.5">
                            "{selectedDetails.analysis.internal_note}"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Timeline activity logs */}
                <div className="space-y-2">
                  <span className="text-[9px] font-extrabold text-zinc-500 tracking-wider uppercase">Activity timeline</span>
                  <div className="space-y-3.5 relative pl-4 border-l border-zinc-800 py-1">
                    {selectedDetails.logs.map((log, idx) => (
                      <div key={log.id} className="relative text-xs">
                        {/* Dot indicator */}
                        <div className="absolute -left-[20.5px] top-1 w-2.5 h-2.5 rounded-full bg-zinc-800 border-2 border-background" />
                        
                        <div className="flex justify-between text-[10px] font-semibold text-zinc-500">
                          <span className="uppercase">{log.action.replace('_', ' ')}</span>
                          <span>{new Date(log.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-zinc-300 mt-0.5 font-medium leading-relaxed">{log.details}</p>
                        {log.performed_by && (
                          <p className="text-[9px] text-zinc-500 mt-0.5 font-semibold">By: {log.performed_by}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

    </div>
  );
}

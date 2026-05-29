import { createClient } from '@supabase/supabase-js';

// Types representing the database schema
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'manager' | 'staff';
  updated_at: string;
}

export interface Complaint {
  id: string;
  guest_name?: string;
  room_number?: string;
  raw_text: string;
  source: 'front_desk' | 'phone' | 'mobile_app' | 'in_person';
  department: 'Maintenance' | 'Housekeeping' | 'Billing' | 'Noise' | 'Staff Behavior' | 'Amenities' | 'Food Service' | 'Safety';
  status: 'open' | 'in_progress' | 'resolved' | 'dismissed';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  created_at: string;
  updated_at: string;
  created_by?: string;
  resolved_at?: string;
}

export interface ComplaintAnalysis {
  id: string;
  complaint_id: string;
  summary: string;
  category: string;
  sentiment: string;
  suggested_department: string;
  escalation_required: boolean;
  suggested_action: string;
  internal_note?: string;
  ai_response_raw?: any;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  complaint_id: string;
  action: string;
  details?: string;
  performed_by?: string; // profile ID or 'System AI'
  created_at: string;
}

// Credentials - use process.env first, fallback to the pre-discovered values
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ypnhxmgxlnbpzqjjzlxn.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlwbmh4bWd4bG5icHpxamp6bHhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4OTU0MDksImV4cCI6MjA5NTQ3MTQwOX0.FQo5-YmkusthgfWHtwoCULD-_bmx0pHYWm4r9sZRXro';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Seed Mock Data
const MOCK_COMPLAINTS: Complaint[] = [
  {
    id: 'complaint-1',
    guest_name: 'Jonathan Miller',
    room_number: '302',
    raw_text: 'Room 302 AC not working and guest is angry because issue was reported twice.',
    source: 'phone',
    department: 'Maintenance',
    status: 'in_progress',
    priority: 'Critical',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(), // 4 hours ago
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    created_by: 'demo-user-1'
  },
  {
    id: 'complaint-2',
    guest_name: 'Elena Rostova',
    room_number: '115',
    raw_text: 'The towels in the bathroom are stained and there is no extra toilet paper.',
    source: 'in_person',
    department: 'Housekeeping',
    status: 'open',
    priority: 'Low',
    created_at: new Date(Date.now() - 3600000 * 1).toISOString(), // 1 hour ago
    updated_at: new Date(Date.now() - 3600000 * 1).toISOString(),
    created_by: 'demo-user-2'
  },
  {
    id: 'complaint-3',
    guest_name: 'Marcus Vance',
    room_number: '508',
    raw_text: 'Billing charged me twice for parking and room service. Need this refunded immediately.',
    source: 'front_desk',
    department: 'Billing',
    status: 'resolved',
    priority: 'High',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(), // 24 hours ago
    updated_at: new Date(Date.now() - 3600000 * 20).toISOString(),
    created_by: 'demo-user-1',
    resolved_at: new Date(Date.now() - 3600000 * 20).toISOString()
  },
  {
    id: 'complaint-4',
    guest_name: 'Sarah Jenkins',
    room_number: '412',
    raw_text: 'Loud party in room 414 is keeping us awake. It is past midnight and nobody is answering our calls to front desk.',
    source: 'phone',
    department: 'Noise',
    status: 'open',
    priority: 'High',
    created_at: new Date(Date.now() - 3600000 * 0.5).toISOString(), // 30 mins ago
    updated_at: new Date(Date.now() - 3600000 * 0.5).toISOString(),
    created_by: 'demo-user-1'
  }
];

const MOCK_ANALYSES: ComplaintAnalysis[] = [
  {
    id: 'analysis-1',
    complaint_id: 'complaint-1',
    summary: 'Air conditioning unit malfunction in Room 302; repeat complaint causing severe guest dissatisfaction.',
    category: 'Maintenance',
    sentiment: 'Angry / Negative',
    suggested_department: 'Maintenance',
    escalation_required: true,
    suggested_action: 'Dispatch urgent maintenance technician to Room 302 immediately. Offer a complimentary meal or room upgrade if repair takes longer than 30 minutes.',
    internal_note: 'Repeat issue. Front desk did not log the first report correctly.',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: 'analysis-2',
    complaint_id: 'complaint-2',
    summary: 'Stained towels and insufficient toilet paper in Room 115.',
    category: 'Housekeeping',
    sentiment: 'Mildly Disappointed',
    suggested_department: 'Housekeeping',
    escalation_required: false,
    suggested_action: 'Deliver fresh towels and toiletries to Room 115 immediately. Apologize to the guest.',
    internal_note: 'Standard housekeeping delivery.',
    created_at: new Date(Date.now() - 3600000 * 1).toISOString()
  },
  {
    id: 'analysis-3',
    complaint_id: 'complaint-3',
    summary: 'Double charge for parking and room service.',
    category: 'Billing',
    sentiment: 'Frustrated',
    suggested_department: 'Billing',
    escalation_required: true,
    suggested_action: 'Reverse the incorrect charges in the PMS system and send email confirmation to the guest.',
    internal_note: 'Resolved by duty manager. Charge reversal processed.',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: 'analysis-4',
    complaint_id: 'complaint-4',
    summary: 'Loud disturbance from Room 414 and failure of communication with front desk.',
    category: 'Noise',
    sentiment: 'Frustrated / Sleep Deprived',
    suggested_department: 'Safety',
    escalation_required: true,
    suggested_action: 'Send security/night staff to Room 414 to issue noise warning. Call Room 412 back to apologize and inform them of action taken.',
    internal_note: 'Escalated to night security.',
    created_at: new Date(Date.now() - 3600000 * 0.5).toISOString()
  }
];

const MOCK_LOGS: ActivityLog[] = [
  {
    id: 'log-1',
    complaint_id: 'complaint-1',
    action: 'complaint_submitted',
    details: 'Complaint logged via Phone call.',
    performed_by: 'demo-user-1',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: 'log-2',
    complaint_id: 'complaint-1',
    action: 'status_updated',
    details: 'Status changed from Open to In Progress. Assigned to Maintenance team.',
    performed_by: 'demo-user-1',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'log-3',
    complaint_id: 'complaint-3',
    action: 'complaint_submitted',
    details: 'Complaint logged at Front Desk.',
    performed_by: 'demo-user-1',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: 'log-4',
    complaint_id: 'complaint-3',
    action: 'complaint_resolved',
    details: 'Marked as resolved. Refunds processed.',
    performed_by: 'demo-user-1',
    created_at: new Date(Date.now() - 3600000 * 20).toISOString()
  }
];

// Memory state for server-side/fallback operations
class MockDatabase {
  private complaintsList: Complaint[] = [...MOCK_COMPLAINTS];
  private analysesList: ComplaintAnalysis[] = [...MOCK_ANALYSES];
  private logsList: ActivityLog[] = [...MOCK_LOGS];

  constructor() {
    this.loadFromStorage();
  }

  private isClient() {
    return typeof window !== 'undefined';
  }

  private loadFromStorage() {
    if (!this.isClient()) return;
    try {
      const storedComplaints = localStorage.getItem('staysage_complaints');
      const storedAnalyses = localStorage.getItem('staysage_analyses');
      const storedLogs = localStorage.getItem('staysage_logs');

      if (storedComplaints) this.complaintsList = JSON.parse(storedComplaints);
      if (storedAnalyses) this.analysesList = JSON.parse(storedAnalyses);
      if (storedLogs) this.logsList = JSON.parse(storedLogs);
    } catch (e) {
      console.error('Failed to load mock DB from localStorage:', e);
    }
  }

  private saveToStorage() {
    if (!this.isClient()) return;
    try {
      localStorage.setItem('staysage_complaints', JSON.stringify(this.complaintsList));
      localStorage.setItem('staysage_analyses', JSON.stringify(this.analysesList));
      localStorage.setItem('staysage_logs', JSON.stringify(this.logsList));
    } catch (e) {
      console.error('Failed to save mock DB to localStorage:', e);
    }
  }

  getComplaints(): Complaint[] {
    this.loadFromStorage();
    return [...this.complaintsList].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  getComplaint(id: string): Complaint | undefined {
    this.loadFromStorage();
    return this.complaintsList.find(c => c.id === id);
  }

  getAnalysis(complaintId: string): ComplaintAnalysis | undefined {
    this.loadFromStorage();
    return this.analysesList.find(a => a.complaint_id === complaintId);
  }

  getLogs(complaintId: string): ActivityLog[] {
    this.loadFromStorage();
    return this.logsList
      .filter(l => l.complaint_id === complaintId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  insertComplaint(complaint: Omit<Complaint, 'id' | 'created_at' | 'updated_at'>): Complaint {
    this.loadFromStorage();
    const newComplaint: Complaint = {
      ...complaint,
      id: 'complaint-' + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.complaintsList.push(newComplaint);
    this.saveToStorage();
    return newComplaint;
  }

  insertAnalysis(analysis: Omit<ComplaintAnalysis, 'id' | 'created_at'>): ComplaintAnalysis {
    this.loadFromStorage();
    const newAnalysis: ComplaintAnalysis = {
      ...analysis,
      id: 'analysis-' + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString()
    };
    this.analysesList.push(newAnalysis);
    this.saveToStorage();
    return newAnalysis;
  }

  insertLog(log: Omit<ActivityLog, 'id' | 'created_at'>): ActivityLog {
    this.loadFromStorage();
    const newLog: ActivityLog = {
      ...log,
      id: 'log-' + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString()
    };
    this.logsList.push(newLog);
    this.saveToStorage();
    return newLog;
  }

  updateComplaintStatus(id: string, status: Complaint['status'], performedBy: string): Complaint | undefined {
    this.loadFromStorage();
    const idx = this.complaintsList.findIndex(c => c.id === id);
    if (idx === -1) return undefined;

    const oldStatus = this.complaintsList[idx].status;
    this.complaintsList[idx].status = status;
    this.complaintsList[idx].updated_at = new Date().toISOString();
    
    if (status === 'resolved') {
      this.complaintsList[idx].resolved_at = new Date().toISOString();
    }

    this.insertLog({
      complaint_id: id,
      action: 'status_updated',
      details: `Status changed from ${oldStatus.toUpperCase()} to ${status.toUpperCase()}.`,
      performed_by: performedBy
    });

    this.saveToStorage();
    return this.complaintsList[idx];
  }

  updateComplaintDepartment(id: string, department: Complaint['department'], performedBy: string): Complaint | undefined {
    this.loadFromStorage();
    const idx = this.complaintsList.findIndex(c => c.id === id);
    if (idx === -1) return undefined;

    const oldDept = this.complaintsList[idx].department;
    this.complaintsList[idx].department = department;
    this.complaintsList[idx].updated_at = new Date().toISOString();

    this.insertLog({
      complaint_id: id,
      action: 'department_assigned',
      details: `Department re-assigned from ${oldDept} to ${department}.`,
      performed_by: performedBy
    });

    this.saveToStorage();
    return this.complaintsList[idx];
  }
}

export const mockDb = new MockDatabase();

// Flag representing whether Supabase tables are ready for use.
// We start with 'unknown' and will verify on the first DB query.
let isSupabaseOperational: boolean | 'unknown' = 'unknown';

export async function checkSupabaseConnection(): Promise<boolean> {
  if (isSupabaseOperational !== 'unknown') {
    return isSupabaseOperational;
  }
  try {
    const { error } = await supabase.from('complaints').select('id').limit(1);
    if (error && error.code === 'PGRST205') {
      // Table does not exist in schema cache
      console.warn('Supabase DB operational check: "complaints" table not found. Using local mock database.');
      isSupabaseOperational = false;
    } else if (error) {
      console.warn('Supabase DB operational check failed:', error.message);
      isSupabaseOperational = false;
    } else {
      console.log('Supabase DB operational check succeeded: connected and tables exist!');
      isSupabaseOperational = true;
    }
  } catch (e) {
    console.warn('Supabase connection check exception:', e);
    isSupabaseOperational = false;
  }
  return isSupabaseOperational;
}

// Database Service interface that abstracts both Supabase and Mock DB
export const dbService = {
  async getComplaints(userId?: string): Promise<Complaint[]> {
    const useSupabase = await checkSupabaseConnection();
    if (useSupabase) {
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) return data as Complaint[];
    }
    return mockDb.getComplaints();
  },

  async getComplaintDetails(id: string): Promise<{ complaint: Complaint; analysis?: ComplaintAnalysis; logs: ActivityLog[] } | null> {
    const useSupabase = await checkSupabaseConnection();
    if (useSupabase) {
      const { data: complaint, error: cErr } = await supabase.from('complaints').select('*').eq('id', id).single();
      if (cErr || !complaint) return null;

      const { data: analysis } = await supabase.from('complaint_analysis').select('*').eq('complaint_id', id).maybeSingle();
      const { data: logs } = await supabase.from('activity_logs').select('*').eq('complaint_id', id).order('created_at', { ascending: true });

      return {
        complaint: complaint as Complaint,
        analysis: (analysis || undefined) as ComplaintAnalysis | undefined,
        logs: (logs || []) as ActivityLog[]
      };
    }

    const complaint = mockDb.getComplaint(id);
    if (!complaint) return null;
    return {
      complaint,
      analysis: mockDb.getAnalysis(id),
      logs: mockDb.getLogs(id)
    };
  },

  async createComplaint(
    complaint: Omit<Complaint, 'id' | 'created_at' | 'updated_at'>,
    analysis: Omit<ComplaintAnalysis, 'id' | 'complaint_id' | 'created_at'>
  ): Promise<Complaint> {
    const useSupabase = await checkSupabaseConnection();
    if (useSupabase) {
      const { data: newComplaint, error: cErr } = await supabase
        .from('complaints')
        .insert(complaint)
        .select()
        .single();
        
      if (!cErr && newComplaint) {
        const comp = newComplaint as Complaint;
        // Insert analysis
        await supabase.from('complaint_analysis').insert({
          ...analysis,
          complaint_id: comp.id
        });
        
        // Insert initial log
        await supabase.from('activity_logs').insert({
          complaint_id: comp.id,
          action: 'complaint_submitted',
          details: `Complaint submitted from ${comp.source.replace('_', ' ')}. AI analysis generated.`,
          performed_by: comp.created_by
        });

        return comp;
      }
      console.error('Failed to create complaint in Supabase, using mock fallback. Error:', cErr);
    }

    // Mock DB insert
    const comp = mockDb.insertComplaint(complaint);
    mockDb.insertAnalysis({
      ...analysis,
      complaint_id: comp.id
    });
    mockDb.insertLog({
      complaint_id: comp.id,
      action: 'complaint_submitted',
      details: `Complaint submitted from ${comp.source.replace('_', ' ')}. AI analysis generated.`,
      performed_by: comp.created_by || 'system'
    });

    return comp;
  },

  async updateStatus(id: string, status: Complaint['status'], performedBy: string): Promise<Complaint | null> {
    const useSupabase = await checkSupabaseConnection();
    if (useSupabase) {
      // Find old status
      const { data: oldData } = await supabase.from('complaints').select('status').eq('id', id).single();
      const oldStatus = oldData?.status || 'open';

      const updatePayload: Partial<Complaint> = { status };
      if (status === 'resolved') {
        updatePayload.resolved_at = new Date().toISOString();
      }

      const { data: updatedComplaint, error: uErr } = await supabase
        .from('complaints')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();

      if (!uErr && updatedComplaint) {
        await supabase.from('activity_logs').insert({
          complaint_id: id,
          action: 'status_updated',
          details: `Status changed from ${oldStatus.toUpperCase()} to ${status.toUpperCase()}.`,
          performed_by: performedBy
        });
        return updatedComplaint as Complaint;
      }
      console.error('Failed to update status in Supabase:', uErr);
    }

    return mockDb.updateComplaintStatus(id, status, performedBy) || null;
  },

  async updateDepartment(id: string, department: Complaint['department'], performedBy: string): Promise<Complaint | null> {
    const useSupabase = await checkSupabaseConnection();
    if (useSupabase) {
      const { data: oldData } = await supabase.from('complaints').select('department').eq('id', id).single();
      const oldDept = oldData?.department || 'Maintenance';

      const { data: updatedComplaint, error: uErr } = await supabase
        .from('complaints')
        .update({ department })
        .eq('id', id)
        .select()
        .single();

      if (!uErr && updatedComplaint) {
        await supabase.from('activity_logs').insert({
          complaint_id: id,
          action: 'department_assigned',
          details: `Department re-assigned from ${oldDept} to ${department}.`,
          performed_by: performedBy
        });
        return updatedComplaint as Complaint;
      }
      console.error('Failed to update department in Supabase:', uErr);
    }

    return mockDb.updateComplaintDepartment(id, department, performedBy) || null;
  }
};

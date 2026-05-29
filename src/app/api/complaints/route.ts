import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db';
import { analyzeComplaint } from '@/lib/ai';

export async function GET(request: Request) {
  try {
    const complaints = await dbService.getComplaints();
    return NextResponse.json({ complaints });
  } catch (err: any) {
    console.error('API Complaints GET error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch complaints' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { raw_text, guest_name, room_number, source, department, created_by } = body;

    if (!raw_text) {
      return NextResponse.json(
        { error: 'Complaint description (raw_text) is required' },
        { status: 400 }
      );
    }

    console.log('Analyzing complaint using AI:', raw_text);
    // Perform AI analysis
    const aiAnalysis = await analyzeComplaint(raw_text);
    console.log('AI Analysis result:', aiAnalysis);

    // Prepare complaint record, using overrides if explicitly provided in form
    const complaintRecord = {
      raw_text,
      guest_name: guest_name || aiAnalysis.room_number ? (guest_name || 'Guest') : (guest_name || 'Valued Guest'),
      room_number: room_number || aiAnalysis.room_number || '',
      source: source || 'front_desk',
      department: department || aiAnalysis.suggested_department || 'Maintenance',
      status: 'open' as const,
      priority: aiAnalysis.priority,
      created_by: created_by || undefined
    };

    // Prepare analysis record
    const analysisRecord = {
      summary: aiAnalysis.summary,
      category: aiAnalysis.category,
      sentiment: aiAnalysis.sentiment,
      suggested_department: aiAnalysis.suggested_department,
      escalation_required: aiAnalysis.escalation_required,
      suggested_action: aiAnalysis.suggested_action,
      internal_note: aiAnalysis.short_internal_note,
      ai_response_raw: aiAnalysis
    };

    // Insert into database
    const savedComplaint = await dbService.createComplaint(complaintRecord, analysisRecord);

    return NextResponse.json({ complaint: savedComplaint, analysis: aiAnalysis });
  } catch (err: any) {
    console.error('API Complaints POST error:', err);
    return NextResponse.json(
      { error: 'Failed to submit and analyze complaint: ' + err.message },
      { status: 500 }
    );
  }
}

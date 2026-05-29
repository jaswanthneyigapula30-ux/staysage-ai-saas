import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const details = await dbService.getComplaintDetails(id);

    if (!details) {
      return NextResponse.json(
        { error: 'Complaint not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(details);
  } catch (err: any) {
    console.error('API Complaint detail GET error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch complaint details' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, department, performed_by } = body;

    const actor = performed_by || 'system';

    if (status) {
      const updated = await dbService.updateStatus(id, status, actor);
      if (!updated) {
        return NextResponse.json(
          { error: 'Complaint not found or update failed' },
          { status: 404 }
        );
      }
      return NextResponse.json({ complaint: updated });
    }

    if (department) {
      const updated = await dbService.updateDepartment(id, department, actor);
      if (!updated) {
        return NextResponse.json(
          { error: 'Complaint not found or update failed' },
          { status: 404 }
        );
      }
      return NextResponse.json({ complaint: updated });
    }

    return NextResponse.json(
      { error: 'No update parameters provided (status or department required)' },
      { status: 400 }
    );
  } catch (err: any) {
    console.error('API Complaint update PATCH error:', err);
    return NextResponse.json(
      { error: 'Failed to update complaint' },
      { status: 500 }
    );
  }
}

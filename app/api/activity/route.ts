import { NextRequest, NextResponse } from 'next/server';
import { activityStore } from '@/lib/activity-store';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const events = activityStore.getEvents(50);
    return NextResponse.json({ events });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch activity' },
      { status: 500 }
    );
  }
}

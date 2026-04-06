import { NextResponse } from 'next/server';
import { activityStore } from '@/lib/activity-store';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Clear all activities (for testing)
export async function POST() {
  try {
    activityStore.clear();
    return NextResponse.json({ 
      success: true, 
      message: 'All activities cleared' 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to clear activities' },
      { status: 500 }
    );
  }
}

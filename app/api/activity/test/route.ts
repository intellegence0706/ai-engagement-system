import { NextResponse } from 'next/server';
import { activityStore } from '@/lib/activity-store';
import { ActivityEvent } from '@/lib/types';

// Test endpoint to manually add an activity
export async function POST() {
  try {
    const testActivity: ActivityEvent = {
      id: Math.random().toString(36).substr(2, 9),
      correlationId: `test-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'lead_form',
      status: 'sms_sent',
      data: {
        name: 'Test User',
        phone: '+15551234567',
        message: 'This is a test activity',
        response: 'This is a test AI response'
      }
    };

    console.log('[Test] Adding test activity:', testActivity);
    activityStore.addEvent(testActivity);
    console.log('[Test] Test activity added successfully');

    return NextResponse.json({ 
      success: true, 
      message: 'Test activity added',
      activity: testActivity
    });
  } catch (error) {
    console.error('[Test] Failed to add test activity:', error);
    return NextResponse.json(
      { error: 'Failed to add test activity' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { activityStore } from '@/lib/activity-store';
import { ActivityEvent } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Test endpoint to manually add a voice call activity
export async function POST() {
  try {
    const testActivity: ActivityEvent = {
      id: Math.random().toString(36).substring(2, 9),
      correlationId: `voice-test-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'voice_call',
      status: 'voice_sent',
      data: {
        name: 'Test Voice User',
        phone: '+15551234567',
        message: 'This is a test voice call',
        voiceMessage: 'Hello! This is a test AI-generated voice message. Thank you for your interest in our services.',
        callSid: 'CA' + Math.random().toString(36).substring(2, 32)
      }
    };

    console.log('[Voice Test] Adding test voice activity:', testActivity);
    activityStore.addEvent(testActivity);
    console.log('[Voice Test] Test voice activity added successfully');

    return NextResponse.json({ 
      success: true, 
      message: 'Test voice call activity added',
      activity: testActivity
    });
  } catch (error) {
    console.error('[Voice Test] Failed to add test voice activity:', error);
    return NextResponse.json(
      { error: 'Failed to add test voice activity' },
      { status: 500 }
    );
  }
}

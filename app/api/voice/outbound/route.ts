import { NextRequest, NextResponse } from 'next/server';
import { generateCorrelationId, Logger } from '@/lib/logger';
import { AIResponseGenerator } from '@/lib/ai-response-generator';
import { VoiceService } from '@/lib/voice-service';
import { activityStore } from '@/lib/activity-store';
import { ActivityEvent } from '@/lib/types';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const outboundCallSchema = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
  name: z.string().optional(),
  message: z.string().optional(),
});

/**
 * Make an outbound voice call with AI-generated message
 */
export async function POST(request: NextRequest) {
  const correlationId = generateCorrelationId();
  const logger = new Logger(correlationId);

  try {
    const body = await request.json();
    const validation = outboundCallSchema.safeParse(body);

    if (!validation.success) {
      logger.warn('Invalid outbound call request', { errors: validation.error.errors });
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { phone, name, message } = validation.data;
    logger.info('Outbound voice call requested', { phone, name });

    // Create activity event
    const activityEvent: ActivityEvent = {
      id: Math.random().toString(36).substring(2, 9),
      correlationId,
      timestamp: new Date().toISOString(),
      type: 'voice_call',
      status: 'processing',
      data: { phone, name, message }
    };
    activityStore.addEvent(activityEvent);

    // Generate AI voice message
    let voiceMessage: string;
    try {
      const aiGenerator = new AIResponseGenerator(
        process.env.OPENAI_API_KEY!,
        logger
      );
      voiceMessage = await aiGenerator.generateVoiceResponse(phone, name, message);
      
      activityStore.addEvent({
        id: Math.random().toString(36).substring(2, 9),
        correlationId,
        timestamp: new Date().toISOString(),
        type: 'voice_call',
        status: 'ai_generated',
        data: { phone, name, message, voiceMessage }
      });
    } catch (error) {
      logger.error('AI generation failed, using fallback', error);
      voiceMessage = name 
        ? `Hello ${name}, thank you for your interest. We'll be in touch soon.`
        : "Thank you for your interest. We'll be in touch soon.";
    }

    // Make the voice call
    const voiceService = new VoiceService(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!,
      process.env.TWILIO_PHONE_NUMBER!,
      logger
    );

    await voiceService.makeCall(phone, voiceMessage);

    activityStore.addEvent({
      id: Math.random().toString(36).substring(2, 9),
      correlationId,
      timestamp: new Date().toISOString(),
      type: 'voice_call',
      status: 'voice_sent',
      data: { phone, name, message, voiceMessage }
    });

    return NextResponse.json({
      success: true,
      correlationId,
      message: 'Voice call initiated successfully'
    });

  } catch (error) {
    logger.error('Failed to make outbound voice call', error);
    
    activityStore.addEvent({
      id: Math.random().toString(36).substring(2, 9),
      correlationId,
      timestamp: new Date().toISOString(),
      type: 'voice_call',
      status: 'failed',
      data: { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    });

    return NextResponse.json(
      { error: 'Failed to make voice call' },
      { status: 500 }
    );
  }
}

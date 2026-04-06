import { NextRequest, NextResponse } from 'next/server';
import { generateCorrelationId, Logger } from '@/lib/logger';
import { AIResponseGenerator } from '@/lib/ai-response-generator';
import { VoiceService } from '@/lib/voice-service';
import { activityStore } from '@/lib/activity-store';
import { ActivityEvent } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Twilio voice webhook - generates dynamic TwiML response
 * This endpoint is called when someone calls your Twilio number
 */
export async function POST(request: NextRequest) {
  const correlationId = generateCorrelationId();
  const logger = new Logger(correlationId);

  try {
    const formData = await request.formData();
    const from = formData.get('From') as string;
    const to = formData.get('To') as string;
    const callSid = formData.get('CallSid') as string;

    logger.info('Incoming voice call', { from, to, callSid });

    // Create activity event
    const activityEvent: ActivityEvent = {
      id: Math.random().toString(36).substring(2, 9),
      correlationId,
      timestamp: new Date().toISOString(),
      type: 'voice_call',
      status: 'processing',
      data: { phone: from, callSid }
    };
    activityStore.addEvent(activityEvent);

    // Generate AI response
    let message: string;
    try {
      const aiGenerator = new AIResponseGenerator(
        process.env.OPENAI_API_KEY!,
        logger
      );
      message = await aiGenerator.generateVoiceResponse(from);
      
      activityStore.addEvent({
        id: Math.random().toString(36).substring(2, 9),
        correlationId,
        timestamp: new Date().toISOString(),
        type: 'voice_call',
        status: 'ai_generated',
        data: { phone: from, callSid, message }
      });
    } catch (error) {
      logger.error('AI generation failed, using fallback', error);
      message = "Thank you for calling. We're currently unavailable, but we'll get back to you shortly.";
    }

    // Generate TwiML response
    const twiml = VoiceService.generateTwiMLResponse(message);

    activityStore.addEvent({
      id: Math.random().toString(36).substring(2, 9),
      correlationId,
      timestamp: new Date().toISOString(),
      type: 'voice_call',
      status: 'voice_sent',
      data: { phone: from, callSid, message }
    });

    return new NextResponse(twiml, {
      headers: { 'Content-Type': 'text/xml' }
    });

  } catch (error) {
    logger.error('Error processing voice call', error);
    
    // Return fallback TwiML
    const fallbackTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna-Neural">Thank you for calling. Please try again later.</Say>
</Response>`;

    return new NextResponse(fallbackTwiml, {
      headers: { 'Content-Type': 'text/xml' }
    });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { validateLeadSubmission } from '@/lib/validation';
import { generateCorrelationId, Logger } from '@/lib/logger';
import { AIResponseGenerator, FALLBACK_MESSAGE } from '@/lib/ai-response-generator';
import { SMSService } from '@/lib/sms-service';
import { RateLimiter } from '@/lib/rate-limiter';
import { activityStore } from '@/lib/activity-store';
import { ActivityEvent } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const rateLimiter = new RateLimiter(10, 60000);

export async function POST(request: NextRequest) {
  const correlationId = generateCorrelationId();
  const logger = new Logger(correlationId);

  try {
    // Rate limiting
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimit = rateLimiter.check(clientIp);
    
    if (!rateLimit.allowed) {
      logger.warn('Rate limit exceeded', { clientIp });
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    // Parse and validate request
    const body = await request.json();
    const validation = validateLeadSubmission(body);

    if (!validation.success) {
      logger.warn('Invalid lead submission', { errors: validation.error.errors });
      return NextResponse.json(
        { error: 'Invalid submission', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { name, phone, message } = validation.data;
    logger.info('Lead submission received', { name, phone });

    // Create initial activity event
    const activityEvent: ActivityEvent = {
      id: Math.random().toString(36).substr(2, 9),
      correlationId,
      timestamp: new Date().toISOString(),
      type: 'lead_form',
      status: 'processing',
      data: { name, phone, message }
    };
    activityStore.addEvent(activityEvent);

    // Process asynchronously
    processLeadSubmission(correlationId, name, phone, message);

    return NextResponse.json({
      success: true,
      correlationId,
      message: 'Lead received successfully'
    });

  } catch (error) {
    logger.error('Error processing lead submission', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function processLeadSubmission(
  correlationId: string,
  name: string,
  phone: string,
  message: string
) {
  const logger = new Logger(correlationId);

  try {
    // Generate AI response
    let response: string;
    let usedFallback = false;

    try {
      const aiGenerator = new AIResponseGenerator(
        process.env.OPENAI_API_KEY!,
        logger
      );
      response = await aiGenerator.generateLeadResponse(name, message);
      
      activityStore.addEvent({
        id: Math.random().toString(36).substr(2, 9),
        correlationId,
        timestamp: new Date().toISOString(),
        type: 'lead_form',
        status: 'ai_generated',
        data: { name, phone, message, response }
      });
    } catch (aiError) {
      logger.error('AI generation failed, using fallback', aiError);
      response = FALLBACK_MESSAGE;
      usedFallback = true;
    }

    // Send SMS
    const smsService = new SMSService(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!,
      process.env.TWILIO_PHONE_NUMBER!,
      logger
    );

    await smsService.sendSMS(phone, response);

    activityStore.addEvent({
      id: Math.random().toString(36).substr(2, 9),
      correlationId,
      timestamp: new Date().toISOString(),
      type: 'lead_form',
      status: 'sms_sent',
      data: { name, phone, message, response }
    });

    logger.info('Lead processing completed successfully', { usedFallback });

  } catch (error) {
    logger.error('Failed to process lead submission', error);
    
    activityStore.addEvent({
      id: Math.random().toString(36).substr(2, 9),
      correlationId,
      timestamp: new Date().toISOString(),
      type: 'lead_form',
      status: 'failed',
      data: { 
        name, 
        phone, 
        message, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    });
  }
}

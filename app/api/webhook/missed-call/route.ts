import { NextRequest, NextResponse } from 'next/server';
import { validateMissedCall } from '@/lib/validation';
import { generateCorrelationId, Logger } from '@/lib/logger';
import { AIResponseGenerator, FALLBACK_MESSAGE } from '@/lib/ai-response-generator';
import { SMSService } from '@/lib/sms-service';
import { WebhookValidator } from '@/lib/webhook-validator';
import { activityStore } from '@/lib/activity-store';
import { ActivityEvent } from '@/lib/types';

export async function POST(request: NextRequest) {
  const correlationId = generateCorrelationId();
  const logger = new Logger(correlationId);

  try {
    // Validate Twilio webhook signature
    const signature = request.headers.get('x-twilio-signature');
    
    if (signature && process.env.TWILIO_AUTH_TOKEN) {
      const validator = new WebhookValidator(process.env.TWILIO_AUTH_TOKEN);
      const url = request.url;
      const body = await request.formData();
      const params: Record<string, any> = {};
      
      body.forEach((value, key) => {
        params[key] = value;
      });

      const isValid = validator.validateTwilioSignature(url, params, signature);
      
      if (!isValid) {
        logger.warn('Invalid Twilio webhook signature');
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 403 }
        );
      }

      // Parse webhook data
      const validation = validateMissedCall(params);

      if (!validation.success) {
        logger.warn('Invalid missed call webhook', { errors: validation.error.errors });
        return NextResponse.json(
          { error: 'Invalid webhook data' },
          { status: 400 }
        );
      }

      const { From, CallStatus, CallSid } = validation.data;

      // Only process if call was not answered
      if (CallStatus === 'no-answer' || CallStatus === 'busy' || CallStatus === 'failed') {
        logger.info('Missed call detected', { from: From, callSid: CallSid });

        const activityEvent: ActivityEvent = {
          id: Math.random().toString(36).substr(2, 9),
          correlationId,
          timestamp: new Date().toISOString(),
          type: 'missed_call',
          status: 'processing',
          data: { phone: From }
        };
        activityStore.addEvent(activityEvent);

        // Process asynchronously
        processMissedCall(correlationId, From);
      }
    }

    // Return TwiML response
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      {
        headers: { 'Content-Type': 'text/xml' }
      }
    );

  } catch (error) {
    logger.error('Error processing missed call webhook', error);
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      {
        headers: { 'Content-Type': 'text/xml' }
      }
    );
  }
}

async function processMissedCall(correlationId: string, phoneNumber: string) {
  const logger = new Logger(correlationId);

  try {
    // Generate AI response
    let response: string;

    try {
      const aiGenerator = new AIResponseGenerator(
        process.env.OPENAI_API_KEY!,
        logger
      );
      response = await aiGenerator.generateMissedCallResponse(phoneNumber);
      
      activityStore.addEvent({
        id: Math.random().toString(36).substr(2, 9),
        correlationId,
        timestamp: new Date().toISOString(),
        type: 'missed_call',
        status: 'ai_generated',
        data: { phone: phoneNumber, response }
      });
    } catch (aiError) {
      logger.error('AI generation failed, using fallback', aiError);
      response = "Sorry we missed your call! We'll get back to you as soon as possible.";
    }

    // Send SMS
    const smsService = new SMSService(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!,
      process.env.TWILIO_PHONE_NUMBER!,
      logger
    );

    await smsService.sendSMS(phoneNumber, response);

    activityStore.addEvent({
      id: Math.random().toString(36).substr(2, 9),
      correlationId,
      timestamp: new Date().toISOString(),
      type: 'missed_call',
      status: 'sms_sent',
      data: { phone: phoneNumber, response }
    });

    logger.info('Missed call processing completed successfully');

  } catch (error) {
    logger.error('Failed to process missed call', error);
    
    activityStore.addEvent({
      id: Math.random().toString(36).substr(2, 9),
      correlationId,
      timestamp: new Date().toISOString(),
      type: 'missed_call',
      status: 'failed',
      data: { 
        phone: phoneNumber, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    });
  }
}

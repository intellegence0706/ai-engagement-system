import twilio from 'twilio';
import { Logger } from './logger';

export class VoiceService {
  private client: twilio.Twilio;
  private fromNumber: string;
  private logger: Logger;

  constructor(accountSid: string, authToken: string, fromNumber: string, logger: Logger) {
    this.client = twilio(accountSid, authToken);
    this.fromNumber = fromNumber;
    this.logger = logger;
  }

  /**
   * Make an outbound call with AI-generated voice message
   */
  async makeCall(toNumber: string, message: string): Promise<void> {
    try {
      this.logger.info('Making voice call', { to: toNumber, messageLength: message.length });

      const call = await this.client.calls.create({
        to: toNumber,
        from: this.fromNumber,
        twiml: this.generateTwiML(message),
      });

      this.logger.info('Voice call initiated successfully', {
        callSid: call.sid,
        status: call.status,
      });
    } catch (error: any) {
      this.logger.error('Failed to make voice call', error.message || error);
      throw new Error(`Voice call failed: ${error.message}`);
    }
  }

  /**
   * Generate TwiML for text-to-speech
   */
  private generateTwiML(message: string): string {
    // Use Twilio's Polly voices for natural-sounding speech
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna-Neural" language="en-US">${this.escapeXml(message)}</Say>
  <Pause length="1"/>
  <Say voice="Polly.Joanna-Neural" language="en-US">If you'd like to speak with someone, please call us back. Thank you!</Say>
</Response>`;
  }

  /**
   * Escape XML special characters
   */
  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Generate TwiML URL for webhook-based calls
   * This allows for more dynamic voice responses
   */
  static generateTwiMLResponse(message: string, voice: string = 'Polly.Joanna-Neural'): string {
    const escapedMessage = message
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="${voice}" language="en-US">${escapedMessage}</Say>
  <Pause length="1"/>
  <Say voice="${voice}" language="en-US">If you'd like to speak with someone, please call us back. Thank you!</Say>
</Response>`;
  }
}

// Available Twilio Polly Neural voices:
// - Polly.Joanna-Neural (Female, US English) - Warm and friendly
// - Polly.Matthew-Neural (Male, US English) - Professional
// - Polly.Ruth-Neural (Female, US English) - Clear and articulate
// - Polly.Stephen-Neural (Male, US English) - Conversational

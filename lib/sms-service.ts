import twilio from 'twilio';
import { Logger } from './logger';

export class SMSService {
  private client: twilio.Twilio;
  private fromNumber: string;
  private logger: Logger;

  constructor(accountSid: string, authToken: string, fromNumber: string, logger: Logger) {
    this.client = twilio(accountSid, authToken);
    this.fromNumber = fromNumber;
    this.logger = logger;
  }

  async sendSMS(to: string, message: string): Promise<string> {
    try {
      this.logger.info('Sending SMS', { 
        to, 
        from: this.fromNumber,
        messageLength: message.length 
      });

      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: to
      });

      this.logger.info('SMS sent successfully', { 
        messageId: result.sid,
        status: result.status,
        to: result.to,
        from: result.from,
        price: result.price,
        priceUnit: result.priceUnit,
        errorCode: result.errorCode,
        errorMessage: result.errorMessage
      });

      return result.sid;
    } catch (error) {
      this.logger.error('Failed to send SMS', error);
      throw error;
    }
  }
}

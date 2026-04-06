import OpenAI from 'openai';
import { Logger } from './logger';

export class AIResponseGenerator {
  private openai: OpenAI;
  private logger: Logger;

  constructor(apiKey: string, logger: Logger) {
    this.openai = new OpenAI({ apiKey });
    this.logger = logger;
  }

  async generateLeadResponse(name: string, message: string): Promise<string> {
    try {
      this.logger.info('Generating AI response for lead', { name });

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a professional sales representative for an AI agency. Generate a brief, friendly SMS response (max 160 characters) acknowledging the lead\'s inquiry and expressing interest in helping them.'
          },
          {
            role: 'user',
            content: `Generate a personalized SMS response for ${name} who said: "${message}"`
          }
        ],
        max_tokens: 100,
        temperature: 0.7
      });

      const response = completion.choices[0]?.message?.content?.trim() || '';
      
      // Ensure response is within SMS limit
      const truncatedResponse = response.substring(0, 160);
      
      this.logger.info('AI response generated successfully', { 
        responseLength: truncatedResponse.length 
      });

      return truncatedResponse;
    } catch (error) {
      this.logger.error('Failed to generate AI response', error);
      throw error;
    }
  }

  async generateMissedCallResponse(phoneNumber: string): Promise<string> {
    try {
      this.logger.info('Generating AI response for missed call', { phoneNumber });

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a professional sales representative for an AI agency. Generate a brief, friendly SMS response (max 160 characters) acknowledging a missed call and offering to help.'
          },
          {
            role: 'user',
            content: 'Generate a personalized SMS response for someone who just called but we missed their call.'
          }
        ],
        max_tokens: 100,
        temperature: 0.7
      });

      const response = completion.choices[0]?.message?.content?.trim() || '';
      const truncatedResponse = response.substring(0, 160);
      
      this.logger.info('AI response generated successfully for missed call');

      return truncatedResponse;
    } catch (error) {
      this.logger.error('Failed to generate AI response for missed call', error);
      throw error;
    }
  }

  async generateVoiceResponse(phoneNumber: string, name?: string, message?: string): Promise<string> {
    try {
      this.logger.info('Generating AI voice response', { phoneNumber, name });

      const userContext = name && message
        ? `Generate a voice message for ${name} who said: "${message}"`
        : name
        ? `Generate a voice message for ${name} who contacted us`
        : 'Generate a voice message for someone who contacted us';

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a professional sales representative for an AI agency. Generate a brief, natural-sounding voice message (2-3 sentences, conversational tone) that will be spoken by text-to-speech. Keep it warm, professional, and under 30 seconds when spoken. Do not include any special characters or formatting.'
          },
          {
            role: 'user',
            content: userContext
          }
        ],
        max_tokens: 150,
        temperature: 0.7
      });

      const response = completion.choices[0]?.message?.content?.trim() || '';
      
      this.logger.info('AI voice response generated successfully', { 
        responseLength: response.length 
      });

      return response;
    } catch (error) {
      this.logger.error('Failed to generate AI voice response', error);
      throw error;
    }
  }
}

export const FALLBACK_MESSAGE = "Thank you for your interest! We've received your message and will get back to you shortly.";

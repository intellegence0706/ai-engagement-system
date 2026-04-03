// Core types for the lead automation system

export interface LeadSubmission {
  name: string;
  phone: string;
  message: string;
}

export interface MissedCallEvent {
  From: string;
  To: string;
  CallStatus: string;
  CallSid: string;
}

export interface ActivityEvent {
  id: string;
  correlationId: string;
  timestamp: string;
  type: 'lead_form' | 'missed_call';
  status: 'processing' | 'ai_generated' | 'sms_sent' | 'failed';
  data: {
    name?: string;
    phone: string;
    message?: string;
    response?: string;
    error?: string;
  };
}

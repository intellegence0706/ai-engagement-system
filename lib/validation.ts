import { z } from 'zod';

// Phone number validation (E.164 format)
const phoneRegex = /^\+?[1-9]\d{1,14}$/;

export const leadSubmissionSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  phone: z.string().regex(phoneRegex, 'Invalid phone number format'),
  message: z.string().min(1, 'Message is required').max(1000)
});

export const missedCallSchema = z.object({
  From: z.string(),
  To: z.string(),
  CallStatus: z.string(),
  CallSid: z.string()
});

export function validateLeadSubmission(data: unknown) {
  return leadSubmissionSchema.safeParse(data);
}

export function validateMissedCall(data: unknown) {
  return missedCallSchema.safeParse(data);
}

import { z } from 'zod';

// Phone number validation and normalization
const phoneRegex = /^\+?[1-9]\d{1,14}$/;

// Function to normalize phone numbers to E.164 format
export function normalizePhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');
  
  // If it's a 10-digit US number, add +1
  if (digitsOnly.length === 10) {
    return `+1${digitsOnly}`;
  }
  
  // If it's 11 digits starting with 1, add +
  if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
    return `+${digitsOnly}`;
  }
  
  // If it already has +, return as is
  if (phone.startsWith('+')) {
    return `+${digitsOnly}`;
  }
  
  // Otherwise, just add + to the digits
  return `+${digitsOnly}`;
}

export const leadSubmissionSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  phone: z.string()
    .min(1, 'Phone number is required')
    .transform(normalizePhoneNumber)
    .refine((phone) => phoneRegex.test(phone), {
      message: 'Invalid phone number format. Please enter a valid phone number.'
    }),
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

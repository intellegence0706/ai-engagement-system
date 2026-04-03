# AI Lead Automation System

A full-stack Next.js application that demonstrates automated lead response capabilities for an AI agency. The system accepts lead form submissions and missed call events, generates personalized responses using AI, and sends automated SMS messages to prospects in real-time.

## Features

- **Lead Form Handler**: Accepts and validates lead submissions with name, phone, and message
- **Missed Call Handler**: Processes Twilio webhook events for missed calls
- **AI Response Generator**: Creates personalized SMS responses using OpenAI GPT-3.5/4
- **SMS Service**: Sends automated messages via Twilio API
- **Real-time Dashboard**: Live activity feed showing automation flow
- **Webhook Validation**: Verifies Twilio webhook signatures for security
- **Rate Limiting**: Protects public endpoints from abuse
- **Structured Logging**: Correlation IDs track requests through the system
- **Fallback Messages**: Graceful degradation when AI services fail

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **AI**: OpenAI API (GPT-3.5-turbo)
- **SMS**: Twilio API
- **Styling**: Tailwind CSS
- **Real-time**: Server-Sent Events (SSE)
- **Validation**: Zod

## Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key
- Twilio account with:
  - Account SID
  - Auth Token
  - Phone number with SMS capabilities

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-lead-automation
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
OPENAI_API_KEY=your_openai_api_key_here
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WEBHOOK_SECRET=your_webhook_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Development

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## API Endpoints

### POST /api/lead
Submit a new lead form.

**Request Body:**
```json
{
  "name": "John Doe",
  "phone": "+1234567890",
  "message": "Interested in your AI services"
}
```

**Response:**
```json
{
  "success": true,
  "correlationId": "1234567890-abc123",
  "message": "Lead received successfully"
}
```

### POST /api/webhook/missed-call
Twilio webhook endpoint for missed call events.

**Headers:**
- `x-twilio-signature`: Twilio webhook signature for validation

**Form Data:**
- `From`: Caller's phone number
- `To`: Called phone number
- `CallStatus`: Status of the call (no-answer, busy, failed)
- `CallSid`: Unique call identifier

### GET /api/activity
Fetch recent activity events.

**Response:**
```json
{
  "events": [
    {
      "id": "abc123",
      "correlationId": "1234567890-abc123",
      "timestamp": "2024-01-01T12:00:00.000Z",
      "type": "lead_form",
      "status": "sms_sent",
      "data": {
        "name": "John Doe",
        "phone": "+1234567890",
        "message": "Interested in your AI services",
        "response": "Hi John! Thanks for reaching out..."
      }
    }
  ]
}
```

### GET /api/activity/stream
Server-Sent Events stream for real-time activity updates.

## Twilio Configuration

### Setting up Missed Call Webhook

1. Log in to your Twilio Console
2. Navigate to Phone Numbers > Manage > Active Numbers
3. Select your phone number
4. Under "Voice Configuration":
   - Set "A CALL COMES IN" webhook to: `https://your-domain.com/api/webhook/missed-call`
   - Method: HTTP POST
5. Save the configuration

### Testing Webhooks Locally

Use a tool like ngrok to expose your local server:
```bash
ngrok http 3000
```

Then use the ngrok URL for your Twilio webhook configuration.

## Architecture

### Request Flow

1. **Lead Submission**:
   - Client submits form → Rate limiter checks → Validation
   - Generate correlation ID → Create activity event
   - AI generates personalized response (with fallback)
   - SMS sent via Twilio → Activity updated
   - Real-time dashboard updates via SSE

2. **Missed Call**:
   - Twilio webhook → Signature validation
   - Extract caller info → Create activity event
   - AI generates response → SMS sent
   - Real-time dashboard updates via SSE

### Components

- **Lead_Form_Handler** (`app/api/lead/route.ts`): Processes form submissions
- **Missed_Call_Handler** (`app/api/webhook/missed-call/route.ts`): Handles Twilio webhooks
- **AI_Response_Generator** (`lib/ai-response-generator.ts`): OpenAI integration
- **SMS_Service** (`lib/sms-service.ts`): Twilio SMS integration
- **Dashboard** (`app/page.tsx`): Real-time activity feed
- **Webhook_Validator** (`lib/webhook-validator.ts`): Twilio signature verification
- **Rate_Limiter** (`lib/rate-limiter.ts`): Request rate limiting
- **Logger** (`lib/logger.ts`): Structured logging with correlation IDs

## Error Handling

The system implements graceful degradation:

- **AI Failure**: Falls back to predefined professional message
- **SMS Failure**: Logs error with correlation ID for debugging
- **Validation Errors**: Returns clear error messages to client
- **Rate Limiting**: Returns 429 status when limit exceeded
- **Webhook Validation**: Rejects invalid signatures with 403 status

## Monitoring

All operations are logged with structured JSON including:
- Correlation ID for request tracking
- Timestamp
- Log level (info, warn, error)
- Contextual data

Example log entry:
```json
{
  "level": "info",
  "correlationId": "1234567890-abc123",
  "message": "SMS sent successfully",
  "data": {
    "messageId": "SM1234567890",
    "status": "queued"
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Production Deployment

### Environment Variables
Ensure all environment variables are set in your production environment.

### Build
```bash
npm run build
```

### Start
```bash
npm start
```

### Recommendations
- Use a process manager (PM2, systemd)
- Set up proper logging aggregation
- Monitor API rate limits (OpenAI, Twilio)
- Implement database for persistent activity storage
- Add authentication for dashboard access
- Set up SSL/TLS certificates
- Configure CORS appropriately

## Security Considerations

- Webhook signature validation prevents unauthorized requests
- Rate limiting protects against abuse
- Environment variables keep secrets secure
- Input validation prevents injection attacks
- Phone number format validation (E.164)
- HTTPS required for production webhooks

## License

MIT

## Support

For issues or questions, please open an issue in the repository.

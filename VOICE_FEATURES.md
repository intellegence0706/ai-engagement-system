# Voice Response Features

## Overview

The AI Lead Automation System now supports voice responses in addition to SMS. This allows for more engaging and personal communication with leads through AI-generated voice calls.

## Features

### 1. Incoming Call Handling
When someone calls your Twilio number, the system:
- Answers the call automatically
- Generates a personalized AI voice message
- Speaks the message using natural text-to-speech
- Logs the interaction in the dashboard

### 2. Outbound Voice Calls
Make automated voice calls to leads:
- AI generates personalized voice messages
- Natural-sounding speech using Twilio Polly Neural voices
- Tracks call status in real-time

### 3. Available Voices

The system uses Twilio's Amazon Polly Neural voices for natural-sounding speech:

- **Polly.Joanna-Neural** (Default) - Female, US English, warm and friendly
- **Polly.Matthew-Neural** - Male, US English, professional
- **Polly.Ruth-Neural** - Female, US English, clear and articulate
- **Polly.Stephen-Neural** - Male, US English, conversational

## Setup

### 1. Configure Twilio Voice Webhook

In your Twilio Console:
1. Go to Phone Numbers > Active Numbers
2. Select your number
3. Under "Voice Configuration":
   - A CALL COMES IN: `https://your-domain.com/api/voice/callback`
   - Method: HTTP POST
4. Save

### 2. Test Incoming Calls

Simply call your Twilio number. The system will:
- Answer automatically
- Generate an AI voice message
- Speak it to you
- Log the activity

### 3. Make Outbound Calls

Use the API endpoint:

```bash
curl -X POST https://your-domain.com/api/voice/outbound \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+1234567890",
    "name": "John Doe",
    "message": "Interested in AI services"
  }'
```

## How It Works

### Incoming Call Flow

1. User calls your Twilio number
2. Twilio sends webhook to `/api/voice/callback`
3. System generates AI voice message
4. Returns TwiML with text-to-speech instructions
5. Twilio speaks the message to caller
6. Activity logged in dashboard

### Outbound Call Flow

1. API receives outbound call request
2. AI generates personalized voice message
3. System initiates call via Twilio
4. Twilio calls the number
5. Speaks the AI-generated message
6. Activity logged in dashboard

## Voice Message Examples

### Lead Response
> "Hi John! Thanks for reaching out about our AI services. We're excited to help transform your business with automation. One of our specialists will call you back within 24 hours to discuss your specific needs. Have a great day!"

### Missed Call Response
> "Hello! We noticed you called but we weren't able to answer. We're sorry we missed you! Your call is important to us. Please expect a callback from our team shortly, or feel free to call us back anytime. Thank you!"

### General Inquiry
> "Thank you for contacting our AI agency. We specialize in intelligent automation solutions that help businesses save time and increase efficiency. We'd love to learn more about your needs. Someone from our team will reach out to you soon. Thanks for your interest!"

## Customization

### Change Voice

Edit `lib/voice-service.ts` and modify the voice parameter:

```typescript
<Say voice="Polly.Matthew-Neural" language="en-US">
```

### Adjust Message Length

Edit `lib/ai-response-generator.ts` in the `generateVoiceResponse` method:

```typescript
max_tokens: 150, // Increase for longer messages
```

### Add Background Music

Modify the TwiML in `lib/voice-service.ts`:

```xml
<Response>
  <Play>https://your-domain.com/hold-music.mp3</Play>
  <Say voice="Polly.Joanna-Neural">Your message here</Say>
</Response>
```

## Cost Considerations

Twilio Voice Pricing (approximate):
- Incoming calls: $0.0085/minute
- Outgoing calls: $0.013/minute
- Text-to-speech: Included in call pricing

OpenAI API:
- GPT-3.5-turbo: ~$0.002 per voice message generated

## Limitations

1. **Trial Accounts**: Can only call verified numbers
2. **Call Duration**: Messages should be under 30 seconds
3. **A2P 10DLC**: Same registration requirements as SMS
4. **Rate Limits**: Twilio has concurrent call limits

## Best Practices

1. **Keep messages brief** - 2-3 sentences maximum
2. **Use natural language** - Avoid special characters
3. **Include callback info** - Tell them how to reach you
4. **Test thoroughly** - Try different voices and messages
5. **Monitor costs** - Track call duration and frequency

## Troubleshooting

### Call Not Connecting
- Verify Twilio credentials in `.env`
- Check phone number format (E.164)
- Ensure webhook URL is accessible
- Verify A2P 10DLC registration (for US numbers)

### Voice Sounds Robotic
- Switch to Neural voices (Polly.Joanna-Neural)
- Use more natural language in prompts
- Avoid abbreviations and special characters

### AI Generation Fails
- Check OpenAI API key
- Verify API quota/credits
- System will use fallback message automatically

## Dashboard Integration

Voice calls appear in the dashboard with:
- Type: "voice_call"
- Status: "processing" → "ai_generated" → "voice_sent"
- Data: phone, callSid, message content

## Future Enhancements

Potential additions:
- Interactive voice response (IVR)
- Call recording and transcription
- Voicemail detection and handling
- Multi-language support
- Voice sentiment analysis
- Call transfer to human agents

## Support

For issues or questions:
- Check Twilio call logs in console
- Review application logs for errors
- Test with verified numbers first
- Ensure all environment variables are set

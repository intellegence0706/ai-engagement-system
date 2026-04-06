# Voice Features - Quick Start Guide

## What's New?

Your AI Lead Automation System can now respond with VOICE calls in addition to SMS!

## 🎯 Quick Setup (3 Steps)

### Step 1: Configure Twilio Voice Webhook

1. Go to [Twilio Console](https://console.twilio.com)
2. Phone Numbers → Active Numbers → Select your number
3. Under "Voice Configuration":
   - **A CALL COMES IN**: `https://your-vercel-app.vercel.app/api/voice/callback`
   - **Method**: HTTP POST
4. Click Save

### Step 2: Test Incoming Calls

Call your Twilio number from any phone. You'll hear:
- AI-generated personalized greeting
- Natural voice (not robotic!)
- Professional message

### Step 3: Make Outbound Calls (Optional)

Use the API to call leads automatically:

```bash
curl -X POST https://your-app.vercel.app/api/voice/outbound \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+1234567890",
    "name": "John Doe",
    "message": "Interested in AI automation"
  }'
```

## 🎤 How It Works

**Incoming Calls:**
1. Someone calls your number
2. AI generates personalized message
3. Twilio speaks it with natural voice
4. Logged in your dashboard

**Outbound Calls:**
1. Send API request with lead info
2. AI creates custom voice message
3. System calls the lead
4. Message is spoken automatically

## 🔊 Voice Options

Default voice: **Polly.Joanna-Neural** (Female, warm, friendly)

Other options:
- `Polly.Matthew-Neural` - Male, professional
- `Polly.Ruth-Neural` - Female, clear
- `Polly.Stephen-Neural` - Male, conversational

Change in `lib/voice-service.ts`

## 💰 Costs

- Incoming calls: ~$0.0085/minute
- Outgoing calls: ~$0.013/minute
- AI generation: ~$0.002/message

Example: 100 calls × 30 seconds = ~$0.70 + AI costs

## ⚠️ Important Notes

1. **Trial accounts** can only call verified numbers
2. **A2P 10DLC registration** still required for US numbers
3. Messages should be **under 30 seconds**
4. Test with your own number first!

## 📊 Dashboard

Voice calls show up in your dashboard:
- Type: "voice_call"
- Shows phone number and message
- Real-time status updates

## 🧪 Test It Now

**Option 1: Call your Twilio number**
- You'll hear the AI voice response

**Option 2: Use the test endpoint**
```bash
curl -X POST https://your-app.vercel.app/api/voice/outbound \
  -H "Content-Type: application/json" \
  -d '{"phone": "YOUR_VERIFIED_NUMBER", "name": "Test"}'
```

## 🆘 Troubleshooting

**Call doesn't connect?**
- Check webhook URL is correct
- Verify it's HTTPS (not HTTP)
- Ensure Vercel deployment is live

**Voice sounds robotic?**
- Make sure you're using Neural voices (Polly.Joanna-Neural)
- Check the voice parameter in `lib/voice-service.ts`

**Can't call certain numbers?**
- Trial accounts need verified numbers
- Or upgrade to paid Twilio account

## 📁 New Files Added

- `lib/voice-service.ts` - Voice call handling
- `app/api/voice/callback/route.ts` - Incoming call webhook
- `app/api/voice/outbound/route.ts` - Outbound call API
- `VOICE_FEATURES.md` - Detailed documentation

## 🚀 Next Steps

1. Set up the webhook (Step 1 above)
2. Call your number to test
3. Check your dashboard for the activity
4. Customize the voice/message if needed
5. Start using voice responses for leads!

## 💡 Use Cases

- **Missed calls**: Auto-respond with voice message
- **Lead follow-up**: Call leads automatically
- **Appointment reminders**: Voice confirmations
- **Customer service**: Instant voice responses
- **After-hours**: Professional voice greeting

That's it! Your system now has voice capabilities. 🎉

import { NextResponse } from 'next/server';
import twilio from 'twilio';

export async function GET() {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken) {
      return NextResponse.json({
        error: 'Twilio credentials not configured'
      }, { status: 500 });
    }

    const client = twilio(accountSid, authToken);

    // Fetch account information
    const account = await client.api.accounts(accountSid).fetch();

    return NextResponse.json({
      accountSid: account.sid,
      friendlyName: account.friendlyName,
      status: account.status,
      type: account.type,
      dateCreated: account.dateCreated,
      dateUpdated: account.dateUpdated,
      isPaid: account.type !== 'Trial',
      message: account.type === 'Trial' 
        ? '❌ Trial Account - Must verify numbers or upgrade'
        : '✅ Paid Account - Can send to any number'
    });
  } catch (error: any) {
    return NextResponse.json({
      error: 'Failed to fetch account status',
      details: error.message
    }, { status: 500 });
  }
}

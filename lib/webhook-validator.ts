import crypto from 'crypto';

export class WebhookValidator {
  private authToken: string;

  constructor(authToken: string) {
    this.authToken = authToken;
  }

  validateTwilioSignature(
    url: string,
    params: Record<string, any>,
    signature: string
  ): boolean {
    // Create the signature string
    const data = Object.keys(params)
      .sort()
      .reduce((acc, key) => acc + key + params[key], url);

    // Generate HMAC SHA1 signature
    const expectedSignature = crypto
      .createHmac('sha1', this.authToken)
      .update(Buffer.from(data, 'utf-8'))
      .digest('base64');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }
}

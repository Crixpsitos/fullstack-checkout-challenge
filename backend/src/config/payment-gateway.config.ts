import { registerAs } from '@nestjs/config';

export default registerAs('gateway', () => ({
  baseUrl: process.env.PAYMENT_GATEWAY_UAT_URL,
  apiKey: process.env.PAYMENT_PRIVATE_KEY,
  integritySecret: process.env.PAYMENT_INTEGRITY_SECRET,
  eventsSecret: process.env.PAYMENT_EVENTS_SECRET,
  timeout: parseInt(process.env.PAYMENT_API_TIMEOUT || '5000', 10),
}));

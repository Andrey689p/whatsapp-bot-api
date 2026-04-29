require('dotenv').config();

module.exports = {
  port: Number(process.env.PORT || 3000),
  whatsappClientId: process.env.WHATSAPP_CLIENT_ID || 'default-bot',
  whatsappAuthPath: process.env.WHATSAPP_AUTH_PATH || '.wwebjs_auth',
  whatsappApiToken: process.env.WHATSAPP_API_TOKEN || '',
  queueIntervalMs: Number(process.env.QUEUE_INTERVAL_MS || 6000)
};
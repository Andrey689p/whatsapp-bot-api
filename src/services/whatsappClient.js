const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const {
  whatsappClientId,
  whatsappAuthPath
} = require('../config/env');

let client;
let ready = false;

function createClient() {
  return new Client({
    authStrategy: new LocalAuth({
      clientId: whatsappClientId,
      dataPath: whatsappAuthPath
    }),
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
  });
}

async function initializeWhatsApp() {
  client = createClient();

  client.on('qr', (qr) => {
    console.log('\n📲 Escaneie o QR Code:\n');
    qrcode.generate(qr, { small: true });
  });

  client.on('authenticated', () => {
    console.log('✅ WhatsApp autenticado.');
  });

  client.on('ready', () => {
    ready = true;
    console.log('🤖 WhatsApp pronto.');
  });

  client.on('auth_failure', (msg) => {
    ready = false;
    console.error('❌ Falha de autenticação:', msg);
  });

  client.on('disconnected', (reason) => {
    ready = false;
    console.warn('⚠️ WhatsApp desconectado:', reason);
  });

  client.on('message_create', async (message) => {
    try {
      if (message.fromMe) {
        return;
      }

      if (typeof message.body !== 'string') {
        return;
      }

      const text = normalizeIncomingText(message.body);

      if (text === 'oi') {
        await message.reply('Olá! Como posso te ajudar?');
        return;
      }

      if (text === 'ajuda') {
        await message.reply('Comandos disponíveis: Oi, Ajuda');
      }
    } catch (error) {
      console.error('Erro ao responder mensagem:', error.message);
    }
  });

  await client.initialize();
}

function getClient() {
  if (!client) {
    throw new Error('Cliente WhatsApp não inicializado.');
  }

  return client;
}

function isClientReady() {
  return ready;
}

function normalizeIncomingText(text) {
  return String(text)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

module.exports = {
  initializeWhatsApp,
  getClient,
  isClientReady
};
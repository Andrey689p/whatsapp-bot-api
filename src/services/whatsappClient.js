const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const {
  whatsappClientId,
  whatsappAuthPath
} = require('../config/env');

let client;
let ready = false;

function createClient() {
  const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;

  console.log('🔍 Browser path:', executablePath);

  const puppeteerConfig = {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--no-first-run',
      '--no-zygote'
    ]
  };

  if (executablePath) {
    puppeteerConfig.executablePath = executablePath;
  }

  return new Client({
    authStrategy: new LocalAuth({
      clientId: whatsappClientId,
      dataPath: whatsappAuthPath
    }),
    puppeteer: puppeteerConfig
  });
}

// ✅ ESTA FUNÇÃO ESTAVA FALTANDO (ERRO PRINCIPAL)
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
      if (message.fromMe) return;
      if (typeof message.body !== 'string') return;

      const text = String(message.body)
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

      if (text === 'oi') {
        await message.reply('Olá! Como posso te ajudar?');
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

// ✅ EXPORT CORRETO
module.exports = {
  initializeWhatsApp,
  getClient,
  isClientReady
};
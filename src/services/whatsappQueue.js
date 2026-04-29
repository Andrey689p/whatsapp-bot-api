const { queueIntervalMs } = require('../config/env');
const { getClient, isClientReady } = require('./whatsappClient');
const { toWhatsAppChatId } = require('../utils/phone');

const queue = [];
let processing = false;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function enqueueMessage({ number, message }) {
  if (!number || !message) {
    throw new Error('number e message são obrigatórios.');
  }

  const job = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    number,
    message,
    createdAt: new Date().toISOString(),
    status: 'queued'
  };

  queue.push(job);
  processQueue().catch((error) => {
    console.error('Erro no processamento da fila:', error.message);
  });

  return job;
}

async function processQueue() {
  if (processing) {
    return;
  }

  processing = true;

  try {
    while (queue.length > 0) {
      const job = queue[0];

      try {
        if (!isClientReady()) {
          console.warn('WhatsApp ainda não está pronto. Aguardando 5 segundos...');
          await sleep(5000);
          continue;
        }

        const client = getClient();
        const chatId = toWhatsAppChatId(job.number);

        job.status = 'sending';

        const result = await client.sendMessage(chatId, job.message);

        job.status = 'sent';
        job.sentAt = new Date().toISOString();
        job.resultId = result?.id?._serialized || null;

        console.log(`✅ Mensagem enviada para ${job.number}`);
      } catch (error) {
        job.status = 'failed';
        job.error = error.message;
        job.failedAt = new Date().toISOString();

        console.error(`❌ Falha ao enviar para ${job.number}: ${error.message}`);
      } finally {
        queue.shift();
      }

      if (queue.length > 0) {
        console.log(`⏳ Aguardando ${queueIntervalMs} ms para o próximo envio...`);
        await sleep(queueIntervalMs);
      }
    }
  } finally {
    processing = false;
  }
}

function getQueueStatus() {
  return {
    processing,
    total: queue.length,
    items: queue.map((item) => ({
      id: item.id,
      number: item.number,
      status: item.status,
      createdAt: item.createdAt
    }))
  };
}

module.exports = {
  enqueueMessage,
  getQueueStatus
};
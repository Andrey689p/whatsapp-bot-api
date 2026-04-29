const { enqueueMessage, getQueueStatus } = require('../services/whatsappQueue');

async function sendMessage(req, res) {
  try {
    const { number, message } = req.body;

    if (!number || !message) {
      return res.status(400).json({
        success: false,
        message: 'Os campos number e message são obrigatórios.'
      });
    }

    const job = await enqueueMessage({ number, message });

    return res.status(202).json({
      success: true,
      message: 'Mensagem adicionada na fila.',
      data: job
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao enfileirar mensagem.',
      error: error.message
    });
  }
}

async function queueStatus(req, res) {
  try {
    return res.status(200).json({
      success: true,
      data: getQueueStatus()
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao obter status da fila.',
      error: error.message
    });
  }
}

module.exports = {
  sendMessage,
  queueStatus
};
function normalizePhone(phone) {
  return String(phone || '').replace(/\D/g, '');
}

function toWhatsAppChatId(phone) {
  const normalized = normalizePhone(phone);

  if (!normalized) {
    throw new Error('Número inválido.');
  }

  return `${normalized}@c.us`;
}

module.exports = {
  normalizePhone,
  toWhatsAppChatId
};
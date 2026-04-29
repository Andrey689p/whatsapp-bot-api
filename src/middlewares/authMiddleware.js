const { whatsappApiToken } = require('../config/env');

function authenticateRequest(req, res, next) {
  try {
    if (!whatsappApiToken) {
      return next();
    }

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Authorization não informado.'
      });
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || token !== whatsappApiToken) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido.'
      });
    }

    return next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao validar token.',
      error: error.message
    });
  }
}

module.exports = {
  authenticateRequest
};
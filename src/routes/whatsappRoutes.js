const express = require('express');
const router = express.Router();

const { authenticateRequest } = require('../middlewares/authMiddleware');
const {
  sendMessage,
  queueStatus
} = require('../controllers/whatsappController');

router.post('/send-message', authenticateRequest, sendMessage);
router.get('/queue-status', authenticateRequest, queueStatus);

module.exports = router;
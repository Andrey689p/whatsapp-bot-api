const app = require('./src/app');
const { port } = require('./src/config/env');
const { initializeWhatsApp } = require('./src/services/whatsappClient');

async function bootstrap() {
  try {
    await initializeWhatsApp();

    app.listen(port, () => {
      console.log(`🚀 API rodando em http://localhost:${port}`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar aplicação:', error);
    process.exit(1);
  }
}

bootstrap();
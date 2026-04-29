# 📱 whatsapp-bot-api

![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?style=flat-square&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express&logoColor=white)
![whatsapp-web.js](https://img.shields.io/badge/whatsapp--web.js-1.34-25D366?style=flat-square&logo=whatsapp&logoColor=white)
![Puppeteer](https://img.shields.io/badge/Puppeteer-headless-40B5A4?style=flat-square&logo=googlechrome&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)
![Version](https://img.shields.io/badge/version-1.0.0-informational?style=flat-square)

API REST independente para envio de mensagens via WhatsApp, com autenticação por token Bearer, fila de envio com intervalo configurável e respostas automáticas a comandos básicos.

---

## ✨ Funcionalidades

- **Envio de mensagens** via endpoint REST autenticado
- **Fila de envio** com controlo de intervalo entre mensagens (anti-spam)
- **Autenticação** por token Bearer configurable
- **Respostas automáticas** a comandos recebidos (`oi`, `ajuda`)
- **Persistência de sessão** com `LocalAuth` — sem necessidade de re-autenticar a cada reinício
- **Health check** endpoint para monitorização
- **Suporte a Docker/servidor headless** via Puppeteer sem sandbox

---

## 📂 Estrutura do Projeto

```
whatsapp-bot-api/
├── index.js                        # Entrypoint — bootstrap da app
├── package.json
├── .env.example
└── src/
    ├── app.js                      # Configuração Express (CORS, rotas)
    ├── config/
    │   └── env.js                  # Leitura e exportação das variáveis de ambiente
    ├── controllers/
    │   └── whatsappController.js   # Handlers dos endpoints
    ├── middlewares/
    │   └── authMiddleware.js       # Validação do token Bearer
    ├── routes/
    │   └── whatsappRoutes.js       # Definição das rotas /api/whatsapp
    └── services/
        ├── whatsappClient.js       # Inicialização e gestão do cliente WhatsApp
        └── whatsappQueue.js        # Fila de envio com intervalo entre mensagens
```

---

## 🚀 Instalação e Execução Local

### Pré-requisitos

- [Node.js](https://nodejs.org/) v18 ou superior
- [Google Chrome](https://www.google.com/chrome/) ou Chromium instalado (utilizado pelo Puppeteer)
- npm

### 1. Clonar o repositório

```bash
git clone https://github.com/<o-teu-utilizador>/whatsapp-bot-api.git
cd whatsapp-bot-api
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar as variáveis de ambiente

```bash
cp .env.example .env
```

Edita o ficheiro `.env` com os teus valores (ver secção abaixo).

### 4. Iniciar a aplicação

```bash
# Modo produção
npm start

# Modo desenvolvimento (com hot-reload via nodemon)
npm run dev
```

### 5. Autenticar o WhatsApp

Na primeira execução, um **QR Code** será gerado no terminal. Abre o WhatsApp no teu telemóvel e vai a **Dispositivos ligados → Ligar um dispositivo** para escanear o código.

A sessão fica guardada localmente e não precisarás repetir este passo nos próximos arranques.

---

## 🔧 Variáveis de Ambiente

Cria um ficheiro `.env` na raiz do projeto com base no exemplo abaixo:

```dotenv
# Porta onde a API vai correr (default: 3000)
PORT=3000

# Identificador único do cliente WhatsApp (para múltiplas sessões)
WHATSAPP_CLIENT_ID=meu-bot

# Caminho onde a sessão autenticada é guardada (default: .wwebjs_auth)
WHATSAPP_AUTH_PATH=.wwebjs_auth

# Token de segurança para autenticação Bearer (deixar vazio para desactivar)
WHATSAPP_API_TOKEN=supersecrettoken123

# Intervalo entre envios na fila, em milissegundos (default: 6000 = 6s)
QUEUE_INTERVAL_MS=6000

# Caminho para o executável do Chrome/Chromium (necessário em servidores)
# Exemplo Linux: /usr/bin/google-chrome
# Exemplo macOS: /Applications/Google Chrome.app/Contents/MacOS/Google Chrome
PUPPETEER_EXECUTABLE_PATH=
```

> ⚠️ **Nunca** comitas o teu `.env` real. O `.gitignore` já está configurado para o ignorar.

---

## 📡 Endpoints

### `GET /health`

Verifica se a API está operacional. Não requer autenticação.

```bash
curl http://localhost:3000/health
```

**Resposta:**
```json
{
  "success": true,
  "message": "API operacional"
}
```

---

### `POST /api/whatsapp/send-message`

Adiciona uma mensagem à fila de envio.

**Headers:**
```
Authorization: Bearer <WHATSAPP_API_TOKEN>
Content-Type: application/json
```

**Body:**
```json
{
  "number": "351912345678",
  "message": "Olá! Esta é uma mensagem enviada via API. 🚀"
}
```

> O campo `number` deve ser o número de telemóvel com código do país, **sem** o sinal `+` (ex: `351912345678` para Portugal).

**Exemplo com cURL:**
```bash
curl -X POST http://localhost:3000/api/whatsapp/send-message \
  -H "Authorization: Bearer supersecrettoken123" \
  -H "Content-Type: application/json" \
  -d '{"number": "351912345678", "message": "Olá via API! 👋"}'
```

**Resposta `202 Accepted`:**
```json
{
  "success": true,
  "message": "Mensagem adicionada na fila.",
  "data": {
    "id": "1714000000000-a3f8b2c1",
    "number": "351912345678",
    "message": "Olá via API! 👋",
    "createdAt": "2026-04-29T12:00:00.000Z",
    "status": "queued"
  }
}
```

---

### `GET /api/whatsapp/queue-status`

Consulta o estado actual da fila de envio.

```bash
curl http://localhost:3000/api/whatsapp/queue-status \
  -H "Authorization: Bearer supersecrettoken123"
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "processing": true,
    "total": 2,
    "items": [
      {
        "id": "1714000000000-a3f8b2c1",
        "number": "351912345678",
        "status": "sending",
        "createdAt": "2026-04-29T12:00:00.000Z"
      }
    ]
  }
}
```

---

## 🤖 Respostas Automáticas

O bot responde automaticamente a mensagens recebidas (não enviadas por si):

| Mensagem recebida | Resposta automática              |
|-------------------|----------------------------------|
| `oi`              | `Olá! Como posso te ajudar?`     |
| `ajuda`           | `Comandos disponíveis: Oi, Ajuda`|

A normalização é aplicada ao texto recebido (maiúsculas, acentos e espaços são ignorados).

---

## 🛡️ Segurança

- Todos os endpoints de `/api/whatsapp` exigem um token Bearer válido (quando `WHATSAPP_API_TOKEN` está definido).
- Se a variável `WHATSAPP_API_TOKEN` estiver vazia, a autenticação é desactivada — **não recomendado em produção**.

---

## 📄 Licença

Distribuído sob a licença **MIT**. Consulta o ficheiro `LICENSE` para mais detalhes.

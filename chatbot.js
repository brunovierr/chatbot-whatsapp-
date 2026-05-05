// =====================================
// IMPORTAÇÕES
// =====================================
const qrcode = require("qrcode-terminal");
const { Client, Location, MessageMedia, LocalAuth } = require("whatsapp-web.js");

// =====================================
// CONFIGURAÇÃO DO CLIENTE
// =====================================
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { headless: true, args: ["--no-sandbox"] },
});

// =====================================
// QR CODE
// =====================================
client.on("qr", (qr) => {
  console.log("Escaneie o QR Code:");
  qrcode.generate(qr, { small: true });
});

// =====================================
// WHATSAPP CONECTADO
// =====================================
client.on("ready", () => {
  console.log("WhatsApp conectado.");
});

// =====================================
// DESCONEXÃO
// =====================================
client.on("disconnected", (reason) => {
  console.log(" Desconectado:", reason);
});

// =====================================
// INICIALIZA
// =====================================
client.initialize();

// =====================================
// FUNÇÃO DE DELAY
// =====================================
const delay = (ms) => new Promise((res) => setTimeout(res, ms));
const userEstado = {}; // para que 

// MENSAGENS
client.on("message", async (msg) => {

  try {
    if (!msg.from || msg.from.endsWith("@g.us")) return;
    const chat = await msg.getChat();
    if (chat.isGroup) return;

    const texto = msg.body ? msg.body.trim().toLowerCase() : "";
    const userId = msg.from;

    // SIMULA DIGITACAO
    const typing = async () => {
      await delay(2000);
      await chat.sendStateTyping();
      await delay(2000);
    };

    // =====================================
    // MENSAGEM INICIAL
    // =====================================
    if (/^(teste)$/i.test(texto)) {
      // if (/^(teste|ol[aá]|dia|tarde|noite|oi|bom\s+dia|boa\s+tarde|boa\s+noite|opa|salve|hey|hi)$/i.test(texto)) {
      const hora = new Date().getHours();
      let saudacao = "Olá";

      if (hora >= 5 && hora < 12) saudacao = "Bom dia";
      else if (hora >= 12 && hora < 18) saudacao = "Boa tarde";
      else saudacao = "Boa noite";

      const contact = await msg.getContact();
      const nome = contact.pushname;

      await delay(1000);
      await chat.sendStateTyping();
      await delay(500);

      await client.sendMessage(
        msg.from,
        `${saudacao} ${nome}! 👋`
      );

      await typing();
      userEstado[userId] = "MENU";
      return await client.sendMessage(
        msg.from,
        `Seja bem-vindo(a) à Med Clean. 🧺

Como podemos ajudar você hoje? Digite o número da opção desejada:

1. Ver Serviços & Preços.
2. Ver Telefone de Contato.
3. Ver nosso Endereço.
4. Ver Horário de Funcionamento.
5. Outras dúvidas / Falar com um Atendente.`
      );
    }
    if (userEstado[userId] === "MENU") {
      if (msg.body === '1') {
        // if (/(pre[cç]o|valor|tabela|quanto|custa|servi[çc]o)/i.test(texto) | msg.body === '1') {

        const media = MessageMedia.fromFilePath('./media/tabela.png');

        await delay(500);
        await chat.sendStateTyping();
        await delay(500);

        client.sendMessage(msg.from, media);

        await delay(1000);
        await chat.sendStateTyping();
        await delay(500);

        client.sendMessage(msg.from,
          `Aqui está nossa tabela de preços atualizada! 🧺`
        );
      };

      if (msg.body === '2') {

        await delay(1000);
        await chat.sendStateTyping();
        await delay(500);

        client.sendMessage(msg.from,
          `📞 O nosso telefone de contato é *61 3301-1443*.`
        );
      };

      if (msg.body == '3') {
        const localizacao = new Location(-15.842678653156582, -47.98440178074539, 'Lavanderia Med Clean');

        await delay(1000);
        await chat.sendStateTyping();
        await delay(500);

        client.sendMessage(msg.from, localizacao);
        client.sendMessage(msg.from,
          `📍 Estamos localizados no Guará II, no endereço:\nQE 40 Conjunto D Lote 20 - Guará, Brasília - DF.`);
      };

      if (msg.body == '4') {

        await delay(1000);
        await chat.sendStateTyping();
        await delay(500);

        client.sendMessage(msg.from,
          `Nosso horário de funcionamento é de segunda a sexta, das *08:00 às 18:00*, e aos sábados, das *08:00 às 12:00*.`
        );
      };

      if (msg.body == '5') {
        const contact = await msg.getContact();
        const nome = contact.pushname;
        const horario = new Date().toLocaleString('pt-BR');
        const numeroCliente = contact.id.user;

        const alerta = `*🚨Notificação de atendimento*\n *Cliente:* ${nome} solicitou atendimento.\n *Número:* ${numeroCliente}.\n *Hora:* ${horario}`;
        client.sendMessage(client.info.wid._serialized, alerta);

        await delay(1000);
        await chat.sendStateTyping();
        await delay(500);

        const hora = new Date().toLocaleTimeString('pt-BR');
        if (hora >= 8 && hora <= 18) {
          client.sendMessage(msg.from,
            `Entendido! Em instantes, um de nossos atendentes dará continuidade à conversa.\nPor favor, aguarde só um momento! ⏳`);
        } else {
          client.sendMessage(msg.from,
            `Agradecemos o seu contato, porém no momento não há atendentes disponíveis.🫤\n\nNosso horário de funcionamento é de segunda a sexta *08:00 às 18:00* e aos sábados *08:00 às 12:00*.\nPor favor, deixe sua mensagem e retornaremos o contato o mais breve possível!`
          );
        };
      };
    };
    } catch (error) {
      console.error("Erro no processamento da mensagem:", error);
    }
  });

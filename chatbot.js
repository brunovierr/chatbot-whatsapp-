// =====================================
// importacoes e configs
// =====================================
const qrcode = require("qrcode-terminal");
const { Client, Location, MessageMedia, LocalAuth } = require("whatsapp-web.js");

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { headless: true, args: ["--no-sandbox"] },
});


const userEstado = {}; 

// =====================================
// funcoes aux
// =====================================
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// Passamos o 'chat' como parâmetro para evitar o erro de ReferenceError
const typing_a = async (chat) => {
  await delay(2000);
  await chat.sendStateTyping();
  await delay(2000);
};

const typing_b = async (chat) => {
  await delay(1000);
  await chat.sendStateTyping();
  await delay(500);
};

// =====================================
// eventos p conectar o wweb
// =====================================
client.on("qr", (qr) => {
  console.log("Escaneie o QR Code:");
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => console.log("WhatsApp conectado."));
client.on("disconnected", (reason) => console.log(" Desconectado:", reason));

client.initialize();

// =====================================
// logica das mensagens
// =====================================
client.on("message", async (msg) => {
  try {
    if (!msg.from || msg.from.endsWith("@g.us")) return;
    
    const chat = await msg.getChat();
    if (chat.isGroup) return;

    const texto = msg.body ? msg.body.trim().toLowerCase() : "";
    const userId = msg.from;

    if (texto === "menu") {
      userEstado[userId] = "MENU"; 
      const contact = await msg.getContact();
      const nome = contact.pushname || "Cliente";
      
      await typing_b(chat);
      const mensagemMenu = `Seja bem-vindo(a) à Med Clean. 🧺\n\nComo podemos ajudar você hoje? Digite o número da opção desejada:\n\n1. Ver Serviços & Preços.\n2. Ver Telefone de Contato.\n3. Ver nosso Endereço.\n4. Ver Horário de Funcionamento.\n5. Outras dúvidas / Falar com um Atendente.`;
      
      return await client.sendMessage(userId, mensagemMenu);
    }

    const contact = await msg.getContact();
    const nome = contact.pushname || "Cliente";
    const horario = new Date().toLocaleString("pt-BR");
    const horaAtual = new Date().getHours();
    const numeroCliente = contact.id.user;
    const numeroConectado = client.info.wid._serialized;

    // mensagens
    const mensagemMenu = `Seja bem-vindo(a) à Med Clean. 🧺\n\nComo podemos ajudar você hoje? Digite o número da opção desejada:\n\n1. Ver Serviços & Preços.\n2. Ver Telefone de Contato.\n3. Ver nosso Endereço.\n4. Ver Horário de Funcionamento.\n5. Outras dúvidas / Falar com um Atendente.`;
    
    const mensagem1 = `Aqui está nossa tabela de preços atualizada! 🧺`;
    const mensagem2 = `📞 O nosso telefone de contato é *61 3301-1443*.`;
    const mensagem3 = `📍 Estamos localizados no Guará II, no endereço:\nQE 40 Conjunto D Lote 20 - Guará, Brasília - DF.`;
    const mensagem4 = `Nosso horário de funcionamento é de segunda a sexta, das *08:00 às 18:00*, e aos sábados, das *08:00 às 12:00*.`;
    const mensagem5_a = `Entendido! Em instantes, um de nossos atendentes dará continuidade à conversa.\nPor favor, aguarde só um momento! ⏳\n\nCaso queira retornar digite _*MENU*_.`;
    const mensagem5_b = `Agradecemos o seu contato, porém no momento não há atendentes disponíveis.🫤\n\nNosso horário de funcionamento é de segunda a sexta *08:00 às 18:00* e aos sábados *08:00 às 12:00*.\nPor favor, deixe sua mensagem e retornaremos o contato o mais breve possível!\n\nCaso queira retornar digite _*MENU*_.`;
    
    const localizacao = new Location(-15.842678653156582, -47.98440178074539, "Lavanderia Med Clean");
    const alertaAtendimento = `*🚨Notificação de atendimento*\n*Cliente:* ${nome}\n*Número:* ${numeroCliente}\n*Hora:* ${horario}`;

    const validacaoMsg = /^(teste|ol[aá]|dia|tarde|noite|oi|bom\s+dia|boa\s+tarde|boa\s+noite|opa)\b/i;

    if (validacaoMsg.test(texto)) {
      
      let saudacao = "Olá";
      if (horaAtual >= 5 && horaAtual < 12) saudacao = "Bom dia";
      else if (horaAtual >= 12 && horaAtual < 18) saudacao = "Boa tarde";
      else saudacao = "Boa noite";

      await client.sendMessage(userId, `${saudacao} ${nome}! 👋`);
      await typing_a(chat); 
      
      userEstado[userId] = "MENU"; 
      return await client.sendMessage(userId, mensagemMenu);
    }
 
    // processa as mensagens de acordo com a requisicaop pelo cliente
    if (userEstado[userId] === "MENU") {
      if (texto === "1") {
        await typing_b(chat);
        const media = MessageMedia.fromFilePath("./media/tabela.png");
        await client.sendMessage(userId, media);
        await client.sendMessage(userId, mensagem1);
      } 
      else if (texto === "2") {
        await typing_b(chat);
        await client.sendMessage(userId, mensagem2);
      } 
      else if (texto === "3") {
        await typing_b(chat);
        await client.sendMessage(userId, localizacao);
        await client.sendMessage(userId, mensagem3);
      } 
      else if (texto === "4") {
        await typing_b(chat);
        await client.sendMessage(userId, mensagem4);
      } 

      else if (texto === "5") {
        await client.sendMessage(numeroConectado, alertaAtendimento);
        await typing_b(chat);
    
        if (horaAtual >= 8 && horaAtual < 18) {
          await client.sendMessage(userId, mensagem5_a);
        } else {
          await client.sendMessage(userId, mensagem5_b);
        }
    delete userEstado[userId]; 
    }
  }
  } catch (error) {
    console.error("Erro no processamento da mensagem:", error);
  }
});
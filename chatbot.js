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
const delay = (ms) => new Promise((res) => setTimeout(res, ms)); // preciso entender esta linha

// =====================================
// FUNIL DE MENSAGENS (SOMENTE PRIVADO)
// =====================================
client.on("message", async (msg) => {
  try {
    if (!msg.from || msg.from.endsWith("@g.us")) return;

    const chat = await msg.getChat();
    if (chat.isGroup) return;

    const texto = msg.body ? msg.body.trim().toLowerCase() : "";
    
    // Função de digitação
    const typing = async () => {
      await delay(2000);
      await chat.sendStateTyping();
      await delay(2000);
    };

    // =====================================
    // MENSAGEM INICIAL
    // =====================================
    if (/^(teste)$/i.test(texto)) {

      
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
      
      await typing(); // usa a funcao de digitação criada

      await client.sendMessage(
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
    
    
    if (msg.body === '1'){
      client.sendMessage(msg.from, 
        `Você pode conferir todos os nossos serviços e valores atualizados no nosso catálogo digital clicando aqui: https://drive.google.com/file/d/1_sk0v19Q7mi3eZ3zOcHvLH7lG7Y6tElB/view?usp=sharing`
      );
    };
    
    if (msg.body === '2'){
      client.sendMessage(msg.from,
        `📞 Nosso telefone de contato é:\n*61 3301-1443*`
  );
};
  
if (msg.body == '3'){
const localizacao = new Location(-15.842678653156582, -47.98440178074539, 'Lavanderia Med Clean');
  client.sendMessage(msg.from, localizacao);
  client.sendMessage(msg.from, 
    `📍 Estamos localizados no Guará II, no endereço:\nQE 40 Conjunto D Lote 20 - Guará, Brasília - DF`);
};

if (msg.body == '4'){
  client.sendMessage(msg.from,
    `Nosso atendimento funciona de segunda a sexta, das *08:00 às 18:00*, e aos sábados, das *08:00 às 12:00*.`
  );
};

if (msg.body == '5'){
  client.sendMessage(msg.from,
    `Entendido! Em instantes, um de nossos atendentes dará continuidade à conversa.\nPor favor, aguarde só um momento! ⏳`
  );
};



} catch (error) {
  console.error("Erro no processamento da mensagem:", error);
}
});

const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const axios = require('axios');
const config = require('./config.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers, GatewayIntentBits.MessageContent] });

const commands = [
  {
    name: "kur",
    description: "Kur görüntüleme",
    options: [
      {
        name: "doviz",
        description: "Döviz birimi",
        type: 3,
        required: true
      }
    ]
  }
];

const rest = new REST({ version: '10' }).setToken(config.token);

(async () => {
  try {
    await rest.put(Routes.applicationCommands(config.clientID), { body: commands });
    console.log("Komutlar yükleniyor...");
    console.log("Bot aktif!");
  } catch (error) {
    console.error(error);
  }
})();

client.on('interactionCreate', async (interaction) => {
  if (interaction.isCommand()) {
    if (interaction.commandName === "kur") {
      const exchange = interaction.options.getString('doviz').toUpperCase();
      const exchangeRate = await getExchangeRate();
      if (exchangeRate.hasOwnProperty(exchange)) {
        const rate = exchangeRate[exchange];
        const embed = {
          title: `${exchange} Kuru`,
          description: `Alış: ${rate.Alış} \n Satış: ${rate.Satış} TL\nDeğişim: ${rate.Değişim}`,
          color: 0x57F287
        };
        interaction.reply({ embeds: [embed], ephemeral: true});
      } else {
        interaction.reply('Böyle bir kur bulunamadı.', { ephemeral: true });
      }
    }
  }
});

async function getExchangeRate() {
  try {
    const response = await axios.get("https://finans.truncgil.com/today.json");
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

client.login(config.token);

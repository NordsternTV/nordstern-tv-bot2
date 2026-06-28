const {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  REST,
  Routes,
  EmbedBuilder,
  PermissionsBitField
} = require('discord.js');
const CLIENT_ID = "1499683855437791332";
const TOKEN = process.env.TOKEN;
const GUILD_ID = "1518981818387271740";
const LEITUNGSEBENE_ID = "1519202322281136188";
const PERSONALVERWALTUNG_ID = "1520475934338187376";

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once('ready', async () => {
  console.log(`${client.user.tag} ist online!`);

  const commands = [
  new SlashCommandBuilder()
    .setName('uprank')
    .setDescription('Team Uprank')
    .addUserOption(o => o.setName('user').setDescription('Wer?').setRequired(true))
    .addRoleOption(o => o.setName('von').setDescription('Von Rolle').setRequired(true))
    .addRoleOption(o => o.setName('auf').setDescription('Auf Rolle').setRequired(true))
    .addStringOption(o => o.setName('grund').setDescription('Grund').setRequired(true))
    .addUserOption(o => o.setName('haupt1').setDescription('Hauptunterzeichner 1').setRequired(true))
    .addUserOption(o => o.setName('haupt2').setDescription('Hauptunterzeichner 2').setRequired(false))
    .addUserOption(o => o.setName('haupt3').setDescription('Hauptunterzeichner 3').setRequired(false)),

  new SlashCommandBuilder()
    .setName('downrank')
    .setDescription('Team Downrank')
    .addUserOption(o => o.setName('user').setDescription('Wer?').setRequired(true))
    .addRoleOption(o => o.setName('von').setDescription('Von Rolle').setRequired(true))
    .addRoleOption(o => o.setName('auf').setDescription('Auf Rolle').setRequired(true))
    .addStringOption(o => o.setName('grund').setDescription('Grund').setRequired(true))
    .addUserOption(o => o.setName('haupt1').setDescription('Hauptunterzeichner 1').setRequired(true))
    .addUserOption(o => o.setName('haupt2').setDescription('Hauptunterzeichner 2').setRequired(false))
    .addUserOption(o => o.setName('haupt3').setDescription('Hauptunterzeichner 3').setRequired(false)),

  new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Team Warn')
    .addUserOption(o => o.setName('user').setDescription('Wer?').setRequired(true))
    .addStringOption(o => o.setName('grund').setDescription('Grund').setRequired(true)),

  new SlashCommandBuilder()
    .setName('nordstern_news')
    .setDescription('Sendet eine Nordstern TV News')
    .addChannelOption(o => o.setName('kanal').setDescription('In welchen Kanal?').setRequired(true))
    .addRoleOption(o => o.setName('ping').setDescription('Welche Rolle soll gepingt werden?').setRequired(true))
    .addStringOption(o => o.setName('titel').setDescription('Titel der News').setRequired(true))
    .addStringOption(o => o.setName('nachricht').setDescription('Die Nachricht').setRequired(true))
].map(c => c.toJSON());

  const rest = new REST({ version: '10' }).setToken(TOKEN);

  await rest.put(
    Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
    { body: commands }
  );

  console.log('Slash Commands geladen!');
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

const istLeitung =
  interaction.member.roles.cache.has(LEITUNGSEBENE_ID) ||
  interaction.member.permissions.has(PermissionsBitField.Flags.Administrator);

const istPersonalverwaltung =
  interaction.member.roles.cache.has(PERSONALVERWALTUNG_ID);

// Uprank darf Leitung + Personalverwaltung
if (
  interaction.commandName === 'uprank' &&
  !istLeitung &&
  !istPersonalverwaltung
) {
  return interaction.reply({
    content: '❌ Du hast keine Rechte für den Uprank.',
    ephemeral: true
  });
}

// Alle anderen Befehle nur Leitung
if (
  interaction.commandName !== 'uprank' &&
  !istLeitung
) {
  return interaction.reply({
    content: '❌ Du hast keine Rechte dafür.',
    ephemeral: true
  });
}
  if (interaction.commandName === 'nordstern_news') {
    const kanal = interaction.options.getChannel('kanal');
    const ping = interaction.options.getRole('ping');
    const titel = interaction.options.getString('titel');
    const nachricht = interaction.options.getString('nachricht');

    await kanal.send(
`${ping}

📰 ${titel}

${nachricht}`
    );

    return interaction.reply({
      content: '✅ Nordstern News wurde gesendet!',
      ephemeral: true
    });
  }

  const user = interaction.options.getUser('user');
  const member = await interaction.guild.members.fetch(user.id);
  const grund = interaction.options.getString('grund');
  const haupt1 = interaction.options.getUser('haupt1');
const haupt2 = interaction.options.getUser('haupt2');
const haupt3 = interaction.options.getUser('haupt3');

const hauptunterzeichner = [haupt1, haupt2, haupt3]
  .filter(Boolean)
  .join(' ');


  if (interaction.commandName === 'uprank') {
    const von = interaction.options.getRole('von');
    const auf = interaction.options.getRole('auf');

    await member.roles.remove(von);
    await member.roles.add(auf);

    const embed = new EmbedBuilder()
      .setColor('Green')
      .setDescription(
`⬆️ **TEAM UPRANK** ⬆️

**Wer:** ${user}
**Grund:** ${grund}

**Von:** ${von}
**Auf:** ${auf}
**Hauptunterzeichner:**
${hauptunterzeichner}`
      )
      .setTimestamp();

    return interaction.reply({ embeds: [embed] });
  }

  if (interaction.commandName === 'downrank') {
    const von = interaction.options.getRole('von');
    const auf = interaction.options.getRole('auf');

    await member.roles.remove(von);
    await member.roles.add(auf);

    const embed = new EmbedBuilder()
      .setColor('Red')
      .setDescription(
`⬇️ **TEAM DOWNRANK** ⬇️

**Wer:** ${user}
**Grund:** ${grund}

**Von:** ${von}
**Auf:** ${auf}

**Hauptunterzeichner:**
${hauptunterzeichner}
      )
      .setTimestamp();

    return interaction.reply({ embeds: [embed] });
  }

  if (interaction.commandName === 'warn') {
    const embed = new EmbedBuilder()
      .setColor('Orange')
      .setDescription(
⚠️ **TEAM WARN** ⚠️

**Wer:** ${user}
**Grund:** ${grund}

**Verwarnt von:**
${interaction.user}`
      )
      .setTimestamp();

    return interaction.reply({ embeds: [embed] });
  }
});

client.login(TOKEN);
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
    .addStringOption(o => o.setName('grund').setDescription('Grund').setRequired(true)),

  new SlashCommandBuilder()
    .setName('downrank')
    .setDescription('Team Downrank')
    .addUserOption(o => o.setName('user').setDescription('Wer?').setRequired(true))
    .addRoleOption(o => o.setName('von').setDescription('Von Rolle').setRequired(true))
    .addRoleOption(o => o.setName('auf').setDescription('Auf Rolle').setRequired(true))
    .addStringOption(o => o.setName('grund').setDescription('Grund').setRequired(true)),

  new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Team Warn')
    .addUserOption(o => o.setName('user').setDescription('Wer?').setRequired(true))
    .addStringOption(o => o.setName('grund').setDescription('Grund').setRequired(true)),

  new SlashCommandBuilder()
    .setName('say')
    .setDescription('Sendet eine Nachricht über den Bot')
    .addChannelOption(o => o.setName('kanal').setDescription('Zielkanal').setRequired(true))
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

  const darfDas =
    interaction.member.roles.cache.has(LEITUNGSEBENE_ID) ||
    interaction.member.permissions.has(PermissionsBitField.Flags.Administrator);

  if (!darfDas) {
    return interaction.reply({
      content: '❌ Du hast keine Rechte dafür!',
      ephemeral: true
    });
  }

  const user = interaction.options.getUser('user');
  const member = await interaction.guild.members.fetch(user.id);
  const grund = interaction.options.getString('grund');

  if (interaction.commandName === 'uprank') {
    const von = interaction.options.getRole('von');
    const auf = interaction.options.getRole('auf');

    await member.roles.remove(von);
    await member.roles.add(auf);

    const embed = new EmbedBuilder()
      .setColor('Green')
      .setDescription(
`⬆ :StaffBadge: **TEAM UPRANK** ⬆ :StaffBadge:

**Wer:** ${user}
**Grund:** ${grund}

**Von:** ${von}
**Auf:** ${auf}

**Hauptunterzeichner:**
${interaction.user}`
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
`📉 **TEAM DOWNRANK** 📉

**Wer:** ${user}
**Grund:** ${grund}

**Von:** ${von}
**Auf:** ${auf}

**Hauptunterzeichner:**
${interaction.user}`
      )
      .setTimestamp();

    return interaction.reply({ embeds: [embed] });
  }
  if (interaction.commandName === 'warn') {
    const embed = new EmbedBuilder()
      .setColor('Orange')
      .setDescription(
`⚠️ **TEAM WARN** ⚠️

**Wer:** ${user}
**Grund:** ${grund}

**Verwarnt von:**
${interaction.user}`
      )
      .setTimestamp();

    return interaction.reply({ embeds: [embed] });
  }

  if (interaction.commandName === 'say') {
    const kanal = interaction.options.getChannel('kanal');
    const nachricht = interaction.options.getString('nachricht');

    await kanal.send(nachricht);

  return interaction.reply({
    content: `✅ Nachricht wurde in ${kanal} gesendet.`,
    ephemeral: true
  });
}

});
client.login(TOKEN);
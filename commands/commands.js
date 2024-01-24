import * as discord from "discord.js";

const data = new discord.SlashCommandBuilder()
  .setName("commands")
  .setDescription("List all registered commands.");

async function changeCommand(response,interaction){
  const command = interaction.client.commands.get(response.values[0]);

  const embed = new discord.EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle(command.data.name)
    .setAuthor({ name: "Roody" })
    .setDescription(command.data.description)
    .setTimestamp();

  const r2=await response.update({ embeds: [embed] });

  const confirmation = await r2.awaitMessageComponent();
	return changeCommand(confirmation,interaction)
}

async function execute(interaction) {
  // Get all registered command names and send them as a response
  const commandOptions = interaction.client.commands.map((command) => {
    return new discord.StringSelectMenuOptionBuilder()
      .setLabel(command.data.name)
      .setDescription(command.data.description)
      .setValue(command.data.name);
  });
  const select = new discord.StringSelectMenuBuilder()
    .setCustomId("command")
    .setPlaceholder("Command name")
    .addOptions(commandOptions);

  const row = new discord.ActionRowBuilder().addComponents(select);

  const response = await interaction.reply({ components: [row] });

  const confirmation = await response.awaitMessageComponent();

  changeCommand(confirmation,interaction);
}

export { data, execute };

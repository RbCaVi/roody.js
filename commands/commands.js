import * as discord from "discord.js";

const data = new discord.SlashCommandBuilder()
  .setName("commands")
  .setDescription("List all registered commands.");

async function execute(interaction) {
  // Get all registered command names and send them as a response
	const commandOptions = interaction.client.commands.map(command => {
		return new discord.StringSelectMenuOptionBuilder()
			.setLabel(command.data.name)
			.setDescription(command.data.description)
			.setValue(command.data.name)
	});
	const select = new discord.StringSelectMenuBuilder()
		.setCustomId('command')
		.setPlaceholder('Command name')
		.addOptions(commandOptions);

	const row = new discord.ActionRowBuilder()
		.addComponents(select);

	const response=await interaction.reply({ components: [row] });

	const confirmation = await response.awaitMessageComponent();

	await interaction.editReply(confirmation.values[0]);

	await confirmation.update({ components: [] });
}

export { data, execute };

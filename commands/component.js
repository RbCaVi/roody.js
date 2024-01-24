import * as discord from 'discord.js';

const data=new discord.SlashCommandBuilder()
	.setName('component')
	.setDescription('Has components')

async function execute(interaction) {
	const button = new discord.ButtonBuilder()
		.setCustomId('button')
		.setLabel('The Button')
		.setStyle(discord.ButtonStyle.Secondary);

	const row = new discord.ActionRowBuilder()
		.addComponents(button);

	const exampleEmbed = new discord.EmbedBuilder()
		.setColor(0x0099FF)
		.setTitle('Some title')
		.setURL('https://discord.js.org/')
		.setAuthor({ name: 'Some name', iconURL: 'https://i.imgur.com/AfFp7pu.png', url: 'https://discord.js.org' })
		.setDescription('Some description here')
		.setThumbnail('https://i.imgur.com/AfFp7pu.png')
		.addFields(
			{ name: 'Regular field title', value: 'Some value here' },
			{ name: '\u200B', value: '\u200B' },
			{ name: 'Inline field title', value: 'Some value here', inline: true },
			{ name: 'Inline field title', value: 'Some value here', inline: true },
		)
		.addFields({ name: 'Inline field title', value: 'Some value here', inline: true })
		.setImage('https://i.imgur.com/AfFp7pu.png')
		.setTimestamp()
		.setFooter({ text: 'Some footer text here', iconURL: 'https://i.imgur.com/AfFp7pu.png' });

	await interaction.reply({ components: [row], embeds: [exampleEmbed] });
}

export {data,execute}
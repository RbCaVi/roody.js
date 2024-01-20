import * as discord from 'discord.js';

const data=new discord.SlashCommandBuilder().setName('ping').setDescription('Replies with Pong!')

async function execute(interaction) {
	await interaction.reply('Pong!');
}

export {data,execute}
import * as discord from 'discord.js';

const data=new discord.SlashCommandBuilder().setName('bonk').setDescription('Replies with Bonk!')

async function execute(interaction) {
	await interaction.reply('Bonk!');
}

export {data,execute}
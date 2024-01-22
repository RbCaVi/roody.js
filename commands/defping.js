import * as discord from 'discord.js';
import * as timersPromises from 'node:timers/promises';

const data=new discord.SlashCommandBuilder().setName('defping').setDescription('Replies with Pong! after 10 seconds')

async function execute(interaction) {
	await interaction.deferReply();
	await timersPromises.setTimeout(10_000);
	await interaction.editReply('Pong!');
}

export {data,execute}
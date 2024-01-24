import * as discord from 'discord.js';
import * as register from '../register.js'
import {default as config} from '../config.json' assert { type: "json" };

const data=new discord.SlashCommandBuilder().setName('load').setDescription('Loads a new command.').addStringOption(option => option.setName('command').setDescription('The command to load.').setRequired(true))

async function execute(interaction) {
	const commandName = interaction.options.getString('command', true).toLowerCase();
	const command = interaction.client.commands.get(commandName);

	if (command) {
		return interaction.reply(`There is already a command with name \`${commandName}\`!`);
	}

	try {
		await register.registerCommand(interaction.client,`./commands/${commandName}.js`)
		const commandData=await register.getCommandData(`./commands/${commandName}.js`)
	  console.log(`Started deploying ${commandName} application (/) command.`);

	  // The post method is used to replace one command
	  const data = await interaction.client.rest.post(
	    config.registerGuildOnly?
	    discord.Routes.applicationGuildCommands(config.clientId, config.guildId):
	    discord.Routes.applicationCommands(config.clientId),
	    { body: commandData },
	  );

	  console.log(`Successfully deployed ${commandName} application (/) command.`);
		await interaction.reply(`Command \`${commandName}\` was loaded!`);
	} catch (error) {
		console.error(error);
		await interaction.reply(`There was an error while loading a command \`${commandName}\`:\n\`${error.message}\``);
	}
}

export {data,execute}
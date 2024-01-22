import * as discord from 'discord.js';
import * as register from '../register.js'
import {default as config} from '../config.json' assert { type: "json" };

const data=new discord.SlashCommandBuilder().setName('reload').setDescription('Reloads a command.').addStringOption(option => option.setName('command').setDescription('The command to reload.').setRequired(true))

async function execute(interaction) {
	const commandName = interaction.options.getString('command', true).toLowerCase();
	const command = interaction.client.commands.get(commandName);

	if (!command) {
		return interaction.reply(`There is no command with name \`${commandName}\`!`);
	}

	try {
		interaction.client.commands.delete(commandName);
		await register.registerCommand(interaction.client,`./commands/${commandName}.js`)
		const commandData=await register.getCommandData(interaction.client,`./commands/${commandName}.js`)
	  console.log(`Started deploying ${commandName} application (/) command.`);

	  // The post method is used to replace one command
	  const data = await interaction.client.rest.post(
	    config.registerGuildOnly?
	    discord.Routes.applicationGuildCommands(config.clientId, config.guildId):
	    discord.Routes.applicationCommands(config.clientId),
	    { body: commandData },
	  );

	  console.log(`Successfully deployed ${commandName} application (/) command.`);
		await interaction.reply(`Command \`${commandName}\` was reloaded!`);
	} catch (error) {
		console.error(error);
		await interaction.reply(`There was an error while reloading a command \`${commandName}\`:\n\`${error.message}\``);
	}
}

export {data,execute}
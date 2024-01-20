import * as discord from 'discord.js';
import * as fs from 'node:fs'
import * as path from 'node:path'
import {default as config} from './config.json' assert { type: "json" };
const token=fs.readFileSync('token',{'encoding':'utf-8'});

console.log(config)

import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const commands = [];
// Grab all the command folders from the commands directory you created earlier
const foldersPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(foldersPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(foldersPath, file);
  const command = await import(filePath);
  if ('data' in command && 'execute' in command) {
    commands.push(command.data.toJSON());
  } else {
    console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
  }
}

// Construct and prepare an instance of the REST module
const rest = new discord.REST().setToken(token);

// and deploy your commands!
try {
  console.log(`Started refreshing ${commands.length} application (/) commands.`);

  // The put method is used to fully refresh all commands in the guild with the current set
  const data = await rest.put(
    //discord.Routes.applicationGuildCommands(config.clientId, config.guildId),
    discord.Routes.applicationCommands(config.clientId),
    { body: commands },
  );

  console.log(`Successfully reloaded ${data.length} application (/) commands.`);
} catch (error) {
  // And of course, make sure you catch and log any errors!
  console.error(error);
}

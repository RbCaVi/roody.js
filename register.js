export async function registerCommand(client,filePath) {
	const command = await import(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		throw new Error(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

export async function getCommandData(client,filePath) {
	const command = await import(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		return command.data.toJSON();
	} else {
		throw new Error(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}
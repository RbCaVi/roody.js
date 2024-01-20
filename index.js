// Require the necessary discord.js classes
import * as discord from 'discord.js';
import * as fs from 'node:fs'
import * as path from 'node:path'
const token=fs.readFileSync('token',{'encoding':'utf-8'});

// Create a new client instance
const client = new discord.Client({ intents: [discord.GatewayIntentBits.Guilds] });

// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(discord.Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// Log in to Discord with your client's token
client.login(token);

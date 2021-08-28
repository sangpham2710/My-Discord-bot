require("dotenv").config();
const { SlashCommandBuilder } = require("@discordjs/builders");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const token = process.env.BOT_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

const commands = [
	new SlashCommandBuilder()
		.setName("ping")
		.setDescription("Replies with pong!"),
	new SlashCommandBuilder()
		.setName("dict")
		.setDescription("A fully fledged dictionary")
		.addStringOption((option) =>
			option.setName("word").setDescription("Request a word").setRequired(true)
		)
].map((command) => command.toJSON());

const rest = new REST({ version: "9" }).setToken(token);

(async () => {
	try {
		await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
			body: commands
		});

		console.log("Successfully registered application commands.");
	} catch (error) {
		console.error(error);
	}
})();

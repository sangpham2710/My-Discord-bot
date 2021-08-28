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
		.addSubcommand((subcommand) =>
			subcommand
				.setName("get-word")
				.setDescription(
					'Request a word (or a random word instead if not specify the "word" option)'
				)
				.addStringOption((option) =>
					option.setName("word").setDescription("Request a word")
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("search-words")
				.setDescription("Search words using Regular Expression (RegEx)")
				.addStringOption((option) =>
					option
						.setName("query")
						.setDescription("Request a word")
						.setRequired(true)
				)
		),
	new SlashCommandBuilder()
		.setName("cat")
		.setDescription("Get cute cat pictures")
		.addSubcommand((subcommand) =>
			subcommand
				.setName("pic")
				.setDescription(
					"Get a random cute cat picture (optional: specifying tags)"
				)
				.addStringOption((option) =>
					option.setName("tags").setDescription("Add tags")
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("says")
				.setDescription("Get a random cat saying text")
				.addStringOption((option) =>
					option
						.setName("text")
						.setDescription("Cat says what?")
						.setRequired(true)
				)
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

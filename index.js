require("dotenv").config();
const { Client, Intents, MessageEmbed } = require("discord.js");
const token = process.env.BOT_TOKEN;
const rapidapiKey = process.env.RAPIDAPI_KEY;
const axios = require("axios").default;
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.once("ready", () => {
	console.log("Ready!");
});

const getWordData = async (word) => {
	const options = {
		method: "GET",
		url: `https://wordsapiv1.p.rapidapi.com/words/${word}`,
		headers: {
			"x-rapidapi-host": "wordsapiv1.p.rapidapi.com",
			"x-rapidapi-key": rapidapiKey
		}
	};
	try {
		const res = await axios.request(options);
		return res.data;
	} catch (err) {
		throw Error(`Cannot find requested word: "${word}"`);
	}
};

const getWordInfo = (data) => {
	const definitions = {};
	const parsedDefinitions = [
		{
			name: `Word: `,
			value: `**${data.word}**`,
			inline: true
		}
	];
	// parse definitions
	if (!data.results) {
		throw Error(`Requested word "${data.word}" has no formal definition`);
	}
	for (let result of data.results) {
		if (!definitions[result.partOfSpeech]) {
			definitions[result.partOfSpeech] = [];
		}
		definitions[result.partOfSpeech].push(result.definition);
	}
	//parse word info
	for (let partOfSpeech in definitions) {
		parsedDefinitions.push({
			name:
				`[${partOfSpeech}]` +
				(data.pronunciation
					? data.pronunciation[partOfSpeech]
						? ` /${data.pronunciation[partOfSpeech]}/:`
						: ` /${data.pronunciation.all}/:`
					: ""),
			value: definitions[partOfSpeech]
				.slice(0, 3)
				.map((definition) => " - " + definition)
				.join("\n")
		});
	}
	return parsedDefinitions;
};

const templateEmbed = {
	color: 0x0099ff,
	title: "📖 REK7on's Dictionary",
	description: "Do not spam! (2500 reqs/day only 🥺)",
	timestamp: new Date(),
	footer: {
		text: "Copyright © since 2021"
	}
};

client.on("interactionCreate", async (interaction) => {
	if (!interaction.isCommand()) return;

	const { commandName } = interaction;
	if (commandName === "ping") {
		await interaction.reply("Pong!");
	} else if (commandName === "dict") {
		const word = interaction.options.getString("word", true);
		try {
			const data = await getWordData(word);
			const fields = await getWordInfo(data);
			const response = {
				...templateEmbed,
				fields
			};

			await interaction.reply({ embeds: [response] });
		} catch (error) {
			console.log(error);
			const response = {
				...templateEmbed,
				fields: [{ name: "ERROR!!!", value: `**${error.message}**` }]
			};
			await interaction.reply({ embeds: [response] });
		}
	}
});

client.login(token);

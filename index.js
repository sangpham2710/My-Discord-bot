if (process.env.NODE_ENV !== "production") {
	require("dotenv").config();
}
const { Client, Intents } = require("discord.js");
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
		throw Error(
			`Requested word "${data.word}" has no formal definition\nPlease retry using its other word forms`
		);
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

const dictionaryEmbedTemplate = {
	color: 0x0099ff,
	title: "📖 REK7on's Dictionary",
	description: "Do not spam! (2500 reqs/day only 🥺)",
	timestamp: Date.now(),
	footer: {
		text: "Copyright © since 2021"
	}
};

const getRandomWord = async () => {
	const options = {
		method: "GET",
		url: "https://wordsapiv1.p.rapidapi.com/words/",
		params: { random: true },
		headers: {
			"x-rapidapi-host": "wordsapiv1.p.rapidapi.com",
			"x-rapidapi-key": rapidapiKey
		}
	};
	try {
		const res = await axios.request(options);
		return res.data.word;
	} catch (err) {
		throw Error("API Server didn't respond");
	}
};

const getWord = async (word) => {
	const random = !Boolean(word);
	try {
		if (random) word = await getRandomWord();
		const data = await getWordData(word);
		// const data = require("./data.json");
		const fields = getWordInfo(data);
		const response = {
			...dictionaryEmbedTemplate,
			fields
		};
		return response;
	} catch (err) {
		console.log(err);
		const response = {
			...dictionaryEmbedTemplate,
			fields: [{ name: "ERROR!!!", value: `**${err.message}**` }]
		};
		return response;
	}
};

const getSearchData = async (query) => {
	const options = {
		method: "GET",
		url: `https://wordsapiv1.p.rapidapi.com/words/`,
		params: {
			letterPattern: query,
			limit: 10
		},
		headers: {
			"x-rapidapi-host": "wordsapiv1.p.rapidapi.com",
			"x-rapidapi-key": rapidapiKey
		}
	};
	try {
		const res = await axios.request(options);
		return res.data.results.data;
	} catch (err) {
		throw Error("API Server didn't respond");
	}
};

const searchWords = async (query) => {
	try {
		const words = await getSearchData(query);
		const response = {
			...dictionaryEmbedTemplate,
			fields: [
				{
					name: `Search results for "${query}":`,
					value: words.length
						? words.map((word) => " - " + word).join("\n")
						: "No words found!"
				}
			]
		};
		return response;
	} catch (err) {
		console.log(err);
		const response = {
			...dictionaryEmbedTemplate,
			fields: [{ name: "ERROR!!!", value: `**${err.message}**` }]
		};
		return response;
	}
};

const catEmbedTemplate = {
	color: 0x0099ff,
	title: "📖 REK7on's Cat Shelter",
	description: "Get cute pictures of cats",
	timestamp: Date.now(),
	footer: {
		text: "Copyright © since 2021"
	}
};

const getCat = async (url) => {
	const options = {
		method: "GET",
		url
	};
	try {
		await axios.request(options);
		return {
			...catEmbedTemplate,
			image: { url }
		};
	} catch (err) {
		console.log(err);
		return {
			...catEmbedTemplate,
			fields: [{ name: "ERROR!!!", value: `**${err.response.statusText}**` }]
		};
	}
};

// *** HANDLE COMMANDS

client.on("interactionCreate", async (interaction) => {
	if (!interaction.isCommand()) return;
	const { commandName } = interaction;
	const subcommandName = interaction.options.getSubcommand();
	if (commandName === "ping") {
		await interaction.reply("Pong!");
	} else if (commandName === "dict") {
		if (subcommandName === "get-word") {
			const word = interaction.options.getString("word");
			await interaction.deferReply();
			const response = await getWord(word);
			await interaction.editReply({ embeds: [response] });
		} else if (subcommandName === "search-words") {
			const query = interaction.options.getString("query", true);
			await interaction.deferReply();
			const response = await searchWords(query);
			await interaction.editReply({ embeds: [response] });
		}
	} else if (commandName === "cat") {
		let url = "https://cataas.com/cat";
		if (subcommandName === "img") {
			const tags = interaction.options.getString("tags");
			if (tags) url += `/${tags}`;
		} else if (subcommandName === "gif") {
			url += "/gif";
		} else if (subcommandName === "says") {
			const text = interaction.options.getString("text", true);
			url += "/says/";
			url += text;
		}
		url = encodeURI(url);
		await interaction.deferReply();
		const response = await getCat(url);
		await interaction.editReply({ embeds: [response] });
	}
});

client.login(token);

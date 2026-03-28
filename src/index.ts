import initBot, { connectBot } from "./bot.ts";
import initWeb from "./web.ts";

initBot();
initWeb();

process.on('uncaughtException', (err) => {
	console.error(`Uncaught error (will reconnect): ${err.message}`);
	setTimeout(() => {
		connectBot();
	}, 15000);
});

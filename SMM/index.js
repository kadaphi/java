const bot = require("./src/bot/setup");
require("./src/bot/methods/command");
require("./src/bot/methods/callback");
require("./src/bot/methods/hear");

bot.start({
  drop_pending_updates: true,
  onStart: console.log("Bot Started...")
});
const bot = require("../setup");
const collection = require("../../database/database");

bot.hears("🔙 Back", async (ctx) => {
  await ctx.reply("<b>Hello " + ctx.from.first_name + ", Welcome to Social media boost Bot🚀\n\nUsing our automated Bot, professionally increase your telegram group/channel members👥️\nInstagram Services📷\nYouTube Services🎥\nFacebook Services👨‍👩‍👧‍👦\nTwitter Services🐦.....at a very cheap price\n\nInteract with the Bot using the buttons below👇</b>", { parse_mode: "HTML", reply_markup: { keyboard: [[{ text: "📦 Purchase" }, { text: "👤 Account" }], [{ text: "🔍 Track" }, { text: "☎ Support" }]], resize_keyboard: true, one_time_keyboard: false } });
});

bot.hears("📦 Purchase", async (ctx) => {
  const admin_panel = (await collection.child("admin_panel").once("value")).val();
  const contact = admin_panel?.contact || `https://t.me/${bot.botInfo.username}`;
  await ctx.reply("<b><i>🛍️ Explore and choose a service from the list:</i></b>", {
    parse_mode: "HTML", reply_markup: {
      inline_keyboard: [
        [{ text: "📨 Telegram", callback_data: "telegram" }, { text: "▶️ YouTube", callback_data: "youtube" }, { text: "📘 Facebook", callback_data: "facebook" }],
        [{ text: "🎶 TikTok", callback_data: "tiktok" }, { text: "📸 Instagram", callback_data: "instagram" }, { text: "🐦 Twitter", callback_data: "twitter" }],
        [{ text: "⏩ More", url: `${contact}` }]
      ]
    }
  });
});

bot.hears("👤 Account", async (ctx) => {
  await ctx.reply("<b>👤 Account</b>", { parse_mode: "HTML", reply_markup: { keyboard: [[{ text: "💰 Balance" }], [{ text: "➕ Deposit" }, { text: "📄 History" }], [{ text: "🔙 Back" }]], resize_keyboard: true, one_time_keyboard: false } });
});

bot.hears("💰 Balance", async (ctx) => {
  const user = (await collection.child("users").child(`${ctx.chat.id}`).once("value")).val();
  const balance = user?.balance || 0;
  await ctx.reply(`<code>${balance.toFixed(2)}$</code>`, { parse_mode: "HTML" });
});

bot.hears("➕ Deposit", async (ctx) => {
  await ctx.conversation.enter("deposit");
});

bot.hears("📄 History", async (ctx) => {
  const user = (await collection.child("users").child(`${ctx.chat.id}`).once("value")).val();
  const deposit_history = user?.deposit_history || [];
  const history = deposit_history.reverse().slice(0, 5);
  let message = "";
  for (const item of history) {
    message += `<b><i>🆔 Track ID:</i></b> <code>${item.id}</code>\n<b><i>💰 Amount:</i></b> <code>${item.amount}$</code>\n\n`;
  }
  if (history.length > 0) {
    await ctx.reply(`<b>📄 <u>Deposit History</u></b>\n\n${message}`, { parse_mode: "HTML" });
  } else {
    await ctx.reply("<b><i>❗ Your deposit history is not available</i></b>", { parse_mode: "HTML" });
  }
});

bot.hears("🔍 Track", async (ctx) => {
  await ctx.reply("<b>🔍 Track</b>", { parse_mode: "HTML", reply_markup: { keyboard: [[{ text: "📦 Track Purchase" }, { text: "➕ Track Deposit" }], [{ text: "🔙 Back" }]], resize_keyboard: true, one_time_keyboard: false } });
});

bot.hears("📦 Track Purchase", async (ctx) => {
  await ctx.reply("<b>❓ What you bought?</b>", { parse_mode: "HTML", reply_markup: { keyboard: [[{ text: "👤 Telegram Members (non drop)" }, { text: "↗ Other" }], [{ text: "🔙 Back" }]], resize_keyboard: true, one_time_keyboard: false } });
});

bot.hears(["👤 Telegram Members (non drop)", "↗ Other"], async (ctx) => {
  if (ctx.message.text === "👤 Telegram Members (non drop)") {
    ctx.session.track = "rapidseen";
  } else {
    ctx.session.track = "smmstone";
  }
  await ctx.conversation.enter("trackPurchase");
});

bot.hears("➕ Track Deposit", async (ctx) => {
  await ctx.conversation.enter("trackDeposit");
});

bot.hears("☎ Support", async (ctx) => {
  const admin_panel = (await collection.child("admin_panel").once("value")).val();
  const contact = admin_panel?.contact || `https://t.me/${bot.botInfo.username}`;
  await ctx.reply("<b>☎ <u>Support</u></b>\n\n<i>• Select the button below to access our dedicated customer service.\n• Specify the service you require or provide details about the issue you're experiencing.</i>", { parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "👩‍💻 Support", url: `${contact}` }]] } });
});

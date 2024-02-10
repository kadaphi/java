const bot = require("../setup");
const collection = require("../../database/database");
const { owner } = require("../../config/config");

bot.command(["start", "home", "back", "cancel"], async (ctx) => {
  await ctx.reply("<b>Hello " + ctx.from.first_name + ", Welcome to Social media boost Bot🚀\n\nUsing our automated Bot, professionally increase your telegram group/channel members👥️\nInstagram Services📷\nYouTube Services🎥\nFacebook Services👨‍👩‍👧‍👦\nTwitter Services🐦.....at a very cheap price\n\nInteract with the Bot using the buttons below👇</b>", { parse_mode: "HTML", reply_markup: { keyboard: [[{ text: "📦 Purchase" }, { text: "👤 Account" }], [{ text: "🔍 Track" }, { text: "☎ Support" }]], resize_keyboard: true, one_time_keyboard: false } });
});

bot.command(["purchase", "order"], async (ctx) => {
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

bot.command("account", async (ctx) => {
  await ctx.reply("<b>👤 Account</b>", { parse_mode: "HTML", reply_markup: { keyboard: [[{ text: "💰 Balance" }], [{ text: "➕ Deposit" }, { text: "📄 History" }], [{ text: "🔙 Back" }]], resize_keyboard: true, one_time_keyboard: false } });
});

bot.command("balance", async (ctx) => {
  const user = (await collection.child("users").child(`${ctx.chat.id}`).once("value")).val();
  const balance = user?.balance || 0;
  await ctx.reply(`<code>${balance.toFixed(2)}$</code>`, { parse_mode: "HTML" });
});

bot.command("deposit", async (ctx) => {
  await ctx.conversation.enter("deposit");
});

bot.command("history", async (ctx) => {
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

bot.command("track", async (ctx) => {
  await ctx.reply("<b>🔍 Track</b>", { parse_mode: "HTML", reply_markup: { keyboard: [[{ text: "📦 Track Purchase" }, { text: "➕ Track Deposit" }], [{ text: "🔙 Back" }]], resize_keyboard: true, one_time_keyboard: false } });
});

bot.command("support", async (ctx) => {
  const admin_panel = (await collection.child("admin_panel").once("value")).val();
  const contact = admin_panel?.contact || `https://t.me/${bot.botInfo.username}`;
  await ctx.reply("<b>☎ <u>Support</u></b>\n\n<i>• Select the button below to access our dedicated customer service.\n• Specify the service you require or provide details about the issue you're experiencing.</i>", { parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "👩‍💻 Support", url: `${contact}` }]] } });
});

bot.command("panel", async (ctx) => {
  const admin_panel = (await collection.child("admin_panel").once("value")).val();
  const admins = admin_panel?.admins || [];
  if (`${ctx.chat.id}` === `${owner}` || admins.includes(`${ctx.chat.id}`)) {
    await ctx.reply("<b>⚙ Admin Panel:</b>", {
      parse_mode: "HTML", reply_markup: {
        inline_keyboard:
          [[{ text: "➕ Add Admin", callback_data: "panel add_admin" }, { text: "➖ Remove Admin", callback_data: "panel remove_admin" }],
          [{ text: "✅ Bot ON", callback_data: "panel bot_on" }, { text: "🚫 Bot OFF", callback_data: "panel bot_off" }],
          [{ text: "🔴 Ban User", callback_data: "panel ban_user" }, { text: "🟢 Unban User", callback_data: "panel unban_user" }],
          [{ text: "➕ Add Channel", callback_data: "panel add_channel" }, { text: "➖ Remove Channel", callback_data: "panel remove_channel" }],
          [{ text: "💰 Edit Balance", callback_data: "panel edit_balance" }],
          [{ text: "📣 Broadcast", callback_data: "panel broadcast" }],
          [{ text: "☎ Set Contact Info", callback_data: "panel contact" }]]
      }
    });
  }
});

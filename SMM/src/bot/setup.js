const { Bot, GrammyError, HttpError, session } = require("grammy");
const { conversations, createConversation } = require("@grammyjs/conversations");
const { deposit, trackPurchase, trackDeposit, telegramNonDrop, buy, add_admin, remove_admin, bot_on, bot_off, ban_user, unban_user, add_channel, remove_channel, edit_balance, broadcast, contact } = require("./methods/conversation");
const { bot_token, owner } = require("../config/config");
const collection = require("../database/database");

const bot = new Bot(bot_token);

bot.catch((error) => {
  console.log(`Error while handling update ${error.ctx.update.update_id}:`);
  if (error.error instanceof GrammyError) {
    console.log("Error in request:", error.error.description);
  } else if (error.error instanceof HttpError) {
    console.log("Could not contact Telegram:", error.error);
  } else {
    console.log("Unknown error:", error.error);
  }
});

bot.use(session({ initial: () => ({}) }));

bot.use(conversations());

bot.use(createConversation(deposit));
bot.use(createConversation(trackPurchase));
bot.use(createConversation(trackDeposit));
bot.use(createConversation(telegramNonDrop));
bot.use(createConversation(buy));
bot.use(createConversation(add_admin));
bot.use(createConversation(remove_admin));
bot.use(createConversation(bot_on));
bot.use(createConversation(bot_off));
bot.use(createConversation(ban_user));
bot.use(createConversation(unban_user));
bot.use(createConversation(add_channel));
bot.use(createConversation(remove_channel));
bot.use(createConversation(edit_balance));
bot.use(createConversation(broadcast));
bot.use(createConversation(contact));

bot.use(async (ctx, next) => {
  if (ctx.chat.type !== "private") return;
  const [admin_panel, user] = await Promise.all([
    collection.child("admin_panel").once("value").then((snapshot) => snapshot.val()),
    collection.child("users").child(`${ctx.chat.id}`).once("value").then((snapshot) => snapshot.val())
  ]);
  const bot_users = admin_panel?.bot_users || [];
  const admins = admin_panel?.admins || [];
  const bot_status = admin_panel?.bot_status || "on";
  const user_status = user?.user_status || "unbanned";
  const chats = admin_panel?.chats || [];
  const member = (await Promise.all(chats.map((username) => ctx.api.getChatMember(username, ctx.chat.id)))).every((user) => user.status === "creator" || user.status === "administrator" || user.status === "member");
  if (!bot_users.includes(`${ctx.chat.id}`)) {
    await ctx.api.sendMessage(owner, `<b>➕ New User: <a href="tg://user?id=${ctx.from.id}">${ctx.from.first_name}</a></b>`, { parse_mode: "HTML" })
    await collection.child("admin_panel").update({ bot_users: [...bot_users, `${ctx.chat.id}`] });
  }
  if (`${ctx.chat.id}` === `${owner}` || admins.includes(`${ctx.chat.id}`)) return await next();
  if (bot_status === "off") {
    if (ctx.has("callback_query:data")) {
      await ctx.answerCallbackQuery({ text: "🛠️ Bot is under Maintenance", show_alert: true });
    } else {
      await ctx.reply("<b><i>🛠️ Bot is under Maintenance</i></b>", { parse_mode: "HTML" });
    }
    return;
  }
  if (user_status === "banned") {
    if (ctx.has("callback_query:data")) {
      await ctx.answerCallbackQuery({ text: "❌ You were Banned", show_alert: true });
    } else {
      await ctx.reply("<b><i>❌ You were Banned</i></b>", { parse_mode: "HTML" });
    }
    return;
  }
  if (!member) {
    if (ctx.has("callback_query:data")) {
      await ctx.answerCallbackQuery({ text: "❌ You didn't join our channels", show_alert: true });
    } else {
      await ctx.reply(`<b>📺 Join the channels below:</b>\n\n<b><i>• ${chats.join('\n• ')}</i></b>\n\n<i>Once you've joined, click on "✅ Joined"</i>`, { parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "✅ Joined", callback_data: "joined" }]] } });
    }
    return;
  }
  await next();
});

module.exports = bot;
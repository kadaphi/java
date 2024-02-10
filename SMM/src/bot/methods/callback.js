const bot = require("../setup");
const collection = require("../../database/database");
const data = require("../../../services.json");
const { owner } = require("../../config/config");

bot.callbackQuery("joined", async (ctx) => {
  await ctx.deleteMessage();
  await ctx.reply("<b>Hello " + ctx.from.first_name + ", Welcome to Social media boost Bot🚀\n\nUsing our automated Bot, professionally increase your telegram group/channel members👥️\nInstagram Services📷\nYouTube Services🎥\nFacebook Services👨‍👩‍👧‍👦\nTwitter Services🐦.....at a very cheap price\n\nInteract with the Bot using the buttons below👇</b>", { parse_mode: "HTML", reply_markup: { keyboard: [[{ text: "📦 Purchase" }, { text: "👤 Account" }], [{ text: "📄 History" }, { text: "☎ Support" }]], resize_keyboard: true, one_time_keyboard: false } });
  await ctx.answerCallbackQuery();
});

bot.callbackQuery("back", async (ctx) => {
  const admin_panel = (await collection.child("admin_panel").once("value")).val();
  const contact = admin_panel?.contact || `https://t.me/${bot.botInfo.username}`;
  await ctx.editMessageText("<b><i>🛍️ Explore and choose a service from the list:</i></b>", {
    parse_mode: "HTML", reply_markup: {
      inline_keyboard: [
        [{ text: "📨 Telegram", callback_data: "telegram" }, { text: "▶️ YouTube", callback_data: "youtube" }, { text: "📘 Facebook", callback_data: "facebook" }],
        [{ text: "🎶 TikTok", callback_data: "tiktok" }, { text: "📸 Instagram", callback_data: "instagram" }, { text: "🐦 Twitter", callback_data: "twitter" }],
        [{ text: "⏩ More", url: `${contact}` }]
      ]
    }
  });
  await ctx.answerCallbackQuery();
});

bot.callbackQuery(/^telegram/, async (ctx) => {
  const params = ctx.callbackQuery.data.split(" ")[1];
  if (params === "targetCountries") {
    await ctx.editMessageText("<b><i>❓ Which country are you interested in targeting for telegram members?</i></b>", {
      parse_mode: "HTML", reply_markup: {
        inline_keyboard: [
          [{ text: "🇺🇸 USA", callback_data: "buy telegram targeted usa" }, { text: "🇷🇺 Russia", callback_data: "buy telegram targeted russia" }, { text: "🇨🇳 China", callback_data: "buy telegram targeted china" }],
          [{ text: "🇦🇪 Arab", callback_data: "buy telegram targeted arab" }, { text: "🇮🇷 Iran", callback_data: "buy telegram targeted iran" }, { text: "🇺🇿 Uzbekistan", callback_data: "unavailable" }],
          [{ text: "🇹🇷 Turkey", callback_data: "unavailable" }, { text: "🇰🇿 Kazakhstan", callback_data: "unavailable" }, { text: "🇮🇳 India", callback_data: "buy telegram targeted india" }],
          [{ text: "🔙 Back", callback_data: "telegram" }]
        ]
      }
    });
  } else if (params === "nonDrop") {
    await ctx.conversation.enter("telegramNonDrop");
  } else {
    await ctx.editMessageText("<b><i>📨 Choose a Telegram service:</i></b>", {
      parse_mode: "HTML", reply_markup: {
        inline_keyboard: [
          [{ text: "🌏 Target Countries", callback_data: "telegram targetCountries" }, { text: "👤 Members (low drop)", callback_data: "buy telegram lowdrop" }],
          [{ text: "👤 Members (non drop)", callback_data: "telegram nonDrop" }, { text: "👁 Post Views", callback_data: "buy telegram views" }],
          [{ text: "🎭 Post Reactions", callback_data: "buy telegram reactions" }, { text: "🤖 Auto Views", callback_data: "buy telegram autoviews" }],
          [{ text: "🔙 Back", callback_data: "back" }]
        ]
      }
    });
  }
  await ctx.answerCallbackQuery();
});

bot.callbackQuery(/^youtube/, async (ctx) => {
  const params = ctx.callbackQuery.data.split(" ")[1];
  if (params === "targetCountries") {
    await ctx.editMessageText("<b><i>❓ Which country are you interested in targeting for youtube subscribers?</i></b>", {
      parse_mode: "HTML", reply_markup: {
        inline_keyboard: [
          [{ text: "🇺🇸 USA", callback_data: "buy youtube targeted usa" }],
          [{ text: "🔙 Back", callback_data: "youtube" }]
        ]
      }
    });
  } else {
    await ctx.editMessageText("<b><i>▶️ Choose a YouTube service:</i></b>", {
      parse_mode: "HTML", reply_markup: {
        inline_keyboard: [
          [{ text: "🌏 Target Countries", callback_data: "youtube targetCountries" }, { text: "👍 Likes", callback_data: "buy youtube likes" }],
          [{ text: "👥 Subscribers", callback_data: "buy youtube subscribers" }, { text: "👁 Views", callback_data: "buy youtube views" }],
          [{ text: "💬 Comments", callback_data: "buy youtube comments" }, { text: "↗ Shares", callback_data: "buy youtube shares" }],
          [{ text: "🔙 Back", callback_data: "back" }]
        ]
      }
    });
  }
  await ctx.answerCallbackQuery();
});

bot.callbackQuery("facebook", async (ctx) => {
  await ctx.editMessageText("<b><i>📘 Choose a Facebook service:</i></b>", {
    parse_mode: "HTML", reply_markup: {
      inline_keyboard: [
        [{ text: "👥 Page Followers", callback_data: "buy facebook pagefollowers" }, { text: "👤 Profile Followers", callback_data: "buy facebook profileFollowers" }],
        [{ text: "👍 Post Likes", callback_data: "buy facebook likes" }, { text: "👥 Group Members", callback_data: "buy facebook members" }],
        [{ text: "👁 Story Views", callback_data: "unavailable" }, { text: "🎥 Video Views", callback_data: "buy facebook views" }],
        [{ text: "🔙 Back", callback_data: "back" }]
      ]
    }
  });
  await ctx.answerCallbackQuery();
});

bot.callbackQuery(/^tiktok/, async (ctx) => {
  const params = ctx.callbackQuery.data.split(" ")[1];
  if (params === "targetCountries") {
    await ctx.editMessageText("<b><i>❓ Which country are you interested in targeting for tiktok followers?</i></b>", {
      parse_mode: "HTML", reply_markup: {
        inline_keyboard: [
          [{ text: "🇧🇷 Brazil", callback_data: "buy tiktok targeted brazil" }, { text: "🇺🇸 USA", callback_data: "buy tiktok targeted usa" }, { text: "🇺🇿 Uzbekistan", callback_data: "unavailable" }],
          [{ text: "🇹🇲 Turkmenistan", callback_data: "unavailable" }, { text: "🇹🇯 Tajikistan", callback_data: "unavailable" }, { text: "🇲🇩 Moldova", callback_data: "unavailable" }],
          [{ text: "🇪🇪 Estonia", callback_data: "unavailable" }, { text: "🇱🇹 Lithuania", callback_data: "unavailable" }, { text: "🇱🇻 Latvia", callback_data: "unavailable" }],
          [{ text: "🇰🇬 Kyrgyzstan", callback_data: "unavailable" }, { text: "🇬🇪 Georgia", callback_data: "unavailable" }, { text: "🇦🇲 Armenia", callback_data: "unavailable" }],
          [{ text: "🇦🇿 Azerbaijan", callback_data: "unavailable" }, { text: "🇰🇿 Kazakhstan", callback_data: "unavailable" }, { text: "🇧🇾 Belarus", callback_data: "unavailable" }],
          [{ text: "🇺🇦 Ukraine", callback_data: "unavailable" }, { text: "🇷🇺 Russia", callback_data: "buy tiktok targeted russia" }],
          [{ text: "🔙 Back", callback_data: "tiktok" }]
        ]
      }
    });
  } else {
    await ctx.editMessageText("<b><i>🎶 Choose a TikTok service:</i></b>", {
      parse_mode: "HTML", reply_markup: {
        inline_keyboard: [
          [{ text: "🌏 Target Countries", callback_data: "tiktok targetCountries" }, { text: "👥 Followers", callback_data: "buy tiktok followers" }],
          [{ text: "👍 Likes", callback_data: "buy tiktok likes" }, { text: "💾 Saves", callback_data: "buy tiktok saves" }],
          [{ text: "🔙 Back", callback_data: "back" }]
        ]
      }
    });
  }
  await ctx.answerCallbackQuery();
});

bot.callbackQuery(/^instagram/, async (ctx) => {
  await ctx.editMessageText("<b><i>📸 Choose a Instagram service:</i></b>", {
    parse_mode: "HTML", reply_markup: {
      inline_keyboard: [
        [{ text: "✔ Verified Services", callback_data: "unavailable" }, { text: "👥 Followers", callback_data: "buy instagram followers" }],
        [{ text: "👍 Likes", callback_data: "buy instagram likes" }, { text: "👁 Views", callback_data: "buy instagram views" }],
        [{ text: "💬 Comments", callback_data: "buy instagram comments" }, { text: "🏷️ Mentions", callback_data: "unavailbale" }],
        [{ text: "🔙 Back", callback_data: "back" }]
      ]
    }
  });
  await ctx.answerCallbackQuery();
});

bot.callbackQuery(/^twitter/, async (ctx) => {
  await ctx.editMessageText("<b><i>🐦 Choose a Twitter service:</i></b>", {
    parse_mode: "HTML", reply_markup: {
      inline_keyboard: [
        [{ text: "👥 Followers", callback_data: "buy twitter followers" }, { text: "👍 Likes", callback_data: "buy twitter likes" }],
        [{ text: "🔄 Retweets", callback_data: "buy twitter retweets" }, { text: "💬 Comments", callback_data: "buy twitter comments" }],
        [{ text: "🗳 Poll Votes", callback_data: "buy twitter pollvotes" }],
        [{ text: "🔙 Back", callback_data: "back" }]
      ]
    }
  });
  await ctx.answerCallbackQuery();
});

bot.callbackQuery("unavailable", async (ctx) => {
  await ctx.answerCallbackQuery({ text: "This service is unavailable", show_alert: true });
});

bot.callbackQuery(/^buy/, async (ctx) => {
  const platform = ctx.callbackQuery.data.split(" ")[1];
  const service = ctx.callbackQuery.data.split(" ")[2];
  const country = ctx.callbackQuery.data.split(' ').length >= 4 ? ctx.callbackQuery.data.split(' ')[3] : undefined;
  ctx.session.format = data[platform].format;
  ctx.session.title = data[platform][service].title;
  ctx.session.key = data[platform][service].key;
  if (country === undefined) {
    ctx.session.id = data[platform][service].id;
    ctx.session.price = data[platform][service].price;
    ctx.session.min = data[platform][service].quantity.min;
    ctx.session.max = data[platform][service].quantity.max;
  } else {
    ctx.session.id = data[platform][service][country].id;
    ctx.session.price = data[platform][service][country].price;
    ctx.session.min = data[platform][service][country].quantity.min;
    ctx.session.max = data[platform][service][country].quantity.max;
  }
  await ctx.conversation.enter("buy");
  await ctx.answerCallbackQuery();
});

bot.callbackQuery(/^panel/, async (ctx) => {
  const admin_panel = (await collection.child("admin_panel").once("value")).val();
  const admins = admin_panel?.admins || [];
  if (`${ctx.chat.id}` === `${owner}` || admins.includes(`${ctx.chat.id}`)) {
    const params = ctx.callbackQuery.data.split(" ")[1];
    if (params === "add_admin") await ctx.conversation.enter("add_admin");
    if (params === "remove_admin") await ctx.conversation.enter("remove_admin");
    if (params === "bot_on") await ctx.conversation.enter("bot_on");
    if (params === "bot_off") await ctx.conversation.enter("bot_off");
    if (params === "ban_user") await ctx.conversation.enter("ban_user");
    if (params === "unban_user") await ctx.conversation.enter("unban_user");
    if (params === "add_channel") await ctx.conversation.enter("add_channel");
    if (params === "remove_channel") await ctx.conversation.enter("remove_channel");
    if (params === "edit_balance") await ctx.conversation.enter("edit_balance");
    if (params === "broadcast") await ctx.conversation.enter("broadcast");
    if (params === "contact") await ctx.conversation.enter("contact");
    if (params === "back") await ctx.editMessageText("<b>⚙ Admin Panel:</b>", {
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
  await ctx.answerCallbackQuery();
});

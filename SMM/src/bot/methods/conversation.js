const { smmstone_key, rapidseen_api } = require("../../config/config");
const { checkDeposit } = require("../functions");
const axios = require("axios");
const collection = require("../../database/database");
const oxapay = require("../../gateway/oxapay");
const bot = require("../setup");


async function deposit(conversation, ctx) {
  try {
    await ctx.reply("<b><i>💸 Enter the deposit amount in USD:</i></b>", { parse_mode: "HTML" });
    ctx = await conversation.wait();
    if (ctx.message?.text) {
      oxapay.createInvoice({ amount: parseFloat(ctx.message.text) })
        .then(async (response) => {
          if (response && response.result === 100 && response.message === "success") {
            await ctx.reply(`<b>${ctx.from.first_name},<i>Your Deposit link of ${ctx.message.text}$ is ready📥 </i>\n\n📌 This process is automatic and your account would be funded immediately after your deposit is received</b>`, { parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "🏦 Deposit", web_app: { url: response.payLink } }]] } });
            await checkDeposit(ctx, response.trackId);
          } else {
            console.log(response);
            await ctx.reply("<b><i>❌ Invalid Input</i></b>", { parse_mode: "HTML" });
          }
        })
        .catch(async (error) => {
          console.log(error);
          await ctx.reply("<b><i>❌ Invalid Input</i></b>", { parse_mode: "HTML" });
        });
    } else {
      await ctx.reply("<b><i>❌ Invalid Input</i></b>", { parse_mode: "HTML" });
    }
  } catch (error) {
    console.log(error);
  }
}

async function trackPurchase(conversation, ctx) {
  await ctx.reply("<b><i>🔍 Enter the order ID for your purchase:</i></b>", { parse_mode: "HTML" });
  ctx = await conversation.wait();
  if (ctx.message?.text) {
    const user = (await collection.child("users").child(`${ctx.chat.id}`).once("value")).val();
    const orders = user?.orders || [];
    if (orders.includes(ctx.message.text)) {
      const provider = ctx.session.track;
      if (provider === "rapidseen") {
        axios.post(`https://rapidseen.net/api/v2?key=${rapidseen_api}&action=status&order=${ctx.message.text}`)
          .then(async (response) => {
            const orderID = response.data.order;
            const link = response.data.link;
            const quantity = response.data.quantity;
            const status = response.data.status;
            await ctx.reply(`<b>📦 <u>Order Details:</u></b>\n\n<b><i>🆔 Order ID: ${orderID}\n🔗 URL: ${link}\n🛒 Quantity: ${quantity}\n📃 Status: ${status}</i></b>`, { parse_mode: "HTML" });
          })
          .catch(async () => {
            await ctx.reply("<b><i>❌ An Error occurred!</i></b>", { parse_mode: "HTML" });
          });
      } else {
        axios.post(`https://smmstone.com/api/v2?key=${smmstone_key}&action=status&order=${ctx.message.text}`)
          .then(async (response) => {
            const orderID = ctx.message.text;
            const start_count = response.data.start_count;
            const status = response.data.status;
            const remains = response.data.remains;
            await ctx.reply(`<b>📦 <u>Order Details:</u></b>\n\n<b><i>🆔 Order ID: ${orderID}\n🔷 Start Count: ${start_count}\n📃 Status: ${status}\n↩ Remaining: ${remains}</i></b>`, { parse_mode: "HTML" });
          })
          .catch(async () => {
            await ctx.reply("<b><i>❌ An Error occurred!</i></b>", { parse_mode: "HTML" });
          });
      }
    } else {
      await ctx.reply("<b><i>❗ The track ID does not belong to you</i></b>", { parse_mode: "HTML" });
    }
  } else {
    await ctx.reply("<b><i>❌ Invalid Input</i></b>", { parse_mode: "HTML" });
  }
}

async function trackDeposit(conversation, ctx) {
  await ctx.reply("<b><i>🔍 Enter the track ID for your deposit:</i></b>", { parse_mode: "HTML" });
  ctx = await conversation.wait();
  if (ctx.message?.text) {
    const user = (await collection.child("users").child(`${ctx.chat.id}`).once("value")).val();
    const deposit_history = user?.deposit_history || [];
    if (deposit_history.some(item => item.id === `${ctx.message.text}`)) {
      oxapay.paymentInfo({ trackId: parseInt(ctx.message.text) })
        .then(async (response) => {
          await ctx.reply(`<b>➕ <u>Deposit Info</u></b>\n\n<b><i>🆔 Track ID:</i></b> <code>${response.trackId}</code>\n<b><i>💳 Address:</i></b> <code>${response.address}</code>\n<b><i>💰 Amount:</i></b> <code>${response.amount} ${response.currency}</code>\n<b><i>💱 Crypto:</i></b> <code>${response.payAmount} ${response.payCurrency}</code>\n<b><i>🌐 Network:</i></b> <code>${response.network}</code>\n<b><i>📈 Status: ${response.status}</i></b>\n<b><i>#️⃣ Transaction ID:</i></b> <code>${response.txID}</code>`, { parse_mode: "HTML" });
        })
        .catch(async () => {
          await ctx.reply("<b><i>❌ Invalid Input</i></b>", { parse_mode: "HTML" });
        });
    } else {
      await ctx.reply("<b><i>❗ The track ID does not belong to you</i></b>", { parse_mode: "HTML" });
    }
  } else {
    await ctx.reply("<b><i>❌ Invalid Input</i></b>", { parse_mode: "HTML" });
  }
}

async function telegramNonDrop(conversation, ctx) {
  try {
    // Destructure properties from ctx.session for better readability
    const [format, title, key, id, price, min, max] = ["https://t.me/", "Send your channel link", "members", 1, 1.2, 500, 100000];

    // Edit the message with formatted information
    await ctx.editMessageText(`<b>🔗 ${title}:</b>\n\n<i>• Price: ${price}$ for 1000 ${key}\n• Minimum is ${min} ${key} & Maximum is ${max} ${key}\n• Orders are processed automatically</i>`, { parse_mode: "HTML" });

    // Wait for the next message from the user
    ctx = await conversation.wait();

    // Check if the message text starts with the specified format and contains "::url"
    if (ctx.message?.text && ctx.has("::url") && ctx.message.text.startsWith(format)) {
      const link = ctx.message.text;

      // Ask the user for the quantity of items they want
      await ctx.reply(`<b>❓ How many ${key} do you want?</b>`, { parse_mode: "HTML" });

      // Wait for the next message from the user
      ctx = await conversation.wait();

      // Check if the message text is a valid number within the specified range
      const quantity = parseInt(ctx.message.text);
      if (!isNaN(quantity) && quantity >= min && quantity <= max) {
        const user = (await collection.child("users").child(`${ctx.chat.id}`).once("value")).val();
        const balance = user?.balance || 0;
        const orders = user?.orders || [];
        const amount = (quantity * parseFloat(price)) / 1000;

        // Check if the user has sufficient balance
        if (balance >= amount) {
          // Make API call to place the order
          const response = await axios.post(`https://rapidseen.net/api/v2?key=${rapidseen_api}&action=add&service=${id}&link=${link}&quantity=${ctx.message.text}`);
          const data = response.data;
          if (data && data.order) {
            // Update user balance and orders
            await collection.child("users").child(`${ctx.chat.id}`).update({ balance: balance - amount, orders: [...orders, `${data.order}`] });

            // Send success message with order ID
            await ctx.api.sendMessage(owner, `<b>➕ <u>New Order</u></b>\n\n<b>👤 User: <a href="tg://user?id=${ctx.from.id}">${ctx.from.first_name}</a></b>\n<b>💰 Amount:</b> <code>${amount} USD</code>\n<b>🆔 Order ID:</b> <code>${data.order}</code>`, { parse_mode: "HTML" })
            await ctx.reply(`<b>✅ Order Placed\n🆔 Order ID: <code>${data.order}</code></b>`, { parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "🔙 Back", callback_data: "back" }]] } });
          } else {
            await ctx.reply("<b><i>❌ An Error occurred!</i></b>", { parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "🔙 Back", callback_data: "back" }]] } });
          }
        } else {
          // Send message for insufficient balance
          await ctx.reply("<b><i>❌ Insufficient Balance!</i></b>", { parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "🔙 Back", callback_data: "back" }]] } });
        }
      } else {
        // Send message for invalid quantity
        await ctx.reply(`<b>❌ Invalid ${key} count!</b>\n\n<i>Minimum is ${min} ${key} & Maximum is ${max} ${key}</i>`, { parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "🔙 Back", callback_data: "back" }]] } });
      }
    } else {
      // Send message for invalid URL format
      await ctx.reply(`<b>❌ Invalid URL</b>\n\n<i>URL must be <code>${format}</code></i>`, { parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "🔙 Back", callback_data: "back" }]] } });
    }
  } catch (error) {
    // Handle any errors that occur during the execution of the function
    console.error("An error occurred:", error);
    await ctx.reply("<b><i>❌ An Error occurred!</i></b>", { parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "🔙 Back", callback_data: "back" }]] } });
  }
}

async function buy(conversation, ctx) {
  try {
    // Destructure properties from ctx.session for better readability
    const { format, title, key, id, price, min, max } = ctx.session;

    // Edit the message with formatted information
    await ctx.editMessageText(`<b>🔗 ${title}:</b>\n\n<i>• Price: ${price}$ for 1000 ${key}\n• Minimum is ${min} ${key} & Maximum is ${max} ${key}\n• Orders are processed automatically</i>`, { parse_mode: "HTML" });

    // Wait for the next message from the user
    ctx = await conversation.wait();

    // Check if the message text starts with the specified format and contains "::url"
    if (ctx.message?.text && ctx.has("::url") && ctx.message.text.startsWith(format)) {
      const link = ctx.message.text;

      // Ask the user for the quantity of items they want
      await ctx.reply(`<b>❓ How many ${key} do you want?</b>`, { parse_mode: "HTML" });

      // Wait for the next message from the user
      ctx = await conversation.wait();

      // Check if the message text is a valid number within the specified range
      const quantity = parseInt(ctx.message.text);
      if (!isNaN(quantity) && quantity >= min && quantity <= max) {
        const user = (await collection.child("users").child(`${ctx.chat.id}`).once("value")).val();
        const balance = user?.balance || 0;
        const orders = user?.orders || [];
        const amount = (quantity * parseFloat(price)) / 1000;

        // Check if the user has sufficient balance
        if (balance >= amount) {
          // Make API call to place the order
          const response = await axios.post(`https://smmstone.com/api/v2?key=${smmstone_key}&action=add&service=${id}&link=${link}&quantity=${quantity}`);
          const data = response.data;
          if (data && data.order) {
            // Update user balance and orders
            await collection.child("users").child(`${ctx.chat.id}`).update({ balance: balance - amount, orders: [...orders, `${data.order}`] });

            // Send success message with order ID
            await ctx.api.sendMessage(owner, `<b>➕ <u>New Order</u></b>\n\n<b>👤 User: <a href="tg://user?id=${ctx.from.id}">${ctx.from.first_name}</a></b>\n<b>💰 Amount:</b> <code>${amount} USD</code>\n<b>🆔 Order ID:</b> <code>${data.order}</code>`, { parse_mode: "HTML" })
            await ctx.reply(`<b>✅ Order Placed\n🆔 Order ID: <code>${data.order}</code></b>`, { parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "🔙 Back", callback_data: "back" }]] } });
          } else {
            await ctx.reply("<b><i>❌ An Error occurred!</i></b>", { parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "🔙 Back", callback_data: "back" }]] } });
          }
        } else {
          // Send message for insufficient balance
          await ctx.reply("<b><i>❌ Insufficient Balance!</i></b>", { parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "🔙 Back", callback_data: "back" }]] } });
        }
      } else {
        // Send message for invalid quantity
        await ctx.reply(`<b>❌ Invalid ${key} count!</b>\n\n<i>Minimum is ${min} ${key} & Maximum is ${max} ${key}</i>`, { parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "🔙 Back", callback_data: "back" }]] } });
      }
    } else {
      // Send message for invalid URL format
      await ctx.reply(`<b>❌ Invalid URL</b>\n\n<i>URL must be <code>${format}</code></i>`, { parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "🔙 Back", callback_data: "back" }]] } });
    }
  } catch (error) {
    // Handle any errors that occur during the execution of the function
    console.error("An error occurred:", error);
    await ctx.reply("<b><i>❌ An Error occurred!</i></b>", { parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "🔙 Back", callback_data: "back" }]] } });
  }
}


// <-------------------->
// ADMIN PANEL
// <-------------------->

async function add_admin(conversation, ctx) {
  await ctx.editMessageText("<b>🆔 Send the telegram ID:</b>", { parse_mode: "HTML" });
  ctx = await conversation.wait();
  if (ctx.message?.text) {
    const admin_panel = (await collection.child("admin_panel").once("value")).val();
    const admins = admin_panel?.admins || [];
    if (!admins.includes(`${ctx.message.text}`)) await collection.child("admin_panel").update({ admins: [...admins, `${ctx.message.text}`] });
    await ctx.reply("<b>✅ Done</b>", { parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "🔙 Back", callback_data: "panel back" }]] } });
  } else {
    await ctx.reply("<b><i>❌ Invalid Input!</i></b>", { parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "🔙 Back", callback_data: "panel back" }]] } });
  }
}

async function remove_admin(conversation, ctx) {
  await ctx.editMessageText("<b>🆔 Send the telegram ID:</b>", { parse_mode: "HTML" });
  ctx = await conversation.wait();
  if (ctx.message?.text) {
    const admin_panel = (await collection.child("admin_panel").once("value")).val();
    const admins = admin_panel?.admins || [];
    const updatedAdmins = admins.filter(admin => admin !== `${ctx.message.text}`);
    if (admins.includes(`${ctx.message.text}`)) await collection.child("admin_panel").update({ admins: updatedAdmins });
    await ctx.reply("<b>✅ Done</b>", { parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "🔙 Back", callback_data: "panel back" }]] } });
  } else {
    await ctx.reply("<b><i>❌ Invalid Input!</i></b>", { parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "🔙 Back", callback_data: "panel back" }]] } });
  }
}

async function bot_on(conversation, ctx) {
  await collection.child("admin_panel").update({ bot_status: "on" });
  await ctx.answerCallbackQuery({ text: "✅ Bot is currently ON", show_alert: true });
  return;
}

async function bot_off(conversation, ctx) {
  await collection.child("admin_panel").update({ bot_status: "off" });
  await ctx.answerCallbackQuery({ text: "🚫 Bot is currently OFF", show_alert: true });
  return;
}

async function ban_user(conversation, ctx) {
  await ctx.editMessageText("<b>🆔 Send the telegram ID:</b>", { parse_mode: "HTML" });
  ctx = await conversation.wait();
  if (ctx.message?.text) {
    await collection.child("users").child(`${ctx.message.text}`).update({ user_status: "banned" });
    await ctx.reply("<b>✅ Done</b>", { parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "🔙 Back", callback_data: "panel back" }]] } });
  } else {
    await ctx.reply("<b><i>❌ Invalid Input!</i></b>", { parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "🔙 Back", callback_data: "panel back" }]] } });
  }
}

async function unban_user(conversation, ctx) {
  await ctx.editMessageText("<b>🆔 Send the telegram ID:</b>", { parse_mode: "HTML" });
  ctx = await conversation.wait();
  if (ctx.message?.text) {
    await collection.child("users").child(`${ctx.message.text}`).update({ user_status: "unbanned" });
    await ctx.reply("<b>✅ Done</b>", { parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "🔙 Back", callback_data: "panel back" }]] } });
  } else {
    await ctx.reply("<b><i>❌ Invalid Input!</i></b>", { parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "🔙 Back", callback_data: "panel back" }]] } });
  }
}

async function add_channel(conversation, ctx) {
  await ctx.editMessageText("<b>🔗 Send the channel username (with @):</b>", { parse_mode: "HTML" });
  ctx = await conversation.wait();
  if (ctx.message?.text) {
    const admin_panel = (await collection.child("admin_panel").once("value")).val();
    const chats = admin_panel?.chats || [];
    if (!chats.includes(`${ctx.message.text}`)) await collection.child("admin_panel").update({ chats: [...chats, `${ctx.message.text}`] });
    await ctx.reply("<b>✅ Done</b>", { parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "🔙 Back", callback_data: "panel back" }]] } });
  } else {
    await ctx.reply("<b><i>❌ Invalid Input!</i></b>", { parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "🔙 Back", callback_data: "panel back" }]] } });
  }
}

async function remove_channel(conversation, ctx) {
  const admin_panel = (await collection.child("admin_panel").once("value")).val();
  const chats = admin_panel?.chats || [];
  await ctx.editMessageText(`<b>🔗 Send the channel username (with @):</b>\n\n• ${chats.join('\n• ')}\n\n<i>ℹ The channel username must maintain its original capitalization or lowercase format</i>`, { parse_mode: "HTML" });
  ctx = await conversation.wait();
  if (ctx.message?.text) {
    const updatedChats = chats.filter(chat => chat !== `${ctx.message.text}`);
    if (chats.includes(`${ctx.message.text}`)) await collection.child("admin_panel").update({ chats: updatedChats });
    await ctx.reply("<b>✅ Done</b>", { parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "🔙 Back", callback_data: "panel back" }]] } });
  } else {
    await ctx.reply("<b><i>❌ Invalid Input!</i></b>", { parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "🔙 Back", callback_data: "panel back" }]] } });
  }
}

async function edit_balance(conversation, ctx) {
  await ctx.editMessageText("<b>🆔 Send the telegram ID of user:</b>", { parse_mode: "HTML" });
  ctx = await conversation.wait();
  if (ctx.message?.text && !isNaN(ctx.message.text) && !ctx.message.text.includes("+") && !ctx.message.text.includes("-")) {
    const id = ctx.message.text;
    await ctx.reply("<b>💸 Send the Amount to edit:</b>\n\n<i>• If you send 0, the balance of user will be set to 0.\n• If you send amount with + sign or without any sign the amount will be added to user balance.\n• If you send amount with - sign the amount will be reduced from user balance</i>", { parse_mode: "HTML" });
    ctx = await conversation.wait();
    if (ctx.message?.text && !isNaN(ctx.message.text)) {
      const user = (await collection.child("users").child(`${id}`).once("value")).val();
      const balance = user?.balance || 0;
      if (`${ctx.message.text}` === "0") {
        await collection.child("users").child(`${id}`).update({ balance: 0 });
      } else if (ctx.message.text.startsWith("+")) {
        await collection.child("users").child(`${id}`).update({ balance: parseFloat(balance) + parseFloat(ctx.message.text) });
      } else if (ctx.message.text.startsWith("-")) {
        await collection.child("users").child(`${id}`).update({ balance: parseFloat(balance) + parseFloat(ctx.message.text) });
      } else {
        await collection.child("users").child(`${id}`).update({ balance: parseFloat(balance) + parseFloat(ctx.message.text) });
      }
      await ctx.reply("<b>✅ Done</b>", { parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "🔙 Back", callback_data: "panel back" }]] } });
    } else {
      await ctx.reply("<b><i>❌ Invalid Input!</i></b>", { parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "🔙 Back", callback_data: "panel back" }]] } });
    }
  } else {
    await ctx.reply("<b><i>❌ Invalid Input!</i></b>", { parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "🔙 Back", callback_data: "panel back" }]] } });
  }
}

async function broadcast(conversation, ctx) {
  try {
    await ctx.editMessageText("<b>💬 Send Message to Broadcast:</b>", { parse_mode: "HTML" });
    ctx = await conversation.wait();
    const panel = (await collection.child("admin_panel").once("value")).val();
    const users = panel?.bot_users || [owner];
    await ctx.reply("<b><i>🔄 Processing...</i></b>", { parse_mode: "HTML" });
    for (const user of users) {
      try {
        await ctx.api.copyMessage(user, ctx.chat.id, ctx.message.message_id);
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) { }
    }
    await ctx.reply("<b>✅ Broadcast Done</b>", { parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "🔙 Back", callback_data: "panel back" }]] } });
  } catch (error) {
    console.log(error);
  }
}

async function contact(conversation, ctx) {
  await ctx.editMessageText("<b>🔗 Send the URL of the contact:</b>\n\n<code>https://t.me/Thacku</code>\n\n<i>👆 Must be in above format</i>", { parse_mode: "HTML" });
  ctx = await conversation.wait();
  if (ctx.message?.text && ctx.message.text.startsWith("https://t.me/")) {
    await collection.child("admin_panel").update({ contact: `${ctx.message.text}` });
    await ctx.reply("<b>✅ Done</b>", { parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "🔙 Back", callback_data: "panel back" }]] } });
  } else {
    await ctx.reply("<b><i>❌ Invalid Input!</i></b>", { parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "🔙 Back", callback_data: "panel back" }]] } });
  }
}

module.exports = {
  deposit,
  trackPurchase,
  trackDeposit,
  telegramNonDrop,
  buy,
  add_admin,
  remove_admin,
  bot_on,
  bot_off,
  ban_user,
  unban_user,
  add_channel,
  remove_channel,
  edit_balance,
  broadcast,
  contact
};

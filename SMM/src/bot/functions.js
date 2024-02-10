const oxapay = require("../gateway/oxapay");
const collection = require("../database/database");
const { owner } = require("../config/config")

async function checkDeposit(ctx, trackid) {
  try {
    const check = setInterval(async () => {
      const response = await oxapay.paymentInfo({ trackId: parseInt(trackid) });
      if (response && response.result === 100 && response.message === "success" && response.status === "Paid" && response.amount) {
        const user = (await collection.child("users").child(`${ctx.chat.id}`).once("value")).val();
        const balance = user?.balance || 0;
        const deposit_history = user?.deposit_history || [];
        await collection.child("users").child(`${ctx.chat.id}`).update({ balance: parseFloat(balance) + parseFloat(response.amount), deposit_history: [...deposit_history, { id: `${response.trackId}`, amount: `${response.amount}` }] });
        await ctx.api.sendMessage(owner, `<b>➕ <u>New Deposit</u></b>\n\n<b>👤 User: <a href="tg://user?id=${ctx.from.id}">${ctx.from.first_name}</a></b>\n<b>💰 Amount:</b> <code>${response.amount} ${response.currency}</code>\n<b>#️⃣ Transaction ID:</b> <code>${response.txID}</code>`, { parse_mode: "HTML" })
        await ctx.reply(`<b>✅ <u>Deposit Successful</u></b>\n\n<b><i>🆔 Track ID:</i></b> <code>${response.trackId}</code>\n<b><i>💳 Address:</i></b> <code>${response.address}</code>\n<b><i>💰 Amount:</i></b> <code>${response.amount} ${response.currency}</code>\n<b><i>💱 Crypto:</i></b> <code>${response.payAmount} ${response.payCurrency}</code>\n<b><i>🌐 Network:</i></b> <code>${response.network}</code>\n<b><i>📈 Status: ${response.status}</i></b>\n<b><i>#️⃣ Transaction ID:</i></b> <code>${response.txID}</code>`, { parse_mode: "HTML" });
        clearInterval(check);
      }
    }, 60000);
    setTimeout(() => {
      clearInterval(check);
    }, 3600000);
  } catch (error) {
    console.log(error);
  }
}

module.exports = { checkDeposit };
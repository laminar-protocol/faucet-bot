!drip 5ES9fyfV56kkEP1qazNzN1S6YwbSTfFWp2Q3i4QG4eyT2Ngconst Discord = require("discord.js");
const axios = require("axios");
require("dotenv").config();

let ax = axios.create({
  baseURL: process.env.BACKEND_URL,
  timeout: 10000,
});

const client = new Discord.Client();

client.on('message', async function (msg) {
    if (msg.content === 'ping') {
        msg.reply('pong')
    }

    let [action, arg0] = msg.content.split(' ');

    const amount = { ACA: 2, aUSD: 2, DOT: 2, XBTC: 0.1 };
    const sender = msg.author.id;
    const senderName = msg.author.username;

    if (action === "!balance") {
      const res = await ax.get("/balance");
      const balance = JSON.stringify(res.data);
      msg.reply(`The faucet has ${balance} remaining.`);
    }

    if (action === "!drip") {
      const res = await ax.post("/bot-endpoint", {
        sender,
        address: arg0,
        amount: JSON.stringify(amount),
      });

      if (res.data === "LIMIT") {
        msg.reply(`${senderName} has reached their daily quota. Only request twice per 24 hours.`);
        return;
      }

      msg.reply(`
        Sent ${senderName} ${JSON.stringify(amount)}.
        Extrinsic hash: ${res.data}.
        View on [SubScan](https://acala-testnet.subscan.io/extrinsic/${res.data})
      `);
    }

    if (action === "!faucet") {
      msg.reply(`
        Usage:
            !balance - Get the faucet's balance.
            !drip <Address> - Send Test Tokens to <Address>.
            !faucet - Prints usage information.`
      );
    }
});

client.on('ready', function () {
    console.log('ready');
});

client.login(process.env.TOKEN);

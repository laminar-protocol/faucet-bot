const Discord = require("discord.js");
const axios = require("axios");
require("dotenv").config();

let ax = axios.create({
  baseURL: `http://localhost:${process.env.PORT || 5555}/faucet`,
  timeout: 10000,
});

const client = new Discord.Client();

client.on('message', async function (msg) {
    if (msg.channel.name !== 'laminar-testnet-faucet') {
        return;
    }
    if (msg.content === 'ping') {
        msg.reply('pong')
    }

    let [action, arg0] = msg.content.split(' ');

    const sender = msg.author.id;
    const senderName = msg.author.username;

    if (action === "!balance") {
      const res = await ax.get("/balance");
      const balance = JSON.stringify(res.data);
      msg.reply(`The faucet has ${balance} remaining.`);
    }

    if (action === "!drip") {
      try {
        const res = await ax.post("/bot-endpoint", {
          sender,
          address: arg0,
        });
  
        if (res.data === "LIMIT") {
          msg.reply(`${senderName} has reached their daily quota. Only request twice per 24 hours.`);
          return;
        }
  
        msg.reply(`
          Sent ${senderName} ${JSON.stringify(res.data.amount)}.
          Extrinsic hash: ${res.data.hash}.
        `);
      } catch (err) {
        console.warn('drip error', err, sender, msg.content);

        msg.reply(`
          Something went wrong. Please try again later or inform Laminar team about this issue.
        `);
      }
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

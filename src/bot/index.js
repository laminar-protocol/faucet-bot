const mSDK = require("matrix-js-sdk");
const axios = require("axios");
const pdKeyring = require("@polkadot/keyring");
require("dotenv").config();

let ax = axios.create({
  baseURL: process.env.BACKEND_URL,
  timeout: 10000,
});

const bot = mSDK.createClient({
  baseUrl: "https://matrix.org",
  accessToken: process.env.MATRIX_ACCESS_TOKEN,
  userId: process.env.MATRIX_USER_ID,
  localTimeoutMs: 10000,
});

const sendMessage = (roomId, msg) => {
  bot.sendEvent(
    roomId,
    "m.room.message",
    { body: msg, msgtype: "m.text" },
    "",
    console.error
  );
};

bot.on("RoomMember.membership", (_, member) => {
  if (
    member.membership === "invite" &&
    member.userId === "@multichain:matrix.org"
  ) {
    bot.joinRoom(member.roomId).done(() => {
      console.log(`Auto-joined ${member.roomId}.`);
    });
  }
});

bot.on("Room.timeline", async (event) => {
  if (event.getType() !== "m.room.message") {
    return; // Only act on messages (for now).
  }

  const {
    content: { body },
    event_id: eventId,
    room_id: roomId,
    sender,
  } = event.event;
  const amount = { ACA: 2, aUSD: 2, DOT: 2, XBTC: 0.1 };

  let [action, arg0, arg1] = body.split(" ");

  if (action === "!balance") {
    const res = await ax.get("/balance");
    const balance = JSON.stringify(res.data);
    bot.sendHtmlMessage(
      roomId,
      `The faucet has ${balance} remaining.`,
      `The faucet has ${balance} remaining.`
    );
  }

  if (action === "!drip") {
    const res = await ax.post("/bot-endpoint", {
      sender,
      address: arg0,
      amount: JSON.stringify(amount),
    });

    if (res.data === "LIMIT") {
      sendMessage(
        roomId,
        `${sender} has reached their daily quota. Only request twice per 24 hours.`
      );
      return;
    }
    bot.sendHtmlMessage(
      roomId,
      `Sent ${sender} ${JSON.stringify(amount)}. Extrinsic hash: ${res.data}.`,
      `Sent ${sender} ${JSON.stringify(
        amount
      )}. <a href="https://polkascan.io/pre/acala-mandala/extrinsic/${
        res.data
      }">View on Polkascan.</a>`
    );
  }

  if (action === "!faucet") {
    sendMessage(
      roomId,
      `
Usage:
  !balance - Get the faucet's balance.
  !drip <Address> - Send Test Tokens to <Address>.
  !faucet - Prints usage information.`
    );
  }
});

bot.startClient(0);

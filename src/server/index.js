const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();

const Actions = require("./actions.js");

const Storage = require("./storage.js");
const storage = new Storage();

const app = express();
app.use(bodyParser.json());
const port = 5555;

const mnemonic = process.env.MNEMONIC;
const wssUrl = process.env.WSS_URL;

const amountDefault = JSON.stringify({
  ACA: 2,
  aUSD: 2,
  DOT: 2,
  XBTC: 0.1,
});

app.get("/health", (_, res) => {
  res.send("Faucet backend is healthy.");
});

const createAndApplyActions = async () => {
  const actions = new Actions();
  await actions.create(mnemonic, wssUrl);

  app.get("/balance", async (_, res) => {
    const balance = await actions.checkBalance();
    res.send(JSON.stringify(balance));
  });

  app.post("/bot-endpoint", async (req, res) => {
    const { address, amount, sender } = req.body;

    if (!(await storage.isValid(sender, address))) {
      res.send("LIMIT");
      return;
    }

    await storage.saveData(sender, address);

    const hash = await actions.sendToken(address, amount || amountDefault);
    res.send(hash);
  });

  app.post("/web-endpoint", (req, res) => {});
};

const main = async () => {
  await createAndApplyActions();

  app.listen(port, () =>
    console.log(`Faucet backend listening on port ${port}.`)
  );
};

try {
  main();
} catch (e) {
  console.error(e);
}

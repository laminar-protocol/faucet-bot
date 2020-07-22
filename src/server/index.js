const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();

const Actions = require("./actions.js");

const Storage = require("./storage.js");
const storage = new Storage();

const app = express();
app.set('trust proxy', true);
app.use(bodyParser.json());
const port = process.env.PORT || 5555;

const mnemonic = process.env.MNEMONIC;
const wssUrl = process.env.WSS_URL;

const createAndApplyActions = async (router) => {
  const actions = new Actions();
  await actions.create(mnemonic, wssUrl);

  router.get("/health", (_, res) => {
    res.send("Faucet backend is healthy.");
  });

  router.get("/balance", async (_, res) => {
    const balance = await actions.checkBalance();
    res.send(JSON.stringify(balance));
  });

  router.post("/bot-endpoint", async (req, res) => {
    const { address, sender } = req.body;

    if (!(await storage.isValid(sender, address))) {
      res.send("LIMIT");
      return;
    }

    await storage.saveData(sender, address);

    const data = await actions.sendToken(address);
    res.send(data);
  });

  router.post("/web-endpoint", (req, res) => {
    const { address } = req.body;
    const sender = req.ip;

    if (!(await storage.isValid(sender, address))) {
      res.send("LIMIT");
      return;
    }

    await storage.saveData(sender, address);

    const data = await actions.sendToken(address);
    res.send(data);
  });
};

const main = async () => {
  const router = express.Router();

  await createAndApplyActions(router);

  app.use("/faucet", router);

  app.listen(port, () =>
    console.log(`Faucet backend listening on port ${port}.`)
  );
};

try {
  main();
} catch (e) {
  console.error(e);
}

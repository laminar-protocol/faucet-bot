const { WsProvider, ApiPromise } = require("@polkadot/api");
const pdKeyring = require("@polkadot/keyring");
const { types } = require("@laminar/types");

class Actions {
  async create(mnemonic, url = "wss://westend-rpc.polkadot.io/") {
    const provider = new WsProvider(url);
    this.api = await ApiPromise.create({ provider, types });
    const keyring = new pdKeyring.Keyring({ type: "sr25519" });
    this.account = keyring.addFromMnemonic(mnemonic);
  }

  async sendToken(address) {
    const amount = {
      LAMI: '2000000000000000000',
      aUSD: '1000000000000000000000',
    };
    const batchTransfer = this.api.tx.utility.batch([
      this.api.tx.currencies.transfer(address, "LAMI", amount.LAMI),
      this.api.tx.currencies.transfer(address, "AUSD", amount.aUSD),
    ]);
    const hash = await batchTransfer.signAndSend(this.account);

    return {
      hash: hash.toHex(),
      amount: {
        LAMI: 2, aUSD: 1000
      }
    };
  }

  async checkBalance() {
    let result = await this.api.queryMulti([
      [this.api.query.system.account, this.account.address],
      [this.api.query.tokens.accounts, [this.account.address, "AUSD"]],
    ]);
    result = result.map((item, index) => {
      if (index === 0) {
        return Number(item.data.free.toString()) / 10 ** 18;
      }
      return Number(item.free.toString()) / 10 ** 18;
    });

    return { lami: result[0], ausd: result[1] };
  }
}

module.exports = Actions;

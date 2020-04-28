const { WsProvider, ApiPromise } = require("@polkadot/api");
const pdKeyring = require("@polkadot/keyring");
const { types } = require("@acala-network/types");

const formatNum = (num) => {
  const result = num * 10 ** 18;
  return result.toString();
};

class Actions {
  async create(mnemonic, url = "wss://westend-rpc.polkadot.io/") {
    const provider = new WsProvider(url);
    this.api = await ApiPromise.create({ provider, types });
    const keyring = new pdKeyring.Keyring({ type: "sr25519" });
    this.account = keyring.addFromMnemonic(mnemonic);
  }

  async sendToken(address, amount) {
    amount = JSON.parse(amount);
    const batchTransfer = this.api.tx.utility.batch([
      this.api.tx.currencies.transfer(address, "ACA", formatNum(amount.ACA)), // aca 2
      this.api.tx.currencies.transfer(address, "AUSD", formatNum(amount.aUSD)), // ausd 2
      this.api.tx.currencies.transfer(address, "DOT", formatNum(amount.DOT)), // dot 2
      this.api.tx.currencies.transfer(address, "XBTC", formatNum(amount.XBTC)), // xbtc 0.1
    ]);
    const hash = await batchTransfer.signAndSend(this.account);

    return hash.toHex();
  }

  async checkBalance() {
    let result = await this.api.queryMulti([
      [this.api.query.system.account, this.account.address],
      [this.api.query.tokens.accounts, ["AUSD", this.account.address]],
      [this.api.query.tokens.accounts, ["DOT", this.account.address]],
      [this.api.query.tokens.accounts, ["XBTC", this.account.address]],
    ]);
    result = result.map((item, index) => {
      if (index === 0) {
        return Number(item.data.free.toString()) / 10 ** 18;
      }
      return Number(item.free.toString()) / 10 ** 18;
    });

    return { aca: result[0], ausd: result[1], dot: result[2], xbtc: result[3] };
  }
}

module.exports = Actions;

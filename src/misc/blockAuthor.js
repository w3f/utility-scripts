/**
 * Records a `StupidStorage` (JS Object of block author => numbers of blocks authored) by
 * following the new heads of the chain.
 */

const { ApiPromise, WsProvider } = require('@polkadot/api');

const StupidStorage = {};

const main = async () => {
  const provider = new WsProvider('wss://serinus-4.kusama.network');
  const api = await ApiPromise.create({ provider });

  api.rpc.chain.subscribeNewHeads(async (result) => {
    const blockHash = await api.rpc.chain.getBlockHash(result.number);
    const extendedHeader = await api.derive.chain.getHeader(blockHash);
    const author = extendedHeader.author.toString();
    StupidStorage[author] = StupidStorage[author] ? StupidStorage[author]+1 : 1; 
    console.log(StupidStorage);
  });
}

try {
  main();
} catch (err) {
  console.error(err);
}

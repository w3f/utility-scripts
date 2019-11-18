const { ApiPromise, WsProvider } = require('@polkadot/api');
const fs = require('fs');

const LogFile = 'scrapedEvents_4.csv';

class Backend {
  constructor(type) {
    if (type !== 'textfiles') {
      throw new Error('Only textfiles backend is supported while this app is under development.');
    }
    this.backend = type;
  }

  write(key, value) {
    if (this.backend == 'textfiles') {
      fs.appendFileSync(key, value);
    }
  }

  read(key) {
    if (this.backedn == 'textfiles') {
      return fs.readFileSync(key, { encoding: 'utf-8' });
    }
  }
}

const write = (what) => {
  fs.appendFileSync(LogFile, what);
}

const logEvents = (blockNum, events) => {
  events.forEach((record) => {
    const { event } = record;
    if (event.section !== 'staking') return;
    write(`${blockNum},${event.section},${event.method},${event.data}\n`);
  });
}

const main = async () => {
  const provider = new WsProvider('ws://176.58.102.23:9944');
  const api = await ApiPromise.create({ provider });

  // const lastHash = await api.rpc.chain.getBlockHash(521291);
  const lastHash = await api.rpc.chain.getBlockHash();
  let lastHdr = await api.rpc.chain.getHeader(lastHash);

  while (Number(lastHdr.number) !== 0) {
    // try {
      const events = await api.query.system.events.at(lastHdr.hash)
      console.log('⛏️ werk werk ⛏️', Number(lastHdr.number));
      logEvents(Number(lastHdr.number), events);
      lastHdr = await api.derive.chain.getHeader(lastHdr.parentHash);
    // } catch (e) {
      // console.log(`GOT ERROR: ${e}\n\n${lastHdr.hash}`);

    //   if (e.toString().indexOf("U8a: failed on 'Type'")) {
    //     console.log('SKIPPING ERROR');
    //     const hash = await api.rpc.chain.getBlockHash(Number(lastHdr.number)-2);
    //     lastHdr = await api.derive.chain.getHeader(hash);
      // }
    // }
  }
}

try {
  main();
} catch (err) {
  console.error(err);
}

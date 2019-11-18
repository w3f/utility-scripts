const { ApiPromise, WsProvider } = require('@polkadot/api');
const pdUtil = require('@polkadot/util');
const fs = require('fs');
const BN = require('bn.js');
// const srArith = require('../sr-arithmetic/pkg/sr_arithmetic');

// pdUtil.bnToBn

const File = 'scrapedEventsFull.csv';

const Decimals = new BN(10**12);

const main = async () => {
  const provider = new WsProvider('ws://176.58.102.23:9944');
  const api = await ApiPromise.create({ provider });

  const rawFile = fs.readFileSync(File, { encoding: 'utf-8' });
  const results = rawFile.split('\n').map((line) => {
    return line.split(',')
  }).filter((lineArray) => {
    let [a,b,method] = lineArray;
    return method === 'Slash';
  });

  let reparation = [];

  results.forEach(async (result) => {
    let [blockNum,a,b,validator,amount] = result;
    validator = validator.slice(2,-1);
    amount = new BN(amount.slice(0,-1));
    blockNum = Number(blockNum);

    const hashBefore = await api.rpc.chain.getBlockHash(blockNum-1);
    const hashAt = await api.rpc.chain.getBlockHash(blockNum);
    const hashAfter = await api.rpc.chain.getBlockHash(blockNum+1);

    const balBefore = await api.query.balances.freeBalance.at(hashBefore, validator);
    const balAfter = await api.query.balances.freeBalance.at(hashAfter, validator);

    const diff = pdUtil.bnToBn(balBefore).sub(pdUtil.bnToBn(balAfter));
    fs.appendFileSync('slashlog/validatorNotFullySlashedDiff.csv', `${validator},${diff.toString()}\n`);
    if (diff.toString() === amount.toString()) {
      // Hooray - the validator was completely slashed for their own fault and we don't have to mess around
      //  w/ the nominators.
      fs.appendFileSync('slashlog/validatorFullySlashedOnly.csv', `${validator},${diff}\n`);
      // console.log('FULL', validator, balBefore.toString(), balAfter.toString(), diff.toString(), amount.toString());

      // console.log(`${validator}   |   ${diff}`);
      reparation.push([validator, amount]);
    } else {
      // The validator was not completely slashed - so we gotta pull the nominators outta the chain.
      const exposure = await api.query.staking.stakers.at(hashBefore, validator);
      const own = pdUtil.bnToBn(exposure.own);
      const restSlash = amount.sub(own);
      // console.log('PARTIAL', validator, balBefore.toString(), balAfter.toString(), diff.toString(), amount.toString(), restSlash);
      const nominators = exposure.others.map((entry) => {
        let [who,value] = entry;
        return [who[1].toString(), value[1].toString()];
      });
      //
      fs.appendFileSync('slashlog/validatorNotFullySlashed.csv', `${validator},${own.toString()}\n`);
      reparation.push([validator, own]);
      //
      const exposureTotal = pdUtil.bnToBn(exposure.total)
      const leftover = exposureTotal.sub(own);
      nominators.forEach(async (nominator) => {
        const [who,value] = nominator;
        // const slashPercA = srArith.fromRationalApproximation(value, leftover);
        const slashPerc = new BN(value).mul(Decimals).div(leftover);
        const slashCalc = restSlash.mul(slashPerc).div(Decimals);
        const nomBalBefore = await api.query.balances.freeBalance.at(hashBefore, who);
        const nomBalAfter = await api.query.balances.freeBalance.at(hashAfter, who);
        const nomDiff = pdUtil.bnToBn(nomBalBefore).sub(pdUtil.bnToBn(nomBalAfter));
        fs.appendFileSync('slashlog/nominatorOnly.csv', `${validator},${who},${nomDiff.toString()},${slashCalc.toString()},${amount.toString()}\n`);
        reparation.push([who,slashCalc]);
      });
    }
  });

  console.log('waiting...')
  await new Promise(resolve => {
    setTimeout(() => resolve(), 8000);
  });
  console.log('done');

  // reparation.sort();
  reparation.forEach((entry) => {
    const [who, slashed] = entry;
    fs.appendFileSync('slashlog/reparation.csv', `${who},${slashed.toString()}\n`);
  });
  // const slashRefunds = new Map();
  // reparation.forEach((entry) => {
  //   const [who, slashed] = entry;
  //   console.log(slashed);
  //   if (slashRefunds.has(who)) {
  //     const oldVal = slashRefunds.get(who);
  //     const newVal = oldVal.add(slashed);
  //     slashRefunds.set(who, newVal); 
  //   } else {
  //     slashRefunds.set(who, slashed);
  //   }
  // });
  // slashRefunds.forEach((val, key) => fs.appendFileSync('slashlog/reparation.csv', `${key},${val.toString()}\n`));
  process.exit(0);
}

try { main(); } catch (error) { console.error(error); }

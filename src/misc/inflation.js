const { ApiPromise, WsProvider } = require('@polkadot/api');
const util = require('@polkadot/util');

/// 0.025
const InflationZero = util.bnToBn(25);
/// 0.2
const RewardsIdeal = util.bnToBn(200);
/// 0.5
const RateIdeal = util.bnToBn(500);
/// 1
const One = util.bnToBn(1000);

const inflationLeft = (inflationZero, rate, rewardsIdeal, rateIdeal) => {
  const stepOne = inflationZero / rateIdeal;
  // console.log('Step one:', stepOne.toString());
  const stepTwo = rewardsIdeal / One - stepOne;
  // console.log('Step two:', stepTwo.toString());
  const stepThree = rate / One * stepTwo;
  // console.log('Step three:', stepThree.toString());
  const result = inflationZero / One + stepThree;
  // console.log('Result:', result.toString());

  return result;
} 

const main = async () => {
  const provider = new WsProvider('wss://serinus-4.kusama.network');
  const api = await ApiPromise.create({ provider });

  const totalIssuance = await api.query.balances.totalIssuance();
  console.log(totalIssuance.toString());

  const slotStake = await api.query.staking.slotStake();
  const validatorCount = await api.query.staking.validatorCount();
  const rate = slotStake.mul(validatorCount).mul(util.bnToBn(1000)).div(totalIssuance);

  const inflation = inflationLeft(InflationZero, rate, RewardsIdeal, RateIdeal);
  console.log(' Current inflation: ', Number(inflation * 100).toFixed(2), '%');
}

try {
  main();
} catch (err) {
  console.error(err);
}

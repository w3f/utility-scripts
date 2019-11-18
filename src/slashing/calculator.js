const BN = require('bn.js');
const fs = require('fs');

const file = fs.readFileSync('./slashlog/reparation.csv', { encoding: 'utf-8' });

let accumulator = new BN(0);

const lines = file.split('\n');
lines.forEach((line) => {
  const [addr, amt] = line.split(',');
  accumulator = accumulator.add(new BN(amt));
  console.log(accumulator.toString());
});

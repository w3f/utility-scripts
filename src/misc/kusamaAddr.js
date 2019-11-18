const { encodeAddress } = require('@polkadot/keyring');

// const input = '0x4ecb034c4b4ea5a667000cbfe489ea0f7aa20cc5deb46f9819bb64119dfc5327';
const trez = '0x226d6f646c70792f747273727922000000000000000000000000000000000000';

const output = encodeAddress(trez, 2);

console.log(output.toString());

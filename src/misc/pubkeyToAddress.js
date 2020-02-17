// Given a public key (pubkey), this script will display the Substrate, Kusama,
// and Polkadot addresses associated with that public key.

// Note that this script will only accept a single public key.

// Example usage:
// (729) ~/web3/utility-scripts/src/misc $ node pubkeyToAddress.js
//       0x022aeac10dd63c9e1eaa7b4e4e6bee9495e38bd99ca03c3f543e3b305b557934
// Substrate Address:
// 5C7YhfbQCgsFfch47eKPMnhicsL6heKhwCnKTTQzRoDkRMWy
// Kusama Address:
// CdAMywGq3tBRGWVtM8SFk4imTcLWK8tPad4r7gwubSFAQ6X
// Polkadot Address:
// 13qqzrU4U8j79ha5HNPVwXsUVKkPwsr1hWockQLytFGbqPX

const { encodeAddress } = require('@polkadot/util-crypto');

if (process.argv.length < 3) {
    console.log("Enter a public key to convert");
    process.exit();
}
var pubkey = process.argv[2];

console.log("Substrate Address:");
console.log(encodeAddress(pubkey));
console.log("Kusama Address:");
console.log(encodeAddress(pubkey, 2));
console.log("Polkadot Address:");
console.log(encodeAddress(pubkey, 0));

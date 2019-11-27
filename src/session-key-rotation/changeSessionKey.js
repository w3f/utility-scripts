// This script is for someone who wants to keep changing his 
// session keys for the next epoch to increase the security 
// of the validator. You should have another computer that is 
// inside a VPN so that you can still communicate with the validator via RPC.
// **USE AT YOUR OWN RISK**

const { ApiPromise, WsProvider } = require('@polkadot/api');
const { Keyring } = require('@polkadot/keyring');

let api = null;

(async () => {
    // Initialise the provider to connect to the local node
    const provider = new WsProvider('ws://10.0.0.1:9944/');
    // Create the API and wait until ready
    api = await ApiPromise.create({ provider })
    // TODO Change session key before the epoch(e.g. 10 blocks before)
    updateKey()
})()

const updateKey = async () => {
    const keyring = new Keyring({ type: 'sr25519' })
    acc = keyring.addFromMnemonic(process.env.MNEMONIC)
    // generate new session keys
    const newSessionKey = await api._rpc.author.rotateKeys()
    // using your controller account to update the session key 
    const updateSessionKey = api.tx.session.setKeys(newSessionKey,[])
    const hash = await updateSessionKey.signAndSend(acc)
    console.log(hash.toHex())
}

const fetch = require('cross-fetch')

const testWallet = 'alephium-web3-test-only-wallet'
const password = 'alph'
const mnemonic =
  'vault alarm sad mass witness property virus style good flower rice alpha viable evidence run glare pretty scout evil judge enroll refuse another lava'

async function createWallet() {
  console.log('Create the test wallet')
  await fetch('http://127.0.0.1:22973/wallets', {
    method: 'Put',
    body: `{"password":"${password}","mnemonic":"${mnemonic}","walletName":"${testWallet}"}`
  })
}

async function unlockWallet() {
  console.log('Unlock the test wallet')
  await fetch('http://127.0.0.1:22973/wallets/alephium-web3-test-only-wallet/unlock', {
    method: 'POST',
    body: '{ "password": "alph" }'
  })
}

async function prepareWallet() {
  const wallets = await fetch('http://127.0.0.1:22973/wallets', { method: 'Get' }).then((res) => res.json())
  if (wallets.find((wallet) => wallet.walletName === testWallet)) {
    unlockWallet()
  } else {
    createWallet()
  }
}

async function main() {
  await prepareWallet()
}

main()

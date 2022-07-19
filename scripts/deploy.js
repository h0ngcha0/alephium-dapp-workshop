const fs = require('fs')
const web3 = require('@alephium/web3')

async function main() {
  const provider = new web3.NodeProvider('http://127.0.0.1:22973')
  const signer = await testWallet1(provider)
  const greeterContract = await web3.Contract.fromSource(provider, 'greeter/greeter.ral')
  const createGreeterTx = await greeterContract.transactionForDeployment(signer, {
    initialFields: {
      btcPrice: 1000
    }
  })
  await signer.submitTransaction(
    createGreeterTx.unsignedTx,
    createGreeterTx.txId
  )

  const config = JSON.stringify(
    {
      greeterContractAddress: createGreeterTx.contractAddress
    }
  )

  console.log('writing config', config)
  fs.writeFileSync('configs/addresses.json', config)
}

async function testWallet1(provider) {
  const wallet = new web3.NodeWallet(provider, 'alephium-web3-test-only-wallet')
  await wallet.unlock('alph')
  return wallet
}

(async () => {
  await main()
})().catch(e => {
  console.log(e)
});
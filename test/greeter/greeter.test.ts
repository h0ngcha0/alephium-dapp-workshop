import { testAddress1, testWallet1 } from '../signers'

import { NodeProvider, Contract, Script, TestContractParams } from '@alephium/web3'

describe('greeter contract', function() {
  it('should verify greeter contract', async () => {
    const provider = new NodeProvider('http://127.0.0.1:22973')
    const greeter = await Contract.fromSource(provider, 'greeter/greeter.ral')

    const oldPrice = 1000
    const testParams: TestContractParams = {
      initialFields: { btcPrice: oldPrice }
    }
    const testResult = await greeter.testPublicMethod(provider, 'greet', testParams)
    expect(testResult.returns).toEqual([oldPrice])
    expect(testResult.contracts[0].codeHash).toEqual(greeter.codeHash)
    expect(testResult.contracts[0].fields.btcPrice).toEqual(oldPrice)

    const signer = await testWallet1(provider)

    const deployTx = await greeter.transactionForDeployment(signer, {
      initialFields: { btcPrice: oldPrice },
      initialTokenAmounts: []
    })
    expect(deployTx.fromGroup).toEqual(0)
    expect(deployTx.toGroup).toEqual(0)
    const submitResult = await signer.submitTransaction(deployTx.unsignedTx, deployTx.txId)
    expect(submitResult.fromGroup).toEqual(0)
    expect(submitResult.toGroup).toEqual(0)
    expect(submitResult.txId).toEqual(deployTx.txId)

    const oldState = await greeter.fetchState(provider, deployTx.contractAddress, 0)
    expect(oldState.fields.btcPrice).toEqual(oldPrice)

    const greeterContractId = deployTx.contractId
    const main = await Script.fromSource(provider, 'greeter/greeter_main.ral')

    const mainScriptTx = await main.transactionForDeployment(signer, {
      initialFields: { greeterContractId: greeterContractId }
    })
    expect(mainScriptTx.fromGroup).toEqual(0)
    expect(mainScriptTx.toGroup).toEqual(0)
    const mainSubmitResult = await signer.submitTransaction(mainScriptTx.unsignedTx, mainScriptTx.txId)
    expect(mainSubmitResult.fromGroup).toEqual(0)
    expect(mainSubmitResult.toGroup).toEqual(0)

    // Update BTC price
    const newPrice = 30000
    const updateBtcPriceScript = await Script.fromSource(provider, 'greeter/update_btc_price.ral')
    const deployParams = await updateBtcPriceScript.paramsForDeployment({
      signerAddress: testAddress1,
      initialFields: {
        newPrice: newPrice,
        greeterContractId: greeterContractId
      }
    })
    await signer.signExecuteScriptTx(deployParams)

    const newState = await greeter.fetchState(provider, deployTx.contractAddress, 0)
    expect(newState.fields.btcPrice).toEqual(newPrice)
  })
})

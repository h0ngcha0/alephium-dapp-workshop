import type { NextPage } from 'next'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import GreeterJson from '../artifacts/greeter/greeter.ral.json'
import UpdateBtcPriceJson from '../artifacts/greeter/update_btc_price.ral.json'
import addresses from '../configs/addresses.json'
import { binToHex, Contract, contractIdFromAddress, NodeProvider, Script } from '@alephium/web3'
import { useEffect, useState } from 'react'
import { testAddress1, testWallet1 } from '../test/signers'

const Home: NextPage = () => {
  const nodeProvider = new NodeProvider('http://127.0.0.1:22973')
  const [btcPrice, setBtcPrice] = useState<number | undefined>(undefined)
  const [formBtcPrice, updateFormBtcPrice] = useState<number | undefined>(undefined)
  const GreeterContract = Contract.fromJson(GreeterJson)
  const UpdateBtcPriceScript = Script.fromJson(UpdateBtcPriceJson)

  useEffect(() => {
    (async () => {
      const greeterState = await GreeterContract.fetchState(nodeProvider, addresses.greeterContractAddress, 0)
      setBtcPrice(greeterState.fields.btcPrice)
    })().catch(e => {
      console.debug(`error fetching state for greeter`, e)
    })
  })

  async function updateBtcPrice() {
    if (formBtcPrice) {
      console.log('newPrice', formBtcPrice)
      const signer = await testWallet1(nodeProvider)
      const deployParams = await UpdateBtcPriceScript.paramsForDeployment({
        signerAddress: testAddress1,
        initialFields: {
          newPrice: +formBtcPrice,
          greeterContractId: binToHex(contractIdFromAddress(addresses.greeterContractAddress))
        }
      })

      await signer.signExecuteScriptTx(deployParams)
    } else {
      console.log('no new price')
    }
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Greeter</title>
        <meta name="description" content="Greeting from Alephium" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h2 className={styles.title}>
          Greetings!
        </h2>

        <p className={styles.description}>
          {
            btcPrice ? <span>BTC Price: {btcPrice}</span> : <span>BTC Price Unknown</span>
          }
        </p>

        <div>
          <input
            type="number"
            min="0"
            placeholder="New BTC Price"
            className="mt-8 border rounded p-4"
            onChange={e => updateFormBtcPrice(e.target.value)}
          />
          <button onClick={updateBtcPrice} className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg">
            Update BTC Price
          </button>
        </div>
      </main>
    </div>
  )
}

export default Home

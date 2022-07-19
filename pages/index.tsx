import type { NextPage } from 'next'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import GreeterJson from '../artifacts/greeter/greeter.ral.json'
import addresses from '../configs/addresses.json'
import { Contract, NodeProvider } from '@alephium/web3'
import { useEffect, useState } from 'react'

const Home: NextPage = () => {
  const nodeProvider = new NodeProvider('http://127.0.0.1:22973')
  const [btcPrice, setBtcPrice] = useState<number | undefined>(undefined)
  const GreeterContract = Contract.fromJson(GreeterJson)

  useEffect(() => {
    (async () => {
      const greeterState = await GreeterContract.fetchState(nodeProvider, addresses.greeterContractAddress, 0)
      setBtcPrice(greeterState.fields.btcPrice)
    })().catch(e => {
      console.debug(`error fetching state for greeter`, e)
    })
  })

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
      </main>
    </div>
  )
}

export default Home

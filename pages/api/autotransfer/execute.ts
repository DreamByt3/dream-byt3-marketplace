import {createPublicClient, createWalletClient, http, Hex, parseEther, formatEther} from "viem";
import {mainnet} from "viem/chains";
import {privateKeyToAccount} from "viem/accounts";
import {NextApiRequest, NextApiResponse} from "next";
import { Redis } from '@upstash/redis'
import db from 'lib/db'

const redis = Redis.fromEnv()
const transferHistory = db.collection('transfer_history')
const account = privateKeyToAccount(`0x${process.env.DEPLOYER_PK as string}` as Hex)

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http()
})

const walletClient = createWalletClient({
  chain: mainnet,
  transport: http(),
  account
})

const balanceThreshold = '0.5' // 0.5 ETH Balance to left intact
const tranchesValue = '3' // 3 ETH max accumulated transfer value

const autoTransferHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const balance = await publicClient.getBalance({
    address: account.address,
  }).catch(() => BigInt(0))

  const totalAccumulated: string = await redis.get(`autotransfer-total`).catch(() => '0') as string

  if (+totalAccumulated < +tranchesValue && balance > parseEther(balanceThreshold)) {
    try {
      const balanceMinusGas = balance - parseEther(balanceThreshold)
      redis.set(`autotransfer`, JSON.stringify({
        lastExecuted: (new Date()).getTime(),
        lastTransfer: balanceMinusGas
      }))
      console.log(`Transferring ${formatEther(balanceMinusGas)}ETH to ${process.env.TARGET_WALLET}`)

      const hash = await walletClient.sendTransaction({
        account,
        to: process.env.TARGET_WALLET as `0x${string}`,
        value: balanceMinusGas,
      })

      if (hash) {
        await publicClient.waitForTransactionReceipt(
          { hash, confirmations: 5 }
        )

        await transferHistory.insertOne({
          time: (new Date()).getTime(),
          value: balanceMinusGas,
          txHash: hash
        })

        redis.set(`autotransfer-total`, +totalAccumulated + parseFloat(formatEther(balanceMinusGas)))

        res.json({
          status: 'SUCCESS',
          message: `Transferred ${formatEther(balanceMinusGas)}ETH to ${process.env.TARGET_WALLET}`,
          txHash: hash
        })
      }
    } catch (e: any) {
      res.json({
        status: 'ERROR',
        message: e.message
      })
    }
  } else {
    res.json({
      status: 'SUCCESS',
      message: `Source balance below threshold of ${balanceThreshold}ETH`
    })
    redis.set(`autotransfer`, JSON.stringify({
      lastExecuted: (new Date()).getTime(),
      lastTransfer: '0'
    }))
  }
}

export default autoTransferHandler;
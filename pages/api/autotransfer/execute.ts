import {createPublicClient, createWalletClient, http, Hex, parseEther, formatEther} from "viem";
import {mainnet} from "viem/chains";
import {privateKeyToAccount} from "viem/accounts";
import {NextApiRequest, NextApiResponse} from "next";
import { Redis } from '@upstash/redis'
import db from 'lib/db'
import {WETH_ADDRESS} from "../../../utils/contracts";
import ERC20Abi from "../../../artifacts/ERC20Abi";
import ERC20WethAbi from "../../../artifacts/ERC20WethAbi";

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
  const balance = await publicClient.readContract({
    address: WETH_ADDRESS,
    abi: ERC20WethAbi,
    functionName: 'balanceOf',
    args: [account.address]
  })

  const totalAccumulated: string = await redis.get(`autotransfer-total`).catch(() => '0') as string

  if (+totalAccumulated < +tranchesValue && balance > parseEther(balanceThreshold)) {
    try {
      const maxBalance = Math.min(+tranchesValue - +totalAccumulated, parseFloat(formatEther(balance)) - balanceThreshold)
      const transferableBalance = parseEther(`${maxBalance}`)
      redis.set(`autotransfer`, JSON.stringify({
        lastExecuted: (new Date()).getTime(),
        lastTransfer: transferableBalance
      }))
      console.log(`Transferring ${formatEther(transferableBalance)}ETH to ${process.env.TARGET_WALLET}`)

      const hash = await walletClient.writeContract({
        address: WETH_ADDRESS,
        abi: ERC20WethAbi,
        functionName: 'transfer',
        account,
        args: [process.env.TARGET_WALLET as `0x${string}`, transferableBalance]
      })

      if (hash) {
        await transferHistory.insertOne({
          time: (new Date()).getTime(),
          value: transferableBalance,
          txHash: hash
        })

        redis.set(`autotransfer-total`, +totalAccumulated + parseFloat(formatEther(transferableBalance)))

        res.json({
          status: 'SUCCESS',
          message: `Transferred ${formatEther(transferableBalance)}ETH to ${process.env.TARGET_WALLET}`,
          txHash: hash
        })
      } else {
        res.json({
          status: 'ERROR',
          message: 'Transfer Error'
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
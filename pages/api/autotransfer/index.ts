import {NextApiRequest, NextApiResponse} from "next";
import { Redis } from '@upstash/redis'
import {privateKeyToAccount} from "viem/accounts";
import {Hex} from "viem";

const account = privateKeyToAccount(`0x${process.env.DEPLOYER_PK as string}` as Hex)
const redis = Redis.fromEnv()

const autoTransferStatus = async (req: NextApiRequest, res: NextApiResponse) => {
  let lastStatus: any = await redis.get('autotransfer')
  const totalAccumulated = await redis.get(`autotransfer-total`).catch(() => '0')

  if (typeof lastStatus === "string") {
    lastStatus = JSON.parse(lastStatus)
  }

  return res.json({
    watching: account.address,
    target: process.env.TARGET_WALLET,
    total: totalAccumulated,
    ...lastStatus
  })
}

export default autoTransferStatus;
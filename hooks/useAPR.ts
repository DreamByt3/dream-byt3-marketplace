import {useContractReads} from "wagmi";
import {Chain, formatUnits, ContractFunctionConfig, parseUnits} from "viem";
import dayjs from "dayjs";

import useUSDAndNativePrice from "./useUSDAndNativePrice";

import FeeDistributorAbi from "../artifacts/FeeDistributorAbi";
import veDREAMAbi from "../artifacts/veDREAMAbi";
import DREAMLPAbi from "../artifacts/DREAMLPAbi";

import {getPreviousWeek} from "../utils/date";
import {
  DREAM,
  DREAM_LP,
  STAKING,
  STAKING_FEE_DISTRIBUTOR,
  VE_DREAM,
  WETH_ADDRESS
} from "../utils/contracts";
import {formatBN} from "../utils/numbers";

const useAPR = (timestamp: number | undefined, chain: Chain) => {
  timestamp = timestamp === undefined ? dayjs().startOf('day').toDate().getTime() : timestamp
  const previousWeekUnix = getPreviousWeek(timestamp);

  const { data, isLoading } = useContractReads({
    contracts: [
      {
        abi: FeeDistributorAbi as any,
        address: STAKING_FEE_DISTRIBUTOR,
        chainId: chain?.id,
        functionName: 'getTokensDistributedInWeek',
        args: [WETH_ADDRESS, BigInt(`${previousWeekUnix}`)],
      },
      {
        abi: FeeDistributorAbi,
        address: STAKING_FEE_DISTRIBUTOR,
        chainId: chain.id,
        functionName: 'getTokensDistributedInWeek',
        args: [STAKING, BigInt(`${previousWeekUnix}`)],
      },
      {
        abi: veDREAMAbi,
        address: VE_DREAM as `0x${string}`,
        functionName: 'totalSupply',
        chainId: chain?.id,
      },
      {
        abi: DREAMLPAbi,
        address: DREAM_LP as `0x${string}`,
        functionName: 'getReserves',
        chainId: chain?.id,
      }
    ]
  })

  const [distributedWeth, distributedDREAM, totalSupplyVeDream, reserves] = data || []

  const { data: wethPrice, isLoading: isLoadingWethPrice } = useUSDAndNativePrice({
    chainId: chain.id,
    contract: WETH_ADDRESS,
    price: distributedWeth?.result || BigInt(0)
  })

  const { data: dreamPrice, isLoading: isLoadingDREAMPrice } = useUSDAndNativePrice({
    chainId: chain.id,
    contract: DREAM,
    price: distributedDREAM?.result || BigInt(0)
  })

  const { data: wethLiquidity, isLoading: isLoadingWethLiquidity } = useUSDAndNativePrice({
    chainId: chain.id,
    contract: WETH_ADDRESS,
    price: reserves?.result?.[0] || BigInt(0)
  })

  const { data: dreamLiquidity, isLoading: isLoadingDreamLiquidity } = useUSDAndNativePrice({
    chainId: chain.id,
    contract: DREAM,
    price: reserves?.result?.[1] || BigInt(0)
  })

  const veDreamSupply = parseFloat(formatUnits(totalSupplyVeDream?.result || BigInt(0), 18))
  const lastWeekWethRevenue =  parseFloat(formatUnits(BigInt(wethPrice?.usdPrice || 0), 8) || '0')
  const lastWeekDREAMRevenue =  parseFloat(formatUnits(BigInt(dreamPrice?.usdPrice || 0), 8) || '0')

  const lastWeekRevenue = (lastWeekWethRevenue + lastWeekDREAMRevenue)
  const dailyRevenue = lastWeekRevenue / 7;
  const dreamLPLiquidity = parseFloat(wethLiquidity?.usdPrice || 0) + parseFloat(dreamLiquidity?.usdPrice || 0)

  const APR = Math.round(
    (10000 * (365 * dailyRevenue)) / (dreamLPLiquidity * veDreamSupply)
  ) * 52

  return {
    isLoading: isLoading || isLoadingWethPrice || isLoadingDREAMPrice || isLoadingDreamLiquidity || isLoadingWethLiquidity,
    TVL: dreamLPLiquidity,
    dailyRevenue,
    lastWeekRevenue,
    dailyAPR: APR / 365,
    weeklyAPR: (APR / 365) * 7,
    APR
  }
}

export default useAPR;
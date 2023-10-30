import {useContractReads} from "wagmi";
import {Chain, formatUnits} from "viem";
import dayjs from "dayjs";

import useUSDAndNativePrice from "./useUSDAndNativePrice";

import FeeDistributorAbi from "../artifacts/FeeDistributorAbi";
import veDREAMAbi from "../artifacts/veDREAMAbi";
import DREAMLPAbi from "../artifacts/DREAMLPAbi";
import UniswapV3Abi from "../artifacts/UniswapV3Abi";

import {getPreviousWeek} from "../utils/date";
import {
  DREAM,
  DREAM_LP,
  POOL_ADDRESS,
  STAKING,
  STAKING_FEE_DISTRIBUTOR,
  VE_DREAM,
  WETH_ADDRESS
} from "../utils/contracts";

const useAPR = (timestamp: number | undefined, chain: Chain) => {
  timestamp = timestamp === undefined ? dayjs().startOf('day').toDate().getTime() : timestamp
  const previousWeekUnix = getPreviousWeek(timestamp);

  const { data, isLoading } = useContractReads({
    contracts: [
      {
        abi: FeeDistributorAbi,
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
        functionName: 'getBasePosition',
        chainId: chain?.id,
      },
      {
        abi: UniswapV3Abi,
        address: POOL_ADDRESS as `0x${string}`,
        functionName: 'liquidity',
        chainId: chain?.id,
      }
    ],
    allowFailure: true,
    watch: false,
    keepPreviousData: true
  })

  const [distributedWeth, distributedDREAM, totalSupplyVeDream, basePositionLP, liquidity] = data || []

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

  const veDreamSupply = parseFloat(formatUnits(totalSupplyVeDream?.result || BigInt(0), 18))
  const lastWeekWethRevenue =  parseFloat(formatUnits(BigInt(wethPrice?.usdPrice || 0), 8) || '0')
  const lastWeekDREAMRevenue =  parseFloat(formatUnits(BigInt(dreamPrice?.usdPrice || 0), 8) || '0')

  const lastWeekRevenue = (lastWeekWethRevenue + lastWeekDREAMRevenue)
  const dailyRevenue = lastWeekRevenue / 7;
  const dreamLPLiquidity = parseFloat(formatUnits((basePositionLP?.result?.[0] || BigInt(0)) + (liquidity?.result || BigInt(0)), 18))
  const APR = Math.round(
    (10000 * (365 * dailyRevenue)) / (dreamLPLiquidity * veDreamSupply)
  ) * 52

  return {
    isLoading: isLoading || isLoadingWethPrice || isLoadingDREAMPrice,
    TVL: (basePositionLP?.result?.[0] || BigInt(0)),
    dailyRevenue,
    lastWeekRevenue,
    dailyAPR: APR / 365,
    weeklyAPR: (APR / 365) * 7,
    APR
  }
}

export default useAPR;
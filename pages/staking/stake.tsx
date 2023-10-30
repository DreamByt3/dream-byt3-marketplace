import {FC, useCallback, useEffect, useState} from "react";
import {InferGetStaticPropsType} from "next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faCircleInfo} from "@fortawesome/free-solid-svg-icons";
import {useAccount, useContractReads} from "wagmi";
import {ContractFunctionConfig, formatEther, parseUnits} from "viem";
import {mainnet} from "viem/chains";
import {useRouter} from "next/router";
import Link from "next/link";
import dayjs from "dayjs";

import Layout from "components/Layout";
import {Box, Button, CryptoCurrencyIcon, Flex, Text, Tooltip} from "components/primitives";
import NumericalInput from "components/common/NumericalInput";
import StakingTab from "components/staking/StakingTab";
import UnStakingTab from "components/staking/UnstakingTab";

import {useMarketplaceChain, useMounted} from "hooks";

import {formatBN} from "utils/numbers";
import {roundToWeek} from "utils/round";

import DREAMAbi from 'artifacts/DREAMAbi'
import veDREAMAbi from "artifacts/veDREAMAbi";
import AddressCollapsible from "../../components/staking/AddressCollapsible";
import AlertChainSwitch from "../../components/common/AlertChainSwitch";
import Decimal from "decimal.js-light";
import {DREAM, DREAM_LP, VE_DREAM} from "../../utils/contracts";

export const MAX_LOCK_PERIOD_IN_DAYS = 365; // 1y
export const MIN_LOCK_PERIOD_IN_DAYS = 28;

const StakingChainPage: FC = () => {
  const chain = useMarketplaceChain()
  const [activeTab, setActiveTab] = useState('staking')
  const [valueEth, setValueEth] = useState<string>('0')
  const [duration, setDuration] = useState<string>('0')
  const [maxDuration, setMaxDuration] = useState<string>('12')
  const { address } = useAccount()
  const mounted = useMounted()
  const router = useRouter()

  const addresses: Record<string, string> = {
    'DREAM': DREAM,
    'veDREAM': VE_DREAM,
    'DREAM/WETH LP Token': DREAM_LP,
  }

  const { data: dreamData } : { data: any } = useContractReads<
    [
      ContractFunctionConfig<typeof DREAMAbi, 'balanceOf', 'view'>,
      ContractFunctionConfig<typeof veDREAMAbi, 'locked', 'view'>,
    ]
    >({
    contracts: [
      // LPDREAM Balance
      {
        abi: DREAMAbi,
        address: DREAM_LP,
        chainId: mainnet.id,
        functionName: 'balanceOf',
        args: [address as `0x${string}`]
      },
      // veDREAM Locked
      {
        abi: veDREAMAbi,
        address: VE_DREAM,
        functionName: 'locked',
        chainId: mainnet.id,
        args: [address as `0x${string}`],
      }
    ],
    watch: false,
    allowFailure: true,
    enabled: !!address,
  })

  const [dreamLPBalance, locked] = dreamData || []

  useEffect(() => {
    if (new Date((parseInt(`${locked?.result?.[1]}`) || 0) * 1000) > new Date()) {
      const timeStamp =  new Date(parseInt(`${locked?.result?.[1] || 0}`) * 1000);
      const roundedTime = dayjs(timeStamp).startOf('day')
      const oneYear = roundToWeek(dayjs().startOf('day').add(MAX_LOCK_PERIOD_IN_DAYS, 'days'))
      const daysLeft = oneYear.diff(roundedTime, 'days')
      setMaxDuration(`${Math.ceil(daysLeft / MIN_LOCK_PERIOD_IN_DAYS)}`)
    }
  }, [locked])

  const handleSetValue = (val: string) => {
    try {
      parseUnits(val, 18);
      setValueEth(val);
    } catch (e) {
      setValueEth('0');
    }
  }

  const handleSetDuration = (val: string) => {
    let newVal = parseInt(val)
    if (newVal < 0) {
      newVal = 0
    }

    if (newVal > +maxDuration) {
      newVal = +maxDuration
    }

    setDuration(`${newVal}`)
  }

  const handleSetMaxValue = useCallback(() => {
    const val = new Decimal(formatEther(BigInt(dreamLPBalance?.result || 0), 'wei'))
    setValueEth(`${val.toFixed()}`)
  }, [dreamLPBalance])

  if (!mounted) {
    return null;
  }

  return (
    <Layout>
      <AlertChainSwitch chainId={mainnet.id}/>
      <Flex
        direction="column"
        css={{
          mx: 20,
          pb: 80,
          '@md': {
            alignItems: 'center'
          }
        }}
      >
        <Flex
          css={{
            height: '1.25rem',
            mt: '1.75rem',
            mb: '1rem',
            gap: 10,
            mx: 16,
          }}
        >
          <Text
            style="subtitle1"
            css={{
              color: '$gray10'
            }}
            as={Link}
            href="/staking"
          >{`Stake`}</Text>
          <Text
            style="subtitle1"
            css={{
              color: '$gray10'
            }}
          >{`>`}</Text>
          <Text style="subtitle1">{`veDREAM ${chain.name}`}</Text>
        </Flex>
        <Flex
          direction="column"
          css={{
            p: '1rem 1rem 0.75rem 1rem',
            border: '1px solid $gray4',
            background: '$gray3',
            px: 16,
            borderRadius: 8,
            '@md': {
              width: 400
            }
          }}
        >
          <Flex
            justify="between"
            css={{
              width: '100%'
            }}
          >
            <Text style="h6">Stake</Text>
            <Flex
              align="center"
              css={{
                gap: 5,
                background: '$gray11',
                px: 10,
                borderRadius: 8
              }}
            >
              <img src={chain?.lightIconUrl} width={14} height={14}  alt={chain?.name}/>
              <Text style="body3" color="dark">{chain?.name}</Text>
            </Flex>
          </Flex>
          <Flex
            direction="column"
            css={{
              pt: 20
            }}
          >
            <Flex>
              <Button
                size="xs"
                color="ghost"
                onClick={() => {
                  setActiveTab('staking')
                }}
                css={{
                  px: 0,
                  mr: 30
                }}
              >Stake</Button>
              <Button
                size="xs"
                color="ghost"
                onClick={() => {
                  setActiveTab('unstaking')
                }}
                css={{
                  px: 0,
                  '&:disabled': {
                    backgroundColor: 'unset',
                    color: '$gray11',
                  },
                  '&:disabled:hover': {
                    backgroundColor: 'unset',
                    color: '$gray11',
                  },
                }}
                disabled
              >Unstake</Button>
            </Flex>
            <Flex
              direction="column"
              css={{
                gap: 20
              }}
            >
              <Flex
                direction="column"
                css={{
                  gap: 5,
                  mt: 20
                }}
              >
                <Flex
                  justify="between"
                >
                  <Text style="body3">Select Amount</Text>
                  <Text style="body3">{`DREAM/WETH LP Balance: ${formatBN(BigInt(dreamLPBalance?.result || 0), 4, 18 || 10)}`}</Text>
                </Flex>
                <Box
                  css={{
                    position: 'relative'
                  }}
                >
                  <NumericalInput
                    value={valueEth}
                    onUserInput={handleSetValue}
                    icon={<Button size="xs" onClick={handleSetMaxValue}>MAX</Button>}
                    iconStyles={{
                      top: 4,
                      right: 4,
                      left: 'auto'
                    }}
                    containerCss={{
                      width: '100%'
                    }}
                    css={{
                      pl: 40,
                      pr: 80,
                      boxShadow: '0 0 0 2px white'
                    }}
                  />
                  <CryptoCurrencyIcon
                    address={DREAM_LP}
                    chainId={chain?.id}
                    css={{
                      position: 'absolute',
                      width: 25,
                      height: 25,
                      top: 10,
                      left: 10
                    }}
                  />
                </Box>
              </Flex>
              <Flex
                direction="column"
                css={{
                  gap: 5
                }}
              >
                <Flex
                  align="center"
                  css={{
                    gap: 5
                  }}
                >
                  <Text style="body3">{+maxDuration < 1 ? 'You have locked for max duration' : `Stake Duration (${+maxDuration > 1 ? `1 to ${maxDuration}` : '1'}) months`}</Text>
                  <Tooltip
                    content={
                      <Text
                        style="body3"
                        as="p"
                        css={{
                          background: '#fff',
                          color: '#000',
                          margin: '-$2',
                          p: '$2',
                          maxWidth: 150
                        }}>
                        Unlock time is rounded to UTC weeks
                      </Text>
                    }
                  >
                    <FontAwesomeIcon icon={faCircleInfo} width={10} height={10}/>
                  </Tooltip>
                </Flex>
                <NumericalInput
                  value={duration}
                  disabled={+maxDuration < 1}
                  onUserInput={handleSetDuration}
                  min={0}
                  max={maxDuration}
                  step={1}
                  inputMode="numeric"
                  icon={<Button size="xs" onClick={() => setDuration(`${maxDuration}`)}>MAX</Button>}
                  iconStyles={{
                    top: 4,
                    right: 4,
                    left: 'auto'
                  }}
                  containerCss={{
                    width: '100%'
                  }}
                  css={{
                    pl: 10,
                    pr: 80,
                    boxShadow: '0 0 0 2px white'
                  }}
                />
              </Flex>
              {activeTab === "staking" && (
                <StakingTab
                  value={`${parseFloat(valueEth)}`}
                  duration={parseInt(duration)}
                  chain={mainnet}
                  depositor={{
                    id: address as `0x${string}`,
                    totalBalance: 0n,
                    lockedBalance: locked?.result?.[0],
                    lockEndTimestamp: locked?.result?.[1],
                  }}
                  onSuccess={() => {
                    setDuration('0')
                    setValueEth('0.0')
                    router.push('/staking')
                  }}
                />
              )}
              {activeTab === "unstaking" && (
                <UnStakingTab/>
              )}
            </Flex>
          </Flex>
        </Flex>
        <AddressCollapsible
          addresses={addresses}
          chain={mainnet}
        />
      </Flex>
    </Layout>
  )
}

export default StakingChainPage;
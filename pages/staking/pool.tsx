import {FC, useCallback, useContext, useMemo, useState} from "react";
import {
  useAccount, useBalance, useContractRead,
  useContractReads,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction
} from "wagmi";
import {formatEther, parseEther, parseUnits} from "viem";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faExternalLink, faSquarePlus} from "@fortawesome/free-solid-svg-icons";
import {useConnectModal} from "@rainbow-me/rainbowkit";
import {useDebouncedEffect} from "@react-hookz/web";
import {getPublicClient} from "@wagmi/core";
import {mainnet} from "viem/chains";
import Link from "next/link";

import Layout from "components/Layout";
import {Box, Button, CryptoCurrencyIcon, Flex, Text, Tooltip} from "components/primitives";
import NumericalInput from "components/common/NumericalInput";

import {ToastContext} from "context/ToastContextProvider";
import {useMounted} from "hooks";

import {parseError} from "utils/error";
import {formatBN} from "utils/numbers";

import ERC20Abi from 'artifacts/ERC20Abi'
import ERC20WethAbi from 'artifacts/ERC20WethAbi'
import UniswapV2RouterAbi from 'artifacts/UniswapV2RouterAbi'
import useUSDAndNativePrice from "../../hooks/useUSDAndNativePrice";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import AddressCollapsible from "../../components/staking/AddressCollapsible";
import AlertChainSwitch from "../../components/common/AlertChainSwitch";
import {DREAM, DREAM_LP, STAKING_UNI_ROUTER, WETH_ADDRESS} from "../../utils/contracts";
import {MaxUint256} from "@ethersproject/constants";
import DREAMLPAbi from "../../artifacts/DREAMLPAbi";
import {InferGetServerSidePropsType} from "next";
import {getServerSideProps} from "../portfolio/settings";

type Props = InferGetServerSidePropsType<typeof getServerSideProps>

const PoolPage: FC<Props> = () => {
  const mounted = useMounted()
  const { address} = useAccount()
  const { openConnectModal } = useConnectModal()
  const [valueWEth, setValueWEth] = useState<string>('0')
  const [valueDREAM, setValueDREAM] = useState<string>('0')
  const [expectedDREAMLP, setExpectedDREAMLP] = useState<bigint>(BigInt(0))
  const [changedValue, setChangedValue] = useState('')
  const [loading, setLoading] = useState(false)
  const publicClient = getPublicClient()
  const {addToast} = useContext(ToastContext)
  const addresses: Record<string, `0x${string}`> = {
    'DREAM': DREAM,
    'WETH': WETH_ADDRESS,
    'DREAM/WETH LP': DREAM_LP,
    'Uniswap Router': STAKING_UNI_ROUTER
  }

  const { data: ethBalance } = useBalance({
    address: address as `0x${string}`
  })

  const { data: balanceData, refetch: refetchBalance } = useContractReads({
    contracts: [
      {
        abi:  ERC20Abi,
        address: WETH_ADDRESS as `0x${string}`,
        functionName:  'balanceOf',
        args: [address as `0x${string}`],
      },
      {
        abi:  ERC20Abi,
        address: DREAM,
        functionName:  'balanceOf',
        args: [address as `0x${string}`],
      },
      {
        abi:  ERC20Abi,
        address: DREAM_LP,
        functionName:  'balanceOf',
        args: [address as `0x${string}`],
      }
    ],
    watch: true,
    allowFailure: true,
    enabled: !!address,
  })

  const isZeroValue = parseEther(valueWEth as `${number}`, 'wei', ) <= BigInt(0)

  const { data: allowanceData, refetch: refetchAllowance } = useContractReads({
    contracts: [
      {
        abi:  ERC20Abi,
        address: WETH_ADDRESS as `0x${string}`,
        functionName:  'allowance',
        args: [address as `0x${string}`, STAKING_UNI_ROUTER],
      },
      {
        abi:  ERC20Abi,
        address: DREAM,
        functionName:  'allowance',
        args: [address as `0x${string}`, STAKING_UNI_ROUTER],
      }
    ],
    watch: false,
    allowFailure: true,
    enabled: !!address,
  })

  const { data: lpData } = useContractReads({
    contracts: [
      {
        abi: DREAMLPAbi,
        address: DREAM_LP,
        functionName: 'getReserves'
      },
      {
        abi: DREAMLPAbi,
        address: DREAM_LP,
        functionName: 'totalSupply',
      }
    ],
    watch: true,
    keepPreviousData: true
  })

  const [reserveData, totalSupplyLP] = lpData || [] as any
  const [reserveETH, reserveDream, blockTimestampLast] = reserveData?.result || [] as any
  const [wethBalance, dreamBalance, dreamLPBalance ] = balanceData || [] as any
  const [wethAllowance, dreamAllowance] = allowanceData || [] as any
  const wethValue = useMemo(() => parseEther(valueWEth as `${number}`), [valueWEth])
  const dreamValue = useMemo(() => parseEther(valueDREAM as `${number}`), [valueDREAM])
  const requireWethAllowance = BigInt(wethAllowance?.result || 0) < wethValue
  const requireDREAMAllowance = BigInt(dreamAllowance?.result || 0) < dreamValue;
  const requireETHWrap = BigInt(wethBalance?.result || 0) < wethValue && (BigInt(ethBalance?.value || 0) + BigInt(wethBalance?.result || 0)) >= wethValue

  const { data: usdPrice, isLoading: isLoadingUSDPrice } = useUSDAndNativePrice({
    chainId: mainnet.id,
    contract: WETH_ADDRESS,
    price: wethValue * BigInt(2)
  })

  useDebouncedEffect(() => {
    if (changedValue === '') {
      return;
    }

    setLoading(true)
    const isWethChange = changedValue === 'weth'
    const value = isWethChange ? wethValue : dreamValue

    if (value > BigInt(0)) {
      publicClient.readContract(
        {
          abi: UniswapV2RouterAbi,
          address: STAKING_UNI_ROUTER,
          functionName: 'quote',
          args: [value, isWethChange ? reserveETH || BigInt(0) : reserveDream || BigInt(0), isWethChange ? reserveDream || BigInt(0) : reserveETH || BigInt(0)]
        }).then(async (res) => {
          // const minVal = res
          // const otherVal = maxVal - ((maxVal - minVal) / BigInt(2))
          const val = (parseFloat(formatEther(res, 'wei')) * 0.97).toString()
          if (isWethChange) {
            setValueDREAM(val)
          } else {
            setValueWEth(val)
          }

          const wethLiquidity = wethValue * BigInt(totalSupplyLP?.result || 0) / BigInt(reserveETH || 0);
          const dreamLiquidity = dreamValue * BigInt(totalSupplyLP?.result || 0) / BigInt(reserveDream || 0)
          const expectedDreamLP = wethLiquidity > dreamLiquidity ? dreamLiquidity : wethLiquidity;
          setExpectedDREAMLP(expectedDreamLP)
          setChangedValue('')
          setLoading(false)
        }).catch(() => {
          setChangedValue('')
          setLoading(false)
        })
    }
  }, [changedValue, wethValue, dreamValue, totalSupplyLP?.result, reserveDream, reserveETH], 1000)

  const { config, error: preparedError, refetch: refetchPrepareContract } = usePrepareContractWrite({
    enabled: !!address && !isZeroValue,
    address: STAKING_UNI_ROUTER,
    abi: UniswapV2RouterAbi,
    functionName: 'addLiquidity',
    args: [
      WETH_ADDRESS,
      DREAM,
      wethValue,
      dreamValue,
      parseEther(`${parseFloat(valueWEth) * 0.97}`), // 0.3% slippage
      parseEther(`${parseFloat(valueDREAM) * 0.97}`), // 0.3% slippage
      address as `0x${string}`,
      BigInt(Math.round(((new Date()).getTime() + (1000 * 60 * 5)) / 1000)) // 5 Minute Deadline
    ],
    account: address
  })

  const { writeAsync, error, data, isLoading } = useContractWrite(config)

  const { writeAsync: approveWethAsync, isLoading: isLoadingWethApproval } = useContractWrite({
    address: WETH_ADDRESS as `0x${string}`,
    abi: ERC20Abi,
    functionName: 'approve',
    args:  [DREAM_LP, BigInt(MaxUint256.toString())],
    account: address
  })

  const { writeAsync: approveDREAMAsync, isLoading: isLoadingDREAMApproval } = useContractWrite({
    address: DREAM,
    abi: ERC20Abi,
    functionName: 'approve',
    args:  [DREAM_LP, BigInt(MaxUint256.toString())],
    account: address
  })

  const { writeAsync: wrapEthAsync, isLoading: isLoadingWrapEth } = useContractWrite({
    address: WETH_ADDRESS as `0x${string}`,
    abi: ERC20WethAbi,
    functionName: 'deposit',
    value: wethValue - BigInt(wethBalance?.result || 0),
    account: address
  })

  const { isLoading: isLoadingTransaction, isSuccess = true } = useWaitForTransaction({
    hash: data?.hash,
    enabled: !!data?.hash
  })

  const handleSetValue = (val: string) => {
    try {
      parseUnits(`${+val}`, 18);
      setValueWEth(val);
      setChangedValue('weth')
    } catch (e) {
      setValueWEth('0');
    }
  }

  const handleSetDREAMValue = (val: string) => {
    try {
      parseUnits(`${+val}`, 18);
      setValueDREAM(val);
      setChangedValue('dream')
    } catch (e) {
      setValueDREAM('0');
    }
  }


  const handleSetMaxValue = useCallback(() => {
    handleSetValue(formatEther(BigInt(wethBalance?.result || 0) + BigInt(ethBalance?.value || 0), 'wei') || '0')
  }, [wethBalance])

  const handleSetMaveDREAMValue = useCallback(() => {
    handleSetDREAMValue(formatEther(BigInt(dreamBalance?.result || 0), 'wei') || '0')
  }, [dreamBalance])

  const disableButton = isZeroValue || loading || (!!preparedError && !requireDREAMAllowance && !requireWethAllowance && !requireETHWrap) || isLoading || isLoadingWethApproval || isLoadingDREAMApproval || isLoadingWrapEth || isLoadingTransaction

  const buttonText = useMemo(() => {
    if (!address) {
      return 'Connect Wallet'
    }

    if (requireETHWrap) {
      return 'Wrap ETH'
    }

    if (requireDREAMAllowance) {
      return 'Approve DREAM'
    }

    if (requireWethAllowance) {
      return 'Approve WETH'
    }

    if (preparedError) {
      const { message } = parseError(preparedError)

      return message
    }

    return 'Add Liquidity'
  }, [address, preparedError, requireETHWrap, requireDREAMAllowance, requireWethAllowance]);

  const handleAddLiquidity = useCallback(async () => {
    try {
      if (!address) {
        await openConnectModal?.()
      }

      if (requireETHWrap) {
        await wrapEthAsync?.()
          .then((res) => {
            return publicClient.waitForTransactionReceipt(
              {
                confirmations: 5,
                hash: res.hash
              }
            )
          }).then(async () => {
            await refetchAllowance();
            await refetchBalance();
            await refetchPrepareContract()
          })
      }

      if (requireDREAMAllowance) {
        await approveDREAMAsync?.()
          .then((res) => {
            return publicClient.waitForTransactionReceipt(
              {
                confirmations: 5,
                hash: res.hash
              }
            )
          }).then(async () => {
            await refetchAllowance();
            await refetchBalance();
            await refetchPrepareContract()
          })
      }

      if (requireWethAllowance) {
        await approveWethAsync?.()
          .then((res) => {
            return publicClient.waitForTransactionReceipt(
              {
                confirmations: 5,
                hash: res.hash
              }
            )
          }).then(async () => {
            await refetchAllowance();
            await refetchBalance();
            await refetchPrepareContract()
          })
      }

      await writeAsync?.()
        .then((tx) => {
          addToast?.({
            title: 'Success',
            status: 'success',
            description: (
              <Flex
                direction="column"
              >
                <Text css={{ fontSize: 'inherit' }}>{`Add Liquidity Successful`}</Text>
                <Link
                  href={`${mainnet.blockExplorers.etherscan.url}/tx/${tx?.hash}`}
                  target="_blank"
                  style={{
                    marginTop: 20
                  }}
                >
                  {`See Tx Receipt`}
                  <FontAwesomeIcon
                    icon={faExternalLink}
                    width={15}
                    height={15}
                    style={{
                      marginLeft: 10
                    }}
                  />
                </Link>
              </Flex>
            )
          })
        })
    } catch (e: any) {
      await refetchAllowance();
      await refetchPrepareContract()
      addToast?.({
        title: parseError(e).name,
        status: 'error',
        description: parseError(e).message
      })
    }
  }, [requireWethAllowance, requireDREAMAllowance, requireETHWrap, writeAsync, wrapEthAsync, approveWethAsync, approveDREAMAsync, openConnectModal, addToast])

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
          <Text style="subtitle1">{`Get DREAM/WETH LP`}</Text>
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
            <Text style="h6">Add Liquidity</Text>
            <Flex
              align="center"
              css={{
                gap: 5,
                background: '$gray11',
                px: 10,
                borderRadius: 8
              }}
            >
              <img src="/icons/eth-icon-dark.svg" width={14} height={14}  alt="Ethereum"/>
              <Text style="body3" color="dark">Ethereum</Text>
            </Flex>
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
                <Text style="body3">WETH Amount</Text>
                <Tooltip
                  align="right"
                  side="top"
                  content={
                    <Flex
                      direction="column"
                      css={{
                        gap: 5
                      }}
                    >
                      <Text style="body3">{`Balance: ${formatBN(BigInt(wethBalance?.result || 0), 6, 18)} WETH`}</Text>
                      <Text style="body3">{`Balance: ${formatBN(BigInt(ethBalance?.value || 0), 6, 18)} ETH`}</Text>
                    </Flex>
                  }
                >
                  <Text css={{
                    fontSize: 12
                  }}>{`Combined Balance: ${formatBN(BigInt(wethBalance?.result || 0) + BigInt(ethBalance?.value || 0), 6, 18)}`}</Text>
                </Tooltip>
              </Flex>
              <Box
                css={{
                  position: 'relative'
                }}
              >
                <NumericalInput
                  value={valueWEth}
                  onUserInput={handleSetValue}
                  icon={<Button size="xs" onClick={() => handleSetMaxValue()}>MAX</Button>}
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
                    boxShadow: 'inset 0 0 0 2px'
                  }}
                />
                <CryptoCurrencyIcon
                  address={WETH_ADDRESS as `0x${string}`}
                  chainId={mainnet.id}
                  css={{
                    objectFit: 'contain',
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
              align="center"
              justify="between"
            >
              <Flex>
                {BigInt(wethBalance?.result || 0) === BigInt(0) && (
                  <Text
                    as={Link}
                    style="body3"
                    href="/swap/?output=0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
                    target="_blank"
                    css={{
                      backgroundColor: '$gray8',
                      borderRadius: 6,
                      px: 10,
                      py: 5
                    }}
                  >
                    {`Get WETH Token`}
                    <FontAwesomeIcon icon={faExternalLink} style={{ height: 12, width: 12, display: 'inline-block', marginLeft: 5 }}/>
                  </Text>
                )}
              </Flex>
              <FontAwesomeIcon icon={faSquarePlus} style={{ height: 40, width: 40}}/>
              <Flex>
                {BigInt(dreamBalance?.result || 0) === BigInt(0) && (
                  <Text
                    as={Link}
                    style="body3"
                    href="/swap/?output=0xebcf2fbe20e7bbbd5232eb186b85c143d362074e"
                    target="_blank"
                    css={{
                      backgroundColor: '$gray8',
                      borderRadius: 6,
                      px: 10,
                      py: 5
                    }}
                  >
                    {`Get DREAM Token`}
                    <FontAwesomeIcon icon={faExternalLink} style={{ height: 12, width: 12, display: 'inline-block', marginLeft: 5}}/>
                  </Text>
                )}
              </Flex>
            </Flex>
            <Flex
              direction="column"
              css={{
                gap: 5,
              }}
            >
              <Box
                css={{
                  position: 'relative'
                }}
              >
                <NumericalInput
                  value={valueDREAM}
                  onUserInput={handleSetDREAMValue}
                  icon={<Button size="xs" onClick={() => handleSetMaveDREAMValue()}>MAX</Button>}
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
                    boxShadow: 'inset 0 0 0 2px'
                  }}
                />
                <CryptoCurrencyIcon
                  address={DREAM}
                  chainId={mainnet.id}
                  css={{
                    objectFit: 'contain',
                    position: 'absolute',
                    width: 25,
                    height: 25,
                    top: 10,
                    left: 10
                  }}
                />
              </Box>
              <Flex
                justify="between"
              >
                <Text style="body3">DREAM Amount</Text>
                <Text style="body3">{`Balance: ${formatBN(BigInt(dreamBalance?.result || 0), 6, 18)}`}</Text>
              </Flex>
            </Flex>
            <Flex
              justify="between"
              css={{
                p: '14px 16px',
                backgroundColor: '$gray2',
                borderRadius: 8
              }}
            >
              <Text style="body2">Your Current DREAM LP Balance</Text>
              <Flex
                align="center"
                css={{
                  gap: 5
                }}
              >
                <CryptoCurrencyIcon
                  address={DREAM_LP}
                  chainId={mainnet.id}
                  css={{
                    width: 20,
                    height: 20
                  }}
                />
                <Text style="body2">{`${formatBN(BigInt(dreamLPBalance?.result || 0), 6, 18)}`}</Text>
              </Flex>
            </Flex>
            <Flex
              justify="between"
              css={{
                px: 16,
              }}
            >
              <Text style="body2">Amount Liquidity Providing (In USD)</Text>
              <Flex
                align="center"
                css={{
                  gap: 5
                }}
              >
                {isLoadingUSDPrice ? (
                  <LoadingSpinner css={{ width: 20, height: 20,  border: '2px solid transparent', }}/>
                ) : (
                  <Text style="body2">{`$${formatBN(usdPrice?.usdPrice, 2, 6)}`}</Text>
                )}
              </Flex>
            </Flex>
            <Flex
              justify="between"
              css={{
                p: '14px 16px',
                backgroundColor: '$gray2',
                borderRadius: 8
              }}
            >
              <Text style="body2">Expected To Receive</Text>
              <Flex
                align="center"
                css={{
                  gap: 5
                }}
              >
                <CryptoCurrencyIcon
                  address={DREAM_LP}
                  chainId={mainnet.id}
                  css={{
                    width: 20,
                    height: 20
                  }}
                />
                <Text style="body2">{`${formatBN(expectedDREAMLP, 6, 18)}`}</Text>
              </Flex>
            </Flex>
          </Flex>
          <Button
            disabled={disableButton}
            color="primary"
            size="large"
            css={{
              mt: 20,
              width: '100%',
              display: 'inline-block'
            }}
            onClick={handleAddLiquidity}
          >
            {buttonText}
          </Button>
        </Flex>
        <AddressCollapsible
          addresses={addresses}
          chain={mainnet}
        />
        <Flex
          direction="column"
          css={{
            p: '1rem 1rem 0.75rem 1rem',
            px: 16,
            borderRadius: 8,
            textAlign: 'center',
            '@md': {
              width: 500
            }
          }}
        >
          <Text style="body3"><h2> 1. Add liquidity to the DREAM-WETH pool on Uniswap. </h2>2. Lock up the resulting DREAM/WETH LP token received (DREAM/WETH LP). <br></br> 3. The longer you lock your DREAM/WETH LP token (1 year max), the more veDREAM you get, and the greater your rewards and voting power. <Text style="body3" as={Link} css={{ fontWeight: 'bold', '&:hover': { textDecoration: 'underline' } }} href="https://docs.dreambyt3.com/dream-token/vedream-and-staking" target="_blank"><h1>Learn more about veDREAM in the docs.</h1></Text></Text>
        </Flex>
      </Flex>
    </Layout>
  )
}



export default PoolPage
import {FC} from "react";
import Link from "next/link";
import { mainnet } from "viem/chains";

import {Box, Button, CryptoCurrencyIcon, Flex, Text} from "../primitives";

import {formatBN} from "utils/numbers";
import {DREAM_LP} from "../../utils/contracts";

type Props = {
  APR: number
  dreamLPBalance: bigint
}

const StakingList: FC<Props> = (props) => {
  const { dreamLPBalance, APR } = props

  return (
    <>
      {BigInt(dreamLPBalance) > BigInt(0) ? (
        <Button
          as={Link}
          href="/staking/stake"
          css={{
            p: '1rem',
            minHeight: '9.875rem',
            minWidth: '16.125rem',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderColor: 'transparent',
            borderWidth:  1,
            borderStyle: 'solid',
            transition: 'border-color 0.3s',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderColor: '#f4a7bb',
            }
          }}
        >
          <Flex
            justify="between"
            css={{
              width: '100%'
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
            justify="between"
            css={{
              width: '100%'
            }}
          >
            <Flex
              direction="column"
            >
              <Text style="body3">Token</Text>
              <Text style="h6">DREAM/WETH LP</Text>
            </Flex>
            <Flex
              direction="column"
            >
            </Flex>
          </Flex>
          <Flex
            direction="column"
          >
            <Text style="body3">Available to Stake</Text>
            <Text style="subtitle1">{formatBN(dreamLPBalance || BigInt(0), 2, 18, { notation: "standard" })}</Text>
          </Flex>
        </Button>
      ) : (
        <Box
          css={{
            border: '1px dashed #f4a7bb',
            opacity: 0.2,
            minWidth: '16.125rem',
            background: '#323232',
            minHeight: '9.875rem',
            borderRadius: '0.75rem',
            content: ' '
          }}
        />
      )}
      {/*{(new Array(3).fill('')).map((x, i) => (*/}
      {/*  <Box*/}
      {/*    key={`box-${i}`}*/}
      {/*    css={{*/}
      {/*      border: '1px dashed #f4a7bb',*/}
      {/*      opacity: 0.2,*/}
      {/*      minWidth: '16.125rem',*/}
      {/*      background: '#323232',*/}
      {/*      minHeight: '9.875rem',*/}
      {/*      borderRadius: '0.75rem',*/}
      {/*      content: ' '*/}
      {/*    }}*/}
      {/*  />*/}
      {/*))}*/}
    </>
  )
}

export default StakingList
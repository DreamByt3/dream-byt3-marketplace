import { useCollections } from '@reservoir0x/reservoir-kit-ui'
import { Text, Box, FormatCryptoCurrency, Grid } from 'components/primitives'
import { useMounted } from 'hooks'
import { FC, ReactNode } from 'react'
import { useMediaQuery } from 'react-responsive'
import { formatNumber } from 'utils/numbers'
import {erc20ABI, useContractRead, useContractReads} from "wagmi";
import ERC721Abi from "../../artifacts/ERC721Abi";
import ERC1155Abi from "../../artifacts/ERC1155Abi";
import {zeroAddress} from "viem";

type Props = {
  label: string
  children: ReactNode
}

const StatBox: FC<Props> = ({ label, children }) => (
  <Box
    css={{
      p: '$4',
      minWidth: 120
    }}
  >
    <Text style="subtitle3" css={{ color: '$gray12' }} as="p">
      {label}
    </Text>
    {children}
  </Box>
)

type StatHeaderProps = {
  collection: NonNullable<ReturnType<typeof useCollections>['data']>[0]
}

const StatHeader: FC<StatHeaderProps> = ({ collection }) => {
  const isMounted = useMounted()
  const isSmallDevice = useMediaQuery({ maxWidth: 600 }) && isMounted
  const listedPercentage =
    ((collection?.onSaleCount ? +collection.onSaleCount : 0) /
      (collection?.tokenCount ? +collection.tokenCount : 0)) *
    100
  // const { data: nonNativeBalances } = useContractRead({
  //   enabled: !!collection?.primaryContract,
  //   abi: collection?.contractKind === 'erc721' ? ERC721Abi : ERC1155Abi,
  //   address: collection?.primaryContract,
  //   functionName: 'total',
  //   args: [zeroAddress],
  //   allowFailure: true
  // })
  const uniqueOwnersPercentage =
    ((collection?.ownerCount ? +collection.ownerCount : 0) /
      (collection?.tokenCount ? +collection.tokenCount : 0)) *
    100

  return (
    <Grid
      css={{
        borderRadius: 8,
        overflow: 'hidden',
        gap: 1,
        gridTemplateColumns: '1fr 1fr',
        '@sm': {
          gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr',
          marginRight: 'auto',
        },
      }}
    >
      <StatBox label="Total Volume">
        <FormatCryptoCurrency
          amount={collection.volume?.allTime}
          logoHeight={18}
          textStyle={'h6'}
          maximumFractionDigits={4}
        />
      </StatBox>

      <StatBox label="Floor">
        <FormatCryptoCurrency
          amount={collection?.floorAsk?.price?.amount?.decimal}
          address={collection?.floorAsk?.price?.currency?.contract}
          decimals={collection?.floorAsk?.price?.currency?.decimals}
          logoHeight={18}
          textStyle={'h6'}
          maximumFractionDigits={4}
        />
      </StatBox>

      <StatBox label="Top Offer">
        <FormatCryptoCurrency
          amount={collection?.topBid?.price?.amount?.decimal}
          address={collection?.topBid?.price?.currency?.contract}
          decimals={collection?.topBid?.price?.currency?.decimals}
          logoHeight={18}
          textStyle={'h6'}
          maximumFractionDigits={4}
        />
      </StatBox>

      {!isSmallDevice && (
        <StatBox label="Listed">
          <Text style="h6">{formatNumber(listedPercentage, 2)}%</Text>
        </StatBox>
      )}

      <StatBox label="Owners">
        <Text style="h6">{formatNumber(collection?.ownerCount)}</Text>
      </StatBox>

      <StatBox label="Unique Owners">
        <Text style="h6">{formatNumber(uniqueOwnersPercentage)}%</Text>
      </StatBox>
    </Grid>
  )
}

export default StatHeader

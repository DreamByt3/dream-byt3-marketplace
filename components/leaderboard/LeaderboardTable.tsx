import React, { FC, useEffect, useRef, useState } from 'react'
import { useMediaQuery } from 'react-responsive'
import {
  Text,
  Flex,
  TableCell,
  TableRow,
  HeaderRow,
  Box,
  Input,
} from '../primitives'
import { useAccount } from 'wagmi'
import { useTheme } from 'next-themes'
import { formatNumber } from "utils/numbers";
import {useENSResolver, useProfile} from "hooks";
import LoadingSpinner from 'components/common/LoadingSpinner'

type Props = {
  data: any
  disabled?: boolean
  loading?: boolean
}

const desktopTemplateColumns = '.75fr 1.5fr repeat(3, 1fr)'
const mobileTemplateColumns = 'repeat(5, 1fr)'

export const LeaderboardTable: FC<Props> = ({ loading, data, disabled }) => {
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const [searchWallet, setSearchWallet] = useState<string | null>('')
  const { address } = useAccount()
  const { data: profile } = useProfile(address)
  const tableRef = useRef<HTMLTableElement>(null)

  // find by wallet in the table
  const filteredData = data?.filter((item: any) =>
    new RegExp(`${searchWallet}`, 'ig').test(item.wallet)
  )

  const wallets = data.map((e: any) => e.wallet.toLowerCase())

  useEffect(() => {
    if (tableRef.current) {
      tableRef.current.scrollTop = 0
    }
  }, [searchWallet])

  return (
    <>
      <Flex
        align="center"
        justify="center"
        css={{
          flex: 1,
          gap: '20px',
          marginBottom: '20px'
        }}
      >
        <Input
          onChange={(e) => {
            setSearchWallet(e.target.value)
          }}
          placeholder="Search Any Wallet Address"
          style={{
            borderRadius: '12px',
            fontFamily: 'monospace',
            background: '#3C3C3C',
            border: '1px solid #ffffff',
            width: '500px',
            maxWidth: '70vw',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        />
      </Flex>
      <Flex
        css={{
          '& > div:first-of-type': {
            pt: 0,
          },
          overflowY: 'auto',
          flexGrow: 1,
          flexShrink: 1,
          width: '100%',
          alignItems: 'stretch',
        }}
      >
        {loading ? (
          <Box css={{ marginTop: '30px' }}>
            <LoadingSpinner />
          </Box>
        ) : (
          <Flex direction="column" css={{ position: 'relative', width: '100%' }}>
            <TableHeading />
            {filteredData?.map((item: any, i: number) => (
              <LeaderboardTableRow
                key={`leaderboard-${item.wallet}`}
                rank={wallets.indexOf(item.wallet?.toLowerCase()) + 1}
                username={item.wallet}
                listingExp={disabled ? '0' : formatNumber(item.listingExp, 2)}
                offerExp={disabled ? '0' : formatNumber(item.offerExp, 2)}
                totalExp={disabled ? '0' : formatNumber(item.exp, 2)}
                isOwner={item.wallet.toLowerCase() === address?.toLowerCase()}
              />
            ))}
            <Box ref={loadMoreRef} css={{ height: 20 }} />
          </Flex>
        )}
      </Flex>
    </>
  )
}

type LeaderboardTableRowProps = {
  rank: number
  username: string
  listingExp: string
  offerExp: string
  totalExp: string
  isOwner: boolean
}

const LeaderboardTableRow: FC<LeaderboardTableRowProps> = ({
  rank,
  username,
  listingExp,
  offerExp,
  totalExp,
  isOwner
}) => {
  const { theme } = useTheme()
  const { displayName } = useENSResolver(username)

  return (
    <TableRow
      css={{
        borderBottomColor: theme === 'light' ? '$primary11' : '$primary6',
        '@xs': {
          gridTemplateColumns: mobileTemplateColumns,
        },
        '@lg': {
          gridTemplateColumns: desktopTemplateColumns
        },
      }}
    >
      <TableCell
        css={{
          borderBottom: '1px solid $primary13',
          borderLeft: '1px solid $primary13',
          textAlign: 'center',
          pl: '$2',
          py: '$5',
        }}
      >
        <Text
          style={{
            '@initial': 'subtitle3',
            '@lg': 'subtitle1',
          }}
          css={{
            fontFamily: 'monospace',
          }}
        >
          {rank}
        </Text>
      </TableCell>

      <TableCell
        css={{
          borderBottom: '1px solid $primary13',
          borderLeft: '1px solid $primary13',
          maxWidth: 'unset',
          textAlign: 'center',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          pl: '$2',
          py: '$5',
        }}
      >
        {isOwner ? (
          <Text
            style={{
              '@initial': 'subtitle3',
              '@lg': 'subtitle1',
            }}
            css={{ color: '$crimson9',    fontFamily: 'monospace', }}
          >
            You
          </Text>
        ) : (
          <Text
            style={{
              '@initial': 'subtitle3',
              '@lg': 'subtitle1',
            }}
            css={{
              fontFamily: 'monospace',
            }}
          >
            {displayName}
          </Text>
        )}
      </TableCell>

      <TableCell
        css={{
          borderBottom: '1px solid $primary13',
          borderLeft: '1px solid $primary13',
          textAlign: 'center',
          pl: '$2',
          py: '$5',
        }}
      >
        <Text
          style={{
            '@initial': 'subtitle3',
            '@lg': 'subtitle1',
          }}
          css={{
            color: '$primary13',
            marginTop: '$1',
            '&:hover': {
              color: '$primary14',
            },
            fontFamily: 'monospace',
          }}
        >
          {offerExp ?? 0}
        </Text>
      </TableCell>
      <TableCell
        css={{
          borderBottom: '1px solid $primary13',
          borderLeft: '1px solid $primary13',
          textAlign: 'center',
          pl: '$2',
          py: '$5',
        }}
      >
        <Text
          style={{
            '@initial': 'subtitle3',
            '@lg': 'subtitle1',
          }}
          css={{
            color: '$primary13',
            marginTop: '$1',
            '&:hover': {
              color: '$primary14',
            },
            fontFamily: 'monospace',
          }}
        >
          {listingExp ?? 0}
        </Text>
      </TableCell>
      <TableCell
        css={{
          borderBottom: '1px solid $primary13',
          borderLeft: '1px solid $primary13',
          borderRight: '1px solid $primary13',
          textAlign: 'center',
          px: '$2',
          py: '$5',
        }}
      >
        <Text
          style={{
            '@initial': 'subtitle3',
            '@lg': 'subtitle1',
          }}
          css={{
            color: '$primary13',
            marginTop: '$1',
            '&:hover': {
              color: '$primary14',
            },
            fontFamily: 'monospace',
          }}
        >
          {totalExp}
        </Text>
      </TableCell>
    </TableRow>
  )
}

const TableHeading = () => {
  const isSmallDevice = useMediaQuery({ maxWidth: 900 })
  const headings = ['Rank', 'User', 'Offers XP', 'Listing XP', 'Total XP']
  const { theme } = useTheme()
  return (
    <HeaderRow
      css={{
        borderTop: '1px solid $primary13',
        display: 'grid',
        position: 'sticky',
        width: '100%',
        top: 0,
        backgroundColor: theme === 'light' ? '$primary10' : '$primary5',
        '@xs': {
          gridTemplateColumns: mobileTemplateColumns,
        },
        '@lg': {
          gridTemplateColumns: desktopTemplateColumns,
        },
      }}
    >
      {headings.map((heading, index, array) => (
        <TableCell
          key={index}
          css={{
            textAlign: 'center',
            pl: '$2',
            py: '$2',
            borderBottom: '1px solid $primary13',
            borderLeft: '1px solid $primary13',
            ...(index === array.length - 1 && {
              borderRight: '1px solid $primary13',
            }),
          }}
        >
          <Text
            css={{
              color: '$gray11',
              display: 'flex',
              justifyContent: 'center',
              fontFamily: 'monospace',
            }}
            as={'div'}
            style={{
              '@initial': 'subtitle3',
              '@lg': 'subtitle2',
            }}
          >
            {heading}
          </Text>
        </TableCell>
      ))}
    </HeaderRow>
  )
}

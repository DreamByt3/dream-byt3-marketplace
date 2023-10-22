import { useRef } from 'react'
import { Box, Flex, Card } from '../primitives'
import GlobalSearch from './GlobalSearch'
import { useRouter } from 'next/router'
import { useHotkeys } from 'react-hotkeys-hook'
import Link from 'next/link'
import Image from 'next/image'
import { ConnectWalletButton } from 'components/ConnectWalletButton'
import NavItem from './NavItem'
import HamburgerMenu from './HamburgerMenu'
import MobileSearch from './MobileSearch'
import { useMediaQuery } from 'react-responsive'
import { useMarketplaceChain, useMounted } from '../../hooks'
import { useAccount } from 'wagmi'
import CartButton from './CartButton'
import { AccountSidebar } from 'components/navbar/AccountSidebar'

import * as HoverCard from '@radix-ui/react-hover-card'

export const NAVBAR_HEIGHT = 81
export const NAVBAR_HEIGHT_MOBILE = 77

const Navbar = () => {
  const { isConnected } = useAccount()
  const isMobile = useMediaQuery({ query: '(max-width: 960px)' })
  const isMounted = useMounted()
  const { routePrefix } = useMarketplaceChain()

  let searchRef = useRef<HTMLInputElement>(null)

  const router = useRouter()
  useHotkeys('meta+k', (e) => {
    e.preventDefault()
    if (searchRef?.current) {
      searchRef?.current?.focus()
    }
  })

  if (!isMounted) {
    return null
  }

  return isMobile ? (
    <Flex
      css={{
        height: NAVBAR_HEIGHT_MOBILE,
        px: '$4',
        width: '100%',
        borderBottom: '1px solid $pinkA11',
        zIndex: 999,
        background: '$slate1',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
      }}
      align="center"
      justify="between"
    >
      <Box css={{ flex: 1 }}>
        <Flex align="center">
          <Link href={`/${routePrefix}`}>
            <Box css={{ width: 34, cursor: 'pointer' }}>
              <Image
                src="/dreamByt3Logo.svg"
                width={39}
                height={39}
                alt="DreamByt3"
              />
            </Box>
          </Link>
        </Flex>
      </Box>
      <Flex align="center" css={{ gap: '$3' }}>
        <MobileSearch key={`${router.asPath}-search`} />
        <CartButton />
        <HamburgerMenu key={`${router.asPath}-hamburger`} />
      </Flex>
    </Flex>
  ) : (
    <Flex
      css={{
        height: NAVBAR_HEIGHT,
        px: '$5',
        width: '100%',
        maxWidth: 1920,
        mx: 'auto',
        borderBottom: '1px solid $pinkA7',
        zIndex: 999,
        background: '$neutralBg',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
      }}
      align="center"
      justify="between"
    >
      <Flex align="center" justify="between" css={{ flex: 1 }}>
        <Flex align="center" css={{ borderRight: '1px solid $pinkA6'}} >
          <Link href={`/${routePrefix}`}>
            <Box css={{ width: 236, cursor: 'pointer' }}>
              <Image
                src="/logo-small.png"
                width={189}
                height={40}
                alt="DreamByt3"
              />
            </Box>
          </Link>
        </Flex>
        <Flex
          align="center"
          css={{
            gap: '$5',
            ml: '$2',
          }}
        >
          <Flex
            as={Link}
            href={`/${routePrefix}/collections/trending`}
            align="center"
            css={{
              height: 44,
              px: 24,
              borderRadius: 8,
              '&:hover': {
                backgroundColor: '$pinkA5'
              }
            }}
          >
            <NavItem>Explore</NavItem>
          </Flex>
        </Flex>
        <Flex justify="center" align="center" css={{ flex: 1, px: '$5'}}>
          <GlobalSearch
            ref={searchRef}
            placeholder="Search NFTs..."
            containerCss={{ width: '100%', maxWidth: 480, margin: 'auto', position: 'relative' }}
            key={router.asPath}
          />
        </Flex>
        <Flex css={{ gap: '$2', mr: 12 }}>
          <HoverCard.Root openDelay={200}>
            <HoverCard.Trigger>
              <Flex align="center" css={{ height: 44, px: 24, borderRadius: 8, '&:hover': { backgroundColor: '$pinkA5' }}}>
                <NavItem>
                  More
                </NavItem>
              </Flex>
            </HoverCard.Trigger>
            <HoverCard.Content sideOffset={19} align="center">
              <Card css={{
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                borderRadius: 0,
                backgroundColor: '$blackA12',
                border: '1px solid $pinkA5'
              }}>
                <Flex
                  as={Link}
                  href={`/swap`}
                  align="center"
                  css={{
                    px: 16,
                    height: 44,
                    borderBottom: '1px solid $pinkA5',
                    '&:hover': {
                      backgroundColor: '$pinkA5'
                    }
                  }}
                >
                  <NavItem
                    active={router.pathname.includes('swap')}
                  >
                    Buy DREAM
                  </NavItem>
                </Flex>
              </Card>
            </HoverCard.Content>
          </HoverCard.Root>
          {isConnected && (
            <Flex
              as={Link}
              href="/portfolio"
              align="center"
              css={{
                height: 44,
                px: 16,
                borderRadius: 8,
                '&:hover': {
                  backgroundColor: '$pinkA5'
                }
              }}
            >
              <NavItem>My Assets</NavItem>
            </Flex>
          )}
        </Flex>
      </Flex>

      <Flex css={{ gap: '$3' }} justify="end" align="center">
        {isConnected ? (
          <AccountSidebar />
        ) : (
          <Box css={{ maxWidth: '185px' }}>
            <ConnectWalletButton />
          </Box>
        )}
        <CartButton />
      </Flex>
    </Flex>
  )
}

export default Navbar

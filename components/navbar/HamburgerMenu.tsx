import * as RadixDialog from '@radix-ui/react-dialog'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBars,
  faXmark,
  faRightFromBracket,
  faChevronDown
} from '@fortawesome/free-solid-svg-icons'
import { faXTwitter, faDiscord } from '@fortawesome/free-brands-svg-icons'
import Link from 'next/link'
import Image from 'next/image'
import { useAccount, useDisconnect } from 'wagmi'
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon'

import { Anchor, Box, Button, Flex, Text } from 'components/primitives'
import { ConnectWalletButton } from 'components/ConnectWalletButton'
import { Avatar } from 'components/primitives/Avatar'
import {Collapsible} from "../primitives/Collapsible";
import { FullscreenModal } from 'components/common/FullscreenModal'
import Wallet from 'components/navbar/Wallet'
import {useENSResolver, useMarketplaceChain, useProfile} from 'hooks'

const HamburgerMenu = () => {
  const { address, isConnected } = useAccount()
  const {
    avatar: ensAvatar,
    shortAddress,
    shortName: shortEnsName,
  } = useENSResolver(address)
  const { data: profile } = useProfile(address)
  const { disconnect } = useDisconnect()
  const { routePrefix } = useMarketplaceChain()

  const trigger = (
    <Button
      css={{ justifyContent: 'center', width: '44px', height: '44px' }}
      type="button"
      size="small"
      color="gray3"
    >
      <FontAwesomeIcon icon={faBars} width={16} height={16} />
    </Button>
  )

  return (
    <FullscreenModal trigger={trigger}>
      <Flex
        css={{
          backgroundColor: '$gray3',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <Flex
          css={{
            py: '$4',
            px: '$4',
            width: '100%',
            borderBottom: '1px solid #F4A7BB',
          }}
          align="center"
          justify="between"
        >
          <Link href="/">
            <Box css={{ width: 46, cursor: 'pointer' }}>
              <Image
                src="/logo-compact.svg"
                width={36}
                height={36}
                alt="DreamByt3"
              />
            </Box>
          </Link>
          <RadixDialog.Close>
            <Flex
              css={{
                justifyContent: 'center',
                width: '44px',
                height: '44px',
                alignItems: 'center',
                borderRadius: 8,
                backgroundColor: '$gray3',
                color: '$gray12',
                '&:hover': {
                  backgroundColor: '#F4A7BB',
                },
              }}
            >
              <FontAwesomeIcon icon={faXmark} width={16} height={16} />
            </Flex>
          </RadixDialog.Close>
        </Flex>
        {isConnected ? (
          <Flex
            css={{
              flexDirection: 'column',
              justifyContent: 'flex-start',
              height: '100%',
              py: '$5',
              px: '$4',
            }}
          >
            <Link href={`/portfolio/${address}`} legacyBehavior>
              <Flex
                css={{
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  pb: '$4',
                }}
              >
                <Flex css={{ alignItems: 'center' }}>
                  {profile?.profileImage ? (
                    <img src={profile?.profileImage} style={{ width: 40, height: 40, borderRadius: '50%' }} />
                  ) : (ensAvatar ? (
                    <Avatar size="medium" src={ensAvatar} />
                  ) : (
                    <Jazzicon
                      diameter={36}
                      seed={jsNumberForAddress(address as string)}
                    />
                  ))}
                  <Text style="subtitle1" css={{ ml: '$2' }}>
                    {shortEnsName ? shortEnsName : shortAddress}
                  </Text>
                </Flex>
              </Flex>
            </Link>
            <Link href={`/${routePrefix}/collection-rankings`} legacyBehavior>
              <Text
                style="subtitle1"
                css={{
                  borderBottom: '1px solid #F4A7BB',
                  cursor: 'pointer',
                  pb: '$4',
                  pt: '24px',
                }}
              >
                Collections
              </Text>
            </Link>
            <Collapsible
              trigger={
                <Flex
                  justify="between"
                  css={{
                    width: '100%',
                    borderBottom: '1px solid #F4A7BB',
                    cursor: 'pointer',
                    pb: '$4',
                    pt: '24px',
                  }}
                >
                  <Text
                    style="subtitle1"
                    css={{
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {`Rewards`}
                  </Text>
                  <FontAwesomeIcon icon={faChevronDown} width={20} height={20}/>
                </Flex>
              }>
              <Flex
                direction="column"
                css={{
                  px: '$4'
                }}
              >
                <Link href="/swap" legacyBehavior>
                  <Text
                    style="subtitle1"
                    css={{
                      borderBottom: '1px solid #F4A7BB',
                      cursor: 'pointer',
                      pb: '$4',
                      pt: '24px',
                    }}
                  >
                    Buy DREAM
                  </Text>
                </Link>
                <Link href="/staking/pool" legacyBehavior>
                  <Text
                    style="subtitle1"
                    css={{
                      borderBottom: '1px solid #F4A7BB',
                      cursor: 'pointer',
                      pb: '$4',
                      pt: '24px',
                      alignItems: 'center',
                      display: 'flex'
                    }}
                  >
                    {`Get veDREAM`}
                  </Text>
                </Link>
                <Link href="/staking" legacyBehavior>
                  <Text
                    style="subtitle1"
                    css={{
                      borderBottom: '1px solid #F4A7BB',
                      cursor: 'pointer',
                      pb: '$4',
                      pt: '24px',
                      alignItems: 'center',
                      display: 'flex'
                    }}
                  >
                    {`Staking Rewards`}
                  </Text>
                </Link>
              </Flex>
            </Collapsible>
            <Collapsible
              trigger={
                <Flex
                  justify="between"
                  css={{
                    width: '100%',
                    borderBottom: '1px solid #F4A7BB',
                    cursor: 'pointer',
                    pb: '$4',
                    pt: '24px',
                  }}
                >
                  <Text
                    style="subtitle1"
                    css={{
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {`Airdrop`}
                  </Text>
                  <FontAwesomeIcon icon={faChevronDown} width={20} height={20}/>
                </Flex>
              }>
              <Flex
                direction="column"
                css={{
                  px: '$4'
                }}
              >
                <Link href="/leaderboard" legacyBehavior>
                  <Text
                    style="subtitle1"
                    css={{
                      borderBottom: '1px solid #F4A7BB',
                      cursor: 'pointer',
                      pb: '$4',
                      pt: '24px',
                    }}
                  >
                    Leaderboard
                  </Text>
                </Link>
              </Flex>
            </Collapsible>
            <Link href="/portfolio" legacyBehavior>
              <Flex
                direction="column"
                css={{
                  cursor: 'pointer',
                  pb: '$4',
                  pt: '24px',
                  gap: '$1',
                }}
              >
                <Text style="subtitle1">Portfolio</Text>
                <Text style="body3" color="subtle">
                  Manage your items, collections, listings and offers
                </Text>
              </Flex>
            </Link>
            <Wallet />
            <Link href="/portfolio/settings" legacyBehavior>
              <Flex
                align="center"
                css={{
                  gap: 20,
                  borderBottom: '1px solid #F4A7BB',
                  cursor: 'pointer',
                  pb: '$4',
                  pt: '24px',
                }}
              >
                <Text
                  style="subtitle1"
                >
                  Settings
                </Text>
              </Flex>
            </Link>
            <Flex
              css={{
                justifyContent: 'space-between',
                cursor: 'pointer',
                alignItems: 'center'
              }}
              onClick={() => disconnect()}
            >
              <Text
                style="subtitle1"
                css={{
                  pb: '$4',
                  pt: '24px',
                }}
              >
                Logout
              </Text>
              <Box css={{ color: '$gray10' }}>
                <FontAwesomeIcon
                  icon={faRightFromBracket}
                  width={16}
                  height={16}
                />
              </Box>
            </Flex>
          </Flex>
        ) : (
          <Flex
            direction="column"
            justify="between"
            css={{
              height: '100%',
              pb: '$5',
              px: '$4',
            }}
          >
            <Flex direction="column">
              <Link href={`/${routePrefix}/collection-rankings`} legacyBehavior>
                <Text
                  style="subtitle1"
                  css={{
                    borderBottom: '1px solid #F4A7BB',
                    cursor: 'pointer',
                    pb: '$4',
                    pt: '24px',
                    width: '100%',
                  }}
                >
                  Collections
                </Text>
              </Link>
              <Link href="/portfolio" legacyBehavior>
                <Text
                  style="subtitle1"
                  css={{
                    borderBottom: '1px solid #F4A7BB',
                    cursor: 'pointer',
                    pb: '$4',
                    pt: '24px',
                    width: '100%',
                  }}
                >
                  Portfolio
                </Text>
              </Link>
              <Collapsible
                trigger={
                  <Flex
                    justify="between"
                    css={{
                      width: '100%',
                      borderBottom: '1px solid #F4A7BB',
                      cursor: 'pointer',
                      pb: '$4',
                      pt: '24px',
                    }}
                  >
                    <Text
                      style="subtitle1"
                      css={{
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {`Rewards`}
                    </Text>
                    <FontAwesomeIcon icon={faChevronDown} width={20} height={20}/>
                  </Flex>
                }>
                <Flex
                  direction="column"
                  css={{
                    backgroundColor: '$gray2',
                    px: '$4'
                  }}
                >
                  <Link href="/swap" legacyBehavior>
                    <Text
                      style="subtitle1"
                      css={{
                        borderBottom: '1px solid #F4A7BB',
                        cursor: 'pointer',
                        pb: '$4',
                        pt: '24px',
                      }}
                    >
                      Buy DREAM
                    </Text>
                  </Link>
                  <Link href="/staking/pool" legacyBehavior>
                    <Text
                      style="subtitle1"
                      css={{
                        borderBottom: '1px solid #F4A7BB',
                        cursor: 'pointer',
                        pb: '$4',
                        pt: '24px',
                        alignItems: 'center',
                        display: 'flex'
                      }}
                    >
                      {`Get veDREAM`}
                    </Text>
                  </Link>
                  <Link href="/staking" legacyBehavior>
                    <Text
                      style="subtitle1"
                      css={{
                        borderBottom: '1px solid #F4A7BB',
                        cursor: 'pointer',
                        pb: '$4',
                        pt: '24px',
                        alignItems: 'center',
                        display: 'flex'
                      }}
                    >
                      {`Staking Rewards`}
                    </Text>
                  </Link>
                </Flex>
              </Collapsible>
            </Flex>
            <Box css={{ pt: 24 }}>
              <ConnectWalletButton />
            </Box>
          </Flex>
        )}
        <Flex
          css={{
            pt: '24px',
            pb: '$5',
            px: '$4',
            gap: '$4',
            width: '100%',
            borderTop: '1px solid #F4A7BB',
          }}
        >
          <a href="https://twitter.com/DreamByt3" target="_blank">
            <Button
              css={{ justifyContent: 'center', width: '44px', height: '44px' }}
              type="button"
              size="small"
              color="primary"
            >
              <FontAwesomeIcon icon={faXTwitter} width={20} height={20} />
            </Button>
          </a>
          <a href="https://discord.gg/ENKWhXFnHj" target="_blank">
            <Button
              css={{ justifyContent: 'center', width: '44px', height: '44px' }}
              type="button"
              size="small"
              color="primary"
            >
              <FontAwesomeIcon icon={faDiscord} width={20} height={20} />
            </Button>
          </a>
        </Flex>
      </Flex>
    </FullscreenModal>
  )
}

export default HamburgerMenu

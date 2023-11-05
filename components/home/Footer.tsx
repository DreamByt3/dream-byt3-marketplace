import { FC } from 'react'
import { Text, Box, Flex, Anchor, Button } from '../primitives'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDiscord, faXTwitter } from '@fortawesome/free-brands-svg-icons'

type SectionTitleProps = {
  title: string
}

const SectionTitle: FC<SectionTitleProps> = ({ title }) => (
  <Text style="subtitle1" css={{ color: '$gray12', mb: 8 }}>
    {title}
  </Text>
)

type SectionLinkProps = {
  name: string
  href: string
}

const SectionLink: FC<SectionLinkProps> = ({ name, href }) => (
  <Anchor
    target="_blank"
    rel="noopener noreferrer"
    href={href}
    weight="medium"
    css={{ fontSize: 14, mt: 16 }}
  >
    {name}
  </Anchor>
)

const developerSectionLinks = [
  {
    name: 'Docs',
    href: 'https://docs.dreambyt3.com',
  },
  {
    name: 'GitHub',
    href: 'https://github.com/DreamByt3',
  },
  {
    name: 'Medium',
    href: 'https://medium.com/@DreamByt3',
  },
  {
    name: 'CoinGecko',
    href: 'https://www.coingecko.com/en/coins/dream-marketplace',
  },
]

const companySectionLinks = [
  {
    name: 'Governance',
    href: 'https://snapshot.org/#/dreambyt3.eth',
  },
  {
    name: 'DREAM Contract Address: 0xEBcF2FbE20e7bBBD5232EB186B85c143d362074e',
    href: 'https://etherscan.io/token/0xEBcF2FbE20e7bBBD5232EB186B85c143d362074e',
  },
  {
    name: 'Contact Support: support@dreambyt3.com',
    href: 'mailto:support@dreambyt3.com',
  },
  {
    name: 'Terms',
    href: '/terms',
  },
  {
    name: 'Privacy',
    href: '/privacy',
  },
]

export const Footer = () => {
  return (
    <Flex
      justify="between"
      css={{
        borderTop: '1px solid #F4A7BB',
        borderStyle: 'solid',
        p: '$5',
        '@lg': {
          p: '$6',
        },
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 36,
        '@bp600': {
          flexDirection: 'row',
          gap: 0,
        },
      }}
    >
      <Flex css={{ gap: 80, '@bp600': { gap: 136 } }}>
        <Flex direction="column">
          <SectionTitle title="Resources" />
          {developerSectionLinks.map((props) => (
            <SectionLink key={props.name} {...props} />
          ))}
        </Flex>
        <Flex direction="column">
          <SectionTitle title="Protocol" />
          {companySectionLinks.map((props) => (
            <SectionLink key={props.name} {...props} />
          ))}
        </Flex>
      </Flex>
      <Flex
        direction="column"
        css={{ alignItems: 'flex-start', '@bp600': { alignItems: 'flex-end' } }}
      >
        <SectionTitle title="Community" />
        <Flex css={{ gap: '$4', mt: 16 }}>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://twitter.com/DreamByt3"
          >
            <Button size="xs" color="primary">
              <FontAwesomeIcon icon={faXTwitter} width={14} height={14} />
            </Button>
            </a>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://discord.gg/ENKWhXFnHj"
            aria-label="Discord"
          >
            <Button
              size="xs"
              color="primary"
              css={{
                '&:hover': {
                  background: 'primary',
                },
              }}
              aria-label="Discord"
            >
              <FontAwesomeIcon icon={faDiscord} width={14} height={14} />
            </Button>
          </a>
        </Flex>
      </Flex>
    </Flex>
  )
}

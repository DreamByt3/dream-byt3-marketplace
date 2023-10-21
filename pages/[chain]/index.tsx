import { NextPage, GetServerSideProps } from 'next'
import Link from 'next/link'
import {
  Text,
  Flex,
  Box,
  Button,
  FormatCryptoCurrency,
} from 'components/primitives'
import Layout from 'components/Layout'
import { motion, useViewportScroll, useTransform } from 'framer-motion'
import { paths } from '@reservoir0x/reservoir-sdk'
import { useContext, useEffect, useState } from 'react'
import { Footer } from 'components/home/Footer'
import {useENSResolver, useMarketplaceChain, useMounted} from 'hooks'
import supportedChains, { DefaultChain } from 'utils/chains'
import { Head } from 'components/Head'
import { ChainContext } from 'context/ChainContextProvider'

import Img from 'components/primitives/Img'
import useTopSellingCollections from 'hooks/useTopSellingCollections'
import ReactMarkdown from 'react-markdown'
import fetcher from 'utils/fetcher'
import { styled } from 'stitches.config'
import ChainToggle from 'components/common/ChainToggle'
import optimizeImage from 'utils/optimizeImage'
import { MarkdownLink } from 'components/primitives/MarkdownLink'
import { useRouter } from 'next/router'
import {FillTypeToggle} from "../../components/home/FillTypeToggle";
import {CollectionTopSellingTable} from "../../components/home/CollectionTopSellingTable";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import {useCollections} from "@reservoir0x/reservoir-kit-ui";
import {Avatar} from "../../components/primitives/Avatar";
import {formatNumber} from "../../utils/numbers";

const StyledImage = styled('img', {})

const Home: NextPage<any> = ({ ssr }) => {
  const isSSR = typeof window === 'undefined'
  const router = useRouter()
  const isMounted = useMounted()
  const marketplaceChain = useMarketplaceChain()
  const { chain } = useContext(ChainContext)
  const [fillType, setFillType] = useState<'sale' | 'any'>('sale')

  const { data: topSellingCollectionsData, isValidating, isLoading } = useTopSellingCollections(
    {
      period: '24h',
      fillType,
      includeRecentSales: true,
      limit: 10
    },
    {
      revalidateOnMount: true,
      refreshInterval: 300000,
      fallbackData: ssr.topSellingCollections[marketplaceChain.id]?.collections
        ? ssr.topSellingCollections[marketplaceChain.id]
        : null,
    },
    chain?.id
  )

  const { data: topMintingCollectionsData } = useTopSellingCollections(
    {
      period: '24h',
      limit: 12,
      fillType: 'mint',
    },
    {
      revalidateOnMount: true,
      refreshInterval: 300000,
      fallbackData: ssr.topMintingCollections[marketplaceChain.id]?.collections
        ? ssr.topMintingCollections[marketplaceChain.id]
        : null,
    },
    chain?.id
  )

  const { data: topCollections } = useCollections(
    {
      limit: 11,
      sortBy: '30DayVolume'
    },
    {
      fallbackData: ssr.topCollections?.[marketplaceChain.id]?.collections
    }
  )

  const topCollection = topCollections?.[0]

  const {
    avatar: ensAvatar,
    shortAddress,
    shortName: shortEnsName,
  } = useENSResolver(topCollection?.creator)

  const { scrollY } = useViewportScroll();

  const scale = useTransform(scrollY, [0, 500], [1, 1.2]);

  return (
    <Layout>
      <Head />
      <Box
        css={{
          p: 24,
          mt: -80,
          pt: 104,
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          '@bp800': {
            px: '$5',
          },
          '@xl': {
            px: '$6',
          },
        }}
      >
        <motion.div
          style={{
            scale: scale,
            position: 'absolute',
            top: 0,
            display: 'block',
            zIndex: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundSize: 'cover',
            backgroundImage: `url(${optimizeImage(topCollection?.banner, 1820)})`,
            backgroundPosition: 'center center',
            backgroundRepeat: 'no-repeat',
          }}
        >

        </motion.div>
        <Box
          css={{
            position: 'absolute',
            top: 0,
            display: 'block',
            zIndex: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backdropFilter: 'blur(2px)',
            backgroundColor: 'rgb(60,9,60, 0.4)',
            backgroundImage: 'linear-gradient(rgba(8, 4, 4, 0) 50%, rgb(8, 4, 4) 90.22%), linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2))',
          }}
        />
        <Flex>
          <Flex
            align="end"
            css={{
              minHeight: 540,
              flex: 1,
              overflow: 'hidden',
              position: 'relative',
              gap: '$5',
              p: '$4',
              '@md': {
                p: '$5',
                gap: '$4',
                flexDirection: 'column',
                display: 'flex',
              },
              '@lg': {
                flexDirection: 'row',
                p: '$5',
                gap: '$5',
                mt: '$4',
              },
              '@xl': {
                p: '$6',
                gap: '$6',
              },

              mb: '$6',
              maxWidth: 1820,
              mx: 'auto',
            }}
          >
            {topCollections && (
              <Box css={{ flex: 2, zIndex: 4 }}>
                <Flex direction="column" css={{ height: '100%', gap: 40 }}>
                  <Flex
                    justify="between"
                    css={{
                      width: '100%',
                    }}
                  >
                    <Box css={{ flex: 1 }}>
                      <Avatar size="large" src={topCollection?.image} />
                      <Text style="h3" css={{ mt: '$3' }} as="h3">
                        {topCollection?.name}
                      </Text>
                      <Flex css={{ mb: '$2', gap: 10 }}>
                        <Text style="subtitle1">
                          {`By`}
                        </Text>
                        <Text style="subtitle1">
                          {shortEnsName || shortAddress}
                        </Text>
                      </Flex>

                      <Box
                        css={{
                          maxWidth: 450,
                          lineHeight: 1.5,
                          fontSize: 16,
                          fontWeight: 400,
                          display: '-webkit-box',
                          color: '$gray12',
                          fontFamily: '$body',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        <ReactMarkdown
                          children={topCollection?.description || ''}
                          components={{
                            a: MarkdownLink,
                            p: Text as any,
                          }}
                        />
                      </Box>
                    </Box>
                    <Flex
                      align="end"
                    >
                      <Box css={{ mr: '$5' }}>
                        <Text style="subtitle2" color="subtle">
                          FLOOR
                        </Text>
                        <Box css={{ mt: 2 }}>
                          <FormatCryptoCurrency
                            amount={
                              topCollection?.floorAsk?.price?.amount
                                ?.native ?? 0
                            }
                            textStyle={'h4'}
                            logoHeight={20}
                            address={
                              topCollection?.floorAsk?.price?.currency
                                ?.contract
                            }
                          />
                        </Box>
                      </Box>

                      <Box css={{ mr: '$4' }}>
                        <Text style="subtitle2" color="subtle">
                          1D Volume
                        </Text>
                        <Text style="h4" as="h4" css={{ mt: 2 }}>
                          {formatNumber(topCollection?.volume?.["1day"], 2, true)}
                        </Text>
                      </Box>
                    </Flex>
                  </Flex>
                  <Flex
                    align="end"
                    justify="between"
                    css={{ gap: '$4' }}
                  >
                    <Button as={Link} color="primary" size="large" href={`/${chain.routePrefix}/collection/${topCollection?.id}`}>
                      View Collection
                    </Button>
                    {/*<Box*/}
                    {/*  css={{*/}
                    {/*    display: 'none',*/}
                    {/*    '@lg': {*/}
                    {/*      display: 'block',*/}
                    {/*    },*/}
                    {/*  }}*/}
                    {/*>*/}
                    {/*  <Text*/}
                    {/*    style="subtitle2"*/}
                    {/*    color="subtle"*/}
                    {/*    as="p"*/}
                    {/*    css={{ mt: '$4' }}*/}
                    {/*  >*/}
                    {/*    RECENT SALES*/}
                    {/*  </Text>*/}
                    {/*  <Flex*/}
                    {/*    css={{*/}
                    {/*      mt: '$2',*/}
                    {/*      gap: '$3',*/}
                    {/*    }}*/}
                    {/*  >*/}
                    {/*    {topCollection?.recentSales*/}
                    {/*      ?.slice(0, 4)*/}
                    {/*      ?.map((sale: any, i) => (*/}
                    {/*        <Box*/}
                    {/*          css={{*/}
                    {/*            aspectRatio: '1/1',*/}
                    {/*            maxWidth: 80,*/}
                    {/*          }}*/}
                    {/*          key={sale.token.id + sale.contract + i}*/}
                    {/*          onClick={(e) => {*/}
                    {/*            e.stopPropagation()*/}
                    {/*            e.preventDefault()*/}
                    {/*            router.push(*/}
                    {/*              `/${chain.routePrefix}/asset/${topCollection.primaryContract}:${sale.token.id}`*/}
                    {/*            )*/}
                    {/*          }}*/}
                    {/*        >*/}
                    {/*          <img*/}
                    {/*            style={{ borderRadius: 4 }}*/}
                    {/*            src={optimizeImage(*/}
                    {/*              sale?.token?.image ||*/}
                    {/*              topCollection?.image,*/}
                    {/*              250*/}
                    {/*            )}*/}
                    {/*          />*/}
                    {/*          <Box css={{ mt: '$1' }}>*/}
                    {/*            <FormatCryptoCurrency*/}
                    {/*              amount={sale?.price?.amount?.decimal ?? 0}*/}
                    {/*              textStyle={'h6'}*/}
                    {/*              logoHeight={16}*/}
                    {/*              address={sale?.price?.currency?.contract}*/}
                    {/*            />*/}
                    {/*          </Box>*/}
                    {/*        </Box>*/}
                    {/*      ))}*/}
                    {/*    <Box css={{ flex: 1 }} />*/}
                    {/*    <Box css={{ flex: 1 }} />*/}
                    {/*  </Flex>*/}
                    {/*</Box>*/}
                  </Flex>
                </Flex>
              </Box>
            )}
          </Flex>
        </Flex>
      </Box>
      <Box
        css={{
          py: 16,
          mt: 80,
          height: '100%',
          overflowX: 'auto',
          // '&::-webkit-scrollbar': {
          //   height: 2
          // },
          // '&::-webkit-scrollbar-track': {
          //   boxShadow: 'inset 0 0 1px grey',
          //   borderRadius: 1
          // },
          // '&::-webkit-scrollbar-thumb': {
          //   background: '$primary8',
          //   borderRadius: 1
          // },
          // '&::-webkit-scrollbar-thumb:hover': {
          //   background: '$primary9'
          // }
        }}
      >
        {(topCollections && topCollections.length) && (
          <Flex
            css={{
              gap: 20,
              width: 300 * topCollections.length
            }}
          >
            {topCollections
              .slice(1, 13)
              .map((collection) => {
                return (
                  <Box
                    as={Link}
                    href={`/${marketplaceChain.routePrefix}/collection/${collection.id}`}
                    key={`top-collection-${collection.id}`}
                    css={{
                      height: 200,
                      width: 360,
                      borderRadius: 8,
                      overflow: 'hidden',
                      position: 'relative',
                      border: '1px solid $primary9',
                      transition: 'transform 300ms ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-16px)',
                      },
                      '&:hover > img:nth-child(1)': {
                        transform: 'scale(1.075)',
                      },
                    }}
                  >
                    <img
                      loading="lazy"
                      src={optimizeImage(collection?.banner, 800)}
                      style={{
                        height: 200,
                        width: 360,
                        transition: 'transform 300ms ease-in-out',
                        objectFit: 'cover',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        zIndex: 0
                      }}
                      alt={collection?.name || '-'}
                    />
                    <Box
                      css={{
                        position: 'absolute',
                        top: 0,
                        display: 'block',
                        zIndex: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgb(60,9,60, 0.2)',
                        backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.5) 100%)',
                      }}
                    />
                    <Flex
                      direction="column"
                      justify="between"
                      align="start"
                      css={{
                        p: 16,
                        height: 200,
                        zIndex: 1,
                        position: 'relative'
                      }}
                    >
                      <Img
                        src={
                          optimizeImage(collection?.image, 50 * 2) as string
                        }
                        alt={collection?.name as string}
                        width={50}
                        height={50}
                        css={{
                          width: 50,
                          height: 50,
                          border: '1px solid rgba(255,255,255,0.6)',
                          borderRadius: 50,
                        }}
                      />
                      <Text style="h6" as="h5" ellipsify>
                        {collection?.name}
                      </Text>
                    </Flex>
                  </Box>
                )
              })}
          </Flex>
        )}
      </Box>
      <Box
        css={{
          p: 24,
          height: '100%',
          '@bp800': {
            px: '$5'
          },
          '@xl': {
            px: '$6',
          },
        }}
      >
        <Flex
          justify="center"
          align="center"
          css={{ flexWrap: 'wrap', mb: '$4', gap: '$3' }}
        >
          <ChainToggle />
        </Flex>
        <Flex
          css={{ mb: '$6', '@sm': { my: '$6' }, gap: 32 }}
          direction="column"
        >
          <Flex
            justify="between"
            align="center"
            css={{
              gap: '$2',
            }}
          >
            <FillTypeToggle fillType={fillType} setFillType={setFillType} />
          </Flex>
          <Flex direction="column" css={{ minHeight: 866 }}>
            {(isSSR || !isMounted || isLoading) ? (
              <Flex
                align="start"
                justify="center"
              >
                <LoadingSpinner />
              </Flex>
            ) : (
              <CollectionTopSellingTable
                key={`${chain.routePrefix}-top-collection`}
                topSellingCollections={topSellingCollectionsData?.collections}
                collections={topSellingCollectionsData}
                loading={isValidating}
                fillType={fillType}
              />
            )}
            <Flex justify="center" css={{ my: '$5' }}>
              <Link href={`/${marketplaceChain.routePrefix}/collections/trending`}>
                <Text style="subtitle1" color="primary">{`See More`}</Text>
              </Link>
            </Flex>
          </Flex>
        </Flex>
        <Flex
          justify="center"
          align="center"
          css={{ flexWrap: 'wrap', mb: '$4', mt: '$6', gap: '$3' }}
        >
          <Text style="h4" as="h4">
            Minting Now
          </Text>
          <ChainToggle />
        </Flex>
        <Box
          css={{
            pt: '$2',
            mb: '$4',
            display: 'grid',
            gap: '$4',
            maxWidth: 1400,
            mx: 'auto',
            gridTemplateColumns: 'repeat(1, 1fr)',
            '@sm': {
              gridTemplateColumns: 'repeat(2, 1fr)',
            },

            '@lg': {
              gridTemplateColumns: 'repeat(6, 1fr)',
            },
          }}
        >
          {topMintingCollectionsData?.collections &&
          topMintingCollectionsData.collections.length &&
          topMintingCollectionsData.collections
            .map((collection) => {
              return (
                <Link
                  key={collection.id}
                  href={`/${marketplaceChain.routePrefix}/collection/${collection.id}`}
                  style={{ display: 'grid' }}
                >
                  <Flex
                    direction="column"
                    css={{
                      flex: 1,
                      width: '100%',
                      borderRadius: 12,
                      cursor: 'pointer',
                      height: '100%',
                      background: '$neutralBgSubtle',
                      border: '2px solid transparent',
                      transition: 'border 0.5s',

                      overflow: 'hidden',
                      position: 'relative',
                      p: '$3',
                      '&:hover': {
                        border: '2px solid $primary10',
                      },
                      '&:hover > div > div> img:nth-child(1)': {
                        transform: 'scale(1.075)',
                      },
                    }}
                  >
                    <Flex
                      direction="column"
                      css={{
                        zIndex: 2,
                        position: 'relative',
                        flex: 1,
                        width: '100%',
                      }}
                    >
                      <Box
                        css={{
                          position: 'relative',
                          overflow: 'hidden',
                          borderRadius: 8,
                        }}
                      >
                        {collection?.banner?.length ||
                        collection.recentSales?.[0]?.token?.image?.length ? (
                          <img
                            loading="lazy"
                            src={optimizeImage(
                              collection?.banner ??
                              collection.recentSales?.[0]?.token?.image,
                              800
                            )}
                            style={{
                              transition: 'transform 300ms ease-in-out',
                              width: '100%',
                              borderRadius: 8,
                              height: 150,
                              objectFit: 'cover',
                            }}
                          />
                        ) : (
                          <Box
                            css={{
                              width: '100%',
                              borderRadius: 8,
                              height: 150,
                              background: '$gray3',
                            }}
                          />
                        )}
                        <Img
                          src={
                            optimizeImage(collection?.image, 72 * 2) as string
                          }
                          alt={collection?.name as string}
                          width={72}
                          height={72}
                          css={{
                            width: 72,
                            height: 72,
                            border: '1px solid rgba(255,255,255,0.6)',
                            position: 'absolute',
                            bottom: '$3',
                            left: '$3',
                            borderRadius: 8,
                          }}
                        />
                      </Box>
                      <Flex
                        css={{ my: '$4', mb: '$2' }}
                        justify="between"
                        align="center"
                      >
                        <Text style="h6" as="h5" ellipsify css={{ flex: 1 }}>
                          {collection?.name}
                        </Text>
                      </Flex>

                      <Flex css={{ mt: '$4' }}>
                        <Box css={{ mr: '$5' }}>
                          <Text
                            style="subtitle3"
                            color="subtle"
                            as="p"
                            css={{ mb: 2 }}
                          >
                            FLOOR
                          </Text>
                          <FormatCryptoCurrency
                            amount={
                              collection?.floorAsk?.price?.amount?.native ?? 0
                            }
                            textStyle={'subtitle3'}
                            logoHeight={12}
                            address={
                              collection?.floorAsk?.price?.currency?.contract
                            }
                          />
                        </Box>

                        <Box css={{ mr: '$4' }}>
                          <Text style="subtitle3" color="subtle" as="p">
                            24H SALES
                          </Text>
                          <Text style="subtitle3" as="h4" css={{ mt: 2 }}>
                            {collection.count?.toLocaleString()}
                          </Text>
                        </Box>
                      </Flex>
                    </Flex>
                  </Flex>
                </Link>
              )
            })}
        </Box>
      </Box>

      <Flex
        direction="column"
        justify="center"
        align="center"
        css={{
          maxWidth: 1200,
          mx: 'auto',
          py: 80,
          '@md': {
            py: 120
          }
        }}
      >
        <Text
          style={{
            '@initial': 'h6',
            '@md': 'h4'
          }}
          css={{
            mb: 40
          }}
        >Sustainable NFT Marketplace</Text>
        <Flex
          justify="center"
        >
          <StyledImage src="/logo.png" height={95} width={600} css={{ maxWidth: '80%' }} />
        </Flex>
      </Flex>
      <Footer />
    </Layout>
  )
}

type TopSellingCollectionsSchema =
  paths['/collections/top-selling/v1']['get']['responses']['200']['schema']

type CollectionSchema =
  paths['/collections/v7']['get']['responses']['200']['schema']

type ChainTopCollections = Record<string, CollectionSchema>
type ChainTopSellingCollections = Record<string, TopSellingCollectionsSchema>

export const getServerSideProps: GetServerSideProps<{
  ssr: {
    topSellingCollections: ChainTopSellingCollections,
    topMintingCollections: ChainTopSellingCollections,
    topCollections: ChainTopCollections
  }
}> = async ({ params, res }) => {
  const chainPrefix = params?.chain || ''
  const chain =
    supportedChains.find((chain) => chain.routePrefix === chainPrefix) ||
    DefaultChain
  let topCollectionsQuery: paths['/collections/v7']['get']['parameters']['query'] =
    {
      sortBy: '30DayVolume',
      limit: 11
    }

  let topSellingCollectionsQuery: paths['/collections/top-selling/v2']['get']['parameters']['query'] =
    {
      period: '24h',
      fillType: 'sale',
      limit: 10,
      includeRecentSales: true,
    }

  let topMintingCollectionsQuery: paths['/collections/top-selling/v2']['get']['parameters']['query'] =
    {
      period: '24h',
      fillType: 'mint',
      limit: 12
    }

  const topCollections: ChainTopCollections = {}
  const topSellingCollections: ChainTopSellingCollections = {}
  const topMintingCollections: ChainTopSellingCollections = {}
  try {
    const response = await fetcher(
      `${chain.reservoirBaseUrl}/collections/v7`,
      topCollectionsQuery,
      {
        headers: {
          'x-api-key': process.env.RESERVOIR_API_KEY || '',
        },
      }
    )

    const response2 = await fetcher(
      `${chain.reservoirBaseUrl}/collections/top-selling/v2`,
      topSellingCollectionsQuery,
      {
        headers: {
          'x-api-key': process.env.RESERVOIR_API_KEY || '',
        },
      }
    )

    const response3 = await fetcher(
      `${chain.reservoirBaseUrl}/collections/top-selling/v2`,
      topMintingCollectionsQuery,
      {
        headers: {
          'x-api-key': process.env.RESERVOIR_API_KEY || '',
        },
      }
    )

    topCollections[chain.id] = response.data
    topSellingCollections[chain.id] = response2.data
    topMintingCollections[chain.id] = response3.data

    res.setHeader(
      'Cache-Control',
      'public, s-maxage=120, stale-while-revalidate=180'
    )
  } catch (e) {}

  return {
    props: { ssr: { topCollections, topSellingCollections, topMintingCollections } },
  }
}

export default Home

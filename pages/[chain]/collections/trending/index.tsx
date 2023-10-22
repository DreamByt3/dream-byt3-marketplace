import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from 'next'
import {Text, Flex, Box, MarkdownLink, FormatCryptoCurrency, Button} from 'components/primitives'
import Layout from 'components/Layout'
import {
  ComponentPropsWithoutRef,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useMediaQuery } from 'react-responsive'
import {useENSResolver, useMounted} from 'hooks'
import { paths } from '@reservoir0x/reservoir-sdk'
import { useCollections } from '@reservoir0x/reservoir-kit-ui'
import fetcher from 'utils/fetcher'
import { NORMALIZE_ROYALTIES } from '../../../_app'
import supportedChains, { DefaultChain } from 'utils/chains'
import { CollectionRankingsTable } from 'components/rankings/CollectionRankingsTable'
import { useIntersectionObserver } from 'usehooks-ts'
import LoadingSpinner from 'components/common/LoadingSpinner'
import CollectionsTimeDropdown, {
  CollectionsSortingOption,
} from 'components/common/CollectionsTimeDropdown'
import ChainToggle from 'components/common/ChainToggle'
import { Head } from 'components/Head'
import { ChainContext } from 'context/ChainContextProvider'
import { useRouter } from 'next/router'
import {motion, useTransform, useViewportScroll} from "framer-motion";
import optimizeImage from "../../../../utils/optimizeImage";
import {Avatar} from "../../../../components/primitives/Avatar";
import ReactMarkdown from "react-markdown";
import {formatNumber} from "../../../../utils/numbers";
import Link from "next/link";

type Props = InferGetServerSidePropsType<typeof getServerSideProps>

const TrendingPage: NextPage<Props> = ({ ssr }) => {
  const router = useRouter()
  const isSSR = typeof window === 'undefined'
  const isMounted = useMounted()
  const compactToggleNames = useMediaQuery({ query: '(max-width: 800px)' })
  const [bannerIndex, setBannerIndex] = useState(Math.round(Math.random() * (ssr?.collection?.collections?.length || 0)))
  const [sortByTime, setSortByTime] =
    useState<CollectionsSortingOption>('1DayVolume')

  let collectionQuery: Parameters<typeof useCollections>['0'] = {
    limit: 20,
    sortBy: sortByTime,
  }

  const { chain, switchCurrentChain } = useContext(ChainContext)

  useEffect(() => {
    if (router.query.chain) {
      let chainIndex: number | undefined
      for (let i = 0; i < supportedChains.length; i++) {
        if (supportedChains[i].routePrefix == router.query.chain) {
          chainIndex = supportedChains[i].id
        }
      }
      if (chainIndex !== -1 && chainIndex) {
        switchCurrentChain(chainIndex)
      }
    }
  }, [router.query])

  if (chain.collectionSetId) {
    collectionQuery.collectionsSetId = chain.collectionSetId
  } else if (chain.community) {
    collectionQuery.community = chain.community
  }

  const { data, fetchNextPage, isFetchingPage, isValidating } = useCollections(
    collectionQuery,
    {
      fallbackData: [ssr?.collection],
    }
  )

  useEffect(() => {
    setBannerIndex(Math.round(Math.random() * (ssr?.collection?.collections?.length || 0)))
  }, [ssr.collection])

  let collections = data || []

  const loadMoreRef = useRef<HTMLDivElement>(null)
  const loadMoreObserver = useIntersectionObserver(loadMoreRef, {})

  useEffect(() => {
    let isVisible = !!loadMoreObserver?.isIntersecting
    if (isVisible && collections.length < 100) {
      fetchNextPage()
    }
  }, [loadMoreObserver?.isIntersecting])

  let volumeKey: ComponentPropsWithoutRef<
    typeof CollectionRankingsTable
  >['volumeKey'] = 'allTime'

  switch (sortByTime) {
    case '1DayVolume':
      volumeKey = '1day'
      break
    case '7DayVolume':
      volumeKey = '7day'
      break
    case '30DayVolume':
      volumeKey = '30day'
      break
  }


  const topCollection = collections?.[bannerIndex]

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
      {isMounted && (
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
              backgroundColor: 'rgb(60,9,60, 0.2)',
              backgroundImage: 'linear-gradient(rgba(8, 4, 4, 0) 50%, rgb(8, 4, 4) 90.22%), linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2))',
            }}
          />
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
              maxWidth: 1820,
              mx: 'auto',
            }}
          >
            {collections && (
              <Box css={{ flex: 2, zIndex: 4 }}>
                <Flex direction="column" css={{ height: '100%', gap: 40 }}>
                  <Flex
                    justify="between"
                    css={{
                      width: '100%',
                      flexDirection: 'column',
                      gap: 20,
                      '@md': {
                        flexDirection: 'row',
                      }
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
        </Box>
      )}
      <Box
        css={{
          p: 24,
          height: '100%',
          '@bp800': {
            p: '$5',
          },

          '@xl': {
            px: '$6',
          },
        }}
      >
        <Flex direction="column">
          <Flex
            justify="between"
            align="start"
            css={{
              flexDirection: 'column',
              gap: 24,
              mb: '$4',
              '@bp800': {
                alignItems: 'center',
                flexDirection: 'row',
              },
            }}
          >
            <Text style="h4" as="h4">
              Explore
            </Text>
            <Flex align="center" css={{ gap: '$4' }}>
              <CollectionsTimeDropdown
                compact={compactToggleNames && isMounted}
                option={sortByTime}
                onOptionSelected={(option) => {
                  setSortByTime(option)
                }}
              />
              <ChainToggle />
            </Flex>
          </Flex>
          {isSSR || !isMounted ? null : (
            <CollectionRankingsTable
              collections={collections}
              volumeKey={volumeKey}
              loading={isValidating}
            />
          )}
          <Box
            ref={loadMoreRef}
            css={{
              display: isFetchingPage ? 'none' : 'block',
            }}
          />
        </Flex>
        {(isFetchingPage || isValidating) && (
          <Flex align="center" justify="center" css={{ py: '$4' }}>
            <LoadingSpinner />
          </Flex>
        )}
      </Box>
    </Layout>
  )
}

type CollectionSchema =
  paths['/collections/v7']['get']['responses']['200']['schema']

export const getServerSideProps: GetServerSideProps<{
  ssr: {
    collection: CollectionSchema
  }
}> = async ({ res, params }) => {
  const collectionQuery: paths['/collections/v7']['get']['parameters']['query'] =
    {
      sortBy: '1DayVolume',
      normalizeRoyalties: NORMALIZE_ROYALTIES,
      limit: 20,
    }
  const chainPrefix = params?.chain || ''
  const chain =
    supportedChains.find((chain) => chain.routePrefix === chainPrefix) ||
    DefaultChain
  const query = { ...collectionQuery }
  if (chain.collectionSetId) {
    query.collectionsSetId = chain.collectionSetId
  } else if (chain.community) {
    query.community = chain.community
  }
  const response = await fetcher(
    `${chain.reservoirBaseUrl}/collections/v7`,
    query,
    {
      headers: {
        'x-api-key': process.env.RESERVOIR_API_KEY || '',
      },
    }
  )

  res.setHeader(
    'Cache-Control',
    'public, s-maxage=30, stale-while-revalidate=60'
  )

  return {
    props: { ssr: { collection: response.data } },
  }
}

export default TrendingPage

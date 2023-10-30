import Layout from "../components/Layout";
import {Box, Flex, Text} from "../components/primitives";
import {Footer} from "../components/home/Footer";
import useSWR from "swr";
import {useLeaderboard, useMounted, useTimeSince} from "../hooks";
import LoadingSpinner from "../components/common/LoadingSpinner";
import {useEffect, useRef} from "react";
import {useIntersectionObserver} from "usehooks-ts";
import useTranchesHistory from "../hooks/useTranchesHistory";

const TranchesPage = () => {
  const isMounted = useMounted()
  const loadMoreRef = useRef<HTMLDivElement | null>(null)
  const loadMoreObserver = useIntersectionObserver(loadMoreRef, {})
  const {
    data: historyData,
    isValidating,
    isFetchingPage,
    fetchNextPage
  } = useTranchesHistory({
    limit: 20
  }, {
    revalidateFirstPage: true,
    revalidateOnFocus: true,
    refreshInterval: 5000
  })

  useEffect(() => {
    const isVisible = !!loadMoreObserver?.isIntersecting
    if (isVisible) {
      fetchNextPage()
    }
  }, [loadMoreObserver?.isIntersecting, isFetchingPage])

  const { data, isLoading } = useSWR( isMounted ? `/api/autotransfer` : null,
    (url: string) => {
      if (!isMounted) {
        return null
      }
      return fetch(url).then((response) => response.json())
    },
    {
      revalidateOnFocus: true,
      revalidateIfStale: true,
      revalidateOnReconnect: true,
      refreshInterval: 2000,
    }
  )

  const lastTime = useTimeSince(Math.round(parseInt(data?.lastExecuted) / 1000))

  if (!isMounted) {
    return null
  }

  return (
    <Layout>
      <Box
        css={{
          p: 24,
          height: '100%',
          '@bp800': {
            p: '$6',
          },
        }}
      >
        <Flex align="center" css={{ mb: 20 }}>
          <Text style="h2">Tranches</Text>
        </Flex>
        <Flex
          css={{
            flexDirection: 'column',
            '@md': {
              flexDirection: 'row'
            },
            gap: 32,
            mb: 100
          }}
        >
          <Flex direction="column" css={{ gap: 16, px: 16 }}>
            <Text style="subtitle1">{`Source Target : ${data?.watching}`}</Text>
            <Text style="subtitle1">{`Transfer Target : ${data?.target}`}</Text>
            <Text style="subtitle1">{`Last Execution : ${lastTime}`}</Text>
            <Text style="subtitle1">{`Last Tx Value : ${data?.lastTransfer}`}</Text>
            <Text style="subtitle1">{`Total Transferred : ${data?.total || 0}/3 WETH`}</Text>
            {isLoading && (<LoadingSpinner />)}
          </Flex>
          <Flex direction="column" css={{ gap: 16, borderLeft: '1px solid $primary7', px: 16, width: '100%'}}>
            <Text style="subtitle1">Transactions</Text>
            <Flex
              direction="column"
              css={{
                height: 400,
                overflowY: 'auto',
                backgroundColor: '$gray3',
                p: 16
              }}
            >
              {(historyData && !!historyData.length) && (
                <>
                  {historyData.map(d => (
                    <Flex key={`tx-${d.txHash}`}>
                      <Text>{`timestamp : ${d.time}`}</Text>
                      <Text>{`value : ${d.value}`}</Text>
                      <Text>{`txHash : ${d.txHash}`}</Text>
                    </Flex>
                  ))}
                  <Box ref={loadMoreRef} css={{ height: 20 }}/>
                </>
              )}
              {!historyData?.length && (
                <Text>No Transactions Yet</Text>
              )}
            </Flex>
          </Flex>
        </Flex>
        <Footer />
      </Box>
    </Layout>
  )
}

export default TranchesPage;

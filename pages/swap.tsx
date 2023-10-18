import {useContext, useEffect, useState} from "react";
import {useAccount, useSwitchNetwork} from "wagmi";
import {Web3Provider} from "@ethersproject/providers";
import uniswapToken from '@uniswap/default-token-list'
import {useConnectModal} from "@rainbow-me/rainbowkit";
import { SwapWidget, darkTheme, AddEthereumChainParameter } from '@nftearth/uniswap-widgets'
import '@nftearth/uniswap-widgets/fonts.css'

import { Footer } from "components/home/Footer";
import Layout from "../components/Layout";
import {Box, Flex} from "../components/primitives";
import {useMarketplaceChain, useMounted} from "../hooks";
import {ToastContext} from "../context/ToastContextProvider";
import {parseError} from "../utils/error";
import {mainnet} from "viem/chains";
import ChainToggle from "../components/common/ChainToggle";
import AlertChainSwitch from "../components/common/AlertChainSwitch";
import dreamContracts from "../utils/dreamContracts";

const nfteTokens = [
  {
    chainId: 1,
    address: '0xEBcF2FbE20e7bBBD5232EB186B85c143d362074e',
    name: 'Dream',
    symbol: 'DREAM',
    decimals: 18,
    logoURI: 'https://i.ibb.co/WxLZMjj/DB-Token-Logo-1.png'
  }
]

const allowedTokenSymbols = ['ETH', 'DREAM']

const SwapPage = () => {
  const mounted = useMounted()
  const { openConnectModal } = useConnectModal()
  const { addToast } = useContext(ToastContext)
  const marketplaceChain = useMarketplaceChain()
  const { switchNetworkAsync } = useSwitchNetwork({
    chainId: marketplaceChain.id,
  })
  const chain = mainnet
  const tokenList = [...uniswapToken.tokens, ...nfteTokens]
    .filter((token) => token.chainId === (marketplaceChain?.id || 1) && allowedTokenSymbols.includes(token.symbol))
  const [provider, setProvider] = useState<Web3Provider | undefined>()
  const { connector, isConnected } = useAccount()
  useEffect(() => {
    if (!connector) {
      return () => setProvider(undefined)
    }

    connector.getProvider({
      chainId: marketplaceChain.id,
    }).then((provider) => {
      setProvider(new Web3Provider(provider, marketplaceChain.id))
    })
  }, [connector, marketplaceChain.id])


  return (
    <Layout>
      <AlertChainSwitch chainId={marketplaceChain.id}/>
      <Box
        css={{
          p: 24,
          height: '100%',
          '@bp800': {
            p: '$6',
          },
        }}
      >
        <Flex
          direction="column"
          css={{
            pb: 200,
            pt: 100,
            gap: 40,
            alignItems: 'center',
            '@md': {
              mx: 20,
            }
          }}
        >
          <ChainToggle />
          {mounted && (
            <SwapWidget
              permit2
              hideConnectionUI={isConnected}
              tokenList={tokenList}
              brandedFooter={false}
              onSwitchChain={(params: AddEthereumChainParameter) => {
                switchNetworkAsync?.(+params.chainId)
              }}
              defaultOutputTokenAddress={[dreamContracts[chain.id]]}
              onConnectWalletClick={() => openConnectModal?.()}
              provider={provider}
              onError={(error: any) => {
                const { name, message } = parseError(error)
                addToast?.({
                  title: name,
                  status: 'error',
                  description: message
                })
              }}
              theme={{
                ...darkTheme,
                container: 'hsl(240,2%,11%)',
                module: 'hsl(220,4%,16%)',
                accent: '#f14e9a',
                accentSoft: '#f4a7bb',
                interactive: '#542947',
                outline: '#261b1d',
                dialog: '#000',
                scrim: 'hsla(224, 33%, 16%, 0.5)',

                // text
                onAccent: '#fff',
                primary: '#fff',
                secondary: 'hsl(227, 21%, 67%)',
                hint: '#832a7a',
                onInteractive: '#fff',

                deepShadow: 'hsla(0, 0%, 0%, 0.32), hsla(0, 0%, 0%, 0.24), hsla(0, 0%, 0%, 0.24)',
                networkDefaultShadow: '#000',
              }}
            />
          )}
        </Flex>
        <Footer />
      </Box>
    </Layout>
  )
}

export default SwapPage
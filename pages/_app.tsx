import nProgress from 'nprogress'
import { Router } from 'next/router'
import { Inter } from '@next/font/google'
import type { AppContext, AppProps } from 'next/app'
import { default as NextApp } from 'next/app'
import { globalReset } from 'stitches.config'
import '@rainbow-me/rainbowkit/styles.css'
import 'nprogress/nprogress.css'
import {
  RainbowKitProvider,
  getDefaultWallets,
  darkTheme as rainbowDarkTheme,
} from '@rainbow-me/rainbowkit'
import { WagmiConfig, createConfig, configureChains } from 'wagmi'
import {SessionProvider} from 'next-auth/react'
import * as Tooltip from '@radix-ui/react-tooltip'
import { publicProvider } from 'wagmi/providers/public'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { Analytics } from '@vercel/analytics/react';
import {
  ReservoirKitProvider,
  darkTheme as reservoirDarkTheme,
  CartProvider,
} from '@reservoir0x/reservoir-kit-ui'
import { FC, useContext } from 'react'
import { HotkeysProvider } from 'react-hotkeys-hook'
import ToastContextProvider from 'context/ToastContextProvider'
import supportedChains from 'utils/chains'
import { useMarketplaceChain } from 'hooks'
import ChainContextProvider from 'context/ChainContextProvider'
import { WebsocketContextProvider } from 'context/WebsocketContextProvider'
import ReferralContextProvider, {
  ReferralContext,
} from 'context/ReferralContextProvider'
import {useTheme} from "next-themes";


//CONFIGURABLE: Use nextjs to load your own custom font: https://nextjs.org/docs/basic-features/font-optimization
const inter = Inter({
  subsets: ['latin'],
})

export const NORMALIZE_ROYALTIES = process.env.NEXT_PUBLIC_NORMALIZE_ROYALTIES
  ? process.env.NEXT_PUBLIC_NORMALIZE_ROYALTIES === 'true'
  : false

const WALLET_CONNECT_PROJECT_ID =
  process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || ''

const { chains, publicClient } = configureChains(supportedChains, [
  alchemyProvider({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_ID || '' }),
  publicProvider(),
])

const { connectors } = getDefaultWallets({
  appName: 'DreamByt3',
  projectId: WALLET_CONNECT_PROJECT_ID,
  chains,
})

const wagmiClient = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
})

//CONFIGURABLE: Here you can override any of the theme tokens provided by RK: https://docs.reservoir.tools/docs/reservoir-kit-theming-and-customization
const reservoirKitThemeOverrides = {
  headlineFont: inter.style.fontFamily,
  font: inter.style.fontFamily,
  buttonTextColor: '#000',
  buttonTextHoverColor: '#000',
  primaryColor: '#f4a7bb',
  primaryHoverColor: '#f4a7bb',
}

nProgress.configure({
  showSpinner: false,
})

Router.events.on("routeChangeStart", nProgress.start);
Router.events.on("routeChangeError", nProgress.done);
Router.events.on("routeChangeComplete", nProgress.done);

function AppWrapper(props: AppProps & { baseUrl: string }) {
  return (
    <WagmiConfig config={wagmiClient}>
      <SessionProvider>
        <ChainContextProvider>
          <ReferralContextProvider>
            <MyApp {...props} />
            <Analytics />
          </ReferralContextProvider>
        </ChainContextProvider>
      </SessionProvider>
    </WagmiConfig>
  )
}

function MyApp({
  Component,
  pageProps,
  baseUrl,
}: AppProps & { baseUrl: string }) {
  globalReset()

  const marketplaceChain = useMarketplaceChain()
  const { feesOnTop } = useContext(ReferralContext)

  const FunctionalComponent = Component as FC

  let source = process.env.NEXT_PUBLIC_MARKETPLACE_SOURCE

  if (!source && process.env.NEXT_PUBLIC_HOST_URL) {
    try {
      const url = new URL(process.env.NEXT_PUBLIC_HOST_URL)
      source = url.host
    } catch (e) {}
  }

  return (
    <HotkeysProvider>
      <ReservoirKitProvider
        options={{
          // Reservoir API key which you can generate at https://reservoir.tools/
          // This is a protected key and displays as 'undefined' on the browser
          // DO NOT add NEXT_PUBLIC to the key or you'll risk leaking it on the browser
          apiKey: process.env.RESERVOIR_API_KEY,
          //CONFIGURABLE: Override any configuration available in RK: https://docs.reservoir.tools/docs/reservoirkit-ui#configuring-reservoirkit-ui
          // Note that you should at the very least configure the source with your own domain
          chains: supportedChains.map(
            ({ reservoirBaseUrl, proxyApi, id, name }) => {
              return {
                id,
                name,
                baseApiUrl: proxyApi
                  ? `${baseUrl}${proxyApi}`
                  : reservoirBaseUrl,
                active: marketplaceChain.id === id,
              }
            }
          ),
          logLevel: 4,
          source: source,
          normalizeRoyalties: NORMALIZE_ROYALTIES,
          disablePoweredByReservoir: true,
          //CONFIGURABLE: Set your marketplace fee and recipient, (fee is in BPS)
          // Note that this impacts orders created on your marketplace (offers/listings)
          // marketplaceFee: 250,
          marketplaceFees: ["0x694D91c4cBF877b95059c82F4006b79cdA55b4dd:100"]
        }}
        theme={reservoirDarkTheme(reservoirKitThemeOverrides)}
      >
        <CartProvider feesOnTopBps={feesOnTop}>
          <WebsocketContextProvider>
            <Tooltip.Provider>
              <RainbowKitProvider
                chains={chains}
                theme={rainbowDarkTheme({
                  borderRadius: 'small',
                })}
                modalSize="compact"
              >
                <ToastContextProvider>
                  <FunctionalComponent {...pageProps} />
                </ToastContextProvider>
              </RainbowKitProvider>
            </Tooltip.Provider>
          </WebsocketContextProvider>
        </CartProvider>
      </ReservoirKitProvider>
    </HotkeysProvider>
  )
}

AppWrapper.getInitialProps = async (appContext: AppContext) => {
  // calls page's `getInitialProps` and fills `appProps.pageProps`
  const appProps = await NextApp.getInitialProps(appContext)
  let baseUrl = ''

  if (appContext.ctx.req?.headers.host) {
    const host = appContext.ctx.req?.headers.host
    baseUrl = `${host.includes('localhost') ? 'http' : 'https'}://${host}`
  } else if (process.env.NEXT_PUBLIC_HOST_URL) {
    baseUrl = process.env.NEXT_PUBLIC_HOST_URL || ''
  }
  baseUrl = baseUrl.replace(/\/$/, '')

  return { ...appProps, baseUrl }
}

export default AppWrapper

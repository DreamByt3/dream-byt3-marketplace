import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentContext,
} from 'next/document'
import { getCssText } from '../stitches.config'

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }

  render() {
    return (
      <Html>
        <Head>
          <style
            id="stitches"
            dangerouslySetInnerHTML={{ __html: getCssText() }}
          />
        </Head>

        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        {/* Meta tags */}
        <meta name="keywords" content="nft, ethereum, protocol" />
        <meta name="keywords" content="NFT, API, Protocol" />

        {/* Favicon */}
        <link
          rel="shortcut icon"
          type="image/png"
          href="https://i.ibb.co/WxLZMjj/DB-Token-Logo-1.png"
        />

        {/* DreamByt3 meta tags */}
        <meta property="reservoir:title" content="DreamByt3" />
        <meta property="reservoir:icon" content="/dreambyt3-source-icon.png" />
        <meta
          property="reservoir:token-url-mainnet"
          content="/ethereum/asset/${contract}:${tokenId}"
        />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument

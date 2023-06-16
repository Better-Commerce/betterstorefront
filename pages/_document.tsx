import { CURRENT_THEME } from '@components/utils/constants'
import NextDocument, { Html, Head, Main, NextScript } from 'next/document'
import Script from 'next/script'

export default class MyDocument extends NextDocument /*Document*/ {
  static async getInitialProps(ctx: any) {
    const initialProps = await NextDocument.getInitialProps(ctx)
    return { ...initialProps }
  }

  render() {
    return (
      <Html>
        <Head></Head>
        <body className="custom_class">
          <Main />
          <NextScript />
          <link
            rel="stylesheet"
            href={`/theme/${CURRENT_THEME}/css/base.css`}
          />
          <link
            rel="stylesheet"
            href={`/theme/${CURRENT_THEME}/css/global.css`}
          />
          <Script
            src="https://engage-asset.bettercommerce.io/_plugins/min/bc/v1/js/ch.js"
            strategy="beforeInteractive"
          />
        </body>
      </Html>
    )
  }
}

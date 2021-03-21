import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }

  render() {
    return (
      <Html>
      <Head>
      <script src="https://aframe.io/releases/0.9.2/aframe.min.js"></script>
  <script src="https://raw.githack.com/AR-js-org/AR.js/master/aframe/build/aframe-ar-nft.js"></script>
      </Head>
       <body>

          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
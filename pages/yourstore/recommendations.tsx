import LayoutAccount from "@components/Layout/LayoutAccount";
import BrowsingHistoryProducts from "@components/Product/RelatedProducts/BrowsingHistory";
import { SITE_ORIGIN_URL } from "@components/utils/constants";
import withDataLayer, { PAGE_TYPES } from "@components/withDataLayer";
import NextHead from 'next/head'
import { useRouter } from "next/router";
const PAGE_TYPE = PAGE_TYPES.YourStore
function Recommendations({ deviceInfo, config }: any) {
  const router = useRouter()
  return (
    <>
      <NextHead>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <link rel="canonical" id="canonical" href={SITE_ORIGIN_URL + router.asPath} />
        <title>Recommended For You</title>
        <meta name="title" content="Recommended For You" />
        <meta name="description" content="Recommended For You" />
        <meta name="keywords" content="Recommended For You" />
        <meta property="og:image" content="Recommended For You" />
        <meta property="og:title" content="Recommended For You" key="ogtitle" />
        <meta property="og:description" content="Recommended For You" key="ogdesc" />
      </NextHead>
      <div className="container py-6 mx-auto cart-recently-viewed sm:py-10">
        <BrowsingHistoryProducts deviceInfo={deviceInfo} config={config} productPerRow={4} />
      </div>
    </>
  )
}
Recommendations.LayoutAccount = LayoutAccount
export default withDataLayer(Recommendations, PAGE_TYPE, true, LayoutAccount)

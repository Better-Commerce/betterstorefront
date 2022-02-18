import type { GetStaticPathsContext, GetStaticPropsContext } from 'next'
import getLookbooks from '@framework/api/content/lookbook'
import getSingleLookbook from '@framework/api/content/singleLookbook'
import { useRouter } from 'next/router'
import withDataLayer, { PAGE_TYPES } from '@components/withDataLayer'
import { Layout } from '@components/common'
import ProductGrid from '@components/product/Grid'
import { useUI } from '@components/ui/context'
import axios from 'axios'
import {
  NEXT_BULK_ADD_TO_CART,
  NEXT_GET_SINGLE_LOOKBOOK,
} from '@components/utils/constants'
import { useEffect, useState } from 'react'
import { EVENTS_MAP } from '@components/services/analytics/constants'
import useAnalytics from '@components/services/analytics/useAnalytics'
function LookbookDetailPage({ data, slug }: any) {
  const router = useRouter()
  const { basketId, openCart, setCartItems } = useUI()
  const [products, setProducts] = useState(data.products)
  const loadProducts = async () => {
    const response: any = await axios.post(NEXT_GET_SINGLE_LOOKBOOK, { slug })
    setProducts(response.data.products)
  }

  const { PageViewed } = EVENTS_MAP.EVENT_TYPES

  useAnalytics(PageViewed, {
    eventType: PageViewed,
    pageCategory: 'Lookbook',
    omniImg: data.mainImage,
  })

  useEffect(() => {
    if (slug) loadProducts()
  }, [])

  if (router.isFallback && !data.id) return null

  const handleBulk = async () => {
    const computedProducts = products.results.reduce((acc: any, obj: any) => {
      acc.push({
        ProductId: obj.recordId || obj.productId,
        BasketId: basketId,
        ParentProductId: obj.parentProductId || null,
        Qty: 1,
        DisplayOrder: obj.displayOrder || 0,
        StockCode: obj.stockCode,
        ItemType: obj.itemType || 0,

        ProductName: obj.name,

        ManualUnitPrice: obj.manualUnitPrice || 0.0,

        PostCode: obj.postCode || null,

        IsSubscription: obj.subscriptionEnabled || false,

        IsMembership: obj.hasMembership || false,

        SubscriptionPlanId: obj.subscriptionPlanId || null,

        SubscriptionTermId: obj.subscriptionTermId || null,

        UserSubscriptionPricing: obj.userSubscriptionPricing || 0,

        GiftWrapId: obj.giftWrapConfig || null,

        IsGiftWrapApplied: obj.isGiftWrapApplied || false,

        ItemGroupId: obj.itemGroupId || 0,

        PriceMatchReqId:
          obj.priceMatchReqId || '00000000-0000-0000-0000-000000000000',
      })
      return acc
    }, [])
    const newCart = await axios.post(NEXT_BULK_ADD_TO_CART, {
      basketId,
      products: computedProducts,
    })
    if (newCart.data) {
      setCartItems(newCart.data)
      openCart()
    }
  }

  return (
    <div className="bg-white">
      {/* Mobile menu */}
      <main className="pb-24">
        <div className="text-center py-16 px-4 sm:px-6 lg:px-8 flex items-center flex-col">
          <h1 className="py-5 text-4xl font-extrabold tracking-tight text-gray-900">
            {data.name}
          </h1>
          <div className="w-full sm:w-1/4 bg-gray-200 rounded-md overflow-hidden aspect-w-1 aspect-h-1">
            <img
              src={data.mainImage}
              alt={data.name}
              className="w-full h-full object-center object-cover hover:opacity-75"
            />
            <button
              onClick={handleBulk}
              className="font-bold text-xl py-2 w-full bg-gray-900 text-white"
            >
              Shop the look
            </button>
          </div>
          <div className="mt-5">
            <ProductGrid
              products={products}
              currentPage={products.currentpage}
              handlePageChange={() => {}}
              handleInfiniteScroll={() => {}}
            />
          </div>
        </div>
      </main>
    </div>
  )
}

export async function getStaticProps({
  params,
  locale,
  locales,
  preview,
}: GetStaticPropsContext) {
  const slug: any = params!.lookbook
  const response = await getSingleLookbook(slug[0])
  return {
    props: {
      data: response,
      slug: slug[0],
    },
    revalidate: 200,
  }
}

LookbookDetailPage.Layout = Layout

const PAGE_TYPE = PAGE_TYPES['Page']

export async function getStaticPaths({ locales }: GetStaticPathsContext) {
  const data = await getLookbooks()
  let paths = data.map((lookbook: any) => {
    if (!lookbook.slug.includes('lookbook/')) {
      return `/lookbook/${lookbook.slug}`
    } else return `/${lookbook.slug}`
  })

  return {
    paths: paths,
    fallback: 'blocking',
  }
}

export default withDataLayer(LookbookDetailPage, PAGE_TYPE)

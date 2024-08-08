import dynamic from 'next/dynamic'
import type { GetStaticPathsContext, GetStaticPropsContext } from 'next'
import getLookbooks from '@framework/api/content/lookbook'
import getSingleLookbook from '@framework/api/content/singleLookbook'
import { useRouter } from 'next/router'
import withDataLayer, { PAGE_TYPES } from '@components/withDataLayer'
import Layout from '@components/Layout/Layout'
const ProductGrid = dynamic(() => import('@components/Product/Grid/ProductGrid'))
import { useUI } from '@components/ui/context'
import axios from 'axios'
import {
  EmptyObject,
  NEXT_BULK_ADD_TO_CART,
  NEXT_GET_SINGLE_LOOKBOOK,
} from '@components/utils/constants'
import { useEffect, useState } from 'react'
import { EVENTS_MAP } from '@components/services/analytics/constants'
import useAnalytics from '@components/services/analytics/useAnalytics'
import { IMG_PLACEHOLDER } from '@components/utils/textVariables'
import commerce from '@lib/api/commerce'
import { generateUri } from '@commerce/utils/uri-util'
import { maxBasketItemsCount } from '@framework/utils/app-util'
import CompareSelectionBar from '@components/Product/ProductCompare/compareSelectionBar'
import { STATIC_PAGE_CACHE_INVALIDATION_IN_200_SECONDS } from '@framework/utils/constants'
import { useTranslation } from '@commerce/utils/use-translation'
import { Redis } from '@framework/utils/redis-constants'
import { getDataByUID, parseDataValue, setData } from '@framework/utils/redis-util'
import { Guid } from '@commerce/types'
import { stringToNumber } from '@framework/utils/parse-util'

function LookbookDetailPage({ data, slug, deviceInfo, config, featureToggle, defaultDisplayMembership, }: any) {
  const translate = useTranslation()
  const router = useRouter()
  const { basketId, openCart, setCartItems, isCompared } = useUI()
  const [isProductCompare, setProductCompare] = useState(false)
  const [products, setProducts] = useState(data.products)
  const loadProducts = async () => {
    const response: any = await axios.post(NEXT_GET_SINGLE_LOOKBOOK, { slug })
    setProducts(response?.data?.products)
  }

  useAnalytics(EVENTS_MAP.EVENT_TYPES.PageViewed, {
    entityName: PAGE_TYPES.Lookbook,
    entityType: EVENTS_MAP.ENTITY_TYPES.Page,
    eventType: EVENTS_MAP.EVENT_TYPES.PageViewed,
  })

  useEffect(() => {
    if (slug) loadProducts()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (router?.isFallback && !data?.id) return null

  const handleBulk = async () => {
    const computedProducts = products?.results?.reduce((acc: any, obj: any) => {
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
    if (newCart?.data) {
      setCartItems(newCart?.data)
      openCart()
    }
  }
  const showCompareProducts = () => {
    setProductCompare(true)
  }

  const closeCompareProducts = () => {
    setProductCompare(false)
  }
  const css = { maxWidth: '100%', height: 'auto' }
  return (
    <div className="flex flex-col items-center w-full px-4 py-0 pb-24 mx-auto text-left bg-white sm:px-0 lg:px-0">
      <div className="w-full overflow-hidden bg-gray-200 rounded-sm">
        <div className="image-container lookbook-image">
          <img
            style={css}
            width={1000}
            height={400}
            src={
              generateUri(data.mainImage, 'h=700&fm=webp') || IMG_PLACEHOLDER
            }
            alt={data.name || 'lookbook'}
            className="object-cover object-center w-full h-screen min-h-screen image"
          />
          <div className="lookbook-data">
            <h1 className="py-1 text-4xl font-semibold tracking-tight text-white">
              {data.name}
            </h1>
            <h2 className="pt-4 font-normal tracking-tight text-white text-md sm:w-1/3">
              {data.description}
            </h2>
            <button
              onClick={handleBulk}
              className="px-10 py-3 mt-5 text-lg font-semibold text-white uppercase bg-black hover:bg-gray-900"
            >
              {translate('label.myAccount.shopTheLookText')}
            </button>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-5 sm:w-4/5">
        <ProductGrid
          products={products}
          currentPage={products?.currentpage}
          handlePageChange={() => {}}
          handleInfiniteScroll={() => {}}
          deviceInfo={deviceInfo}
          maxBasketItemsCount={maxBasketItemsCount(config)}
          isCompared={isCompared}
          featureToggle={featureToggle} 
          defaultDisplayMembership={defaultDisplayMembership}
        />
      </div>
      {isCompared === 'true' && (
        <CompareSelectionBar
          name={data.name}
          showCompareProducts={showCompareProducts}
          products={products}
          isCompare={isProductCompare}
          maxBasketItemsCount={maxBasketItemsCount(config)}
          closeCompareProducts={closeCompareProducts}
          deviceInfo={deviceInfo}
        />
      )}
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

  const cachedDataUID = {
    allMembershipsUID: Redis.Key.ALL_MEMBERSHIPS,
    infraUID: Redis.Key.INFRA_CONFIG,
  }
  const cachedData = await getDataByUID([
    cachedDataUID.allMembershipsUID,
    cachedDataUID.infraUID,
  ])

  let infraUIDData: any = parseDataValue(cachedData, cachedDataUID.infraUID)
  if (!infraUIDData) {
    const infraPromise = commerce.getInfra()
    infraUIDData = await infraPromise
    await setData([{ key: Redis.Key.INFRA_CONFIG, value: infraUIDData }])
  }

  let allMembershipsUIDData: any = parseDataValue(cachedData, cachedDataUID.allMembershipsUID)
  if(!allMembershipsUIDData){
    const data = {
      "SearchText": null,
      "PricingType": 0,
      "Name": null,
      "TermType": 0,
      "IsActive": 1,
      "ProductId": Guid.empty,
      "CategoryId": Guid.empty,
      "ManufacturerId": Guid.empty,
      "SubManufacturerId": Guid.empty,
      "PlanType": 0,
      "CurrentPage": 0,
      "PageSize": 0
    }
    const membershipPlansPromise = commerce.getMembershipPlans({data, cookies: {}})
    allMembershipsUIDData = await membershipPlansPromise
    await setData([{ key: cachedDataUID.allMembershipsUID, value: allMembershipsUIDData }])
  }

  let defaultDisplayMembership = EmptyObject
  if (allMembershipsUIDData?.result?.length) {
    const membershipPlan = allMembershipsUIDData?.result?.sort((a: any, b: any) => a?.price?.raw?.withTax - b?.price?.raw?.withTax)[0]
    if (membershipPlan) {
      const promoCode = membershipPlan?.membershipBenefits?.[0]?.code
      if (promoCode) {
        const promotion= await commerce.getPromotion(promoCode)
        defaultDisplayMembership = { membershipPromoDiscountPerc: stringToNumber(promotion?.result?.additionalInfo1) , membershipPrice : membershipPlan?.price?.raw?.withTax}
      }
    }
  }

  return {
    props: {
      data: response,
      slug: slug[0],
      globalSnippets: infraUIDData?.snippets ?? [],
      snippets: response?.snippets ?? [],
      defaultDisplayMembership,
    },
    revalidate: STATIC_PAGE_CACHE_INVALIDATION_IN_200_SECONDS
  }
}

export async function getStaticPaths({ locales }: GetStaticPathsContext) {
  const data = await getLookbooks()
  let paths = data?.map((lookbook: any) => {
    if (!lookbook?.slug?.includes('lookbook/')) {
      return `/lookbook/${lookbook?.slug}`
    } else return `/${lookbook?.slug}`
  })

  return { paths: paths, fallback: 'blocking' }
}

LookbookDetailPage.Layout = Layout
export default withDataLayer(LookbookDetailPage, PAGE_TYPES.LookbookList)

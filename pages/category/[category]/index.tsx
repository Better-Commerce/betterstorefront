import { useReducer, useState, useEffect } from 'react'
import Link from 'next/link'
import NextHead from 'next/head'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import useSwr from 'swr'
import 'swiper/css'
import 'swiper/css/navigation'
import { getDataByUID, parseDataValue, setData } from '@framework/utils/redis-util'
import getAllCategoriesStaticPath from '@framework/category/get-all-categories-static-path'
import { Redis } from '@framework/utils/redis-constants'
import { getSecondsInMinutes, stringToNumber } from '@framework/utils/parse-util'
import { getCategoryBySlug } from '@framework/category'
import { getCategoryProducts } from '@framework/api/operations'
import { parsePLPFilters, routeToPLPWithSelectedFilters, setPLPFilterSelection, } from 'framework/utils/app-util'
import { Cookie, STATIC_PAGE_CACHE_INVALIDATION_IN_MINS } from '@framework/utils/constants'
import { maxBasketItemsCount, setPageScroll, notFoundRedirect, logError, sanitizeRelativeUrl } from '@framework/utils/app-util'
import commerce from '@lib/api/commerce'
import { useTranslation } from '@commerce/utils/use-translation'
import { SCROLLABLE_LOCATIONS } from 'pages/_app'
import { postData } from '@components/utils/clientFetcher'
import withDataLayer, { PAGE_TYPES } from '@components/withDataLayer'
import OutOfStockFilter from '@components/Product/Filters/OutOfStockFilter'
import CompareSelectionBar from '@components/Product/ProductCompare/compareSelectionBar'
import { useUI } from '@components/ui'
import { CURRENT_THEME, EmptyGuid, EmptyObject, EmptyString, EngageEventTypes, NEXT_GET_CATALOG_PRODUCTS, SITE_ORIGIN_URL } from '@components/utils/constants'
import { PHASE_PRODUCTION_BUILD } from 'next/constants'
import RecentlyViewedProduct from '@components/Product/RelatedProducts/RecentlyViewedProducts'
const ProductCard = dynamic(() => import('@components/ProductCard'))
const ProductFilterRight = dynamic(() => import('@components/Product/Filters/filtersRight'))
const ProductMobileFilters = dynamic(() => import('@components/Product/Filters'))
const ProductFiltersTopBar = dynamic(() => import('@components/Product/Filters/FilterTopBar'))
const ProductGridWithFacet = dynamic(() => import('@components/Product/Grid'))
const ProductGrid = dynamic(() => import('@components/Product/Grid/ProductGrid'))
const BreadCrumbs = dynamic(() => import('@components/ui/BreadCrumbs'))
import EngageProductCard from '@components/SectionEngagePanels/ProductCard'
import { Guid } from '@commerce/types'
import { IPagePropsProvider } from '@framework/contracts/page-props/IPagePropsProvider'
import { getPagePropType, PagePropType } from '@framework/page-props'
import useAnalytics from '@components/services/analytics/useAnalytics'
import { EVENTS_MAP } from '@components/services/analytics/constants'
import FeaturedCategory from '@components/category/FeaturedCategory'
import FeaturedBanner from '@components/category/FeaturedBanner'
import LandingFeaturedCategory from '@components/category/LandingFeaturedCategory'
import FeaturedBrand from '@components/category/FeaturedBrand'
import BrandFilterTop from '@components/Product/Filters/BrandFilterTop'
import Loader from '@components/Loader'
import { removeQueryString, serverSideMicrositeCookies } from '@commerce/utils/uri-util'
import { AnalyticsEventType } from '@components/services/analytics'
import FilterHorizontal from '@components/Product/Filters/filterHorizontal'

const PAGE_TYPE = PAGE_TYPES.CategoryList
declare const window: any

export async function getStaticProps(context: any) {
  const { locale, locales } = context
  const slugName = Object.keys(context.params)[0]
  const slug = slugName + '/' + context.params[slugName]

  const props: IPagePropsProvider = getPagePropType({ type: PagePropType.COMMON })
  const cookies = serverSideMicrositeCookies(locale!)
  const pageProps = await props.getPageProps({ slug, cookies })

  const cachedDataUID = {
    allMembershipsUID: Redis.Key.ALL_MEMBERSHIPS + '_' + locale,
    infraUID: Redis.Key.INFRA_CONFIG + '_' + locale,
    categorySlugUID: Redis.Key.Category.Slug + '_' + slug + '_' + locale,
    categoryProductUID: Redis.Key.Category.CategoryProduct + '_' + slug + '_' + locale,
  }
  const cachedData = await getDataByUID([
    cachedDataUID.allMembershipsUID,
    cachedDataUID.infraUID,
    cachedDataUID.categorySlugUID,
    cachedDataUID.categoryProductUID,
  ])

  let infraUIDData: any = parseDataValue(cachedData, cachedDataUID.infraUID)
  let categorySlugUIDData: any = parseDataValue(cachedData, cachedDataUID.categorySlugUID)
  let categoryProductUIDData: any = parseDataValue(cachedData, cachedDataUID.categoryProductUID)

  try {
    if (!categorySlugUIDData) {
      categorySlugUIDData = await getCategoryBySlug(slug, { [Cookie.Key.LANGUAGE]: locale })
      await setData([{ key: cachedDataUID.categorySlugUID, value: categorySlugUIDData }])
    }
    if (!infraUIDData) {
      const infraPromise = commerce.getInfra({ [Cookie.Key.LANGUAGE]: locale })
      infraUIDData = await infraPromise
      await setData([{ key: cachedDataUID.infraUID, value: infraUIDData }])
    }
  } catch (error: any) {
    logError(error)

    if (process.env.NEXT_PHASE !== PHASE_PRODUCTION_BUILD) {
      let errorUrl = '/500'
      const errorData = error?.response?.data
      if (errorData?.errorId) {
        errorUrl = `${errorUrl}?errorId=${errorData.errorId}`
      }
      return {
        redirect: {
          destination: errorUrl,
          permanent: false,
        },
      }
    }
  }

  let allMembershipsUIDData: any = parseDataValue(cachedData, cachedDataUID.allMembershipsUID)
  if (!allMembershipsUIDData) {
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
    const membershipPlansPromise = commerce.getMembershipPlans({ data, cookies: { [Cookie.Key.LANGUAGE]: locale } })
    allMembershipsUIDData = await membershipPlansPromise
    await setData([{ key: cachedDataUID.allMembershipsUID, value: allMembershipsUIDData }])
  }

  let defaultDisplayMembership = EmptyObject
  if (allMembershipsUIDData?.result?.length) {
    const membershipPlan = allMembershipsUIDData?.result?.sort((a: any, b: any) => a?.price?.raw?.withTax - b?.price?.raw?.withTax)[0]
    if (membershipPlan) {
      const promoCode = membershipPlan?.membershipBenefits?.[0]?.code
      if (promoCode) {
        const promotion = await commerce.getPromotion(promoCode, { [Cookie.Key.LANGUAGE]: locale })
        defaultDisplayMembership = { membershipPromoDiscountPerc: stringToNumber(promotion?.result?.additionalInfo1), membershipPrice: membershipPlan?.price?.raw?.withTax }
      }
    }
  }

  if (process.env.NEXT_PHASE !== PHASE_PRODUCTION_BUILD) {
    if (categorySlugUIDData?.status === "NotFound") {
      return notFoundRedirect()
    }
  }

  if (categorySlugUIDData && categorySlugUIDData?.id) {
    if (!categoryProductUIDData) {
      const categoryProductUIDData = await getCategoryProducts(categorySlugUIDData?.id, { [Cookie.Key.LANGUAGE]: locale })
      await setData([{ key: cachedDataUID.categoryProductUID, value: categoryProductUIDData }])
      return {

        props: {
          ...pageProps,
          category: categorySlugUIDData,
          slug,
          products: categoryProductUIDData,
          globalSnippets: infraUIDData?.snippets ?? [],
          snippets: categorySlugUIDData?.snippets ?? [],
          defaultDisplayMembership,
        },
        revalidate: getSecondsInMinutes(STATIC_PAGE_CACHE_INVALIDATION_IN_MINS)
      }
    } else {
      return {
        props: {
          ...pageProps,
          category: categorySlugUIDData,
          slug,
          products: categoryProductUIDData,
          globalSnippets: infraUIDData?.snippets ?? [],
          snippets: categorySlugUIDData?.snippets ?? [],
          defaultDisplayMembership,
        },
        revalidate: getSecondsInMinutes(STATIC_PAGE_CACHE_INVALIDATION_IN_MINS)
      }
    }
  } else {
    return {
      props: {
        ...pageProps,
        category: categorySlugUIDData,
        slug,
        products: null,
        globalSnippets: infraUIDData?.snippets ?? [],
        snippets: categorySlugUIDData?.snippets ?? [],
        defaultDisplayMembership,
      },
      revalidate: getSecondsInMinutes(STATIC_PAGE_CACHE_INVALIDATION_IN_MINS)
    }
  }
}

const generateCategories = (categories: any) => {
  const categoryMap: any = []
  const generateCategory = (category: any) => {
    if (category.link) {
      category.link.includes('category/')
        ? categoryMap.push(`/${category.link}`)
        : categoryMap.push(`/category/${category.link}`)
    }
  }
  categories.forEach((category: any) => generateCategory(category))
  return categoryMap
}

export async function getStaticPaths() {
  const data = await getAllCategoriesStaticPath()
  return {
    paths: generateCategories(data),
    fallback: 'blocking',
  }
}

export const ACTION_TYPES = {
  SORT_BY: 'SORT_BY',
  PAGE: 'PAGE',
  SORT_ORDER: 'SORT_ORDER',
  CLEAR: 'CLEAR',
  HANDLE_FILTERS_UI: 'HANDLE_FILTERS_UI',
  SET_FILTERS: 'SET_FILTERS',
  ADD_FILTERS: 'ADD_FILTERS',
  REMOVE_FILTERS: 'REMOVE_FILTERS',
  SET_CATEGORY_ID: 'SET_CATEGORY_ID',
  RESET_STATE: 'RESET_STATE'
}

interface actionInterface {
  type?: string
  payload?: object | any
}

interface stateInterface {
  sortBy?: string
  currentPage?: string | number
  sortOrder?: string
  filters: any
  categoryId: any
}

const IS_INFINITE_SCROLL =
  process.env.NEXT_PUBLIC_ENABLE_INFINITE_SCROLL === 'true'
const {
  SORT_BY,
  PAGE,
  SORT_ORDER,
  CLEAR,
  HANDLE_FILTERS_UI,
  SET_FILTERS,
  ADD_FILTERS,
  REMOVE_FILTERS,
  SET_CATEGORY_ID,
  RESET_STATE
} = ACTION_TYPES
const DEFAULT_STATE = {
  sortBy: '',
  sortOrder: 'asc',
  currentPage: 1,
  filters: [],
  categoryId: '',
}

function reducer(state: stateInterface, { type, payload }: actionInterface) {
  switch (type) {
    case SORT_BY:
      return { ...state, sortBy: payload, currentPage: 1 }
    case PAGE:
      return { ...state, currentPage: payload }
    case SORT_ORDER:
      return { ...state, sortOrder: payload }
    case CLEAR:
      return { ...state, currentPage: 1, filters: [] }
    case HANDLE_FILTERS_UI:
      return { ...state, areFiltersOpen: payload }
    case SET_CATEGORY_ID:
      return { ...state, categoryId: payload }
    case SET_FILTERS:
      return { ...state, filters: payload }
    case ADD_FILTERS:
      return { ...state, filters: [...state.filters, payload] }
    case RESET_STATE:
      return DEFAULT_STATE
    case REMOVE_FILTERS:
      return {
        ...state,
        filters: state.filters.filter(
          (item: any) => item.Value !== payload.Value
        ),
      }
    default:
      return { ...state }
  }
}

function CategoryLandingPage({ category, slug, products, deviceInfo, config, featureToggle, campaignData, defaultDisplayMembership }: any) {
  const { isMobile } = deviceInfo
  const router = useRouter()
  const qsFilters = router.asPath
  const filters: any = parsePLPFilters(qsFilters as string)
  const [previousSlug, setPreviousSlug] = useState(router?.asPath?.split('?')[0]);
  const translate = useTranslation()
  const adaptedQuery: any = { ...router.query }
  adaptedQuery.currentPage
    ? (adaptedQuery.currentPage = Number(adaptedQuery.currentPage))
    : false
  adaptedQuery.filters
    ? (adaptedQuery.filters = JSON.parse(adaptedQuery.filters))
    : false
  const [isProductCompare, setProductCompare] = useState(false)
  const { isCompared } = useUI()
  const initialState = {
    ...DEFAULT_STATE,
    // Setting initial filters from query string
    filters: filters ? filters : [],
    // if featuredProductCSV and LinkGroup
    stockCodes: (category?.featuredProductCSV && category?.linkGroups?.length) ? category?.featuredProductCSV?.split(',') : [],
    categoryId: category?.id,
  }
  const [state, dispatch] = useReducer(reducer, initialState)
  const [excludeOOSProduct, setExcludeOOSProduct] = useState(true)
  const {
    data = {
      products: {
        results: [],
        sortList: [],
        pages: 0,
        total: 0,
        currentPage: 1,
        filters: state?.filters || [],
        categoryId: category?.id,
      },
    },
    error,
    isValidating
  } = useSwr(
    [
      `/api/catalog/products`,
      { ...state, ...{ slug: slug, isCategory: true, excludeOOSProduct, categoryId: category?.id, } },
    ],
    ([url, body]: any) => postData(url, body),
    {
      revalidateOnFocus: false,
    }
  )

  useEffect(() => {
    const handleRouteChange = (url: any) => {
      const currentSlug = url?.split('?')[0];
      if (currentSlug !== previousSlug) {
        dispatch({ type: RESET_STATE })
        setPreviousSlug(currentSlug);
      }
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    // Cleanup the event listener on unmount
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [previousSlug, router]);

  const [productListMemory, setProductListMemory] = useState({
    products: {
      results: [],
      sortList: [],
      pages: 0,
      total: 0,
      currentPage: 1,
      filters: [],
      categoryId: category?.id,
      sortBy: null,
    },
  })
  const [productDataToPass, setProductDataToPass] = useState(data?.products)

  useEffect(() => {
    if (state?.filters?.length) {
      routeToPLPWithSelectedFilters(router, state?.filters)
    }
    setPLPFilterSelection(state?.filters)
  }, [state?.filters])

  const onEnableOutOfStockItems = (val: boolean) => {
    setExcludeOOSProduct(!val)
    // clearAll()
    dispatch({ type: PAGE, payload: 1 })
  }

  useAnalytics(AnalyticsEventType.CATEGORY_VIEWED, {
    category, entityName: PAGE_TYPE,
    entityType: EVENTS_MAP.ENTITY_TYPES.Category,
  })

  useEffect(() => {
    // for Engage
    if (typeof window !== "undefined" && window?.ch_session) {
      window.ch_page_view_before({ item_id: category?.name || EmptyString })
    }
  }, [category.id])

  useEffect(() => {
    //if (IS_INFINITE_SCROLL) {
    if (
      data.products.currentPage !== productListMemory.products.currentPage ||
      data.products.total !== productListMemory.products.total ||
      data.products.sortBy !== productListMemory.products.sortBy
    ) {
      setProductListMemory((prevData: any) => {
        let dataClone = { ...data }
        if (state?.currentPage > 1 && IS_INFINITE_SCROLL) {
          dataClone.products.results = [
            ...prevData?.products?.results,
            ...dataClone?.products?.results,
          ]
        }
        return dataClone
      })
    }
    //}
  }, [data?.products?.results?.length, data])

  useEffect(() => {
    const trackScroll = (ev: any) => {
      setPageScroll(window?.location, ev.currentTarget.scrollX, ev.currentTarget.scrollY)
    }

    const isScrollEnabled = SCROLLABLE_LOCATIONS.find((x: string) => location.pathname.startsWith(x))
    if (isScrollEnabled) {
      window?.addEventListener('scroll', trackScroll)
      return () => {
        window?.removeEventListener('scroll', trackScroll)
      }
    }
  }, [])

  useEffect(() => {
    const dataToPass = IS_INFINITE_SCROLL ? productListMemory?.products : data?.products
    setProductDataToPass(dataToPass)
  }, [productListMemory?.products, data?.products])

  const setFilter = (filters: any) => {
    dispatch({ type: SET_FILTERS, payload: filters })
  }


  const handlePageChange = (page: any, redirect = true) => {
    if (redirect) {
      router.push(
        {
          pathname: router.pathname,
          query: { ...router.query, currentPage: page.selected + 1 },
        },
        undefined,
        { shallow: true }
      )
    }
    dispatch({ type: PAGE, payload: page.selected + 1 })
    if (typeof window !== 'undefined') {
      window.scroll({
        top: 0,
        left: 0,
        behavior: 'smooth',
      })
    }
  }

  const handleInfiniteScroll = () => {
    if (products.pages && products.currentPage < products.pages) {
      dispatch({ type: PAGE, payload: products.currentPage + 1 })
    }
  }

  const handleFilters = (filter: null, type: string) => {
    if (filters?.length == 1 && type == REMOVE_FILTERS) {
      routeToPLPWithSelectedFilters(router, [])
    }
    dispatch({
      type,
      payload: filter,
    })
    dispatch({ type: PAGE, payload: 1 })
  }

  const handleSortBy = (payload: any) => {
    dispatch({
      type: SORT_BY,
      payload: payload,
    })
  }
  const clearAll = () => {
    routeToPLPWithSelectedFilters(router, [])
    dispatch({ type: CLEAR })
  }

  // IMPLEMENT HANDLING FOR NULL OBJECT
  if (category === null) {
    return (
      <div className="container relative py-10 mx-auto text-center top-20">
        <h1 className="pb-6 text-3xl font-medium text-gray-400 font-30">
          {translate('common.label.badUrlText')}
          <Link href="/category">
            <span className="px-3 text-indigo-500">{translate('label.category.allCategoriesText')}</span>
          </Link>
        </h1>
      </div>
    )
  }

  const removeFilter = (key: string) => {
    if (filters?.length == 1) {
      routeToPLPWithSelectedFilters(router, [])
    }
    dispatch({ type: REMOVE_FILTERS, payload: key })
  }

  /*const productDataToPass =
    IS_INFINITE_SCROLL && productListMemory.products?.results?.length
      ? productListMemory.products
      : products*/
  const css = { maxWidth: '100%', height: 'auto' }
  let absPath = ''
  if (typeof window !== 'undefined') {
    absPath = window?.location?.href
  }

  const showCompareProducts = () => {
    setProductCompare(true)
  }

  const closeCompareProducts = () => {
    setProductCompare(false)
  }
  const onToggleBrandListPage = () => {
    router.push(`/category/shop-all/${slug?.replace('category/', '')}`)
  }
  const filterBrandData = ({ key, brand }: any) => {
    clearAll()
    dispatch({ type: PAGE, payload: 1 })
  }
  const cleanPath = removeQueryString(router.asPath)
  return (
    <>
      <NextHead>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <link rel="canonical" href={SITE_ORIGIN_URL + cleanPath} />
        <title>{category?.name || translate('label.category.categoryText')}</title>
        <meta name="title" content={category?.name || translate('label.category.categoryText')} />
        <meta name="description" content={category?.metaDescription} />
        <meta name="keywords" content={category?.metaKeywords} />
        <meta property="og:image" content="" />
        <meta property="og:title" content={category?.name} key="ogtitle" />
        <meta property="og:description" content={category?.metaDescription} key="ogdesc" />
      </NextHead>
      <section className="main-section fixing-main-section dark:bg-white">
        <div className="container mx-auto mt-2 bg-transparent dark:bg-white">
          {category?.breadCrumbs && (
            <BreadCrumbs items={category?.breadCrumbs} currentProduct={category} />
          )}
        </div>
        <div className="container">
          <div className={`max-w-screen-sm max-t-full ${CURRENT_THEME == 'green' ? 'mx-auto text-center sm:py-0 py-3 -mt-4' : ''}`}>
            <h1 className={`block text-2xl capitalize dark:text-black ${CURRENT_THEME == 'green' ? 'sm:text-4xl lg:text-5xl font-bold' : 'sm:text-3xl lg:text-4xl font-semibold'}`}>
              {category?.name.toLowerCase()}
            </h1>
            {category?.description &&
              <div className='w-full'>
                <span className={`block text-neutral-500 dark:text-neutral-500 ${CURRENT_THEME == 'green' ? 'text-sm mt-2 mb-2' : 'text-sm mt-4'}`}>
                  <span className={`block text-neutral-500 dark:text-neutral-500 ${CURRENT_THEME == 'green' ? 'text-sm mt-2 mb-2' : 'text-sm mt-4'}`} dangerouslySetInnerHTML={{ __html: category?.description }} ></span>
                </span>
              </div>
            }
          </div>
        </div>
        {category?.linkGroups?.length > 0 ?
          (
            <div className='container mx-auto category-container'>
              {category?.subCategories?.filter((x: any) => x.isFeatured == true).length > 0 &&
                <LandingFeaturedCategory featuredCategory={category?.subCategories} deviceInfo={deviceInfo} />
              }
              <div className='grid grid-cols-1 gap-4 px-4 sm:grid-cols-12 sm:gap-10 sm:px-0'>
                <div className={`${CURRENT_THEME != 'green' ? 'sm:col-span-3' : 'sm:col-span-2'}`}>
                  <div className="pt-2 sm:pb-8">
                    {category?.linkGroups?.map((grp: any, grpIdx: number) => (
                      <div className="mx-auto sm:mb-4" key={`linkGrp-${grpIdx}`}>
                        <h2 className="block mb-4 text-lg font-semibold sm:text-xl lg:text-xl dark:text-black">{grp?.name}</h2>
                        {grp?.items?.length > 0 && grp?.items?.map((item: any, cdx: number) => (
                          <Link href={item?.link != null ? sanitizeRelativeUrl(`/${item?.link}`) : `#`} className="flex justify-start w-full py-1 text-left text-black font-14 hover:underline" key={cdx}>
                            <span>{item?.name}</span>
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
                <div className={`${CURRENT_THEME != 'green' ? 'space-y-6 sm:col-span-9' : 'space-y-6 sm:col-span-10'}`}>
                  <FeaturedBanner category={category} />
                  {category?.featuredBrand?.length > 0 &&
                    <FeaturedBrand featuredBrand={category?.featuredBrand} filterBrandData={filterBrandData} />
                  }
                  {productDataToPass?.results?.length > 0 &&
                    <>
                      <div className='flex justify-between mb-2'>
                        <h2 className="block text-lg font-semibold sm:text-xl lg:text-xl dark:text-black">Featured Products</h2>
                        <button onClick={onToggleBrandListPage} className='text-lg font-medium text-black hover:underline'>See All</button>
                      </div>
                      <div className={`${CURRENT_THEME != 'green' ? 'grid grid-cols-1 gap-4 sm:grid-cols-3' : 'grid grid-cols-1 gap-4 sm:grid-cols-5'}`}>
                        {productDataToPass?.results?.map((product: any, pIdx: number) => (
                          <div key={pIdx}>
                            <ProductCard data={product} deviceInfo={deviceInfo} maxBasketItemsCount={maxBasketItemsCount(config)} featureToggle={featureToggle} defaultDisplayMembership={defaultDisplayMembership} />
                          </div>
                        ))}
                      </div>
                    </>
                  }
                </div>
              </div>
              <div className='flex flex-col w-full col-span-12 overflow-hidden'>
                <EngageProductCard type={EngageEventTypes.TRENDING_FIRST_ORDER} campaignData={campaignData} isSlider={true} productPerRow={4} productLimit={12} />
                <EngageProductCard type={EngageEventTypes.INTEREST_USER_ITEMS} campaignData={campaignData} isSlider={true} productPerRow={4} productLimit={12} />
                <EngageProductCard type={EngageEventTypes.TRENDING_COLLECTION} campaignData={campaignData} isSlider={true} productPerRow={4} productLimit={12} />
                <EngageProductCard type={EngageEventTypes.COUPON_COLLECTION} campaignData={campaignData} isSlider={true} productPerRow={4} productLimit={12} />
                <EngageProductCard type={EngageEventTypes.SEARCH} campaignData={campaignData} isSlider={true} productPerRow={4} productLimit={12} />
                <EngageProductCard type={EngageEventTypes.RECENTLY_VIEWED} campaignData={campaignData} isSlider={true} productPerRow={4} productLimit={12} />
              </div>
            </div>
          ) : (
            <div className="container mx-auto">
              <FeaturedBanner category={category} />
              {category?.subCategories?.filter((x: any) => x.isFeatured == true).length > 0 &&
                <FeaturedCategory featuredCategory={category?.subCategories} />
              }
              {category?.featuredBrand?.length > 0 &&
                <BrandFilterTop featuredBrand={category?.featuredBrand} handleFilters={handleFilters} products={productDataToPass} routerFilters={state.filters} />
              }
              {productDataToPass?.results?.length > 0 &&
                <>
                  <div className='flex justify-between w-full pb-2 mt-1 mb-2 align-center'>
                    <span className="inline-block text-xs font-medium text-slate-900 sm:px-0 dark:text-slate-900 result-count-text">  {productDataToPass?.total} {productDataToPass?.total > 1 ? translate('common.label.itemPluralText') : translate('common.label.itemSingularText')}</span>
                    <div className="flex justify-end align-bottom">
                      <OutOfStockFilter excludeOOSProduct={excludeOOSProduct} onEnableOutOfStockItems={onEnableOutOfStockItems} />
                    </div>
                  </div>
                  <hr className='border-slate-200 dark:border-slate-200' />
                </>
              }
              {isValidating ? (
                <Loader />
              ) : (
                <>
                  {productDataToPass?.results?.length > 0 ? (
                    <div className="grid grid-cols-1 mx-auto sm:grid-cols-12">
                      {!!productDataToPass && (productDataToPass?.filters?.length > 0 ? (
                        <>
                          {isMobile ? (
                            <ProductMobileFilters handleFilters={handleFilters} products={products} routerFilters={state.filters} handleSortBy={handleSortBy} clearAll={clearAll} routerSortOption={state.sortBy} removeFilter={removeFilter} featureToggle={featureToggle} />
                          ) : (
                            <>
                              {!featureToggle?.features?.enableHorizontalFilter ? (
                                <ProductFilterRight handleFilters={handleFilters} products={productDataToPass} routerFilters={state.filters} />
                              ) : (
                                <FilterHorizontal handleFilters={handleFilters} products={data.products} routerFilters={state.filters} pageType="category" />
                              )}
                            </>
                          )}
                          <div className={`${CURRENT_THEME == 'green' ? 'sm:col-span-10 lg:col-span-10 md:col-span-10 product-grid-9' : featureToggle?.features?.enableHorizontalFilter ? 'sm:col-span-12 lg:col-span-12 md:col-span-12' :'sm:col-span-9 lg:col-span-9 md:col-span-9'}`}>
                            {isMobile ? null : (
                              <ProductFiltersTopBar products={productDataToPass} handleSortBy={handleSortBy} routerFilters={state.filters} clearAll={clearAll} routerSortOption={state.sortBy} removeFilter={removeFilter} featureToggle={featureToggle} />
                            )}
                            <ProductGridWithFacet products={productDataToPass} currentPage={state?.currentPage} handlePageChange={handlePageChange} handleInfiniteScroll={handleInfiniteScroll} deviceInfo={deviceInfo} maxBasketItemsCount={maxBasketItemsCount(config)} isCompared={isCompared} featureToggle={featureToggle} defaultDisplayMembership={defaultDisplayMembership} />
                          </div>
                        </>
                      ) : (
                        <div className="sm:col-span-12 p-[1px] sm:mt-0 mt-2">
                          <ProductFiltersTopBar products={productDataToPass} handleSortBy={handleSortBy} routerFilters={state.filters} clearAll={clearAll} routerSortOption={state.sortBy} removeFilter={removeFilter} featureToggle={featureToggle} />
                          <ProductGrid products={productDataToPass} currentPage={state?.currentPage} handlePageChange={handlePageChange} handleInfiniteScroll={handleInfiniteScroll} deviceInfo={deviceInfo} maxBasketItemsCount={maxBasketItemsCount(config)} isCompared={isCompared} featureToggle={featureToggle} defaultDisplayMembership={defaultDisplayMembership} />
                        </div>
                      ))}
                      <CompareSelectionBar name={category?.name} showCompareProducts={showCompareProducts} products={productDataToPass} isCompare={isProductCompare} maxBasketItemsCount={maxBasketItemsCount(config)} closeCompareProducts={closeCompareProducts} deviceInfo={deviceInfo} />
                      <div className='flex flex-col w-full col-span-12 overflow-hidden'>
                        <EngageProductCard type={EngageEventTypes.TRENDING_FIRST_ORDER} campaignData={campaignData} isSlider={true} productPerRow={4} productLimit={12} />
                        <EngageProductCard type={EngageEventTypes.INTEREST_USER_ITEMS} campaignData={campaignData} isSlider={true} productPerRow={4} productLimit={12} />
                        <EngageProductCard type={EngageEventTypes.TRENDING_COLLECTION} campaignData={campaignData} isSlider={true} productPerRow={4} productLimit={12} />
                        <EngageProductCard type={EngageEventTypes.COUPON_COLLECTION} campaignData={campaignData} isSlider={true} productPerRow={4} productLimit={12} />
                        <EngageProductCard type={EngageEventTypes.SEARCH} campaignData={campaignData} isSlider={true} productPerRow={4} productLimit={12} />
                        <EngageProductCard type={EngageEventTypes.RECENTLY_VIEWED} campaignData={campaignData} isSlider={true} productPerRow={4} productLimit={12} />
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 py-8 mx-auto text-center sm:p-32 max-w-7xl">
                      <h4 className="text-3xl font-bold text-gray-300">
                        {translate('common.label.noProductAvailableText')} {category?.name}
                      </h4>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

      </section>
    </>
  )
}
export default withDataLayer(CategoryLandingPage, PAGE_TYPE)